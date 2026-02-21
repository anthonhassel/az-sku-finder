require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// Credentials from Environment
const TENANT_ID = process.env.VITE_AZURE_TENANT_ID;
const CLIENT_ID = process.env.VITE_AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_AZURE_CLIENT_SECRET;
const SUBSCRIPTION_ID = process.env.VITE_AZURE_SUBSCRIPTION_ID;
const REGION = 'westeurope';
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'skus.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function post(url, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function get(url, token) {
    return new Promise((resolve, reject) => {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const req = https.request(url, {
            method: 'GET',
            headers: headers
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

// SkuParser for fallback
class SkuParser {
    static parse(skuName) {
        const lowerName = skuName.toLowerCase();

        // 1. Identify Family
        let family = 'Unknown';
        if (lowerName.includes('_d')) family = 'D Series (General Purpose)';
        else if (lowerName.includes('_e')) family = 'E Series (Memory Optimized)';
        else if (lowerName.includes('_f')) family = 'F Series (Compute Optimized)';
        else if (lowerName.includes('_a')) family = 'A Series (Entry Level)';
        else if (lowerName.includes('_b')) family = 'B Series (Burstable)';
        else if (lowerName.includes('_l')) family = 'L Series (Storage Optimized)';
        else if (lowerName.includes('_m')) family = 'M Series (High Memory)';
        else if (lowerName.includes('_n')) family = 'N Series (GPU)';

        return {
            family: family,
            vCpus: 'Not Available',
            memoryGb: 'Not Available',
            premiumIO: 'Not Available',
            ephemeralOS: 'Not Available',
            acceleratedNetworking: 'Not Available',
            nestedVirtualization: 'Not Available',
            maxDataDisks: 'Not Available',
            maxNics: 'Not Available'
        };
    }
}

async function fetchRetailPrices(region) {
    console.log(`Fetching Retail Prices for ${region}...`);
    const filter = `serviceName eq 'Virtual Machines' and armRegionName eq '${region}' and priceType eq 'Consumption'`;
    // Note: The Azure Retail API is public and doesn't explicitly require auth for this endpoint, 
    // but in some contexts might. We'll use the public endpoint as in the original service.
    const url = `https://prices.azure.com/api/retail/prices?$filter=${encodeURIComponent(filter)}&$top=1000`;

    let allItems = [];
    let nextLink = url;
    let page = 0;

    while (nextLink) {
        page++;
        console.log(`  Fetching Retail Page ${page}...`);
        try {
            const data = await get(nextLink, null);
            if (data.Items) {
                allItems.push(...data.Items);
            }
            nextLink = data.NextPageLink;
        } catch (e) {
            console.error('Error fetching retail prices:', e);
            break;
        }
    }
    console.log(`Fetched ${allItems.length} retail items.`);
    return allItems;
}

async function fetchResourceSkus(token, subscriptionId, region) {
    console.log(`Fetching Resource SKUs (Specs) for ${region}...`);
    let url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/skus?api-version=2023-01-01&$filter=location eq '${region}'`;
    const map = {};
    let page = 0;

    while (url) {
        page++;
        console.log(`  Fetching Resource SKUs Page ${page}...`);
        try {
            const data = await get(url, token);
            if (data.value) {
                data.value.forEach(sku => {
                    if (sku.resourceType === 'virtualMachines') {
                        map[sku.name] = sku;
                    }
                });
            }
            url = data.nextLink;
        } catch (e) {
            console.error('Error fetching resource SKUs:', e);
            break;
        }
    }
    console.log(`Fetched ${Object.keys(map).length} resource SKUs.`);
    return map;
}

async function run() {
    try {
        // 1. Authenticate
        console.log('Authenticating...');
        let token = null;

        // Try getting token from environment (e.g. GitHub Actions) or client credentials
        if (process.env.AZURE_ACCESS_TOKEN) {
            console.log('Using AZURE_ACCESS_TOKEN from environment.');
            token = process.env.AZURE_ACCESS_TOKEN;
        } else if (TENANT_ID && CLIENT_ID && CLIENT_SECRET) {
            console.log('Using Client Credentials OAuth flow.');
            const tokenParams = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                scope: 'https://management.azure.com/.default'
            });
            const tokenRes = await post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, tokenParams.toString());
            token = tokenRes.access_token;
        } else {
            console.warn('Missing credentials (AZURE_ACCESS_TOKEN or TENANT_ID/CLIENT_ID/CLIENT_SECRET). Fetching only public retail data (specs will be limited).');
        }

        // 2. Fetch Data
        const [retailItems, skuMap] = await Promise.all([
            fetchRetailPrices(REGION),
            token && SUBSCRIPTION_ID ? fetchResourceSkus(token, SUBSCRIPTION_ID, REGION) : Promise.resolve({})
        ]);

        // 3. Merge & Transform
        console.log('Merging and Transforming data...');
        const result = retailItems.map(item => {
            const exactSku = skuMap[item.armSkuName];

            let vCpus;
            let memoryGb;
            let maxDisks;
            let maxNics;
            let acceleratedNetworking = 'False';
            let family = '';
            let isSpot = item.armSkuName.toLowerCase().includes('spot');

            if (exactSku) {
                const caps = exactSku.capabilities;
                vCpus = caps.find(c => c.name === 'vCPUs')?.value;
                memoryGb = caps.find(c => c.name === 'MemoryGB')?.value;
                maxDisks = caps.find(c => c.name === 'MaxDataDiskCount')?.value;
                maxNics = caps.find(c => c.name === 'MaxNetworkInterfaces')?.value;
                acceleratedNetworking = caps.find(c => c.name === 'AcceleratedNetworkingEnabled')?.value || 'False';

                // Extra Features
                const premiumIO = caps.find(c => c.name === 'PremiumIO')?.value || 'False';
                const ephemeralOS = caps.find(c => c.name === 'EphemeralOSDiskSupported')?.value || 'False';
                const nestedVirt = caps.find(c => c.name === 'NestedVirtualizationSupport')?.value || 'False';
                const encryptionAtHost = caps.find(c => c.name === 'EncryptionAtHostSupported')?.value || 'False';

                family = exactSku.family || 'Unknown';
            } else {
                // Formatting fallback
                const parsed = SkuParser.parse(item.armSkuName);
                vCpus = 'Not Available';
                memoryGb = 'Not Available';
                family = parsed.family || 'Unknown';
                acceleratedNetworking = 'Not Available';
            }

            // Merge features into capabilities array
            const capList = [
                { name: 'vCPUs', value: vCpus || 'Not Available' },
                { name: 'MemoryGB', value: memoryGb || 'Not Available' },
                { name: 'PricePerHour', value: item.retailPrice.toString() },
                { name: 'IsSpot', value: isSpot ? 'True' : 'False' },
                { name: 'MaxDataDiskCount', value: maxDisks || 'Not Available' },
                { name: 'MaxNetworkInterfaces', value: maxNics || 'Not Available' },
                { name: 'AcceleratedNetworking', value: acceleratedNetworking }
            ];

            if (exactSku) {
                capList.push(
                    { name: 'PremiumIO', value: exactSku.capabilities?.find(c => c.name === 'PremiumIO')?.value || 'False' },
                    { name: 'EphemeralOS', value: exactSku.capabilities?.find(c => c.name === 'EphemeralOSDiskSupported')?.value || 'False' },
                    { name: 'NestedVirtualization', value: exactSku.capabilities?.find(c => c.name === 'NestedVirtualizationSupport')?.value || 'False' },
                    { name: 'EncryptionAtHost', value: exactSku.capabilities?.find(c => c.name === 'EncryptionAtHostSupported')?.value || 'False' }
                );
            } else {
                // Heuristic values abandoned, set all to Not Available
                capList.push(
                    { name: 'PremiumIO', value: 'Not Available' },
                    { name: 'EphemeralOS', value: 'Not Available' },
                    { name: 'NestedVirtualization', value: 'Not Available' },
                    { name: 'EncryptionAtHost', value: 'Not Available' }
                );
            }

            return {
                resourceType: 'virtualMachines',
                name: item.armSkuName,
                tier: 'Standard',
                size: item.skuName,
                family: family,
                locations: [item.armRegionName],
                locationInfo: [],
                capabilities: capList,
                restrictions: []
            };
        });

        // 4. Deduplicate
        console.log('Deduplicating...');
        const uniqueSkus = new Map();
        result.forEach(sku => {
            const existing = uniqueSkus.get(sku.name);
            if (!existing) {
                uniqueSkus.set(sku.name, sku);
            } else {
                const existingPrice = parseFloat(existing.capabilities.find(c => c.name === 'PricePerHour')?.value || '0');
                const newPrice = parseFloat(sku.capabilities.find(c => c.name === 'PricePerHour')?.value || '0');

                if (newPrice < existingPrice) {
                    uniqueSkus.set(sku.name, sku);
                }
            }
        });
        const finalSkus = Array.from(uniqueSkus.values());

        // 5. Save
        console.log(`Saving ${finalSkus.length} SKUs to ${OUTPUT_FILE}...`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalSkus, null, 2));
        console.log('Done.');

    } catch (e) {
        console.error('Script failed:', e);
        process.exit(1);
    }
}

run();

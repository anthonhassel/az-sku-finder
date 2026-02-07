import type { AzureSku } from '../types';
import { SkuParser } from './skuParser';
import { AuthService } from './authService';

interface RetailPriceItem {
    armSkuName: string;
    retailPrice: number;
    armRegionName: string;
    skuName: string;
    serviceName: string;
    productName: string;
    family?: string;
}

interface RetailApiResponse {
    Items: RetailPriceItem[];
    NextPageLink: string | null;
}

interface ResourceSkuCapability {
    name: string;
    value: string;
}

interface ResourceSku {
    resourceType: string;
    name: string;
    tier: string;
    size: string;
    family: string;
    locations: string[];
    capabilities: ResourceSkuCapability[];
}

export class AzureService {
    private static RETAIL_URL = '/api/retail/prices';

    // Fetch Full SKU Capabilities using Auth Token (Resource SKUs API)
    static async fetchResourceSkus(region: string, token: string, subscriptionId: string): Promise<Record<string, ResourceSku>> {
        try {
            // This API returns ALL SKUs for the region with full capabilities
            // Pagination is REQUIRED as there can be >1000 items
            let url: string | null = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/skus?api-version=2021-07-01&$filter=location eq '${region}'`;
            const map: Record<string, ResourceSku> = {};

            while (url) {
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.warn('Resource SKUs Fetch Failed:', response.status);
                    break;
                }

                const data: any = await response.json();

                if (data.value) {
                    data.value.forEach((sku: ResourceSku) => {
                        if (sku.resourceType === 'virtualMachines') {
                            map[sku.name] = sku;
                        }
                    });
                }

                url = data.nextLink || null; // Azure standard pagination
            }

            return map;

        } catch (e) {
            console.error('Error fetching Resource SKUs:', e);
            return {};
        }
    }

    private static CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    static getLastUpdated(region: string): Date | null {
        try {
            const cacheKey = `az_sku_cache_${region}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            const entry = JSON.parse(cached);
            return new Date(entry.timestamp);
        } catch {
            return null;
        }
    }

    static async fetchSkus(region: string, forceRefresh = false): Promise<AzureSku[]> {
        const cacheKey = `az_sku_cache_${region}`;

        // 0. Check Cache
        if (!forceRefresh) {
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const entry = JSON.parse(cached);
                    if (Date.now() - entry.timestamp < this.CACHE_DURATION_MS) {
                        console.log(`Returning ${entry.data.length} SKUs from Local Cache (${region})`);
                        return entry.data;
                    } else {
                        console.log('Cache expired, fetching fresh data...');
                    }
                }
            } catch (e) {
                console.warn('Error reading from cache', e);
            }
        }

        // 1. Fetch Retail Prices (Always Public)
        const filter = `serviceName eq 'Virtual Machines' and armRegionName eq '${region}' and priceType eq 'Consumption'`;
        const url = `${this.RETAIL_URL}?$filter=${encodeURIComponent(filter)}&$top=1000`;

        try {
            const priceResponse = await fetch(url);
            if (!priceResponse.ok) throw new Error('Failed to fetch pricing');
            const priceData: RetailApiResponse = await priceResponse.json();
            console.log(`Fetched ${priceData.Items.length} items from Retail API`);

            // 2. Check for Auth Credentials to get Exact Specs
            let skuMap: Record<string, ResourceSku> = {};
            const creds = AuthService.getCredentials();

            if (creds) {
                try {
                    console.log('Authenticating to fetch exact VM specs...');
                    const token = await AuthService.login(creds);
                    skuMap = await this.fetchResourceSkus(region, token, creds.subscriptionId);
                    console.log(`Fetched ${Object.keys(skuMap).length} exact VM specs from Management API`);
                } catch (authErr) {
                    console.error('Auth failed, falling back to heuristic parser', authErr);
                }
            }

            // 3. Merge & Transform
            const result = priceData.Items.map(item => {
                const exactSku = skuMap[item.armSkuName];

                let vCpus: string | undefined;
                let memoryGb: string | undefined;
                let maxDisks: string | undefined;
                let maxNics: string | undefined;
                let acceleratedNetworking = 'False';
                let family = '';
                let isSpot = item.armSkuName.toLowerCase().includes('spot');

                if (exactSku) {
                    // Extract from capabilities array
                    const caps = exactSku.capabilities;
                    vCpus = caps.find(c => c.name === 'vCPUs')?.value;
                    memoryGb = caps.find(c => c.name === 'MemoryGB')?.value;
                    maxDisks = caps.find(c => c.name === 'MaxDataDiskCount')?.value;
                    maxNics = caps.find(c => c.name === 'MaxNetworkInterfaces')?.value;
                    acceleratedNetworking = caps.find(c => c.name === 'AcceleratedNetworkingEnabled')?.value || 'False';

                    family = exactSku.family || 'Unknown';
                } else {
                    // Source: Heuristic Parser / Known Dictionary (Fallback)
                    const parsed = SkuParser.parse(item.armSkuName);
                    vCpus = parsed.vCpus?.toString();
                    memoryGb = parsed.memoryGb?.toString();
                    family = parsed.family || 'Unknown';
                    isSpot = parsed.isSpot || isSpot;

                    // Best guess for unauthenticated users
                    const vCpuNum = vCpus ? parseInt(vCpus) : 0;
                    // Standard Azure rule: 1 NIC per vCPU, max 8 (usually)
                    // But newer SKUs break this rule. This is just a fallback.
                    maxNics = vCpuNum ? Math.min(vCpuNum, 8).toString() : '1';
                }

                return {
                    resourceType: 'virtualMachines',
                    name: item.armSkuName,
                    tier: 'Standard',
                    size: item.skuName,
                    family: family,
                    locations: [item.armRegionName],
                    locationInfo: [],
                    capabilities: [
                        { name: 'vCPUs', value: vCpus || '0' },
                        { name: 'MemoryGB', value: memoryGb || '0' },
                        { name: 'PricePerHour', value: item.retailPrice.toString() },
                        { name: 'IsSpot', value: isSpot ? 'True' : 'False' },
                        { name: 'MaxDataDisks', value: maxDisks || '?' },
                        { name: 'MaxNICs', value: maxNics || '?' },
                        { name: 'AcceleratedNetworking', value: acceleratedNetworking }
                    ],
                    restrictions: []
                };
            });

            // 4. Save to Cache
            try {
                const cacheEntry = {
                    timestamp: Date.now(),
                    data: result
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
                console.log(`Saved ${result.length} items to Local Cache (${region})`);
            } catch (e) {
                console.warn('Failed to save to cache (likely quota exceeded)', e);
            }

            return result;

        } catch (error) {
            console.error('Failed to fetch SKUs:', error);
            throw error;
        }
    }
}


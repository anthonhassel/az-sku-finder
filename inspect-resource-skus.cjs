const https = require('https');

// Credentials from AuthService
const TENANT_ID = '1369013b-267d-4099-be52-702a9fa658c0';
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const SUBSCRIPTION_ID = '';
const REGION = 'westeurope';

function post(url, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function get(url, token) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        const tokenParams = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: 'https://management.azure.com/.default'
        });
        const tokenRes = await post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, tokenParams.toString());
        const token = tokenRes.access_token;

        console.log(`Fetching SKUs for ${REGION}...`);

        let url = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Compute/skus?api-version=2021-07-01&$filter=location eq '${REGION}'`;

        let allSkus = [];
        let pageCount = 0;

        while (url) {
            pageCount++;
            console.log(`Fetching page ${pageCount}...`);
            const data = await get(url, token);

            if (data.value) {
                allSkus.push(...data.value);
            }
            url = data.nextLink;
        }

        console.log(`Total SKUs fetched: ${allSkus.length}`);

        const target = 'Standard_F48ams_v6';
        const sample = allSkus.find(x => x.name === target);

        if (sample) {
            console.log(`\n--- FOUND ${target} ---`);
            console.log('Capabilities:', JSON.stringify(sample.capabilities, null, 2));
        } else {
            console.log(`\n--- NOT FOUND ${target} ---`);
            const similar = allSkus.filter(x => x.name.includes('F48'));
            console.log(`Found ${similar.length} similar SKUs (F48):`, similar.map(s => s.name).slice(0, 5));
        }

    } catch (e) { console.error(e); }
}
run();

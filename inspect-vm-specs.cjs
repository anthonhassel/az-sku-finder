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
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
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
            headers: {
                'Authorization': `Bearer ${token}`
            }
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
        console.log('Authenticating...');
        const tokenParams = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: 'https://management.azure.com/.default'
        });

        const tokenRes = await post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, tokenParams.toString());
        const token = tokenRes.access_token;

        if (!token) {
            console.error('Failed to get token', tokenRes);
            return;
        }

        console.log(`Fetching VM Sizes for ${REGION}...`);
        const url = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Compute/locations/${REGION}/vmSizes?api-version=2022-03-01`;

        const data = await get(url, token);

        if (data.value && data.value.length > 0) {
            console.log('\n--- Sample VM Size Object (Latest API) ---');
            // Find a D series one as a good example
            const sample = data.value.find(x => x.name === 'Standard_D2s_v3') || data.value[0];
            console.log(JSON.stringify(sample, null, 2));
        } else {
            console.log('No data found:', data);
        }

    } catch (e) {
        console.error(e);
    }
}

run();

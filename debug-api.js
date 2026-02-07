import https from 'https';

const region = 'westeurope';
const filter = `serviceName eq 'Virtual Machines' and armRegionName eq '${region}' and priceType eq 'Consumption'`;
const url = `https://prices.azure.com/api/retail/prices?$filter=${encodeURIComponent(filter)}&$top=5`;

console.log(`Fetching from: ${url}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('API Response Status:', res.statusCode);
            console.log('Item Count:', json.Items ? json.Items.length : 0);

            if (json.Items && json.Items.length > 0) {
                console.log('Sample Item:', JSON.stringify(json.Items[0], null, 2));

                // Test Parser Logic logic
                const item = json.Items[0];
                const skuName = item.armSkuName;
                console.log(`\nTesting Parser on '${skuName}':`);

                const cpuMatch = skuName.match(/[A-Za-z]+(\d+)/);
                console.log('CPU Regex Match:', cpuMatch);

                if (cpuMatch) {
                    console.log('Parsed vCPUs:', parseInt(cpuMatch[1], 10));
                } else {
                    console.log('Failed to parse vCPUs');
                }
            } else {
                console.log('No items found in response.');
                console.log('Raw body:', data.substring(0, 500));
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
});

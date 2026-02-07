const region = 'westeurope';
// Using the dummy subscription ID from the user's example
const url = `https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/providers/Microsoft.Compute/locations/${region}/vmSizes?api-version=2022-03-01`;

console.log(`Testing unrestricted access to: ${url}`);

async function test() {
    try {
        const res = await fetch(url);
        console.log(`Response Status: ${res.status} ${res.statusText}`);

        if (res.ok) {
            const data = await res.json();
            console.log('Success! Found VM sizes.');
            console.log('Count:', data.value ? data.value.length : 0);
            if (data.value && data.value.length > 0) {
                console.log('Sample:', JSON.stringify(data.value[0], null, 2));
            }
        } else {
            console.log('Failed to fetch.');
            const text = await res.text();
            console.log('Error Body:', text.slice(0, 500));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

test();

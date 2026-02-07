export interface AzureCredentials {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    subscriptionId: string;
}

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class AuthService {
    private static STORAGE_KEY = 'az_sku_finder_creds';

    // Hardcoded credentials
    // WARNING: Exposing Client Secret in frontend code is insecure for production.
    // Replace these placeholder values with your actual Azure credentials
    private static HARDCODED_CREDS: AzureCredentials = {
        tenantId: 'YOUR_TENANT_ID',
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        subscriptionId: 'YOUR_SUBSCRIPTION_ID'
    };

    static saveCredentials(creds: AzureCredentials): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(creds));
    }

    static getCredentials(): AzureCredentials | null {
        // Priority: Local Storage (Overwrites) -> Hardcoded Defaults
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) return JSON.parse(saved);

        // Check if Hardcoded creds are valid (Tenant ID filled)
        if (this.HARDCODED_CREDS.tenantId && this.HARDCODED_CREDS.tenantId !== 'YOUR_TENANT_ID') {
            return this.HARDCODED_CREDS;
        }

        return this.HARDCODED_CREDS; // Return anyway so user can see what's missing
    }

    static clearCredentials(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    static async login(creds: AzureCredentials): Promise<string> {
        const url = `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`;
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            scope: 'https://management.azure.com/.default'
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error_description || 'Authentication failed');
            }

            const data: TokenResponse = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }
}

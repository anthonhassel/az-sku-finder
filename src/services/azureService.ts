import type { AzureSku } from '../types';

export class AzureService {
    private static get DATA_URL() {
        // Appends 'data/skus.json' to the Vite base URL (e.g., '/az-sku-finder/' in production, '/' in dev)
        return `${import.meta.env.BASE_URL}data/skus.json`;
    }

    static getLastUpdated(): Date | null {
        // With static data, we could fetch a metadata file, but for now we'll assume "recently" or use header date if we want complexity.
        // Returning null signifies the UI shouldn't show a specific "Last Updated" unless we bake it into the JSON.
        return new Date();
    }

    static async fetchSkus(): Promise<AzureSku[]> {
        // We ignore region argument for fetching because the static file contains data for 'westeurope' (or whatever was generated).
        // If we want multiple regions, we'd generate skus-westeurope.json, skus-eastus.json etc.
        // For this specific app scope (westeurope focus), we just load the main file.

        try {
            // Check if we have a robust base URL handling in Vite, usually './' works relative to public root
            const response = await fetch(this.DATA_URL);

            if (!response.ok) {
                throw new Error(`Failed to load static data: ${response.statusText}`);
            }

            const data: AzureSku[] = await response.json();
            console.log(`Loaded ${data.length} SKUs from static file.`);

            // Optional: Client-side filtering if the static file contains ALL regions but we only want one
            // But currently the script generates for 'westeurope' only.

            return data;
        } catch (error) {
            console.error('Failed to fetch SKUs:', error);
            return [];
        }
    }
}

export interface SkuCapability {
    name: string;
    value: string;
}

export interface AzureSku {
    resourceType: string;
    name: string;
    tier: string;
    size: string;
    family: string;
    locations: string[];
    locationInfo: Array<{
        location: string;
        zones: string[];
        zoneDetails: Array<{
            Name: string[]; // e.g. ["1", "2"]
            capabilities: SkuCapability[];
        }>;
    }>;
    capabilities: SkuCapability[];
    restrictions: any[];
}

export interface FilterOptions {
    region: string;
    minCpu?: number;
    minRam?: number;
    minDisks?: number;
    minNics?: number;
    family?: string;
    features?: string[];
}

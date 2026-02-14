import { KNOWN_SKUS } from '../data/knownSkus';

export interface SkuSpecs {
    vCpus?: number;
    memoryGb?: number;
    family?: string;
    isSpot?: boolean;
}

export class SkuParser {
    static parse(skuName: string): SkuSpecs {
        // 1. Check Static Dictionary (Exact Match)
        if (KNOWN_SKUS[skuName]) {
            return {
                ...KNOWN_SKUS[skuName],
                isSpot: skuName.toLowerCase().includes('spot')
            };
        }

        // 2. Fallback for completely unknown SKUs
        // Logic has moved to build script, but we keep this for runtime safety
        const specs: SkuSpecs = {
            isSpot: skuName.toLowerCase().includes('spot'),
            family: 'Unknown'
        };

        const cpuMatch = skuName.match(/[A-Za-z]+(\d+)/);
        if (cpuMatch) {
            specs.vCpus = parseInt(cpuMatch[1], 10);
        }

        return specs;
    }
}

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

        const specs: SkuSpecs = {
            isSpot: skuName.toLowerCase().includes('spot'),
            family: 'Unknown'
        };

        // 2. Heuristic Regex Fallback
        // Extract Number of CPUs (Common pattern: D2s, E4s, etc.)
        const cpuMatch = skuName.match(/[A-Za-z]+(\d+)/);
        if (cpuMatch) {
            specs.vCpus = parseInt(cpuMatch[1], 10);
        }

        // Heuristic for RAM (Memory per core ratios)
        if (specs.vCpus) {
            const lowerName = skuName.toLowerCase();

            // Default Ratio (General Purpose)
            let ratio = 4;

            if (lowerName.includes('_a')) {
                specs.family = 'A Series (Entry Level)';
                ratio = 1; // Variable
                if (lowerName.includes('_v2')) ratio = 2;
            }
            else if (lowerName.includes('_b')) {
                specs.family = 'B Series (Burstable)';
                ratio = 4;
                if (lowerName.includes('b1')) specs.memoryGb = 1;
                else if (lowerName.includes('b2')) specs.memoryGb = 4;
            }
            else if (lowerName.includes('_d')) {
                specs.family = 'D Series (General Purpose)';
                ratio = 4;
            }
            else if (lowerName.includes('_e')) {
                specs.family = 'E Series (Memory Optimized)';
                ratio = 8;
            }
            else if (lowerName.includes('_f')) {
                specs.family = 'F Series (Compute Optimized)';
                ratio = 2;
            }
            else if (lowerName.includes('_m')) {
                specs.family = 'M Series (High Memory)';
                ratio = 28;
            }
            else if (lowerName.includes('_l')) {
                specs.family = 'L Series (Storage Optimized)';
                ratio = 8;
            }
            else if (lowerName.includes('_nc') || lowerName.includes('_nv') || lowerName.includes('_nd')) {
                specs.family = 'N Series (GPU)';
                ratio = 6;
            }

            // If we haven't set a specific memory override, calculate by ratio
            if (specs.memoryGb === undefined) {
                specs.memoryGb = specs.vCpus * ratio;
            }
        }

        return specs;
    }
}

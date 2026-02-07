// A static dictionary of common Azure VM Specs to supplement the public Pricing API
// This avoids needing an Authenticated API call to management.azure.com

interface Spec {
    vCpus: number;
    memoryGb: number;
    family: string;
}

export const KNOWN_SKUS: Record<string, Spec> = {
    // General Purpose (D-Series v5)
    'Standard_D2s_v5': { vCpus: 2, memoryGb: 8, family: 'D v5 Series' },
    'Standard_D4s_v5': { vCpus: 4, memoryGb: 16, family: 'D v5 Series' },
    'Standard_D8s_v5': { vCpus: 8, memoryGb: 32, family: 'D v5 Series' },
    'Standard_D16s_v5': { vCpus: 16, memoryGb: 64, family: 'D v5 Series' },
    'Standard_D32s_v5': { vCpus: 32, memoryGb: 128, family: 'D v5 Series' },

    // D-Series v4
    'Standard_D2s_v4': { vCpus: 2, memoryGb: 8, family: 'D v4 Series' },
    'Standard_D4s_v4': { vCpus: 4, memoryGb: 16, family: 'D v4 Series' },
    'Standard_D8s_v4': { vCpus: 8, memoryGb: 32, family: 'D v4 Series' },

    // D-Series v3
    'Standard_D2s_v3': { vCpus: 2, memoryGb: 8, family: 'D v3 Series' },
    'Standard_D4s_v3': { vCpus: 4, memoryGb: 16, family: 'D v3 Series' },
    'Standard_D8s_v3': { vCpus: 8, memoryGb: 32, family: 'D v3 Series' },

    // Memory Optimized (E-Series v5)
    'Standard_E2s_v5': { vCpus: 2, memoryGb: 16, family: 'E v5 Series' },
    'Standard_E4s_v5': { vCpus: 4, memoryGb: 32, family: 'E v5 Series' },
    'Standard_E8s_v5': { vCpus: 8, memoryGb: 64, family: 'E v5 Series' },
    'Standard_E16s_v5': { vCpus: 16, memoryGb: 128, family: 'E v5 Series' },
    'Standard_E32s_v5': { vCpus: 32, memoryGb: 256, family: 'E v5 Series' },

    // E-Series v4
    'Standard_E2s_v4': { vCpus: 2, memoryGb: 16, family: 'E v4 Series' },
    'Standard_E4s_v4': { vCpus: 4, memoryGb: 32, family: 'E v4 Series' },

    // E-Series v3
    'Standard_E2s_v3': { vCpus: 2, memoryGb: 16, family: 'E v3 Series' },
    'Standard_E4s_v3': { vCpus: 4, memoryGb: 32, family: 'E v3 Series' },

    // Compute Optimized (F-Series)
    'Standard_F2s_v2': { vCpus: 2, memoryGb: 4, family: 'F v2 Series' },
    'Standard_F4s_v2': { vCpus: 4, memoryGb: 8, family: 'F v2 Series' },
    'Standard_F8s_v2': { vCpus: 8, memoryGb: 16, family: 'F v2 Series' },
    'Standard_F16s_v2': { vCpus: 16, memoryGb: 32, family: 'F v2 Series' },

    // Burstable (B-Series)
    'Standard_B1s': { vCpus: 1, memoryGb: 1, family: 'B Series' },
    'Standard_B1ms': { vCpus: 1, memoryGb: 2, family: 'B Series' },
    'Standard_B2s': { vCpus: 2, memoryGb: 4, family: 'B Series' },
    'Standard_B2ms': { vCpus: 2, memoryGb: 8, family: 'B Series' },
    'Standard_B4ms': { vCpus: 4, memoryGb: 16, family: 'B Series' },
    'Standard_B8ms': { vCpus: 8, memoryGb: 32, family: 'B Series' },

    // Storage Optimized (L-Series)
    'Standard_L8s_v3': { vCpus: 8, memoryGb: 64, family: 'L v3 Series' },
    'Standard_L16s_v3': { vCpus: 16, memoryGb: 128, family: 'L v3 Series' },
};

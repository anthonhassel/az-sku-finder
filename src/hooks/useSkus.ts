import { useState, useMemo, useEffect } from 'react';
import type { AzureSku, FilterOptions } from '../types';
import { AzureService } from '../services/azureService';

// Comprehensive list of Azure regions
const ALL_REGIONS = [
    // Americas
    'eastus', 'eastus2', 'southcentralus', 'westus2', 'westus3', 'centralus', 'northcentralus', 'westus',
    'canadaeast', 'canadacentral', 'brazilsouth', 'brazilsoutheast',
    // Europe
    'northeurope', 'westeurope', 'uksouth', 'ukwest', 'francecentral', 'francesouth',
    'germanywestcentral', 'germanynorth', 'switzerlandnorth', 'switzerlandwest',
    'norwayeast', 'norwaywest', 'swedencentral', 'polandcentral', 'italynorth',
    // Asia Pacific
    'eastasia', 'southeastasia', 'australiaeast', 'australiasoutheast', 'australiacentral', 'australiacentral2',
    'japaneast', 'japanwest', 'koreacentral', 'koreasouth', 'centralindia', 'southindia', 'westindia',
    // Middle East & Africa
    'uaenorth', 'uaecentral', 'southafricanorth', 'southafricawest', 'qatarcentral', 'israelcentral'
];



// Sorting types
export type SortKey = 'name' | 'family' | 'vCPUs' | 'MemoryGB' | 'MaxDataDisks' | 'MaxNICs' | 'PricePerHour';
export interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

export function useSkus(hasCredentials = false) {
    const [allSkus, setAllSkus] = useState<AzureSku[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({
        region: 'westeurope', // Default
        os: 'linux',
        minCpu: 0,
        minRam: 0,
        minDisks: 0,
        minNics: 0,
        features: [],
    });
    const [refreshIndex, setRefreshIndex] = useState(0);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Pagination & Sorting
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'vCPUs', direction: 'asc' });

    // Fetch when Region changes or refresh is triggered
    useEffect(() => {
        let isMounted = true;

        const fetchSkus = async () => {
            if (!filters.region) return;

            setLoading(true);
            setError(null);
            try {
                // If refreshIndex > 0, it means user clicked refresh, so force it.
                // Initial load (refreshIndex 0) will use cache if available.
                // Initial load (refreshIndex 0) will use cache if available.


                const data = await AzureService.fetchSkus();
                const updated = AzureService.getLastUpdated();

                if (isMounted) {
                    setAllSkus(data);
                    setLastUpdated(updated);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    setError('Failed to load SKUs for this region.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSkus();

        return () => { isMounted = false; };
    }, [filters.region, refreshIndex, hasCredentials]); // Re-run when credentials change or refresh triggered

    // Reset page when filters/sort/data change
    useEffect(() => {
        setPage(1);
    }, [filters, sortConfig, allSkus]);

    // 1. FILTER
    const filteredSkus = useMemo(() => {
        return allSkus.filter((sku) => {
            // Helper to get capability value and fallback to 0 if Not Available
            const getNumCap = (name: string) => {
                const cap = sku.capabilities.find((c) => c.name === name);
                if (!cap || cap.value === 'Not Available') return 0;
                return parseFloat(cap.value) || 0;
            };

            // Filter by CPU
            if (filters.minCpu && filters.minCpu > 0) {
                if (getNumCap('vCPUs') < filters.minCpu) return false;
            }

            // Filter by RAM
            if (filters.minRam && filters.minRam > 0) {
                if (getNumCap('MemoryGB') < filters.minRam) return false;
            }

            // Filter by Max Data Disks
            if (filters.minDisks && filters.minDisks > 0) {
                if (getNumCap('MaxDataDiskCount') < filters.minDisks) return false;
            }

            // Filter by Max NICs
            if (filters.minNics && filters.minNics > 0) {
                if (getNumCap('MaxNetworkInterfaces') < filters.minNics) return false;
            }

            // Filter by Features
            if (filters.features && filters.features.length > 0) {
                const getCap = (name: string) => sku.capabilities.find(c => c.name === name)?.value || 'False';

                for (const feature of filters.features) {
                    switch (feature) {
                        case 'premiumio':
                            if (getCap('PremiumIO') !== 'True') return false;
                            break;
                        case 'ephemeral':
                            if (getCap('EphemeralOS') !== 'True') return false;
                            break;
                        case 'accelerated':
                            if (getCap('AcceleratedNetworking') !== 'True') return false;
                            break;
                        case 'nested':
                            if (getCap('NestedVirtualization') !== 'True') return false;
                            break;
                        case 'encryption':
                            if (getCap('EncryptionAtHost') !== 'True') return false;
                            break;
                    }
                }
            }

            return true;
        });
    }, [allSkus, filters.minCpu, filters.minRam, filters.minDisks, filters.minNics, filters.features]);

    // 2. SORT
    const sortedSkus = useMemo(() => {
        const sorted = [...filteredSkus];
        sorted.sort((a, b) => {
            const getCap = (sku: AzureSku, name: string) => sku.capabilities.find((c) => c.name === name)?.value || '0';

            // For string comparisons
            if (sortConfig.key === 'name' || sortConfig.key === 'family') {
                const aVal = sortConfig.key === 'name' ? a.name : (a.family || '');
                const bVal = sortConfig.key === 'name' ? b.name : (b.family || '');

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }

            // For numeric comparisons - map to actual capability names
            let capName = '';
            switch (sortConfig.key) {
                case 'vCPUs':
                    capName = 'vCPUs';
                    break;
                case 'MemoryGB':
                    capName = 'MemoryGB';
                    break;
                case 'MaxDataDisks':
                    capName = 'MaxDataDiskCount';
                    break;
                case 'MaxNICs':
                    capName = 'MaxNetworkInterfaces';
                    break;
                case 'PricePerHour':
                    capName = filters.os === 'windows' ? 'PricePerHourWindows' : 'PricePerHourLinux';
                    break;
                default:
                    return 0;
            }

            const aValRaw = getCap(a, capName);
            const bValRaw = getCap(b, capName);

            const aVal = aValRaw === 'Not Available' ? -1 : (Number(aValRaw) || 0);
            const bVal = bValRaw === 'Not Available' ? -1 : (Number(bValRaw) || 0);

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredSkus, sortConfig]);

    // 3. PAGINATE
    const paginatedSkus = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return sortedSkus.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedSkus, page]);

    const totalPages = Math.ceil(sortedSkus.length / ITEMS_PER_PAGE);

    const updateFilter = (key: keyof FilterOptions, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const refresh = () => setRefreshIndex(prev => prev + 1);

    const handleSort = (key: SortKey) => {
        setSortConfig((current) => {
            // If clicking the same column, toggle direction
            if (current.key === key) {
                const newConfig = {
                    key,
                    direction: current.direction === 'asc' ? 'desc' as const : 'asc' as const,
                };
                console.log('Toggling sort:', current, '->', newConfig);
                return newConfig;
            }
            // If clicking a different column, start with ascending
            const newConfig = {
                key,
                direction: 'asc' as const,
            };
            console.log('New column sort:', current, '->', newConfig);
            return newConfig;
        });
        // Reset to page 1 when sorting changes
        setPage(1);
    };

    return {
        skus: paginatedSkus,
        loading,
        error,
        filters,
        availableRegions: ALL_REGIONS.sort(),
        updateFilter,
        refresh,
        lastUpdated,
        // Pagination
        page,
        setPage,
        totalPages,
        // Sorting
        sortConfig,
        handleSort
    };
}

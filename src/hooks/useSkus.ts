import { useState, useMemo, useEffect } from 'react';
import type { AzureSku, FilterOptions } from '../types';
import { AzureService } from '../services/azureService';

// Common regions to populate the dropdown
const POPULAR_REGIONS = [
    'eastus', 'eastus2', 'westus', 'westus2', 'centralus', 'southcentralus',
    'northeurope', 'westeurope', 'uksouth', 'ukwest',
    'southeastasia', 'eastasia', 'japaneast', 'japanwest',
    'australiaeast', 'australiasoutheast'
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
        minCpu: 0,
        minRam: 0,
        minDisks: 0,
        minNics: 0,
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
                const force = refreshIndex > 0;

                const data = await AzureService.fetchSkus(filters.region, force);
                const updated = AzureService.getLastUpdated(filters.region);

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
            // Filter by CPU
            if (filters.minCpu && filters.minCpu > 0) {
                const cpuCap = sku.capabilities.find((c) => c.name === 'vCPUs');
                const cpu = cpuCap ? parseInt(cpuCap.value, 10) : 0;
                if (cpu < filters.minCpu) return false;
            }

            // Filter by RAM
            if (filters.minRam && filters.minRam > 0) {
                const ramCap = sku.capabilities.find((c) => c.name === 'MemoryGB');
                const ram = ramCap ? parseFloat(ramCap.value) : 0;
                if (ram < filters.minRam) return false;
            }

            // Filter by Max Data Disks
            if (filters.minDisks && filters.minDisks > 0) {
                const diskCap = sku.capabilities.find((c) => c.name === 'MaxDataDiskCount');
                const disks = diskCap ? parseInt(diskCap.value, 10) : 0;
                if (disks < filters.minDisks) return false;
            }

            // Filter by Max NICs
            if (filters.minNics && filters.minNics > 0) {
                const nicCap = sku.capabilities.find((c) => c.name === 'MaxNetworkInterfaces');
                const nics = nicCap ? parseInt(nicCap.value, 10) : 0;
                if (nics < filters.minNics) return false;
            }

            return true;
        });
    }, [allSkus, filters.minCpu, filters.minRam, filters.minDisks, filters.minNics]);

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
                    capName = 'PricePerHour';
                    break;
                default:
                    return 0;
            }

            const aVal = Number(getCap(a, capName)) || 0;
            const bVal = Number(getCap(b, capName)) || 0;

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
        availableRegions: POPULAR_REGIONS.sort(),
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

import { useState, useEffect } from 'react';
import { useSkus } from './hooks/useSkus';
import { FilterBar } from './components/FilterBar';
import { SkuCard } from './components/SkuCard';
import { SkuTable } from './components/SkuTable';
import { Pagination } from './components/Pagination';
import { motion } from 'framer-motion';

function App() {
    const { skus, loading, filters, availableRegions, updateFilter, refresh, lastUpdated, page, totalPages, setPage, sortConfig, handleSort } = useSkus(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Check for credentials on mount
    useEffect(() => {
        // Force refresh on mount to pick up hardcoded creds
        refresh();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-x-hidden selection:bg-pink-500/30">

            {/* Decorative background elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px] animate-pulse duration-[15s]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            Azure SKU Finder
                        </span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Find the perfect Virtual Machine configuration for your workload.
                        Filter by Region, CPU, and RAM with ease.
                    </p>
                </motion.div>

                <FilterBar
                    filters={filters}
                    availableRegions={availableRegions}
                    onUpdate={updateFilter}
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                    lastUpdated={lastUpdated}
                />

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                ) : (
                    skus.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {skus.map((sku) => (
                                        <SkuCard key={sku.name} sku={sku} />
                                    ))}
                                </div>
                            ) : (
                                <SkuTable skus={skus} sortConfig={sortConfig} onSort={handleSort} />
                            )}

                            {/* Bottom Pagination */}
                            <div className="flex justify-center mt-8">
                                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </>
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <p className="text-xl">No SKUs found matching your criteria.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default App;

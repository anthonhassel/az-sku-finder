import type { FilterOptions } from '../types';
import { Cpu, MapPin, Server, LayoutGrid, List, RefreshCw, HardDrive, Network } from 'lucide-react';

interface FilterBarProps {
    filters: FilterOptions;
    availableRegions: string[];
    onUpdate: (key: keyof FilterOptions, value: any) => void;
    viewMode: 'grid' | 'table';
    onViewChange: (mode: 'grid' | 'table') => void;
    onRefresh: () => void;
    lastUpdated: Date | null;
    loading: boolean;
}

export function FilterBar({ filters, availableRegions, onUpdate, viewMode, onViewChange, onRefresh, lastUpdated, loading }: FilterBarProps) {
    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col gap-6 w-full max-w-[90rem] mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-700 relative">

            {/* Top Row: Region & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full items-end">
                {/* Region Selector */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-300 mb-1 ml-1 uppercase tracking-wider">Region</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 w-5 h-5 pointer-events-none" />
                        <select
                            value={filters.region}
                            onChange={(e) => onUpdate('region', e.target.value)}
                            className="w-full bg-black/20 text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                        >
                            {availableRegions.map((r) => (
                                <option key={r} value={r} className="bg-gray-900 text-white">
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* CPU Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-300 mb-1 ml-1 uppercase tracking-wider">Min CPUs</label>
                    <div className="relative">
                        <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minCpu || ''}
                            onChange={(e) => onUpdate('minCpu', parseInt(e.target.value) || 0)}
                            placeholder="Any"
                            className="w-full bg-black/20 text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none hover:bg-black/30 transition-colors"
                        />
                    </div>
                </div>

                {/* RAM Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-300 mb-1 ml-1 uppercase tracking-wider">Min RAM (&gt; GB)</label>
                    <div className="relative">
                        <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minRam || ''}
                            onChange={(e) => onUpdate('minRam', parseFloat(e.target.value) || 0)}
                            placeholder="Any"
                            className="w-full bg-black/20 text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-black/30 transition-colors"
                        />
                    </div>
                </div>

                {/* Disks Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-300 mb-1 ml-1 uppercase tracking-wider">Min Disks</label>
                    <div className="relative">
                        <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minDisks || ''}
                            onChange={(e) => onUpdate('minDisks', parseInt(e.target.value) || 0)}
                            placeholder="Any"
                            className="w-full bg-black/20 text-white pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none hover:bg-black/30 transition-colors"
                        />
                    </div>
                </div>

                {/* NICs Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-300 mb-1 ml-1 uppercase tracking-wider">Min NICs</label>
                    <div className="relative">
                        <Network className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minNics || ''}
                            onChange={(e) => onUpdate('minNics', parseInt(e.target.value) || 0)}
                            placeholder="Any"
                            className="w-full bg-black/20 text-white pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none hover:bg-black/30 transition-colors"
                        />
                    </div>
                </div>

                {/* Controls (Refresh & View) */}
                <div className="h-[50px]">
                    <div className="flex items-center gap-2 self-end h-full w-full">
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="h-full px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50 border border-white/5"
                            title="Force Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <div className="bg-black/40 rounded-xl p-1 flex items-center gap-1 border border-white/10 h-full flex-1 justify-center">
                            <button
                                onClick={() => onViewChange('grid')}
                                className={`h-full flex-1 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid'
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onViewChange('table')}
                                className={`h-full flex-1 rounded-lg transition-all flex items-center justify-center ${viewMode === 'table'
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title="Table View"
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {lastUpdated && (
                <div className="absolute top-2 right-4">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                        Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}


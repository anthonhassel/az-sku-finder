import { useState, useRef, useEffect } from 'react';
import type { FilterOptions } from '../types';
import { Cpu, MapPin, Server, LayoutGrid, List, HardDrive, Network, Zap, ChevronDown, Check } from 'lucide-react';
import { trackFilterChange } from '../utils/analytics';

interface FilterBarProps {
    filters: FilterOptions;
    availableRegions: string[];
    onUpdate: (key: keyof FilterOptions, value: any) => void;
    viewMode: 'grid' | 'table';
    onViewChange: (mode: 'grid' | 'table') => void;
    lastUpdated: Date | null;
}

export function FilterBar({ filters, availableRegions, onUpdate, viewMode, onViewChange, lastUpdated }: FilterBarProps) {
    const [isFeatureOpen, setIsFeatureOpen] = useState(false);
    const featureDropdownRef = useRef<HTMLDivElement>(null);

    // Track filter updates
    const handleUpdate = (key: keyof FilterOptions, value: any) => {
        onUpdate(key, value);
        trackFilterChange(key, value);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (featureDropdownRef.current && !featureDropdownRef.current.contains(event.target as Node)) {
                setIsFeatureOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const FEATURE_OPTIONS = [
        { id: 'premiumio', label: 'Premium Storage' },
        { id: 'ephemeral', label: 'Ephemeral OS' },
        { id: 'accelerated', label: 'Accelerated Net' },
        { id: 'nested', label: 'Nested Virt' },
        { id: 'encryption', label: 'Encryption' },
    ];

    const currentFeatures = filters.features || [];

    const toggleFeature = (id: string) => {
        const newFeatures = currentFeatures.includes(id)
            ? currentFeatures.filter(f => f !== id)
            : [...currentFeatures, id];
        handleUpdate('features', newFeatures);
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-xl shadow-xl w-full max-w-[95rem] mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-700 relative z-50">

            {/* Single Row: All Filters & Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 w-full items-end">
                {/* Region Selector */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Region</label>
                    <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-400 w-4 h-4 pointer-events-none" />
                        <select
                            value={filters.region}
                            onChange={(e) => handleUpdate('region', e.target.value)}
                            className="w-full bg-black/20 text-white text-sm pl-8 pr-2 py-2 rounded-lg border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                        >
                            {availableRegions.map((r) => (
                                <option key={r} value={r} className="bg-gray-900 text-white">
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* OS Selector */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">OS</label>
                    <div className="relative">
                        <select
                            value={filters.os}
                            onChange={(e) => handleUpdate('os', e.target.value)}
                            className="w-full bg-black/20 text-white text-sm pl-3 pr-8 py-2 rounded-lg border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none appearance-none cursor-pointer hover:bg-black/30 transition-colors"
                        >
                            <option value="linux" className="bg-gray-900 text-white">Linux</option>
                            <option value="windows" className="bg-gray-900 text-white">Windows</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* CPU Filter */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">CPUs (Min / Max)</label>
                    <div className="relative flex items-center gap-1 bg-black/20 rounded-lg border border-white/10 px-2 py-1 hover:bg-black/30 transition-colors focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
                        <Cpu className="text-cyan-400 w-4 h-4 shrink-0" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minCpu || ''}
                            onChange={(e) => handleUpdate('minCpu', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                        <span className="text-gray-600">/</span>
                        <input
                            type="number"
                            min="0"
                            value={filters.maxCpu || ''}
                            onChange={(e) => handleUpdate('maxCpu', parseInt(e.target.value) || 0)}
                            placeholder="Max"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                    </div>
                </div>

                {/* RAM Filter */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">RAM (Min / Max)</label>
                    <div className="relative flex items-center gap-1 bg-black/20 rounded-lg border border-white/10 px-2 py-1 hover:bg-black/30 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                        <Server className="text-emerald-400 w-4 h-4 shrink-0" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minRam || ''}
                            onChange={(e) => handleUpdate('minRam', parseFloat(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                        <span className="text-gray-600">/</span>
                        <input
                            type="number"
                            min="0"
                            value={filters.maxRam || ''}
                            onChange={(e) => handleUpdate('maxRam', parseFloat(e.target.value) || 0)}
                            placeholder="Max"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                    </div>
                </div>

                {/* Disks Filter */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Disks (Min / Max)</label>
                    <div className="relative flex items-center gap-1 bg-black/20 rounded-lg border border-white/10 px-2 py-1 hover:bg-black/30 transition-colors focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
                        <HardDrive className="text-orange-400 w-3.5 h-3.5 shrink-0" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minDisks || ''}
                            onChange={(e) => handleUpdate('minDisks', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                        <span className="text-gray-600">/</span>
                        <input
                            type="number"
                            min="0"
                            value={filters.maxDisks || ''}
                            onChange={(e) => handleUpdate('maxDisks', parseInt(e.target.value) || 0)}
                            placeholder="Max"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                    </div>
                </div>

                {/* NICs Filter */}
                <div className="relative">
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">NICs (Min / Max)</label>
                    <div className="relative flex items-center gap-1 bg-black/20 rounded-lg border border-white/10 px-2 py-1 hover:bg-black/30 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <Network className="text-indigo-400 w-3.5 h-3.5 shrink-0" />
                        <input
                            type="number"
                            min="0"
                            value={filters.minNics || ''}
                            onChange={(e) => handleUpdate('minNics', parseInt(e.target.value) || 0)}
                            placeholder="Min"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                        <span className="text-gray-600">/</span>
                        <input
                            type="number"
                            min="0"
                            value={filters.maxNics || ''}
                            onChange={(e) => handleUpdate('maxNics', parseInt(e.target.value) || 0)}
                            placeholder="Max"
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-600 mini-input"
                        />
                    </div>
                </div>

                {/* Feature Filter (Multi-select) */}
                <div className="relative" ref={featureDropdownRef}>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 ml-1 uppercase tracking-wider">Features</label>
                    <div className="relative">
                        <Zap className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow-400 w-3.5 h-3.5 z-10 pointer-events-none" />
                        <button
                            type="button"
                            onClick={() => setIsFeatureOpen(!isFeatureOpen)}
                            className="w-full bg-black/20 text-white text-sm pl-8 pr-8 py-2 rounded-lg border border-white/10 hover:bg-black/30 transition-colors text-left flex items-center justify-between"
                        >
                            <span className="truncate">
                                {currentFeatures.length === 0
                                    ? 'Any Features'
                                    : `${currentFeatures.length} Selected`}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5" />
                        </button>

                        {isFeatureOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                                {FEATURE_OPTIONS.map(opt => {
                                    const isSelected = currentFeatures.includes(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleFeature(opt.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between group"
                                        >
                                            <span>{opt.label}</span>
                                            <div className={`w-4 h-4 rounded-sm border ${isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500 group-hover:border-gray-400'} flex items-center justify-center`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls (View Toggle) */}
                <div className="h-[38px]">
                    <div className="flex items-center gap-2 self-end h-full w-full">
                        <div className="bg-black/40 rounded-lg p-1 flex items-center gap-1 border border-white/10 h-full flex-1 justify-center">
                            <button
                                onClick={() => {
                                    onViewChange('grid');
                                    trackFilterChange('viewMode', 'grid');
                                }}
                                className={`h-full flex-1 rounded-md transition-all flex items-center justify-center ${viewMode === 'grid'
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    onViewChange('table');
                                    trackFilterChange('viewMode', 'table');
                                }}
                                className={`h-full flex-1 rounded-md transition-all flex items-center justify-center ${viewMode === 'table'
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
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


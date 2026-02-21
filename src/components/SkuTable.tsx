import type { AzureSku } from '../types';
import { Zap, ArrowUpDown, ArrowUp, ArrowDown, Database, HardDrive, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SortConfig, SortKey } from '../hooks/useSkus';
import { Tooltip } from './Tooltip';

interface SkuTableProps {
    skus: AzureSku[];
    sortConfig: SortConfig;
    onSort: (key: SortKey) => void;
}

export function SkuTable({ skus, sortConfig, onSort }: SkuTableProps) {

    const getCap = (sku: AzureSku, name: string) => {
        return sku.capabilities.find((c) => c.name === name)?.value || '-';
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-pink-400" /> : <ArrowDown className="w-4 h-4 text-pink-400" />;
    };

    const formatPrice = (price: string) => {
        const num = parseFloat(price);
        return isNaN(num) ? '-' : `$ ${num.toFixed(4)}`;
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="p-4 font-medium cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('name')}>
                            <div className="flex items-center gap-2">SKU Name <SortIcon column="name" /></div>
                        </th>
                        <th className="p-4 font-medium cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('family')}>
                            <div className="flex items-center gap-2">Family <SortIcon column="family" /></div>
                        </th>
                        <th className="p-4 font-medium text-right cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('vCPUs')}>
                            <div className="flex items-center justify-end gap-2">vCPUs <SortIcon column="vCPUs" /></div>
                        </th>
                        <th className="p-4 font-medium text-right cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('MemoryGB')}>
                            <div className="flex items-center justify-end gap-2">RAM (GB) <SortIcon column="MemoryGB" /></div>
                        </th>
                        <th className="p-4 font-medium text-center cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('MaxDataDisks')}>
                            <div className="flex items-center justify-center gap-2">Max Disks <SortIcon column="MaxDataDisks" /></div>
                        </th>
                        <th className="p-4 font-medium text-center cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('MaxNICs')}>
                            <div className="flex items-center justify-center gap-2">NICs <SortIcon column="MaxNICs" /></div>
                        </th>
                        <th className="p-4 font-medium text-center">Features</th>
                        <th className="p-4 font-medium text-right cursor-pointer group hover:text-white transition-colors" onClick={() => onSort('PricePerHour')}>
                            <div className="flex items-center justify-end gap-2">Price/Hr <SortIcon column="PricePerHour" /></div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {skus.map((sku, idx) => {
                        const cpu = getCap(sku, 'vCPUs');
                        const ram = getCap(sku, 'MemoryGB');
                        const disks = getCap(sku, 'MaxDataDiskCount');
                        const nics = getCap(sku, 'MaxNetworkInterfaces');
                        const accel = getCap(sku, 'AcceleratedNetworking') === 'True';
                        const price = getCap(sku, 'PricePerHour');

                        return (
                            <motion.tr
                                key={sku.name}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: Math.min(idx * 0.005, 0.2) }}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4 font-medium text-white">{sku.name}</td>
                                <td className="p-4 text-gray-400">{sku.family}</td>
                                <td className={`p-4 text-right font-mono ${cpu === 'Not Available' ? 'text-gray-600' : 'text-cyan-400'}`}>{cpu === 'Not Available' ? '-' : cpu}</td>
                                <td className={`p-4 text-right font-mono ${ram === 'Not Available' ? 'text-gray-600' : 'text-emerald-400'}`}>{ram === 'Not Available' ? '-' : ram}</td>
                                <td className={`p-4 text-center font-mono ${disks === 'Not Available' ? 'text-gray-600' : ''}`}>{disks === 'Not Available' ? '-' : disks}</td>
                                <td className={`p-4 text-center font-mono ${nics === 'Not Available' ? 'text-gray-600' : ''}`}>{nics === 'Not Available' ? '-' : nics}</td>
                                <td className="p-4 text-center">
                                    <div className="flex gap-1.5 justify-center">
                                        {accel && (
                                            <Tooltip content="Accelerated Networking: PCIe virtualization provides high-performance, low-latency communication by bypassing the host.">
                                                <div className="p-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 cursor-help">
                                                    <Zap className="w-3.5 h-3.5" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {getCap(sku, 'PremiumIO') === 'True' && (
                                            <Tooltip content="Premium Storage: Support for high-performance Premium SSD and Ultra Disk storage for I/O intensive workloads.">
                                                <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-help">
                                                    <Database className="w-3.5 h-3.5" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {getCap(sku, 'EphemeralOS') === 'True' && (
                                            <Tooltip content="Ephemeral OS Disk: OS disk is created on local temp storage, providing faster read/write and zero cost, but data is lost on deallocate.">
                                                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-help">
                                                    <HardDrive className="w-3.5 h-3.5" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {getCap(sku, 'NestedVirtualization') === 'True' && (
                                            <Tooltip content="Nested Virtualization: Hardware-assisted virtualization that allows you to run a hypervisor (like Hyper-V or Docker) inside the VM.">
                                                <div className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-help">
                                                    <Layers className="w-3.5 h-3.5" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {getCap(sku, 'EncryptionAtHost') === 'True' && (
                                            <Tooltip content="Encryption at Host: Data is encrypted on the VM's physical host before it's sent to storage, ensuring end-to-end security.">
                                                <div className="p-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 cursor-help">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </div>
                                            </Tooltip>
                                        )}
                                        {!accel && getCap(sku, 'PremiumIO') !== 'True' && getCap(sku, 'EphemeralOS') !== 'True' && (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right font-mono text-green-400 font-bold">
                                    {formatPrice(price)}
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

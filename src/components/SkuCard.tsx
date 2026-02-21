import type { AzureSku } from '../types';
import { Cpu, Database, HardDrive, Zap, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from './Tooltip';

interface SkuCardProps {
    sku: AzureSku;
    os: 'linux' | 'windows';
}

export function SkuCard({ sku, os }: SkuCardProps) {
    const getCap = (name: string) => sku.capabilities.find(c => c.name === name)?.value || '-';
    const formatValue = (val: string) => val === 'Not Available' ? '-' : val;
    const vCPUs = formatValue(getCap('vCPUs'));
    const memory = formatValue(getCap('MemoryGB'));
    const maxDisks = formatValue(getCap('MaxDataDiskCount'));
    const maxNics = formatValue(getCap('MaxNetworkInterfaces'));
    const premiumIO = getCap('PremiumIO') === 'True';
    const accelNet = getCap('AcceleratedNetworking') === 'True';
    const nestedVirt = getCap('NestedVirtualization') === 'True';
    const ephemeralOS = getCap('EphemeralOS') === 'True';
    const encryptionAtHost = getCap('EncryptionAtHost') === 'True';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 hover:shadow-2xl transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 group-hover:from-cyan-300 group-hover:to-purple-300 transition-all">
                        {sku.name}
                    </h3>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{sku.tier} Tier</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end max-w-[50%]">
                    {premiumIO && (
                        <Tooltip content="Premium Storage: Support for high-performance Premium SSD and Ultra Disk storage.">
                            <div className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 cursor-help">
                                <Database className="w-3" />
                                <span>SSD</span>
                            </div>
                        </Tooltip>
                    )}
                    {accelNet && (
                        <Tooltip content="Accelerated Networking: High-performance, low-latency networking.">
                            <div className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1 cursor-help">
                                <Zap className="w-3" />
                                <span>Net</span>
                            </div>
                        </Tooltip>
                    )}
                    {nestedVirt && (
                        <Tooltip content="Nested Virtualization: Run Hyper-V/Docker inside VM.">
                            <div className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 cursor-help">
                                <Layers className="w-3" />
                                <span>Nest</span>
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">vCPUs</p>
                        <p className="font-semibold text-white">{vCPUs}</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">RAM</p>
                        <p className="font-semibold text-white">{memory} GB</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Max Disks</p>
                        <p className="font-semibold text-white">{maxDisks}</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        {/* Using Cpu icon as generic placeholder for interface if needed, or import Network */}
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">NICs</p>
                        <p className="font-semibold text-white">{maxNics}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                    {/* Family Icon */}
                </span>
                <span className="text-gray-400 flex items-center gap-2">
                    Family: {sku.family}
                </span>

                <div className="flex items-center gap-2">
                    {ephemeralOS && (
                        <div title="Ephemeral OS Disk: OS disk is created on local temp storage, providing faster read/write and zero cost, but data is lost on deallocate.">
                            <HardDrive className="w-4 h-4 text-emerald-400" />
                        </div>
                    )}
                    {encryptionAtHost && (
                        <div title="Encryption at Host: Data is encrypted on the VM's physical host before it's sent to storage, ensuring end-to-end security.">
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                        </div>
                    )}
                </div>
                <span className="flex items-center gap-1 font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    $ {getCap(os === 'windows' ? 'PricePerHourWindows' : 'PricePerHourLinux') !== '-' ? parseFloat(getCap(os === 'windows' ? 'PricePerHourWindows' : 'PricePerHourLinux')).toFixed(4) : 'N/A'}/hr
                </span>
            </div>
        </motion.div>
    );
}

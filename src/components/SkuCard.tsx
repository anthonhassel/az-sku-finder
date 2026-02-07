import type { AzureSku } from '../types';
import { Cpu, Database, HardDrive, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkuCardProps {
    sku: AzureSku;
}

export function SkuCard({ sku }: SkuCardProps) {
    const getCap = (name: string) => sku.capabilities.find(c => c.name === name)?.value || '-';
    const vCPUs = getCap('vCPUs');
    const memory = getCap('MemoryGB');
    const premiumIO = getCap('PremiumIO') === 'True';

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
                {premiumIO && (
                    <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Premium IO</span>
                    </div>
                )}
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
                        <p className="font-semibold text-white">{getCap('MaxDataDisks')}</p>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        {/* Using Cpu icon as generic placeholder for interface if needed, or import Network */}
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">NICs</p>
                        <p className="font-semibold text-white">{getCap('MaxNICs')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-sm text-gray-400">
                <span className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Family: {sku.family}
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    $ {getCap('PricePerHour') !== '-' ? parseFloat(getCap('PricePerHour')).toFixed(4) : 'N/A'}/hr
                </span>
            </div>
        </motion.div>
    );
}

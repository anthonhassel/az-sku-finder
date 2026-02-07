import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/authService';
import type { AzureCredentials } from '../services/authService';
import { Lock, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export function SettingsModal({ isOpen, onClose, onLoginSuccess }: SettingsModalProps) {
    const [creds, setCreds] = useState<AzureCredentials>({
        tenantId: '',
        clientId: '',
        clientSecret: '',
        subscriptionId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const saved = AuthService.getCredentials();
        if (saved) setCreds(saved);
    }, [isOpen]);

    const handleChange = (key: keyof AzureCredentials, value: string) => {
        setCreds(prev => ({ ...prev, [key]: value }));
        setError(null);
    };

    const handleSaveAndConnect = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate inputs
            if (!creds.tenantId || !creds.clientId || !creds.clientSecret || !creds.subscriptionId) {
                throw new Error('All fields are required');
            }

            // Test connection
            await AuthService.login(creds);

            // Save if successful
            AuthService.saveCredentials(creds);
            setSuccess(true);
            setTimeout(() => {
                onLoginSuccess();
                onClose();
            }, 1000);

        } catch (err: any) {
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#1a1b2e] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-pink-500" />
                            Connect Azure
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-400 mb-4">
                            Enter your Service Principal credentials. These are saved locally in your browser.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Subscription ID</label>
                                <input
                                    type="text"
                                    value={creds.subscriptionId}
                                    onChange={(e) => handleChange('subscriptionId', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none transition-colors"
                                    placeholder="00000000-0000-0000-0000-000000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tenant ID</label>
                                <input
                                    type="text"
                                    value={creds.tenantId}
                                    onChange={(e) => handleChange('tenantId', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none transition-colors"
                                    placeholder="Directory (Tenant) ID"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Client ID</label>
                                <input
                                    type="text"
                                    value={creds.clientId}
                                    onChange={(e) => handleChange('clientId', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none transition-colors"
                                    placeholder="Application (Client) ID"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Client Secret</label>
                                <input
                                    type="password"
                                    value={creds.clientSecret}
                                    onChange={(e) => handleChange('clientSecret', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none transition-colors"
                                    placeholder="Client OAuth Secret"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-3 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Connected successfully!
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0">
                        <button
                            onClick={handleSaveAndConnect}
                            disabled={loading || success}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${success
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : success ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Connect
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

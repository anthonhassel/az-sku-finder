import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute bottom-full mb-2 z-50 min-w-[200px] max-w-xs px-3 py-2 text-xs text-white bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 pointer-events-none"
                    >
                        {/* Tiny triangle pointer */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 border-r border-b border-white/10"></div>

                        <p className="relative z-10 leading-relaxed text-center">
                            {content}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

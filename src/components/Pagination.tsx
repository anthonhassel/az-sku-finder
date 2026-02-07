import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="bg-black/40 rounded-lg p-1 flex items-center gap-1 border border-white/10">
            <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono text-gray-400 min-w-[60px] text-center">
                {page} / {totalPages || 1}
            </span>
            <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}

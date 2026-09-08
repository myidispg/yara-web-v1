export default function ImageFallback({ onClick, className, heightClass = "h-full" }) {
    return (
        <div
            onClick={onClick}
            className={`relative w-full ${heightClass} overflow-hidden bg-gradient-to-br from-[#FAF9F6] to-[#E5BDB0]/30 border border-[#E5BDB0]/50 flex flex-col items-center justify-center cursor-pointer group`}
        >
            <svg className="w-10 h-10 text-[#1A2536]/25 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#1A2536]/40 font-bold">Image unavailable</span>
        </div>
    );
}
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <span className="font-serif-luxury text-9xl text-[#B86B5A] tracking-widest">404</span>
      <h1 className="font-serif-luxury text-4xl text-[#1A2536] mt-4 mb-2">Page Not Found</h1>
      <p className="text-sm text-[#1A2536]/60 max-w-md mb-8 leading-relaxed">
        The diamond you are looking for has been misplaced or never existed. 
        Let's get you back to the collection.
      </p>
      <Link
        href="/"
        className="px-8 py-3.5 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-lg"
      >
        Return to Store
      </Link>
    </div>
  );
}
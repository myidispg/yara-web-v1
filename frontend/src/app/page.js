export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center p-12 bg-white rounded-2xl shadow-card border border-line max-w-xl mx-4">
        <p className="eyebrow mb-4">Next.js Migration</p>
        <h1 className="font-serif text-5xl text-ink mb-4">YA-RA Jewels</h1>
        <p className="text-ink/60 max-w-md mx-auto leading-relaxed">
          The Next.js App Router is live. Tailwind design tokens (ink, cream, gold) and your
          serif/sans fonts are fully active.
        </p>
        <button className="btn-solid mt-8">Test Button Style</button>
      </div>
    </div>
  );
}
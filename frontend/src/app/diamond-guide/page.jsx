import Link from "next/link";
import { generateSEO } from '@/lib/seo';

export const metadata = generateSEO({
  title: "Diamond Guide | YA-RA Jewels",
  description: 'Understand the 4Cs, diamond shapes and certification. Every YA-RA diamond is natural, earth-mined and IGI, GIA or SGL certified.',
});

const CUT_GRADES = [
  ["Excellent / Ideal", "Maximum light return. The grade YA-RA works with."],
  ["Very Good", "High brilliance, slightly more forgiving proportions."],
  ["Good", "Solid light return with visible compromise under scrutiny."],
  ["Fair & Poor", "Light escapes through the sides and bottom. We do not use these."],
];

const CLARITY_GRADES = [
  ["FL – IF", "Flawless / Internally Flawless. No inclusions visible at 10× magnification. Exceptionally rare."],
  ["VVS1 – VVS2", "Very, Very Slightly Included. Minute inclusions extremely difficult for a skilled grader to see at 10×."],
  ["VS1 – VS2", "Very Slightly Included. Minor inclusions difficult to somewhat easy to see at 10×, invisible to the naked eye."],
  ["SI1 – SI2", "Slightly Included. Inclusions noticeable at 10× and sometimes visible to the unaided eye."],
  ["I1 – I3", "Included. Obvious inclusions that can affect transparency and brilliance. Not used at YA-RA."],
];

const COLOUR_GRADES = [
  ["D – F", "Colourless. Rare, and the most valuable band on the scale."],
  ["G – J", "Near colourless. Faces up white to the naked eye — excellent value."],
  ["K – M", "Faint. A warm tint becomes perceptible, especially in larger stones."],
  ["N – Z", "Very Light to Light. Noticeably tinted. Not used at YA-RA."],
];

const SHAPES = [
  ["Round Brilliant", "58 facets engineered for maximum light return. The most brilliant shape, and the most in demand — which makes it the most expensive per carat."],
  ["Princess", "A square or slightly rectangular brilliant cut with sharp corners. Modern, geometric, and exceptionally sparkly."],
  ["Cushion", "Square to rectangular with softly rounded corners. A vintage silhouette with larger facets and a romantic, pillow-like glow."],
  ["Oval", "An elongated brilliant cut. Covers more finger width per carat than a round, making the stone appear larger."],
  ["Pear", "The teardrop — a fusion of round and marquise. Distinctive and elongating, best set with the point protected."],
  ["Emerald", "A step cut with long, flat facets. Creates a hall-of-mirrors effect that showcases clarity over fire."],
  ["Marquise", "An elongated shape with two pointed ends. Maximises perceived carat weight dramatically."],
  ["Heart", "The most demanding cut to execute well, requiring perfect symmetry. A romantic choice for solitaires."],
];

const TIPS = [
  ["Prioritise cut above all else", "Cut is the only C controlled entirely by human craftsmanship — and it drives up to most of a diamond's visual appeal. A superbly cut stone will face up brighter and can make its colour and clarity read better than their grades suggest. It is the single highest-leverage place to spend."],
  ["Buy just under the magic sizes", "Diamond prices jump at round-number carat weights (0.50, 0.75, 1.00, 1.50, 2.00). A 0.90 carat stone is visually near-identical to a 1.00 carat but priced meaningfully lower. The difference is imperceptible on the hand; it is very perceptible on the invoice."],
  ["Let the setting do some of the work", "A halo of small diamonds around the centre stone makes it read considerably larger and protects its girdle. Similarly, white gold or platinum can make a faint-tinted stone face up whiter, while yellow gold can warm it into harmony."],
  ["Round forgives the most", "If you are balancing the 4Cs against a budget, the round brilliant is the most effective at concealing both faint colour and minor inclusions. Fancy shapes — especially emerald and Asscher — show clarity more openly and benefit from a higher grade."],
  ["Match shape to the stone's size", "For centre stones above one carat, princess, cushion and emerald cuts carry their weight beautifully and often cost less per carat than an equivalent round. Below one carat, rounds and ovals tend to look larger than their actual weight."],
  ["Clarity matters less below one carat", "In stones under a carat, VS and SI1 inclusions are generally invisible without magnification. Direct that portion of the budget toward cut and colour, where the eye can actually register the difference."],
];

export default function CertificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <p className="text-xs text-[#1A2536]/50 mb-6">
        <Link href="/" className="hover:text-[#B86B5A]">Home</Link> / <Link href="/policies" className="hover:text-[#B86B5A]">Policies</Link> / Diamond Guide
      </p>

      {/* Header */}
      <div className="mb-10">
        <span className="font-cursive text-3xl text-[#B86B5A] block -mb-1">guaranteed authenticity</span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1A2536]">Diamond Guide</h1>
      </div>

      <div className="space-y-8 text-[#1A2536]/70 leading-relaxed">
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <p className="text-lg font-serif-luxury text-[#1A2536]">
            Every YA-RA diamond is 100% natural, earth-mined, and certified by the world's most respected gemological laboratories.
          </p>
        </section>

        {/* Understanding Diamonds */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Understanding Diamonds</h2>
          <p className="mb-4">
            A diamond is crystallised carbon, formed roughly 150 kilometres beneath the Earth's surface under pressures of
            around 725,000 pounds per square inch and temperatures above 2,000°F. Most stones that reach the surface today
            began their journey between one and three billion years ago — carried upward by violent volcanic activity through
            channels of kimberlite rock.
          </p>
          <p className="mb-4">
            That extraordinary origin is why no two diamonds are alike. Each carries its own fingerprint of trace elements and
            internal characteristics, formed under conditions that cannot be replicated by chance. Roughly one part in ten
            thousand of all diamonds mined qualifies as gem-grade at all.
          </p>
          <p>
            What makes a diamond singular among gemstones is how it handles light. Its crystal structure gives it the highest
            refractive index of any natural gem, so light entering the stone slows dramatically, bends, and — when the facets are
            correctly proportioned — returns to the viewer's eye rather than escaping. That return of light is what we perceive
            as brilliance, and it is entirely a function of cut quality.
          </p>
        </section>

        {/* The 4Cs */}
        <section>
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">The 4Cs</h2>
          <p className="mb-6">
            The 4Cs — Cut, Colour, Clarity and Carat — form the universal language of diamond quality, codified by the
            Gemological Institute of America in the mid-twentieth century. Before this system existed, dealers used a patchwork
            of regional terms. Today, a GIA-graded stone in Mumbai means precisely what it means in New York.
          </p>

          <div className="space-y-6">
            {/* Cut */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-serif-luxury italic text-3xl text-[#B86B5A]">01</span>
                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Cut</h3>
              </div>
              <p className="mb-4">
                Cut does not mean shape. It refers to how precisely a rough crystal was fashioned — its proportions, the symmetry
                of its facet arrangement, and the quality of its surface polish. These three factors determine whether light
                entering the stone is reflected back through the top as brilliance and fire, or leaks out through the pavilion.
                A stone cut too shallow lets light pass straight through the bottom; one cut too deep lets it escape through the
                sides. Cut is the only C determined by human hand rather than by nature, which makes it the one you have the
                most control over.
              </p>
              <div className="space-y-2">
                {CUT_GRADES.map(([grade, desc]) => (
                  <div key={grade} className="flex items-start gap-3">
                    <span className="text-[#B86B5A] shrink-0">◆</span>
                    <p className="text-sm"><strong className="text-[#1A2536]">{grade}:</strong> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-[#FBF7F2] rounded-2xl border border-[#E5BDB0]/60">
                <p className="text-sm">
                  <strong className="text-[#1A2536]">The YA-RA Standard:</strong> We craft Excellent and Ideal cut stones only.
                  A diamond's sparkle cannot be recovered later by any setting or metal — it is decided the moment the cutter
                  finishes the facets.
                </p>
              </div>
            </div>

            {/* Colour */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-serif-luxury italic text-3xl text-[#B86B5A]">02</span>
                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Colour</h3>
              </div>
              <p className="mb-4">
                Counter-intuitively, in white diamonds the highest grade is the absence of colour. Trace nitrogen absorbed during
                formation imparts a yellowish cast, and the scale runs from D (completely colourless) through to Z (noticeably
                tinted). Grading is done face-down against a neutral white background under controlled daylight-equivalent light,
                because face-up, the diamond's own brilliance masks subtle tint.
              </p>
              <p className="mb-4">
                The differences between adjacent grades are genuinely difficult for an untrained eye to detect — D and E are
                indistinguishable outside a grading laboratory. But they are measurable, and they are priced accordingly.
              </p>
              <div className="space-y-2">
                {COLOUR_GRADES.map(([grade, desc]) => (
                  <div key={grade} className="flex items-start gap-3">
                    <span className="text-[#B86B5A] shrink-0">◆</span>
                    <p className="text-sm"><strong className="text-[#1A2536]">{grade}:</strong> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-[#FBF7F2] rounded-2xl border border-[#E5BDB0]/60">
                <p className="text-sm">
                  <strong className="text-[#1A2536]">The YA-RA Standard:</strong> We work primarily in the H to J range, and occasionally K when it suits the piece. These colours offer the best balance of appearance and affordability — stones face up white to the naked eye while remaining sensibly priced.
                </p>
              </div>
            </div>

            {/* Clarity */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-serif-luxury italic text-3xl text-[#B86B5A]">03</span>
                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Clarity</h3>
              </div>
              <p className="mb-4">
                Clarity measures internal characteristics (inclusions) and surface characteristics (blemishes). Inclusions are
                not defects in the pejorative sense — they are mineral crystals, feathers, clouds and pinpoints trapped inside the
                stone as it grew, and they are the strongest evidence of natural origin. Their practical significance is optical:
                the more a light path is interrupted, the less brilliance returns to the eye.
              </p>
              <p className="mb-4">
                All clarity grading is performed under 10× magnification by a trained grader. This matters considerably — a VS1
                diamond is, to the naked eye, indistinguishable from a flawless one. You are paying for something only a loupe
                can reveal.
              </p>
              <div className="space-y-2">
                {CLARITY_GRADES.map(([grade, desc]) => (
                  <div key={grade} className="flex items-start gap-3">
                    <span className="text-[#B86B5A] shrink-0">◆</span>
                    <p className="text-sm"><strong className="text-[#1A2536]">{grade}:</strong> {desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 bg-[#FBF7F2] rounded-2xl border border-[#E5BDB0]/60">
                <p className="text-sm">
                  <strong className="text-[#1A2536]">The YA-RA Standard:</strong> We prefer VS to SI clarity grades, with SI being the more dominant. This range offers the perfect blend of sparkle and affordability — stones are clean to the naked eye and perform beautifully without the premium of higher grades.
                </p>
              </div>
            </div>

            {/* Carat */}
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-serif-luxury italic text-3xl text-[#B86B5A]">04</span>
                <h3 className="font-serif-luxury text-xl font-semibold text-[#1A2536]">Carat</h3>
              </div>
              <p className="mb-4">
                A carat is a unit of weight, not size — one carat equals exactly 0.2 grams, subdivided into 100 points. The term
                derives from the carob seed, which ancient traders used as a counterweight because of its remarkably uniform mass.
                Note that carat measures weight while karat measures gold purity; the two are unrelated despite the similar spelling.
              </p>
              <p className="mb-4">
                Because two diamonds of identical carat weight can differ enormously in price depending on the other three Cs,
                carat should always be considered last. And because larger crystals are exponentially rarer than smaller ones,
                price per carat rises steeply with size — a two-carat stone of a given quality costs considerably more than twice
                a one-carat stone of the same quality.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-[#B86B5A] shrink-0">◆</span>
                  <p className="text-sm"><strong className="text-[#1A2536]">0.20 – 0.50 ct:</strong> Subtle everyday elegance. Ideal for stackable bands and daily-wear studs.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#B86B5A] shrink-0">◆</span>
                  <p className="text-sm"><strong className="text-[#1A2536]">0.50 – 1.00 ct:</strong> The most popular range. Balanced presence without statement weight.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#B86B5A] shrink-0">◆</span>
                  <p className="text-sm"><strong className="text-[#1A2536]">1.00 ct and above:</strong> Statement and heirloom territory, where rarity begins to compound sharply.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diamond Shapes */}
        <section>
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Diamond Shapes</h2>
          <p className="mb-6">
            Shape is the outline of the finished stone as viewed from above. It is a matter of personal style rather than quality —
            but it does affect both brilliance and price. The round brilliant commands the highest price per carat because it
            reflects light most efficiently and because more rough is lost in cutting it. Fancy shapes typically cost less per
            carat at the same colour and clarity, and several of them face up larger than a round of equal weight.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SHAPES.map(([name, desc]) => (
              <div key={name} className="glass-card-vibrant rounded-2xl border border-[#E5BDB0] p-5">
                <h3 className="font-serif-luxury text-lg font-semibold text-[#1A2536] mb-2">{name}</h3>
                <p className="text-xs text-[#1A2536]/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Buying Wisdom */}
        <section>
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Buying Wisdom</h2>
          <p className="mb-6">
            Practical principles we share openly with every client — the same guidance our own consultants work from.
          </p>
          <div className="space-y-4">
            {TIPS.map(([title, body]) => (
              <div key={title} className="glass-card-vibrant rounded-2xl border-l-4 border-[#D4AF37] p-5 sm:p-6">
                <h3 className="font-bold text-[#1A2536] mb-2">{title}</h3>
                <p className="text-sm text-[#1A2536]/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Natural vs Lab-Grown */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Natural vs Lab-Grown</h2>
          <p className="mb-5">
            Lab-grown diamonds are chemically and optically identical to natural ones — they are carbon in the same crystal
            structure. The distinction is one of origin and scarcity, not composition, which is precisely why the two diverge so
            sharply in long-term value.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-[#1A2536] mb-3">Natural, Earth-Mined</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Formed over one to three billion years</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Finite and depleting supply</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Holds value; historically appreciates</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Each stone carries a unique natural fingerprint</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Genuine heirloom and resale market</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#1A2536] mb-3">Lab-Grown</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Produced in weeks by CVD or HPHT process</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Supply limited only by manufacturing capacity</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Resale value minimal and declining</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>Indistinguishable without laboratory testing</span></li>
                <li className="flex items-start gap-3"><span className="text-[#B86B5A] shrink-0">◆</span><span>No scarcity to underpin long-term worth</span></li>
              </ul>
            </div>
          </div>
          <p className="mt-5 text-sm font-bold text-[#B86B5A]">
            YA-RA works exclusively with natural, earth-mined diamonds. No lab-grown stones, no simulants, no exceptions.
          </p>
        </section>

        {/* Certification Partners */}
        <section>
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">Our Certification Partners</h2>
          <p className="mb-6">
            A certificate is your diamond's birth record — an independent, third-party assessment of its exact characteristics
            by a laboratory with no commercial interest in the sale. It is the only document that lets you verify what you own.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">IGI</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">International Gemological Institute</p>
              <p className="text-xs text-[#1A2536]/60">
                One of the world's largest independent diamond grading laboratories,
                known for consistent and reliable grading.
              </p>
            </div>

            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">GIA</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">Gemological Institute of America</p>
              <p className="text-xs text-[#1A2536]/60">
                The world's foremost authority on diamonds, creator of the 4Cs
                grading system used globally.
              </p>
            </div>

            <div className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6">
              <h3 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-3">SGL</h3>
              <p className="text-sm font-bold text-[#B86B5A] mb-4">Solitaire Gemmological Laboratory</p>
              <p className="text-xs text-[#1A2536]/60">
                India's leading diamond certification laboratory, providing
                accurate and detailed grading reports.
              </p>
            </div>
          </div>
        </section>

        {/* What Your Certificate Includes */}
        <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">What Your Certificate Includes</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] shrink-0">◆</span>
              <span><strong className="text-[#1A2536]">4Cs Analysis:</strong> Detailed carat weight, cut grade, colour grade, and clarity grade</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] shrink-0">◆</span>
              <span><strong className="text-[#1A2536]">Measurements:</strong> Precise dimensions, table percentage, crown and pavilion angles, and depth percentage</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] shrink-0">◆</span>
              <span><strong className="text-[#1A2536]">Fluorescence:</strong> Presence and intensity of fluorescence under ultraviolet light</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] shrink-0">◆</span>
              <span><strong className="text-[#1A2536]">Origin Declaration:</strong> Confirmation that the stone is natural and earth-mined</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B86B5A] shrink-0">◆</span>
              <span><strong className="text-[#1A2536]">Security Features:</strong> Laser inscription on the girdle, holograms, and a unique certificate number</span>
            </li>
          </ul>
        </section>

        {/* Verify Your Certificate */}
        {/* <section className="glass-card-vibrant rounded-3xl border border-[#E5BDB0] p-6 sm:p-8">
          <h2 className="font-serif-luxury text-2xl font-semibold text-[#1A2536] mb-4">Verify Your Certificate</h2>
          <p className="mb-4">
            You can verify any YA-RA diamond certificate online using the unique certificate
            number found on your documentation and laser-inscribed on the diamond's girdle.
          </p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-[#1A2536] hover:bg-[#111A29] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-xl">
            Request Certificate Verification →
          </Link>
        </section> */}
      </div>
    </div>
  );
}
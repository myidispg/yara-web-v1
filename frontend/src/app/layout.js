import "./globals.css";
import Providers from "@/components/Providers";
import { Playfair_Display, Poppins } from "next/font/google";

// Load Playfair Display for headings (serif)
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap",
});

// Load Poppins for body text and UI elements (sans)
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "YA-RA Jewels | Luxury Natural Diamond Jewellery",
  description: "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold. Certified, hallmarked, and insured.",
  // Ported directly from your old index.html
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90' fill='%23c19a4b'%3E◆%3C/text%3E%3C/svg%3E"
  }
};

export default function RootLayout({ children }) {
  return (
    // Apply the font variables to the root HTML element
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="bg-cream text-ink antialiased font-sans">
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
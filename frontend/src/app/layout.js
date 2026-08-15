import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Playfair_Display, Poppins } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "YA-RA Jewels | Luxury Natural Diamond Jewellery",
  description: "Handcrafted natural diamond jewellery in 14Kt & 18Kt solid gold. Certified, hallmarked, and insured.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90' fill='%23c19a4b'%3E◆%3C/text%3E%3C/svg%3E"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="bg-cream text-ink antialiased font-sans">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
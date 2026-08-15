import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";

// Fetch product directly from Django on the server
async function getProduct(slug) {
  try {
    const res = await fetch(`http://localhost:8000/api/products/${slug}/`, { 
      cache: "no-store" // Ensures we always get fresh stock data
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Dynamic SEO Metadata (Replaces usePageTitle)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product ? `${product.name} | YA-RA Jewels` : "Product Not Found",
    description: product?.description || "Luxury natural diamond jewellery.",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) notFound();

  // Pass the fully fetched product to the interactive Client Component
  return <ProductClient product={product} />;
}
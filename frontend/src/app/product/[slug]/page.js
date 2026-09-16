import ProductClient from "@/components/ProductClient";
import { notFound } from "next/navigation";
import { generateSEO, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch product directly from Django on the server
async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}/`, {
      cache: "no-store" // Ensures we always get fresh stock data
    });
    if (!res.ok) return null;
    
    const product = await res.json();
    
    // The backend DesignDetailSerializer already includes parent_category_slug 
    // at the root level of the JSON response. We don't need to extract it manually.
    // (product.category is just an ID, so manual extraction was overwriting it with null!)
    
    return product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return generateSEO({ title: 'Product Not Found', noindex: true });
  }

  return generateSEO({
    title: product.name,
    description: product.description || `Shop ${product.name} - ${product.category_name}. Crafted in hallmarked gold with certified natural diamonds.`,
    image: product.media?.[0]?.url,
    url: `${SITE_URL}/product/${slug}`,
    type: 'product',
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const productUrl = `${SITE_URL}/product/${slug}`;

  return (
    <>
      {/* Product structured data for Google Shopping rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(product, productUrl)),
        }}
      />
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: product.category_name, url: `${SITE_URL}/category/${product.category_slug}` },
            { name: product.name, url: productUrl },
          ])),
        }}
      />
      <ProductClient product={product} />
    </>
  );
}
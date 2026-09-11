export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/policies',
    '/privacy',
    '/buyback',
    '/certification',
    '/size-guide',
    '/tips',
    '/showroom',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : 0.7,
  }));

  let categoryPages = [];
  try {
    const res = await fetch(`${apiUrl}/api/categories/`, { 
      next: { revalidate: 3600 } 
    });
    if (res.ok) {
      const categories = await res.json();
      categoryPages = (categories.results || categories || [])
        .filter(c => c.is_active)
        .map(c => ({
          url: `${baseUrl}/category/${c.slug}`,
          lastModified: new Date(c.updated_at || c.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error('Failed to fetch categories for sitemap:', err);
  }

  let productPages = [];
  try {
    const res = await fetch(`${apiUrl}/api/products/?limit=1000`, { 
      next: { revalidate: 3600 } 
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.results || data || [];
      productPages = products
        .filter(p => p.is_active !== false)
        .map(p => ({
          url: `${baseUrl}/product/${p.slug}`,
          lastModified: new Date(p.updated_at || p.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.9,
        }));
    }
  } catch (err) {
    console.error('Failed to fetch products for sitemap:', err);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
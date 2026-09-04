export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/control/', '/checkout/', '/auth/', '/cart/', '/account/', '/search'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
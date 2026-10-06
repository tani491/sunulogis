import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/sunu-portail-gestion', '/sunu-portail-gestion/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}

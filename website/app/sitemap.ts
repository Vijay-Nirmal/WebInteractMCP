import { MetadataRoute } from 'next'
import { getBlogPosts, getDocPages, getVersions } from '../lib/content'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://webinteractmcp.com'
  const currentDate = new Date().toISOString()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ]

  // Blog posts
  const blogPosts = await getBlogPosts()
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date || currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Documentation pages
  const versions = await getVersions()
  const docPages: MetadataRoute.Sitemap = []
  
  if (versions.length > 0) {
    for (const version of versions) {
      // Add version index page
      docPages.push({
        url: `${baseUrl}/docs/${version.version}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: version.isLatest ? 0.95 : 0.8,
      })
      
      // Add individual doc pages
      const docs = await getDocPages(version.version)
      for (const doc of docs) {
        docPages.push({
          url: `${baseUrl}/docs/${version.version}/${doc.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: version.isLatest ? 0.9 : 0.7,
        })
      }
    }
  }

  return [...staticPages, ...blogPages, ...docPages]
}

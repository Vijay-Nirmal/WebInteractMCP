import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getAllBlogSlugs } from '../../../lib/content'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} - WebIntract MCP Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Back to blog */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Article header */}
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {post.title}
          </h1>
          
          <div className="mt-6 flex items-center gap-x-4 text-sm text-gray-600 dark:text-gray-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.author && (
              <>
                <span>•</span>
                <span>By {post.author}</span>
              </>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900/20 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 ring-1 ring-inset ring-primary-700/10 dark:ring-primary-300/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article content */}
        <div className="mx-auto mt-16 max-w-none">
          <div 
            className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:text-primary-600 dark:prose-code:text-primary-400"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Navigation */}
        <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}

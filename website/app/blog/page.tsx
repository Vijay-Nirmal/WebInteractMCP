import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPosts } from '../../lib/content'

export const metadata: Metadata = {
  title: 'Blog - WebInteract MCP',
  description: 'Latest news, tutorials, and insights about WebInteract MCP and the Model Context Protocol ecosystem.',
}

export default async function BlogIndex() {
  const posts = await getBlogPosts()

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Blog
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Latest news, tutorials, and insights about WebInteract MCP and the Model Context Protocol ecosystem.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No blog posts yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Check back soon for updates and tutorials!
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                  <time dateTime={post.date} className="mr-8">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  {post.author && (
                    <div className="-ml-4 flex items-center gap-x-4">
                      <svg viewBox="0 0 2 2" className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50">
                        <circle cx={1} cy={1} r={1} />
                      </svg>
                      <div className="flex gap-x-2.5">
                        <span className="text-white">{post.author}</span>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {post.excerpt}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-md bg-gray-50/10 px-2 py-1 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-500/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

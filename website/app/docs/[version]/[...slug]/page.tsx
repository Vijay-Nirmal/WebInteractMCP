import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocPage, getVersions, getAllDocSlugs } from '../../../../lib/content'
import DocsSidebar from '../../../../components/DocsSidebar'
import TableOfContents from '../../../../components/TableOfContents'

type Props = {
  params: { version: string; slug: string[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.join('/')
  const doc = await getDocPage(params.version, slug)
  
  if (!doc) {
    return {
      title: 'Documentation Not Found',
    }
  }

  return {
    title: `${doc.title} - WebIntract MCP Documentation`,
    description: `WebIntract MCP documentation: ${doc.title}`,
  }
}

export async function generateStaticParams() {
  const versions = await getVersions()
  const allParams = []

  for (const version of versions) {
    const slugs = getAllDocSlugs(version.version)
    for (const slug of slugs) {
      allParams.push({
        version: version.version,
        slug: slug.split('/'),
      })
    }
  }

  return allParams
}

export default async function DocPage({ params }: Props) {
  const slug = params.slug.join('/')
  const doc = await getDocPage(params.version, slug)
  const versions = await getVersions()
  const currentVersion = versions.find(v => v.version === params.version)

  if (!doc || !currentVersion) {
    notFound()
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <DocsSidebar currentVersion={params.version} currentSlug={slug} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <li>
                  <Link href="/docs" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link 
                    href={`/docs/${params.version}`}
                    className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {currentVersion.label}
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="text-gray-900 dark:text-white font-medium">
                  {doc.title}
                </li>
              </ol>
            </nav>

            <div className="flex gap-8">
              {/* Article content */}
              <div className="flex-1 min-w-0">
                <article>
                  <header>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {doc.title}
                    </h1>
                    {doc.category && (
                      <div className="mt-4">
                        <span className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900/20 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 ring-1 ring-inset ring-primary-700/10 dark:ring-primary-300/10">
                          {doc.category}
                        </span>
                      </div>
                    )}
                  </header>

                  <div 
                    className="mt-8 prose prose-lg prose-gray dark:prose-invert max-w-none 
                               prose-headings:text-gray-900 dark:prose-headings:text-white 
                               prose-a:text-primary-600 dark:prose-a:text-primary-400 
                               prose-code:text-primary-600 dark:prose-code:text-primary-400 
                               prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800
                               prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                               prose-blockquote:border-l-primary-600 dark:prose-blockquote:border-l-primary-400
                               [&_h1]:!text-gray-900 [&_h1]:dark:!text-white
                               [&_h2]:!text-gray-900 [&_h2]:dark:!text-white
                               [&_h3]:!text-gray-900 [&_h3]:dark:!text-white
                               [&_h4]:!text-gray-900 [&_h4]:dark:!text-white
                               [&_h5]:!text-gray-900 [&_h5]:dark:!text-white
                               [&_h6]:!text-gray-900 [&_h6]:dark:!text-white
                               [&_.heading-link]:!text-gray-900 [&_.heading-link]:dark:!text-white
                               [&_.heading-link]:!no-underline [&_.heading-link]:hover:!no-underline
                               [&_h1_a]:!text-gray-900 [&_h1_a]:dark:!text-white [&_h1_a]:!no-underline
                               [&_h2_a]:!text-gray-900 [&_h2_a]:dark:!text-white [&_h2_a]:!no-underline
                               [&_h3_a]:!text-gray-900 [&_h3_a]:dark:!text-white [&_h3_a]:!no-underline
                               [&_h4_a]:!text-gray-900 [&_h4_a]:dark:!text-white [&_h4_a]:!no-underline
                               [&_h5_a]:!text-gray-900 [&_h5_a]:dark:!text-white [&_h5_a]:!no-underline
                               [&_h6_a]:!text-gray-900 [&_h6_a]:dark:!text-white [&_h6_a]:!no-underline"
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                  />
                </article>

                {/* Navigation */}
                <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex justify-between">
                    <Link
                      href={`/docs/${params.version}`}
                      className="inline-flex items-center rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      Documentation Index
                    </Link>

                    <div className="flex space-x-4">
                      <Link
                        href="https://github.com/Vijay-Nirmal/WebIntractMCP/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Report Issue
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of contents */}
              {doc.tableOfContents && doc.tableOfContents.length > 0 && (
                <TableOfContents items={doc.tableOfContents} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

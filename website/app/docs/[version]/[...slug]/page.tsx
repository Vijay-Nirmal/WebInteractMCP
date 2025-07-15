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
    <div className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <DocsSidebar currentVersion={params.version} currentSlug={slug} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Navigation Info */}
            <div className="lg:hidden mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Use the sidebar menu to navigate between documentation pages
                  </span>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 overflow-x-auto">
                <li className="whitespace-nowrap">
                  <Link href="/docs" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="whitespace-nowrap">
                  <Link 
                    href={`/docs/${params.version}`}
                    className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {currentVersion.label}
                  </Link>
                </li>
                <li>
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                  {doc.title}
                </li>
              </ol>
            </nav>

            <div className="xl:flex xl:gap-8">
              {/* Mobile Table of Contents */}
              {doc.tableOfContents && doc.tableOfContents.length > 0 && (
                <div className="xl:hidden mb-6">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        On this page
                      </div>
                      <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                      <div className="max-h-96 overflow-y-auto p-2">
                        <nav className="space-y-1">
                          {doc.tableOfContents.map((item) => (
                            <div key={item.id}>
                              <a
                                href={`#${item.id}`}
                                className={`block py-2 px-3 text-sm border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${
                                  item.level === 1
                                    ? 'pl-3 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
                                    : item.level === 2
                                    ? 'pl-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    : 'pl-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                              >
                                {item.title}
                              </a>
                              {item.children && item.children.map((child) => (
                                <div key={child.id}>
                                  <a
                                    href={`#${child.id}`}
                                    className={`block py-2 px-3 text-sm border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${
                                      child.level === 1
                                        ? 'pl-3 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
                                        : child.level === 2
                                        ? 'pl-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                        : 'pl-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                  >
                                    {child.title}
                                  </a>
                                  {child.children && child.children.map((grandChild) => (
                                    <a
                                      key={grandChild.id}
                                      href={`#${grandChild.id}`}
                                      className={`block py-2 px-3 text-sm border-l-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${
                                        grandChild.level === 1
                                          ? 'pl-3 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
                                          : grandChild.level === 2
                                          ? 'pl-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                          : 'pl-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                      }`}
                                    >
                                      {grandChild.title}
                                    </a>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Article content */}
              <div className="flex-1 min-w-0">
                <article>
                  <header>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
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
                    className="mt-6 sm:mt-8 prose prose-sm sm:prose-base prose-gray dark:prose-invert max-w-none 
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
                               [&_h6_a]:!text-gray-900 [&_h6_a]:dark:!text-white [&_h6_a]:!no-underline
                               [&_.table-container]:overflow-x-auto [&_.table-container]:border 
                               [&_.table-container]:border-gray-200 [&_.table-container]:dark:border-gray-700 
                               [&_.table-container]:rounded-lg [&_.table-container]:my-6
                               [&_.table-container_table]:!my-0 [&_.table-container_table]:!border-0
                               [&_.table-container_table]:!rounded-none"
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                  />
                </article>

                {/* Navigation */}
                <div className="mt-12 sm:mt-16 border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <Link
                      href={`/docs/${params.version}`}
                      className="inline-flex items-center justify-center sm:justify-start rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      Documentation Index
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:space-x-4 gap-2 sm:gap-0">
                      <Link
                        href="https://github.com/Vijay-Nirmal/WebIntractMCP/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center sm:justify-start text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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

              {/* Table of contents - Hidden on mobile and tablet, shown on desktop */}
              {doc.tableOfContents && doc.tableOfContents.length > 0 && (
                <div className="hidden xl:block">
                  <TableOfContents items={doc.tableOfContents} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

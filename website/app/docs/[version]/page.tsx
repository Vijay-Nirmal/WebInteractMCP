import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVersions, getDocPages } from '../../../lib/content'
import DocsSidebar from '../../../components/DocsSidebar'

type Props = {
  params: { version: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const versions = await getVersions()
  const version = versions.find(v => v.version === params.version)
  
  if (!version) {
    return {
      title: 'Documentation Not Found',
    }
  }

  return {
    title: `Documentation ${version.label} - WebIntract MCP`,
    description: `WebIntract MCP documentation for version ${version.label}. Learn how to transform web applications into MCP servers.`,
  }
}

export async function generateStaticParams() {
  const versions = await getVersions()
  return versions.map((version) => ({
    version: version.version,
  }))
}

export default async function DocsVersionIndex({ params }: Props) {
  const versions = await getVersions()
  const currentVersion = versions.find(v => v.version === params.version)
  
  if (!currentVersion) {
    notFound()
  }

  const docs = await getDocPages(params.version)
  
  // Group docs by category
  const groupedDocs = docs.reduce((acc, doc) => {
    const category = doc.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(doc)
    return acc
  }, {} as Record<string, typeof docs>)

  // Sort categories and docs
  const sortedCategories = Object.keys(groupedDocs).sort()
  Object.values(groupedDocs).forEach(categoryDocs => {
    categoryDocs.sort((a, b) => (a.order || 999) - (b.order || 999))
  })

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <DocsSidebar currentVersion={params.version} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Documentation
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Complete guide to WebIntract MCP - transform your web applications into MCP servers.
              </p>
              
              {/* Version selector */}
              <div className="mt-8">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Version:</span>
                  <div className="flex space-x-2">
                    {versions.map((version) => (
                      <Link
                        key={version.version}
                        href={`/docs/${version.version}`}
                        className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          version.version === params.version
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {version.label}
                        {version.isLatest && (
                          <span className="ml-1 text-xs text-primary-600 dark:text-primary-400">
                            (Latest)
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick start */}
              <div className="mt-16">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Quick Start
                    </h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Get up and running with WebIntract MCP in minutes. Choose your framework and follow our step-by-step guides.
                    </p>
                    
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Link
                        href={`/docs/${params.version}/quickstart/angular`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-2xl">🅰️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">Angular</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Angular 20+</p>
                        </div>
                      </Link>

                      <Link
                        href={`/docs/${params.version}/quickstart/react`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-2xl">⚛️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">React</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">React 18+</p>
                        </div>
                      </Link>

                      <Link
                        href={`/docs/${params.version}/quickstart/vue`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-2xl">💚</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">Vue</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vue 3+</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-6">
                    <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                      💡 Need Help?
                    </h3>
                    <p className="mt-2 text-sm text-primary-700 dark:text-primary-300">
                      Check out our examples, join the community discussions, or reach out for support.
                    </p>
                    <div className="mt-4 space-y-2">
                      <Link
                        href={`/docs/${params.version}/examples`}
                        className="block text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        → View Examples
                      </Link>
                      <Link
                        href="/contact"
                        className="block text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        → Get Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation sections */}
              {docs.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
                    All Documentation
                  </h2>
                  
                  <div className="space-y-12">
                    {sortedCategories.map((category) => (
                      <div key={category}>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedDocs[category].map((doc) => (
                            <Link
                              key={doc.slug}
                              href={`/docs/${params.version}/${doc.slug}`}
                              className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
                            >
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {doc.title}
                              </h4>
                              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                                Read documentation
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

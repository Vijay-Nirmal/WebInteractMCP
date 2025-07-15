import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getVersions, getDocPages } from '../../../lib/content'
import DocsSidebar from '../../../components/DocsSidebar'

type Props = {
  params: Promise<{ version: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version } = await params
  const versions = await getVersions()
  const versionData = versions.find(v => v.version === version)
  
  if (!versionData) {
    return {
      title: 'Documentation Not Found',
    }
  }

  return {
    title: `Documentation ${versionData.label} - WebInteract MCP`,
    description: `WebInteract MCP documentation for version ${versionData.label}. Learn how to transform web applications into MCP servers.`,
  }
}

export async function generateStaticParams() {
  const versions = await getVersions()
  return versions.map((version) => ({
    version: version.version,
  }))
}

export default async function DocsVersionIndex({ params }: Props) {
  const { version } = await params
  const versions = await getVersions()
  const currentVersion = versions.find(v => v.version === version)
  
  if (!currentVersion) {
    notFound()
  }

  const docs = await getDocPages(version)
  
  // Group docs by category
  const groupedDocs = docs.reduce((acc, doc) => {
    const category = doc.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(doc)
    return acc
  }, {} as Record<string, typeof docs>)

  // Sort categories using the same order as the sidebar
  const categoryOrder = [
    'Introduction',
    'Quick Start Guides', 
    'Configuration',
    'Examples',
    'API Reference',
    'Reference',
    'Deployment',
    'Help',
    'General'
  ]
  
  const sortedCategories = Object.keys(groupedDocs).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    
    // If both categories are in the order array, sort by their order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // If neither is in the order array, sort alphabetically
    return a.localeCompare(b)
  })
  
  Object.values(groupedDocs).forEach(categoryDocs => {
    categoryDocs.sort((a, b) => (a.order || 999) - (b.order || 999))
  })

  return (
    <div className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <DocsSidebar currentVersion={version} />
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
                    On mobile, use the browser's menu to navigate between documentation pages
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Documentation
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600 dark:text-gray-300">
                Complete guide to WebInteract MCP - transform your web applications into MCP servers.
              </p>
              
              {/* Version selector */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Version:</span>
                  <div className="flex flex-wrap gap-2">
                    {versions.map((versionItem) => (
                      <Link
                        key={versionItem.version}
                        href={`/docs/${versionItem.version}`}
                        className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          versionItem.version === version
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {versionItem.label}
                        {versionItem.isLatest && (
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
              <div className="mt-12 sm:mt-16">
                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Quick Start
                    </h2>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Get up and running with WebInteract MCP in minutes. Choose your framework and follow our step-by-step guides.
                    </p>
                    
                    <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Link
                        href={`/docs/${version}/quickstart/angular`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 sm:py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-xl sm:text-2xl">🅰️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Angular</span>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Angular 20+</p>
                        </div>
                      </Link>

                      <Link
                        href={`/docs/${version}/quickstart/react`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 sm:py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-xl sm:text-2xl">⚛️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">React</span>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">React 18+</p>
                        </div>
                      </Link>

                      <Link
                        href={`/docs/${version}/quickstart/vue`}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 sm:py-5 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-xl sm:text-2xl">💚</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Vue</span>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Vue 3+</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-900 dark:text-primary-100">
                      💡 Need Help?
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-primary-700 dark:text-primary-300">
                      Check out our examples, join the community discussions, or reach out for support.
                    </p>
                    <div className="mt-3 sm:mt-4 space-y-2">
                      <Link
                        href={`/docs/${version}/examples`}
                        className="block text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        → View Examples
                      </Link>
                      <Link
                        href="/contact"
                        className="block text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                      >
                        → Get Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation sections */}
              {docs.length > 0 && (
                <div className="mt-12 sm:mt-16">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 sm:mb-8">
                    All Documentation
                  </h2>
                  
                  <div className="space-y-8 sm:space-y-12">
                    {sortedCategories.map((category) => (
                      <div key={category}>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedDocs[category].map((doc) => (
                            <Link
                              key={doc.slug}
                              href={`/docs/${version}/${doc.slug}`}
                              className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
                            >
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {doc.title}
                              </h4>
                              <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <svg className="mr-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
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

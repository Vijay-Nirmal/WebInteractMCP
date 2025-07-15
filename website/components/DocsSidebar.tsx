import { getVersions, getDocPages, DocPage, Version } from '../lib/content'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface DocsSidebarProps {
  currentVersion: string
  currentSlug?: string
}

export default async function DocsSidebar({ currentVersion, currentSlug }: DocsSidebarProps) {
  const versions = await getVersions()
  const docs = await getDocPages(currentVersion)
  
  // Group docs by category and sort
  const groupedDocs = docs.reduce((acc: Record<string, DocPage[]>, doc: DocPage) => {
    const category = doc.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(doc)
    return acc
  }, {} as Record<string, DocPage[]>)

  // Sort categories and docs within categories
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
  
  Object.values(groupedDocs).forEach((categoryDocs: DocPage[]) => {
    categoryDocs.sort((a, b) => (a.order || 999) - (b.order || 999))
  })

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* Version Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Version
          </label>
          <div className="space-y-1">
            {versions.map((version: Version) => (
              <Link
                key={version.version}
                href={`/docs/${version.version}`}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${
                  version.version === currentVersion
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{version.label}</span>
                {version.isLatest && (
                  <span className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded">
                    Latest
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {category}
              </h3>
              <ul className="space-y-1">
                {groupedDocs[category].map((doc: DocPage) => (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${currentVersion}/${doc.slug}`}
                      className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                        currentSlug === doc.slug
                          ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="truncate">{doc.title}</span>
                      {currentSlug === doc.slug && (
                        <ChevronRightIcon className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

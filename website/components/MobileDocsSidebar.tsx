'use client'

import { useState, useEffect } from 'react'
import { getVersions, getDocPages, DocPage, Version } from '../lib/content'
import Link from 'next/link'
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface MobileDocsSidebarProps {
  currentVersion: string
  currentSlug?: string
}

export default function MobileDocsSidebar({ currentVersion, currentSlug }: MobileDocsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [docs, setDocs] = useState<DocPage[]>([])
  const [groupedDocs, setGroupedDocs] = useState<Record<string, DocPage[]>>({})
  const [sortedCategories, setSortedCategories] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      const versionsData = await getVersions()
      const docsData = await getDocPages(currentVersion)
      
      setVersions(versionsData)
      setDocs(docsData)
      
      // Group docs by category and sort
      const grouped = docsData.reduce((acc: Record<string, DocPage[]>, doc: DocPage) => {
        const category = doc.category || 'General'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(doc)
        return acc
      }, {} as Record<string, DocPage[]>)

      setGroupedDocs(grouped)

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
      
      const sorted = Object.keys(grouped).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a)
        const bIndex = categoryOrder.indexOf(b)
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1
        
        return a.localeCompare(b)
      })
      
      setSortedCategories(sorted)
      
      Object.values(grouped).forEach((categoryDocs: DocPage[]) => {
        categoryDocs.sort((a, b) => (a.order || 999) - (b.order || 999))
      })
    }

    loadData()
  }, [currentVersion])

  // Handle body scroll lock when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [currentSlug])

  // Listen for the mobile menu button click
  useEffect(() => {
    const handleMobileMenuClick = () => {
      setIsOpen(true)
    }

    const button = document.getElementById('mobile-docs-menu-button')
    if (button) {
      button.addEventListener('click', handleMobileMenuClick)
      return () => button.removeEventListener('click', handleMobileMenuClick)
    }
  }, [])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentation
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-20">
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
                  {groupedDocs[category]?.map((doc: DocPage) => (
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
                          <ChevronRightIcon className="ml-auto h-4 w-4 flex-shrink-0" />
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
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface TocItem {
  id: string
  title: string
  level: number
  children?: TocItem[]
}

interface MobileTableOfContentsProps {
  items: TocItem[]
}

export default function MobileTableOfContents({ items }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { 
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1
      }
    )

    // Observe all headings
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80 // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      
      // Update URL hash without triggering scroll
      history.pushState(null, '', `#${id}`)
      setActiveId(id)
      setIsOpen(false) // Close mobile TOC after clicking
    }
  }

  const renderTocItem = (item: TocItem) => {
    const isActive = activeId === item.id
    
    return (
      <div key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(e) => handleClick(e, item.id)}
          className={`block py-2 px-3 text-sm transition-all duration-200 border-l-2 ${
            isActive
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium'
              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
          } ${
            item.level === 1
              ? 'pl-3 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
              : item.level === 2
              ? 'pl-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              : 'pl-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {item.title}
        </a>
        {item.children && item.children.map((child) => renderTocItem(child))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="xl:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          On this page
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            <nav className="p-2">
              {items.map((item) => renderTocItem(item))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

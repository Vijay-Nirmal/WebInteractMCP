'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  title: string
  level: number
  children?: TocItem[]
}

interface TableOfContentsProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
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
    }
  }

  const renderTocItem = (item: TocItem) => {
    const isActive = activeId === item.id
    
    return (
      <div key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(e) => handleClick(e, item.id)}
          className={`block py-1 text-sm transition-all duration-200 border-l-2 ${
            isActive
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium'
              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
          } ${
            item.level === 1
              ? 'pl-4 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
              : item.level === 2
              ? 'pl-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              : 'pl-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            On this page
          </h3>
          <nav className="space-y-1">
            {items.map((item) => renderTocItem(item))}
          </nav>
        </div>
      </div>
    </div>
  )
}

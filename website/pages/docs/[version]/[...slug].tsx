import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { GetStaticProps, GetStaticPaths } from 'next'
import { getDocPage, getDocPages, getVersions, DocPage, TableOfContentsItem } from '../../../lib/content'

interface DocPageProps {
  doc: DocPage | null
  allDocs: DocPage[]
  version: string
}

// Table of Contents component with better indentation
function TableOfContents({ items }: { items: TableOfContentsItem[] }) {
  if (!items || items.length === 0) return null

  const renderItems = (items: TableOfContentsItem[], baseLevel = 1): JSX.Element[] => {
    const flatItems: JSX.Element[] = []
    
    items.forEach((item) => {
      const indentLevel = Math.max(0, item.level - baseLevel)
      const marginLeft = indentLevel * 12 // 12px per level
      
      flatItems.push(
        <a
          key={item.id}
          href={`#${item.id}`}
          className="block py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          style={{ marginLeft: `${marginLeft}px` }}
          onClick={(e) => {
            e.preventDefault()
            
            console.log(`Trying to navigate to: ${item.title} with id: ${item.id}`)
            
            // Try multiple strategies to find the element
            let element = document.getElementById(item.id)
            console.log(`Found by ID "${item.id}":`, element)
            
            // If not found, try with different ID variations that rehypeSlug might generate
            if (!element) {
              // Try the exact title as slug-formatted
              const slugId = item.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '')
              console.log(`Trying alternate ID "${slugId}"`)
              element = document.getElementById(slugId)
            }
            
            // If still not found, try finding by heading text content
            if (!element) {
              console.log(`Searching by text content: "${item.title}"`)
              const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
              Array.from(headings).forEach((heading) => {
                if (heading.textContent?.trim() === item.title) {
                  element = heading as HTMLElement
                  console.log(`Found by text content:`, element)
                }
              })
            }
            
            if (element) {
              console.log(`Scrolling to element:`, element)
              // Add some offset to account for sticky headers
              const yOffset = -80
              const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
              window.scrollTo({ top: y, behavior: 'smooth' })
            } else {
              console.warn(`Could not find element for TOC item: ${item.title} (id: ${item.id})`)
              // Log all available heading IDs for debugging
              const allHeadings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
              console.log('Available heading IDs:', Array.from(allHeadings).map(h => h.id))
            }
          }}
        >
          {item.title}
        </a>
      )
      
      // Add children items
      if (item.children && item.children.length > 0) {
        flatItems.push(...renderItems(item.children, baseLevel))
      }
    })
    
    return flatItems
  }

  return (
    <nav className="toc">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        On this page
      </h4>
      <div className="space-y-1">
        {renderItems(items)}
      </div>
    </nav>
  )
}

// Breadcrumb component
function Breadcrumb({ version, category, title }: { version: string; category?: string; title: string }) {
  return (
    <nav className="flex text-sm text-gray-600 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
      <Link href="/docs" className="hover:text-primary-600 dark:hover:text-primary-400">
        Documentation
      </Link>
      <span className="mx-2">/</span>
      <span className="text-gray-400 dark:text-gray-500">{version}</span>
      {category && (
        <>
          <span className="mx-2">/</span>
          <span className="text-gray-400 dark:text-gray-500">{category}</span>
        </>
      )}
      <span className="mx-2">/</span>
      <span className="text-gray-900 dark:text-white font-medium">{title}</span>
    </nav>
  )
}

export default function DocPageComponent({ doc, allDocs, version }: DocPageProps) {
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    // Initialize Mermaid diagrams
    if (typeof window !== 'undefined') {
      const initMermaid = async () => {
        try {
          const mermaid = await import('mermaid')
          
          // Detect current theme using next-themes
          const isDarkMode = resolvedTheme === 'dark' || 
                           (resolvedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          
          console.log('Initializing Mermaid with theme:', isDarkMode ? 'dark' : 'light')
          
          mermaid.default.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'base',
            themeVariables: isDarkMode ? {
              // Dark mode theme variables
              primaryColor: '#2563eb',           // primary-600
              primaryTextColor: '#f9fafb',       // gray-50
              primaryBorderColor: '#1d4ed8',     // primary-700
              lineColor: '#6b7280',              // gray-500
              secondaryColor: '#374151',         // gray-700
              tertiaryColor: '#1f2937',          // gray-800
              background: '#111827',             // gray-900
              mainBkg: '#1f2937',               // gray-800
              secondBkg: '#374151',             // gray-700
              tertiaryBkg: '#4b5563',           // gray-600
              
              // Text colors
              secondaryTextColor: '#e5e7eb',     // gray-200
              tertiaryTextColor: '#d1d5db',      // gray-300
              
              // Node and edge styling
              nodeBkg: '#1f2937',               // gray-800
              nodeTextColor: '#f9fafb',         // gray-50
              edgeLabelBackground: '#374151',    // gray-700
              
              // Git diagram colors
              git0: '#2563eb',                  // primary-600
              git1: '#7c3aed',                  // violet-600
              git2: '#dc2626',                  // red-600
              git3: '#059669',                  // emerald-600
              git4: '#d97706',                  // amber-600
              git5: '#db2777',                  // pink-600
              git6: '#0891b2',                  // cyan-600
              git7: '#65a30d',                  // lime-600
              
              // Flowchart colors
              fillType0: '#2563eb',             // primary-600
              fillType1: '#7c3aed',             // violet-600
              fillType2: '#dc2626',             // red-600
              fillType3: '#059669',             // emerald-600
              fillType4: '#d97706',             // amber-600
              fillType5: '#db2777',             // pink-600
              
              // Sequence diagram colors
              actorBkg: '#1f2937',              // gray-800
              actorBorder: '#6b7280',           // gray-500
              actorTextColor: '#f9fafb',        // gray-50
              activationBkgColor: '#2563eb',    // primary-600
              activationBorderColor: '#1d4ed8', // primary-700
              
              // Class diagram colors
              classText: '#f9fafb',             // gray-50
              
              // State diagram colors
              labelColor: '#f9fafb',            // gray-50
              
              // Gantt chart colors
              gridColor: '#4b5563',             // gray-600
              section0: '#2563eb',
              section1: '#7c3aed',
              section2: '#dc2626',
              section3: '#059669',
              
              // Pie chart colors
              pie1: '#2563eb',
              pie2: '#7c3aed',
              pie3: '#dc2626',
              pie4: '#059669',
              pie5: '#d97706',
              pie6: '#db2777',
              pie7: '#0891b2',
              pie8: '#65a30d',
              pie9: '#84cc16',
              pie10: '#eab308',
              pie11: '#f59e0b',
              pie12: '#ef4444'
            } : {
              // Light mode theme variables
              primaryColor: '#2563eb',           // primary-600
              primaryTextColor: '#111827',       // gray-900
              primaryBorderColor: '#1d4ed8',     // primary-700
              lineColor: '#6b7280',              // gray-500
              secondaryColor: '#f3f4f6',         // gray-100
              tertiaryColor: '#ffffff',
              background: '#ffffff',
              mainBkg: '#ffffff',
              secondBkg: '#f9fafb',             // gray-50
              tertiaryBkg: '#f3f4f6',           // gray-100
              
              // Text colors
              secondaryTextColor: '#374151',     // gray-700
              tertiaryTextColor: '#6b7280',      // gray-500
              
              // Node and edge styling
              nodeBkg: '#ffffff',
              nodeTextColor: '#111827',          // gray-900
              edgeLabelBackground: '#ffffff',
              
              // Git diagram colors
              git0: '#2563eb',                  // primary-600
              git1: '#7c3aed',                  // violet-600
              git2: '#dc2626',                  // red-600
              git3: '#059669',                  // emerald-600
              git4: '#d97706',                  // amber-600
              git5: '#db2777',                  // pink-600
              git6: '#0891b2',                  // cyan-600
              git7: '#65a30d',                  // lime-600
              
              // Flowchart colors
              fillType0: '#dbeafe',             // primary-100
              fillType1: '#ede9fe',             // violet-100
              fillType2: '#fee2e2',             // red-100
              fillType3: '#d1fae5',             // emerald-100
              fillType4: '#fef3c7',             // amber-100
              fillType5: '#fce7f3',             // pink-100
              
              // Sequence diagram colors
              actorBkg: '#f9fafb',              // gray-50
              actorBorder: '#d1d5db',           // gray-300
              actorTextColor: '#111827',        // gray-900
              activationBkgColor: '#dbeafe',    // primary-100
              activationBorderColor: '#2563eb', // primary-600
              
              // Class diagram colors
              classText: '#111827',             // gray-900
              
              // State diagram colors
              labelColor: '#111827',            // gray-900
              
              // Gantt chart colors
              gridColor: '#e5e7eb',             // gray-200
              section0: '#dbeafe',
              section1: '#ede9fe',
              section2: '#fee2e2',
              section3: '#d1fae5',
              
              // Pie chart colors
              pie1: '#2563eb',
              pie2: '#7c3aed',
              pie3: '#dc2626',
              pie4: '#059669',
              pie5: '#d97706',
              pie6: '#db2777',
              pie7: '#0891b2',
              pie8: '#65a30d',
              pie9: '#84cc16',
              pie10: '#eab308',
              pie11: '#f59e0b',
              pie12: '#ef4444'
            },
            // Global styling options
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            darkMode: isDarkMode
          })
          
          // Find all mermaid elements
          const mermaidElements = document.querySelectorAll('.mermaid')
          console.log(`Found ${mermaidElements.length} Mermaid diagrams`)
          
          for (let i = 0; i < mermaidElements.length; i++) {
            const element = mermaidElements[i] as HTMLElement
            const content = element.textContent || ''
            
            if (content.trim()) {
              // Clean up HTML entities
              const cleanContent = content
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&#x3C;/g, '<')
                .replace(/&#x3E;/g, '>')
                .replace(/&#60;/g, '<')
                .replace(/&#62;/g, '>')
                .trim()
              
              const id = `mermaid-${Date.now()}-${i}`
              
              try {
                console.log(`Rendering diagram ${i + 1}:`, cleanContent.substring(0, 50) + '...')
                const result = await mermaid.default.render(id, cleanContent)
                
                // Wrap the SVG in a responsive container
                element.innerHTML = `
                  <div class="diagram-container">
                    ${result.svg}
                  </div>
                `
                
                console.log(`Successfully rendered diagram ${i + 1}`)
              } catch (error) {
                console.error(`Error rendering diagram ${i + 1}:`, error)
                element.innerHTML = `
                  <div class="mermaid-error" style="color: #dc2626; border: 1px solid #fecaca; padding: 1rem; border-radius: 0.5rem; background: #fef2f2;">
                    <strong>Mermaid Error:</strong> ${error instanceof Error ? error.message : String(error)}
                    <details style="margin-top: 0.5rem;">
                      <summary style="cursor: pointer; font-weight: 600;">Show source</summary>
                      <pre style="background: #f9fafb; padding: 0.5rem; margin-top: 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; overflow: auto; font-family: 'JetBrains Mono', monospace;">${cleanContent}</pre>
                    </details>
                  </div>
                `
              }
            }
          }
        } catch (error) {
          console.error('Failed to initialize Mermaid:', error)
        }
      }
      
      // Initialize on load
      initMermaid()
      
      // Re-initialize when theme changes (cleanup handled by useEffect dependency)
      return () => {
        // Cleanup function will be called when theme changes
        console.log('Cleaning up Mermaid initialization...')
      }
    }
  }, [resolvedTheme]) // Re-run when theme changes

  // Initialize Prism for syntax highlighting  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('prismjs').then(async () => {
        // Import language components with proper error handling
        try {
          await import('prismjs/components/prism-typescript' as any)
          await import('prismjs/components/prism-javascript' as any)
          await import('prismjs/components/prism-json' as any)
          await import('prismjs/components/prism-bash' as any)
          await import('prismjs/components/prism-yaml' as any)
          await import('prismjs/components/prism-docker' as any)
          await import('prismjs/components/prism-csharp' as any)
        } catch (error) {
          console.warn('Failed to load some Prism components:', error)
        }
        
        // Re-highlight all code blocks
        if ((window as any).Prism) {
          (window as any).Prism.highlightAll()
        }
      })
    }
  }, [doc, resolvedTheme]) // Re-run when doc or theme changes

  if (!doc) {
    return (
      <>
        <Head>
          <title>Page Not Found - WebIntractMCP Docs</title>
        </Head>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Page Not Found
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                The documentation page you're looking for doesn't exist.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/docs"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Back to Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Group docs by category for navigation
  const docsByCategory = allDocs.reduce((acc, docPage) => {
    const category = docPage.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(docPage)
    return acc
  }, {} as Record<string, DocPage[]>)

  return (
    <>
      <Head>
        <title>{doc.title} - WebIntractMCP Docs</title>
        <meta name="description" content={`Documentation for ${doc.title} in WebIntractMCP`} />
        <meta property="og:title" content={`${doc.title} - WebIntractMCP Docs`} />
        <meta property="og:description" content={`Documentation for ${doc.title} in WebIntractMCP`} />
        <meta property="og:type" content="article" />
      </Head>

      <div className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Link
                  href="/docs"
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 mb-6"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Docs
                </Link>

                <nav className="space-y-6">
                  {Object.entries(docsByCategory).map(([category, docs]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {docs.map((docPage) => (
                          <li key={docPage.slug}>
                            <Link
                              href={`/docs/${version}/${docPage.slug}`}
                              className={`block text-sm leading-6 transition-colors ${
                                docPage.slug === doc.slug
                                  ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded'
                                  : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1'
                              }`}
                            >
                              {docPage.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                <div className="mb-8">
                  <Breadcrumb version={version} category={doc.category} title={doc.title} />
                  
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
                    {doc.title}
                  </h1>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 dark:bg-primary-400/10 dark:text-primary-400 dark:ring-primary-400/20">
                      Version: {version}
                    </span>
                  </div>
                </div>

                <div 
                  className="prose prose-lg prose-gray dark:prose-invert max-w-none
                    prose-headings:scroll-mt-20
                    prose-a:text-primary-600 dark:prose-a:text-primary-400
                    prose-code:text-primary-600 dark:prose-code:text-primary-400
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                    prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800
                    prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                    prose-table:text-sm
                    prose-th:text-left prose-th:font-semibold
                    prose-td:align-top
                    enhanced-content"
                  dangerouslySetInnerHTML={{ __html: doc.content }} 
                />

                {/* Navigation between docs */}
                <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex justify-between">
                    {/* Previous/Next navigation could be added here */}
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </article>
            </div>

            {/* Table of Contents Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents items={doc.tableOfContents || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = await getVersions()
  const paths: Array<{ params: { version: string; slug: string[] } }> = []

  for (const version of versions) {
    const docs = await getDocPages(version.version)
    for (const doc of docs) {
      const slugParts = doc.slug.split('/')
      
      paths.push({
        params: {
          version: version.version,
          slug: slugParts,
        },
      })
    }
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const version = params?.version as string
  const slugArray = params?.slug as string[]
  
  // Join the slug array back to the original slug format
  const slug = slugArray.join('/')
  
  console.log('getStaticProps - version:', version, 'slug:', slug)
  
  const doc = await getDocPage(version, slug)
  const allDocs = await getDocPages(version)

  return {
    props: {
      doc,
      allDocs,
      version,
    },
  }
}

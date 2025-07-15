'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import mermaid from 'mermaid'

export default function MermaidInitializer() {
  const { theme, resolvedTheme } = useTheme()
  
  useEffect(() => {
    const isDark = resolvedTheme === 'dark'
    
    // Initialize Mermaid with theme-aware configuration
    mermaid.initialize({ 
      startOnLoad: false,
      theme: isDark ? 'dark' : 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      themeVariables: isDark ? {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#9ca3af',
        sectionBkgColor: '#374151',
        altSectionBkgColor: '#4b5563',
        gridColor: '#6b7280',
        secondaryColor: '#4b5563',
        tertiaryColor: '#374151',
        background: '#1f2937',
        mainBkg: '#1f2937',
        secondBkg: '#374151',
        tertiaryBkg: '#4b5563'
      } : {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#1d4ed8',
        lineColor: '#6b7280',
        sectionBkgColor: '#f9fafb',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e5e7eb',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#fafafa',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#f9fafb',
        tertiaryBkg: '#f3f4f6'
      }
    })
    
    const renderMermaidDiagrams = async () => {
      const diagrams = document.querySelectorAll('.mermaid-diagram')
      
      for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i] as HTMLElement
        const mermaidCode = diagram.getAttribute('data-mermaid')
        
        if (mermaidCode) {
          try {
            const decodedCode = decodeURIComponent(mermaidCode)
            const id = `mermaid-${i}-${Date.now()}`
            
            // Clear the existing content
            diagram.innerHTML = ''
            
            // Render the diagram
            const { svg } = await mermaid.render(id, decodedCode)
            diagram.innerHTML = svg
            diagram.classList.add('mermaid-rendered')
            
            // Style the rendered diagram with theme-aware colors
            diagram.style.textAlign = 'center'
            diagram.style.margin = '2rem 0'
            diagram.style.padding = '1rem'
            diagram.style.background = isDark ? '#1f2937' : '#ffffff'
            diagram.style.border = `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            diagram.style.borderRadius = '0.5rem'
            
          } catch (error) {
            console.error('Error rendering Mermaid diagram:', error)
            diagram.innerHTML = `
              <div class="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
                <p><strong>Mermaid Diagram Error:</strong></p>
                <pre class="text-sm mt-2 whitespace-pre-wrap">${mermaidCode ? decodeURIComponent(mermaidCode) : 'No diagram code found'}</pre>
              </div>
            `
          }
        }
      }
    }
    
    // Run when component mounts and when DOM changes
    renderMermaidDiagrams()
    
    // Set up a mutation observer to catch dynamically added diagrams
    const observer = new MutationObserver((mutations) => {
      let hasNewDiagrams = false
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            if (element.classList?.contains('mermaid-diagram') || 
                element.querySelector?.('.mermaid-diagram')) {
              hasNewDiagrams = true
            }
          }
        })
      })
      
      if (hasNewDiagrams) {
        setTimeout(renderMermaidDiagrams, 100)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => {
      observer.disconnect()
    }
  }, [resolvedTheme]) // Re-run when theme changes

  return null
}

'use client'

import { useEffect } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  id?: string
}

export default function Mermaid({ chart, id = `mermaid-${Math.random().toString(36).substr(2, 9)}` }: MermaidProps) {
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    })
    
    const renderChart = async () => {
      try {
        const element = document.getElementById(id)
        if (element) {
          element.innerHTML = ''
          const { svg } = await mermaid.render(`${id}-svg`, chart)
          element.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        const element = document.getElementById(id)
        if (element) {
          element.innerHTML = `<div class="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
            <p><strong>Mermaid Diagram Error:</strong></p>
            <pre class="text-sm mt-2">${chart}</pre>
          </div>`
        }
      }
    }
    
    renderChart()
  }, [chart, id])

  return (
    <div 
      id={id} 
      className="flex justify-center my-8 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    />
  )
}

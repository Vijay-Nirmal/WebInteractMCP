import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Documentation - WebInteract MCP',
  description: 'Complete documentation for WebInteract MCP - transform web applications into MCP servers.',
}

export default function DocsIndex() {
  // Redirect to latest docs
  redirect('/docs/latest')
}

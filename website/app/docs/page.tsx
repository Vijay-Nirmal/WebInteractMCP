import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Documentation - WebIntract MCP',
  description: 'Complete documentation for WebIntract MCP - transform web applications into MCP servers.',
}

export default function DocsIndex() {
  // Redirect to latest docs
  redirect('/docs/latest')
}

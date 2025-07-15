import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Layout from '../components/Layout'
import { ThemeProvider } from '../components/ThemeProvider'
import MermaidInitializer from '../components/MermaidInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | WebIntract MCP',
    default: 'WebIntract MCP - Transform Web Apps into MCP Servers'
  },
  description: 'WebIntract MCP transforms web applications into MCP servers with real-time two-way communication, enabling seamless integration with AI agents and automation tools.',
  keywords: [
    'MCP',
    'Model Context Protocol',
    'Web Automation',
    'SignalR',
    'TypeScript',
    'Angular',
    'React',
    'Vue',
    'AI Integration',
    'Real-time Communication'
  ],
  authors: [{ name: 'WebIntract MCP Team' }],
  creator: 'WebIntract MCP',
  publisher: 'WebIntract MCP',
  metadataBase: new URL('https://webintractmcp.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://webintractmcp.com',
    siteName: 'WebIntract MCP',
    title: 'WebIntract MCP - Transform Web Apps into MCP Servers',
    description: 'Transform web applications into MCP servers with real-time two-way communication.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WebIntract MCP'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebIntract MCP - Transform Web Apps into MCP Servers',
    description: 'Transform web applications into MCP servers with real-time two-way communication.',
    images: ['/twitter-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout>
            {children}
          </Layout>
          <MermaidInitializer />
        </ThemeProvider>
      </body>
    </html>
  )
}

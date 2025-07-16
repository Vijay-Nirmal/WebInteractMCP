import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Layout from '../components/Layout'
import { ThemeProvider } from '../components/ThemeProvider'
import MermaidInitializer from '../components/MermaidInitializer'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export const metadata: Metadata = {
  title: {
    template: '%s | WebInteract MCP',
    default: 'WebInteract MCP - Transform Web Apps into MCP Servers'
  },
  description: 'Transform web applications into MCP servers with real-time two-way communication, enabling seamless integration with AI agents and automation tools.',
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
    'Real-time Communication',
    'Web Development',
    'Automation Framework',
    'Developer Tools'
  ],
  authors: [
    { name: 'WebInteract MCP Team', url: 'https://webinteractmcp.com' },
    { name: 'Vijay Nirmal', url: 'https://github.com/Vijay-Nirmal' }
  ],
  creator: 'WebInteract MCP Team',
  publisher: 'WebInteract MCP',
  metadataBase: new URL('https://webinteractmcp.com'),
  alternates: {
    canonical: 'https://webinteractmcp.com',
    languages: {
      'en-US': 'https://webinteractmcp.com',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://webinteractmcp.com',
    siteName: 'WebInteract MCP',
    title: 'WebInteract MCP - Transform Web Apps into MCP Servers',
    description: 'Transform web applications into MCP servers with real-time two-way communication, enabling seamless integration with AI agents and automation tools.',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'WebInteract MCP - Transform Web Apps into MCP Servers',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webinteractmcp',
    creator: '@webinteractmcp',
    title: 'WebInteract MCP - Transform Web Apps into MCP Servers',
    description: 'Transform web applications into MCP servers with real-time two-way communication, enabling seamless integration with AI agents and automation tools.',
    images: ['/android-chrome-512x512.png']
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  manifest: '/manifest.json',
  category: 'technology',
  referrer: 'origin-when-cross-origin',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://webinteractmcp.com/#organization",
                  name: "WebInteract MCP",
                  url: "https://webinteractmcp.com",
                  logo: "/android-chrome-512x512.png",
                  description: "Transform web applications into MCP servers with real-time two-way communication",
                  sameAs: [
                    "https://github.com/Vijay-Nirmal/WebInteractMCP",
                    "https://www.npmjs.com/package/@web-interact-mcp/client",
                    "https://hub.docker.com/r/vijaynirmalpon/web-interact-mcp-server"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://webinteractmcp.com/#website",
                  name: "WebInteract MCP",
                  url: "https://webinteractmcp.com",
                  publisher: {
                    "@id": "https://webinteractmcp.com/#organization"
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://webinteractmcp.com/docs?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://webinteractmcp.com/#software",
                  name: "WebInteract MCP",
                  description: "Transform web applications into MCP servers with real-time two-way communication, enabling seamless integration with AI agents and automation tools",
                  url: "https://webinteractmcp.com",
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: ["Windows", "macOS", "Linux"],
                  author: {
                    "@id": "https://webinteractmcp.com/#organization"
                  },
                  downloadUrl: "https://www.npmjs.com/package/@web-interact-mcp/client",
                  license: "https://opensource.org/licenses/MIT",
                  programmingLanguage: ["TypeScript", "JavaScript", "C#"],
                  codeRepository: "https://github.com/Vijay-Nirmal/WebInteractMCP"
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout>
            {children}
          </Layout>
          <MermaidInitializer />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-YBW93ELJV5" />
      </body>
    </html>
  )
}

import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics and get up and running quickly',
    href: '/docs/latest/getting-started',
    icon: '🚀',
  },
  {
    title: 'Quick Start Guides',
    description: 'Framework-specific integration guides',
    href: '/docs/latest/quickstart',
    icon: '⚡',
  },
  {
    title: 'Tool Configuration',
    description: 'Learn how to create and configure MCP tools',
    href: '/docs/latest/tool-configuration',
    icon: '🛠️',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    href: '/docs/latest/api-reference',
    icon: '📚',
  },
  {
    title: 'Examples',
    description: 'Real-world implementation examples',
    href: '/docs/latest/examples',
    icon: '💡',
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    href: '/docs/latest/troubleshooting',
    icon: '🔧',
  },
]

export default function Docs() {
  return (
    <>
      <Head>
        <title>Documentation - WebIntractMCP</title>
        <meta
          name="description"
          content="Complete documentation for WebIntractMCP - learn how to transform your web applications into MCP servers."
        />
      </Head>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Everything you need to know about integrating WebIntractMCP into your web applications.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {docSections.map((section) => (
              <div
                key={section.title}
                className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
              >
                <div className="flex items-center gap-x-4 border-b border-gray-900/5 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                  <div className="text-2xl">{section.icon}</div>
                  <div className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    {section.title}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 mb-4">
                    {section.description}
                  </p>
                  <Link
                    href={section.href}
                    className="text-sm font-semibold leading-6 text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Read more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Quick Links
                </h2>
                <div className="mt-6 space-y-4">
                  <Link
                    href="/docs/latest/getting-started"
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">Getting Started</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      New to WebIntractMCP? Start here for a comprehensive introduction.
                    </p>
                  </Link>
                  <Link
                    href="/docs/latest/quickstart"
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">Framework Guides</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      React, Angular, Vue, and more - find your framework-specific guide.
                    </p>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Popular Topics
                </h2>
                <div className="mt-6 space-y-4">
                  <Link
                    href="/docs/latest/tool-configuration"
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">Tool Configuration</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Learn how to create powerful MCP tools with JSON configuration.
                    </p>
                  </Link>
                  <Link
                    href="/docs/latest/examples"
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">Examples</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Real-world examples and implementation patterns.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-primary-900 dark:text-primary-100">
                Need Help?
              </h2>
              <p className="mt-4 text-lg leading-8 text-primary-700 dark:text-primary-300">
                Can't find what you're looking for? Our community is here to help.
              </p>
              <div className="mt-6 flex gap-x-4">
                <Link
                  href="https://github.com/Vijay-Nirmal/WebIntractMCP/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
                >
                  Join Discussions
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-semibold leading-6 text-primary-700 dark:text-primary-300 hover:text-primary-600 dark:hover:text-primary-200 transition-colors"
                >
                  Contact Support <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

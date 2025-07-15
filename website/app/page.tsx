import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'WebIntract MCP - Transform Web Applications into MCP Servers',
  description: 'Transform any web application into an MCP server with real-time two-way communication. Enable chatbots and AI clients to control web sessions seamlessly.',
}

const features = [
  {
    name: 'Full MCP Tool Protocol Support',
    description: 'Complete implementation including tool discovery, invocation, and all response types (Text, Image, Audio).',
    icon: '🔧',
  },
  {
    name: 'Real-time Communication',
    description: 'Robust bidirectional communication using SignalR with WebSockets, ServerSentEvents, and LongPolling support.',
    icon: '🔄',
  },
  {
    name: 'Dynamic Tool Registration',
    description: 'Configure tools with simple JSON files for easy customization and deployment.',
    icon: '🛠️',
  },
  {
    name: 'Session-based Control',
    description: 'Per-user session management ensures secure isolation and concurrent operations.',
    icon: '🎯',
  },
  {
    name: 'Framework Agnostic',
    description: 'Works seamlessly with any JavaScript framework including React, Angular, Vue, and more.',
    icon: '🌐',
  },
  {
    name: 'Production Ready',
    description: 'Comprehensive error handling, performance optimization, and Docker support for easy deployment.',
    icon: '⚡',
  },
]

const useCases = [
  {
    title: 'Automated Testing',
    description: 'Control web applications for comprehensive E2E testing scenarios.',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  },
  {
    title: 'User Onboarding',
    description: 'Create guided tours and interactive tutorials for better user experience.',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  },
  {
    title: 'Process Automation',
    description: 'Automate repetitive web-based tasks and workflows efficiently.',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  },
  {
    title: 'Accessibility',
    description: 'Provide AI-powered navigation assistance for improved accessibility.',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  },
  {
    title: 'Data Entry',
    description: 'Automate form filling and data collection processes.',
    color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  },
]

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 dark:text-gray-400 ring-1 ring-gray-900/10 dark:ring-gray-100/10 hover:ring-gray-900/20 dark:hover:ring-gray-100/20">
              📢 Check out the preview version available now!{' '}
              <Link href="/docs" className="font-semibold text-primary-600 dark:text-primary-400">
                <span className="absolute inset-0" aria-hidden="true" />
                Read the docs <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              WebIntractMCP
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Transform any web application into an MCP server with real-time two-way communication. 
              Enable chatbots and other MCP clients to control client sessions and complete intended actions on behalf of users.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/docs/latest/getting-started"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Get started
              </Link>
              <Link
                href="https://github.com/Vijay-Nirmal/WebIntractMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                View on GitHub <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
              Powerful Features
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need for MCP integration
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              WebIntractMCP provides a comprehensive toolkit for transforming web applications into powerful MCP servers.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <span className="text-2xl">{feature.icon}</span>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
              Architecture
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Simple yet powerful architecture
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              WebIntractMCP consists of two tightly integrated components that work together seamlessly.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Link 
                href="https://www.npmjs.com/package/@web-intract-mcp/client"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col gap-6 sm:flex-row lg:flex-col group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-4 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl group-hover:bg-primary-700">
                  📚
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    @web-intract-mcp/client
                  </p>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                    TypeScript library for client-side integration. Framework-agnostic and easy to integrate into any web application.
                  </p>
                </div>
              </Link>
              <Link 
                href="https://hub.docker.com/r/vijaynirmalpon/web-intract-mcp-server"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col gap-6 sm:flex-row lg:flex-col group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-4 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl group-hover:bg-primary-700">
                  🖥️
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <p className="text-lg font-semibold leading-8 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    WebIntractMCPServer
                  </p>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                    Ready-to-deploy Docker MCP server for protocol handling. Built with .NET 9 and ASP.NET Core.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">
              Use Cases
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Endless possibilities
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              From automated testing to user onboarding, WebIntractMCP opens up new possibilities for web automation.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-3">
              {useCases.map((useCase, index) => (
                <div
                  key={useCase.title}
                  className={`rounded-2xl p-8 ${useCase.color}`}
                >
                  <h3 className="text-lg font-semibold leading-8">
                    {useCase.title}
                  </h3>
                  <p className="mt-4 text-base leading-7">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Join the MCP ecosystem and transform your web applications today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/docs/latest/getting-started"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Get started
              </Link>
              <Link
                href="/docs"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

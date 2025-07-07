import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function About() {
  return (
    <>
      <Head>
        <title>About WebIntractMCP - Open Source MCP Ecosystem</title>
        <meta
          name="description"
          content="Learn about WebIntractMCP, the open-source ecosystem that transforms web applications into MCP servers. Created by Vijay Nirmal."
        />
      </Head>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              About WebIntractMCP
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              WebIntractMCP is an innovative open-source ecosystem that bridges the gap between web applications 
              and the Model Context Protocol, enabling seamless AI-driven web automation.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
            <div className="relative lg:order-last lg:col-span-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Project Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  To make web applications intelligent and accessible by enabling seamless integration 
                  with AI assistants and chatbots through the Model Context Protocol.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Open Source & Community Driven</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Framework Agnostic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Production Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xl text-base leading-7 text-gray-700 dark:text-gray-300 lg:col-span-7">
              <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                The Story Behind WebIntractMCP
              </h2>
              <p className="mt-6">
                WebIntractMCP was born from the recognition that while AI and chatbots have become incredibly 
                sophisticated, they've been limited in their ability to directly interact with web applications. 
                Most solutions required complex browser automation setups, brittle selectors, and framework-specific 
                implementations.
              </p>
              <p className="mt-8">
                By leveraging the Model Context Protocol (MCP), WebIntractMCP creates a standardized way for 
                web applications to expose their functionality to AI assistants. This opens up endless possibilities 
                for intelligent user assistance, automated testing, process automation, and enhanced accessibility.
              </p>

              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Key Principles
              </h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Simplicity First</h3>
                  <p className="mt-2">
                    We believe that powerful tools should be easy to use. WebIntractMCP can be integrated 
                    into any web application with just a few lines of code.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Framework Agnostic</h3>
                  <p className="mt-2">
                    Whether you're using React, Angular, Vue, or vanilla JavaScript, WebIntractMCP works 
                    seamlessly with your existing tech stack.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Security & Privacy</h3>
                  <p className="mt-2">
                    Session-based isolation ensures that multiple users can safely use the system simultaneously, 
                    with no cross-contamination of data or actions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Open Source</h3>
                  <p className="mt-2">
                    We believe in the power of community. WebIntractMCP is open source and welcomes 
                    contributions from developers worldwide.
                  </p>
                </div>
              </div>

              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Technology Choices
              </h2>
              <p className="mt-6">
                WebIntractMCP is built with modern, battle-tested technologies:
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>TypeScript 5.8+:</strong> Type-safe development with latest features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>.NET 9:</strong> High-performance server runtime</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>SignalR:</strong> Real-time communication with fallback support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span><strong>Angular 20:</strong> Modern web framework for sample implementation</span>
                </li>
              </ul>

              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Community & Contributions
              </h2>
              <p className="mt-6">
                WebIntractMCP thrives on community contributions. Whether you're reporting bugs, 
                suggesting features, contributing code, or helping with documentation, every contribution 
                is valued and appreciated.
              </p>
              <div className="mt-8 flex gap-x-6">
                <Link
                  href="https://github.com/Vijay-Nirmal/WebIntractMCP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
                >
                  View on GitHub
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Get in Touch <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Meet the Creator
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              WebIntractMCP is created and maintained by Vijay Nirmal, a passionate developer 
              committed to making web applications more intelligent and accessible.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div className="aspect-[3/4] w-full rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-600">VN</span>
                </div>
              </div>
            </div>

            <div className="max-w-xl text-base leading-7 text-gray-700 dark:text-gray-300 lg:col-span-7">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Vijay Nirmal
              </h3>
              <p className="mt-6">
                Vijay is a software engineer with a passion for creating tools that bridge the gap 
                between complex technology and everyday users. With experience in full-stack development, 
                AI integration, and web automation, he brings a unique perspective to the challenges 
                of modern web development.
              </p>
              <p className="mt-8">
                When not coding, Vijay enjoys exploring new technologies, contributing to open source 
                projects, and sharing knowledge with the developer community through blog posts and tutorials.
              </p>

              <div className="mt-10">
                <h4 className="font-semibold text-gray-900 dark:text-white">Get in Touch</h4>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Email:</strong>{' '}
                    <Link
                      href="mailto:me@vijaynirmal.com"
                      className="text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      me@vijaynirmal.com
                    </Link>
                  </p>
                  <p>
                    <strong>GitHub:</strong>{' '}
                    <Link
                      href="https://github.com/Vijay-Nirmal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      @Vijay-Nirmal
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

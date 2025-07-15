import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const contentDirectory = path.join(process.cwd(), 'content')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  author?: string
  tags?: string[]
}

export interface DocPage {
  slug: string
  title: string
  content: string
  version: string
  order?: number
  category?: string
  tableOfContents?: TableOfContentsItem[]
}

export interface TableOfContentsItem {
  id: string
  title: string
  level: number
  children?: TableOfContentsItem[]
}

export interface Version {
  version: string
  label: string
  isLatest: boolean
}

// Enhanced markdown processing with Mermaid support and syntax highlighting
async function processMarkdown(content: string): Promise<string> {
  try {
    // Use unified processor for proper remark -> rehype chain
    const markdownResult = await unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST
      .use(rehypeSlug) // Add IDs to headings
      .use(rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          className: ['heading-link'],
          ariaLabel: 'Link to heading'
        }
      }) // Add links to headings
      .use(rehypeHighlight, {
        detect: true,
        ignoreMissing: true,
        aliases: {
          'js': 'javascript',
          'ts': 'typescript',
          'jsx': 'javascript',
          'tsx': 'typescript',
          'sh': 'bash',
          'shell': 'bash',
          'json': 'json',
          'yml': 'yaml',
          'xml': 'xml',
          'html': 'xml',
          'cs': 'csharp',
          'py': 'python',
          'rb': 'ruby',
          'go': 'go',
          'rs': 'rust',
          'php': 'php',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'sql': 'sql',
          'dockerfile': 'dockerfile',
          'powershell': 'powershell',
          'ps1': 'powershell',
          'bash': 'bash'
        }
      }) // Add syntax highlighting
      .use(rehypeStringify, { allowDangerousHtml: true }) // Convert to HTML string
      .process(content)
    
    let result = markdownResult.toString()
    
    // Post-process to transform Mermaid code blocks to proper div format with better styling
    result = result.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match, mermaidCode) => {
        const cleanCode = mermaidCode.trim()
        return `<div class="mermaid-diagram" data-mermaid="${encodeURIComponent(cleanCode)}">${cleanCode}</div>`
      }
    )
    
    return result
  } catch (error) {
    console.error('Error processing markdown:', error)
    // Fallback processing with manual Mermaid transformation
    let result = content
      .replace(/\n/g, '<br>')
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
        const level = hashes.length
        const id = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
        return `<h${level} id="${id}"><a href="#${id}" class="heading-link">${title}</a></h${level}>`
      })
    
    // Transform Mermaid code blocks in fallback too
    result = result.replace(
      /```mermaid<br>([\s\S]*?)<br>```/g,
      (match, mermaidCode) => {
        const cleanCode = mermaidCode.replace(/<br>/g, '\n').trim()
        return `<div class="mermaid-diagram" data-mermaid="${encodeURIComponent(cleanCode)}">${cleanCode}</div>`
      }
    )
    
    return result
  }
}

// Extract table of contents from markdown content, ignoring headers in code blocks
function extractTableOfContents(content: string): TableOfContentsItem[] {
  // Remove code blocks (both ``` and ` blocks) to avoid extracting headers from code
  let cleanContent = content
  
  // Remove fenced code blocks (```...```)
  cleanContent = cleanContent.replace(/```[\s\S]*?```/g, '')
  
  // Remove inline code (`...`)
  cleanContent = cleanContent.replace(/`[^`\n]+`/g, '')
  
  // Remove indented code blocks (4+ spaces)
  cleanContent = cleanContent.replace(/^    .+$/gm, '')
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: TableOfContentsItem[] = []
  let match

  while ((match = headingRegex.exec(cleanContent)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    
    // Skip if title is empty or contains only special characters
    if (!title || /^[^\w\s]*$/.test(title)) {
      continue
    }
    
    // Generate ID that matches rehypeSlug behavior more closely
    const id = title.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')       // Remove non-word characters except hyphens
      .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '')             // Remove leading hyphens
      .replace(/-+$/, '')             // Remove trailing hyphens

    if (id) {
      headings.push({
        id,
        title,
        level,
      })
    }
  }

  // Build nested structure
  const toc: TableOfContentsItem[] = []
  const stack: TableOfContentsItem[] = []

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      toc.push(heading)
    } else {
      const parent = stack[stack.length - 1]
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(heading)
    }

    stack.push(heading)
  }

  return toc
}

export async function getVersions(): Promise<Version[]> {
  const versionsPath = path.join(contentDirectory, 'docs', 'versions.json')
  
  if (!fs.existsSync(versionsPath)) {
    return [{ version: 'latest', label: 'Latest', isLatest: true }]
  }
  
  const versionsData = fs.readFileSync(versionsPath, 'utf8')
  return JSON.parse(versionsData)
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDirectory = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(blogDirectory)
  const allPostsData = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(blogDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        
        const { data, content } = matter(fileContents)
        const contentHtml = await processMarkdown(content)
        
        return {
          slug,
          title: data.title || slug,
          date: data.date || new Date().toISOString(),
          excerpt: data.excerpt || content.substring(0, 160) + '...',
          content: contentHtml,
          author: data.author,
          tags: data.tags || [],
        }
      })
  )
  
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts()
  return posts.find((post) => post.slug === slug) || null
}

export async function getDocPages(version: string = 'latest'): Promise<DocPage[]> {
  const docsDirectory = path.join(contentDirectory, 'docs', version)
  
  if (!fs.existsSync(docsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(docsDirectory, { recursive: true }) as string[]
  const allDocsData = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '').replace(/\\/g, '/')
        const fullPath = path.join(docsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        
        const { data, content } = matter(fileContents)
        const contentHtml = await processMarkdown(content)
        const tableOfContents = extractTableOfContents(content)
        
        return {
          slug,
          title: data.title || slug,
          content: contentHtml,
          version,
          order: data.order || 999,
          category: data.category || 'General',
          tableOfContents,
        }
      })
  )
  
  return allDocsData.sort((a, b) => (a.order || 999) - (b.order || 999))
}

export async function getDocPage(version: string, slug: string): Promise<DocPage | null> {
  const docs = await getDocPages(version)
  return docs.find((doc) => doc.slug === slug) || null
}

export function getAllBlogSlugs(): string[] {
  const blogDirectory = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(blogDirectory)
  return fileNames
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''))
}

export function getAllDocSlugs(version: string = 'latest'): string[] {
  const docsDirectory = path.join(contentDirectory, 'docs', version)
  
  if (!fs.existsSync(docsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(docsDirectory, { recursive: true }) as string[]
  return fileNames
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, '').replace(/\\/g, '/'))
}

# Website

This directory contains the Next.js website for WebIntractMCP.

## 🚀 Features

- **Modern Design**: Clean, professional design with dark/light theme support
- **SEO Optimized**: Complete meta tags, structured data, and sitemap generation
- **Mobile First**: Responsive design that works on all devices
- **Fast Loading**: Optimized for performance with static site generation
- **Documentation**: Markdown-based documentation with version support
- **Blog**: Markdown-based blog system
- **GitHub Pages Ready**: Configured for easy deployment to GitHub Pages

## 🛠️ Tech Stack

- **Next.js 14**: React framework with static site generation
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Markdown**: Content management with gray-matter
- **Heroicons**: Beautiful SVG icons

## 📁 Project Structure

```
website/
├── pages/                  # Next.js pages
│   ├── index.tsx          # Home page
│   ├── about.tsx          # About page
│   ├── contact.tsx        # Contact page
│   ├── docs/              # Documentation pages
│   └── blog/              # Blog pages
├── components/            # React components
│   ├── Layout.tsx         # Main layout component
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Site footer
├── content/               # Markdown content
│   ├── docs/              # Documentation content
│   │   ├── latest/        # Latest version docs
│   │   └── versions.json  # Version configuration
│   └── blog/              # Blog posts
├── lib/                   # Utility functions
│   └── content.ts         # Content management utilities
├── styles/                # Global styles
│   └── globals.css        # Global CSS with Tailwind
└── public/                # Static assets
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd website
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Building for Production

```bash
npm run build
```

This generates a static site in the `out` directory.

## 📝 Content Management

### Adding Documentation

1. Create a new markdown file in `content/docs/latest/`
2. Add frontmatter with title, order, and category
3. Write your documentation in Markdown

Example:
```markdown
---
title: "New Feature Guide"
order: 5
category: "Advanced"
---

# New Feature Guide

Your documentation content here...
```

### Adding Blog Posts

1. Create a new markdown file in `content/blog/`
2. Add frontmatter with title, date, author, excerpt, and tags
3. Write your blog post in Markdown

Example:
```markdown
---
title: "New Blog Post"
date: "2025-01-07"
author: "Your Name"
excerpt: "Brief description of the post"
tags: ["mcp", "tutorial"]
---

# New Blog Post

Your blog content here...
```

### Version Management

Edit `content/docs/versions.json` to add new documentation versions:

```json
[
  {
    "version": "latest",
    "label": "Latest",
    "isLatest": true
  },
  {
    "version": "v1.0",
    "label": "v1.0",
    "isLatest": false
  }
]
```

## 🎨 Customization

### Colors

The website uses a blue color palette defined in `tailwind.config.js`. To change colors:

1. Update the `primary` color values in the Tailwind config
2. Rebuild the site

### Layout

- Modify `components/Layout.tsx` for overall site structure
- Update `components/Header.tsx` for navigation changes
- Edit `components/Footer.tsx` for footer modifications

### SEO

- Update meta tags in individual page components
- Modify the site title and description in page heads
- Add structured data for better search engine understanding

## 🚀 Deployment

### GitHub Pages

The website is configured for automatic deployment to GitHub Pages:

1. Push changes to the main branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at your GitHub Pages URL

### Custom Domain

To use a custom domain (webintractmcp.com):

1. Add a `CNAME` file in the `public` directory with your domain
2. Configure DNS settings with your domain provider
3. Update the site URL in the configuration

### Manual Deployment

```bash
npm run build
npm run export
```

Upload the contents of the `out` directory to your hosting provider.

## 📊 Analytics

The website includes Google Analytics configuration. To enable:

1. Replace `GA_MEASUREMENT_ID` in `pages/_document.tsx` with your actual GA ID
2. Redeploy the site

## 🛠️ Development

### Adding New Pages

1. Create a new `.tsx` file in the `pages` directory
2. Export a React component as the default export
3. Add navigation links in `components/Header.tsx` if needed

### Styling

The website uses Tailwind CSS. Key classes and utilities are defined in `styles/globals.css`.

### Components

Create reusable components in the `components` directory. Follow the existing patterns for consistency.

## 🐛 Troubleshooting

### Build Issues

- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`
- Verify markdown frontmatter is valid

### Content Issues

- Check markdown file formatting
- Verify frontmatter syntax
- Ensure required fields are present

### Styling Issues

- Run `npm run dev` and check the browser console
- Verify Tailwind classes are correct
- Check for conflicting CSS

## 📄 License

This website is part of the WebIntractMCP project and is licensed under the MIT License.

## ✅ Setup Complete

The website is now fully configured and ready to use:

- ✅ All pages created (Home, About, Contact, Docs, Blog)
- ✅ Dynamic routing for blog posts and documentation 
- ✅ Content management system with markdown support
- ✅ GitHub Pages deployment workflow configured
- ✅ SEO optimization and meta tags implemented
- ✅ Dark/light theme with blue color palette
- ✅ TypeScript type safety throughout
- ✅ Responsive design for all devices
- ✅ Documentation with versioning support

### Next Steps

1. **Test the site**: `npm run dev` and visit http://localhost:3000
2. **Add your content**: Update blog posts and documentation
3. **Deploy**: Push to GitHub to trigger automatic deployment
4. **Configure domain**: Set up custom domain (webintractmcp.com) if desired

### Contact

- **Email**: me@vijaynirmal.com
- **GitHub**: https://github.com/Vijay-Nirmal/AutoBot

# Demolition Blog AI Generator

A modern, production-ready web application for generating professional blog posts for the demolition industry using AI. Built with Next.js 14+, TypeScript, and integrated with n8n workflows via webhooks.

## Features

### Core Functionality
- 🤖 **AI-Powered Content Generation** - Generate professional, SEO-optimized blog posts instantly
- 📚 **50+ Knowledge Base** - Access extensive demolition industry data and best practices  
- 🖼️ **AI-Generated Images** - Unique visuals created for each blog post
- 💬 **Interactive Chat Interface** - Ask follow-up questions and refine content
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode Support** - Toggle between light and dark themes

### Content Features
- **8 Pre-defined Topics**:
  - Manual vs Mechanical Demolition
  - Commercial Demolition Equipment Types
  - Safety Protocols in High-Rise Demolition
  - Environmental Considerations in Demolition
  - Cost Factors in Demolition Projects
  - Asbestos Removal Procedures
  - Explosive Demolition Techniques
  - Residential vs Commercial Demolition
- **Custom Topic Input** - Enter your own demolition-related topics
- **Advanced Options** - Control tone, word count, keywords, and image generation

### Export Options
- 📄 **Markdown Export** - Download as .md files
- 🌐 **HTML Export** - Ready-to-publish HTML format
- 📑 **PDF Export** - Professional PDF documents
- 📋 **Copy to Clipboard** - Quick content copying

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Markdown Rendering**: React Markdown with remark-gfm
- **Backend Integration**: n8n webhook API

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/demolition-blog-generator.git
   cd demolition-blog-generator
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your n8n webhook URL
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Deploy with Docker
```bash
docker build -t demolition-blog-generator .
docker run -p 3000:3000 -e NEXT_PUBLIC_N8N_WEBHOOK_URL=your-webhook-url demolition-blog-generator
```

## n8n Integration

Configure your n8n webhook to accept:
```json
{
  "chatInput": "topic",
  "sessionId": "unique-id",
  "options": {
    "tone": "professional",
    "wordCount": 1200,
    "keywords": ["demolition"],
    "generateImages": true
  }
}
```

## License

MIT License - see LICENSE file for details

---

Made with ❤️ for the demolition industry

# Live Demo
Deployed at: https://demolition-blog-generator.vercel.app

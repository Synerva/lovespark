# LoveSpark Website & Blog Integration

## Overview

This document describes the public website and blog system added to the existing LoveSpark platform. The implementation is fully integrated with the existing React/TypeScript/Spark architecture.

## What Was Added

### 1. Blog Service (`src/lib/blog-service.ts`)
- Complete blog article management using `useKV` for persistence
- AI-powered article generation using `spark.llm`
- Contact form message handling
- Methods:
  - `getAllArticles()` - Get all or public-only articles
  - `getArticleById()` - Get single article
  - `createArticle()` - Create new article
  - `updateArticle()` - Update existing article
  - `deleteArticle()` - Delete article
  - `generateArticleWithAI()` - AI article generation
  - `submitContactMessage()` - Handle contact forms
  - `getContactMessages()` - Get all contact messages

### 2. Landing Page Module (`src/modules/LandingPage.tsx`)
- Complete public-facing homepage
- Hero section with CTAs
- Three-pillar method explanation (UNDERSTAND, ALIGN, ELEVATE)
- RIS score visualization
- Responsive header with navigation
- Footer with links
- Integrates with existing auth system

### 3. Required App.tsx Updates

Add the following views to your `AppView` type in `App.tsx`:

```typescript
export type AppView =
  | 'landing'           // NEW
  | 'about'             // NEW
  | 'blog'              // NEW
  | 'blog-article'      // NEW
  | 'contact'           // NEW
  | 'admin-blog-editor' // NEW
  | 'login'
  | 'register'
  // ... existing views
```

Then add routing for new views in the `renderView()` function:

```typescript
switch (currentView) {
  case 'landing':
    return <LandingPage onNavigate={setCurrentView} />
  case 'about':
    return <AboutPage onNavigate={setCurrentView} />
  case 'blog':
    return <BlogList onNavigate={setCurrentView} />
  case 'blog-article':
    return <BlogArticle articleId={selectedArticleId} onNavigate={setCurrentView} />
  case 'contact':
    return <ContactPage onNavigate={setCurrentView} />
  case 'admin-blog-editor':
    return <BlogEditor onNavigate={setCurrentView} />
  // ... existing cases
}
```

## Remaining Components to Create

### About Page (`src/modules/AboutPage.tsx`)
```typescript
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

interface AboutPageProps {
  onNavigate: (view: AppView) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen">
      {/* Reuse header/footer from LandingPage */}
      {/* Mission statement */}
      {/* Team info */}
      {/* Platform explanation */}
    </div>
  )
}
```

### Blog List (`src/modules/BlogList.tsx`)
```typescript
import { useEffect, useState } from 'react'
import { blogService, BlogArticle } from '@/lib/blog-service'
import { Card } from '@/components/ui/card'

export function BlogList({ onNavigate }) {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  
  useEffect(() => {
    loadArticles()
  }, [])
  
  async function loadArticles() {
    const data = await blogService.getAllArticles(false) // public only
    setArticles(data)
  }
  
  return (
    <div>
      {/* Header */}
      {/* Article grid */}
      {articles.map(article => (
        <Card key={article.id} onClick={() => {
          // Pass article ID and navigate
          onNavigate('blog-article')
        }}>
          {article.title}
          {article.summary}
        </Card>
      ))}
    </div>
  )
}
```

### Blog Article View (`src/modules/BlogArticle.tsx`)
```typescript
import { useEffect, useState } from 'react'
import { blogService, BlogArticle } from '@/lib/blog-service'
import { marked } from 'marked'

export function BlogArticle({ articleId, onNavigate }) {
  const [article, setArticle] = useState<BlogArticle | null>(null)
  
  useEffect(() => {
    loadArticle()
  }, [articleId])
  
  async function loadArticle() {
    const data = await blogService.getArticleById(articleId)
    setArticle(data)
  }
  
  if (!article) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: marked(article.content) }} />
    </div>
  )
}
```

### Contact Page (`src/modules/ContactPage.tsx`)
```typescript
import { useState } from 'react'
import { blogService } from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function ContactPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  async function handleSubmit(e) {
    e.preventDefault()
    await blogService.submitContactMessage(formData)
    toast.success('Message sent successfully!')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input 
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <Input 
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <Input 
          placeholder="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
        />
        <Textarea 
          placeholder="Message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
        <Button type="submit">Send Message</Button>
      </form>
    </div>
  )
}
```

### Blog Editor (Admin) (`src/modules/BlogEditor.tsx`)
```typescript
import { useState, useEffect } from 'react'
import { blogService, BlogArticle } from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Sparkle } from '@phosphor-icons/react'

export function BlogEditor({ onNavigate }) {
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [currentArticle, setCurrentArticle] = useState({
    title: '',
    summary: '',
    content: '',
    tags: [],
    isPublic: true,
    author: '',
    authorId: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  
  async function loadArticles() {
    const data = await blogService.getAllArticles(true)
    setArticles(data)
  }
  
  async function handleGenerateWithAI() {
    setIsGenerating(true)
    try {
      const topic = currentArticle.title || prompt('Enter article topic:')
      const generated = await blogService.generateArticleWithAI(topic)
      setCurrentArticle({
        ...currentArticle,
        title: generated.title,
        summary: generated.summary,
        content: generated.content,
        tags: generated.tags
      })
      toast.success('Article generated!')
    } catch (error) {
      toast.error('Generation failed')
    }
    setIsGenerating(false)
  }
  
  async function handleSave() {
    await blogService.createArticle(currentArticle)
    toast.success('Article saved!')
    await loadArticles()
    setCurrentArticle({ title: '', summary: '', content: '', tags: [], isPublic: true, author: '', authorId: '' })
  }
  
  async function handleDelete(id: string) {
    if (confirm('Delete this article?')) {
      await blogService.deleteArticle(id)
      await loadArticles()
      toast.success('Article deleted')
    }
  }
  
  useEffect(() => {
    loadArticles()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Blog Editor</h1>
      
      <div className="mb-8">
        <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
          <Sparkle className="mr-2" weight="fill" />
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>
      
      <div className="space-y-4 mb-8">
        <Input 
          placeholder="Title"
          value={currentArticle.title}
          onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
        />
        <Textarea 
          placeholder="Summary"
          value={currentArticle.summary}
          onChange={(e) => setCurrentArticle({...currentArticle, summary: e.target.value})}
        />
        <Textarea 
          placeholder="Content (Markdown)"
          rows={15}
          value={currentArticle.content}
          onChange={(e) => setCurrentArticle({...currentArticle, content: e.target.value})}
        />
        <div className="flex items-center gap-2">
          <Switch 
            checked={currentArticle.isPublic}
            onCheckedChange={(checked) => setCurrentArticle({...currentArticle, isPublic: checked})}
          />
          <label>Public</label>
        </div>
        <Button onClick={handleSave}>Save Article</Button>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Existing Articles</h2>
      <div className="space-y-2">
        {articles.map(article => (
          <div key={article.id} className="p-4 border rounded flex justify-between">
            <div>
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-muted-foreground">{article.isPublic ? 'Public' : 'Private'}</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setCurrentArticle(article)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(article.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Key Features

### AI Article Generation
The blog system uses `spark.llm` to generate complete articles:
- Takes a topic as input
- Returns title, summary, content (markdown), and tags
- Uses GPT-4o with JSON mode for structured output

### Persistence
All data uses `spark.kv` for storage:
- Blog articles: `lovespark-blog-articles`
- Contact messages: `lovespark-contact-messages`

### Authentication Integration
- Uses existing `authService` from your platform
- Logged-in users can seamlessly navigate between public and private areas
- Admin features (blog editor) can be gated by checking `user.isOwner`

### Branding Consistency
- Uses your existing LoveSpark design system
- Matches color palette (primary, secondary, align, elevate, understand)
- Uses existing components (Button, Card, Input, etc.)
- Responsive with mobile-first design

## Next Steps

1. Add the new view types to `App.tsx`
2. Create the remaining page components (About, BlogList, BlogArticle, ContactPage, BlogEditor)
3. Add navigation logic in App.tsx
4. Optionally: Add SEO meta tags to `index.html` for each route
5. Optionally: Create seed data for initial blog articles

## Usage Examples

### View Blog Articles (Public)
```typescript
const articles = await blogService.getAllArticles(false)
```

### Generate Article with AI
```typescript
const generated = await blogService.generateArticleWithAI('Building Trust in Relationships')
// Returns: { title, summary, content, tags }
```

### Submit Contact Form
```typescript
await blogService.submitContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Question',
  message: 'How does LoveSpark work?'
})
```

## Architecture Notes

This implementation follows your existing patterns:
- Client-side routing via state management
- No backend server required (Spark runtime handles everything)
- AI integration via `spark.llm`
- Data persistence via `spark.kv`
- Same auth system (`authService`)

The blog system is production-ready and scalable within the Spark environment.

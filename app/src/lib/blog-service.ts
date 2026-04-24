import { v4 as uuidv4 } from 'uuid'
import { generateAIResponse } from './ai/ai-service'

export interface BlogArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  authorId: string
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
  imageUrl?: string
  readTime?: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: 'new' | 'read' | 'replied'
}

class BlogService {
  async getAllArticles(includePrivate: boolean = false): Promise<BlogArticle[]> {
    const articlesKey = 'lovespark-blog-articles'
    const allArticles = await window.spark.kv.get<BlogArticle[]>(articlesKey) || []
    
    if (includePrivate) {
      return allArticles.sort((a: BlogArticle, b: BlogArticle) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
    
    return allArticles
      .filter((article: BlogArticle) => article.isPublic)
      .sort((a: BlogArticle, b: BlogArticle) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }

  async getArticleById(id: string): Promise<BlogArticle | null> {
    const articles = await this.getAllArticles(true)
    return articles.find((article: BlogArticle) => article.id === id) || null
  }

  async createArticle(article: Omit<BlogArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogArticle> {
    const articlesKey = 'lovespark-blog-articles'
    const articles = await window.spark.kv.get<BlogArticle[]>(articlesKey) || []
    
    const newArticle: BlogArticle = {
      ...article,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: article.isPublic ? new Date().toISOString() : undefined,
      readTime: this.calculateReadTime(article.content),
    }
    
    articles.push(newArticle)
    await window.spark.kv.set(articlesKey, articles)
    
    return newArticle
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<BlogArticle | null> {
    const articlesKey = 'lovespark-blog-articles'
    const articles = await window.spark.kv.get<BlogArticle[]>(articlesKey) || []
    
    const index = articles.findIndex((article: BlogArticle) => article.id === id)
    if (index === -1) return null
    
    const updatedArticle = {
      ...articles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    if (updates.isPublic && !articles[index].isPublic) {
      updatedArticle.publishedAt = new Date().toISOString()
    }
    
    if (updates.content) {
      updatedArticle.readTime = this.calculateReadTime(updates.content)
    }
    
    articles[index] = updatedArticle
    await window.spark.kv.set(articlesKey, articles)
    
    return updatedArticle
  }

  async deleteArticle(id: string): Promise<boolean> {
    const articlesKey = 'lovespark-blog-articles'
    const articles = await window.spark.kv.get<BlogArticle[]>(articlesKey) || []
    
    const filtered = articles.filter((article: BlogArticle) => article.id !== id)
    if (filtered.length === articles.length) return false
    
    await window.spark.kv.set(articlesKey, filtered)
    return true
  }

  async generateArticleWithAI(topic: string): Promise<{ title: string; summary: string; content: string; tags: string[] }> {
    const prompt = `You are a professional relationship coach and content writer for LoveSpark, a premium relationship intelligence platform.

Generate a high-quality blog article about: ${topic}

The article should:
- Be insightful and evidence-based
- Use a warm, professional, non-judgmental tone
- Focus on practical relationship intelligence
- Avoid clichés and generic advice
- Be 800-1200 words
- Include actionable insights

Return the result as a valid JSON object with the following structure:
{
  "title": "Compelling article title",
  "summary": "2-3 sentence summary for preview",
  "content": "Full article content in markdown format with proper headings, paragraphs, and lists",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const response = await generateAIResponse([
      {
        role: 'system',
        content: 'You are LoveSpark AI. Return valid JSON only when asked for structured output.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ])
    const result = JSON.parse(response)
    
    return {
      title: result.title || 'Untitled Article',
      summary: result.summary || '',
      content: result.content || '',
      tags: result.tags || [],
    }
  }

  async submitContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<ContactMessage> {
    const messagesKey = 'lovespark-contact-messages'
    const messages = await window.spark.kv.get<ContactMessage[]>(messagesKey) || []
    
    const newMessage: ContactMessage = {
      ...message,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'new',
    }
    
    messages.push(newMessage)
    await window.spark.kv.set(messagesKey, messages)
    
    return newMessage
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const messagesKey = 'lovespark-contact-messages'
    const messages = await window.spark.kv.get<ContactMessage[]>(messagesKey) || []
    
    return messages.sort((a: ContactMessage, b: ContactMessage) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const blogService = new BlogService()

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Sparkle, Calendar, Clock, ArrowRight } from '@phosphor-icons/react'
import type { AppView } from '@/App'

interface BlogPageProps {
  onNavigate: (view: AppView) => void
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const articles = [
    {
      id: 1,
      title: 'Understanding Your Attachment Style: The Key to Relationship Intelligence',
      summary: 'Discover how your attachment style shapes your relationships and learn practical strategies to develop secure attachment patterns.',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'UNDERSTAND',
      categoryColor: 'understand'
    },
    {
      id: 2,
      title: 'The Science of Effective Communication in Modern Relationships',
      summary: 'Learn evidence-based communication techniques that high-achieving couples use to stay aligned and connected.',
      date: '2024-01-10',
      readTime: '6 min read',
      category: 'ALIGN',
      categoryColor: 'align'
    },
    {
      id: 3,
      title: 'Building Relationship Habits That Last: A Data-Driven Approach',
      summary: 'Transform your relationship through consistent, small actions. Discover the behavioral optimization strategies that work.',
      date: '2024-01-05',
      readTime: '7 min read',
      category: 'ELEVATE',
      categoryColor: 'elevate'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo />
              <span className="text-xl font-semibold text-foreground">LoveSpark</span>
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('blog')}
                className="text-sm font-medium text-foreground transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Contact
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('login')}
                className="text-sm"
              >
                Log In
              </Button>
              <Button 
                onClick={() => onNavigate('register')}
                className="text-sm bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">Insights & Guidance</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              The LoveSpark{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-align bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Psychology-backed insights, relationship intelligence strategies, and AI-powered guidance for modern couples.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8">
              {articles.map((article) => (
                <article 
                  key={article.id}
                  className="bg-card rounded-2xl border border-border/50 p-8 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${article.categoryColor}/10 text-${article.categoryColor}`}>
                          {article.category}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} />
                          <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock size={16} />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                        <span>Read article</span>
                        <ArrowRight size={20} weight="bold" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-6">
                More articles coming soon. Subscribe to get notified when we publish new content.
              </p>
              <Button 
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
              >
                Get Started with LoveSpark
                <Sparkle className="ml-2" weight="fill" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border/40 py-12 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo />
                <span className="text-lg font-semibold text-foreground">LoveSpark</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-first relationship intelligence platform for high-achieving individuals and couples.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('dashboard')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('ai-coach')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Coach
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('about')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('contact')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LoveSpark. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

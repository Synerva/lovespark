import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PublicHeader } from '@/components/PublicHeader'
import { Logo } from '@/components/Logo'
import { Sparkle, PaperPlaneTilt, EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AppView } from '@/App'

interface ContactPageProps {
  onNavigate: (view: AppView) => void
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PublicHeader currentView="contact" onNavigate={onNavigate} />

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-align/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkle className="text-primary" size={20} weight="fill" />
              <span className="text-sm font-medium text-primary">Get in Touch</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              Contact{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-align bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Have questions about LoveSpark? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <EnvelopeSimple size={24} className="text-primary" weight="fill" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">hello@lovespark.ai</p>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin size={24} className="text-secondary" weight="fill" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-align/10 flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} className="text-align" weight="fill" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Support</h3>
                <p className="text-sm text-muted-foreground">Available 24/7</p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-xl">
              <h2 className="text-3xl font-bold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary via-secondary to-align hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <PaperPlaneTilt className="ml-2" weight="fill" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border/40 py-12">
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

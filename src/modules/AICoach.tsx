import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PaperPlaneTilt, Robot, Lock, Sparkle, User } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, AIMessage, Subscription } from '@/lib/types'
import { generateAICoachResponse } from '@/lib/ai-service'
import { ArrowLeft } from '@phosphor-icons/react'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { toast } from 'sonner'
import { formatAIMessage } from '@/lib/message-formatter'

interface AICoachProps {
  risScore: RISScore
  onNavigate: (view: AppView) => void
}

export function AICoach({ risScore, onNavigate }: AICoachProps) {
  const [messages, setMessages] = useKV<AIMessage[]>('lovespark-ai-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [subscription] = useKV<Subscription | null>('lovespark-subscription', null)
  const [weeklyMessageCount, setWeeklyMessageCount] = useKV<number>('lovespark-weekly-message-count', 0)
  const [weekStartDate, setWeekStartDate] = useKV<string>('lovespark-week-start-date', FeatureGateService.getWeekStartDate())
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (weekStartDate && FeatureGateService.isNewWeek(weekStartDate)) {
      const reset = FeatureGateService.resetWeeklyLimits()
      setWeeklyMessageCount(reset.messageCount)
      setWeekStartDate(reset.weekStartDate)
    }
  }, [weekStartDate, setWeeklyMessageCount, setWeekStartDate])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  const canSendMessage = FeatureGateService.canSendAIMessage(subscription ?? null, weeklyMessageCount ?? 0)
  const remainingMessages = FeatureGateService.getRemainingAIMessages(subscription ?? null, weeklyMessageCount ?? 0)
  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!canSendMessage) {
      toast.error('Weekly message limit reached. Upgrade to Premium for unlimited messages!')
      return
    }

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...(prev || []), userMessage])
    setInput('')
    setIsLoading(true)

    if (!isPremium) {
      setWeeklyMessageCount((current) => (current ?? 0) + 1)
    }

    try {
      const response = await generateAICoachResponse(input, risScore)
      
      const aiMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        context: { risScore: risScore.overall },
      }

      setMessages((prev) => [...(prev || []), aiMessage])
    } catch (error) {
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm having trouble processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...(prev || []), errorMessage])
      if (!isPremium) {
        setWeeklyMessageCount((current) => Math.max(0, (current ?? 0) - 1))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft size={24} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-full">
                <Robot size={24} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>
                  AI Coach
                </h1>
                <p className="text-xs text-muted-foreground">Your relationship intelligence assistant</p>
              </div>
            </div>
          </div>
          
          {!isPremium && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {remainingMessages === -1 ? 'Unlimited' : `${remainingMessages}/5 messages this week`}
              </span>
              {remainingMessages <= 2 && remainingMessages > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onNavigate('pricing')}
                  className="h-7 text-xs"
                >
                  <Sparkle size={14} className="mr-1" weight="fill" />
                  Upgrade
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {!isPremium && !canSendMessage && (
            <Alert className="bg-accent/10 border-accent">
              <Lock className="h-5 w-5 text-accent" />
              <AlertDescription className="ml-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Weekly message limit reached</p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Premium for unlimited AI coaching conversations
                    </p>
                  </div>
                  <Button onClick={() => onNavigate('pricing')} size="sm" className="w-full sm:w-auto whitespace-nowrap">
                    <Sparkle size={16} className="mr-2" weight="fill" />
                    View Plans
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!messages || messages.length === 0 ? (
            <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/10">
              <CardContent className="p-10 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-accent/15 rounded-2xl">
                    <Robot size={40} weight="duotone" className="text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                    Welcome to AI Coach
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me anything about your relationship intelligence, communication patterns, or get personalized insights based on your RIS score of <span className="font-semibold text-primary">{risScore.overall}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-stream-in`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Robot size={18} weight="duotone" className="text-accent" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-md'
                      : 'bg-card border border-border rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {formatAIMessage(msg.content)}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 mt-1 ml-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User size={18} weight="duotone" className="text-secondary" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start animate-stream-in">
              <div className="flex-shrink-0 mt-1 mr-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Robot size={18} weight="duotone" className="text-accent" />
                </div>
              </div>
              <div className="bg-card border border-border rounded-3xl rounded-tl-sm px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {!isPremium && remainingMessages > 0 && remainingMessages <= 2 && (
            <div className="text-center text-sm text-muted-foreground">
              {remainingMessages} {remainingMessages === 1 ? 'message' : 'messages'} remaining this week
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={canSendMessage ? "Ask about your relationship patterns..." : "Upgrade to continue chatting..."}
              disabled={isLoading || !canSendMessage}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim() || !canSendMessage}>
              <PaperPlaneTilt size={20} weight="fill" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

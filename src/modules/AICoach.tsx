import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneTilt, Robot } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, AIMessage } from '@/lib/types'
import { generateAICoachResponse } from '@/lib/ai-service'
import { ArrowLeft } from '@phosphor-icons/react'

interface AICoachProps {
  risScore: RISScore
  onNavigate: (view: AppView) => void
}

export function AICoach({ risScore, onNavigate }: AICoachProps) {
  const [messages, setMessages] = useKV<AIMessage[]>('lovespark-ai-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...(prev || []), userMessage])
    setInput('')
    setIsLoading(true)

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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
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
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {!messages || messages.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Start a conversation to get insights about your relationship intelligence
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/10 text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent/10 p-4 rounded-lg">
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your relationship patterns..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <PaperPlaneTilt size={20} weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  )
}

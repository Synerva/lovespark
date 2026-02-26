import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PaperPlaneTilt, Robot, Lock, Sparkle, User, Microphone, Stop, SpeakerHigh, SpeakerSlash, Pause, Play, CaretDown } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, AIMessage, Subscription } from '@/lib/types'
import { generateAICoachResponse } from '@/lib/ai-service'
import { ArrowLeft } from '@phosphor-icons/react'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { toast } from 'sonner'
import { formatAIMessage } from '@/lib/message-formatter'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [autoSpeak, setAutoSpeak] = useKV<boolean>('lovespark-auto-speak', false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')
  const { isSupported: ttsSupported, isSpeaking, isPaused, voices, selectedVoice, setSelectedVoice, speak, pause, resume, stop } = useTextToSpeech()

  useEffect(() => {
    if (weekStartDate && FeatureGateService.isNewWeek(weekStartDate)) {
      const reset = FeatureGateService.resetWeeklyLimits()
      setWeeklyMessageCount(reset.messageCount)
      setWeekStartDate(reset.weekStartDate)
    }
  }, [weekStartDate, setWeeklyMessageCount, setWeekStartDate])

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        if (final) {
          finalTranscriptRef.current += final
          setInput(finalTranscriptRef.current)
        }
        
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          setIsRecording(false)
          toast.error('Microphone access denied. Please enable microphone permissions.')
        } else if (event.error === 'aborted') {
          setIsRecording(false)
        } else if (event.error === 'no-speech') {
          toast('No speech detected. Keep speaking or stop recording.', {
            duration: 2000,
          })
        } else if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error)
        }
      }

      recognition.onend = () => {
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (error) {
            console.log('Recognition restart prevented:', error)
          }
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (error) {
          console.log('Recognition cleanup error:', error)
        }
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null)
    }
  }, [isSpeaking])

  const canSendMessage = FeatureGateService.canSendAIMessage(subscription ?? null, weeklyMessageCount ?? 0)
  const remainingMessages = FeatureGateService.getRemainingAIMessages(subscription ?? null, weeklyMessageCount ?? 0)
  const isPremium = subscription && subscription.status === 'active' && subscription.planName !== 'FREE'

  const getLowestPillar = () => {
    const scores = {
      understand: risScore.understand,
      align: risScore.align,
      elevate: risScore.elevate
    }
    return Object.entries(scores).reduce((lowest, [key, value]) => 
      value < scores[lowest as keyof typeof scores] ? key : lowest
    , 'understand')
  }

  const getPersonalizedQuestions = () => {
    const lowestPillar = getLowestPillar()
    const overallScore = risScore.overall

    const allQuestions = {
      understand_low: [
        {
          text: `My Understand score is ${risScore.understand}. How can I better recognize my partner's emotional needs?`,
          icon: "🧠",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        },
        {
          text: "What are effective techniques for active listening in relationships?",
          icon: "👂",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        },
        {
          text: "How can I develop more empathy for my partner's perspective?",
          icon: "💙",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        },
        {
          text: "What questions should I ask to understand my partner better?",
          icon: "❓",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        }
      ],
      understand_high: [
        {
          text: "How can I maintain my strong understanding of my partner?",
          icon: "🧠",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        },
        {
          text: "What are advanced communication techniques I can explore?",
          icon: "💬",
          gradient: "from-understand/15 to-understand/5",
          borderColor: "border-understand/30",
          hoverColor: "hover:border-understand/50"
        }
      ],
      align_low: [
        {
          text: `My Align score is ${risScore.align}. How can we find common ground on our goals?`,
          icon: "🎯",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        },
        {
          text: "What exercises help couples align their values and priorities?",
          icon: "🤝",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        },
        {
          text: "How do we handle differing life goals constructively?",
          icon: "🛤️",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        },
        {
          text: "What's the best way to negotiate compromises together?",
          icon: "⚖️",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        }
      ],
      align_high: [
        {
          text: "How can we build on our strong alignment to achieve shared dreams?",
          icon: "🎯",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        },
        {
          text: "What planning strategies work best for aligned couples?",
          icon: "📋",
          gradient: "from-align/15 to-align/5",
          borderColor: "border-align/30",
          hoverColor: "hover:border-align/50"
        }
      ],
      elevate_low: [
        {
          text: `My Elevate score is ${risScore.elevate}. How can we add more excitement to our relationship?`,
          icon: "✨",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        },
        {
          text: "What activities can help us reconnect emotionally?",
          icon: "💖",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        },
        {
          text: "How do we break out of relationship routines and reignite passion?",
          icon: "🔥",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        },
        {
          text: "What are effective ways to increase appreciation and gratitude?",
          icon: "🙏",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        }
      ],
      elevate_high: [
        {
          text: "How can we keep our relationship dynamic and exciting long-term?",
          icon: "✨",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        },
        {
          text: "What advanced intimacy practices can deepen our connection?",
          icon: "💖",
          gradient: "from-elevate/15 to-elevate/5",
          borderColor: "border-elevate/30",
          hoverColor: "hover:border-elevate/50"
        }
      ],
      general: [
        {
          text: `With a RIS score of ${overallScore}, what should I focus on first?`,
          icon: "📊",
          gradient: "from-primary/10 to-primary/5",
          borderColor: "border-primary/20",
          hoverColor: "hover:border-primary/40"
        },
        {
          text: "What does my overall relationship score tell me?",
          icon: "💡",
          gradient: "from-accent/10 to-accent/5",
          borderColor: "border-accent/20",
          hoverColor: "hover:border-accent/40"
        },
        {
          text: "How can I have more effective conversations with my partner?",
          icon: "💬",
          gradient: "from-secondary/10 to-secondary/5",
          borderColor: "border-secondary/20",
          hoverColor: "hover:border-secondary/40"
        },
        {
          text: "Give me tips for handling conflicts constructively",
          icon: "🛡️",
          gradient: "from-muted/20 to-muted/5",
          borderColor: "border-muted-foreground/20",
          hoverColor: "hover:border-muted-foreground/40"
        }
      ]
    }

    let primaryQuestions: typeof allQuestions.general = []
    
    if (lowestPillar === 'understand') {
      primaryQuestions = risScore.understand < 50 ? allQuestions.understand_low : allQuestions.understand_high
    } else if (lowestPillar === 'align') {
      primaryQuestions = risScore.align < 50 ? allQuestions.align_low : allQuestions.align_high
    } else {
      primaryQuestions = risScore.elevate < 50 ? allQuestions.elevate_low : allQuestions.elevate_high
    }

    const secondaryPillars = ['understand', 'align', 'elevate'].filter(p => p !== lowestPillar)
    const secondaryQuestions: typeof allQuestions.general = []
    
    secondaryPillars.forEach(pillar => {
      const score = risScore[pillar as keyof Pick<RISScore, 'understand' | 'align' | 'elevate'>]
      if (pillar === 'understand') {
        secondaryQuestions.push(...(score < 50 ? allQuestions.understand_low.slice(0, 1) : allQuestions.understand_high.slice(0, 1)))
      } else if (pillar === 'align') {
        secondaryQuestions.push(...(score < 50 ? allQuestions.align_low.slice(0, 1) : allQuestions.align_high.slice(0, 1)))
      } else {
        secondaryQuestions.push(...(score < 50 ? allQuestions.elevate_low.slice(0, 1) : allQuestions.elevate_high.slice(0, 1)))
      }
    })

    const selectedQuestions = [
      ...primaryQuestions.slice(0, 2),
      ...secondaryQuestions,
      ...allQuestions.general.slice(0, 1)
    ].slice(0, 4)

    return selectedQuestions
  }

  const suggestedQuestions = getPersonalizedQuestions()

  const handleQuestionClick = (question: string) => {
    if (!canSendMessage) {
      toast.error('Weekly message limit reached. Upgrade to Premium for unlimited messages!')
      return
    }
    setInput(question)
  }

  const handleSpeakMessage = (messageId: string, content: string) => {
    if (!ttsSupported) {
      toast.error('Text-to-speech is not supported in your browser.')
      return
    }

    if (speakingMessageId === messageId && isSpeaking) {
      stop()
      setSpeakingMessageId(null)
    } else {
      const cleanText = content.replace(/[#*_~`]/g, '').replace(/\n+/g, ' ')
      speak(cleanText)
      setSpeakingMessageId(messageId)
    }
  }

  const handlePauseResume = () => {
    if (isPaused) {
      resume()
    } else {
      pause()
    }
  }

  const handleVoiceToggle = () => {
    if (!speechSupported) {
      toast.error('Voice input is not supported in your browser.')
      return
    }

    if (!canSendMessage) {
      toast.error('Weekly message limit reached. Upgrade to Premium for unlimited messages!')
      return
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop()
        setIsRecording(false)
        setInterimTranscript('')
        toast.success('Recording stopped')
      } catch (error) {
        console.error('Failed to stop voice recognition:', error)
      }
    } else {
      try {
        finalTranscriptRef.current = ''
        setInput('')
        setInterimTranscript('')
        recognitionRef.current?.start()
        setIsRecording(true)
        toast.success('Continuous recording started - speak freely!', {
          description: 'Click the stop button when finished'
        })
      } catch (error) {
        console.error('Failed to start voice recognition:', error)
        toast.error('Failed to start voice recognition. Please try again.')
      }
    }
  }

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

      if (autoSpeak && ttsSupported) {
        const cleanText = response.replace(/[#*_~`]/g, '').replace(/\n+/g, ' ')
        speak(cleanText)
        setSpeakingMessageId(aiMessage.id)
      }
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
          
          <div className="flex items-center gap-2">
            {ttsSupported && voices.length > 0 && (
              <Select
                value={selectedVoice?.name || ''}
                onValueChange={(value) => {
                  const voice = voices.find((v) => v.name === value)
                  if (voice) setSelectedVoice(voice)
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs hidden lg:flex">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices
                    .filter((voice) => voice.lang.startsWith('en'))
                    .map((voice) => (
                      <SelectItem key={voice.name} value={voice.name} className="text-xs">
                        {voice.name.replace(/^(Google|Microsoft|Apple)[\s-]*/i, '')}
                        {voice.lang !== 'en-US' && ` (${voice.lang})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {ttsSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoSpeak((prev) => !prev)}
                className="hidden sm:flex items-center gap-2"
                title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
              >
                {autoSpeak ? (
                  <SpeakerHigh size={18} weight="fill" className="text-accent" />
                ) : (
                  <SpeakerSlash size={18} weight="fill" className="text-muted-foreground" />
                )}
                <span className="text-xs">{autoSpeak ? 'Auto-speak on' : 'Auto-speak off'}</span>
              </Button>
            )}
            
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
            <>
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

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground text-center">
                  Get started with these questions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question.text)}
                      disabled={!canSendMessage}
                      className={`group relative overflow-hidden rounded-2xl border-2 ${question.borderColor} ${question.hoverColor} bg-gradient-to-br ${question.gradient} p-4 text-left transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                          {question.icon}
                        </span>
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {question.text}
                        </p>
                      </div>
                      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  ))}
                </div>
              </div>
            </>
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
                <div className="flex flex-col gap-2">
                  <div
                    className={`${
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
                  {msg.role === 'assistant' && ttsSupported && (
                    <div className="flex items-center gap-2 px-2">
                      {speakingMessageId === msg.id && isSpeaking ? (
                        <>
                          {isPaused ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handlePauseResume}
                              className="h-7 px-2 text-xs"
                              title="Resume"
                            >
                              <Play size={14} weight="fill" className="mr-1" />
                              Resume
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handlePauseResume}
                              className="h-7 px-2 text-xs"
                              title="Pause"
                            >
                              <Pause size={14} weight="fill" className="mr-1" />
                              Pause
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeakMessage(msg.id, msg.content)}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            title="Stop"
                          >
                            <Stop size={14} weight="fill" className="mr-1" />
                            Stop
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeakMessage(msg.id, msg.content)}
                          className="h-7 px-2 text-xs"
                          title="Listen to response"
                        >
                          <SpeakerHigh size={14} weight="fill" className="mr-1" />
                          Listen
                        </Button>
                      )}
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
          {isRecording && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-xl animate-pulse">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-destructive">Recording</span>
              </div>
              {interimTranscript && (
                <span className="text-sm text-muted-foreground italic flex-1 truncate">
                  {interimTranscript}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isRecording && handleSend()}
                placeholder={
                  isRecording 
                    ? "Speaking... (click stop when done)" 
                    : canSendMessage 
                    ? "Ask about your relationship patterns..." 
                    : "Upgrade to continue chatting..."
                }
                disabled={isLoading || !canSendMessage || isRecording}
                className={isRecording ? "pr-24" : ""}
              />
              {isRecording && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <div className="w-1 h-3 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-4 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '100ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-5 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-4 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }}></div>
                  <div className="w-1 h-3 bg-destructive rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '0.6s' }}></div>
                </div>
              )}
            </div>
            {speechSupported && (
              <Button
                onClick={handleVoiceToggle}
                disabled={isLoading || !canSendMessage}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={isRecording ? "animate-pulse ring-2 ring-destructive/50" : "hover:bg-accent"}
                title={isRecording ? "Stop recording" : "Start continuous voice recording"}
              >
                {isRecording ? (
                  <Stop size={20} weight="fill" />
                ) : (
                  <Microphone size={20} weight="fill" />
                )}
              </Button>
            )}
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim() || !canSendMessage || isRecording}
              title="Send message"
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

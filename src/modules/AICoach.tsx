import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PaperPlaneTilt, Robot, Lock, Sparkle, User, Microphone, Stop, SpeakerHigh, SpeakerSlash, Pause, Play, CaretDown, ArrowsClockwise, BookmarkSimple, Star, ShareNetwork, Copy, Check, Envelope, Link as LinkIcon, Trash, Warning, MagnifyingGlass, X } from '@phosphor-icons/react'
import type { AppView } from '../App'
import type { RISScore, AIMessage, Subscription } from '@/lib/types'
import { generateAICoachResponse } from '@/lib/ai-service'
import { ArrowLeft } from '@phosphor-icons/react'
import { FeatureGateService } from '@/lib/feature-gate-service'
import { toast } from 'sonner'
import { formatAIMessage } from '@/lib/message-formatter'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  clearConversationMessages,
  deleteMessage,
  getOrCreatePrimaryConversation,
  loadChatHistory,
  saveChatMessage,
} from '@/lib/db/ai'
import { getAuthenticatedUserId } from '@/lib/db/auth'
import { getCurrentSubscription } from '@/lib/db/subscriptions'
import { getStateSnapshot, upsertStateSnapshot } from '@/lib/db/state-snapshots'
import {
  hasFeatureMigrationCompleted,
  loadLegacyMessages,
  loadLegacySubscription,
  markFeatureMigrationCompleted,
} from '@/lib/db/migration'

interface AICoachProps {
  risScore: RISScore
  onNavigate: (view: AppView) => void
}

export function AICoach({ risScore, onNavigate }: AICoachProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [weeklyMessageCount, setWeeklyMessageCount] = useState(0)
  const [weekStartDate, setWeekStartDate] = useState(FeatureGateService.getWeekStartDate())
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [autoSpeak, setAutoSpeak] = useKV<boolean>('lovespark-auto-speak', false)
  const [questionSet, setQuestionSet] = useState(0)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useKV<string[]>('lovespark-bookmarked-questions', [])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [emailBody, setEmailBody] = useState('')
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false)
  const [clearedMessagesBackup, setClearedMessagesBackup] = useState<AIMessage[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { isSupported: ttsSupported, isSpeaking, isPaused, voices, selectedVoice, setSelectedVoice, speak, pause, resume, stop } = useTextToSpeech()

  useEffect(() => {
    const loadData = async () => {
      const userId = await getAuthenticatedUserId()
      if (!userId) {
        console.log('[Chat] No authenticated user, skipping chat init')
        return
      }

      try {
        console.log('[Chat] Init started', { userId })
        const history = await loadChatHistory()
        setConversationId(history.conversationId)
        setMessages(history.messages)
        console.log('[Chat] Conversation loaded', { conversationId: history.conversationId, messageCount: history.messages.length })
      } catch (error) {
        console.error('Failed to load Supabase chat history:', error)
      }

      try {
        const sub = await getCurrentSubscription()
        setSubscription(sub)
      } catch (error) {
        console.error('Failed to load subscription for AI coach:', error)
      }

      try {
        const count = await getStateSnapshot<number>('weekly_message_count')
        const windowStart = await getStateSnapshot<string>('weekly_message_window')
        setWeeklyMessageCount(count ?? 0)
        setWeekStartDate(windowStart ?? FeatureGateService.getWeekStartDate())
      } catch (error) {
        console.error('Failed to load weekly AI message counters:', error)
      }

      if (!hasFeatureMigrationCompleted('ai-messages')) {
        try {
          const legacyMessages = await loadLegacyMessages(userId)
          if (legacyMessages && legacyMessages.length > 0) {
            const cid = await getOrCreatePrimaryConversation()
            setConversationId(cid)
            for (const msg of legacyMessages) {
              await saveChatMessage(cid, msg)
            }
            setMessages(legacyMessages)
          }
          markFeatureMigrationCompleted('ai-messages')
        } catch (error) {
          console.error('Failed migrating legacy AI messages:', error)
        }
      }

      if (!hasFeatureMigrationCompleted('subscription')) {
        try {
          const legacySubscription = await loadLegacySubscription()
          if (legacySubscription && !subscription) {
            setSubscription(legacySubscription)
          }
          markFeatureMigrationCompleted('subscription')
        } catch (error) {
          console.error('Failed migrating legacy subscription snapshot:', error)
        }
      }
    }

    void loadData()
  }, [])

  useEffect(() => {
    if (weekStartDate && FeatureGateService.isNewWeek(weekStartDate)) {
      const reset = FeatureGateService.resetWeeklyLimits()
      setWeeklyMessageCount(reset.messageCount)
      setWeekStartDate(reset.weekStartDate)
      void upsertStateSnapshot('weekly_message_count', reset.messageCount)
      void upsertStateSnapshot('weekly_message_window', reset.weekStartDate)
    }
  }, [weekStartDate])

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

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

  const filteredMessages = searchQuery.trim() 
    ? (messages || []).filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages || []

  const hasSearchResults = searchQuery.trim() && filteredMessages.length > 0
  const hasNoSearchResults = searchQuery.trim() && filteredMessages.length === 0

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

  const getPersonalizedQuestions = (setIndex: number = 0) => {
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

    const allAvailableQuestions = [...primaryQuestions, ...secondaryQuestions, ...allQuestions.general]
    const startIndex = (setIndex * 4) % allAvailableQuestions.length
    const selectedQuestions = []
    
    for (let i = 0; i < 4; i++) {
      const index = (startIndex + i) % allAvailableQuestions.length
      selectedQuestions.push(allAvailableQuestions[index])
    }

    return selectedQuestions
  }

  const suggestedQuestions = getPersonalizedQuestions(questionSet)

  const handleQuestionClick = (question: string) => {
    if (!canSendMessage) {
      toast.error('Weekly message limit reached. Upgrade to Premium for unlimited messages!')
      return
    }
    setInput(question)
  }

  const handleRefreshQuestions = () => {
    setQuestionSet((prev) => prev + 1)
    toast.success('New question suggestions loaded!')
  }

  const handleToggleBookmark = (question: string) => {
    setBookmarkedQuestions((current) => {
      const bookmarks = current || []
      if (bookmarks.includes(question)) {
        toast.success('Bookmark removed')
        return bookmarks.filter((q) => q !== question)
      } else {
        toast.success('Question bookmarked!')
        return [...bookmarks, question]
      }
    })
  }

  const isBookmarked = (question: string) => {
    return (bookmarkedQuestions || []).includes(question)
  }

  const handleOpenShareDialog = () => {
    if (!bookmarkedQuestions || bookmarkedQuestions.length === 0) {
      toast.error('No bookmarked questions to share')
      return
    }

    const questions = bookmarkedQuestions.join('\n\n')
    const encodedQuestions = encodeURIComponent(questions)
    const baseUrl = window.location.origin
    const link = `${baseUrl}?shared-questions=${encodedQuestions}`
    setShareLink(link)
    
    const emailTemplate = `Hi,\n\nI'd like to share some relationship reflection questions with you:\n\n${bookmarkedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}\n\nThese questions have been helpful for me in exploring my relationship patterns and growth areas. I thought they might be useful for us to discuss together.\n\nBest,\n[Your name]`
    setEmailBody(emailTemplate)
    
    setShareDialogOpen(true)
    setCopied(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyQuestions = async () => {
    try {
      const questions = (bookmarkedQuestions || []).map((q, i) => `${i + 1}. ${q}`).join('\n\n')
      await navigator.clipboard.writeText(questions)
      toast.success('Questions copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy questions')
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Relationship Questions to Explore Together')
    const body = encodeURIComponent(emailBody)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const handleClearHistory = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }

    const backup = messages || []
    setClearedMessagesBackup(backup)
    setMessages([])
    setClearHistoryDialogOpen(false)

    if (conversationId) {
      void clearConversationMessages(conversationId)
    }

    toast.success(`Chat history cleared (${backup.length} messages)`, {
      description: 'You can undo this action',
      action: {
        label: 'Undo',
        onClick: handleUndoClear,
      },
      duration: 10000,
    })

    undoTimeoutRef.current = setTimeout(() => {
      setClearedMessagesBackup(null)
    }, 10000)
  }

  const handleUndoClear = () => {
    if (clearedMessagesBackup) {
      setMessages(clearedMessagesBackup)
      if (conversationId) {
        void (async () => {
          await clearConversationMessages(conversationId)
          for (const message of clearedMessagesBackup) {
            await saveChatMessage(conversationId, message)
          }
        })()
      }
      setClearedMessagesBackup(null)
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
        undoTimeoutRef.current = null
      }
      toast.success('Chat history restored!')
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages((current) => (current || []).filter((msg) => msg.id !== messageId))
    void deleteMessage(messageId)
    toast.success('Message deleted')
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

    const pendingInput = input.trim()
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: pendingInput,
      timestamp: new Date().toISOString(),
    }

    setInput('')
    setIsLoading(true)
    console.log('[Chat] Send message start')

    let activeConversationId = conversationId
    if (!activeConversationId) {
      try {
        console.log('[Chat] Conversation bootstrap start')
        activeConversationId = await getOrCreatePrimaryConversation()
        console.log('[Chat] Conversation bootstrap success:', activeConversationId)
        setConversationId(activeConversationId)
      } catch (error) {
        console.error('[Chat] Conversation bootstrap failed:', error)
        toast.error('Unable to open your chat history. Please try again.')
        setIsLoading(false)
        return
      }
    }

    try {
      console.log('[Chat] User message insert start')
      await saveChatMessage(activeConversationId, userMessage)
      console.log('[Chat] User message insert success')
      setMessages((prev) => [...(prev || []), userMessage])
    } catch (error) {
      console.error('Failed writing user AI message to Supabase:', error)
      toast.error('Unable to save your message. Please try again.')
      setInput(pendingInput)
      setIsLoading(false)
      return
    }

    if (!isPremium) {
      const nextCount = (weeklyMessageCount ?? 0) + 1
      setWeeklyMessageCount(nextCount)
      void upsertStateSnapshot('weekly_message_count', nextCount)
      void upsertStateSnapshot('weekly_message_window', weekStartDate)
    }

    try {
      const response = await generateAICoachResponse(pendingInput, risScore)
      
      const aiMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        context: { risScore: risScore.overall },
      }

      console.log('[Chat] Assistant message insert start')
      await saveChatMessage(activeConversationId, aiMessage)
      console.log('[Chat] Assistant message insert success')
      setMessages((prev) => [...(prev || []), aiMessage])

      if (autoSpeak && ttsSupported) {
        const cleanText = response.replace(/[#*_~`]/g, '').replace(/\n+/g, ' ')
        speak(cleanText)
        setSpeakingMessageId(aiMessage.id)
      }
    } catch (error) {
      console.error('[Chat] Failed generating or persisting assistant message:', error)
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I could not complete this response because a save failed. Please retry.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...(prev || []), errorMessage])
      if (!isPremium) {
        const nextCount = Math.max(0, (weeklyMessageCount ?? 0) - 1)
        setWeeklyMessageCount(nextCount)
        void upsertStateSnapshot('weekly_message_count', nextCount)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-4">
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
              {messages && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchActive((prev) => !prev)}
                  className={searchActive ? "bg-accent/20 text-accent" : ""}
                  title={searchActive ? "Close search" : "Search messages"}
                >
                  {searchActive ? <X size={20} weight="bold" /> : <MagnifyingGlass size={20} weight="bold" />}
                </Button>
              )}
              
              {messages && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClearHistoryDialogOpen(true)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Clear chat history"
                >
                  <Trash size={18} weight="bold" />
                  <span className="text-xs hidden sm:inline">Clear history</span>
                </Button>
              )}
            
            {bookmarkedQuestions && bookmarkedQuestions.length > 0 && (
              <>
                <Button
                  variant={showBookmarks ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowBookmarks((prev) => !prev)}
                  className="flex items-center gap-2"
                  title={showBookmarks ? "Show all questions" : `View ${bookmarkedQuestions.length} bookmarked questions`}
                >
                  <BookmarkSimple size={18} weight={showBookmarks ? "fill" : "bold"} />
                  <span className="text-xs hidden sm:inline">
                    {showBookmarks ? 'All questions' : `${bookmarkedQuestions.length} saved`}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenShareDialog}
                  className="flex items-center gap-2"
                  title="Share bookmarked questions"
                >
                  <ShareNetwork size={18} weight="bold" />
                  <span className="text-xs hidden md:inline">Share</span>
                </Button>
              </>
            )}
            
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
          
          {searchActive && messages && messages.length > 0 && (
            <div className="relative">
              <MagnifyingGlass size={18} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-10 pr-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear search"
                >
                  <X size={18} weight="bold" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {searchActive && hasNoSearchResults && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-8 text-center">
                <MagnifyingGlass size={32} weight="duotone" className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">No messages found</p>
                <p className="text-xs text-muted-foreground">
                  Try different keywords or clear the search to see all messages
                </p>
              </CardContent>
            </Card>
          )}
          
          {searchActive && hasSearchResults && (
            <Alert className="bg-accent/10 border-accent/30">
              <MagnifyingGlass className="h-5 w-5 text-accent" weight="bold" />
              <AlertDescription className="ml-2">
                <p className="text-sm font-medium text-foreground">
                  Found {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'} matching "{searchQuery}"
                </p>
              </AlertDescription>
            </Alert>
          )}
          
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

          {!searchActive && (!messages || messages.length === 0) ? (
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
                      Welcome to AI Assistant
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ask me anything about your relationship intelligence, communication patterns, or get personalized insights based on your RIS score of <span className="font-semibold text-primary">{risScore.overall}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {showBookmarks ? 'Your bookmarked questions' : 'Get started with these questions'}
                  </h4>
                  {!showBookmarks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshQuestions}
                      className="h-8 px-3 gap-2 text-xs hover:bg-accent/20"
                      title="Refresh questions"
                    >
                      <ArrowsClockwise size={16} weight="bold" className="text-accent" />
                      <span className="hidden sm:inline">New questions</span>
                    </Button>
                  )}
                </div>
                {showBookmarks && (!bookmarkedQuestions || bookmarkedQuestions.length === 0) ? (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-8 text-center">
                      <BookmarkSimple size={32} weight="duotone" className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No bookmarked questions yet. Bookmark your favorite questions for quick access!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" key={`questions-${showBookmarks ? 'bookmarks' : questionSet}`}>
                    {(showBookmarks ? (bookmarkedQuestions || []) : suggestedQuestions.map(q => q.text)).map((questionText, index) => {
                      const question = showBookmarks 
                        ? { text: questionText, icon: "⭐", gradient: "from-accent/15 to-accent/5", borderColor: "border-accent/30", hoverColor: "hover:border-accent/50" }
                        : suggestedQuestions[index]
                      
                      return (
                        <div
                          key={index}
                          className={`group relative overflow-hidden rounded-2xl border-2 ${question.borderColor} ${question.hoverColor} bg-gradient-to-br ${question.gradient} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${!canSendMessage ? 'opacity-50' : ''}`}
                        >
                          <button
                            onClick={() => handleQuestionClick(question.text)}
                            disabled={!canSendMessage}
                            className="w-full p-4 text-left disabled:cursor-not-allowed"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                {question.icon}
                              </span>
                              <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                                {question.text}
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleBookmark(question.text)
                            }}
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-background/50 transition-colors duration-200"
                            title={isBookmarked(question.text) ? "Remove bookmark" : "Bookmark question"}
                          >
                            <BookmarkSimple 
                              size={18} 
                              weight={isBookmarked(question.text) ? "fill" : "bold"}
                              className={isBookmarked(question.text) ? "text-accent" : "text-muted-foreground hover:text-accent"}
                            />
                          </button>
                          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-stream-in group`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Robot size={18} weight="duotone" className="text-accent" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 relative">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive hover:border-destructive hover:text-destructive-foreground z-10"
                      title="Delete message"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
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
              ))}
              
              {!isLoading && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {showBookmarks ? 'Your bookmarked questions' : 'Continue the conversation'}
                    </h4>
                    {!showBookmarks && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshQuestions}
                        className="h-8 px-3 gap-2 text-xs hover:bg-accent/20"
                        title="Refresh questions"
                      >
                        <ArrowsClockwise size={16} weight="bold" className="text-accent" />
                        <span className="hidden sm:inline">New questions</span>
                      </Button>
                    )}
                  </div>
                  {showBookmarks && (!bookmarkedQuestions || bookmarkedQuestions.length === 0) ? (
                    <Card className="bg-muted/30 border-dashed">
                      <CardContent className="p-8 text-center">
                        <BookmarkSimple size={32} weight="duotone" className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No bookmarked questions yet. Bookmark your favorite questions for quick access!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" key={`questions-conversation-${showBookmarks ? 'bookmarks' : questionSet}`}>
                      {(showBookmarks ? (bookmarkedQuestions || []) : suggestedQuestions.map(q => q.text)).map((questionText, index) => {
                        const question = showBookmarks 
                          ? { text: questionText, icon: "⭐", gradient: "from-accent/15 to-accent/5", borderColor: "border-accent/30", hoverColor: "hover:border-accent/50" }
                          : suggestedQuestions[index]
                        
                        return (
                          <div
                            key={index}
                            className={`group relative overflow-hidden rounded-2xl border-2 ${question.borderColor} ${question.hoverColor} bg-gradient-to-br ${question.gradient} transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${!canSendMessage ? 'opacity-50' : ''}`}
                          >
                            <button
                              onClick={() => handleQuestionClick(question.text)}
                              disabled={!canSendMessage}
                              className="w-full p-4 text-left disabled:cursor-not-allowed"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                  {question.icon}
                                </span>
                                <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                                  {question.text}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleBookmark(question.text)
                              }}
                              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-background/50 transition-colors duration-200"
                              title={isBookmarked(question.text) ? "Remove bookmark" : "Bookmark question"}
                            >
                              <BookmarkSimple 
                                size={18} 
                                weight={isBookmarked(question.text) ? "fill" : "bold"}
                                className={isBookmarked(question.text) ? "text-accent" : "text-muted-foreground hover:text-accent"}
                              />
                            </button>
                            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
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

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <ShareNetwork size={24} weight="duotone" className="text-accent" />
              Share Bookmarked Questions
            </DialogTitle>
            <DialogDescription>
              Share your bookmarked questions with your partner to facilitate meaningful conversations.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">
                <LinkIcon size={16} className="mr-2" weight="bold" />
                Link
              </TabsTrigger>
              <TabsTrigger value="email">
                <Envelope size={16} className="mr-2" weight="bold" />
                Email
              </TabsTrigger>
              <TabsTrigger value="copy">
                <Copy size={16} className="mr-2" weight="bold" />
                Copy Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Share this link with your partner. They'll be able to view all your bookmarked questions.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 font-mono text-xs bg-muted"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                    {copied ? (
                      <>
                        <Check size={18} weight="bold" className="text-success" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} weight="bold" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Preview Questions ({bookmarkedQuestions?.length || 0})</h4>
                <ScrollArea className="h-[200px] w-full border rounded-lg p-4">
                  <div className="space-y-3">
                    {(bookmarkedQuestions || []).map((question, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                          {index + 1}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{question}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Customize the email message and send it to your partner.
                </p>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="min-h-[280px] font-sans text-sm"
                  placeholder="Compose your email message..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleEmailShare} className="gap-2">
                  <Envelope size={18} weight="fill" />
                  Open in Email App
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="copy" className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Copy the questions as plain text to paste anywhere (messages, notes, documents).
                </p>
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <ScrollArea className="h-[280px] w-full">
                      <div className="space-y-3 text-sm">
                        {(bookmarkedQuestions || []).map((question, index) => (
                          <div key={index}>
                            <span className="font-semibold">{index + 1}.</span> {question}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={handleCopyQuestions} variant="outline" className="gap-2">
                  <Copy size={18} weight="bold" />
                  Copy All Questions
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
              <Sparkle size={20} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Why share questions?</p>
                <p>Sharing your bookmarked questions helps create transparency and opens up meaningful conversations with your partner about areas you're exploring in your relationship journey.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={clearHistoryDialogOpen} onOpenChange={setClearHistoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <Warning size={24} weight="duotone" className="text-destructive" />
              Clear Chat History
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all chat messages? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="border-t pt-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <Warning size={20} weight="duotone" className="text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{messages?.length || 0} message{(messages?.length || 0) !== 1 ? 's' : ''} from your conversation history</li>
                  <li>All AI coach responses and your questions</li>
                </ul>
                <p className="mt-2">Your bookmarked questions will be preserved.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setClearHistoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              className="gap-2"
            >
              <Trash size={18} weight="bold" />
              Clear History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

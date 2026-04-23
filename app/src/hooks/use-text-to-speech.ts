import { useState, useEffect, useRef, useCallback } from 'react'

export interface TTSOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)

        const preferredVoice = availableVoices.find(
          (voice) =>
            voice.lang.startsWith('en') &&
            (voice.name.includes('Enhanced') ||
              voice.name.includes('Premium') ||
              voice.name.includes('Natural') ||
              voice.name.includes('Google') ||
              voice.name.includes('Microsoft'))
        ) || availableVoices.find((voice) => voice.lang.startsWith('en'))

        if (preferredVoice) {
          setSelectedVoice(preferredVoice)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string, options?: TTSOptions) => {
    if (!isSupported || !text) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = options?.voice || selectedVoice
    utterance.rate = options?.rate ?? 1
    utterance.pitch = options?.pitch ?? 1
    utterance.volume = options?.volume ?? 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isSupported, selectedVoice])

  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [isSupported, isSpeaking, isPaused])

  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [isSupported, isSpeaking, isPaused])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }
  }, [isSupported])

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    stop,
  }
}

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RISScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  delta?: number
  animate?: boolean
}

export function RISScoreRing({
  score,
  size = 200,
  strokeWidth = 16,
  showLabel = true,
  delta,
  animate = true,
}: RISScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    if (animate) {
      const duration = 1200
      const steps = 60
      const increment = score / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= score) {
          setDisplayScore(score)
          clearInterval(timer)
        } else {
          setDisplayScore(Math.round(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    } else {
      setDisplayScore(score)
    }
  }, [score, animate])

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(0.92 0.01 30)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.22 280)" />
            <stop offset="50%" stopColor="oklch(0.62 0.24 340)" />
            <stop offset="100%" stopColor="oklch(0.68 0.20 140)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showLabel && (
          <>
            <motion.div
              className="text-5xl font-semibold"
              style={{ fontFamily: 'Sora, sans-serif' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {displayScore}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">RIS Score</div>
            {delta !== undefined && delta !== 0 && (
              <motion.div
                className={cn(
                  'text-xs font-medium mt-1 px-2 py-0.5 rounded-full animate-score-pulse',
                  delta > 0
                    ? 'bg-success/20 text-success-foreground'
                    : 'bg-destructive/20 text-destructive'
                )}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                {delta > 0 ? '+' : ''}
                {delta}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

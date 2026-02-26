import { motion } from 'framer-motion'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function Logo({ size = 40, showText = true, className = '' }: LogoProps) {
  const starSize = size * 0.6
  const smallStarSize = size * 0.2
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200"
        style={{ width: size, height: size }}
      >
        <motion.svg
          width={starSize}
          height={starSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ rotate: 0 }}
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.svg>
        
        <motion.svg
          width={smallStarSize}
          height={smallStarSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ 
            right: '8%',
            top: '15%'
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.2, 1],
            rotate: [0, 180]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="oklch(0.55 0.22 25)"
          />
        </motion.svg>
        
        <motion.svg
          width={smallStarSize * 0.7}
          height={smallStarSize * 0.7}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ 
            right: '18%',
            top: '5%'
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.3, 1],
            rotate: [0, -180]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
        >
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="oklch(0.60 0.18 15)"
          />
        </motion.svg>
      </div>
      
      {showText && (
        <div>
          <h1 className="text-2xl font-bold text-primary leading-none">LoveSpark</h1>
          <p className="text-xs text-muted-foreground mt-1">Relationship Intelligence</p>
        </div>
      )}
    </div>
  )
}

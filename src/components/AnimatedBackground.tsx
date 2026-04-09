import { motion } from 'framer-motion'
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Primary Accent Orb */}
      <motion.div
        animate={{
          x: ['0%', '15%', '-5%', '0%'],
          y: ['0%', '-15%', '10%', '0%'],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-[20%] -left-[10%] h-[80vh] w-[80vw]"
        style={{ 
          background: 'radial-gradient(circle, rgba(var(--accent), 0.15) 0%, transparent 60%)',
          willChange: 'transform, opacity' 
        }}
      />
      
      {/* Secondary Soft Blue Orb */}
      <motion.div
        animate={{
          x: ['0%', '-20%', '15%', '0%'],
          y: ['0%', '20%', '-10%', '0%'],
          scale: [0.8, 1.1, 1, 0.8],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute bottom-[0%] right-[0%] h-[80vh] w-[80vw]"
        style={{ 
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 60%)',
          willChange: 'transform, opacity'
        }}
      />

      {/* Tertiary Ambient Orb to prevent dead zones */}
      <motion.div
        animate={{
          x: ['0%', '10%', '-20%', '0%'],
          y: ['0%', '10%', '-15%', '0%'],
          scale: [1, 0.9, 1.1, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-[30%] left-[20%] h-[60vh] w-[60vw]"
        style={{ 
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
          willChange: 'transform, opacity'
        }}
      />
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'

export function useExamTimer(initialSeconds: number, onTimeUp?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(true)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(ref.current!)
          setRunning(false)
          onTimeUp?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(ref.current!)
  }, [running])

  const pause = () => setRunning(false)
  const resume = () => setRunning(true)

  const elapsed = initialSeconds - seconds

  return { seconds, running, pause, resume, elapsed }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

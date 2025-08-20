"use client"

import { useEffect, useState } from 'react'

interface ModuleTimerProps {
  duration: number // in seconds
  onTimeUp: () => void
  isActive: boolean
}

export default function ModuleTimer({ duration, onTimeUp, isActive }: ModuleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [hasWarned5Min, setHasWarned5Min] = useState(false)
  const [hasWarned1Min, setHasWarned1Min] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        
        // 5 minute warning
        if (newTime === 300 && !hasWarned5Min) {
          setHasWarned5Min(true)
          // Could add notification here
        }
        
        // 1 minute warning
        if (newTime === 60 && !hasWarned1Min) {
          setHasWarned1Min(true)
          // Could add notification here
        }
        
        if (newTime <= 0) {
          onTimeUp()
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp, hasWarned5Min, hasWarned1Min])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-600 animate-pulse'
    if (timeLeft <= 300) return 'text-orange-600'
    return 'text-gray-700'
  }

  const getProgressColor = () => {
    const percentage = (timeLeft / duration) * 100
    if (percentage <= 5) return 'bg-red-500'
    if (percentage <= 15) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  return (
    <div className="enhanced-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={`text-xl font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </div>
      
      {timeLeft <= 300 && timeLeft > 60 && (
        <div className="mt-2 text-sm text-orange-600 font-medium">
          ⚠️ 5 minutes remaining
        </div>
      )}
      
      {timeLeft <= 60 && (
        <div className="mt-2 text-sm text-red-600 font-bold animate-pulse">
          🚨 1 minute remaining!
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { ModuleConfig, ModulePerformance } from '@/types/test'
import EnhancedButton from '@/components/ui/EnhancedButton'

interface ModuleTransitionProps {
  completedModule: ModuleConfig
  nextModule?: ModuleConfig
  performance: ModulePerformance
  onContinue: () => void
  isLastModule?: boolean
}

export default function ModuleTransition({ 
  completedModule, 
  nextModule, 
  performance, 
  onContinue,
  isLastModule = false
}: ModuleTransitionProps) {
  const [breakTimeLeft, setBreakTimeLeft] = useState(180) // 3 minute break
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setBreakTimeLeft((prev) => {
        if (prev <= 1) {
          setCanContinue(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceMessage = () => {
    const percentage = (performance.questionsCorrect / performance.totalQuestions) * 100
    if (percentage >= 80) return "Excellent work! 🎉"
    if (percentage >= 70) return "Great job! 👏"
    if (percentage >= 60) return "Good effort! 💪"
    return "Keep pushing forward! 🚀"
  }

  const getPerformanceColor = () => {
    const percentage = (performance.questionsCorrect / performance.totalQuestions) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-orange-600"
  }

  if (isLastModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="enhanced-card max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Congratulations!
            </h1>
            <p className="text-lg text-gray-600">
              You&apos;ve completed all modules of the SAT practice test!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Final Module Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performance.questionsCorrect}/{performance.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Questions Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((performance.timeUsed / 60))} min
                </div>
                <div className="text-sm text-gray-600">Time Used</div>
              </div>
            </div>
          </div>

          <EnhancedButton
            variant="success"
            size="lg"
            onClick={onContinue}
            className="w-full"
          >
            View Complete Results
          </EnhancedButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="enhanced-card max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {completedModule.title} Complete!
          </h1>
          <p className={`text-lg font-medium ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-center">Module Performance</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {performance.questionsCorrect}/{performance.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((performance.questionsCorrect / performance.totalQuestions) * 100))}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((performance.timeUsed / 60))} min
              </div>
              <div className="text-sm text-gray-600">Used</div>
            </div>
          </div>
        </div>

        {/* Next Module Info */}
        {nextModule && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Up Next:</h2>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">{nextModule.title}</div>
                <div className="text-sm text-gray-600">
                  {nextModule.questionCount} questions • {nextModule.duration} minutes
                </div>
              </div>
              <div className="text-2xl">
                {nextModule.type === 'math' ? '🔢' : '📚'}
              </div>
            </div>
          </div>
        )}

        {/* Break Timer */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">Break time remaining:</div>
          <div className="text-3xl font-bold text-blue-600 mb-4">
            {formatTime(breakTimeLeft)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((180 - breakTimeLeft) / 180) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Take a moment to rest and prepare for the next module
          </p>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full"
          >
            {canContinue ? 'Continue to Next Module' : `Continue in ${formatTime(breakTimeLeft)}`}
          </EnhancedButton>
        </div>
      </div>
    </div>
  )
}
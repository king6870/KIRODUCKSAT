import React, { useState, useEffect } from 'react'
import EnhancedCard from '@/components/ui/EnhancedCard'
import EnhancedBadge from '@/components/ui/EnhancedBadge'
import { Question } from '@/types/test'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer?: number
  onAnswerSelect: (answerIndex: number) => void
  showFeedback?: boolean
  isReviewMode?: boolean
  timeSpent?: number
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showFeedback = false,
  isReviewMode = false,
  timeSpent
}: QuestionCardProps) {
  const [startTime] = useState(Date.now())
  const [currentTimeSpent, setCurrentTimeSpent] = useState(timeSpent || 0)

  // Track time spent on question
  useEffect(() => {
    if (isReviewMode) return

    const interval = setInterval(() => {
      setCurrentTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isReviewMode])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnswerStatus = (optionIndex: number): 'correct' | 'incorrect' | 'selected' | 'unselected' => {
    if (!showFeedback) {
      return selectedAnswer === optionIndex ? 'selected' : 'unselected'
    }

    if (optionIndex === question.correctAnswer) return 'correct'
    if (selectedAnswer === optionIndex && optionIndex !== question.correctAnswer) return 'incorrect'
    return 'unselected'
  }

  const getAnswerClasses = (status: string): string => {
    const baseClasses = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02]'
    
    switch (status) {
      case 'correct':
        return `${baseClasses} border-green-500 bg-green-50 text-green-900 shadow-lg`
      case 'incorrect':
        return `${baseClasses} border-red-500 bg-red-50 text-red-900 shadow-lg`
      case 'selected':
        return `${baseClasses} border-blue-500 bg-blue-50 text-blue-900 shadow-lg transform scale-[1.02]`
      default:
        return `${baseClasses} border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md`
    }
  }

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'reading-comprehension': '📖',
      'grammar': '✏️',
      'vocabulary': '📝',
      'writing-skills': '✍️',
      'algebra': '🔢',
      'geometry': '📐',
      'statistics': '📊',
      'advanced-math': '🧮'
    }
    return icons[category] || '❓'
  }

  const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'danger' => {
    switch (difficulty) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'danger'
      default: return 'warning'
    }
  }

  return (
    <EnhancedCard padding="lg" animation="slide-in-up" className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <EnhancedBadge variant="primary" size="lg">
            Question {questionNumber} of {totalQuestions}
          </EnhancedBadge>
          <EnhancedBadge 
            variant={question.moduleType === 'reading-writing' ? 'secondary' : 'success'}
            size="md"
          >
            {getCategoryIcon(question.category)} {question.category.replace('-', ' ')}
          </EnhancedBadge>
          <EnhancedBadge 
            variant={getDifficultyColor(question.difficulty)}
            size="sm"
          >
            {question.difficulty}
          </EnhancedBadge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {!isReviewMode && (
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{formatTime(currentTimeSpent)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>🎯</span>
            <span>~{Math.ceil(question.timeEstimate / 60)} min</span>
          </div>
        </div>
      </div>

      {/* Passage (if exists) */}
      {question.passage && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📄 Reading Passage
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {question.passage.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const status = getAnswerStatus(index)
          const letter = String.fromCharCode(65 + index) // A, B, C, D
          
          return (
            <button
              key={index}
              onClick={() => !isReviewMode && onAnswerSelect(index)}
              disabled={isReviewMode}
              className={getAnswerClasses(status)}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${status === 'correct' ? 'bg-green-500 text-white' :
                    status === 'incorrect' ? 'bg-red-500 text-white' :
                    status === 'selected' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }
                `}>
                  {letter}
                </div>
                <div className="flex-1 text-left">
                  {option}
                </div>
                {showFeedback && status === 'correct' && (
                  <div className="text-green-600 font-bold">✓</div>
                )}
                {showFeedback && status === 'incorrect' && (
                  <div className="text-red-600 font-bold">✗</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            💡 Explanation
          </h3>
          <p className="text-blue-800 leading-relaxed">
            {question.explanation}
          </p>
          
          {selectedAnswer !== undefined && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-2 ${
                selectedAnswer === question.correctAnswer ? 'text-green-700' : 'text-red-700'
              }`}>
                <span>{selectedAnswer === question.correctAnswer ? '✅' : '❌'}</span>
                <span>
                  Your answer: {String.fromCharCode(65 + selectedAnswer)}
                </span>
              </div>
              <div className="text-green-700 flex items-center gap-2">
                <span>✅</span>
                <span>
                  Correct answer: {String.fromCharCode(65 + question.correctAnswer)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Prompt */}
      {!isReviewMode && selectedAnswer === undefined && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <span>👆</span>
            <span className="font-medium">Please select your answer above</span>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {!isReviewMode && currentTimeSpent > question.timeEstimate && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⏰</span>
            <span className="text-sm">
              You&apos;ve spent more time than recommended on this question. Consider moving on.
            </span>
          </div>
        </div>
      )}
    </EnhancedCard>
  )
}
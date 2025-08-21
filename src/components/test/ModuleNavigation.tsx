import React from 'react'
import EnhancedButton from '@/components/ui/EnhancedButton'
import EnhancedBadge from '@/components/ui/EnhancedBadge'

interface ModuleNavigationProps {
  currentQuestion: number
  totalQuestions: number
  answeredQuestions: number[]
  onQuestionSelect: (questionIndex: number) => void
  onPrevious: () => void
  onNext: () => void
  onSubmitModule: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastQuestion: boolean
  hasAnsweredCurrent: boolean
}

export default function ModuleNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  onQuestionSelect,
  onPrevious,
  onNext,
  onSubmitModule,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  hasAnsweredCurrent
}: ModuleNavigationProps) {
  const getQuestionStatus = (questionIndex: number): 'answered' | 'current' | 'unanswered' => {
    if (questionIndex === currentQuestion) return 'current'
    if (answeredQuestions.includes(questionIndex)) return 'answered'
    return 'unanswered'
  }

  const getQuestionButtonClass = (status: string): string => {
    switch (status) {
      case 'current':
        return 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110'
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
    }
  }

  return (
    <div className="enhanced-card p-6 slide-in-up">
      {/* Question Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
        <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-13 gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const status = getQuestionStatus(index)
            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`
                  w-10 h-10 rounded-lg border-2 font-medium text-sm
                  transition-all duration-200 hover:scale-105
                  ${getQuestionButtonClass(status)}
                `}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-600"></div>
          <span className="text-gray-700">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded border-2 border-green-300"></div>
          <span className="text-gray-700">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded border-2 border-gray-300"></div>
          <span className="text-gray-700">Not Answered</span>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <EnhancedBadge variant="primary" size="md">
            Question {currentQuestion + 1} of {totalQuestions}
          </EnhancedBadge>
          <EnhancedBadge 
            variant={answeredQuestions.length === totalQuestions ? 'success' : 'secondary'}
            size="md"
          >
            {answeredQuestions.length} Answered
          </EnhancedBadge>
        </div>
        
        {!hasAnsweredCurrent && (
          <div className="flex items-center gap-2 text-amber-600">
            <span className="text-sm">⚠️</span>
            <span className="text-sm font-medium">Please select an answer</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-3">
          <EnhancedButton
            variant="secondary"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="min-w-[100px]"
          >
            ← Previous
          </EnhancedButton>
          
          {!isLastQuestion ? (
            <EnhancedButton
              variant="primary"
              onClick={onNext}
              disabled={!canGoNext}
              className="min-w-[100px]"
            >
              Next →
            </EnhancedButton>
          ) : (
            <EnhancedButton
              variant="success"
              onClick={onSubmitModule}
              disabled={answeredQuestions.length < totalQuestions}
              className="min-w-[120px]"
            >
              Submit Module
            </EnhancedButton>
          )}
        </div>

        {/* Quick Submit Option */}
        {answeredQuestions.length === totalQuestions && !isLastQuestion && (
          <EnhancedButton
            variant="success"
            onClick={onSubmitModule}
            size="sm"
          >
            Submit Module Early
          </EnhancedButton>
        )}
      </div>

      {/* Completion Status */}
      {answeredQuestions.length === totalQuestions && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-800 font-medium">
              All questions answered! You can submit the module or review your answers.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import QuestionCard from './QuestionCard'
import ModuleNavigation from './ModuleNavigation'
import { Question, Answer } from '@/types/test'

interface QuestionInterfaceProps {
  questions: Question[]
  answers: Answer[]
  currentQuestion: number
  onAnswerSelect: (questionIndex: number, answerIndex: number, timeSpent: number) => void
  onQuestionChange: (questionIndex: number) => void
  onModuleSubmit: () => void
  isReviewMode?: boolean
}

export default function QuestionInterface({
  questions,
  answers,
  currentQuestion,
  onAnswerSelect,
  onQuestionChange,
  onModuleSubmit,
  isReviewMode = false
}: QuestionInterfaceProps) {
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false)

  // Reset timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now())
    
    // Check if current question is already answered
    const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion]?.id)
    setHasAnsweredCurrent(!!currentAnswer)
  }, [currentQuestion, questions, answers])

  const handleAnswerSelect = (answerIndex: number) => {
    if (isReviewMode) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    onAnswerSelect(currentQuestion, answerIndex, timeSpent)
    setHasAnsweredCurrent(true)
  }

  const handleQuestionSelect = (questionIndex: number) => {
    if (questionIndex !== currentQuestion) {
      onQuestionChange(questionIndex)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      onQuestionChange(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      onQuestionChange(currentQuestion + 1)
    }
  }

  const getAnsweredQuestions = (): number[] => {
    return questions
      .map((question, index) => {
        const hasAnswer = answers.some(a => a.questionId === question.id)
        return hasAnswer ? index : -1
      })
      .filter(index => index !== -1)
  }

  const getCurrentAnswer = (): number | undefined => {
    const currentQuestionObj = questions[currentQuestion]
    if (!currentQuestionObj) return undefined

    const answer = answers.find(a => a.questionId === currentQuestionObj.id)
    return answer?.selectedAnswer
  }

  const canGoNext = (): boolean => {
    return hasAnsweredCurrent || isReviewMode
  }

  const canGoPrevious = (): boolean => {
    return currentQuestion > 0
  }

  const isLastQuestion = (): boolean => {
    return currentQuestion === questions.length - 1
  }

  const answeredQuestions = getAnsweredQuestions()
  const currentQuestionObj = questions[currentQuestion]
  const selectedAnswer = getCurrentAnswer()

  if (!currentQuestionObj) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Question Available</h2>
          <p className="text-gray-600">Please check your test configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <QuestionCard
        question={currentQuestionObj}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        showFeedback={isReviewMode}
        isReviewMode={isReviewMode}
        timeSpent={answers.find(a => a.questionId === currentQuestionObj.id)?.timeSpent}
      />

      {/* Navigation */}
      <ModuleNavigation
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        answeredQuestions={answeredQuestions}
        onQuestionSelect={handleQuestionSelect}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmitModule={onModuleSubmit}
        canGoNext={canGoNext()}
        canGoPrevious={canGoPrevious()}
        isLastQuestion={isLastQuestion()}
        hasAnsweredCurrent={hasAnsweredCurrent}
      />

      {/* Progress Indicator */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <span>Progress:</span>
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestion
                    ? 'bg-blue-500'
                    : answeredQuestions.includes(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span>
            {answeredQuestions.length}/{questions.length} answered
          </span>
        </div>
      </div>
    </div>
  )
}
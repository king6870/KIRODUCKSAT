"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTestState } from '@/hooks/useTestState'
import TestLauncher from '@/components/test/TestLauncher'
import TestAnalytics from '@/components/test/TestAnalytics'
import ModuleStart from '@/components/test/ModuleStart'

export default function PracticeTest() {
  const { data: session } = useSession()
  const router = useRouter()
  const {
    currentModule,
    currentQuestion,
    currentSelectedAnswer,
    testResults,
    isTransitioning,
    isComplete,
    hasStarted,
    startTest,
    startModule,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitModule,
    testState
  } = useTestState(session?.user?.email || 'anonymous')

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  // Debug logging
  useEffect(() => {
    console.log('Test State Debug:', {
      hasStarted,
      moduleStarted: testState.moduleStarted,
      currentModule: currentModule?.id,
      currentQuestion: currentQuestion?.id,
      isTransitioning,
      isComplete
    })
  }, [hasStarted, testState.moduleStarted, currentModule, currentQuestion, isTransitioning, isComplete])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-4 h-4 bg-pink-600 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    )
  }

  // Test launcher screen
  if (!hasStarted) {
    return <TestLauncher onStartTest={startTest} />
  }

  // Module start screen (before starting each module)
  if (currentModule && hasStarted && !testState.moduleStarted && !isTransitioning) {
    return (
      <ModuleStart
        module={currentModule}
        onStartModule={startModule}
      />
    )
  }

  // Final results screen with analytics
  if (isComplete && testResults) {
    return <TestAnalytics testResults={testResults} />
  }

  // Fallback completion screen (if no results)
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Complete!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Congratulations on completing your SAT practice test!
          </p>
          <button
            onClick={() => router.push('/practice-test')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
          >
            Take Another Test
          </button>
        </div>
      </div>
    )
  }

  // Main test interface
  if (currentModule && currentQuestion && hasStarted && testState.moduleStarted && !isTransitioning && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentModule.title}
                </h1>
                <p className="text-gray-600">
                  Question {testState.currentQuestionIndex + 1} of {currentModule.questionCount}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold transition-colors ${
                  testState.timeRemaining <= 300 // 5 minutes
                    ? 'text-red-500 animate-pulse'
                    : testState.timeRemaining <= 600 // 10 minutes
                    ? 'text-orange-500'
                    : 'text-purple-600'
                }`}>
                  {Math.floor(testState.timeRemaining / 60)}:{(testState.timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500">
                  {testState.timeRemaining <= 300 ? '⚠️ Time Running Out!' : 'Time Remaining'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testState.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">{currentQuestion.question}</h3>
              
              {currentQuestion.passage && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-6 border border-blue-200/50">
                  <p className="text-gray-700 leading-relaxed">{currentQuestion.passage}</p>
                </div>
              )}
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentSelectedAnswer === index
                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                        isSelected
                          ? 'border-purple-500 bg-purple-100 shadow-md'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`font-semibold mr-3 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600 group-hover:bg-purple-200 group-hover:text-purple-700'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={`${isSelected ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={testState.currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl disabled:opacity-50 hover:bg-gray-300 transition-colors font-medium"
              >
                ← Previous
              </button>
              
              <div className="text-sm text-gray-500 text-center">
                <div>{testState.currentQuestionIndex + 1} / {currentModule.questionCount}</div>
                <div className="text-xs mt-1">
                  {testState.questionsAnswered} answered
                </div>
              </div>
              
              {testState.currentQuestionIndex === currentModule.questionCount - 1 ? (
                <button
                  onClick={submitModule}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
                >
                  Submit Module ✓
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all font-medium"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce delay-100"></div>
        <div className="w-4 h-4 bg-pink-600 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  )
}

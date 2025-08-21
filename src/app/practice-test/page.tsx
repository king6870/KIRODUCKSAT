"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useTestState } from '@/hooks/useTestState'
import TestLauncher from '@/components/test/TestLauncher'
import ModuleStart from '@/components/test/ModuleStart'
import ModuleHeader from '@/components/test/ModuleHeader'
import QuestionInterface from '@/components/test/QuestionInterface'
import ModuleTransition from '@/components/test/ModuleTransition'
import TestResults from '@/components/test/TestResults'

export default function PracticeTest() {
  const { data: session } = useSession()
  const router = useRouter()
  const {
    testState,
    currentModule,
    currentQuestion,
    isTransitioning,
    isComplete,
    hasStarted,
    startTest,
    startModule,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    submitModule,
    continueToNextModule
  } = useTestState(session?.user?.email || 'anonymous')

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Test launcher screen
  if (!hasStarted) {
    return <TestLauncher onStartTest={startTest} />
  }

  // Module start screen (before starting each module)
  if (currentModule && hasStarted && currentQuestionIndex === 0 && !isTransitioning) {
    return (
      <ModuleStart
        module={currentModule}
        onStartModule={startModule}
      />
    )
  }

  // Module transition screen (between modules)
  if (isTransitioning && testState.lastModulePerformance) {
    const nextModule = testState.currentModule < 4 ? 
      testState.modules.find(m => m.id === testState.currentModule + 1) : 
      undefined

    return (
      <ModuleTransition
        completedModule={testState.modules.find(m => m.id === testState.currentModule)!}
        nextModule={nextModule}
        performance={testState.lastModulePerformance}
        onContinue={continueToNextModule}
        isLastModule={testState.currentModule === 4}
      />
    )
  }

  // Final results screen
  if (isComplete && testState.testSession) {
    return <TestResults testSession={testState.testSession} />
  }

  // Main test interface
  if (currentModule && currentQuestion && hasStarted && !isTransitioning && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <ModuleHeader
          module={currentModule}
          timeRemaining={testState.timeRemaining}
          progress={testState.progress}
          questionsAnswered={testState.questionsAnswered}
          onTimeUp={submitModule}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          <QuestionInterface
            question={currentQuestion}
            questionNumber={testState.currentQuestionIndex + 1}
            totalQuestions={currentModule.questionCount}
            selectedAnswer={testState.currentAnswers[testState.currentQuestionIndex]}
            onAnswerSelect={selectAnswer}
            onNext={nextQuestion}
            onPrevious={previousQuestion}
            onSubmit={submitModule}
            canGoNext={testState.currentQuestionIndex < currentModule.questionCount - 1}
            canGoPrevious={testState.currentQuestionIndex > 0}
            isLastQuestion={testState.currentQuestionIndex === currentModule.questionCount - 1}
          />
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Preparing test...</div>
    </div>
  )
}
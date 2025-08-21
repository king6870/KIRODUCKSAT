import { useState, useEffect, useCallback, useMemo } from 'react'
import { TestState, Question, ModulePerformance } from '@/types/test'
import { TestStateManager } from '@/utils/TestStateManager'
import { QuestionManager } from '@/utils/QuestionManager'

export function useTestState(userId: string) {
  const [testState, setTestState] = useState<TestState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const questionManager = useMemo(() => new QuestionManager(), [])

  // Initialize or load test state
  useEffect(() => {
    try {
      const savedState = TestStateManager.loadState()
      
      if (savedState && TestStateManager.validateState(savedState)) {
        // Resume existing test
        setTestState(savedState)
      } else {
        // Start new test
        const newState = TestStateManager.initializeTestSession(userId)
        setTestState(newState)
      }
    } catch (err) {
      setError('Failed to initialize test state')
      console.error('Test state initialization error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Start module with questions
  const startModule = useCallback((moduleId: number, previousPerformance?: ModulePerformance) => {
    if (!testState) return

    try {
      const questions = questionManager.generateModule(moduleId, previousPerformance)
      const updatedState = TestStateManager.updateModule(testState, moduleId, questions)
      setTestState(updatedState)
    } catch (err) {
      setError(`Failed to start module ${moduleId}`)
      console.error('Module start error:', err)
    }
  }, [testState, questionManager])

  // Navigate to question
  const goToQuestion = useCallback((questionIndex: number) => {
    if (!testState) return

    try {
      const updatedState = TestStateManager.updateQuestion(testState, questionIndex)
      setTestState(updatedState)
    } catch (err) {
      setError('Failed to navigate to question')
      console.error('Question navigation error:', err)
    }
  }, [testState])

  // Submit answer
  const submitAnswer = useCallback((selectedAnswer: number, timeSpent: number) => {
    if (!testState) return

    try {
      const currentQuestions = testState.questions[testState.currentModule - 1]
      const currentQuestion = currentQuestions[testState.currentQuestion]
      
      if (!currentQuestion) {
        throw new Error('Current question not found')
      }

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer
      
      const updatedState = TestStateManager.submitAnswer(
        testState,
        currentQuestion.id,
        selectedAnswer,
        timeSpent,
        isCorrect
      )
      
      setTestState(updatedState)
    } catch (err) {
      setError('Failed to submit answer')
      console.error('Answer submission error:', err)
    }
  }, [testState])

  // Complete current module
  const completeModule = useCallback(() => {
    if (!testState) return null

    try {
      const updatedState = TestStateManager.completeModule(testState)
      setTestState(updatedState)
      
      // Return the completed module result
      return updatedState.session.modules[updatedState.session.modules.length - 1]
    } catch (err) {
      setError('Failed to complete module')
      console.error('Module completion error:', err)
      return null
    }
  }, [testState])

  // Complete entire test
  const completeTest = useCallback(() => {
    if (!testState) return

    try {
      const finalState = TestStateManager.completeTest(testState)
      setTestState(finalState)
    } catch (err) {
      setError('Failed to complete test')
      console.error('Test completion error:', err)
    }
  }, [testState])

  // Update timer
  const updateTimer = useCallback((timeRemaining: number) => {
    if (!testState) return

    const updatedState = TestStateManager.updateTimer(testState, timeRemaining)
    setTestState(updatedState)

    // Auto-complete module when time expires
    if (timeRemaining <= 0) {
      setTimeout(() => {
        completeModule()
      }, 1000)
    }
  }, [testState, completeModule])

  // Clear test state (restart)
  const clearTest = useCallback(() => {
    try {
      TestStateManager.clearState()
      const newState = TestStateManager.initializeTestSession(userId)
      setTestState(newState)
      setError(null)
    } catch (err) {
      setError('Failed to restart test')
      console.error('Test restart error:', err)
    }
  }, [userId])

  // Get current question
  const getCurrentQuestion = useCallback((): Question | null => {
    if (!testState) return null

    const currentQuestions = testState.questions[testState.currentModule - 1]
    return currentQuestions[testState.currentQuestion] || null
  }, [testState])

  // Get module progress
  const getModuleProgress = useCallback(() => {
    if (!testState) return { answered: 0, total: 0, percentage: 0 }

    const moduleAnswers = testState.answers[testState.currentModule - 1]
    const moduleQuestions = testState.questions[testState.currentModule - 1]
    
    return {
      answered: moduleAnswers.length,
      total: moduleQuestions.length,
      percentage: moduleQuestions.length > 0 ? (moduleAnswers.length / moduleQuestions.length) * 100 : 0
    }
  }, [testState])

  // Check if can proceed to next question
  const canProceedToNext = useCallback(() => {
    if (!testState) return false

    const moduleAnswers = testState.answers[testState.currentModule - 1]
    return moduleAnswers.length > testState.currentQuestion
  }, [testState])

  // Check if module is complete
  const isModuleComplete = useCallback(() => {
    if (!testState) return false

    const moduleAnswers = testState.answers[testState.currentModule - 1]
    const moduleQuestions = testState.questions[testState.currentModule - 1]
    
    return moduleAnswers.length === moduleQuestions.length
  }, [testState])

  return {
    testState,
    isLoading,
    error,
    startModule,
    goToQuestion,
    submitAnswer,
    completeModule,
    completeTest,
    updateTimer,
    clearTest,
    getCurrentQuestion,
    getModuleProgress,
    canProceedToNext,
    isModuleComplete
  }
}
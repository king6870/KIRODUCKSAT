import { useState, useEffect, useCallback, useMemo } from 'react'
import { TestState, Question, ModulePerformance, ModuleConfig } from '@/types/test'
import { MODULE_CONFIGS } from '@/data/moduleConfigs'
import { QUESTION_POOLS } from '@/data/questionPools'

export function useTestState(userId: string) {
  const [testState, setTestState] = useState<TestState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Get current module config
  const currentModule = useMemo(() => {
    if (currentModuleIndex >= MODULE_CONFIGS.length) return null
    return MODULE_CONFIGS[currentModuleIndex]
  }, [currentModuleIndex])

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!currentModule) return null
    
    // For now, return a sample question from the question pools
    const moduleType = currentModule.type
    const questions = moduleType === 'reading-writing' 
      ? QUESTION_POOLS.readingWriting.module1 
      : QUESTION_POOLS.math.module1
    
    if (currentQuestionIndex >= questions.length) return null
    return questions[currentQuestionIndex]
  }, [currentModule, currentQuestionIndex])

  // Initialize test state
  useEffect(() => {
    setIsLoading(false)
  }, [userId])

  // Start test
  const startTest = useCallback(() => {
    setHasStarted(true)
    setCurrentModuleIndex(0)
    setCurrentQuestionIndex(0)
  }, [])

  // Start module
  const startModule = useCallback(() => {
    // Module is now started, begin questions
  }, [])

  // Select answer
  const selectAnswer = useCallback((answer: number) => {
    // Store selected answer
  }, [])

  // Next question
  const nextQuestion = useCallback(() => {
    if (!currentModule) return
    
    if (currentQuestionIndex < currentModule.questionCount - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentModule, currentQuestionIndex])

  // Previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  // Submit module
  const submitModule = useCallback(() => {
    if (currentModuleIndex < MODULE_CONFIGS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentModuleIndex(prev => prev + 1)
        setCurrentQuestionIndex(0)
        setIsTransitioning(false)
      }, 2000)
    } else {
      setIsComplete(true)
    }
  }, [currentModuleIndex])

  // Continue to next module
  const continueToNextModule = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  return {
    testState: testState || {
      currentModule: currentModuleIndex + 1,
      currentQuestion: currentQuestionIndex,
      moduleType: currentModule?.type || 'reading-writing',
      questions: [[], [], [], []],
      answers: [[], [], [], []],
      timeRemaining: currentModule?.duration ? currentModule.duration * 60 : 1920,
      moduleStartTime: new Date(),
      testStartTime: new Date(),
      isTransitioning,
      completedModules: [],
      session: {
        id: 'temp',
        userId,
        startTime: new Date(),
        modules: [],
        overallScore: 0,
        totalTimeSpent: 0,
        status: 'in-progress' as const
      },
      moduleStarted: hasStarted,
      currentQuestionIndex,
      currentAnswers: [],
      progress: (currentQuestionIndex / (currentModule?.questionCount || 1)) * 100,
      questionsAnswered: currentQuestionIndex,
      lastModulePerformance: null,
      modules: MODULE_CONFIGS,
      testSession: null
    },
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
    continueToNextModule,
    isLoading,
    error
  }
}

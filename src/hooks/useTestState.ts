import { useState, useEffect, useCallback, useMemo } from 'react'
import { TestState } from '@/types/test'
import { MODULE_CONFIGS } from '@/data/moduleConfigs'
import { QUESTION_POOLS } from '@/data/questionPools'

export function useTestState(userId: string) {
  const [testState] = useState<TestState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [moduleStarted, setModuleStarted] = useState(false)
  
  // Timer and answer state
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [moduleStartTime, setModuleStartTime] = useState<Date | null>(null)

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

  // Timer effect - starts when module is started
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (moduleStarted && timeRemaining > 0 && !isComplete && !isTransitioning) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit module
            setIsTransitioning(true)
            setTimeout(() => {
              if (currentModuleIndex < MODULE_CONFIGS.length - 1) {
                setCurrentModuleIndex(prev => prev + 1)
                setCurrentQuestionIndex(0)
                setModuleStarted(false)
                setSelectedAnswers([])
                setIsTransitioning(false)
              } else {
                setIsComplete(true)
              }
            }, 2000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [moduleStarted, timeRemaining, isComplete, isTransitioning, currentModuleIndex])

  // Initialize test state
  useEffect(() => {
    setIsLoading(false)
  }, [userId])

  // Start test
  const startTest = useCallback(() => {
    setHasStarted(true)
    setCurrentModuleIndex(0)
    setCurrentQuestionIndex(0)
    setModuleStarted(false) // Show module start screen
    setSelectedAnswers([])
  }, [])

  // Start module
  const startModule = useCallback(() => {
    setModuleStarted(true) // Now actually start the module
    setModuleStartTime(new Date())
    // Set initial time for current module
    const duration = currentModule?.duration || 32 // Default 32 minutes
    setTimeRemaining(duration * 60) // Convert to seconds
    // Initialize selected answers array for this module
    const questionCount = currentModule?.questionCount || 27
    setSelectedAnswers(new Array(questionCount).fill(-1)) // -1 means no answer selected
  }, [currentModule])

  // Select answer
  const selectAnswer = useCallback((answerIndex: number) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = answerIndex
      return newAnswers
    })
  }, [currentQuestionIndex])

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
        setModuleStarted(false) // Show next module start screen
        setSelectedAnswers([])
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

  // Get current selected answer
  const currentSelectedAnswer = selectedAnswers[currentQuestionIndex] ?? -1

  return {
    testState: testState || {
      currentModule: currentModuleIndex + 1,
      currentQuestion: currentQuestionIndex,
      currentQuestionIndex,
      moduleType: currentModule?.type || 'reading-writing',
      questions: [[], [], [], []],
      answers: [[], [], [], []],
      currentAnswers: selectedAnswers,
      timeRemaining,
      moduleStartTime: moduleStartTime || new Date(),
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
      moduleStarted,
      progress: (currentQuestionIndex / (currentModule?.questionCount || 1)) * 100,
      questionsAnswered: selectedAnswers.filter(answer => answer !== -1).length,
      lastModulePerformance: null,
      modules: MODULE_CONFIGS,
      testSession: null
    },
    currentModule,
    currentQuestion,
    currentSelectedAnswer,
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

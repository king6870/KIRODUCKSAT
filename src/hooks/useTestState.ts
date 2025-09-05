import { useState, useEffect, useCallback, useMemo } from 'react'
import { TestState, TestResult, QuestionResult, Question } from '@/types/test'
import { MODULE_CONFIGS } from '@/data/moduleConfigs'

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
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  
  // Test results tracking
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [moduleResults, setModuleResults] = useState<QuestionResult[][]>([])
  
  // Questions from database
  const [currentModuleQuestions, setCurrentModuleQuestions] = useState<Question[]>([])

  // Get current module config
  const currentModule = useMemo(() => {
    if (currentModuleIndex >= MODULE_CONFIGS.length) return null
    return MODULE_CONFIGS[currentModuleIndex]
  }, [currentModuleIndex])

  // Get current question
  const currentQuestion = useMemo(() => {
    if (!currentModule || currentModuleQuestions.length === 0) return null
    
    if (currentQuestionIndex >= currentModuleQuestions.length) return null
    return currentModuleQuestions[currentQuestionIndex]
  }, [currentModule, currentModuleQuestions, currentQuestionIndex])

  // Fetch questions from database
  const fetchQuestions = useCallback(async (moduleType: string, questionCount?: number) => {
    try {
      setIsLoading(true)
      const limit = questionCount || (moduleType === 'math' ? 22 : 27)
      console.log(`🔍 Fetching ${limit} questions for moduleType: ${moduleType}`)
      
      const response = await fetch(`/api/questions?moduleType=${moduleType}&limit=${limit}`)
      
      if (response.ok) {
        const questions = await response.json()
        console.log(`✅ Received ${questions.length} questions from API`)
        
        if (Array.isArray(questions) && questions.length > 0) {
          setCurrentModuleQuestions(questions)
          console.log(`📚 Set ${questions.length} questions for current module`)
        } else {
          console.warn('⚠️ No questions returned from API')
          setCurrentModuleQuestions([])
        }
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
        setCurrentModuleQuestions([])
      }
    } catch (error) {
      console.error('❌ Error fetching questions:', error)
      setCurrentModuleQuestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save test results to database
  const saveTestResults = useCallback(async (results: TestResult) => {
    try {
      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results)
      })

      if (response.ok) {
        console.log('Test results saved successfully')
      } else {
        console.error('Failed to save test results')
      }
    } catch (error) {
      console.error('Error saving test results:', error)
    }
  }, [])

  // Calculate module results
  const calculateModuleResults = useCallback(() => {
    const results: QuestionResult[] = []
    
    currentModuleQuestions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === question.correctAnswer
      const timeSpent = question.timeEstimate // Approximate for now
      
      results.push({
        questionId: question.id,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
        moduleType: question.moduleType, // Add moduleType for SAT scoring
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeSpent,
        options: question.options,
        explanation: question.explanation
      })
    })
    
    return results
  }, [currentModuleQuestions, selectedAnswers])

  // Handle module submission
  const handleModuleSubmit = useCallback(() => {
    // const moduleEndTime = new Date()

    // Calculate results for current module
    const results = calculateModuleResults()
    
    // Update module results
    setModuleResults(prev => {
      const newResults = [...prev]
      newResults[currentModuleIndex] = results
      return newResults
    })

    if (currentModuleIndex < MODULE_CONFIGS.length - 1) {
      // Move to next module
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentModuleIndex(prev => prev + 1)
        setCurrentQuestionIndex(0)
        setModuleStarted(false)
        setSelectedAnswers([])
        setIsTransitioning(false)
        
        // Fetch questions for next module
        const nextModule = MODULE_CONFIGS[currentModuleIndex + 1]
        if (nextModule) {
          fetchQuestions(nextModule.type, nextModule.questionCount)
        }
      }, 2000)
    } else {
      // Test complete - calculate final results with SAT scoring
      const allResults = [...moduleResults]
      allResults[currentModuleIndex] = results
      
      const flatResults = allResults.flat()
      const totalQuestions = flatResults.length
      const correctAnswers = flatResults.filter(r => r.isCorrect).length
      const totalTimeSpent = testStartTime 
        ? Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000)
        : 0

      // Separate by module type for SAT scoring
      const rwQuestions = flatResults.filter(r => r.moduleType === 'reading-writing')
      const mathQuestions = flatResults.filter(r => r.moduleType === 'math')
      const rwCorrect = rwQuestions.filter(r => r.isCorrect).length
      const mathCorrect = mathQuestions.filter(r => r.isCorrect).length

      // Calculate category performance
      const categoryStats: Record<string, { correct: number; total: number }> = {}
      flatResults.forEach(result => {
        if (!categoryStats[result.category]) {
          categoryStats[result.category] = { correct: 0, total: 0 }
        }
        categoryStats[result.category].total++
        if (result.isCorrect) {
          categoryStats[result.category].correct++
        }
      })

      // Calculate difficulty performance
      const difficultyStats: Record<string, { correct: number; total: number }> = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 }
      }
      
      flatResults.forEach(result => {
        difficultyStats[result.difficulty].total++
        if (result.isCorrect) {
          difficultyStats[result.difficulty].correct++
        }
      })

      const finalResults: TestResult = {
        id: `test-${Date.now()}`,
        userId,
        startTime: testStartTime || new Date(),
        endTime: new Date(),
        totalTimeSpent,
        totalQuestions,
        correctAnswers,
        score: Math.round((correctAnswers / totalQuestions) * 100),
        moduleResults: allResults,
        categoryPerformance: categoryStats,
        subtopicPerformance: categoryStats, // For now, same as category
        difficultyPerformance: difficultyStats,
        completedAt: new Date()
      }

      setTestResults(finalResults)
      setIsComplete(true)
      
      // Save to database
      saveTestResults(finalResults)
    }
  }, [currentModuleIndex, calculateModuleResults, moduleResults, testStartTime, userId, saveTestResults, fetchQuestions])

  // Timer effect - starts when module is started
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (moduleStarted && timeRemaining > 0 && !isComplete && !isTransitioning) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit module
            handleModuleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [moduleStarted, timeRemaining, isComplete, isTransitioning, handleModuleSubmit])

  // Initialize test state
  useEffect(() => {
    setIsLoading(false)
  }, [userId])

  // Start specific module (for admin)
  const startSpecificModule = useCallback((moduleId: number) => {
    const moduleIndex = moduleId - 1 // Convert to 0-based index
    const targetModule = MODULE_CONFIGS[moduleIndex]
    
    if (targetModule) {
      setHasStarted(true)
      setCurrentModuleIndex(moduleIndex)
      setCurrentQuestionIndex(0)
      setModuleStarted(false)
      setSelectedAnswers([])
      setTestStartTime(new Date())
      setModuleResults([])
      setTestResults(null)
      
      // Fetch questions for selected module
      fetchQuestions(targetModule.type, targetModule.questionCount)
    }
  }, [fetchQuestions])

  // Start test
  const startTest = useCallback(() => {
    setHasStarted(true)
    setCurrentModuleIndex(0)
    setCurrentQuestionIndex(0)
    setModuleStarted(false)
    setSelectedAnswers([])
    setTestStartTime(new Date())
    setModuleResults([])
    setTestResults(null)
    
    // Fetch questions for first module
    const firstModule = MODULE_CONFIGS[0]
    if (firstModule) {
      fetchQuestions(firstModule.type, firstModule.questionCount)
    }
  }, [fetchQuestions])

  // Start module
  const startModule = useCallback(() => {
    setModuleStarted(true)
    setModuleStartTime(new Date())
    // Set initial time for current module
    const duration = currentModule?.duration || 32
    setTimeRemaining(duration * 60)
    // Initialize selected answers array for this module
    const questionCount = currentModuleQuestions.length || 27
    setSelectedAnswers(new Array(questionCount).fill(-1))
  }, [currentModule, currentModuleQuestions])

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
    
    if (currentQuestionIndex < currentModuleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentModule, currentModuleQuestions, currentQuestionIndex])

  // Previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  // Submit module
  const submitModule = useCallback(() => {
    handleModuleSubmit()
  }, [handleModuleSubmit])

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
      testStartTime: testStartTime || new Date(),
      isTransitioning,
      completedModules: [],
      session: {
        id: 'temp',
        userId,
        startTime: testStartTime || new Date(),
        modules: [],
        overallScore: 0,
        totalTimeSpent: 0,
        status: 'in-progress' as const
      },
      moduleStarted,
      progress: (currentQuestionIndex / (currentModuleQuestions.length || 1)) * 100,
      questionsAnswered: selectedAnswers.filter(answer => answer !== -1).length,
      lastModulePerformance: null,
      modules: MODULE_CONFIGS,
      testSession: null
    },
    currentModule,
    currentQuestion,
    currentSelectedAnswer,
    testResults,
    isTransitioning,
    isComplete,
    hasStarted,
    startTest,
    startSpecificModule,
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

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
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0)
  
  // Timer and answer state
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [moduleStartTime, setModuleStartTime] = useState<Date | null>(null)
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  
  // Test results tracking
  const [testResults, setTestResults] = useState<TestResult | null>(null)
  const [moduleResults, setModuleResults] = useState<QuestionResult[][]>([])
  
  // Questions from database with no-repeat tracking
  const [currentModuleQuestions, setCurrentModuleQuestions] = useState<Question[]>([])
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set())

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

  // Fetch questions from database with no-repeat logic
  const fetchQuestions = useCallback(async (moduleType: string, questionCount?: number) => {
    try {
      setIsLoading(true)
      const limit = questionCount || (moduleType === 'math' ? 22 : 27)
      console.log(`🔍 Fetching ${limit} questions for moduleType: ${moduleType}`)
      
      // Get more questions than needed to filter out used ones
      const response = await fetch(`/api/questions?moduleType=${moduleType}&limit=${limit * 2}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`📝 Received ${data.questions?.length || 0} questions from API`)
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions available')
      }

      // Filter out already used questions
      const availableQuestions = data.questions.filter((q: Question) => !usedQuestionIds.has(q.id))
      
      // If we don't have enough unused questions, reset the used set (allow repeats but minimize them)
      let questionsToUse = availableQuestions
      if (availableQuestions.length < limit) {
        console.log('⚠️ Not enough unused questions, allowing some repeats')
        questionsToUse = data.questions
      }

      // Select the required number of questions
      const selectedQuestions = questionsToUse.slice(0, limit)
      
      // Add selected question IDs to used set
      const newUsedIds = new Set(usedQuestionIds)
      selectedQuestions.forEach((q: Question) => newUsedIds.add(q.id))
      setUsedQuestionIds(newUsedIds)
      
      setCurrentModuleQuestions(selectedQuestions)
      setSelectedAnswers(new Array(selectedQuestions.length).fill(-1))
      
      console.log(`✅ Set ${selectedQuestions.length} questions for current module`)
      
    } catch (error) {
      console.error('❌ Error fetching questions:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [usedQuestionIds])

  // Auto-start module 2 after 10 seconds
  useEffect(() => {
    if (isTransitioning && currentModuleIndex === 1 && !moduleStarted) {
      const timer = setTimeout(() => {
        startModule()
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [isTransitioning, currentModuleIndex, moduleStarted])

  // Auto-start math module after 10 seconds
  useEffect(() => {
    if (isTransitioning && currentModuleIndex === 2 && !moduleStarted) {
      const timer = setTimeout(() => {
        startModule()
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [isTransitioning, currentModuleIndex, moduleStarted])

  // Handle 10-minute break between reading and math
  useEffect(() => {
    if (isBreakTime && breakTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBreakTimeRemaining(prev => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (isBreakTime && breakTimeRemaining === 0) {
      // Break is over, start math module
      setIsBreakTime(false)
      setIsTransitioning(true)
      setCurrentModuleIndex(2) // Math module
    }
  }, [isBreakTime, breakTimeRemaining])

  const startTest = useCallback(async () => {
    try {
      setIsLoading(true)
      setTestStartTime(new Date())
      setHasStarted(true)
      setCurrentModuleIndex(0)
      setCurrentQuestionIndex(0)
      
      // Start with reading-writing module
      await fetchQuestions('reading-writing', 27)
      
      setIsTransitioning(true)
      setModuleStarted(false)
    } catch (error) {
      console.error('Error starting test:', error)
    }
  }, [fetchQuestions])

  const startModule = useCallback(async () => {
    if (!currentModule) return

    try {
      setIsLoading(true)
      setModuleStartTime(new Date())
      setModuleStarted(true)
      setIsTransitioning(false)
      setCurrentQuestionIndex(0)
      
      // Set timer for current module (convert minutes to seconds)
      setTimeRemaining(currentModule.duration * 60)
      
      // If we haven't fetched questions for this module yet, fetch them
      if (currentModuleQuestions.length === 0) {
        await fetchQuestions(currentModule.type, currentModule.questionCount)
      }
      
    } catch (error) {
      console.error('Error starting module:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentModule, currentModuleQuestions.length, fetchQuestions])

  const completeModule = useCallback(async () => {
    if (!currentModule || !moduleStartTime) return

    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - moduleStartTime.getTime()) / 1000)
    
    // Calculate module results
    const moduleQuestionResults: QuestionResult[] = currentModuleQuestions.map((question, index) => ({
      questionId: question.id,
      question: question.question,
      category: question.category,
      difficulty: question.difficulty,
      moduleType: question.moduleType,
      userAnswer: selectedAnswers[index] || -1,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswers[index] === question.correctAnswer,
      timeSpent: Math.floor(timeSpent / currentModuleQuestions.length), // Approximate time per question
      options: question.options,
      explanation: question.explanation
    }))

    // Add to module results
    const newModuleResults = [...moduleResults]
    newModuleResults[currentModuleIndex] = moduleQuestionResults
    setModuleResults(newModuleResults)

    // Check if this is the end of reading modules (before math)
    if (currentModuleIndex === 1) {
      // Start 10-minute break
      setIsBreakTime(true)
      setBreakTimeRemaining(600) // 10 minutes = 600 seconds
      setModuleStarted(false)
      return
    }

    // Move to next module or complete test
    if (currentModuleIndex < MODULE_CONFIGS.length - 1) {
      setCurrentModuleIndex(prev => prev + 1)
      setIsTransitioning(true)
      setModuleStarted(false)
      setCurrentModuleQuestions([]) // Clear questions for next module
      
      // Fetch questions for next module
      const nextModule = MODULE_CONFIGS[currentModuleIndex + 1]
      if (nextModule) {
        await fetchQuestions(nextModule.type, nextModule.questionCount)
      }
    } else {
      // Test complete
      completeTest(newModuleResults)
    }
  }, [currentModule, moduleStartTime, currentModuleQuestions, selectedAnswers, moduleResults, currentModuleIndex, fetchQuestions])

  const completeTest = useCallback((finalModuleResults: QuestionResult[][]) => {
    if (!testStartTime) return

    const endTime = new Date()
    const totalTimeSpent = Math.floor((endTime.getTime() - testStartTime.getTime()) / 1000)
    
    // Calculate overall results
    const allResults = finalModuleResults.flat()
    const correctAnswers = allResults.filter(r => r.isCorrect).length
    const totalQuestions = allResults.length
    
    // Calculate category performance
    const categoryPerformance: Record<string, { correct: number; total: number }> = {}
    allResults.forEach(result => {
      if (!categoryPerformance[result.category]) {
        categoryPerformance[result.category] = { correct: 0, total: 0 }
      }
      categoryPerformance[result.category].total++
      if (result.isCorrect) {
        categoryPerformance[result.category].correct++
      }
    })

    const finalResults: TestResult = {
      id: `test-${Date.now()}`,
      userId,
      startTime: testStartTime,
      endTime,
      totalTimeSpent,
      totalQuestions,
      correctAnswers,
      score: Math.round((correctAnswers / totalQuestions) * 100),
      moduleResults: finalModuleResults,
      categoryPerformance,
      completedAt: endTime
    }

    setTestResults(finalResults)
    setIsComplete(true)
  }, [testStartTime, userId])

  // Timer countdown effect
  useEffect(() => {
    if (moduleStarted && timeRemaining > 0 && !isTransitioning && !isComplete) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (moduleStarted && timeRemaining === 0) {
      // Time's up for this module
      completeModule()
    }
  }, [moduleStarted, timeRemaining, isTransitioning, isComplete, completeModule])

  const selectAnswer = useCallback((answerIndex: number) => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < selectedAnswers.length) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestionIndex] = answerIndex
      setSelectedAnswers(newAnswers)
    }
  }, [currentQuestionIndex, selectedAnswers])

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < currentModuleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, currentModuleQuestions.length])

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  const goToQuestion = useCallback((questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < currentModuleQuestions.length) {
      setCurrentQuestionIndex(questionIndex)
    }
  }, [currentModuleQuestions.length])

  return {
    // State
    testState,
    isLoading,
    error,
    hasStarted,
    currentModuleIndex,
    currentQuestionIndex,
    isTransitioning,
    isComplete,
    moduleStarted,
    isBreakTime,
    breakTimeRemaining,
    timeRemaining,
    selectedAnswers,
    testResults,
    currentModule,
    currentQuestion,
    currentModuleQuestions,
    
    // Actions
    startTest,
    startModule,
    completeModule,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    
    // Computed values
    progress: currentModuleQuestions.length > 0 ? 
      Math.round(((currentQuestionIndex + 1) / currentModuleQuestions.length) * 100) : 0,
    questionsAnswered: selectedAnswers.filter(answer => answer !== -1).length,
    canGoNext: currentQuestionIndex < currentModuleQuestions.length - 1,
    canGoPrevious: currentQuestionIndex > 0,
    selectedAnswer: selectedAnswers[currentQuestionIndex] ?? -1
  }
}
      
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

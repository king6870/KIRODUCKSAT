import { TestState, TestSession, ModuleResult, Answer, Question } from '@/types/test'
import { MODULE_CONFIGS } from '@/data/moduleConfigs'

export class TestStateManager {
  private static readonly STORAGE_KEY = 'ducksat_test_state'
  private static readonly SESSION_KEY = 'ducksat_test_session'

  /**
   * Initialize a new test session
   */
  static initializeTestSession(userId: string): TestState {
    const sessionId = this.generateSessionId()
    const now = new Date()

    const session: TestSession = {
      id: sessionId,
      userId,
      startTime: now,
      modules: [],
      overallScore: 0,
      totalTimeSpent: 0,
      status: 'in-progress'
    }

    const initialState: TestState = {
      currentModule: 1,
      currentQuestion: 0,
      moduleType: 'reading-writing',
      questions: [[], [], [], []],
      answers: [[], [], [], []],
      timeRemaining: MODULE_CONFIGS[0].duration * 60, // Convert to seconds
      moduleStartTime: now,
      testStartTime: now,
      isTransitioning: false,
      completedModules: [],
      session
    }

    this.saveState(initialState)
    return initialState
  }

  /**
   * Save test state to local storage
   */
  static saveState(state: TestState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        ...state,
        moduleStartTime: state.moduleStartTime.toISOString(),
        testStartTime: state.testStartTime.toISOString(),
        session: {
          ...state.session,
          startTime: state.session.startTime.toISOString(),
          endTime: state.session.endTime?.toISOString()
        }
      }))
    } catch (error) {
      console.error('Failed to save test state:', error)
    }
  }

  /**
   * Load test state from local storage
   */
  static loadState(): TestState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return null

      const parsed = JSON.parse(saved)
      
      return {
        ...parsed,
        moduleStartTime: new Date(parsed.moduleStartTime),
        testStartTime: new Date(parsed.testStartTime),
        session: {
          ...parsed.session,
          startTime: new Date(parsed.session.startTime),
          endTime: parsed.session.endTime ? new Date(parsed.session.endTime) : undefined
        }
      }
    } catch (error) {
      console.error('Failed to load test state:', error)
      return null
    }
  }

  /**
   * Clear saved test state
   */
  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.error('Failed to clear test state:', error)
    }
  }

  /**
   * Update current module
   */
  static updateModule(state: TestState, moduleId: number, questions: Question[]): TestState {
    const moduleConfig = MODULE_CONFIGS.find(config => config.id === moduleId)
    if (!moduleConfig) {
      throw new Error(`Invalid module ID: ${moduleId}`)
    }

    const updatedState: TestState = {
      ...state,
      currentModule: moduleId,
      currentQuestion: 0,
      moduleType: moduleConfig.type,
      questions: state.questions.map((q, index) => 
        index === moduleId - 1 ? questions : q
      ),
      timeRemaining: moduleConfig.duration * 60,
      moduleStartTime: new Date(),
      isTransitioning: false
    }

    this.saveState(updatedState)
    return updatedState
  }

  /**
   * Update current question
   */
  static updateQuestion(state: TestState, questionIndex: number): TestState {
    const updatedState: TestState = {
      ...state,
      currentQuestion: questionIndex
    }

    this.saveState(updatedState)
    return updatedState
  }

  /**
   * Submit answer for current question
   */
  static submitAnswer(
    state: TestState, 
    questionId: string, 
    selectedAnswer: number, 
    timeSpent: number,
    isCorrect: boolean
  ): TestState {
    const answer: Answer = {
      questionId,
      selectedAnswer,
      timeSpent,
      isCorrect
    }

    const moduleIndex = state.currentModule - 1
    const updatedAnswers = [...state.answers]
    updatedAnswers[moduleIndex] = [...updatedAnswers[moduleIndex], answer]

    const updatedState: TestState = {
      ...state,
      answers: updatedAnswers
    }

    this.saveState(updatedState)
    return updatedState
  }

  /**
   * Complete current module
   */
  static completeModule(state: TestState): TestState {
    const moduleIndex = state.currentModule - 1
    const moduleConfig = MODULE_CONFIGS[moduleIndex]
    const moduleAnswers = state.answers[moduleIndex]
    const moduleQuestions = state.questions[moduleIndex]
    
    // Calculate module performance
    const correctAnswers = moduleAnswers.filter(a => a.isCorrect).length
    const totalTime = moduleAnswers.reduce((sum, a) => sum + a.timeSpent, 0)
    const score = (correctAnswers / moduleQuestions.length) * 100

    const moduleResult: ModuleResult = {
      moduleId: state.currentModule,
      moduleType: moduleConfig.type,
      score,
      timeSpent: totalTime,
      answers: moduleAnswers,
      performance: {
        score,
        timeUsed: totalTime,
        questionsCorrect: correctAnswers,
        totalQuestions: moduleQuestions.length,
        strongAreas: this.calculateStrongAreas(moduleAnswers, moduleQuestions),
        weakAreas: this.calculateWeakAreas(moduleAnswers, moduleQuestions),
        averageTimePerQuestion: totalTime / moduleQuestions.length
      },
      completedAt: new Date()
    }

    const updatedSession: TestSession = {
      ...state.session,
      modules: [...state.session.modules, moduleResult]
    }

    const updatedState: TestState = {
      ...state,
      completedModules: [...state.completedModules, state.currentModule],
      session: updatedSession,
      isTransitioning: true
    }

    this.saveState(updatedState)
    return updatedState
  }

  /**
   * Complete entire test
   */
  static completeTest(state: TestState): TestState {
    const totalScore = state.session.modules.reduce((sum, module) => sum + module.score, 0) / state.session.modules.length
    const totalTime = state.session.modules.reduce((sum, module) => sum + module.timeSpent, 0)

    const completedSession: TestSession = {
      ...state.session,
      endTime: new Date(),
      overallScore: totalScore,
      totalTimeSpent: totalTime,
      status: 'completed'
    }

    const finalState: TestState = {
      ...state,
      session: completedSession
    }

    this.saveState(finalState)
    return finalState
  }

  /**
   * Update timer
   */
  static updateTimer(state: TestState, timeRemaining: number): TestState {
    const updatedState: TestState = {
      ...state,
      timeRemaining: Math.max(0, timeRemaining)
    }

    // Auto-save every 30 seconds
    if (timeRemaining % 30 === 0) {
      this.saveState(updatedState)
    }

    return updatedState
  }

  /**
   * Validate state integrity
   */
  static validateState(state: TestState): boolean {
    try {
      return (
        typeof state.currentModule === 'number' &&
        state.currentModule >= 1 &&
        state.currentModule <= 4 &&
        typeof state.currentQuestion === 'number' &&
        state.currentQuestion >= 0 &&
        Array.isArray(state.questions) &&
        state.questions.length === 4 &&
        Array.isArray(state.answers) &&
        state.answers.length === 4 &&
        typeof state.timeRemaining === 'number' &&
        state.timeRemaining >= 0 &&
        state.moduleStartTime instanceof Date &&
        state.testStartTime instanceof Date &&
        typeof state.isTransitioning === 'boolean' &&
        Array.isArray(state.completedModules) &&
        typeof state.session === 'object' &&
        state.session !== null
      )
    } catch (error) {
      console.error('State validation error:', error)
      return false
    }
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate strong areas based on performance
   */
  private static calculateStrongAreas(answers: Answer[], questions: Question[]): string[] {
    const categoryPerformance = new Map<string, { correct: number, total: number }>()

    questions.forEach((question, index) => {
      const answer = answers[index]
      if (!answer) return

      const category = question.category
      const current = categoryPerformance.get(category) || { correct: 0, total: 0 }
      
      categoryPerformance.set(category, {
        correct: current.correct + (answer.isCorrect ? 1 : 0),
        total: current.total + 1
      })
    })

    const strongAreas: string[] = []
    categoryPerformance.forEach((performance, category) => {
      const percentage = (performance.correct / performance.total) * 100
      if (percentage >= 80) {
        strongAreas.push(category)
      }
    })

    return strongAreas
  }

  /**
   * Calculate weak areas based on performance
   */
  private static calculateWeakAreas(answers: Answer[], questions: Question[]): string[] {
    const categoryPerformance = new Map<string, { correct: number, total: number }>()

    questions.forEach((question, index) => {
      const answer = answers[index]
      if (!answer) return

      const category = question.category
      const current = categoryPerformance.get(category) || { correct: 0, total: 0 }
      
      categoryPerformance.set(category, {
        correct: current.correct + (answer.isCorrect ? 1 : 0),
        total: current.total + 1
      })
    })

    const weakAreas: string[] = []
    categoryPerformance.forEach((performance, category) => {
      const percentage = (performance.correct / performance.total) * 100
      if (percentage < 60) {
        weakAreas.push(category)
      }
    })

    return weakAreas
  }
}
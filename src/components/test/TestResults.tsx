"use client"

import { TestSession } from '@/types/test'
import EnhancedButton from '@/components/ui/EnhancedButton'
import { useRouter } from 'next/navigation'

interface TestResultsProps {
  testSession: TestSession
}

export default function TestResults({ testSession }: TestResultsProps) {
  const router = useRouter()

  const calculateOverallScore = () => {
    const totalCorrect = testSession.modules.reduce((sum, module) => sum + module.performance.questionsCorrect, 0)
    const totalQuestions = testSession.modules.reduce((sum, module) => sum + module.performance.totalQuestions, 0)
    return Math.round((totalCorrect / totalQuestions) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getModuleIcon = (moduleType: string) => {
    return moduleType === 'math' ? '🔢' : '📚'
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getSectionScores = () => {
    const readingWritingModules = testSession.modules.filter(m => m.moduleType === 'reading-writing')
    const mathModules = testSession.modules.filter(m => m.moduleType === 'math')

    const rwCorrect = readingWritingModules.reduce((sum, m) => sum + m.performance.questionsCorrect, 0)
    const rwTotal = readingWritingModules.reduce((sum, m) => sum + m.performance.totalQuestions, 0)
    
    const mathCorrect = mathModules.reduce((sum, m) => sum + m.performance.questionsCorrect, 0)
    const mathTotal = mathModules.reduce((sum, m) => sum + m.performance.totalQuestions, 0)

    return {
      readingWriting: rwTotal > 0 ? Math.round((rwCorrect / rwTotal) * 100) : 0,
      math: mathTotal > 0 ? Math.round((mathCorrect / mathTotal) * 100) : 0
    }
  }

  const overallScore = calculateOverallScore()
  const sectionScores = getSectionScores()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SAT Practice Test Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s your comprehensive performance report
          </p>
        </div>

        {/* Overall Score */}
        <div className="enhanced-card p-8 mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Overall Score</h2>
          <div className={`text-8xl font-bold mb-4 ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="text-lg text-gray-600 mb-4">
            {testSession.modules.reduce((sum, m) => sum + m.performance.questionsCorrect, 0)} out of{' '}
            {testSession.modules.reduce((sum, m) => sum + m.performance.totalQuestions, 0)} questions correct
          </div>
          <div className="text-sm text-gray-500">
            Total time: {formatTime(testSession.totalTimeSpent)}
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="enhanced-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">📚 Reading & Writing</h3>
              <div className={`text-3xl font-bold ${getScoreColor(sectionScores.readingWriting)}`}>
                {sectionScores.readingWriting}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${sectionScores.readingWriting}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              54 questions across 2 modules
            </p>
          </div>

          <div className="enhanced-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">🔢 Math</h3>
              <div className={`text-3xl font-bold ${getScoreColor(sectionScores.math)}`}>
                {sectionScores.math}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${sectionScores.math}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              44 questions across 2 modules
            </p>
          </div>
        </div>

        {/* Module-by-Module Results */}
        <div className="enhanced-card p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Module-by-Module Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testSession.modules.map((module) => (
              <div key={module.moduleId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getModuleIcon(module.moduleType)}</span>
                    <div>
                      <h3 className="font-semibold">Module {module.moduleId}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {module.moduleType.replace('-', ' & ')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(module.score)}`}>
                    {module.score}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Correct:</span>
                    <span className="font-medium ml-1">
                      {module.performance.questionsCorrect}/{module.performance.totalQuestions}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium ml-1">
                      {formatTime(module.timeSpent)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${module.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="enhanced-card p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Performance Summary</h2>
          <div className="space-y-6">
            {testSession.modules.map((module) => (
              <div key={module.moduleId} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">{getModuleIcon(module.moduleType)}</span>
                  Module {module.moduleId} - {module.moduleType.replace('-', ' & ')}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {module.performance.questionsCorrect}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {module.score}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatTime(module.timeSpent)}
                    </div>
                    <div className="text-sm text-gray-600">Time Used</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(module.performance.averageTimePerQuestion)}s
                    </div>
                    <div className="text-sm text-gray-600">Avg/Question</div>
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Strong Areas</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {module.performance.strongAreas.map((area, areaIndex) => (
                        <li key={areaIndex} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2">Areas to Improve</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {module.performance.weakAreas.map((area, areaIndex) => (
                        <li key={areaIndex} className="flex items-center">
                          <span className="text-orange-500 mr-2">→</span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={() => router.push('/progress')}
          >
            View Progress Dashboard
          </EnhancedButton>
          <EnhancedButton
            variant="secondary"
            size="lg"
            onClick={() => router.push('/practice-test')}
          >
            Take Another Test
          </EnhancedButton>
          <EnhancedButton
            variant="secondary"
            size="lg"
            onClick={() => router.push('/')}
          >
            Return Home
          </EnhancedButton>
        </div>
      </div>
    </div>
  )
}
"use client"

import { TestResult } from '@/types/test'
import { useRouter } from 'next/navigation'

interface TestAnalyticsProps {
  testResults: TestResult
}

export default function TestAnalytics({ testResults }: TestAnalyticsProps) {
  const router = useRouter()

  // Calculate category performance and find weakest areas
  const categoryStats = Object.entries(testResults.categoryPerformance).map(([category, stats]) => ({
    category: formatCategoryName(category),
    correct: stats.correct,
    total: stats.total,
    percentage: Math.round((stats.correct / stats.total) * 100),
    incorrect: stats.total - stats.correct
  })).sort((a, b) => a.percentage - b.percentage) // Sort by performance (worst first)

  // Calculate time statistics
  const totalTimeMinutes = Math.floor(testResults.totalTimeSpent / 60)
  const totalTimeSeconds = testResults.totalTimeSpent % 60
  const averageTimePerQuestion = Math.round(testResults.totalTimeSpent / testResults.totalQuestions)

  // Get difficulty breakdown
  const allQuestions = testResults.moduleResults.flat()
  const difficultyStats = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 }
  }

  allQuestions.forEach(q => {
    difficultyStats[q.difficulty].total++
    if (q.isCorrect) {
      difficultyStats[q.difficulty].correct++
    }
  })

  // Find most missed questions
  const incorrectQuestions = allQuestions.filter(q => !q.isCorrect)

  function formatCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      'reading-comprehension': 'Reading Comprehension',
      'grammar': 'Grammar & Usage',
      'vocabulary': 'Vocabulary',
      'writing-skills': 'Writing Skills',
      'algebra': 'Algebra',
      'geometry': 'Geometry',
      'statistics': 'Statistics & Probability',
      'advanced-math': 'Advanced Math'
    }
    return categoryMap[category] || category
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  function getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-100 border-green-300'
    if (score >= 80) return 'bg-blue-100 border-blue-300'
    if (score >= 70) return 'bg-yellow-100 border-yellow-300'
    if (score >= 60) return 'bg-orange-100 border-orange-300'
    return 'bg-red-100 border-red-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Test Analytics
          </h1>
          <p className="text-gray-600">Detailed performance analysis and insights</p>
        </div>

        {/* Overall Score Card */}
        <div className={`bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 ${getScoreBgColor(testResults.score)}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(testResults.score)} mb-2`}>
              {testResults.score}%
            </div>
            <div className="text-2xl font-semibold text-gray-800 mb-4">Overall Score</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{testResults.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{testResults.totalQuestions - testResults.correctAnswers}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalTimeMinutes}:{totalTimeSeconds.toString().padStart(2, '0')}</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{averageTimePerQuestion}s</div>
                <div className="text-sm text-gray-600">Avg/Question</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              📚 Category Performance
            </h2>
            <div className="space-y-4">
              {categoryStats.map((stat, index) => (
                <div key={stat.category} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{stat.category}</span>
                    <span className={`font-bold ${getScoreColor(stat.percentage)}`}>
                      {stat.percentage}% ({stat.correct}/{stat.total})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        stat.percentage >= 80 ? 'bg-green-500' :
                        stat.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  {index === 0 && stat.percentage < 70 && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      ⚠️ Needs Improvement
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              🎯 Difficulty Analysis
            </h2>
            <div className="space-y-4">
              {Object.entries(difficultyStats).map(([difficulty, stats]) => {
                const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
                return (
                  <div key={difficulty} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 capitalize flex items-center">
                        {difficulty === 'easy' && '🟢'} 
                        {difficulty === 'medium' && '🟡'} 
                        {difficulty === 'hard' && '🔴'} 
                        <span className="ml-2">{difficulty}</span>
                      </span>
                      <span className={`font-bold ${getScoreColor(percentage)}`}>
                        {percentage}% ({stats.correct}/{stats.total})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          percentage >= 80 ? 'bg-green-500' :
                          percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Areas for Improvement */}
        {categoryStats.length > 0 && categoryStats[0].percentage < 80 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              🎯 Areas for Improvement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.slice(0, 3).map((stat, statIndex) => (
                <div key={stat.category} className={`p-4 rounded-2xl border-2 ${
                  statIndex === 0 ? 'bg-red-50 border-red-200' :
                  statIndex === 1 ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    #{statIndex + 1} {stat.category}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {stat.incorrect} questions missed out of {stat.total}
                  </div>
                  <div className={`text-2xl font-bold ${
                    statIndex === 0 ? 'text-red-600' :
                    statIndex === 1 ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {stat.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed Questions Review */}
        {incorrectQuestions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              ❌ Questions to Review ({incorrectQuestions.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {incorrectQuestions.slice(0, 10).map((question) => (
                <div key={question.questionId} className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">
                      {formatCategoryName(question.category)} - {question.difficulty}
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Incorrect
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {question.question.length > 100 
                      ? question.question.substring(0, 100) + '...' 
                      : question.question}
                  </div>
                  <div className="text-xs text-gray-600">
                    Your answer: {question.options[question.userAnswer] || 'No answer'} | 
                    Correct: {question.options[question.correctAnswer]}
                  </div>
                </div>
              ))}
              {incorrectQuestions.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  ... and {incorrectQuestions.length - 10} more questions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/practice-test')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all"
          >
            Take Another Test
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

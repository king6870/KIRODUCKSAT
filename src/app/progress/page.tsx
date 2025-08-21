"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Progress() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

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

  // Mock progress data
  const progressData = {
    testsCompleted: 3,
    averageScore: 78,
    strongAreas: ['Writing', 'Reading Comprehension'],
    weakAreas: ['Algebra', 'Geometry'],
    recentScores: [72, 76, 85],
    timeSpent: 240 // minutes
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Your Progress
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-2xl"></div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your SAT preparation journey with detailed analytics and personalized insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {progressData.testsCompleted}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Tests Completed</div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {progressData.averageScore}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Average Score</div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {progressData.timeSpent}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Minutes Studied</div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-2">🚀</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {progressData.recentScores[progressData.recentScores.length - 1]}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Latest Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Score Trend */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📈</span>
              Score Trend
            </h2>
            <div className="space-y-6">
              {progressData.recentScores.map((score, index) => (
                <div key={index} className="group">
                  <div className="flex items-center mb-2">
                    <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Test {index + 1}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Performance Analysis
            </h2>
            
            <div className="mb-8">
              <h3 className="font-bold text-green-700 dark:text-green-400 mb-4 flex items-center">
                <span className="text-xl mr-2">💪</span>
                Strong Areas
              </h3>
              <div className="space-y-3">
                {progressData.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center">
                <span className="text-xl mr-2">🎯</span>
                Areas for Improvement
              </h3>
              <div className="space-y-3">
                {progressData.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl mb-12 border border-white/20 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">💡</span>
            Personalized Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-3 flex items-center">
                <span className="text-xl mr-2">🎯</span>
                Focus Areas
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Spend more time practicing algebra and geometry problems. Consider reviewing fundamental concepts and working through step-by-step solutions.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-green-800 dark:text-green-400 mb-3 flex items-center">
                <span className="text-xl mr-2">🌟</span>
                Keep It Up!
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                Your writing and reading comprehension skills are strong. Maintain this level with regular practice and continue building vocabulary.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => router.push('/practice-test')}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center justify-center">
                🚀 Take Another Test
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <span className="relative z-10 flex items-center justify-center">
                🏠 Back to Home
              </span>
            </button>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Keep practicing to improve your SAT scores!
          </p>
        </div>
      </div>
    </div>
  )
}

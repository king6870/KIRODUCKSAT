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
    return <div>Loading...</div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your SAT preparation journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{progressData.testsCompleted}</div>
            <div className="text-gray-600">Tests Completed</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{progressData.averageScore}%</div>
            <div className="text-gray-600">Average Score</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{progressData.timeSpent}</div>
            <div className="text-gray-600">Minutes Studied</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {progressData.recentScores[progressData.recentScores.length - 1]}%
            </div>
            <div className="text-gray-600">Latest Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Score Trend</h2>
            <div className="space-y-4">
              {progressData.recentScores.map((score, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">Test {index + 1}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-medium">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-green-700 mb-2">Strong Areas</h3>
              <div className="space-y-2">
                {progressData.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-red-700 mb-2">Areas for Improvement</h3>
              <div className="space-y-2">
                {progressData.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Focus Areas</h3>
              <p className="text-blue-700 text-sm">
                Spend more time practicing algebra and geometry problems. Consider reviewing fundamental concepts.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Keep It Up!</h3>
              <p className="text-green-700 text-sm">
                Your writing and reading comprehension skills are strong. Maintain this level with regular practice.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => router.push('/practice-test')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Take Another Test
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
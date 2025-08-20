"use client"

import { useState } from 'react'
import { MODULE_CONFIGS } from '@/data/moduleConfigs'
import EnhancedButton from '@/components/ui/EnhancedButton'

interface TestLauncherProps {
  onStartTest: () => void
}



export default function TestLauncher({ onStartTest }: TestLauncherProps) {
  const [showInstructions, setShowInstructions] = useState(false)

  const getTotalTime = () => {
    return MODULE_CONFIGS.reduce((total, module) => total + module.duration, 0)
  }

  const getTotalQuestions = () => {
    return MODULE_CONFIGS.reduce((total, module) => total + module.questionCount, 0)
  }

  const getModuleIcon = (type: string) => {
    return type === 'math' ? '🔢' : '📚'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SAT Practice Test
          </h1>
          <p className="text-lg text-gray-600">
            Complete digital SAT practice test with realistic timing and format
          </p>
        </div>

        {/* Test Overview */}
        <div className="enhanced-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Test Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {getTotalQuestions()}
              </div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.floor(getTotalTime() / 60)}h {getTotalTime() % 60}m
              </div>
              <div className="text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                4
              </div>
              <div className="text-gray-600">Modules</div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Module Breakdown</h3>
            {MODULE_CONFIGS.map((module) => (
              <div key={module.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getModuleIcon(module.type)}</span>
                  <div>
                    <h4 className="font-semibold">{module.title}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {module.type.replace('-', ' & ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{module.questionCount} questions</div>
                  <div className="text-sm text-gray-600">{module.duration} minutes</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="enhanced-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Test Instructions</h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {showInstructions ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showInstructions && (
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">📋 General Instructions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>This practice test follows the official digital SAT format</li>
                  <li>Each module is timed separately - you cannot return to previous modules</li>
                  <li>You can review and change answers within the current module</li>
                  <li>There are short breaks between modules</li>
                  <li>The test will automatically submit when time expires</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">⏰ Timing</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Reading & Writing modules: 32 minutes each</li>
                  <li>Math modules: 35 minutes each</li>
                  <li>You&apos;ll receive warnings at 5 minutes and 1 minute remaining</li>
                  <li>Take breaks between modules to stay fresh</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🎯 Tips for Success</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Read questions carefully and eliminate obviously wrong answers</li>
                  <li>Manage your time - don&apos;t spend too long on any single question</li>
                  <li>Use the process of elimination for multiple choice questions</li>
                  <li>Review your answers if time permits</li>
                  <li>Stay calm and focused throughout the test</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Preparation Checklist */}
        <div className="enhanced-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Before You Begin</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">I have a quiet, distraction-free environment</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">I have approximately 2.5 hours available</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">My device is charged and connected to stable internet</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">I&apos;m ready to focus and do my best</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={onStartTest}
            className="px-12 py-4 text-xl"
          >
            🚀 Start Practice Test
          </EnhancedButton>
          <p className="text-sm text-gray-600 mt-4">
            Once you start, the timer will begin immediately
          </p>
        </div>
      </div>
    </div>
  )
}
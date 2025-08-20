"use client"

import { ModuleConfig } from '@/types/test'
import EnhancedButton from '@/components/ui/EnhancedButton'
import EnhancedCard from '@/components/ui/EnhancedCard'

interface ModuleStartProps {
  module: ModuleConfig
  onStartModule: () => void
}

export default function ModuleStart({ module, onStartModule }: ModuleStartProps) {
  const getModuleIcon = (type: string) => {
    return type === 'reading-writing' ? '📚' : '🔢'
  }

  const getModuleColor = (type: string) => {
    return type === 'reading-writing' 
      ? 'from-purple-500 to-pink-500' 
      : 'from-blue-500 to-cyan-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <EnhancedCard padding="lg" animation="fade-in" className="text-center">
          {/* Module Icon */}
          <div className={`
            w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-3xl font-bold
            bg-gradient-to-r ${getModuleColor(module.type)}
          `}>
            {module.id}
          </div>

          {/* Module Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <span>{getModuleIcon(module.type)}</span>
            {module.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 capitalize">
            {module.type.replace('-', ' & ')}
          </p>

          {/* Module Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {module.duration}
              </div>
              <div className="text-sm text-blue-800">Minutes</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {module.questionCount}
              </div>
              <div className="text-sm text-green-800">Questions</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Before You Begin:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                You have {module.duration} minutes to complete {module.questionCount} questions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                You can review and change answers within this module
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                The timer will start immediately when you begin
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                You&apos;ll receive warnings at 5 minutes and 1 minute remaining
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <EnhancedButton
            variant="primary"
            size="lg"
            onClick={onStartModule}
            className="w-full py-4 text-xl"
          >
            🚀 Start Module {module.id}
          </EnhancedButton>
          
          <p className="text-sm text-gray-500 mt-4">
            Once you start, the timer will begin immediately
          </p>
        </EnhancedCard>
      </div>
    </div>
  )
}
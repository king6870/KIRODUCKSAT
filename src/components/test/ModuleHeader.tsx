import React from 'react'
import EnhancedProgress from '@/components/ui/EnhancedProgress'
import EnhancedBadge from '@/components/ui/EnhancedBadge'

interface ModuleHeaderProps {
  moduleNumber: number
  moduleTitle: string
  moduleType: 'reading-writing' | 'math'
  timeRemaining: number // in seconds
  progress: number // 0-100
  questionsAnswered: number
  totalQuestions: number
  onTimeWarning?: (timeLeft: number) => void
}

export default function ModuleHeader({
  moduleNumber,
  moduleTitle,
  moduleType,
  timeRemaining,
  progress,
  questionsAnswered,
  totalQuestions,
  onTimeWarning
}: ModuleHeaderProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeVariant = (): 'success' | 'warning' | 'danger' => {
    const minutes = timeRemaining / 60
    if (minutes <= 1) return 'danger'
    if (minutes <= 5) return 'warning'
    return 'success'
  }

  const getModuleTypeColor = (): string => {
    return moduleType === 'reading-writing' 
      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
  }

  const getModuleTypeIcon = (): string => {
    return moduleType === 'reading-writing' ? '📚' : '🔢'
  }

  // Trigger warning callbacks
  React.useEffect(() => {
    const minutes = timeRemaining / 60
    if ((minutes === 5 || minutes === 1) && onTimeWarning) {
      onTimeWarning(timeRemaining)
    }
  }, [timeRemaining, onTimeWarning])

  return (
    <div className="enhanced-card p-6 mb-6 slide-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Module Info */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full ${getModuleTypeColor()} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {moduleNumber}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>{getModuleTypeIcon()}</span>
              {moduleTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <EnhancedBadge 
                variant={moduleType === 'reading-writing' ? 'primary' : 'success'}
                size="sm"
              >
                {moduleType === 'reading-writing' ? 'Reading & Writing' : 'Math'}
              </EnhancedBadge>
              <span className="text-sm text-gray-600">
                Module {moduleNumber} of 4
              </span>
            </div>
          </div>
        </div>

        {/* Timer and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Question Progress */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {questionsAnswered}/{totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              getTimeVariant() === 'danger' ? 'text-red-600 pulse' :
              getTimeVariant() === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Time Left</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <EnhancedProgress
          value={progress}
          variant={
            progress >= 80 ? 'success' :
            progress >= 60 ? 'primary' :
            progress >= 40 ? 'warning' : 'danger'
          }
          size="lg"
          animated={true}
          showLabel={true}
          label="Module Progress"
        />
      </div>

      {/* Time Warning Messages */}
      {timeRemaining <= 300 && timeRemaining > 60 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span className="text-yellow-800 font-medium">
              5 minutes remaining! Please review your answers.
            </span>
          </div>
        </div>
      )}

      {timeRemaining <= 60 && timeRemaining > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">🚨</span>
            <span className="text-red-800 font-medium">
              1 minute remaining! The module will auto-submit soon.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
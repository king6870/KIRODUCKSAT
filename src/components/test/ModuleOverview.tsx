import React from 'react'
import EnhancedCard from '@/components/ui/EnhancedCard'
import EnhancedBadge from '@/components/ui/EnhancedBadge'
import { ModuleConfig } from '@/types/test'

interface ModuleOverviewProps {
  modules: ModuleConfig[]
  completedModules: number[]
  currentModule?: number
  className?: string
}

export default function ModuleOverview({
  modules,
  completedModules,
  currentModule,
  className = ''
}: ModuleOverviewProps) {
  const getModuleStatus = (moduleId: number): 'completed' | 'current' | 'upcoming' => {
    if (completedModules.includes(moduleId)) return 'completed'
    if (moduleId === currentModule) return 'current'
    return 'upcoming'
  }

  const getStatusColor = (status: string): 'success' | 'primary' | 'secondary' => {
    switch (status) {
      case 'completed': return 'success'
      case 'current': return 'primary'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅'
      case 'current': return '▶️'
      default: return '⏳'
    }
  }

  const getModuleTypeIcon = (type: string): string => {
    return type === 'reading-writing' ? '📚' : '🔢'
  }

  const getTotalTime = (): number => {
    return modules.reduce((total, module) => total + module.duration, 0)
  }

  const getTotalQuestions = (): number => {
    return modules.reduce((total, module) => total + module.questionCount, 0)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Test Overview */}
      <EnhancedCard padding="lg" animation="fade-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">SAT Practice Test</h2>
          <p className="text-gray-600">Complete digital SAT format with 4 modules</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
            <div className="text-sm text-blue-800">Modules</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{getTotalQuestions()}</div>
            <div className="text-sm text-green-800">Questions</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{getTotalTime()}</div>
            <div className="text-sm text-purple-800">Minutes</div>
          </div>
        </div>
      </EnhancedCard>

      {/* Module List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {modules.map((module, index) => {
          const status = getModuleStatus(module.id)
          const isActive = status === 'current'
          
          return (
            <EnhancedCard
              key={module.id}
              interactive={false}
              selected={isActive}
              animation="slide-in-up"
              className={`transition-all duration-300 ${
                isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                    ${module.type === 'reading-writing' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }
                  `}>
                    {module.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span>{getModuleTypeIcon(module.type)}</span>
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
                
                <EnhancedBadge
                  variant={getStatusColor(status)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <span>{getStatusIcon(status)}</span>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </EnhancedBadge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{module.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{module.questionCount}</span>
                </div>
              </div>

              {status === 'current' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🎯</span>
                    <span className="text-blue-800 font-medium text-sm">
                      Current module - Ready to begin
                    </span>
                  </div>
                </div>
              )}

              {status === 'completed' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✨</span>
                    <span className="text-green-800 font-medium text-sm">
                      Module completed successfully
                    </span>
                  </div>
                </div>
              )}
            </EnhancedCard>
          )
        })}
      </div>

      {/* Progress Summary */}
      <EnhancedCard padding="lg" animation="slide-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Overall Progress</h3>
            <p className="text-sm text-gray-600">
              {completedModules.length} of {modules.length} modules completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((completedModules.length / modules.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
          />
        </div>
      </EnhancedCard>
    </div>
  )
}
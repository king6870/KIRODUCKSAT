import { ModuleConfig } from '@/types/test'

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 1,
    type: 'reading-writing',
    duration: 32,
    questionCount: 27,
    title: 'Reading and Writing - Module 1',
    description: 'This module tests your reading comprehension, grammar, and writing skills.'
  },
  {
    id: 2,
    type: 'reading-writing',
    duration: 32,
    questionCount: 27,
    title: 'Reading and Writing - Module 2',
    description: 'This module adapts to your Module 1 performance with appropriate difficulty questions.'
  },
  {
    id: 3,
    type: 'math',
    duration: 35,
    questionCount: 22,
    title: 'Math - Module 1',
    description: 'This module covers algebra, geometry, statistics, and advanced math topics.'
  },
  {
    id: 4,
    type: 'math',
    duration: 35,
    questionCount: 22,
    title: 'Math - Module 2',
    description: 'This module adapts to your Module 3 performance with appropriate difficulty questions.'
  }
]

export const getModuleConfig = (moduleId: number): ModuleConfig | undefined => {
  return MODULE_CONFIGS.find(config => config.id === moduleId)
}

export const getTotalTestTime = (): number => {
  return MODULE_CONFIGS.reduce((total, config) => total + config.duration, 0)
}

export const getTotalQuestions = (): number => {
  return MODULE_CONFIGS.reduce((total, config) => total + config.questionCount, 0)
}
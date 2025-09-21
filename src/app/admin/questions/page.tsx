"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ComprehensiveQuestionDisplay from '@/components/ComprehensiveQuestionDisplay'
import ChartRenderer from '@/components/ChartRenderer'
import ChartBuilder from '@/components/admin/ChartBuilder'

interface Question {
  id: string
  question: string
  passage?: string
  options: string[]
  correctAnswer: number
  explanation: string
  wrongAnswerExplanations?: string[]
  moduleType: string
  difficulty: string
  category: string
  subtopic: string
  chartData?: any
  chartDescription?: string
  hasChart?: boolean
  graphType?: string
  imageUrl?: string
  imageAlt?: string
  timeEstimate: number
  source: string
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  subtopicInfo?: {
    id: string
    name: string
    topic: string
  }
}

interface Stats {
  total: number
  byModule: {
    math: number
    reading: number
  }
  byDifficulty: {
    easy: number
    medium: number
    hard: number
  }
  active: number
  inactive: number
}

const ADMIN_EMAILS = ['lionvihaan@gmail.com', 'kingjacobisthegoat@gmail.com']

export default function AdminQuestions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    moduleType: '',
    difficulty: '',
    category: '',
    subtopic: '',
    search: '',
    isActive: 'true'
  })
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Check admin access
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    fetchQuestions()
  }, [filters, currentPage])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.moduleType) params.append('moduleType', filters.moduleType)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.category) params.append('category', filters.category)
      if (filters.subtopic) params.append('subtopic', filters.subtopic)
      if (filters.search) params.append('search', filters.search)
      if (filters.isActive !== '') params.append('isActive', filters.isActive)
      params.append('page', currentPage.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/admin/questions?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setQuestions(data.questions)
        setStats(data.stats)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchQuestions()
        alert('Question deleted successfully')
      } else {
        alert('Failed to delete question')
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('Failed to delete question')
    }
  }

  const clearFilters = () => {
    setFilters({
      moduleType: '',
      difficulty: '',
      category: '',
      subtopic: '',
      search: '',
      isActive: ''
    })
    setCurrentPage(1)
  }

  const handleToggleActive = async (questionId: string, isActive: boolean) => {
    try {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...question,
          isActive: !isActive
        })
      })

      if (response.ok) {
        fetchQuestions()
      } else {
        alert('Failed to update question')
      }
    } catch (error) {
      console.error('Failed to update question:', error)
      alert('Failed to update question')
    }
  }

  const handlePreview = (question: Question) => {
    setSelectedQuestion(question)
    setShowPreview(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                <p className="mt-2 text-gray-600">Manage SAT questions for DuckSAT</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create Question
                </button>
                <button
                  onClick={() => router.push('/admin/generate')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Generate with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">{stats.byModule.math}</div>
              <div className="text-sm text-gray-600">Math</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.byModule.reading}</div>
              <div className="text-sm text-gray-600">Reading</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear All Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={filters.moduleType}
              onChange={(e) => setFilters({...filters, moduleType: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Modules</option>
              <option value="math">Math</option>
              <option value="reading-writing">Reading & Writing</option>
            </select>
            
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            <input
              type="text"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            
            <input
              type="text"
              placeholder="Subtopic"
              value={filters.subtopic}
              onChange={(e) => setFilters({...filters, subtopic: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading questions...</div>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">No questions found matching your filters.</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visual Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {question.question.substring(0, 100)}...
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {question.subtopic}
                      </div>
                      {/* Visual indicators */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {question.passage && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">📖 Passage</span>
                        )}
                        {question.chartData && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">📊 Chart Data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* Generated Image */}
                        {question.imageUrl && (
                          <div className="text-xs bg-gray-50 p-2 rounded border-l-4 border-purple-500">
                            <div className="font-semibold text-purple-700 mb-2">🖼️ Generated Image:</div>
                            <img 
                              src={question.imageUrl} 
                              alt={question.imageAlt || 'Generated chart'} 
                              className="max-w-48 h-auto rounded border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(question.imageUrl, '_blank')}
                              onError={(e) => {
                                console.error('Image failed to load:', question.imageUrl)
                                const target = e.currentTarget as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const errorDiv = document.createElement('div')
                                  errorDiv.className = 'text-red-600 text-xs p-2 bg-red-50 rounded'
                                  errorDiv.textContent = '❌ Image failed to load'
                                  parent.appendChild(errorDiv)
                                }
                              }}
                            />
                            {question.imageAlt && (
                              <div className="text-gray-600 mt-1 text-xs">
                                Alt: {question.imageAlt}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Chart Data */}
                        {question.chartData && (
                          <div className="text-xs bg-gray-50 p-2 rounded border-l-4 border-green-500">
                            <div className="font-semibold text-green-700 mb-2">📊 Chart Data:</div>
                            {question.chartData.diagramType === 'image' ? (
                              <div className="text-gray-600 mb-2">
                                Type: Uploaded Image<br/>
                                <img 
                                  src={question.chartData.imageUrl} 
                                  alt="Diagram" 
                                  className="max-w-32 h-auto rounded border shadow-sm mt-2"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="text-gray-600 mb-2">
                                  Type: {question.chartData.type || 'Unknown'}<br/>
                                  Data Points: {question.chartData.data?.length || question.chartData.points?.length || 'N/A'}
                                </div>
                                <div className="bg-white p-2 rounded border">
                                  <ChartRenderer chartData={question.chartData} className="max-w-xs" />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Passage Preview */}
                        {question.passage && (
                          <div className="text-xs bg-gray-50 p-2 rounded border-l-4 border-blue-500">
                            <div className="font-semibold text-blue-700 mb-1">📖 Passage:</div>
                            <div className="text-gray-600">
                              {question.passage.substring(0, 100)}...
                            </div>
                          </div>
                        )}
                        
                        {/* No visual content */}
                        {!question.passage && !question.chartData && (
                          <div className="text-xs text-gray-400 italic">No visual content</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        question.moduleType === 'math' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {question.moduleType === 'math' ? 'Math' : 'Reading'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        question.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handlePreview(question)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => router.push(`/admin/questions/edit/${question.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(question.id, question.isActive)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {question.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && questions.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, stats?.total || 0)} of {stats?.total || 0} questions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Question Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <ComprehensiveQuestionDisplay
                question={selectedQuestion}
                showAnswer={true}
                showMetadata={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateForm && (
        <CreateQuestionModal 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchQuestions()
          }}
        />
      )}
    </div>
  )
}

function CreateQuestionModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    question: '',
    passage: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    moduleType: 'math',
    difficulty: 'easy',
    category: '',
    chartData: null as any
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timeEstimate: 90,
          isActive: true
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Failed to create question')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Error creating question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create New Question</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Type</label>
                <select
                  value={formData.moduleType}
                  onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="math">Math</option>
                  <option value="reading-writing">Reading & Writing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Algebra, Geometry"
                  required
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Enter the question text..."
                required
              />
            </div>

            {/* Passage (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passage (Optional)</label>
              <textarea
                value={formData.passage}
                onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={4}
                placeholder="Enter passage text if needed..."
              />
            </div>

            {/* Chart Builder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart/Diagram (Optional)</label>
              <ChartBuilder
                chartData={formData.chartData}
                onChange={(chartData) => setFormData({ ...formData, chartData })}
              />
            </div>

            {/* Answer Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData({ ...formData, correctAnswer: index })}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Explain why the correct answer is right..."
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

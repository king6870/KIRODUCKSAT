"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Question {
  id: number
  type: 'math' | 'reading' | 'writing'
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    type: 'math',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '5', '7', '15'],
    correctAnswer: 1,
    explanation: 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.'
  },
  {
    id: 2,
    type: 'reading',
    question: 'Based on the passage, the author\'s primary purpose is to:',
    options: [
      'Criticize modern technology',
      'Explain the benefits of renewable energy',
      'Compare different energy sources',
      'Advocate for policy changes'
    ],
    correctAnswer: 1,
    explanation: 'The passage focuses on explaining how renewable energy benefits society and the environment.'
  },
  {
    id: 3,
    type: 'writing',
    question: 'Which choice provides the most effective transition between the two paragraphs?',
    options: [
      'However, this approach has limitations.',
      'In addition, scientists have discovered',
      'Therefore, the results were surprising.',
      'Meanwhile, other researchers disagree.'
    ],
    correctAnswer: 0,
    explanation: 'The word "However" creates a contrast that effectively transitions between opposing ideas.'
  },
  {
    id: 4,
    type: 'math',
    question: 'A circle has a radius of 6 units. What is its area? (Use π ≈ 3.14)',
    options: ['36π', '12π', '18π', '24π'],
    correctAnswer: 0,
    explanation: 'Area of a circle = πr². With r = 6, Area = π(6)² = 36π.'
  },
  {
    id: 5,
    type: 'reading',
    question: 'The word "meticulous" in line 15 most nearly means:',
    options: ['Careless', 'Detailed', 'Quick', 'Expensive'],
    correctAnswer: 1,
    explanation: 'Meticulous means showing great attention to detail; being very careful and precise.'
  }
]

export default function PracticeTest() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(sampleQuestions.length).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes for demo

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowResults(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session, router])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === sampleQuestions[index].correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!session) {
    return <div>Loading...</div>
  }

  if (showResults) {
    const score = calculateScore()
    const percentage = Math.round((score / sampleQuestions.length) * 100)
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Test Results</h1>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-4">{percentage}%</div>
              <p className="text-xl text-gray-600">
                You scored {score} out of {sampleQuestions.length} questions correctly
              </p>
            </div>

            <div className="space-y-6">
              {sampleQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[index]
                const isCorrect = userAnswer === question.correctAnswer
                
                return (
                  <div key={question.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    <p className="mb-4">{question.question}</p>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`p-3 rounded border ${
                          optionIndex === question.correctAnswer ? 'bg-green-50 border-green-300' :
                          optionIndex === userAnswer && !isCorrect ? 'bg-red-50 border-red-300' :
                          'bg-gray-50'
                        }`}>
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span> {option}
                          {optionIndex === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">✓ Correct Answer</span>
                          )}
                          {optionIndex === userAnswer && !isCorrect && (
                            <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">Explanation:</p>
                      <p className="text-blue-700">{question.explanation}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-8 space-x-4">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Return Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Take Another Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = sampleQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">SAT Practice Test</h1>
            <div className="text-lg font-medium text-red-600">
              Time: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {sampleQuestions.length} • {question.type.toUpperCase()}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>
          
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              {selectedAnswers.filter(a => a !== -1).length} of {sampleQuestions.length} answered
            </div>
            
            {currentQuestion === sampleQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
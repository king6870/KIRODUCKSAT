import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily return static data for production build
    return NextResponse.json([
      {
        id: 'temp-1',
        moduleType: 'reading-writing',
        difficulty: 'medium',
        category: 'reading-comprehension',
        question: 'Sample question for production',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Sample explanation',
        timeEstimate: 60
      }
    ])
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleType = searchParams.get('moduleType') // 'reading-writing' | 'math'
    const difficulty = searchParams.get('difficulty') // 'easy' | 'medium' | 'hard'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '27')

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true
    }

    if (moduleType) {
      where.moduleType = moduleType
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (category) {
      where.category = category
    }

    // Fetch questions from database
    const questions = await prisma.question.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Transform to match frontend interface
    const transformedQuestions = questions.map((q: {
      id: string;
      moduleType: string;
      difficulty: string;
      category: string;
      question: string;
      passage: string | null;
      options: unknown;
      correctAnswer: number;
      explanation: string;
      timeEstimate: number;
    }) => ({
      id: q.id,
      moduleType: q.moduleType,
      difficulty: q.difficulty,
      category: q.category,
      question: q.question,
      passage: q.passage,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      timeEstimate: q.timeEstimate
    }))

    return NextResponse.json(transformedQuestions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

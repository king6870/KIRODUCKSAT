import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleType = searchParams.get('moduleType') // 'reading-writing' | 'math'
    const difficulty = searchParams.get('difficulty') // 'easy' | 'medium' | 'hard'
    const category = searchParams.get('category')
    const subtopic = searchParams.get('subtopic')
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

    if (subtopic) {
      where.subtopic = subtopic
    }

    // Fetch questions from database
    const questions = await prisma.question.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Transform to match frontend interface with enhanced features
    const transformedQuestions = questions.map((q: {
      id: string;
      moduleType: string;
      difficulty: string;
      category: string;
      subtopic: string | null;
      question: string;
      passage: string | null;
      options: unknown;
      correctAnswer: number;
      explanation: string;
      wrongAnswerExplanations: unknown;
      imageUrl: string | null;
      imageAlt: string | null;
      chartData: unknown;
      timeEstimate: number;
      source: string | null;
      tags: string[];
    }) => ({
      id: q.id,
      moduleType: q.moduleType,
      difficulty: q.difficulty,
      category: q.category,
      subtopic: q.subtopic,
      question: q.question,
      passage: q.passage,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      wrongAnswerExplanations: q.wrongAnswerExplanations as Record<number, string>,
      imageUrl: q.imageUrl,
      imageAlt: q.imageAlt,
      chartData: q.chartData,
      timeEstimate: q.timeEstimate,
      source: q.source,
      tags: q.tags
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

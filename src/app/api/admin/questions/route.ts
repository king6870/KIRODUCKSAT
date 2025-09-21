import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleType = searchParams.get('moduleType')
    const difficulty = searchParams.get('difficulty')
    const category = searchParams.get('category')
    const subtopic = searchParams.get('subtopic')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    
    if (moduleType) where.moduleType = moduleType
    if (difficulty) where.difficulty = difficulty
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (subtopic) where.subtopic = { contains: subtopic, mode: 'insensitive' }
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { subtopic: { contains: search, mode: 'insensitive' } }
      ]
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.question.count({ where })
    const totalPages = Math.ceil(total / limit)

    // Get stats for all questions (not just filtered)
    const allQuestions = await prisma.question.findMany()
    const stats = {
      total: allQuestions.length,
      byModule: {
        math: allQuestions.filter(q => q.moduleType === 'math').length,
        reading: allQuestions.filter(q => q.moduleType === 'reading-writing').length
      },
      byDifficulty: {
        easy: allQuestions.filter(q => q.difficulty === 'easy').length,
        medium: allQuestions.filter(q => q.difficulty === 'medium').length,
        hard: allQuestions.filter(q => q.difficulty === 'hard').length
      },
      active: allQuestions.filter(q => q.isActive).length,
      inactive: allQuestions.filter(q => !q.isActive).length
    }

    return NextResponse.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        passage: q.passage,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        moduleType: q.moduleType,
        difficulty: q.difficulty,
        category: q.category,
        subtopic: q.subtopic,
        chartData: q.chartData,
        timeEstimate: q.timeEstimate,
        source: q.source,
        tags: q.tags,
        isActive: q.isActive,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      stats
    })
  } catch (error: any) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      question,
      passage,
      options,
      correctAnswer,
      explanation,
      moduleType,
      difficulty,
      category,
      chartData,
      timeEstimate = 90
    } = body

    // Validate required fields
    if (!question || !options || options.length !== 4 || correctAnswer === undefined || !explanation || !moduleType || !difficulty || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create the question
    const newQuestion = await prisma.question.create({
      data: {
        question,
        passage: passage || null,
        options,
        correctAnswer,
        explanation,
        moduleType,
        difficulty,
        category,
        subtopic: category, // Use category as subtopic for now
        chartData: chartData || null,
        timeEstimate,
        source: 'admin-created',
        tags: [],
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      question: {
        id: newQuestion.id,
        question: newQuestion.question,
        passage: newQuestion.passage,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
        explanation: newQuestion.explanation,
        moduleType: newQuestion.moduleType,
        difficulty: newQuestion.difficulty,
        category: newQuestion.category,
        subtopic: newQuestion.subtopic,
        chartData: newQuestion.chartData,
        timeEstimate: newQuestion.timeEstimate,
        source: newQuestion.source,
        tags: newQuestion.tags,
        isActive: newQuestion.isActive,
        createdAt: newQuestion.createdAt,
        updatedAt: newQuestion.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create question'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    const total = questions.length

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
        page: 1,
        limit: total,
        total,
        pages: 1
      },
      stats: {
        total,
        byModule: {
          math: questions.filter(q => q.moduleType === 'math').length,
          reading: questions.filter(q => q.moduleType === 'reading-writing').length
        },
        byDifficulty: {
          easy: questions.filter(q => q.difficulty === 'easy').length,
          medium: questions.filter(q => q.difficulty === 'medium').length,
          hard: questions.filter(q => q.difficulty === 'hard').length
        },
        active: total,
        inactive: 0
      }
    })
  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Individual Question Management API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ADMIN_EMAILS } from '@/middleware/adminAuth'

async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  return null
}

// GET - Get single question
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth()
  if (authError) return authError

  try {
    const params = await context.params
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        subtopicRef: {
          include: {
            topic: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      question: {
        id: question.id,
        question: question.question,
        passage: question.passage,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        wrongAnswerExplanations: question.wrongAnswerExplanations,
        moduleType: question.moduleType,
        difficulty: question.difficulty,
        category: question.category,
        subtopic: question.subtopic,
        chartData: question.chartData,
        imageUrl: question.imageUrl,
        imageAlt: question.imageAlt,
        timeEstimate: question.timeEstimate,
        source: question.source,
        tags: question.tags,
        isActive: question.isActive,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        subtopicInfo: question.subtopicRef ? {
          id: question.subtopicRef.id,
          name: question.subtopicRef.name,
          topic: question.subtopicRef.topic.name
        } : null
      }
    })
  } catch (error) {
    console.error('Failed to fetch question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

// PUT - Update question
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth()
  if (authError) return authError

  try {
    const params = await context.params
    const body = await request.json()
    const {
      question,
      passage,
      options,
      correctAnswer,
      explanation,
      wrongAnswerExplanations,
      moduleType,
      difficulty,
      category,
      subtopic,
      chartData,
      imageUrl,
      imageAlt,
      timeEstimate,
      tags,
      isActive
    } = body

    // Validation
    if (!question || !options || options.length !== 4 || correctAnswer < 0 || correctAnswer > 3) {
      return NextResponse.json(
        { error: 'Invalid question data' },
        { status: 400 }
      )
    }

    // Find subtopic
    const subtopicRecord = await prisma.subtopic.findFirst({
      where: {
        name: { contains: subtopic, mode: 'insensitive' }
      }
    })

    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: {
        subtopicId: subtopicRecord?.id || null,
        question,
        passage,
        options,
        correctAnswer,
        explanation,
        wrongAnswerExplanations,
        moduleType,
        difficulty,
        category,
        subtopic,
        chartData,
        imageUrl,
        imageAlt,
        timeEstimate,
        tags,
        isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      question: updatedQuestion
    })
  } catch (error) {
    console.error('Failed to update question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await checkAdminAuth()
  if (authError) return authError

  try {
    const params = await context.params
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: params.id }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: params.id }
    })

    // Update subtopic count if needed
    if (question.subtopicId) {
      await prisma.subtopic.update({
        where: { id: question.subtopicId },
        data: {
          currentCount: {
            decrement: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}

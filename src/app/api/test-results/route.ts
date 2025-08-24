import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const {
      startTime,
      endTime,
      totalTimeSpent,
      totalQuestions,
      correctAnswers,
      score,
      moduleResults,
      categoryPerformance
    } = await request.json()

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalTimeSpent,
        totalQuestions,
        correctAnswers,
        score,
        categoryPerformance
      }
    })

    // Create individual question results
    const questionResults = []
    for (const moduleResult of moduleResults) {
      for (const questionResult of moduleResult) {
        questionResults.push({
          testResultId: testResult.id,
          questionId: questionResult.questionId,
          userAnswer: questionResult.userAnswer,
          isCorrect: questionResult.isCorrect,
          timeSpent: questionResult.timeSpent
        })
      }
    }

    await prisma.questionResult.createMany({
      data: questionResults
    })

    // Update user analytics
    await updateUserAnalytics(user.id, {
      score,
      totalTimeSpent,
      totalQuestions,
      correctAnswers,
      categoryPerformance
    })

    // Log usage analytics
    await prisma.usageAnalytics.create({
      data: {
        userId: user.id,
        action: 'test_completed',
        metadata: {
          score,
          totalQuestions,
          correctAnswers,
          timeSpent: totalTimeSpent
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      testResultId: testResult.id 
    })
  } catch (error) {
    console.error('Error saving test result:', error)
    return NextResponse.json(
      { error: 'Failed to save test result' },
      { status: 500 }
    )
  }
}

async function updateUserAnalytics(userId: string, testData: {
  score: number;
  totalTimeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  categoryPerformance: Record<string, { correct: number; total: number }>;
}) {
  try {
    // Get or create user analytics
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: {
          userId,
          totalTestsTaken: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          totalQuestionsAnswered: 0
        }
      })
    }

    // Calculate new averages
    const newTestCount = analytics.totalTestsTaken + 1
    const newAverageScore = (
      (analytics.averageScore * analytics.totalTestsTaken + testData.score) / 
      newTestCount
    )

    // Find strongest and weakest categories
    const categoryEntries = Object.entries(testData.categoryPerformance)
    const categoryPercentages = categoryEntries.map(([category, stats]) => ({
      category,
      percentage: (stats.correct / stats.total) * 100
    }))
    
    const strongestCategory = categoryPercentages.reduce((max, curr) => 
      curr.percentage > max.percentage ? curr : max
    ).category

    const weakestCategory = categoryPercentages.reduce((min, curr) => 
      curr.percentage < min.percentage ? curr : min
    ).category

    // Update analytics
    await prisma.userAnalytics.update({
      where: { userId },
      data: {
        totalTestsTaken: newTestCount,
        averageScore: newAverageScore,
        totalTimeSpent: analytics.totalTimeSpent + testData.totalTimeSpent,
        totalQuestionsAnswered: analytics.totalQuestionsAnswered + testData.totalQuestions,
        strongestCategory,
        weakestCategory,
        lastTestDate: new Date()
      }
    })

    // Update category performance
    for (const [category, stats] of categoryEntries) {
      await prisma.categoryPerformance.upsert({
        where: {
          userId_category_subtopic: {
            userId,
            category,
            subtopic: category // Use category as subtopic for now
          }
        },
        update: {
          totalAnswered: {
            increment: stats.total
          },
          totalCorrect: {
            increment: stats.correct
          },
          lastPracticed: new Date()
        },
        create: {
          userId,
          category,
          subtopic: category, // Use category as subtopic for now
          totalAnswered: stats.total,
          totalCorrect: stats.correct,
          lastPracticed: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating user analytics:', error)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user's test results
    const testResults = await prisma.testResult.findMany({
      where: { userId: user.id },
      include: {
        questionResults: {
          include: {
            question: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    return NextResponse.json(testResults)
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateSATScore } from '@/utils/satScoring'

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
      categoryPerformance,
      subtopicPerformance,
      difficultyPerformance
    } = await request.json()

    // Calculate SAT scores
    const flatResults = moduleResults.flat()
    const rwQuestions = flatResults.filter((r: any) => r.moduleType === 'reading-writing')
    const mathQuestions = flatResults.filter((r: any) => r.moduleType === 'math')
    const rwCorrect = rwQuestions.filter((r: any) => r.isCorrect).length
    const mathCorrect = mathQuestions.filter((r: any) => r.isCorrect).length

    const satScore = calculateSATScore(rwCorrect, rwQuestions.length, mathCorrect, mathQuestions.length)

    // Create test result with SAT scores
    const testResult = await prisma.testResult.create({
      data: {
        userId: user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalTimeSpent,
        totalQuestions,
        correctAnswers,
        score,
        satTotalScore: satScore.totalScore,
        satReadingScore: satScore.readingWritingScore,
        satMathScore: satScore.mathScore,
        percentile: satScore.percentile,
        categoryPerformance,
        subtopicPerformance: subtopicPerformance || categoryPerformance,
        difficultyPerformance: difficultyPerformance || {}
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
      satScore: satScore.totalScore,
      totalTimeSpent,
      totalQuestions,
      correctAnswers,
      categoryPerformance
    })

    return NextResponse.json({ 
      success: true, 
      testResultId: testResult.id,
      satScore: satScore.totalScore
    })

  } catch (error) {
    console.error('Error saving test results:', error)
    return NextResponse.json({ error: 'Failed to save test results' }, { status: 500 })
  }
}

async function updateUserAnalytics(userId: string, testData: any) {
  try {
    // Get existing analytics
    const existing = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (existing) {
      // Update existing analytics
      const newTestCount = existing.totalTestsTaken + 1
      const newAverageScore = ((existing.averageScore * existing.totalTestsTaken) + testData.satScore) / newTestCount
      
      await prisma.userAnalytics.update({
        where: { userId },
        data: {
          totalTestsTaken: newTestCount,
          averageScore: newAverageScore,
          totalTimeSpent: existing.totalTimeSpent + testData.totalTimeSpent,
          totalQuestionsAnswered: existing.totalQuestionsAnswered + testData.totalQuestions,
          lastTestDate: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new analytics
      await prisma.userAnalytics.create({
        data: {
          userId,
          totalTestsTaken: 1,
          averageScore: testData.satScore,
          totalTimeSpent: testData.totalTimeSpent,
          totalQuestionsAnswered: testData.totalQuestions,
          lastTestDate: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating user analytics:', error)
  }
}

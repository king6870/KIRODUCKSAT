import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeGeometryQuestions() {
  try {
    console.log('🚫 Removing geometry questions...')
    
    const result = await prisma.question.deleteMany({
      where: {
        OR: [
          { question: { contains: 'triangle', mode: 'insensitive' } },
          { question: { contains: 'circle', mode: 'insensitive' } },
          { question: { contains: 'angle', mode: 'insensitive' } },
          { question: { contains: 'polygon', mode: 'insensitive' } },
          { question: { contains: 'rectangle', mode: 'insensitive' } },
          { question: { contains: 'square', mode: 'insensitive' } },
          { category: { contains: 'geometry', mode: 'insensitive' } }
        ]
      }
    })
    
    console.log(`✅ Removed ${result.count} geometry questions`)
    
    // Verify
    const remaining = await prisma.question.count({
      where: {
        OR: [
          { question: { contains: 'triangle', mode: 'insensitive' } },
          { question: { contains: 'circle', mode: 'insensitive' } },
          { question: { contains: 'angle', mode: 'insensitive' } },
          { question: { contains: 'polygon', mode: 'insensitive' } },
          { question: { contains: 'rectangle', mode: 'insensitive' } },
          { question: { contains: 'square', mode: 'insensitive' } }
        ]
      }
    })
    
    console.log(`🔍 Remaining geometry questions: ${remaining}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeGeometryQuestions()

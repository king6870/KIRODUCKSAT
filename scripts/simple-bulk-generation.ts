import { PrismaClient } from '@prisma/client'
import { getAllSubtopics } from '@/data/sat-topics'

const prisma = new PrismaClient()

// Simple question interface
interface SimpleQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subtopic: string
  category: string
  moduleType: string
  difficulty: string
  points: number
  hasChart?: boolean
  chartDescription?: string
  interactionType?: string
  graphType?: string
  passage?: string
}

async function generateSimpleQuestions() {
  console.log('🚀 Starting simple bulk question generation...')
  
  const allSubtopics = getAllSubtopics()
  let totalGenerated = 0
  
  for (const subtopic of allSubtopics) {
    console.log(`\n📚 Processing: ${subtopic.name} (${subtopic.moduleType})`)
    
    // Check existing questions
    const existingCount = await prisma.question.count({
      where: {
        subtopic: subtopic.name,
        moduleType: subtopic.moduleType,
        isActive: true
      }
    })
    
    console.log(`   📊 Existing questions: ${existingCount}`)
    
    const targetQuestions = 100
    const questionsNeeded = Math.max(0, targetQuestions - existingCount)
    
    if (questionsNeeded === 0) {
      console.log(`   ✅ Already has enough questions - skipping`)
      continue
    }
    
    console.log(`   🎯 Need to generate: ${questionsNeeded} questions`)
    
    // Generate questions in batches of 5
    const batches = Math.ceil(questionsNeeded / 5)
    
    for (let batch = 0; batch < Math.min(batches, 20); batch++) { // Limit to 20 batches (100 questions) for now
      console.log(`   📦 Batch ${batch + 1}/${Math.min(batches, 5)}`)
      
      try {
        // Call GPT-4o directly with correct endpoint
        const response = await fetch('https://ai-manojwin82958ai594424696620.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': 'FhyeuwcfKGaNEhoq3U7VOKg4s0sfobVW7fNIdDA7EaI05dyIXQqMJQQJ99BBACHYHv6XJ3w3AAAAACOGsrpa'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are an expert SAT question generator. Generate exactly 5 high-quality SAT questions for the subtopic "${subtopic.name}" in the "${subtopic.moduleType}" module.

REQUIREMENTS:
- ${subtopic.moduleType === 'math' ? 'Each question must include detailed visual elements (graphs, charts, tables, diagrams)' : 'Include passages when appropriate for reading comprehension'}
- Use proper mathematical notation
- Provide 4 multiple choice options (A, B, C, D)
- Include detailed explanations
- Vary difficulty levels
- Make questions realistic and SAT-appropriate

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    ${subtopic.moduleType === 'reading-writing' ? '"passage": "Reading passage if applicable",' : ''}
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": 0,
    "points": 2,
    "explanation": "Detailed explanation",
    "subtopic": "${subtopic.name}",
    "category": "${subtopic.topicName}",
    "moduleType": "${subtopic.moduleType}",
    "difficulty": "medium",
    ${subtopic.moduleType === 'math' ? '"hasChart": true,' : ''}
    ${subtopic.moduleType === 'math' ? '"chartDescription": "Detailed description of visual elements",' : ''}
    ${subtopic.moduleType === 'math' ? '"interactionType": "point-selection",' : ''}
    ${subtopic.moduleType === 'math' ? '"graphType": "coordinate-plane"' : ''}
  }
]`
              }
            ],
            max_tokens: 4000,
            temperature: 0.7
          })
        })
        
        if (!response.ok) {
          console.log(`   ❌ API call failed: ${response.status}`)
          continue
        }
        
        const data = await response.json()
        const content = data.choices[0]?.message?.content
        
        if (!content) {
          console.log(`   ❌ No content in response`)
          continue
        }
        
        // Parse JSON
        let questions: SimpleQuestion[]
        try {
          // Remove markdown code blocks if present
          let cleanContent = content.trim()
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
          }
          
          questions = JSON.parse(cleanContent)
        } catch (error) {
          console.log(`   ❌ JSON parse error: ${error}`)
          continue
        }
        
        if (!Array.isArray(questions)) {
          console.log(`   ❌ Response is not an array`)
          continue
        }
        
        // Store questions directly in database
        let stored = 0
        for (const q of questions) {
          try {
            // Find or create subtopic in database
            let dbSubtopic = await prisma.subtopic.findFirst({
              where: { 
                name: subtopic.name,
                topic: {
                  name: subtopic.topicName,
                  moduleType: subtopic.moduleType
                }
              }
            })
            
            if (!dbSubtopic) {
              // Find or create topic first
              let topic = await prisma.topic.findFirst({
                where: { 
                  name: subtopic.topicName,
                  moduleType: subtopic.moduleType
                }
              })
              
              if (!topic) {
                topic = await prisma.topic.create({
                  data: {
                    name: subtopic.topicName,
                    moduleType: subtopic.moduleType,
                    description: `${subtopic.topicName} topics for SAT ${subtopic.moduleType}`
                  }
                })
              }
              
              dbSubtopic = await prisma.subtopic.create({
                data: {
                  name: subtopic.name,
                  description: `${subtopic.name} questions`,
                  topicId: topic.id
                }
              })
            }
            
            // Create question
            await prisma.question.create({
              data: {
                subtopicId: dbSubtopic.id,
                moduleType: subtopic.moduleType,
                difficulty: q.difficulty || 'medium',
                category: subtopic.topicName,
                subtopic: subtopic.name,
                question: q.question,
                passage: q.passage || null,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                wrongAnswerExplanations: null,
                imageUrl: null,
                imageAlt: null,
                chartData: q.hasChart ? {
                  description: q.chartDescription || '',
                  interactionType: q.interactionType || 'none',
                  graphType: q.graphType || 'coordinate-plane'
                } : null,
                timeEstimate: (q.points || 2) * 30,
                source: 'AI Generated (GPT-4o)',
                tags: [q.difficulty || 'medium', subtopic.topicName, subtopic.name],
                isActive: true
              }
            })
            
            stored++
            totalGenerated++
            
          } catch (error) {
            console.log(`   ⚠️  Error storing question: ${error}`)
          }
        }
        
        console.log(`   ✅ Batch ${batch + 1}: Stored ${stored}/${questions.length} questions`)
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 3000))
        
      } catch (error) {
        console.error(`   ❌ Error in batch ${batch + 1}:`, error)
      }
    }
  }
  
  console.log(`\n🎉 Simple generation complete!`)
  console.log(`📊 Total questions generated: ${totalGenerated}`)
  
  // Final database count
  const finalCount = await prisma.question.count({ where: { isActive: true } })
  console.log(`📈 Total questions in database: ${finalCount}`)
}

// Run the generation
generateSimpleQuestions().catch(console.error).finally(() => prisma.$disconnect())

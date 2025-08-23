import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing questions
  await prisma.questionResult.deleteMany()
  await prisma.question.deleteMany()
  
  console.log('🗑️ Cleared existing questions')

  // Reading and Writing Questions - Module 1
  const readingWritingModule1 = [
    {
      moduleType: 'reading-writing',
      difficulty: 'medium',
      category: 'reading-comprehension',
      question: 'Based on the passage, the author\'s primary purpose is to:',
      passage: 'Climate change represents one of the most pressing challenges of our time. Scientists worldwide have reached a consensus that human activities, particularly the burning of fossil fuels, are the primary drivers of recent global warming. The evidence is overwhelming: rising global temperatures, melting ice caps, and increasingly frequent extreme weather events all point to the urgent need for action.',
      options: [
        'Criticize scientists for their research methods',
        'Explain the scientific consensus on climate change',
        'Argue against taking action on climate change',
        'Compare different types of fossil fuels'
      ],
      correctAnswer: 1,
      explanation: 'The passage focuses on explaining that scientists have reached consensus about human-caused climate change and presents evidence supporting this view.',
      timeEstimate: 90
    },
    {
      moduleType: 'reading-writing',
      difficulty: 'easy',
      category: 'grammar',
      question: 'Which choice provides the most effective transition between the two sentences?',
      options: [
        'However, this approach has limitations.',
        'In addition, scientists have discovered',
        'Therefore, the results were surprising.',
        'Meanwhile, other researchers disagree.'
      ],
      correctAnswer: 0,
      explanation: 'The word "However" creates an effective contrast that transitions between opposing ideas in the context.',
      timeEstimate: 60
    },
    {
      moduleType: 'reading-writing',
      difficulty: 'medium',
      category: 'vocabulary',
      question: 'The word "meticulous" in line 15 most nearly means:',
      options: ['Careless', 'Detailed', 'Quick', 'Expensive'],
      correctAnswer: 1,
      explanation: 'Meticulous means showing great attention to detail; being very careful and precise.',
      timeEstimate: 45
    }
  ]

  // Add more reading/writing questions
  for (let i = 4; i <= 27; i++) {
    readingWritingModule1.push({
      moduleType: 'reading-writing',
      difficulty: ['easy', 'medium', 'hard'][(i - 1) % 3] as 'easy' | 'medium' | 'hard',
      category: ['reading-comprehension', 'grammar', 'vocabulary', 'writing-skills'][(i - 1) % 4],
      question: `Reading and Writing question ${i} for Module 1`,
      passage: i % 2 === 0 ? 'Sample passage for reading comprehension questions...' : undefined,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ],
      correctAnswer: (i - 1) % 4,
      explanation: `Explanation for question ${i}`,
      timeEstimate: 60 + ((i - 1) % 3) * 15
    })
  }

  // Math Questions - Module 1
  const mathModule1 = [
    {
      moduleType: 'math',
      difficulty: 'medium',
      category: 'algebra',
      question: 'If 3x + 7 = 22, what is the value of x?',
      options: ['3', '5', '7', '15'],
      correctAnswer: 1,
      explanation: 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.',
      timeEstimate: 120
    },
    {
      moduleType: 'math',
      difficulty: 'medium',
      category: 'geometry',
      question: 'A circle has a radius of 6 units. What is its area? (Use π ≈ 3.14)',
      options: ['36π', '12π', '18π', '24π'],
      correctAnswer: 0,
      explanation: 'Area of a circle = πr². With r = 6, Area = π(6)² = 36π.',
      timeEstimate: 90
    },
    {
      moduleType: 'math',
      difficulty: 'hard',
      category: 'algebra',
      question: 'If f(x) = 2x² - 3x + 1, what is f(3)?',
      options: ['10', '12', '16', '18'],
      correctAnswer: 0,
      explanation: 'f(3) = 2(3)² - 3(3) + 1 = 2(9) - 9 + 1 = 18 - 9 + 1 = 10.',
      timeEstimate: 150
    }
  ]

  // Add more math questions
  for (let i = 4; i <= 22; i++) {
    mathModule1.push({
      moduleType: 'math',
      difficulty: ['easy', 'medium', 'hard'][(i - 1) % 3] as 'easy' | 'medium' | 'hard',
      category: ['algebra', 'geometry', 'statistics', 'advanced-math'][(i - 1) % 4],
      question: `Math question ${i} for Module 1`,
      options: [
        `${i + 1}`,
        `${i + 2}`,
        `${i + 3}`,
        `${i + 4}`
      ],
      correctAnswer: (i - 1) % 4,
      explanation: `Explanation for math question ${i}`,
      timeEstimate: 90 + ((i - 1) % 3) * 30
    })
  }

  // Create all questions
  const allQuestions = [...readingWritingModule1, ...mathModule1]
  
  console.log(`📝 Creating ${allQuestions.length} questions...`)
  
  for (const questionData of allQuestions) {
    await prisma.question.create({
      data: {
        ...questionData,
        options: questionData.options
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${allQuestions.length} questions`)
  console.log(`📚 Reading/Writing: ${readingWritingModule1.length} questions`)
  console.log(`🔢 Math: ${mathModule1.length} questions`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

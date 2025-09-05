#!/usr/bin/env tsx
// Script to view stored questions

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const MATH_FILE = join(process.cwd(), 'generated-math-questions.json')
const READING_FILE = join(process.cwd(), 'generated-reading-questions.json')

function loadQuestions(filePath: string, type: string) {
  if (!existsSync(filePath)) {
    console.log(`❌ No ${type} questions file found at: ${filePath}`)
    return []
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const questions = JSON.parse(content)
    console.log(`✅ Loaded ${questions.length} ${type} questions from: ${filePath}`)
    return questions
  } catch (error) {
    console.error(`❌ Error loading ${type} questions:`, error)
    return []
  }
}

function displayQuestion(question: any, index: number) {
  console.log(`\n${index + 1}. [${question.difficulty.toUpperCase()}] ${question.subtopic}`)
  console.log(`   ID: ${question.id}`)
  console.log(`   Generated: ${new Date(question.timestamp).toLocaleString()}`)
  console.log(`   Points: ${question.points} | Quality: ${(question.qualityScore * 100).toFixed(0)}%`)
  console.log(`   Category: ${question.category}`)
  
  if (question.passage) {
    console.log(`\n   📖 PASSAGE:`)
    console.log(`   ${question.passage}`)
  }
  
  if (question.chartDescription) {
    console.log(`\n   📊 CHART/GRAPH:`)
    console.log(`   ${question.chartDescription}`)
  }
  
  console.log(`\n   ❓ QUESTION:`)
  console.log(`   ${question.question}`)
  
  console.log(`\n   📝 OPTIONS:`)
  question.options.forEach((option: string, optIndex: number) => {
    const marker = optIndex === question.correctAnswer ? '✓' : ' '
    console.log(`   ${marker} ${option}`)
  })
  
  console.log(`\n   💡 EXPLANATION:`)
  console.log(`   ${question.explanation}`)
  
  console.log(`\n   🔍 EVALUATION:`)
  console.log(`   ${question.evaluationFeedback}`)
  
  console.log(`\n   ${'='.repeat(80)}`)
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  console.log('📚 DuckSAT Question Viewer')
  console.log('==========================')
  
  const mathQuestions = loadQuestions(MATH_FILE, 'math')
  const readingQuestions = loadQuestions(READING_FILE, 'reading')
  
  console.log(`\n📊 Summary:`)
  console.log(`   - Math questions: ${mathQuestions.length}`)
  console.log(`   - Reading questions: ${readingQuestions.length}`)
  console.log(`   - Total questions: ${mathQuestions.length + readingQuestions.length}`)
  
  if (command === 'math' || command === 'all') {
    if (mathQuestions.length > 0) {
      console.log('\n🔢 MATH QUESTIONS:')
      console.log('==================')
      mathQuestions.forEach((q: any, i: number) => displayQuestion(q, i))
    }
  }
  
  if (command === 'reading' || command === 'all') {
    if (readingQuestions.length > 0) {
      console.log('\n📖 READING QUESTIONS:')
      console.log('=====================')
      readingQuestions.forEach((q: any, i: number) => displayQuestion(q, i))
    }
  }
  
  if (!command || (command !== 'math' && command !== 'reading' && command !== 'all')) {
    console.log('\n💡 Usage:')
    console.log('   npm run view:questions math     - View math questions')
    console.log('   npm run view:questions reading  - View reading questions')
    console.log('   npm run view:questions all      - View all questions')
  }
}

main()

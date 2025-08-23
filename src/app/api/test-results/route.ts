import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Temporarily disabled for production build
    return NextResponse.json({ 
      success: true, 
      message: 'Database integration coming soon' 
    })
  } catch (error) {
    console.error('Error saving test result:', error)
    return NextResponse.json(
      { error: 'Failed to save test result' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Temporarily disabled for production build
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    )
  }
}

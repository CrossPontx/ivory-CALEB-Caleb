import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Determine Langflow URL based on environment
    // Note: Langflow seems to auto-increment port if 7861 is busy
    const langflowUrl = process.env.NODE_ENV === 'production'
      ? 'https://lashell-unfeverish-christoper.ngrok-free.dev'
      : 'http://localhost:7862'  // Changed from 7861 to 7862
    
    const flowId = '2f70d01a-9791-48b2-980a-03eca7244b46'
    
    console.log('Calling Langflow:', `${langflowUrl}/api/v1/run/${flowId}`)
    
    const response = await fetch(
      `${langflowUrl}/api/v1/run/${flowId}?stream=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_value: body.message,
          output_type: 'chat',
          input_type: 'chat',
        }),
      }
    )

    console.log('Langflow response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Langflow error:', errorText)
      throw new Error(`Langflow API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Langflow response:', JSON.stringify(data).substring(0, 200))
    
    // Extract the message from Langflow's response
    const message = data.outputs?.[0]?.outputs?.[0]?.results?.message?.text || 
                   'I apologize, but I encountered an error. Please try again.'

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from chatbot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

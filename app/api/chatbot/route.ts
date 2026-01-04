import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Determine Langflow URL based on environment
    // Use environment variable if set, otherwise use defaults
    const langflowUrl = process.env.LANGFLOW_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://lashell-unfeverish-christoper.ngrok-free.dev'
        : 'http://localhost:7862')
    
    const flowId = process.env.LANGFLOW_FLOW_ID || '2f70d01a-9791-48b2-980a-03eca7244b46'
    
    console.log('Calling Langflow:', `${langflowUrl}/api/v1/run/${flowId}`)
    console.log('Environment:', process.env.NODE_ENV)
    
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
        // Add timeout for production
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    )

    console.log('Langflow response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Langflow error:', errorText)
      throw new Error(`Langflow API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Langflow response:', JSON.stringify(data).substring(0, 200))
    
    // Extract the message from Langflow's response
    const message = data.outputs?.[0]?.outputs?.[0]?.results?.message?.text || 
                   'I apologize, but I encountered an error. Please try again.'

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chatbot API error:', error)
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to get response from chatbot'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The chatbot service may be unavailable.'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to chatbot service. Please try again later.'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const vannaUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';
    
    console.log(`Forwarding query to Vanna AI: ${vannaUrl}/query`);
    
    // Forward to Vanna AI
    const response = await fetch(`${vannaUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: query }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vanna API error: ${response.status} - ${errorText}`);
      throw new Error(`Vanna API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      question: data.question || query,
      sql: data.sql || '',
      results: data.results || [],
      text: data.text || 'Query executed',
      error: data.error || null,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - Vanna AI took too long to respond' },
          { status: 504 }
        );
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Cannot connect to Vanna AI. Make sure it is running on port 8000.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
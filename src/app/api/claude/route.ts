import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// This route requires Node.js runtime for secure API key handling
export const runtime = 'nodejs';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, max_tokens = 1000 } = body;

    // Validate request data
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate max_tokens
    if (max_tokens > 4000) {
      return NextResponse.json(
        { error: 'max_tokens cannot exceed 4000' },
        { status: 400 }
      );
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: max_tokens,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract content from response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Return successful response
    return NextResponse.json({
      content: content.text,
      usage: response.usage,
    });

  } catch (error: any) {
    console.error('Claude API Error:', error);

    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request to Claude API' },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
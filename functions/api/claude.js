// Working Cloudflare Function for Claude API calls
export async function onRequestPost({ request, env }) {
  try {
    // Check for API key
    if (!env.CLAUDE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse request body
    const body = await request.json();
    const { message, max_tokens = 1000 } = body;

    // Validate request data
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required and must be a string' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Call Claude API with retry logic for 503 errors
    let claudeResponse;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'User-Agent': 'WriteThinkAI/1.0',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: max_tokens,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      // If successful or not a 503 error, break out of retry loop
      if (claudeResponse.ok || claudeResponse.status !== 503) {
        break;
      }
      
      // If 503 error and we have retries left, wait and retry
      retries++;
      if (retries <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Wait 1s, then 2s
      }
    }

    // Handle Claude API errors
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      
      // Special handling for 503 service unavailable
      if (claudeResponse.status === 503) {
        return new Response(JSON.stringify({ 
          error: 'Claude API temporarily unavailable',
          status: claudeResponse.status,
          details: 'The AI service is temporarily overloaded. Please try again in a moment.',
          retryAfter: '10 seconds'
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': '10',
          },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Claude API request failed',
        status: claudeResponse.status,
        details: errorText
      }), {
        status: claudeResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse Claude response
    const claudeData = await claudeResponse.json();
    
    // Return the response in the format our app expects
    return new Response(JSON.stringify({
      content: claudeData.content[0].text,
      usage: claudeData.usage,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Function error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
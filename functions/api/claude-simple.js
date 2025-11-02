// Simplified Claude API function for debugging
export async function onRequestPost({ request, env }) {
  try {
    console.log('Starting Claude API request...');
    
    // Check for API key
    if (!env.CLAUDE_API_KEY) {
      console.log('No API key found');
      return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { message, max_tokens = 1000 } = body;

    // Make the Claude API call
    console.log('Making Claude API call...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: max_tokens,
        messages: [{ role: 'user', content: message }],
      }),
    });

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Claude API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Claude API failed',
        status: response.status,
        details: errorText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    console.log('Claude API success, data structure:', Object.keys(data));
    
    // Simple response
    return new Response(JSON.stringify({
      content: data.content[0].text,
      usage: data.usage,
      debug: 'success'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Function error:', error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: 'Function failed',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
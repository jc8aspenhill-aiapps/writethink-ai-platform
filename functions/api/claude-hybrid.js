// Hybrid AI function: Try Claude first, fallback to Cloudflare Workers AI
export async function onRequestPost({ request, env }) {
  try {
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

    // Try Claude first (if API key is available)
    if (env.CLAUDE_API_KEY) {
      try {
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          return new Response(JSON.stringify({
            content: claudeData.content[0].text,
            usage: claudeData.usage,
            model: 'claude-3-haiku'
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        
        // Claude failed, fall through to Cloudflare AI
        console.log('Claude failed, falling back to Cloudflare AI');
        
      } catch (claudeError) {
        console.log('Claude error, falling back to Cloudflare AI:', claudeError.message);
      }
    }

    // Fallback to Cloudflare Workers AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: 'You are a writing coach helping students develop critical thinking and argumentation skills. Guide their thinking through questions and prompts rather than providing direct answers. Be encouraging and focus on helping them discover insights themselves.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: Math.min(max_tokens, 2048),
      temperature: 0.7
    });

    return new Response(JSON.stringify({
      content: aiResponse.response,
      usage: {
        input_tokens: message.length / 4,
        output_tokens: aiResponse.response.length / 4,
        service_tier: 'cloudflare-ai-fallback'
      },
      model: 'llama-3.1-8b-instruct'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ 
      error: 'AI processing failed',
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
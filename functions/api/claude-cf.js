// Cloudflare Workers AI version using Llama 3.1
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

    // Call Cloudflare Workers AI
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
      max_tokens: Math.min(max_tokens, 2048), // Cloudflare AI limit
      temperature: 0.7
    });

    // Return response in the same format as Claude
    return new Response(JSON.stringify({
      content: aiResponse.response,
      usage: {
        input_tokens: message.length / 4, // Rough estimate
        output_tokens: aiResponse.response.length / 4,
        service_tier: 'cloudflare-ai'
      },
      model: 'llama-3.1-8b-instruct'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Cloudflare AI Error:', error);
    return new Response(JSON.stringify({ 
      error: 'AI processing failed',
      details: error.message,
      model: 'cloudflare-ai'
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
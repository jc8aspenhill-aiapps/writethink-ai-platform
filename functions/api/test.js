// Simple test function to verify Cloudflare Functions are working
export async function onRequestPost({ request, env }) {
  return new Response(JSON.stringify({
    status: 'success',
    message: 'Cloudflare Function is working!',
    hasApiKey: !!env.CLAUDE_API_KEY,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestGet({ request, env }) {
  return new Response(JSON.stringify({
    status: 'success',
    message: 'Cloudflare Function is working!',
    hasApiKey: !!env.CLAUDE_API_KEY,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
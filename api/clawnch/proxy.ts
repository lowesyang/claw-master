// Proxy for all Clawnch API endpoints
export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || ''
  const targetUrl = `https://clawn.ch${path}`

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Forward headers (except host)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  const authHeader = request.headers.get('Authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  let body: string | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text()
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  })

  const data = await response.text()
  
  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
}

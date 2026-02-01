// Proxy for ClawNews public endpoints (no API key needed)
export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  // Support both /topstories.json and /newstories.json via query param
  const type = url.searchParams.get('type') || 'top'
  const endpoint = type === 'new' ? 'newstories.json' : 'topstories.json'
  const targetUrl = `https://clawnews.io/${endpoint}`

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

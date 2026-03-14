import { ExportData } from '@/types'

const GIST_FILENAME = 'smart-goals-data.json'
const API_BASE = 'https://api.github.com'

interface GistFile {
  filename: string
  content: string
}

interface GistResponse {
  id: string
  files: Record<string, GistFile>
  updated_at: string
  description: string
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error('Invalid GitHub token. Check your token and try again.')
  if (res.status === 404) throw new Error('Gist not found. It may have been deleted. Try pushing again.')
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API error (${res.status}): ${body || res.statusText}`)
  }
  return res.json()
}

export async function createGist(token: string, data: ExportData): Promise<string> {
  const res = await fetch(`${API_BASE}/gists`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      description: `SMART Goals — ${data.profile.name}`,
      public: false,
      files: {
        [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) },
      },
    }),
  })
  const gist = await handleResponse<GistResponse>(res)
  return gist.id
}

export async function updateGist(token: string, gistId: string, data: ExportData): Promise<void> {
  const res = await fetch(`${API_BASE}/gists/${gistId}`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({
      description: `SMART Goals — ${data.profile.name}`,
      files: {
        [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) },
      },
    }),
  })
  await handleResponse<GistResponse>(res)
}

export async function fetchGist(token: string, gistId: string): Promise<{ data: ExportData; updatedAt: string }> {
  const res = await fetch(`${API_BASE}/gists/${gistId}`, {
    method: 'GET',
    headers: headers(token),
  })
  const gist = await handleResponse<GistResponse>(res)

  const file = gist.files[GIST_FILENAME]
  if (!file) throw new Error(`File "${GIST_FILENAME}" not found in Gist.`)

  const data = JSON.parse(file.content) as ExportData
  if (!data.version || !data.profile) throw new Error('Invalid data format in Gist.')

  return { data, updatedAt: gist.updated_at }
}

export async function validateToken(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/user`, { headers: headers(token) })
  if (!res.ok) throw new Error('Invalid token')
  const user = await res.json()
  return user.login as string
}

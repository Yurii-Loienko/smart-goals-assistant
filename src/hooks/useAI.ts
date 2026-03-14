import { useState } from 'react'

export type AIProvider = 'ollama' | 'anthropic' | 'openai' | 'google' | 'xai' | 'deepseek' | 'groq' | 'openrouter' | 'cloudflare'

export interface AIProviderConfig {
  id: AIProvider
  name: string
  description: string
  models: { id: string; label: string }[]
  keyPlaceholder: string
  docsUrl: string
  noKeyRequired?: boolean
  baseUrlConfigurable?: boolean
  defaultBaseUrl?: string
  freeTier?: string
  accountIdRequired?: boolean
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Free, local AI. No internet or API key needed.',
    models: [
      { id: 'llama3.1', label: 'Llama 3.1' },
      { id: 'llama3.2', label: 'Llama 3.2' },
      { id: 'mistral', label: 'Mistral' },
      { id: 'gemma2', label: 'Gemma 2' },
      { id: 'qwen2.5', label: 'Qwen 2.5' },
      { id: 'codellama', label: 'Code Llama' },
      { id: 'phi3', label: 'Phi-3' },
    ],
    keyPlaceholder: '',
    docsUrl: 'https://ollama.com/download',
    noKeyRequired: true,
    baseUrlConfigurable: true,
    defaultBaseUrl: 'http://localhost:11434',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'High-quality reasoning models at very low cost.',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek V3' },
      { id: 'deepseek-reasoner', label: 'DeepSeek R1' },
    ],
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    description: 'Grok models by xAI with real-time knowledge.',
    models: [
      { id: 'grok-3', label: 'Grok 3' },
      { id: 'grok-3-mini', label: 'Grok 3 Mini' },
      { id: 'grok-2', label: 'Grok 2' },
    ],
    keyPlaceholder: 'xai-...',
    docsUrl: 'https://console.x.ai',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o and other OpenAI models.',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models with strong reasoning and coding.',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
    keyPlaceholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini models with multimodal capabilities.',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/apikey',
    freeTier: '15 req/min, 1500 req/day',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference on custom LPU chips. Generous free tier.',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    freeTier: 'Generous free tier, thousands req/day',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Aggregator with many models. Some are completely free (:free).',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (free)' },
      { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (free)' },
      { id: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B (free)' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', label: 'Qwen 2.5 72B (free)' },
    ],
    keyPlaceholder: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys',
    freeTier: 'Models with :free tag are free',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare AI',
    description: 'Workers AI with free tier. Needs Account ID.',
    models: [
      { id: '@cf/meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
      { id: '@cf/mistral/mistral-7b-instruct-v0.2-lora', label: 'Mistral 7B' },
      { id: '@cf/google/gemma-7b-it-lora', label: 'Gemma 7B' },
    ],
    keyPlaceholder: 'Bearer token...',
    docsUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    freeTier: '10,000 neurons/day',
    accountIdRequired: true,
  },
]

const STORAGE_KEY = 'smart-goals-ai-settings'

export interface AISettings {
  provider: AIProvider
  model: string
  customModel?: string
  apiKey: string
  ollamaUrl?: string
  accountId?: string
}

function getDefaultSettings(): AISettings {
  return { provider: 'ollama', model: 'llama3.1', apiKey: '', ollamaUrl: 'http://localhost:11434' }
}

export function getEffectiveModel(settings: AISettings): string {
  return settings.customModel?.trim() || settings.model
}

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AISettings>
      const defaults = getDefaultSettings()
      return {
        provider: parsed.provider || defaults.provider,
        model: parsed.model || defaults.model,
        customModel: parsed.customModel || '',
        apiKey: parsed.apiKey || defaults.apiKey,
        ollamaUrl: parsed.ollamaUrl || defaults.ollamaUrl,
        accountId: parsed.accountId || '',
      }
    }
  } catch { /* ignore */ }
  return getDefaultSettings()
}

export function saveAISettings(settings: AISettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function hasApiKey(): boolean {
  const settings = loadAISettings()
  const cfg = getProviderConfig(settings.provider)
  if (cfg.noKeyRequired) return true
  return Boolean(settings.apiKey)
}

export function getProviderConfig(id: AIProvider): AIProviderConfig {
  return AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0]
}

function extractJSON(raw: string): string {
  let text = raw
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  if (text.startsWith('{') || text.startsWith('[')) return text

  const openBrace = text.indexOf('{')
  const openBracket = text.indexOf('[')
  let start = -1
  let closeChar = ''

  if (openBrace === -1 && openBracket === -1) return text
  if (openBrace === -1) { start = openBracket; closeChar = ']' }
  else if (openBracket === -1) { start = openBrace; closeChar = '}' }
  else { start = Math.min(openBrace, openBracket); closeChar = start === openBrace ? '}' : ']' }

  const end = text.lastIndexOf(closeChar)
  return end > start ? text.substring(start, end + 1) : text
}

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(extractJSON(text)) as T
  } catch {
    const firstBrace = text.indexOf('{')
    const firstBracket = text.indexOf('[')
    let start = -1
    let closeChar = ''

    if (firstBrace === -1 && firstBracket === -1) return null
    if (firstBrace === -1) { start = firstBracket; closeChar = ']' }
    else if (firstBracket === -1) { start = firstBrace; closeChar = '}' }
    else { start = Math.min(firstBrace, firstBracket); closeChar = start === firstBrace ? '}' : ']' }

    const end = text.lastIndexOf(closeChar)
    if (end <= start) return null
    try { return JSON.parse(text.substring(start, end + 1)) as T } catch { return null }
  }
}

async function callOllama(baseUrl: string, model: string, prompt: string): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || `Ollama error: ${res.status}. Is Ollama running?`)
  return data.message?.content || ''
}

async function callAnthropic(apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `API error: ${res.status}`)
  return data.content[0].text
}

async function callOpenAICompatible(baseUrl: string, apiKey: string, model: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `API error: ${res.status}`)
  return data.choices[0].message.content
}

async function callGoogle(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `API error: ${res.status}`)
  return data.candidates[0].content.parts[0].text
}

async function callCloudflare(accountId: string, apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || `Cloudflare AI error: ${res.status}`)
  return data.result?.response || ''
}

async function callProvider(settings: AISettings, prompt: string, maxTokens: number): Promise<string> {
  const model = getEffectiveModel(settings)
  switch (settings.provider) {
    case 'ollama':
      return callOllama(settings.ollamaUrl || 'http://localhost:11434', model, prompt)
    case 'anthropic':
      return callAnthropic(settings.apiKey, model, prompt, maxTokens)
    case 'openai':
      return callOpenAICompatible('https://api.openai.com/v1', settings.apiKey, model, prompt, maxTokens)
    case 'deepseek':
      return callOpenAICompatible('https://api.deepseek.com', settings.apiKey, model, prompt, maxTokens)
    case 'xai':
      return callOpenAICompatible('https://api.x.ai/v1', settings.apiKey, model, prompt, maxTokens)
    case 'google':
      return callGoogle(settings.apiKey, model, prompt)
    case 'groq':
      return callOpenAICompatible('https://api.groq.com/openai/v1', settings.apiKey, model, prompt, maxTokens)
    case 'openrouter':
      return callOpenAICompatible('https://openrouter.ai/api/v1', settings.apiKey, model, prompt, maxTokens)
    case 'cloudflare':
      return callCloudflare(settings.accountId || '', settings.apiKey, model, prompt)
  }
}

export const useAI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async <T,>(prompt: string): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const settings = loadAISettings()
      const cfg = getProviderConfig(settings.provider)
      if (!cfg.noKeyRequired && !settings.apiKey) {
        setError('API key not configured. Go to AI Settings tab.')
        return null
      }
      const rawText = await callProvider(settings, prompt, 4096)
      const result = safeParseJSON<T>(rawText)
      if (result == null) { setError('Failed to parse AI response. Try regenerating.'); return null }
      if (Array.isArray(result) && result.length === 0) { setError('AI returned an unexpected format. Try again.'); return null }
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI request failed'
      console.error('AI error:', err)
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  const chat = async (prompt: string): Promise<string> => {
    setLoading(true)
    try {
      const settings = loadAISettings()
      const cfg = getProviderConfig(settings.provider)
      if (!cfg.noKeyRequired && !settings.apiKey) return 'API key not configured. Go to AI Settings tab.'
      return (await callProvider(settings, prompt, 1024)).trim()
    } catch (err) {
      console.error('Chat error:', err)
      return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
    } finally {
      setLoading(false)
    }
  }

  return { generate, chat, loading, error }
}

export { useAI as useClaudeAPI }

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AI_PROVIDERS,
  AIProvider,
  loadAISettings,
  saveAISettings,
  getProviderConfig,
  useAI,
} from '@/hooks/useAI'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Server,
  Globe,
  Cpu,
  Sparkles,
  Brain,
  Zap,
  CircleDot,
  Cloud,
  Network,
  Layers,
  Pencil,
  Send,
  Loader2,
  MessageSquare,
} from 'lucide-react'

const providerIcons: Record<AIProvider, React.ReactNode> = {
  ollama: <Server className="h-5 w-5" />,
  deepseek: <Brain className="h-5 w-5" />,
  xai: <Zap className="h-5 w-5" />,
  openai: <Sparkles className="h-5 w-5" />,
  anthropic: <Cpu className="h-5 w-5" />,
  google: <Globe className="h-5 w-5" />,
  groq: <Layers className="h-5 w-5" />,
  openrouter: <Network className="h-5 w-5" />,
  cloudflare: <Cloud className="h-5 w-5" />,
}

export function AISettings() {
  const navigate = useNavigate()
  const initial = loadAISettings()

  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(initial.provider)
  const [selectedModel, setSelectedModel] = useState(initial.model)
  const [customModel, setCustomModel] = useState(initial.customModel || '')
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [ollamaUrl, setOllamaUrl] = useState(initial.ollamaUrl || 'http://localhost:11434')
  const [accountId, setAccountId] = useState(initial.accountId || '')
  const [saved, setSaved] = useState(true)
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testError, setTestError] = useState('')

  const currentConfig = getProviderConfig(selectedProvider)

  const handleSelectProvider = (id: AIProvider) => {
    setSelectedProvider(id)
    const cfg = getProviderConfig(id)
    setSelectedModel(cfg.models[0].id)
    setCustomModel('')
    const existing = loadAISettings()
    if (existing.provider === id) {
      setApiKey(existing.apiKey)
      setOllamaUrl(existing.ollamaUrl || 'http://localhost:11434')
      setAccountId(existing.accountId || '')
      setCustomModel(existing.customModel || '')
    } else {
      setApiKey('')
      setAccountId('')
    }
    setSaved(false)
    setTestResult('idle')
  }

  const handleSave = () => {
    saveAISettings({
      provider: selectedProvider,
      model: selectedModel,
      customModel: customModel.trim(),
      apiKey: apiKey.trim(),
      ollamaUrl: ollamaUrl.trim() || 'http://localhost:11434',
      accountId: accountId.trim(),
    })
    setSaved(true)
    const modelName = customModel.trim() || selectedModel
    toast.success(`Saved: ${currentConfig.name} / ${modelName}`)
  }

  const canSave = currentConfig.noKeyRequired || apiKey.trim().length > 0

  const handleTest = async () => {
    setTestResult('testing')
    setTestError('')
    try {
      const baseUrl = (ollamaUrl || 'http://localhost:11434').replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/api/tags`)
      if (!res.ok) throw new Error(`Ollama responded with ${res.status}`)
      const data = await res.json()
      const models = (data.models || []) as { name: string }[]
      const installed = models.map((m) => m.name.split(':')[0])
      const targetModel = customModel.trim() || selectedModel
      const hasModel = installed.some((name) => name === targetModel)
      setTestResult('success')
      if (hasModel) {
        toast.success(`Connected! Model "${targetModel}" is available.`)
      } else {
        toast.success(`Connected! ${installed.length} models found. Run "ollama pull ${targetModel}" to add it.`)
      }
    } catch (err) {
      setTestResult('error')
      const msg = err instanceof Error ? err.message : 'Connection failed'
      setTestError(`Cannot reach Ollama at ${ollamaUrl}. Is it running? (${msg})`)
    }
  }

  const effectiveModel = customModel.trim() || selectedModel

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
          <div className="flex-1" />
          <h1 className="text-lg font-semibold">AI Settings</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {AI_PROVIDERS.map((p) => {
            const isActive = selectedProvider === p.id
            return (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:ring-1 hover:ring-muted-foreground/20'
                }`}
                onClick={() => handleSelectProvider(p.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {providerIcons[p.id]}
                    </div>
                    {isActive && (
                      <CircleDot className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <h3 className="font-medium text-sm mt-2">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.noKeyRequired && (
                      <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                        FREE / LOCAL
                      </span>
                    )}
                    {p.freeTier && (
                      <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">
                        FREE TIER
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {providerIcons[selectedProvider]}
              {currentConfig.name} Configuration
            </CardTitle>
            {currentConfig.freeTier && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Free tier: {currentConfig.freeTier}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {currentConfig.models.map((m) => (
                  <Button
                    key={m.id}
                    variant={selectedModel === m.id && !customModel.trim() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSelectedModel(m.id); setCustomModel(''); setSaved(false) }}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={customModel}
                  onChange={(e) => { setCustomModel(e.target.value); setSaved(false) }}
                  placeholder="Or type any model name manually..."
                  className="font-mono text-xs"
                />
              </div>
              {customModel.trim() && (
                <p className="text-xs text-muted-foreground mt-1">
                  Using custom model: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{customModel.trim()}</code>
                </p>
              )}
              {!customModel.trim() && (
                <p className="text-xs text-muted-foreground mt-1">
                  Active: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{selectedModel}</code>
                </p>
              )}
              {selectedProvider === 'ollama' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pull model first: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">ollama pull {effectiveModel}</code>
                </p>
              )}
            </div>

            {selectedProvider === 'ollama' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Server URL</label>
                <Input
                  value={ollamaUrl}
                  onChange={(e) => { setOllamaUrl(e.target.value); setSaved(false) }}
                  placeholder="http://localhost:11434"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="underline">
                    Download Ollama
                  </a>
                  {' '}and run it locally. No API key, no cost, fully offline.
                </p>
              </div>
            )}

            {currentConfig.accountIdRequired && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Account ID</label>
                <Input
                  value={accountId}
                  onChange={(e) => { setAccountId(e.target.value); setSaved(false) }}
                  placeholder="Cloudflare Account ID"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Find it in your{' '}
                  <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Cloudflare Dashboard
                  </a>
                  {' '}→ Workers & Pages → Overview (right sidebar).
                </p>
              </div>
            )}

            {!currentConfig.noKeyRequired && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">API Key</label>
                <Input
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setSaved(false) }}
                  placeholder={currentConfig.keyPlaceholder}
                  type="password"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href={currentConfig.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Get API key from {currentConfig.name}
                  </a>
                  <span className="mx-1">·</span>
                  Stored locally in your browser only.
                </p>
              </div>
            )}

            {testResult === 'error' && testError && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                {testError}
              </div>
            )}
            {testResult === 'success' && (
              <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg p-3 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" /> Connected successfully
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!canSave || saved}
                onClick={handleSave}
              >
                {saved ? <><Check className="h-4 w-4 mr-2" /> Saved</> : 'Save Settings'}
              </Button>
              {selectedProvider === 'ollama' && (
                <Button
                  variant="outline"
                  disabled={testResult === 'testing'}
                  onClick={handleTest}
                >
                  {testResult === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <TestChat saved={saved} onSaveFirst={handleSave} canSave={canSave} />

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>All API keys are stored locally in your browser and never sent anywhere except the provider's API.</p>
          <p>For free options: <strong>Ollama</strong> (local), <strong>Google Gemini</strong> (15 req/min), <strong>Groq</strong> (fast), <strong>OpenRouter</strong> (:free models).</p>
        </div>
      </div>
    </div>
  )
}

function TestChat({ saved, onSaveFirst, canSave }: { saved: boolean; onSaveFirst: () => void; canSave: boolean }) {
  const { chat, loading } = useAI()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    if (!saved && canSave) onSaveFirst()

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')

    const response = await chat(text)
    setMessages((prev) => [...prev, { role: 'assistant', text: response }])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const settings = loadAISettings()
  const cfg = getProviderConfig(settings.provider)
  const activeModel = settings.customModel?.trim() || settings.model

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Test Chat
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Verify your connection works. Using <strong>{cfg.name}</strong> / <code className="bg-muted px-1 py-0.5 rounded text-[11px]">{activeModel}</code>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length > 0 && (
          <div ref={scrollRef} className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type "Hello" to test your connection...'
            rows={1}
            className="resize-none text-sm"
          />
          <Button
            size="icon"
            className="shrink-0 self-end"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {!saved && canSave && (
          <p className="text-xs text-amber-600 dark:text-amber-400">Settings not saved yet — they will be saved automatically when you send a message.</p>
        )}
      </CardContent>
    </Card>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { useClaudeAPI } from '@/hooks/useClaudeAPI'
import { AI_PROVIDERS, AIProvider, loadAISettings, saveAISettings, getProviderConfig, getEffectiveModel } from '@/hooks/useAI'
import { buildChatSidebarPrompt } from '@/lib/prompts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChatMessage, ChatMode, Goal, UserProfile } from '@/types'
import { generateId } from '@/lib/utils'
import { X, Send, Loader2, Sparkles, Wrench, MessageCircle, Trash2, ChevronDown, Settings } from 'lucide-react'

interface ChatSidebarProps {
  open: boolean
  onClose: () => void
  profile: UserProfile | null
  currentGoal?: Goal | null
  mode?: ChatMode
}

const modeConfig: Record<ChatMode, { label: string; icon: React.ReactNode; systemHint: string }> = {
  generate: {
    label: 'Generate Ideas',
    icon: <Sparkles className="h-4 w-4" />,
    systemHint: 'Help brainstorm new performance targets.',
  },
  improve: {
    label: 'Improve Goal',
    icon: <Wrench className="h-4 w-4" />,
    systemHint: 'Help improve the selected goal with better metrics, milestones, and wording.',
  },
  general: {
    label: 'Chat',
    icon: <MessageCircle className="h-4 w-4" />,
    systemHint: 'Answer questions about performance targets and career development.',
  },
}

const ALL_MODES: ChatMode[] = ['generate', 'improve', 'general']

function buildStorageKey(goalId: string | undefined, chatMode: ChatMode): string | null {
  if (!goalId) return null
  return `smart-goals-chat-${goalId}-${chatMode}`
}

function loadMessages(key: string | null): ChatMessage[] {
  if (!key) return []
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored) as ChatMessage[]
  } catch { /* ignore */ }
  return []
}

function saveMessages(key: string | null, msgs: ChatMessage[]) {
  if (!key) return
  if (msgs.length > 0) {
    localStorage.setItem(key, JSON.stringify(msgs))
  } else {
    localStorage.removeItem(key)
  }
}

type MessagesPerMode = Record<ChatMode, ChatMessage[]>

function buildGreeting(chatMode: ChatMode, goal?: Goal | null): ChatMessage {
  let content: string
  switch (chatMode) {
    case 'generate':
      content = goal
        ? `Let's brainstorm ideas to expand "${goal.targetName}". What areas would you like to explore?`
        : 'Let me help you brainstorm new performance targets. What areas interest you?'
      break
    case 'improve':
      content = goal
        ? `I can help you improve "${goal.targetName}". What would you like to change or refine?`
        : 'I can help improve your goals. Select a goal and come back here!'
      break
    case 'general':
      content = goal
        ? `Ask me anything about "${goal.targetName}" or career development in general.`
        : 'How can I help with your performance targets?'
      break
  }
  return { id: generateId(), role: 'assistant', content, timestamp: new Date().toISOString() }
}

export function ChatSidebar({ open, onClose, profile, currentGoal, mode = 'general' }: ChatSidebarProps) {
  const { chat, loading } = useClaudeAPI()

  const [currentMode, setCurrentMode] = useState<ChatMode>(mode)
  const [messagesMap, setMessagesMap] = useState<MessagesPerMode>(() => {
    const map = {} as MessagesPerMode
    for (const m of ALL_MODES) {
      map[m] = loadMessages(buildStorageKey(currentGoal?.id, m))
    }
    return map
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = messagesMap[currentMode]

  const setModeMessages = useCallback((chatMode: ChatMode, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessagesMap((prev) => ({ ...prev, [chatMode]: updater(prev[chatMode]) }))
  }, [])

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode])

  useEffect(() => {
    const map = {} as MessagesPerMode
    for (const m of ALL_MODES) {
      map[m] = loadMessages(buildStorageKey(currentGoal?.id, m))
    }
    setMessagesMap(map)
  }, [currentGoal?.id])

  useEffect(() => {
    const key = buildStorageKey(currentGoal?.id, currentMode)
    saveMessages(key, messagesMap[currentMode])
  }, [messagesMap, currentMode, currentGoal?.id])

  useEffect(() => {
    if (open && messages.length === 0) {
      setModeMessages(currentMode, () => [buildGreeting(currentMode, currentGoal)])
    }
  }, [open, currentMode, messages.length, currentGoal, setModeMessages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!open) return null

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    const activeMode = currentMode
    setModeMessages(activeMode, (prev) => [...prev, userMsg])
    setInput('')

    const prompt = buildChatSidebarPrompt({
      mode: activeMode,
      userMessage: text,
      profile,
      currentGoal,
      history: messages.slice(-6),
    })

    const response = await chat(prompt)
    setModeMessages(activeMode, (prev) => [...prev, {
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    }])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearCurrentTab = () => {
    const key = buildStorageKey(currentGoal?.id, currentMode)
    if (key) localStorage.removeItem(key)
    setModeMessages(currentMode, () => [])
  }

  const config = modeConfig[currentMode]

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            title="Clear this tab"
            onClick={clearCurrentTab}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 p-2 border-b">
        {ALL_MODES.map((m) => (
          <Button
            key={m}
            variant={m === currentMode ? 'secondary' : 'ghost'}
            size="sm"
            className="text-xs flex-1"
            onClick={() => setCurrentMode(m)}
          >
            {modeConfig[m].label}
            {messagesMap[m].length > 1 && (
              <span className="ml-1 text-[10px] opacity-60">({messagesMap[m].length - 1})</span>
            )}
          </Button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-3 space-y-2">
        <LLMQuickSelector />
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your targets..."
            rows={2}
            className="resize-none text-sm"
          />
          <Button
            size="icon"
            className="shrink-0 self-end"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function LLMQuickSelector() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(loadAISettings)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const cfg = getProviderConfig(settings.provider)
  const activeModel = getEffectiveModel(settings)
  const shortModel = activeModel.length > 25 ? activeModel.slice(0, 25) + '...' : activeModel

  const handleSelect = (providerId: AIProvider, modelId: string) => {
    const updated = { ...settings, provider: providerId, model: modelId, customModel: '' }
    saveAISettings(updated)
    setSettings(updated)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Settings className="h-3 w-3" />
        <span className="truncate">{cfg.name} / {shortModel}</span>
        <ChevronDown className={`h-3 w-3 ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-lg shadow-xl max-h-72 overflow-y-auto z-50">
          {AI_PROVIDERS.map((provider) => {
            const isActive = settings.provider === provider.id
            return (
              <div key={provider.id}>
                <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                  isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground'
                } sticky top-0 bg-popover border-b`}>
                  {provider.name}
                  {provider.freeTier && <span className="ml-1 font-normal normal-case text-blue-500">free</span>}
                  {provider.noKeyRequired && <span className="ml-1 font-normal normal-case text-green-500">local</span>}
                </div>
                {provider.models.map((model) => {
                  const isCurrentModel = isActive && settings.model === model.id && !settings.customModel?.trim()
                  return (
                    <button
                      key={model.id}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center justify-between ${
                        isCurrentModel ? 'bg-muted font-medium' : ''
                      }`}
                      onClick={() => handleSelect(provider.id, model.id)}
                    >
                      <span>{model.label}</span>
                      {isCurrentModel && <span className="text-primary text-[10px]">active</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

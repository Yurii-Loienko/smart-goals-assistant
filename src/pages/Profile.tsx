import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/hooks/useUserStore'
import { useGistSync } from '@/hooks/useGistSync'
import { useDebouncedCallback } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportData } from '@/types'
import { ArrowLeft, Download, Upload, Save, Check, Cloud, CloudOff, Loader2, ExternalLink, Bot } from 'lucide-react'

export function Profile() {
  const navigate = useNavigate()
  const { profile, saveProfile, exportUserData, importUserData } = useUserStore()
  const gist = useGistSync()

  const [ghToken, setGhToken] = useState('')
  const [gistIdInput, setGistIdInput] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [stack, setStack] = useState('')
  const [currentProjects, setCurrentProjects] = useState('')
  const [learningGoals, setLearningGoals] = useState('')
  const [teamGoals, setTeamGoals] = useState('')
  const [unsaved, setUnsaved] = useState(false)
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const didMount = useRef(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setEmail(profile.email)
      setRole(profile.role)
      setCompany(profile.company)
      setStack(profile.stack.join(', '))
      setCurrentProjects(profile.currentProjects)
      setLearningGoals(profile.learningGoals)
      setTeamGoals(profile.teamGoals)
    }
  }, [profile])

  const performSave = useCallback(() => {
    if (!profile || !name.trim()) return
    saveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      company: company.trim(),
      stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
      currentProjects: currentProjects.trim(),
      learningGoals: learningGoals.trim(),
      teamGoals: teamGoals.trim(),
      updatedAt: new Date().toISOString(),
    })
    setUnsaved(false)
    setLastSaved(Date.now())
  }, [profile, name, email, role, company, stack, currentProjects, learningGoals, teamGoals, saveProfile])

  const debouncedSave = useDebouncedCallback(() => {
    performSave()
  }, 1500)

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    if (!profile || !name.trim()) return
    setUnsaved(true)
    debouncedSave()
  }, [name, email, role, company, stack, currentProjects, learningGoals, teamGoals])

  useEffect(() => {
    if (lastSaved === null) return
    const timer = setTimeout(() => setLastSaved(null), 3000)
    return () => clearTimeout(timer)
  }, [lastSaved])

  if (!profile) {
    return <Navigate to="/" replace />
  }

  const handleSave = () => {
    performSave()
    toast.success('Profile saved')
  }

  const handleExport = () => {
    const data = exportUserData()
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-goals-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text) as ExportData
        if (data.version !== 1 || !data.profile) {
          toast.error('Invalid file format.')
          return
        }
        importUserData(data)
        toast.success('Data imported successfully!')
        navigate('/dashboard')
      } catch {
        toast.error('Failed to import data.')
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Senior Backend Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your Company"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tech Stack</label>
              <Input
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="Java, Spring Boot, Kafka, Kubernetes, AWS"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Projects</label>
              <Textarea
                value={currentProjects}
                onChange={(e) => setCurrentProjects(e.target.value)}
                placeholder="Main projects you're working on this year"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Learning Goals</label>
              <Textarea
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                placeholder="Technologies and skills you want to learn"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Team / Organizational Goals</label>
              <Textarea
                value={teamGoals}
                onChange={(e) => setTeamGoals(e.target.value)}
                placeholder="Knowledge sharing, documentation, mentoring..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Button onClick={handleSave} className="w-full" disabled={unsaved && !name.trim()}>
                {lastSaved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Profile
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {unsaved ? 'Saving...' : lastSaved ? 'Auto-saved ✓' : 'Auto-saves after changes'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AI Settings</span>
              <span className="text-xs text-muted-foreground">— choose your LLM provider and model</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/ai-settings')}>
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" /> Export All Data
            </Button>
            <Button variant="outline" onClick={handleImport} className="flex-1">
              <Upload className="h-4 w-4 mr-2" /> Import Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {gist.isConfigured ? (
                  <Cloud className="h-4 w-4 text-green-600" />
                ) : (
                  <CloudOff className="h-4 w-4 text-muted-foreground" />
                )}
                Cloud Sync (GitHub Gist)
              </CardTitle>
              {gist.isConfigured && (
                <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => {
                  gist.clearToken()
                  toast.success('GitHub token removed')
                }}>
                  Disconnect
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {gist.isConfigured ? (
              <>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={gist.loading}
                    onClick={async () => {
                      try {
                        await gist.push()
                        toast.success('Data pushed to GitHub Gist')
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Push failed')
                      }
                    }}
                  >
                    {gist.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Push to Cloud
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={gist.loading || !gist.gistId}
                    onClick={async () => {
                      try {
                        await gist.pull()
                        toast.success('Data pulled from GitHub Gist')
                        navigate('/dashboard')
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Pull failed')
                      }
                    }}
                  >
                    {gist.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Pull from Cloud
                  </Button>
                </div>
                {gist.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(gist.lastSync).toLocaleString()}
                  </p>
                )}
                {gist.gistId && (
                  <a
                    href={`https://gist.github.com/${gist.gistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> View Gist
                  </a>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Gist ID (for pulling on another browser)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={gistIdInput}
                      onChange={(e) => setGistIdInput(e.target.value)}
                      placeholder={gist.gistId || 'Paste Gist ID to pull from...'}
                      className="text-xs h-8"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!gistIdInput.trim()}
                      onClick={() => {
                        gist.setGistId(gistIdInput.trim())
                        setGistIdInput('')
                        toast.success('Gist ID saved — now click Pull')
                      }}
                    >
                      Set
                    </Button>
                  </div>
                </div>
                {gist.error && <p className="text-xs text-destructive">{gist.error}</p>}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Sync your goals across browsers via a private GitHub Gist.
                  Create a <a
                    href="https://github.com/settings/tokens/new?scopes=gist&description=SMART+Goals+Assistant"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >Personal Access Token</a> with the <code className="text-xs bg-muted px-1 py-0.5 rounded">gist</code> scope.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    type="password"
                    className="font-mono text-xs"
                  />
                  <Button
                    disabled={!ghToken.trim() || gist.loading}
                    onClick={async () => {
                      try {
                        const login = await gist.saveToken(ghToken.trim())
                        setGhToken('')
                        toast.success(`Connected as ${login}`)
                      } catch {
                        toast.error('Invalid token')
                      }
                    }}
                  >
                    {gist.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
                  </Button>
                </div>
                {gist.error && <p className="text-xs text-destructive">{gist.error}</p>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

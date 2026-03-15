import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/hooks/useUserStore'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportData } from '@/types'
import { Plus, Upload, User, Trash2, Target, Moon, Sun } from 'lucide-react'

export function Landing() {
  const navigate = useNavigate()
  const { allUsers, setCurrentUserId, createUser, deleteUser, importUserData } = useUserStore()
  const { theme, toggleTheme } = useTheme()
  const [showCreate, setShowCreate] = useState(allUsers.length === 0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleCreate = () => {
    if (!name.trim()) return
    createUser({
      name: name.trim(),
      email: email.trim(),
      role: '',
      company: '',
      stack: [],
      currentProjects: '',
      learningGoals: '',
      teamGoals: '',
    })
    toast.success('Profile created!')
    navigate('/profile')
  }

  const handleSelect = (userId: string) => {
    setCurrentUserId(userId)
    navigate('/dashboard')
  }

  const handleDelete = (e: React.MouseEvent, userId: string, userName: string) => {
    e.stopPropagation()
    toast(`Delete "${userName}" and all goals?`, {
      action: {
        label: 'Delete',
        onClick: () => {
          deleteUser(userId)
          toast.success('Profile deleted')
        },
      },
    })
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
        toast.error('Failed to import data. Check the file format.')
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-5">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">SMART Goals</h1>
          <p className="text-muted-foreground mt-3 text-base max-w-sm mx-auto">
            Create and track your performance targets — simple, clear, and ready for Workday.
          </p>
        </div>

        {allUsers.length > 0 && !showCreate && (
          <div className="space-y-3 mb-6">
            {allUsers.map((user) => (
              <Card
                key={user.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect(user.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.role ? `${user.role}${user.company ? ` at ${user.company}` : ''}` : user.email || 'No role set'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, user.id, user.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showCreate ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={!name.trim()} className="flex-1">
                  Create & Set Up Profile
                </Button>
                {allUsers.length > 0 && (
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setShowCreate(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" /> New Profile
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

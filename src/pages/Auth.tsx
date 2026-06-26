import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const errMsg = isSignUp ? await signUp(email, password) : await signIn(email, password)
    setLoading(false)
    if (errMsg) {
      setError(errMsg)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create account' : 'Sign in'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create an account to save your maps' : 'Sign in to access your maps'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignUp ? (
              <>Already have an account?{' '}<button className="underline" onClick={() => setIsSignUp(false)}>Sign in</button></>
            ) : (
              <>Don't have an account?{' '}<button className="underline" onClick={() => setIsSignUp(true)}>Create one</button></>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

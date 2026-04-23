import { AlertTriangle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface InitializationErrorProps {
  error: string
}

export function InitializationError({ error }: InitializationErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-destructive/5 via-background to-background">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Configuration Error</CardTitle>
          <CardDescription>LoveSpark is not configured correctly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-mono text-destructive/90 whitespace-pre-wrap break-words">
              {error}
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">To fix this:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Create a <code className="bg-muted px-2 py-1 rounded text-xs">.env.local</code> file in the project root</li>
              <li>Add your Supabase credentials:
                <pre className="bg-muted p-2 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </li>
              <li>Restart the development server</li>
            </ol>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Need help? Check the README.md or contact support.</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

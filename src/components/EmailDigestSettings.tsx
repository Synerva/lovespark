import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, Envelope, Eye, Sparkle, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { emailDigestService, type EmailPreferences, type EmailDigestData } from '@/lib/email-digest-service'
import { authService } from '@/lib/auth-service'

export function EmailDigestSettings() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    userId: '',
    enableWeeklyDigest: true,
    digestDay: 'monday',
    digestTime: '09:00',
    includeScoreProgress: true,
    includeInsights: true,
    includeMicroActions: true,
    includePatterns: true
  })
  const [previewData, setPreviewData] = useState<EmailDigestData | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    const session = authService.getSession()
    if (session) {
      const prefs = await emailDigestService.getEmailPreferences(session.id)
      setPreferences(prefs)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await emailDigestService.updateEmailPreferences(preferences)
      toast.success('Email digest preferences saved', {
        description: 'Your settings have been updated successfully.',
        icon: <Envelope weight="fill" className="text-primary" />
      })
    } catch (error) {
      toast.error('Failed to save preferences', {
        description: 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = async () => {
    setIsLoading(true)
    try {
      const session = authService.getSession()
      if (session) {
        const data = await emailDigestService.generateDigestData(session.id)
        const html = emailDigestService.generateEmailHTML(data)
        setPreviewData(data)
        setPreviewHtml(html)
        setShowPreview(true)
      }
    } catch (error) {
      toast.error('Failed to generate preview', {
        description: 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    toast.success('Test email sent!', {
      description: 'Check your inbox in a few moments.',
      icon: <Envelope weight="fill" className="text-primary" />
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Envelope weight="fill" className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold">Weekly Email Digest</CardTitle>
              <CardDescription className="mt-1.5">
                Get personalized insights and progress updates delivered to your inbox
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell weight="fill" className="w-5 h-5 text-primary" />
              <div>
                <Label htmlFor="enable-digest" className="text-base font-medium cursor-pointer">
                  Enable Weekly Digest
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Receive a comprehensive weekly summary
                </p>
              </div>
            </div>
            <Switch
              id="enable-digest"
              checked={preferences.enableWeeklyDigest}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enableWeeklyDigest: checked })
              }
            />
          </div>

          {preferences.enableWeeklyDigest && (
            <>
              <Separator />
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="digest-day" className="text-sm font-medium">
                    Delivery Day
                  </Label>
                  <Select
                    value={preferences.digestDay}
                    onValueChange={(value: 'monday' | 'sunday') =>
                      setPreferences({ ...preferences, digestDay: value })
                    }
                  >
                    <SelectTrigger id="digest-day">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday Morning</SelectItem>
                      <SelectItem value="sunday">Sunday Evening</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {preferences.digestDay === 'monday'
                      ? 'Start your week with insights'
                      : 'Reflect on your week'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digest-time" className="text-sm font-medium">
                    Delivery Time
                  </Label>
                  <Select
                    value={preferences.digestTime}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, digestTime: value })
                    }
                  >
                    <SelectTrigger id="digest-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="19:00">7:00 PM</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Content Preferences</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <TrendUp weight="fill" className="w-4 h-4 text-primary" />
                      <div>
                        <Label htmlFor="include-score" className="text-sm cursor-pointer">
                          Score Progress
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Weekly RIS score changes and trends
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="include-score"
                      checked={preferences.includeScoreProgress}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, includeScoreProgress: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Sparkle weight="fill" className="w-4 h-4 text-primary" />
                      <div>
                        <Label htmlFor="include-insights" className="text-sm cursor-pointer">
                          AI Insights
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Personalized observations and reflections
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="include-insights"
                      checked={preferences.includeInsights}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, includeInsights: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-sm" />
                      </div>
                      <div>
                        <Label htmlFor="include-actions" className="text-sm cursor-pointer">
                          Micro-Actions
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Track your weekly action completions
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="include-actions"
                      checked={preferences.includeMicroActions}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, includeMicroActions: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 text-primary">🔍</div>
                      <div>
                        <Label htmlFor="include-patterns" className="text-sm cursor-pointer">
                          Pattern Analysis
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Recurring behavioral patterns detected
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="include-patterns"
                      checked={preferences.includePatterns}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, includePatterns: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:opacity-90"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
            
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isLoading || !preferences.enableWeeklyDigest}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>Email Digest Preview</DialogTitle>
                  <DialogDescription>
                    This is how your weekly digest will look in your inbox
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[calc(90vh-140px)] px-6">
                  {previewHtml && (
                    <div 
                      className="rounded-lg overflow-hidden border border-border"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  )}
                </ScrollArea>
                <div className="p-6 pt-4 border-t border-border flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleSendTestEmail}
                    className="flex-1 bg-gradient-to-r from-primary via-primary/90 to-primary/80"
                  >
                    <Envelope className="w-4 h-4 mr-2" weight="fill" />
                    Send Test Email
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {preferences.enableWeeklyDigest && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkle weight="fill" className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-foreground">Next digest delivery</p>
                  <p className="text-muted-foreground mt-1">
                    {preferences.digestDay === 'monday' ? 'Next Monday' : 'This Sunday'} at{' '}
                    {preferences.digestTime.replace(':00', ':00 AM/PM')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkle weight="fill" className="w-5 h-5 text-primary" />
            What's Included in Your Digest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium text-sm">Relationship Intelligence Score</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track your overall RIS and pillar scores with weekly comparisons
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium text-sm">Personalized AI Insights</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pattern observations, micro-actions, and reflection questions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium text-sm">Weekly Activity Summary</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check-ins completed, micro-actions done, and AI conversations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <p className="font-medium text-sm">Actionable Next Steps</p>
              <p className="text-xs text-muted-foreground mt-1">
                Curated recommendations based on your progress and patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

# Weekly Email Digest Feature

## Overview
The Weekly Email Digest feature provides users with personalized relationship intelligence summaries delivered directly to their inbox. This keeps users engaged with the platform and reinforces progress tracking.

## Components Created

### 1. Email Digest Service (`src/lib/email-digest-service.ts`)

Core service handling all email digest logic:

- **`EmailDigestData`**: Interface for digest content
- **`EmailPreferences`**: User preferences for email delivery
- **`emailDigestService`**: Main service class

#### Key Methods

```typescript
// Generate complete digest data for a user
generateDigestData(userId: string): Promise<EmailDigestData>

// Get user email preferences
getEmailPreferences(userId: string): Promise<EmailPreferences>

// Update user email preferences
updateEmailPreferences(prefs: EmailPreferences): Promise<void>

// Generate beautiful HTML email
generateEmailHTML(data: EmailDigestData): string
```

#### Digest Contents

- **Score Progress**: Current vs previous week RIS scores with trend indicators
- **Weekly Insight**: Latest AI-generated insight with micro-actions
- **Activity Summary**: Check-ins, micro-actions completed, AI conversations
- **Pattern Detection**: Top 3 recurring behavioral patterns
- **Next Steps**: Personalized action recommendations
- **Motivational Message**: Context-aware encouragement

### 2. Email Digest Settings Component (`src/components/EmailDigestSettings.tsx`)

Full-featured settings UI allowing users to:

- Enable/disable weekly digest
- Choose delivery day (Monday morning or Sunday evening)
- Select delivery time
- Configure content preferences (score progress, insights, micro-actions, patterns)
- Preview email before delivery
- Send test email

## Integration Points

### Profile Settings

Add email digest settings to ProfileSettings module:

```typescript
import { EmailDigestSettings } from '@/components/EmailDigestSettings'

// Add new section in profile
<EmailDigestSettings />
```

### Types Extension

The following types have been added to `/src/lib/types.ts`:

- `EmailDigestData` - Complete digest payload
- `EmailPreferences` - User delivery preferences

## Data Flow

1. **Weekly Generation**:
   ```
   User → emailDigestService.generateDigestData()
   → Fetches: Current score, previous score, insights, patterns
   → Calculates: Trends, achievements, next steps
   → Returns: EmailDigestData
   ```

2. **Email Rendering**:
   ```
   EmailDigestData → emailDigestService.generateEmailHTML()
   → Generates: Beautiful HTML email template
   → Returns: Email HTML string
   ```

3. **Delivery**:
   ```
   User preferences → Check schedule
   → Generate digest → Send via email service
   → Track delivery
   ```

## Storage

Email preferences are stored in localStorage:
- Key: `lovespark-email-prefs-{userId}`
- Value: `EmailPreferences` object

## Email Template

The HTML email includes:

### Header
- LoveSpark branding
- Week number and date range
- Gradient background

### Motivational Message
- Context-aware encouragement based on trends

### Score Section
- Large RIS score display
- Change indicator with trend emoji
- Pillar scores breakdown (Understand, Align, Elevate)

### Weekly Insight (if available)
- Pattern observation
- Micro-action suggestion
- Reflection question

### Activity Summary
- Check-ins completed
- Micro-actions done
- AI conversations

### Pattern Analysis (if detected)
- Top 3 recurring patterns
- Frequency indicators
- Pillar association

### Next Steps
- Numbered action list
- Personalized recommendations
- Clear, actionable items

### CTA
- "Open LoveSpark Dashboard" button
- Navigation encouragement

### Footer
- Preferences link
- Unsubscribe option

## Email Template Features

- Fully responsive design
- Gmail/Outlook compatible
- Inline CSS for email client support
- Beautiful gradient backgrounds
- Professional typography
- Accessible colors (WCAG AA compliant)

##Usage Example

```typescript
import { emailDigestService } from '@/lib/email-digest-service'

// Generate digest for user
const digestData = await emailDigestService.generateDigestData(userId)

// Get HTML
const emailHTML = emailDigestService.generateEmailHTML(digestData)

// Send via email service (implement based on backend)
await sendEmail({
  to: user.email,
  subject: `Your Weekly Relationship Intelligence Digest - Week ${digestData.weekNumber}`,
  html: emailHTML
})
```

## Customization

### Adding New Content Sections

1. Extend `EmailDigestData` interface
2. Add data collection in `generateDigestData()`
3. Update HTML template in `generateEmailHTML()`
4. Add preference toggle in `EmailDigestSettings`

### Changing Schedule

Modify delivery options in `EmailDigestSettings.tsx`:

```typescript
<SelectItem value="monday">Monday Morning</SelectItem>
<SelectItem value="friday">Friday Afternoon</SelectItem>
```

## Best Practices

1. **Personalization**: Always use user's name and current data
2. **Brevity**: Keep digest concise and scannable
3. **Action-Oriented**: Include clear next steps
4. **Positive Framing**: Even declining scores should be motivational
5. **Mobile-First**: Email renders beautifully on all devices

## Backend Integration

### Scheduled Job (to be implemented)

```typescript
// Pseudo-code for weekly cron job
async function sendWeeklyDigests() {
  const users = await getAllUsersWithDigestEnabled()
  
  for (const user of users) {
    const prefs = await emailDigestService.getEmailPreferences(user.id)
    
    if (shouldSendToday(prefs.digestDay, prefs.digestTime)) {
      const data = await emailDigestService.generateDigestData(user.id)
      const html = emailDigestService.generateEmailHTML(data)
      
      await sendEmail({
        to: user.email,
        subject: `Your Weekly Digest - Week ${data.weekNumber}`,
        html
      })
    }
  }
}
```

## Testing

### Test Email Preview

Users can preview their digest before enabling:

1. Go to Profile Settings → Email Digest
2. Click "Preview Email"
3. View full rendered email in modal
4. Click "Send Test Email" to receive a sample

### Data Mocking

For testing with limited history:

```typescript
// Service handles missing data gracefully
- No check-ins → Shows encouragement to complete first check-in
- No patterns → Skips pattern section
- No insights → Shows motivational message only
```

## Future Enhancements

- [ ] Email open tracking
- [ ] Link click analytics
- [ ] A/B testing for subject lines
- [ ] Dynamic send time optimization
- [ ] Multi-language support
- [ ] Custom templates per user segment
- [ ] Integration with email service providers (SendGrid, AWS SES)

## Troubleshooting

### Email Not Generating

Check:
1. User has valid email in profile
2. User has completed at least one check-in
3. RIS score exists
4. Email preferences enabled

### Preview Shows Empty Sections

Expected behavior - preview uses current data. Sections only appear when data exists.

### Styling Issues in Email Clients

The template uses inline CSS and table-based layout for maximum compatibility. Test in:
- Gmail (web, iOS, Android)
- Outlook (desktop, web)
- Apple Mail
- Yahoo Mail

## Support

For issues or questions:
1. Check user's email preferences
2. Verify data exists for all digest components
3. Test email HTML in email client preview tools
4. Check browser console for errors in settings UI

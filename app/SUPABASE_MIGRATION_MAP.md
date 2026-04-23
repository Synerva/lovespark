# LoveSpark Persistence Migration Map

This document maps legacy Spark/local keys to Supabase tables.

## Identity and Profile

- `lovespark-user-${userId}` / `lovespark-user` -> `profiles`
- `lovespark-auth-session` (localStorage) -> Supabase Auth session (`auth.users` + `supabase.auth`)

## Onboarding

- `lovespark-onboarding-profile-${userId}` / `lovespark-onboarding-profile` -> `onboarding_responses`
- onboarding completion flag inside user object -> `profiles.onboarding_completed`

## RIS and Assessments

- `lovespark-ris-score-${userId}` / `lovespark-ris-score` -> `assessments` with `assessment_type = 'relationship_intelligence_score'`
- `lovespark-assessment-results` -> `assessments` (`growth_mindset_assessment`, `intimacy_connection_assessment`, `emotional_reaction_assessment`, `communication_timing_assessment`, `compatibility_assessment`, `communication_patterns_assessment`)

## AI Coach

- `lovespark-ai-messages-${userId}` / `lovespark-ai-messages` -> `ai_conversations` + `ai_messages`
- `lovespark-weekly-message-count` / `lovespark-week-start-date` -> `state_snapshots` keys `weekly_message_count` and `weekly_message_window`

## Check-ins and Insights

- `lovespark-check-ins` -> `check_ins`
- `lovespark-insights` -> `insights`
- `lovespark-score-history` -> `state_snapshots` key `score_history`
- `lovespark-weekly-insights` -> `state_snapshots` key `weekly_insights`
- `lovespark-recurring-patterns` -> `state_snapshots` key `recurring_patterns`

## Micro-actions / Recommendations

- `lovespark-micro-actions-${weekNumber}` -> `recommendations` (`source = 'micro_action'`)

## Subscription

- `lovespark-subscription` -> `subscriptions` (`provider = 'paddle'`)

## Non-critical local preferences intentionally left local

- `lovespark-auto-speak`
- `lovespark-bookmarked-questions`
- `sidebar-collapsed`
- `sidebar-width`

## Runtime Write Path Map (Current)

- Onboarding submit:
	`src/modules/Onboarding.tsx` (`processOnboarding`) -> `saveOnboardingComposite` (`src/lib/db/onboarding.ts`) -> `onboarding_responses` upsert (`user_id`, `question_key`, `response_value`)
- Onboarding completion flag:
	`src/modules/Onboarding.tsx` (`completeOnboarding`/`skipOnboarding`) -> `completeOnboardingInDb` -> `setOnboardingCompleted` (`src/lib/db/profiles.ts`) -> `profiles.onboarding_completed`
- Onboarding RIS write:
	`src/modules/Onboarding.tsx` -> `saveRelationshipIntelligenceScore` (`src/lib/db/assessments.ts`) -> `assessments` insert (`user_id`, `assessment_type`, `answers`, `score_payload`)

- Assessments write:
	`src/modules/*Assessment.tsx` -> `saveAssessment` (`src/lib/db/assessments.ts`) -> `assessments` insert (`user_id`, `assessment_type`, `answers`, `score_payload`)
- RIS update from assessments:
	`src/modules/*Assessment.tsx` -> `saveRelationshipIntelligenceScore` -> `assessments` insert (`assessment_type = relationship_intelligence_score`)

- Chat bootstrap:
	`src/modules/AICoach.tsx` (`handleSend`/initial load) -> `getOrCreatePrimaryConversation` (`src/lib/db/ai.ts`) -> `ai_conversations` select/insert (`user_id`, `title`)
- Chat message write:
	`src/modules/AICoach.tsx` -> `saveChatMessage` (`src/lib/db/ai.ts`) -> `ai_messages` insert (`conversation_id`, `user_id`, `role`, `content`, `context`)

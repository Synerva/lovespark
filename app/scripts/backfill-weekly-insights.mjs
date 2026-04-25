import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const MODULE_SCOPE = 'lovespark'
const WEEKLY_INSIGHT_TYPE = 'weekly'

function loadEnvFromFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return
  }

  const content = fs.readFileSync(envPath, 'utf8')
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, equalIndex).trim()
    const value = trimmed.slice(equalIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function clampTo100(value) {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function normalizeScore(raw) {
  if (raw <= 5) return clampTo100(raw * 20)
  if (raw <= 10) return clampTo100(raw * 10)
  return clampTo100(raw)
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function average(values) {
  if (values.length === 0) return null
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

function getQuestionAverage(checkInRows, questionId) {
  const values = []

  for (const row of checkInRows) {
    const responses = Array.isArray(row?.responses) ? row.responses : []
    for (const response of responses) {
      if (response?.questionId !== questionId) continue
      const numeric = asNumber(response?.value)
      if (numeric === null) continue
      values.push(normalizeScore(numeric))
    }
  }

  return average(values)
}

function walkJson(value, visit, parentKey = '') {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkJson(item, visit, parentKey)
    }
    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  for (const [key, node] of Object.entries(value)) {
    const pathKey = parentKey ? `${parentKey}.${key}` : key
    visit(pathKey, node)
    walkJson(node, visit, pathKey)
  }
}

function collectAssessmentSignals(assessmentRows) {
  const stressScores = []
  const communicationScores = []
  const conflictSignals = []

  const stressKeyPattern = /stress|anxious|anxiety|overwhelm|trigger|reactivity/i
  const communicationKeyPattern = /communication|clarity|listen|listening|express|expression/i
  const conflictKeyPattern = /conflict|argument|fight|avoid|confront|withdraw|stonewall|shutdown/i

  for (const row of assessmentRows) {
    const sources = [row?.answers, row?.score_payload]
    for (const source of sources) {
      walkJson(source, (key, node) => {
        const numeric = asNumber(node)
        if (numeric !== null) {
          if (stressKeyPattern.test(key)) stressScores.push(normalizeScore(numeric))
          if (communicationKeyPattern.test(key)) communicationScores.push(normalizeScore(numeric))
        }

        if (typeof node === 'string' && conflictKeyPattern.test(node)) {
          conflictSignals.push(node)
        }

        if (conflictKeyPattern.test(key) && typeof node === 'string' && node.trim().length > 0) {
          conflictSignals.push(node)
        }
      })
    }

    if (String(row?.assessment_type ?? '') === 'conflict_pattern') {
      conflictSignals.push('conflict_pattern_assessment')
    }
  }

  return {
    stressAverage: average(stressScores),
    communicationAverage: average(communicationScores),
    conflictSignals,
  }
}

function includesConflictSignal(text) {
  return /conflict|argument|fight|avoid|confront|withdraw|stonewall|shutdown/i.test(text)
}

async function generateWeeklyInsight(supabase, userId) {
  const weekAgoIso = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString()

  const { data: onboardingRows, error: onboardingError } = await supabase
    .from('onboarding_responses')
    .select('question_key,response_value')
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)

  if (onboardingError) throw onboardingError

  const { data: assessmentRows, error: assessmentError } = await supabase
    .from('assessments')
    .select('assessment_type,answers,score_payload,created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  if (assessmentError) throw assessmentError

  const { data: checkInRows, error: checkInError } = await supabase
    .from('check_ins')
    .select('responses,completed_at')
    .eq('user_id', userId)
    .gte('completed_at', weekAgoIso)
    .order('completed_at', { ascending: false })

  if (checkInError) throw checkInError

  const onboardingByKey = new Map((onboardingRows ?? []).map((row) => [String(row.question_key), String(row.response_value ?? '')]))

  const activeListeningAvg = getQuestionAverage(checkInRows ?? [], 'active-listening')
  const emotionalExpressionAvg = getQuestionAverage(checkInRows ?? [], 'emotional-expression')
  const communicationClarityAvg = getQuestionAverage(checkInRows ?? [], 'communication-clarity')

  const assessmentSignals = collectAssessmentSignals(assessmentRows ?? [])
  const stressAverage = assessmentSignals.stressAverage
  const communicationSignalAverage = average(
    [communicationClarityAvg, assessmentSignals.communicationAverage].filter((value) => typeof value === 'number')
  )

  const holdsBackExpression =
    activeListeningAvg !== null &&
    emotionalExpressionAvg !== null &&
    activeListeningAvg - emotionalExpressionAvg >= 10

  const emotionalBottleneck =
    stressAverage !== null &&
    communicationSignalAverage !== null &&
    stressAverage >= 65 &&
    communicationSignalAverage <= 45

  const onboardingConflictSignals = [
    onboardingByKey.get('conflictStyle') ?? '',
    onboardingByKey.get('mainChallenge') ?? '',
  ].filter((value) => includesConflictSignal(value))

  const hasConflictSignal = onboardingConflictSignals.length > 0 || assessmentSignals.conflictSignals.length > 0

  let body = 'Your latest signals show steady engagement, with room to tighten consistency between awareness and action.'
  let reflectionQuestion = 'Which one communication behavior would make this week feel more connected than last week?'

  if (holdsBackExpression) {
    body = 'Pattern detected: you are listening more than expressing. Your weekly check-ins show high presence for listening and lower scores for emotional expression, which can create invisible needs and delayed tension.'
    reflectionQuestion = 'What is one important feeling or need you can express directly this week instead of holding it back?'
  } else if (emotionalBottleneck) {
    body = 'Pattern detected: emotional bottleneck. Recent assessment signals indicate elevated stress while communication clarity is low, which can compress emotional processing and make conversations feel harder than necessary.'
    reflectionQuestion = 'What simple communication ritual could lower stress before your next important conversation?'
  } else if (hasConflictSignal) {
    body = 'Pattern detected: avoidance vs confrontation tension. Your onboarding and/or assessment conflict signals suggest friction around how conflict is approached, which can cause either shutdown or escalation cycles.'
    reflectionQuestion = 'When conflict appears, what would a balanced first response look like for you: neither avoidance nor attack?'
  }

  const createdAt = new Date().toISOString()
  const insertPayload = {
    user_id: userId,
    title: 'Pattern Observation',
    content: body,
    reflection_question: reflectionQuestion,
    created_at: createdAt,
    module_scope: MODULE_SCOPE,
    insight_type: WEEKLY_INSIGHT_TYPE,
    pillar: 'align',
    actionable: reflectionQuestion,
    read: false,
  }

  const { data: createdInsight, error: insertError } = await supabase
    .from('insights')
    .insert(insertPayload)
    .select('id,title,content,reflection_question,created_at')
    .single()

  if (insertError) throw insertError
  return createdInsight
}

function detectPatternFromInsight(insight) {
  const combined = [
    insight?.title ?? '',
    insight?.content ?? '',
    insight?.reflection_question ?? '',
  ].join(' ').toLowerCase()

  if (combined.includes('holds back expression') || (combined.includes('listening') && combined.includes('express'))) {
    return 'holds_back_expression'
  }

  if (combined.includes('emotional bottleneck') || (combined.includes('stress') && combined.includes('communication'))) {
    return 'emotional_bottleneck'
  }

  if (combined.includes('avoidance vs confrontation') || (combined.includes('conflict') && (combined.includes('avoid') || combined.includes('confront')))) {
    return 'avoidance_vs_confrontation'
  }

  return 'default'
}

function buildMicroActions(pattern) {
  if (pattern === 'holds_back_expression') {
    return [
      {
        title: 'Share one personal feeling',
        description: 'Share one honest feeling with your partner in a single clear sentence today.',
      },
      {
        title: 'Ask one reflective question',
        description: 'Ask your partner one reflective question about how they felt this week.',
      },
      {
        title: 'Pause before emotional reply',
        description: 'Take one deep breath before responding when you feel emotionally activated.',
      },
    ]
  }

  if (pattern === 'emotional_bottleneck') {
    return [
      {
        title: 'Name stress before talking',
        description: 'Before a hard conversation, say how stressed you feel using a 1 to 10 number.',
      },
      {
        title: 'Use one clear need statement',
        description: 'Use one sentence that starts with I need to communicate your core need.',
      },
      {
        title: 'Set a 10-minute reset',
        description: 'If tension rises, pause for 10 minutes and return to the same topic calmly.',
      },
    ]
  }

  if (pattern === 'avoidance_vs_confrontation') {
    return [
      {
        title: 'Address one small tension',
        description: 'Bring up one small unresolved issue within 24 hours instead of delaying it.',
      },
      {
        title: 'Start with curiosity',
        description: 'Open conflict talks with one curiosity question before sharing your position.',
      },
      {
        title: 'Use calm opening phrase',
        description: 'Start difficult topics with: I want us to understand this together.',
      },
    ]
  }

  return [
    {
      title: 'Share one appreciation',
      description: 'Share one specific appreciation with your partner today.',
    },
    {
      title: 'Do one weekly check-in',
      description: 'Schedule one 10-minute relationship check-in this week.',
    },
    {
      title: 'Ask one open question',
      description: 'Ask one open-ended question to better understand your partner perspective.',
    },
  ]
}

async function generateMicroActions(supabase, userId, insightId, insight) {
  const pattern = detectPatternFromInsight(insight)
  const actions = buildMicroActions(pattern).slice(0, 3)

  const rows = actions.map((action) => ({
    user_id: userId,
    title: action.title,
    description: action.description,
    status: 'pending',
    module_scope: MODULE_SCOPE,
    priority: 'this_week',
    linked_insight_id: insightId,
  }))

  const { error } = await supabase.from('recommendations').insert(rows)
  if (error) throw error

  return rows
}

async function run() {
  const envPath = path.resolve(process.cwd(), '.env')
  loadEnvFromFile(envPath)

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL or VITE_SUPABASE_URL in environment.')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Set it in environment before running this script.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .eq('module_scope', MODULE_SCOPE)

  if (profilesError) {
    throw profilesError
  }

  const users = profiles ?? []
  let processed = 0
  let generated = 0
  let skipped = 0
  let failed = 0

  for (const profile of users) {
    processed += 1
    const userId = String(profile.id)

    const { count, error: countError } = await supabase
      .from('insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      failed += 1
      console.error('[Backfill] count failed', { userId, error: countError.message })
      continue
    }

    if ((count ?? 0) > 0) {
      skipped += 1
      continue
    }

    try {
      const insight = await generateWeeklyInsight(supabase, userId)
      await generateMicroActions(supabase, userId, insight.id, insight)
      generated += 1
      console.log('[Backfill] generated', { userId, insightId: insight.id })
    } catch (error) {
      failed += 1
      console.error('[Backfill] generation failed', { userId, error: error instanceof Error ? error.message : String(error) })
    }
  }

  console.log('[Backfill] complete', {
    processed,
    generated,
    skipped,
    failed,
  })
}

run().catch((error) => {
  console.error('[Backfill] fatal', error)
  process.exit(1)
})

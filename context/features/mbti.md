# MBTI System Roadmap (Production Phase Plan)

## Goal

Build a production-grade MBTI / personality assessment platform with:

* adaptive psychometric quiz
* high completion rate
* personalized result generation
* analytics-driven optimization
* scalable question system
* recommendation engine
* SEO + viral sharing capability

---

# Phase 1 — Core Quiz MVP

## Objective

Build usable MBTI experience with better UX than traditional quizzes.

## Features

### Likert Scale Answer System

Replace binary A/B with 5-level scale.

Scale:

* 1 = Strongly A
* 2 = Lean A
* 3 = Neutral
* 4 = Lean B
* 5 = Strongly B

Weighted scoring:

* 1 → +2
* 2 → +1
* 3 → 0
* 4 → -1
* 5 → -2

---

### Adaptive Question Ordering

Features:

* Fisher-Yates shuffle
* uncertain-first question selection
* confidence-based next question
* dynamic queue

Logic:

* confidence = |net| / (answered × 2)
* pick dimension with lowest confidence first

---

### Early Finish System

Allow users to finish earlier when confidence is high.

Conditions:

* confidence ≥ 0.75
* minimum answered questions per dimension reached

---

### Real-time Progress UI

Features:

* dimension confidence bars
* live personality shift
* progress indicators

Dimensions:

* EI
* SN
* TF
* JP

---

### Current Architecture

Files:

* `src/types/mbti.ts`
* `src/utils/mbti.ts`
* `src/features/mbti/components/mbti-quiz.tsx`

---

# Phase 2 — Psychometric Improvement Layer

## Objective

Improve accuracy, stability, and anti-random-answer behavior.

---

## Features

### Question Weighting

Add discrimination weights per question.

Example:

```ts
type MBTIQuestion = {
  id: string
  dimension: MBTIDimension
  weight: number
}
```

Purpose:

* strong predictor questions influence more
* weak/noisy questions influence less

---

### Reverse Questions

Add reverse-polarity wording.

Example:

* "I enjoy social events"
* "Social interaction drains my energy"

Purpose:

* reduce pattern answering
* reduce fake responses
* improve reliability

---

### Consistency Engine

Measure contradiction across semantically related questions.

Example:

* likes planning
* dislikes uncertainty
* prefers schedules

If conflicting:

* reduce confidence score
* trigger validation questions

---

### Neutral Spam Detection

Detect excessive neutral usage.

Rules:

```txt
neutral_ratio > 0.6
```

Actions:

* show warning
* force decisive questions
* lower confidence

---

### Response Time Tracking

Track:

* response time
* hesitation
* rapid clicking

Analytics:

```ts
{
  question_id,
  response_time_ms
}
```

Purpose:

* confidence calibration
* suspicious detection
* adaptive improvements

---

# Phase 3 — Analytics Infrastructure

## Objective

Turn MBTI into data + optimization platform.

---

## Stack

### Analytics

* Google Analytics 4
* Google Tag Manager
* BigQuery

---

## Core Events

### quiz_started

Track funnel entry.

---

### question_answered

Payload:

```ts
{
  question_id,
  dimension,
  likert,
  response_time_ms,
  confidence_before,
  confidence_after
}
```

---

### early_finish_clicked

Track:

* confidence threshold usage
* user impatience

---

### result_generated

Track:

* type distribution
* completion rate

---

### share_result

Track:

* virality
* platform shares

---

## Dashboard Goals

### Product Dashboard

Track:

* completion rate
* average session duration
* abandonment points

---

### Personality Dashboard

Track:

* most common types
* dimension uncertainty
* demographic patterns

---

### Psychometric Dashboard

Track:

* low quality questions
* inconsistent questions
* high skip questions

---

# Phase 4 — Scalable Question System

## Objective

Build scalable dynamic question pool.

---

## Features

### Large Question Pool

Instead of:

```txt
12 questions per dimension
```

Target:

```txt
100–300 questions per dimension
```

---

### Dynamic Question Sampling

System selects:

* random subset
* confidence-aware subset
* anti-repeat subset

---

### Difficulty / Discrimination Metadata

Example:

```ts
type MBTIQuestion = {
  difficulty: number
  discrimination: number
  category: string[]
}
```

---

### Topic Clustering

Question categories:

* social
* planning
* stress
* emotions
* leadership
* study habits

Purpose:

* recommendation engine
* career mapping
* content generation

---

# Phase 5 — Personalized Result Engine

## Objective

Generate highly personalized results.

---

## Features

### Trait-Based Backend

Internal scoring:

```ts
{
  social_energy: number
  structure: number
  empathy: number
  creativity: number
}
```

Then map into:

```txt
INTJ
ENFP
ENTP
```

Purpose:

* more flexible
* more scientific
* better recommendation quality

---

### Percentage Breakdown

Example:

```txt
E 58%
I 42%
```

---

### Personality Narrative

Generate:

* strengths
* weaknesses
* stress behavior
* communication style
* study habits

---

### Cognitive Pattern Analysis

Examples:

* prefers logic under stress
* avoids uncertainty
* gains energy from structure

---

### Career Recommendation Engine

Connect with TCAS project.

Examples:

* INTJ → engineering / research
* ENFP → communication / marketing
* ISTJ → accounting / medicine

---

### Compatibility System

Features:

* friend compatibility
* team compatibility
* study compatibility

---

# Phase 6 — AI Adaptive Engine

## Objective

Use AI to dynamically improve quiz quality.

---

## Features

### AI Follow-up Questions

If uncertainty high:

* generate probing questions
* clarify contradictions

---

### Dynamic Difficulty

AI adjusts:

* question complexity
* wording style
* emotional intensity

---

### Personality Summary Generation

Generate:

* personalized explanation
* growth advice
* study recommendations

---

### AI Recommendation System

Recommend:

* careers
* university majors
* study techniques
* productivity styles

---

# Phase 7 — Social + Viral Layer

## Objective

Increase retention and sharing.

---

## Features

### Shareable Personality Cards

Generate:

* MBTI poster
* aesthetic cards
* social-friendly images

Platforms:

* TikTok
* Instagram
* Facebook

---

### Compare With Friends

Features:

* compatibility match
* personality battles
* study partner score

---

### Leaderboards / Trends

Examples:

* most common MBTI among med students
* engineering personality trends
* school-level personality stats

---

### SEO Personality Pages

Examples:

* "INTJ study style"
* "Best majors for ENFP"
* "แพทย์เหมาะกับ MBTI ไหน"

---

# Recommended Production Architecture

```txt
Question Pool
    ↓
Adaptive Engine
    ↓
Scoring Engine
    ↓
Consistency Engine
    ↓
Confidence Engine
    ↓
Result Generator
    ↓
Analytics Pipeline
    ↓
Recommendation Engine
```

---

# Recommended Tech Stack

## Frontend

* Next.js
* TailwindCSS
* Framer Motion

---

## Backend

* Supabase
* PostgreSQL

---

## Analytics

* Google Analytics 4
* Google Tag Manager
* BigQuery

---

## Visualization

* Recharts
* Tremor

---

# Long-term Vision

Transform MBTI quiz into:

* personality intelligence platform
* student guidance system
* career recommendation engine
* behavioral analytics system
* educational personalization platform

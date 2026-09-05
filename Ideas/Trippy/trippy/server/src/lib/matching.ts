import { pj } from '../db.js'

// ---------------------------------------------------------------------------
// Travel Personality Score (PRD 1.1). Rule-based for the MVP; the scoring
// dimensions map 1:1 to what a Claude API call would receive later, so the
// swap is a drop-in replacement.
// ---------------------------------------------------------------------------
export function personalityFor(user: { travel_style?: string; interests?: string }): string {
  const style = user.travel_style || ''
  const interests = pj<string[]>(user.interests, [])
  const has = (...keys: string[]) => keys.some(k => interests.includes(k))

  if (style === 'adventure' || has('trekking', 'biking', 'camping', 'water sports')) return 'Thrill Chaser'
  if (style === 'spiritual' || has('yoga', 'meditation')) return 'Soul Searcher'
  if (style === 'party' || has('nightlife', 'music')) return 'Social Butterfly'
  if (style === 'cultural' || has('history', 'photography', 'architecture', 'local markets')) return 'Culture Seeker'
  if (style === 'leisure' || has('food', 'cafes', 'beaches')) return 'Easy Rover'
  return 'Explorer'
}

const BUDGET_ORDER = ['budget', 'mid-range', 'premium']

// ---------------------------------------------------------------------------
// Compatibility score 0–100 (PRD 1.2) with human-readable reasons.
// Weights: interests 40, travel style 20, budget 15, age proximity 15,
// shared language 10.
// ---------------------------------------------------------------------------
export function compatibility(a: any, b: any): { score: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 0

  const ia = new Set(pj<string[]>(a.interests, []))
  const ib = new Set(pj<string[]>(b.interests, []))
  const shared = [...ia].filter(x => ib.has(x))
  const union = new Set([...ia, ...ib])
  const jaccard = union.size ? shared.length / union.size : 0
  score += Math.round(40 * Math.min(1, jaccard * 2)) // full marks at 50% overlap
  if (shared.length >= 2) reasons.push(`You both love ${shared.slice(0, 2).join(' and ')}`)
  else if (shared.length === 1) reasons.push(`You share an interest in ${shared[0]}`)

  if (a.travel_style && a.travel_style === b.travel_style) {
    score += 20
    reasons.push(`Same ${a.travel_style} travel style`)
  } else if (a.travel_style === 'mixed' || b.travel_style === 'mixed') {
    score += 12
  } else {
    score += 5
  }

  if (a.budget && a.budget === b.budget) {
    score += 15
    reasons.push('Similar budgets')
  } else if (Math.abs(BUDGET_ORDER.indexOf(a.budget) - BUDGET_ORDER.indexOf(b.budget)) === 1) {
    score += 7
  }

  const ageDiff = Math.abs((a.age || 28) - (b.age || 28))
  if (ageDiff <= 5) score += 15
  else if (ageDiff <= 10) score += 8
  else score += 3

  const la = new Set(pj<string[]>(a.languages, []))
  const lb = new Set(pj<string[]>(b.languages, []))
  const sharedLang = [...la].filter(x => lb.has(x))
  if (sharedLang.length) score += 10

  if (personalityFor(a) === personalityFor(b)) {
    reasons.push(`You're both ${personalityFor(a)}s`)
  }

  return { score: Math.max(5, Math.min(100, score)), reasons }
}

// Date overlap with ±tolerance days (PRD: ±3 days)
export function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string, toleranceDays = 3): boolean {
  const t = toleranceDays * 86400000
  const s1 = Date.parse(aStart) - t
  const e1 = Date.parse(aEnd) + t
  const s2 = Date.parse(bStart)
  const e2 = Date.parse(bEnd)
  return s1 <= e2 && s2 <= e1
}

// Interest suggestions per destination (PRD 1.1 "AI role": auto-suggest
// interests from stated destinations). Rule-based for MVP.
export const DESTINATION_INTERESTS: Record<string, string[]> = {
  manali: ['trekking', 'camping', 'photography', 'cafes'],
  kasol: ['trekking', 'music', 'cafes', 'camping'],
  'spiti-valley': ['biking', 'photography', 'camping', 'history'],
  udaipur: ['history', 'architecture', 'food', 'photography'],
  gokarna: ['beaches', 'yoga', 'water sports', 'cafes'],
  rishikesh: ['yoga', 'meditation', 'water sports', 'trekking'],
}

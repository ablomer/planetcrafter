/** Raw Ti (base unit, no prefix). */

export type PlanetId = "prime" | "selenea" | "aqualis" | "toxicity"

export type StageRow = {
  name: string
  /** Ti required to complete this stage (wiki). */
  threshold: number
}

const TI_PREFIXES = [
  { symbol: "Y", factor: 1e24 },
  { symbol: "Z", factor: 1e21 },
  { symbol: "E", factor: 1e18 },
  { symbol: "P", factor: 1e15 },
  { symbol: "T", factor: 1e12 },
  { symbol: "G", factor: 1e9 },
  { symbol: "M", factor: 1e6 },
  { symbol: "k", factor: 1e3 },
] as const

export const STAGES_BY_PLANET: Record<PlanetId, StageRow[]> = {
  prime: [
    { name: "Barren", threshold: 0 },
    { name: "Blue Sky", threshold: 175_000 },
    { name: "Clouds", threshold: 350_000 },
    { name: "Rain", threshold: 875_000 },
    { name: "Liquid Water", threshold: 3_000_000 },
    { name: "Lakes", threshold: 50_000_000 },
    { name: "Moss", threshold: 200_000_000 },
    { name: "Flora", threshold: 700_000_000 },
    { name: "Trees", threshold: 2_000_000_000 },
    { name: "Insects", threshold: 8_000_000_000 },
    { name: "Breathable Atmosphere", threshold: 32_000_000_000 },
    { name: "Fish", threshold: 120_000_000_000 },
    { name: "Amphibians", threshold: 425_000_000_000 },
    { name: "Mammals", threshold: 1_250_000_000_000 },
    { name: "Complete Terraformation", threshold: 4_000_000_000_000 },
  ],
  selenea: [
    { name: "Barren", threshold: 0 },
    { name: "Water Cycle", threshold: 150_000_000 },
    { name: "Vegetation", threshold: 1_500_000_000 },
    { name: "Clear Sky", threshold: 20_000_000_000 },
    { name: "Breathable Atmosphere", threshold: 250_000_000_000 },
    { name: "Natural Life", threshold: 1_000_000_000_000 },
    { name: "Complete Terraformation", threshold: 5_000_000_000_000 },
  ],
  aqualis: [
    { name: "Submerged", threshold: 0 },
    { name: "Seismic Activity", threshold: 10_000_000 },
    { name: "Corals", threshold: 200_000_000 },
    { name: "Seismic Shocks", threshold: 1_000_000_000 },
    { name: "Water Plants", threshold: 9_000_000_000 },
    { name: "Breathable Atmosphere", threshold: 100_000_000_000 },
    { name: "Natural Life", threshold: 1_100_000_000_000 },
    { name: "Complete Terraformation", threshold: 7_000_000_000_000 },
  ],
  toxicity: [
    { name: "Toxic Wasteland", threshold: 0 },
    { name: "Toxic Dust", threshold: 200_000 },
    { name: "Acid Rains", threshold: 500_000 },
    { name: "Toxic Eruptions", threshold: 2_000_000 },
    { name: "Clear Sky", threshold: 5_000_000 },
    { name: "Vegetation Renewal", threshold: 10_000_000 },
    { name: "Purified Atmosphere", threshold: 50_000_000 },
    { name: "Purified Water Cycle", threshold: 150_000_000 },
    { name: "Vegetation", threshold: 1_000_000_000 },
    { name: "Purified Oceans", threshold: 7_000_000_000 },
    { name: "Insects", threshold: 45_000_000_000 },
    { name: "Breathable Atmosphere", threshold: 350_000_000_000 },
    { name: "Natural Life", threshold: 1_500_000_000_000 },
    { name: "Complete Terraformation", threshold: 6_500_000_000_000 },
  ],
}

export const PLANET_LABELS: Record<PlanetId, string> = {
  prime: "Prime / Humble",
  selenea: "Selenea (Moon)",
  aqualis: "Aqualis (Moon)",
  toxicity: "Toxicity",
}

/**
 * Parse values like "350k", "5.2 MTi", "2G", "175000" into raw Ti.
 */
export function parseTiValue(input: string): { ok: true; value: number } | { ok: false } {
  const trimmed = input.trim().replaceAll(/\s+/g, " ")
  if (trimmed === "") return { ok: false }

  const lower = trimmed.toLowerCase()
  const withoutTi = lower.replace(/\s*ti\s*$/i, "").trim()

  const match = withoutTi.match(/^(-?[\d.,]+)\s*([yzepgmtk]?)$/i)
  if (!match) return { ok: false }

  const numStr = match[1].replace(/,/g, "")
  const coef = Number.parseFloat(numStr)
  if (!Number.isFinite(coef)) return { ok: false }

  const suffix = (match[2] || "").toLowerCase()
  const factorMap: Record<string, number> = {
    "": 1,
    k: 1e3,
    m: 1e6,
    g: 1e9,
    t: 1e12,
    p: 1e15,
    e: 1e18,
    z: 1e21,
    y: 1e24,
  }
  const factor = factorMap[suffix]
  if (factor === undefined) return { ok: false }

  const value = coef * factor
  if (!Number.isFinite(value)) return { ok: false }
  return { ok: true, value }
}

/**
 * Format raw Ti like the game (kTi, MTi, …), max ~999.99 per prefix.
 */
export function formatTiValue(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  if (abs === 0) return "0 Ti"

  for (const { symbol, factor } of TI_PREFIXES) {
    if (abs >= factor) {
      const n = abs / factor
      const s = n.toFixed(2).replace(/\.?0+$/, "")
      return `${sign}${s} ${symbol}Ti`
    }
  }

  const s = abs < 1 ? abs.toPrecision(4) : abs.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return `${sign}${s} Ti`
}

export function formatTiRate(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (value === 0) return "0 Ti/s"
  return `${formatTiValue(value)}/s`
}

export type DurationParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

export function formatDuration(totalSeconds: number): DurationParts {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }
  }
  if (totalSeconds === Number.POSITIVE_INFINITY) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: Number.POSITIVE_INFINITY }
  }

  const whole = Math.floor(totalSeconds)
  const days = Math.floor(whole / 86_400)
  let rest = whole % 86_400
  const hours = Math.floor(rest / 3600)
  rest %= 3600
  const minutes = Math.floor(rest / 60)
  const seconds = rest % 60
  return { days, hours, minutes, seconds, totalSeconds: whole }
}

export function formatDurationLabel(parts: DurationParts): string {
  if (parts.totalSeconds === Number.POSITIVE_INFINITY) return "∞"
  const { days, hours, minutes, seconds } = parts
  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
  }
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`
  }
  return `${seconds}s`
}

export function calculateTimeSeconds(
  currentTi: number,
  targetTi: number,
  totalRatePerSecond: number
): number {
  if (totalRatePerSecond <= 0) return Number.POSITIVE_INFINITY
  const delta = targetTi - currentTi
  if (delta <= 0) return 0
  return delta / totalRatePerSecond
}

export function timeToReachThreshold(
  currentTi: number,
  threshold: number,
  ratePerSecond: number
): number {
  if (ratePerSecond <= 0) return Number.POSITIVE_INFINITY
  if (threshold <= currentTi) return 0
  return (threshold - currentTi) / ratePerSecond
}

export type TimelineRow =
  | { kind: "reached"; stage: StageRow }
  | { kind: "upcoming"; stage: StageRow; seconds: number; isTarget: boolean }
  | { kind: "customTarget"; threshold: number; isTarget: true }

/**
 * Build rows for "stages you'll pass" between current and target Ti.
 */
export function buildTimeline(
  planet: PlanetId,
  currentTi: number,
  targetTi: number,
  ratePerSecond: number
): TimelineRow[] {
  const stages = STAGES_BY_PLANET[planet]
  const rows: TimelineRow[] = []

  const completed = stages.filter((s) => s.threshold > 0 && s.threshold <= currentTi)
  const lastCompleted = completed.reduce<StageRow | undefined>(
    (best, s) => (!best || s.threshold > best.threshold ? s : best),
    undefined
  )
  if (lastCompleted) {
    rows.push({ kind: "reached", stage: lastCompleted })
  }

  const milestones = stages.filter(
    (s) => s.threshold > currentTi && s.threshold <= targetTi && s.threshold > 0
  )

  const targetMatchesStage = milestones.some((s) => s.threshold === targetTi)

  for (const stage of milestones) {
    const seconds = timeToReachThreshold(currentTi, stage.threshold, ratePerSecond)
    const isTarget = stage.threshold === targetTi
    rows.push({ kind: "upcoming", stage, seconds, isTarget })
  }

  if (!targetMatchesStage && targetTi > currentTi) {
    rows.push({ kind: "customTarget", threshold: targetTi, isTarget: true })
  }

  return rows
}

/**
 * List every stage from 0 Ti when current/target are unset — times are from 0 at the given rate.
 */
export function buildAllStagesTimeline(
  planet: PlanetId,
  ratePerSecond: number
): TimelineRow[] {
  if (ratePerSecond <= 0 || !Number.isFinite(ratePerSecond)) return []
  const stages = STAGES_BY_PLANET[planet]
  const rows: TimelineRow[] = []

  const zeroStage = stages.find((s) => s.threshold === 0)
  if (zeroStage) {
    rows.push({ kind: "reached", stage: zeroStage })
  }

  for (const stage of stages) {
    if (stage.threshold <= 0) continue
    const seconds = timeToReachThreshold(0, stage.threshold, ratePerSecond)
    rows.push({ kind: "upcoming", stage, seconds, isTarget: false })
  }

  return rows
}

/**
 * List every stage for the planet — reached vs upcoming from `currentTi`; times for upcoming are from current at `ratePerSecond`.
 */
export function buildAllStagesTimelineFromCurrent(
  planet: PlanetId,
  currentTi: number,
  ratePerSecond: number
): TimelineRow[] {
  if (ratePerSecond <= 0 || !Number.isFinite(ratePerSecond)) return []
  const stages = STAGES_BY_PLANET[planet]
  const rows: TimelineRow[] = []

  for (const stage of stages) {
    if (stage.threshold === 0) {
      rows.push({ kind: "reached", stage })
      continue
    }
    if (stage.threshold <= currentTi) {
      rows.push({ kind: "reached", stage })
    } else {
      const seconds = timeToReachThreshold(currentTi, stage.threshold, ratePerSecond)
      rows.push({ kind: "upcoming", stage, seconds, isTarget: false })
    }
  }

  return rows
}

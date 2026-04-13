import { useMemo, useState } from "react"
import { Flame, Gauge, GitFork, Globe, Leaf, Wind } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  buildAllStagesTimeline,
  buildAllStagesTimelineFromCurrent,
  buildTimeline,
  calculateTimeSeconds,
  formatDuration,
  formatDurationLabel,
  formatTiRate,
  formatTiValue,
  parseTiValue,
  PLANET_LABELS,
  type PlanetId,
} from "@/lib/ti-calculator"
import { GITHUB_PROFILE_URL } from "@/site"

function parseRateInput(s: string): { ok: true; value: number } | { ok: false } {
  if (s.trim() === "") return { ok: true, value: 0 }
  return parseTiValue(s)
}

function parseCurrentTiInput(s: string): { ok: true; value: number } | { ok: false } {
  if (s.trim() === "") return { ok: true, value: 0 }
  return parseTiValue(s)
}

const RATE_HINTS = [
  { key: "oxygen" as const, label: "Oxygen", unit: "ppq/s", icon: Wind },
  { key: "heat" as const, label: "Heat", unit: "pK/s", icon: Flame },
  { key: "pressure" as const, label: "Pressure", unit: "nPa/s", icon: Gauge },
  { key: "biomass" as const, label: "Biomass", unit: "g/s", icon: Leaf },
]

function RateRow({
  hint,
  value,
  onChange,
  invalid,
  preview,
}: {
  hint: (typeof RATE_HINTS)[number]
  value: string
  onChange: (v: string) => void
  invalid: boolean
  preview: string | null
}) {
  const Icon = hint.icon
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={hint.key}
        className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
      >
        <span className="inline-flex items-center gap-2 text-foreground">
          <Icon className="size-3.5 text-[var(--hud-accent)]" aria-hidden />
          {hint.label}
        </span>
        <span className="ml-1.5 font-normal normal-case text-muted-foreground">
          ({hint.unit})
        </span>
      </Label>
      <Input
        id={hint.key}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        aria-invalid={invalid}
        className={cn(
          "font-mono text-sm",
          invalid && "border-destructive ring-destructive/30"
        )}
      />
      {preview ? (
        <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
          = {preview}/s
        </p>
      ) : null}
    </div>
  )
}

export function TiCalculator() {
  const [planet, setPlanet] = useState<PlanetId>("prime")
  const [oxygen, setOxygen] = useState("")
  const [heat, setHeat] = useState("")
  const [pressure, setPressure] = useState("")
  const [biomass, setBiomass] = useState("")
  const [currentStr, setCurrentStr] = useState("")
  const [targetStr, setTargetStr] = useState("")

  const parsed = useMemo(() => {
    const o = parseRateInput(oxygen)
    const h = parseRateInput(heat)
    const p = parseRateInput(pressure)
    const b = parseRateInput(biomass)
    const cur = parseCurrentTiInput(currentStr)
    const tgt = parseTiValue(targetStr)

    const ratesOk =
      o.ok &&
      h.ok &&
      p.ok &&
      b.ok &&
      o.value >= 0 &&
      h.value >= 0 &&
      p.value >= 0 &&
      b.value >= 0
    const tiOk = cur.ok && tgt.ok

    const totalRate =
      ratesOk ? o.value + h.value + p.value + b.value : Number.NaN

    const orderOk = tiOk && tgt.value > cur.value
    const canCompute =
      ratesOk && tiOk && orderOk && totalRate > 0 && Number.isFinite(totalRate)

    const bothTiBlank = currentStr.trim() === "" && targetStr.trim() === ""
    const targetBlank = targetStr.trim() === ""
    const currentFilled = currentStr.trim() !== ""

    const showAllStagesFromZero =
      ratesOk &&
      bothTiBlank &&
      totalRate > 0 &&
      Number.isFinite(totalRate)

    const showAllStagesFromCurrent =
      ratesOk &&
      targetBlank &&
      currentFilled &&
      cur.ok &&
      totalRate > 0 &&
      Number.isFinite(totalRate)

    const invalid = {
      oxygen: oxygen.trim() !== "" && (!o.ok || o.value < 0),
      heat: heat.trim() !== "" && (!h.ok || h.value < 0),
      pressure: pressure.trim() !== "" && (!p.ok || p.value < 0),
      biomass: biomass.trim() !== "" && (!b.ok || b.value < 0),
      current: currentStr.trim() !== "" && !cur.ok,
      target: targetStr.trim() !== "" && !tgt.ok,
      order: tiOk && !orderOk,
    }

    let seconds = Number.POSITIVE_INFINITY
    if (canCompute) {
      seconds = calculateTimeSeconds(cur.value, tgt.value, totalRate)
    }

    const duration = formatDuration(seconds)
    const timeline = showAllStagesFromZero
      ? buildAllStagesTimeline(planet, totalRate)
      : showAllStagesFromCurrent
        ? buildAllStagesTimelineFromCurrent(planet, cur.value, totalRate)
        : canCompute && ratesOk
          ? buildTimeline(planet, cur.value, tgt.value, totalRate)
          : []

    const remainingFormatted =
      tiOk && orderOk ? formatTiValue(tgt.value - cur.value) : null

    return {
      o,
      h,
      p,
      b,
      cur,
      tgt,
      ratesOk,
      tiOk,
      totalRate,
      orderOk,
      canCompute,
      invalid,
      seconds,
      duration,
      timeline,
      remainingFormatted,
    }
  }, [
    planet,
    oxygen,
    heat,
    pressure,
    biomass,
    currentStr,
    targetStr,
  ])

  const setters = {
    oxygen: setOxygen,
    heat: setHeat,
    pressure: setPressure,
    biomass: setBiomass,
  }

  const values = { oxygen, heat, pressure, biomass }

  return (
    <div className="relative min-h-svh bg-background px-4 py-8 scanline-overlay">
      <div className="mx-auto max-w-3xl">
        <Card
          className={cn(
            "border-2 border-[var(--hud-accent)]/30 bg-card/95 shadow-[0_0_40px_-12px_var(--hud-accent-glow)] ring-1 ring-[var(--hud-accent)]/20"
          )}
        >
          <CardHeader className="border-b border-border/80 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--hud-accent)]/40 bg-[var(--hud-accent)]/10">
                  <Globe className="size-5 text-[var(--hud-accent)]" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h1 className="font-mono text-sm font-semibold leading-tight tracking-[0.2em] text-[var(--hud-accent)] uppercase">
                    Terraformation
                  </h1>
                  <p className="mt-0.5 inline-flex items-center gap-2 font-mono text-xs leading-tight text-muted-foreground">
                    Time-to-target calculator · unofficial fan tool
                    <a
                      href={GITHUB_PROFILE_URL}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="transition-colors hover:text-[var(--hud-accent)]"
                    >
                      <GitFork className="size-3" aria-hidden />
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:items-end">
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  Environment
                </span>
                <Select
                  value={planet}
                  onValueChange={(v) => setPlanet(v as PlanetId)}
                >
                  <SelectTrigger className="w-full min-w-[200px] font-mono text-xs sm:w-auto">
                    <SelectValue placeholder="Planet" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLANET_LABELS) as PlanetId[]).map((id) => (
                      <SelectItem key={id} value={id} className="font-mono text-xs">
                        {PLANET_LABELS[id]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Production rates
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {RATE_HINTS.map((hint) => {
                    const raw = parseRateInput(values[hint.key])
                    const preview =
                      raw.ok && raw.value >= 0 ? formatTiValue(raw.value) : null
                    return (
                      <RateRow
                        key={hint.key}
                        hint={hint}
                        value={values[hint.key]}
                        onChange={setters[hint.key]}
                        invalid={parsed.invalid[hint.key]}
                        preview={preview}
                      />
                    )
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-4 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Index & target
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="current-ti"
                      className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
                    >
                      Current Ti
                    </Label>
                    <Input
                      id="current-ti"
                      value={currentStr}
                      onChange={(e) => setCurrentStr(e.target.value)}
                      placeholder="e.g. 350k or 350 kTi"
                      aria-invalid={parsed.invalid.current || parsed.invalid.order}
                      className={cn(
                        "font-mono text-sm",
                        (parsed.invalid.current || parsed.invalid.order) &&
                          "border-destructive ring-destructive/30"
                      )}
                    />
                    {parsed.cur.ok ? (
                      <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        = {formatTiValue(parsed.cur.value)}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="target-ti"
                      className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
                    >
                      Target Ti
                    </Label>
                    <Input
                      id="target-ti"
                      value={targetStr}
                      onChange={(e) => setTargetStr(e.target.value)}
                      placeholder="e.g. 2G or 2 GTi"
                      aria-invalid={parsed.invalid.target || parsed.invalid.order}
                      className={cn(
                        "font-mono text-sm",
                        (parsed.invalid.target || parsed.invalid.order) &&
                          "border-destructive ring-destructive/30"
                      )}
                    />
                    {parsed.tgt.ok ? (
                      <p className="font-mono text-[10px] text-muted-foreground tabular-nums">
                        = {formatTiValue(parsed.tgt.value)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Separator className="my-6 bg-gradient-to-r from-transparent via-border to-transparent" />

                <dl className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Total rate</dt>
                    <dd className="glow-text tabular-nums text-[var(--hud-accent)]">
                      {parsed.ratesOk && parsed.totalRate >= 0
                        ? formatTiRate(parsed.totalRate)
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Remaining</dt>
                    <dd className="tabular-nums text-foreground">
                      {parsed.remainingFormatted ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-[var(--hud-accent)]/25 to-transparent" />

            <div className="text-center">
              <p className="mb-2 font-mono text-[10px] tracking-[0.35em] text-muted-foreground uppercase">
                Time to target
              </p>
              {parsed.invalid.order && parsed.tiOk ? (
                <p className="text-sm text-destructive">
                  Target Ti must be greater than current Ti.
                </p>
              ) : parsed.ratesOk && parsed.totalRate <= 0 && parsed.orderOk ? (
                <p className="font-mono text-sm text-muted-foreground">
                  Add production (total rate &gt; 0) to estimate time.
                </p>
              ) : parsed.canCompute ? (
                <p
                  className="glow-text font-mono text-2xl font-semibold tracking-tight text-[var(--hud-accent)] sm:text-3xl tabular-nums"
                  aria-live="polite"
                >
                  {formatDurationLabel(parsed.duration)}
                </p>
              ) : (
                <p className="font-mono text-lg text-muted-foreground tabular-nums">
                  — — —
                </p>
              )}
            </div>

            {parsed.timeline.length > 0 ? (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                <div>
                  <h2 className="mb-3 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                    Stages you&apos;ll pass
                  </h2>
                  <ul className="space-y-2 font-mono text-xs">
                    {parsed.timeline.map((row, i) => {
                      if (row.kind === "reached") {
                        return (
                          <li
                            key={`r-${row.stage.threshold}-${i}`}
                            className="flex flex-wrap items-baseline justify-between gap-2 border-l-2 border-[var(--hud-accent)]/40 pl-3 text-muted-foreground"
                          >
                            <span>
                              <span className="text-[var(--hud-accent)]">●</span>{" "}
                              {row.stage.name}
                            </span>
                            <span className="tabular-nums">
                              {formatTiValue(row.stage.threshold)} · reached
                            </span>
                          </li>
                        )
                      }
                      if (row.kind === "upcoming") {
                        return (
                          <li
                            key={`u-${row.stage.threshold}-${i}`}
                            className={cn(
                              "flex flex-wrap items-baseline justify-between gap-2 border-l-2 pl-3",
                              row.isTarget
                                ? "border-[var(--hud-accent)] bg-[var(--hud-accent)]/8 py-1.5"
                                : "border-border"
                            )}
                          >
                            <span>
                              <span className="text-muted-foreground">○</span>{" "}
                              {row.stage.name}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {formatTiValue(row.stage.threshold)}
                              {row.isTarget ? (
                                <span className="ml-2 font-medium text-[var(--hud-accent)]">
                                  TARGET
                                </span>
                              ) : (
                                <span className="ml-2">
                                  in {formatDurationLabel(formatDuration(row.seconds))}
                                </span>
                              )}
                            </span>
                          </li>
                        )
                      }
                      return (
                        <li
                          key={`c-${row.threshold}-${i}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-l-2 border-[var(--hud-accent)] bg-[var(--hud-accent)]/8 py-1.5 pl-3"
                        >
                          <span>
                            <span className="text-[var(--hud-accent)]">◉</span> Custom
                            target
                          </span>
                          <span className="tabular-nums font-medium text-[var(--hud-accent)]">
                            {formatTiValue(row.threshold)} · TARGET
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            ) : null}

            <p className="text-center font-mono text-[10px] leading-relaxed text-muted-foreground">
              Ti is the sum of oxygen, heat, pressure and biomass. Rates add the same way.
              Stage thresholds from the{" "}
              <a
                href="https://planet-crafter.fandom.com/wiki/Terraformation_Stages"
                className="text-[var(--hud-accent)] underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                wiki
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground">
          Press <kbd className="rounded border border-border px-1 py-0.5">d</kbd> for
          theme
        </p>
      </div>
    </div>
  )
}

export default TiCalculator

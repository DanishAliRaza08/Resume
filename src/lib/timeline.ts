// Timeline engine (spec §6.3): unique-interval experience totals, overlap/gap detection,
// default five-project allocation and anachronism warnings. All dates are date-only (UTC).

export interface Interval {
  start: Date;
  end: Date | null; // null = ongoing
  label?: string;
  concurrent?: boolean; // explicitly marked concurrent/part-time assignment
}

export interface TimelineWarning {
  code: "OVERLAP" | "GAP" | "INVALID_RANGE" | "FUTURE_DATE" | "ANACHRONISM" | "OUTSIDE_EMPLOYMENT" | "INSUFFICIENT_HISTORY";
  severity: "info" | "warning" | "critical";
  message: string;
}

const DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30.436875;

export function toDate(value: string | Date): Date {
  if (value instanceof Date) return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value);
  if (!m) throw new Error(`Invalid date: ${value}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1));
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function today(): Date {
  return toDate(new Date());
}

function endOf(interval: Interval, asOf: Date): Date {
  return interval.end ?? asOf;
}

/** Merge overlapping/adjacent intervals so overlapping time is never counted twice. */
export function mergeIntervals(intervals: Interval[], asOf: Date = today()): { start: Date; end: Date }[] {
  const sorted = intervals
    .map((i) => ({ start: i.start, end: endOf(i, asOf) }))
    .filter((i) => i.end.getTime() >= i.start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [];
  for (const cur of sorted) {
    const last = merged[merged.length - 1];
    if (last && cur.start.getTime() <= last.end.getTime() + DAY) {
      if (cur.end.getTime() > last.end.getTime()) last.end = cur.end;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

export function intervalMonths(start: Date, end: Date): number {
  return Math.max(0, Math.round(((end.getTime() - start.getTime()) / DAY + 1) / DAYS_PER_MONTH));
}

/** Total experience in months from unique (merged) employment intervals. */
export function totalExperienceMonths(intervals: Interval[], asOf: Date = today()): number {
  return mergeIntervals(intervals, asOf).reduce((sum, i) => sum + intervalMonths(i.start, i.end), 0);
}

export function formatYears(months: number): string {
  const years = Math.floor(months / 12);
  return `${years}+`;
}

export function formatDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 mos";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatMonthYear(value: string | Date | null, presentLabel = "Current"): string {
  if (value === null) return presentLabel;
  const d = toDate(value);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonthYear(start)} – ${formatMonthYear(end)}`;
}

/** Detect invalid ranges, overlaps (unless marked concurrent), gaps and future dates. */
export function analyzeTimeline(intervals: Interval[], asOf: Date = today(), gapThresholdMonths = 3): TimelineWarning[] {
  const warnings: TimelineWarning[] = [];
  for (const i of intervals) {
    if (i.end && i.end.getTime() < i.start.getTime()) {
      warnings.push({ code: "INVALID_RANGE", severity: "critical", message: `${i.label ?? "Interval"} ends before it starts.` });
    }
    if (i.start.getTime() > asOf.getTime() || (i.end && i.end.getTime() > asOf.getTime() + 31 * DAY)) {
      warnings.push({ code: "FUTURE_DATE", severity: "critical", message: `${i.label ?? "Interval"} contains a future date.` });
    }
  }
  const valid = intervals.filter((i) => !i.end || i.end.getTime() >= i.start.getTime());
  for (let a = 0; a < valid.length; a++) {
    for (let b = a + 1; b < valid.length; b++) {
      const x = valid[a];
      const y = valid[b];
      const start = Math.max(x.start.getTime(), y.start.getTime());
      const end = Math.min(endOf(x, asOf).getTime(), endOf(y, asOf).getTime());
      const days = (end - start) / DAY;
      if (days > 31) {
        const concurrent = x.concurrent || y.concurrent;
        warnings.push({
          code: "OVERLAP",
          severity: concurrent ? "info" : "warning",
          message: `${x.label ?? "Interval"} and ${y.label ?? "interval"} overlap by about ${Math.round(days / DAYS_PER_MONTH)} month(s)${
            concurrent ? " (marked concurrent)" : "; confirm they were concurrent or correct the dates"
          }. Overlapping time is counted once in total experience.`,
        });
      }
    }
  }
  const merged = mergeIntervals(valid, asOf);
  for (let k = 1; k < merged.length; k++) {
    const gap = intervalMonths(merged[k - 1].end, merged[k].start) - 1;
    if (gap >= gapThresholdMonths) {
      warnings.push({
        code: "GAP",
        severity: "info",
        message: `Gap of about ${gap} month(s) between ${isoDate(merged[k - 1].end)} and ${isoDate(merged[k].start)}. Gaps are allowed; do not fill them with invented work.`,
      });
    }
  }
  return warnings;
}

export interface ProposedRange {
  position: number; // 1 = most recent
  start: string;
  end: string | null;
  months: number;
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  return r;
}

/**
 * Default five-project allocation (spec §6.3): P1 = 2 years + `p1ExtraMonths` (1–4), P2 = 2 years,
 * P5 = 7 months, P3/P4 share the remainder. The allocation is bounded by the candidate's verified
 * career span and is a *proposal* — it never extends history to reach a target number of years.
 */
export function proposeProjectRanges(
  careerStart: Date,
  careerEnd: Date | null,
  opts: { p1ExtraMonths?: number; asOf?: Date } = {},
): { ranges: ProposedRange[]; warnings: TimelineWarning[] } {
  const asOf = opts.asOf ?? today();
  const extra = Math.min(4, Math.max(1, opts.p1ExtraMonths ?? 3));
  const end = careerEnd ?? asOf;
  const available = intervalMonths(careerStart, end);
  const warnings: TimelineWarning[] = [];
  const fixed = [24 + extra, 24, 0, 0, 7];
  const fixedTotal = fixed[0] + fixed[1] + fixed[4];
  let months: number[];
  if (available >= fixedTotal + 2) {
    const rest = available - fixedTotal;
    const p3 = Math.ceil(rest / 2);
    months = [fixed[0], fixed[1], p3, rest - p3, fixed[4]];
  } else {
    // Not enough verified history for the defaults: scale proportionally, never extend.
    const weights = [27, 24, 10, 10, 7];
    const wsum = weights.reduce((a, b) => a + b, 0);
    months = weights.map((w) => Math.max(1, Math.floor((w / wsum) * available)));
    warnings.push({
      code: "INSUFFICIENT_HISTORY",
      severity: "warning",
      message: `Verified history covers about ${available} month(s), less than the default five-project allocation (${fixedTotal + 2}+ months). Durations were scaled down; consider fewer projects rather than extending dates.`,
    });
  }
  const ranges: ProposedRange[] = [];
  let cursorEnd: Date | null = careerEnd; // most recent project ends at career end (null = current)
  let cursorEndDate = end;
  for (let p = 0; p < 5; p++) {
    const startDate = addMonths(new Date(Date.UTC(cursorEndDate.getUTCFullYear(), cursorEndDate.getUTCMonth(), 1)), -(months[p] - 1));
    const boundedStart = startDate.getTime() < careerStart.getTime() ? careerStart : startDate;
    ranges.push({ position: p + 1, start: isoDate(boundedStart), end: cursorEnd ? isoDate(cursorEnd) : null, months: months[p] });
    const prevEnd = new Date(boundedStart.getTime() - DAY);
    cursorEnd = prevEnd;
    cursorEndDate = prevEnd;
  }
  return { ranges, warnings };
}

/** Warn when a project predates a technology's general availability (when known). */
export function anachronismWarnings(
  projectLabel: string,
  projectStart: Date,
  projectEnd: Date | null,
  techs: { name: string; availableFrom: number | null | undefined }[],
): TimelineWarning[] {
  const endYear = (projectEnd ?? today()).getUTCFullYear();
  return techs
    .filter((t) => t.availableFrom && endYear < t.availableFrom)
    .map((t) => ({
      code: "ANACHRONISM" as const,
      severity: "warning" as const,
      message: `${projectLabel} (${projectStart.getUTCFullYear()}–${endYear}) lists ${t.name}, which was not generally available until ${t.availableFrom}.`,
    }));
}

/** Warn when a project falls outside every verified employment interval. */
export function outsideEmploymentWarnings(
  projectLabel: string,
  project: Interval,
  employments: Interval[],
  asOf: Date = today(),
): TimelineWarning[] {
  const ps = project.start.getTime();
  const pe = endOf(project, asOf).getTime();
  const covered = employments.some((e) => e.start.getTime() <= ps + 31 * DAY && endOf(e, asOf).getTime() >= pe - 31 * DAY);
  return covered
    ? []
    : [
        {
          code: "OUTSIDE_EMPLOYMENT",
          severity: "critical",
          message: `${projectLabel} dates are not contained within any verified employment record. Projects must sit inside the candidate's real work history.`,
        },
      ];
}

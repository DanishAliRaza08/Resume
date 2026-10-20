// Server-side access to the technology catalog and settings, with a short in-process cache.
import { Catalog } from "../text";
import { prisma } from "./db";

let cached: { at: number; catalog: Catalog; availability: Map<string, number | null> } | null = null;

export async function loadCatalog(): Promise<{ catalog: Catalog; availability: Map<string, number | null> }> {
  if (cached && Date.now() - cached.at < 60_000) return cached;
  const techs = await prisma.technology.findMany({ where: { lifecycle: { not: "RETIRED" } } });
  cached = {
    at: Date.now(),
    catalog: new Catalog(techs.map((t) => ({ id: t.id, canonicalName: t.canonicalName, aliases: t.aliases, category: t.category, availableFrom: t.availableFrom }))),
    availability: new Map(techs.map((t) => [t.canonicalName, t.availableFrom])),
  };
  return cached;
}

export function invalidateCatalog(): void {
  cached = null;
}

export const DEFAULT_SETTINGS = {
  retentionDays: 365,
  maxPages: 6,
  defaultPageTarget: 4,
  defaultProjectMode: "STANDARD",
  blockUnverifiedClientsOnApproval: false,
  aiEnabled: true,
};
export type Settings = typeof DEFAULT_SETTINGS;

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in DEFAULT_SETTINGS) out[r.key] = r.value;
  return out as Settings;
}

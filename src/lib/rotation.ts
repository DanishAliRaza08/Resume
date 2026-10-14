// Client rotation (spec §8.2, §20): rank eligible clients by domain/project-type/technology relevance,
// then prefer the least recently used. Only verified (or candidate-confirmed) clients are eligible;
// a client is never presented as an employer without the candidate's confirmation.

export interface RotationClient {
  id: string;
  name: string;
  domainKey: string;
  subdomain: string | null;
  market: string | null;
  verificationStatus: "UNVERIFIED" | "CANDIDATE_CONFIRMED" | "VERIFIED";
  active: boolean;
  isDemo: boolean;
  technologies: string[]; // verified technology associations
  usageCount: number;
  lastUsedAt: Date | null;
}

export interface RotationQuery {
  domainKey: string;
  subdomain?: string | null;
  market?: string | null;
  technologies?: string[];
  includeDemo?: boolean;
  limit?: number;
}

export interface RankedClient {
  client: RotationClient;
  relevance: number;
  reasons: string[];
}

export function rankClients(clients: RotationClient[], q: RotationQuery): RankedClient[] {
  const techs = new Set(q.technologies ?? []);
  return clients
    .filter((c) => c.active && c.verificationStatus !== "UNVERIFIED" && (q.includeDemo || !c.isDemo) && c.domainKey === q.domainKey)
    .map((c) => {
      const reasons: string[] = ["same domain"];
      let relevance = 1;
      if (q.subdomain && c.subdomain === q.subdomain) {
        relevance += 2;
        reasons.push("same project type");
      }
      if (q.market && c.market === q.market) {
        relevance += 0.5;
        reasons.push("same market");
      }
      const overlap = c.technologies.filter((t) => techs.has(t));
      if (overlap.length) {
        relevance += overlap.length;
        reasons.push(`verified tech: ${overlap.join(", ")}`);
      }
      return { client: c, relevance, reasons };
    })
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        (a.client.lastUsedAt?.getTime() ?? 0) - (b.client.lastUsedAt?.getTime() ?? 0) ||
        a.client.usageCount - b.client.usageCount ||
        a.client.name.localeCompare(b.client.name),
    )
    .slice(0, q.limit ?? 10);
}

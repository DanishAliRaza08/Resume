// Starter client library (spec §8.1): 100+ organization records across the five domains.
// All records are seeded as UNVERIFIED with NO technology associations. The library is a
// lookup aid only — a client never appears on a resume as an employer/engagement unless the
// candidate confirms the relationship, and unverified clients are blocked from approved exports.

import type { DomainKey } from "./domains";

export interface ClientSeed {
  name: string;
  domain: DomainKey;
  subdomain?: string;
  market: string;
}

function many(domain: DomainKey, subdomain: string | undefined, market: string, names: string[]): ClientSeed[] {
  return names.map((name) => ({ name, domain, subdomain, market }));
}

export const CLIENTS: ClientSeed[] = [
  ...many("BANKING", "Commercial Lending", "US", [
    "Arvest Bank", "First Merchants Corporation", "OceanFirst Bank", "Regions Financial", "KeyBank",
    "Huntington National Bank", "Fifth Third Bank", "M&T Bank", "Citizens Financial Group", "Truist",
  ]),
  ...many("BANKING", "Capital Markets", "US", [
    "Goldman Sachs", "Morgan Stanley", "JPMorgan Chase", "Citigroup", "Bank of America",
    "State Street", "BNY Mellon", "Charles Schwab", "Raymond James", "Northern Trust",
  ]),
  ...many("BANKING", "Digital Banking", "US", [
    "Synchrony", "Capital One", "Discover Financial", "Ally Financial", "Stonebriar Mortgage",
    "U.S. Bank", "PNC Financial Services", "Wells Fargo", "American Express", "Navy Federal Credit Union",
  ]),
  ...many("RETAIL", "E-commerce", "US", [
    "Tapestry", "Neiman Marcus", "Victoria's Secret", "Nordstrom", "Macy's",
    "Kohl's", "Gap Inc.", "Williams-Sonoma", "Best Buy", "Wayfair",
  ]),
  ...many("RETAIL", "Inventory Management", "US", [
    "Ingles Markets", "Amway", "Target", "Walmart", "Kroger",
    "Albertsons", "Dollar General", "Home Depot", "Lowe's", "Costco",
    "Walgreens", "CVS Retail", "Publix",
  ]),
  ...many("HEALTHCARE", "EHR/EMR", "US", [
    "Wildflower Health", "Edward-Elmhurst Health", "Flatiron Health", "Cityblock Health", "Mayo Clinic",
    "Cleveland Clinic", "Kaiser Permanente", "Intermountain Health", "Northwell Health", "Mount Sinai Health System",
  ]),
  ...many("HEALTHCARE", "Claims", "US", [
    "UnitedHealth Group", "Anthem (Elevance Health)", "Cigna", "Humana", "Aetna",
    "Centene", "Molina Healthcare", "Highmark Health", "Blue Cross Blue Shield of Michigan", "Elderplan",
  ]),
  ...many("PHARMA", "Clinical Trials", "US", [
    "Formation Bio", "Pfizer", "Merck & Co.", "Johnson & Johnson", "Bristol Myers Squibb",
    "Eli Lilly", "AbbVie", "Amgen", "Gilead Sciences", "Regeneron",
  ]),
  ...many("PHARMA", "Regulatory Submissions", "Global", [
    "Novartis", "Roche", "AstraZeneca", "GSK", "Sanofi",
    "Novo Nordisk", "Takeda", "Bayer", "Biogen", "Moderna",
  ]),
  ...many("PC_INSURANCE", "Policy Administration", "US", [
    "Erie Insurance Group", "Encova Mutual Insurance Group", "Arbella Insurance Group", "ProAssurance Group", "Travelers",
    "The Hartford", "Liberty Mutual", "Nationwide", "Progressive", "Allstate",
  ]),
  ...many("PC_INSURANCE", "Claims", "US", [
    "State Farm", "GEICO", "USAA", "Chubb", "American Family Insurance",
    "Auto-Owners Insurance", "Cincinnati Financial", "Selective Insurance", "Hanover Insurance Group", "W. R. Berkley",
  ]),
];

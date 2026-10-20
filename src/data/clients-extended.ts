// Extended client library: 500+ additional well-known organizations so users can simply pick a
// client. Names only — no claims about any organization's technology. Grouped by domain/subdomain.

import type { ClientSeed } from "./clients";

const g = (domain: ClientSeed["domain"], subdomain: string, market: string, names: string[]): ClientSeed[] =>
  names.map((name) => ({ name, domain, subdomain, market }));

export const EXTENDED_CLIENTS: ClientSeed[] = [
  // ------------------------------------------------------------------ Banking (≈110)
  ...g("BANKING", "Commercial Lending", "US", [
    "Comerica", "Zions Bancorporation", "First Horizon", "Webster Bank", "Synovus", "BOK Financial", "Associated Bank",
    "Cullen/Frost Bankers", "Prosperity Bank", "Old National Bank", "Valley National Bank", "Wintrust Financial",
    "Pinnacle Financial Partners", "Cadence Bank", "Hancock Whitney", "UMB Financial", "Commerce Bancshares",
    "Western Alliance Bancorporation", "East West Bank", "Cathay Bank", "Fulton Financial", "Umpqua Bank",
    "Columbia Banking System", "Glacier Bancorp", "First Interstate BancSystem", "Simmons Bank", "BankUnited",
    "Texas Capital Bank", "First Citizens BancShares", "Bank OZK", "Atlantic Union Bank", "United Community Banks",
    "Trustmark", "Renasant Bank", "Independent Bank", "Banner Bank", "WesBanco", "F.N.B. Corporation",
    "Eastern Bank", "Customers Bank", "Provident Bank", "Sandy Spring Bank", "TowneBank", "Ameris Bank",
  ]),
  ...g("BANKING", "Capital Markets", "Global", [
    "Barclays", "HSBC", "Deutsche Bank", "UBS", "BNP Paribas", "Societe Generale", "Credit Agricole", "Santander",
    "BBVA", "ING Group", "Nomura", "Mizuho Financial Group", "MUFG", "Sumitomo Mitsui Banking Corporation",
    "Royal Bank of Canada", "TD Bank", "Bank of Montreal", "Scotiabank", "CIBC", "Standard Chartered",
    "Jefferies", "Lazard", "Evercore", "Piper Sandler", "Stifel", "BlackRock", "Vanguard", "Fidelity Investments",
    "T. Rowe Price", "Invesco", "Franklin Templeton", "Nasdaq", "Intercontinental Exchange", "CME Group",
    "Cboe Global Markets", "DTCC", "LPL Financial", "Ameriprise Financial", "Edward Jones", "Interactive Brokers",
  ]),
  ...g("BANKING", "Payments", "US", [
    "Visa", "Mastercard", "PayPal", "Block (Square)", "Stripe", "Fiserv", "FIS", "Global Payments", "Jack Henry",
    "Western Union", "MoneyGram", "Zelle (Early Warning Services)", "Chime", "SoFi", "Marqeta", "Affirm",
    "Green Dot", "Varo Bank", "Synchrony Financial", "Citizens Bank", "Huntington Bancshares", "Santander US",
    "Barclays US Consumer Bank", "Goldman Sachs Marcus", "Navy Federal", "PenFed Credit Union", "Alliant Credit Union",
    "BECU", "SchoolsFirst Federal Credit Union", "Golden 1 Credit Union",
  ]),

  // ------------------------------------------------------------------ Retail (≈110)
  ...g("RETAIL", "E-commerce", "US", [
    "Amazon", "eBay", "Etsy", "Chewy", "Overstock", "Zappos", "QVC", "HSN", "Newegg", "Poshmark", "ThredUp",
    "Stitch Fix", "Revolve", "Warby Parker", "Allbirds", "Bonobos", "J.Crew", "Abercrombie & Fitch",
    "American Eagle Outfitters", "Urban Outfitters", "Anthropologie", "Lululemon", "Nike", "Adidas", "Under Armour",
    "Levi Strauss & Co.", "Ralph Lauren", "PVH", "Tapestry Inc.", "Capri Holdings", "Foot Locker", "Dick's Sporting Goods",
    "REI", "Bath & Body Works", "Ulta Beauty", "Sephora", "Saks Fifth Avenue", "Bloomingdale's", "Dillard's", "Belk",
  ]),
  ...g("RETAIL", "Inventory Management", "US", [
    "Lowe's Companies", "Menards", "Ace Hardware", "Tractor Supply", "AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts",
    "Bed Bath & Beyond", "Big Lots", "Burlington", "Ross Stores", "TJX Companies", "Marshalls", "HomeGoods",
    "Five Below", "Dollar Tree", "Family Dollar", "Ollie's Bargain Outlet", "BJ's Wholesale Club", "Sam's Club",
    "Aldi US", "Lidl US", "Trader Joe's", "Whole Foods Market", "H-E-B", "Meijer", "Hy-Vee", "Wegmans", "Giant Eagle",
    "Safeway", "Food Lion", "Stop & Shop", "Sprouts Farmers Market", "Winn-Dixie", "Rite Aid",
  ]),
  ...g("RETAIL", "Merchandising", "US", [
    "Williams Sonoma Inc.", "Crate & Barrel", "Pottery Barn", "IKEA US", "Ashley Furniture", "RH", "Michaels",
    "Hobby Lobby", "JOANN", "Petco", "PetSmart", "GameStop", "Barnes & Noble", "Staples", "Office Depot",
    "Academy Sports + Outdoors", "Bass Pro Shops", "Cabela's", "L.L.Bean", "Lands' End", "Gap", "Old Navy",
    "Banana Republic", "H&M US", "Zara USA", "Uniqlo USA", "Express", "Chico's", "Torrid", "Carter's",
    "The Children's Place", "Skechers", "Crocs", "Columbia Sportswear", "VF Corporation",
  ]),

  // ------------------------------------------------------------------ Healthcare (≈105)
  ...g("HEALTHCARE", "EHR/EMR", "US", [
    "HCA Healthcare", "CommonSpirit Health", "Ascension", "Trinity Health", "Providence", "AdventHealth", "Advocate Health",
    "Atrium Health", "Baylor Scott & White Health", "Banner Health", "Sutter Health", "Mass General Brigham",
    "NYU Langone Health", "Johns Hopkins Medicine", "Penn Medicine", "Yale New Haven Health", "UCSF Health",
    "Stanford Health Care", "Cedars-Sinai", "UCLA Health", "Duke Health", "Vanderbilt University Medical Center",
    "Houston Methodist", "MD Anderson Cancer Center", "Memorial Sloan Kettering", "Mayo Clinic Health System",
    "Geisinger", "Ochsner Health", "Henry Ford Health", "Corewell Health", "Sanford Health", "Allina Health",
    "Fairview Health Services", "Novant Health", "Prisma Health", "Tenet Healthcare", "Community Health Systems",
    "Universal Health Services", "LifePoint Health", "Atlantic Health System", "RWJBarnabas Health",
    "Hackensack Meridian Health", "Montefiore", "Northwestern Medicine", "Rush University Medical Center",
  ]),
  ...g("HEALTHCARE", "Claims", "US", [
    "CVS Health", "Optum", "Elevance Health", "Centene Corporation", "Blue Shield of California", "Florida Blue",
    "Blue Cross Blue Shield of Texas", "Blue Cross Blue Shield of Illinois", "Independence Blue Cross", "Horizon BCBSNJ",
    "CareFirst BlueCross BlueShield", "Premera Blue Cross", "Regence", "Excellus BCBS", "Capital Blue Cross",
    "Health Care Service Corporation", "WellCare", "Oscar Health", "Bright Health", "Clover Health", "Devoted Health",
    "Alignment Health", "EmblemHealth", "Healthfirst", "Fidelis Care", "Tufts Health Plan", "Harvard Pilgrim Health Care",
    "Point32Health", "Priority Health", "Medica", "UCare", "SelectHealth", "Kaiser Foundation Health Plan",
    "Magellan Health", "Evernorth",
  ]),
  ...g("HEALTHCARE", "Interoperability", "US", [
    "Epic Systems", "Oracle Health", "athenahealth Inc.", "eClinicalWorks", "NextGen Healthcare", "Veradigm",
    "Change Healthcare", "Availity", "Waystar", "R1 RCM", "Cotiviti", "Inovalon", "Health Catalyst", "Innovaccer",
    "Teladoc Health", "Amwell", "Hims & Hers", "One Medical", "Oak Street Health", "VillageMD", "Carbon Health",
    "Included Health", "Omada Health", "Livongo",
  ]),

  // ------------------------------------------------------------------ Pharma (≈105)
  ...g("PHARMA", "Clinical Trials", "Global", [
    "IQVIA", "ICON plc", "Parexel", "Syneos Health", "Medpace", "PPD (Thermo Fisher)", "Labcorp Drug Development",
    "Charles River Laboratories", "WCG Clinical", "PSI CRO", "Worldwide Clinical Trials", "Premier Research",
    "Novotech", "Fortrea", "Veeva Systems", "Medidata Solutions", "Oracle Life Sciences", "Signant Health",
    "Clario", "Advarra",
  ]),
  ...g("PHARMA", "Regulatory Submissions", "Global", [
    "Boehringer Ingelheim", "Merck KGaA", "Teva Pharmaceuticals", "Viatris", "Sandoz", "Astellas Pharma",
    "Daiichi Sankyo", "Eisai", "Otsuka", "Chugai Pharmaceutical", "Novo Nordisk Inc.", "Lundbeck", "UCB",
    "Ipsen", "Servier", "Grifols", "CSL Behring", "Bausch Health", "Organon", "Zoetis", "Elanco",
    "Jazz Pharmaceuticals", "Alkermes", "Horizon Therapeutics", "Endo International", "Mallinckrodt",
    "Perrigo", "Hikma Pharmaceuticals", "Dr. Reddy's Laboratories", "Sun Pharmaceutical", "Cipla", "Lupin",
    "Aurobindo Pharma", "Zydus Lifesciences", "Glenmark Pharmaceuticals",
  ]),
  ...g("PHARMA", "Laboratory (LIMS)", "Global", [
    "Vertex Pharmaceuticals", "Alnylam Pharmaceuticals", "BioMarin", "Incyte", "Seagen", "Exelixis", "Neurocrine Biosciences",
    "Sarepta Therapeutics", "Ultragenyx", "BeiGene", "Argenx", "Genmab", "BioNTech", "CureVac", "Novavax",
    "Illumina", "Thermo Fisher Scientific", "Danaher", "Agilent Technologies", "Waters Corporation", "PerkinElmer",
    "Bio-Rad Laboratories", "Sartorius", "Lonza", "Catalent", "Samsung Biologics", "WuXi AppTec", "Fujifilm Diosynth",
    "Abbott Laboratories", "Baxter International", "Becton Dickinson", "Medtronic", "Stryker", "Boston Scientific",
    "Zimmer Biomet", "Edwards Lifesciences", "Intuitive Surgical", "GE HealthCare", "Siemens Healthineers",
    "Philips Healthcare", "Hologic", "Dexcom", "Insulet", "ResMed", "Cardinal Health", "McKesson", "Cencora",
  ]),

  // ------------------------------------------------------------------ P&C Insurance (≈110)
  ...g("PC_INSURANCE", "Policy Administration", "US", [
    "Farmers Insurance", "Zurich North America", "AIG", "CNA Financial", "Markel", "Arch Capital", "Everest Group",
    "Hiscox", "Beazley", "Lloyd's of London", "Allianz", "AXA XL", "Tokio Marine HCC", "Sompo International",
    "Munich Re", "Swiss Re", "Hannover Re", "RenaissanceRe", "Fairfax Financial", "Intact Financial",
    "Definity Financial", "Kemper", "Mercury Insurance", "Safety Insurance", "Horace Mann", "Donegal Insurance Group",
    "Westfield Insurance", "Grange Insurance", "Frankenmuth Insurance", "Pekin Insurance", "Shelter Insurance",
    "COUNTRY Financial", "Farm Bureau Financial Services", "Nationwide Mutual", "Sentry Insurance",
    "Church Mutual", "Main Street America Insurance", "Plymouth Rock Assurance", "NJM Insurance Group",
    "MAPFRE USA", "Hanover Insurance", "Utica National Insurance Group", "Central Insurance", "Acuity Insurance",
  ]),
  ...g("PC_INSURANCE", "Claims", "US", [
    "Allstate Insurance", "Progressive Insurance", "Liberty Mutual Insurance", "Travelers Insurance", "The Hartford Financial",
    "Erie Indemnity", "Amica Mutual", "Auto Club Group (AAA)", "CSAA Insurance Group", "Wawanesa Insurance",
    "Lemonade", "Root Insurance", "Hippo Insurance", "Kin Insurance", "Clearcover", "Next Insurance", "Pie Insurance",
    "Openly", "Branch Insurance", "Sedgwick", "Crawford & Company", "Gallagher Bassett", "CCC Intelligent Solutions",
    "Verisk", "Solera", "Mitchell International", "Copart", "Insurance Auto Auctions", "LexisNexis Risk Solutions",
    "ISO (Verisk)",
  ]),
  ...g("PC_INSURANCE", "Broker Portals", "US", [
    "Marsh McLennan", "Aon", "Willis Towers Watson", "Arthur J. Gallagher", "Brown & Brown", "Lockton", "USI Insurance Services",
    "HUB International", "Acrisure", "AssuredPartners", "NFP", "Alliant Insurance Services", "BroadStreet Partners",
    "Risk Strategies", "Amwins", "CRC Group", "RT Specialty", "Ryan Specialty", "Applied Systems", "Vertafore",
    "Guidewire Software", "Duck Creek Technologies", "Majesco Inc.", "Insurity Inc.", "EIS Group", "Socotra",
    "Sapiens International", "Zywave", "Bold Penguin", "Coalition",
  ]),
];

import type { Asset, AssetType, KpiAsset } from './types';

/**
 * Mock catalogue + read helpers.
 *
 * In production this module would be replaced by API calls (and search would
 * move server-side), but keeping every read behind these helpers means the UI
 * components don't need to change when that happens.
 */

/** Display copy for each asset type, used by badges, section headings and tabs. */
export const ASSET_TYPE_META: Record<AssetType, { label: string; plural: string; blurb: string }> = {
  kpi: { label: 'KPI', plural: 'KPIs', blurb: 'Calculations based on selected data' },
  layout: { label: 'Layout', plural: 'Layouts', blurb: 'Dashboards of visuals and charts' },
  dataviz: { label: 'Data viz', plural: 'Data viz', blurb: 'Visual representations of data' },
  storyboard: { label: 'Storyboard', plural: 'Storyboards', blurb: 'Presentation-ready chart decks' },
};

/** Subsidiaries of the company. Used for "affiliate applicability". */
export const AFFILIATES = ['Aurora Foods', 'Bluefin Logistics', 'Cedar Health', 'Delta Media'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = (values: number[], labels = MONTHS) =>
  values.map((value, i) => ({ label: labels[i], value }));

export const ASSETS: Asset[] = [
  // ---------------------------------------------------------------- KPIs
  {
    id: 'kpi-share-of-voice',
    type: 'kpi',
    name: 'Share of Voice',
    subtitle: 'Brand mentions vs. competitor set',
    description:
      'Percentage of all category media mentions that reference our brands, across earned and owned channels.',
    tags: ['comms', 'coverage'],
    scope: 'Universal',
    usageCount: 1832,
    updatedAt: '2024-06-27',
    featured: true,
    trendingScore: 88,
    metricIds: ['MET-2041', 'MET-2042'],
    calculation: 'brand_mentions / (brand_mentions + competitor_mentions) × 100',
    unit: '%',
    trend: series([31, 33, 32, 35, 37, 36]),
    visualIds: ['viz-coverage-by-channel', 'viz-sentiment-trend'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'Are we gaining ground?', description: 'Month-over-month change in our share of the category conversation.' },
      { title: 'Which channels drive visibility?', description: 'Break share of voice down by earned, owned and social.' },
      { title: 'Did the last launch move the needle?', description: 'Compare the 30 days before and after a launch.' },
      { title: 'Where is a competitor outpacing us?', description: 'Spot markets where a rival is taking share.' },
    ],
  },
  {
    id: 'kpi-media-coverage',
    type: 'kpi',
    name: 'Media Coverage Score',
    subtitle: 'Weighted reach of earned media',
    description:
      'Reach of earned coverage weighted by outlet tier and sentiment, so one top-tier feature counts for more than ten blog mentions.',
    tags: ['coverage', 'comms'],
    scope: 'Universal',
    usageCount: 2210,
    updatedAt: '2024-07-02',
    trendingScore: 92,
    metricIds: ['MET-1107', 'MET-1108', 'MET-1112'],
    calculation: 'Σ (article_reach × outlet_tier_weight × sentiment_modifier)',
    unit: ' pts',
    trend: series([62, 58, 66, 71, 69, 75]),
    visualIds: ['viz-coverage-by-channel', 'viz-affiliate-comparison'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'Is our coverage improving in quality?', description: 'Track the score against raw article volume.' },
      { title: 'Which outlets matter most?', description: 'See which tiers contribute most of the score.' },
      { title: 'How did a story land?', description: 'Measure coverage for a single announcement.' },
    ],
  },
  {
    id: 'kpi-stakeholder-sentiment',
    type: 'kpi',
    name: 'Stakeholder Sentiment',
    subtitle: 'Net sentiment across key stakeholder groups',
    description:
      'Net positive minus negative mentions from investors, regulators, partners and employees, normalised to a 100-point scale.',
    tags: ['stakeholders', 'sentiment'],
    scope: 'Universal',
    usageCount: 1460,
    updatedAt: '2024-06-18',
    trendingScore: 74,
    metricIds: ['MET-3301'],
    calculation: '(positive_mentions − negative_mentions) / total_mentions × 100',
    unit: ' pts',
    trend: series([21, 24, 19, 27, 30, 28]),
    visualIds: ['viz-sentiment-trend'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'How do stakeholders feel about us?', description: 'A single, comparable sentiment number per group.' },
      { title: 'Which group is souring?', description: 'Spot early drops before they become issues.' },
    ],
  },
  {
    id: 'kpi-distributor-reach',
    type: 'kpi',
    name: 'Distributor Reach',
    subtitle: 'Active distributors engaged per market',
    description:
      'Count of distributors who engaged with our materials in the last 30 days. Only tracked for affiliates with a distributor network.',
    tags: ['distributors', 'markets'],
    scope: 'Affiliate',
    usageCount: 640,
    updatedAt: '2024-05-30',
    trendingScore: 61,
    metricIds: ['MET-4410', 'MET-4411'],
    calculation: 'COUNT(DISTINCT distributor_id WHERE last_engagement ≤ 30 days)',
    unit: '',
    trend: series([118, 124, 131, 129, 142, 150]),
    visualIds: ['viz-affiliate-comparison'],
    affiliates: ['Aurora Foods', 'Bluefin Logistics'],
    businessQuestions: [
      { title: 'Are distributors adopting the new line?', description: 'Engagement after new-line materials are released.' },
      { title: 'Which markets need attention?', description: 'Find markets where reach is flat or falling.' },
    ],
  },
  {
    id: 'kpi-campaign-engagement',
    type: 'kpi',
    name: 'Campaign Engagement Rate',
    subtitle: 'Interactions per impression for active campaigns',
    description: 'Clicks, shares and comments as a percentage of impressions for every live campaign.',
    tags: ['campaigns', 'engagement'],
    scope: 'Universal',
    usageCount: 1975,
    updatedAt: '2024-07-10',
    trendingScore: 85,
    metricIds: ['MET-5120', 'MET-5121'],
    calculation: '(clicks + shares + comments) / impressions × 100',
    unit: '%',
    trend: series([2.1, 2.4, 2.2, 2.9, 3.1, 3.4]),
    visualIds: ['viz-engagement-trend', 'viz-sentiment-trend'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'Which creative is working?', description: 'Compare engagement across variants.' },
      { title: 'Are we reaching the right audience?', description: 'High impressions with low engagement is a targeting signal.' },
    ],
  },
  {
    id: 'kpi-message-pull-through',
    type: 'kpi',
    name: 'Message Pull-through',
    subtitle: 'Share of coverage carrying key messages',
    description: 'Percentage of articles that include at least one of the approved key messages for a campaign.',
    tags: ['comms', 'messaging'],
    scope: 'Affiliate',
    usageCount: 512,
    updatedAt: '2024-04-12',
    trendingScore: 48,
    metricIds: ['MET-2210'],
    calculation: 'articles_with_key_message / total_articles × 100',
    unit: '%',
    trend: series([44, 47, 45, 52, 55, 53]),
    visualIds: ['viz-coverage-by-channel'],
    affiliates: ['Cedar Health', 'Delta Media'],
    businessQuestions: [
      { title: 'Is our story getting through?', description: 'How often journalists repeat what we want said.' },
      { title: 'Which messages stick?', description: 'Rank key messages by pull-through.' },
    ],
  },

  // ------------------------------------------------------------ Data viz
  {
    id: 'viz-coverage-by-channel',
    type: 'dataviz',
    name: 'Coverage by Channel',
    subtitle: 'Earned media volume split by channel',
    description: 'Bar chart of article volume per channel. Works with any coverage KPI.',
    tags: ['coverage', 'channels'],
    scope: 'Universal',
    usageCount: 1290,
    updatedAt: '2024-06-27',
    featured: true,
    trendingScore: 79,
    chartType: 'bar',
    unit: '',
    data: series([120, 340, 90, 45, 410], ['Print', 'Online', 'Broadcast', 'Podcast', 'Social']),
    kpiIds: ['kpi-media-coverage', 'kpi-share-of-voice', 'kpi-message-pull-through'],
    dataSource: 'Media monitoring feed',
    refreshCadence: 'Daily',
    businessQuestions: [
      { title: 'Where is our coverage coming from?', description: 'Volume by channel for the selected period.' },
      { title: 'Are we over-reliant on one channel?', description: 'Check concentration risk at a glance.' },
    ],
  },
  {
    id: 'viz-sentiment-trend',
    type: 'dataviz',
    name: 'Sentiment Trend',
    subtitle: 'Rolling six-month sentiment line',
    description: 'Line chart for any sentiment or share KPI over time, with monthly granularity.',
    tags: ['sentiment', 'stakeholders'],
    scope: 'Universal',
    usageCount: 980,
    updatedAt: '2024-06-21',
    trendingScore: 70,
    chartType: 'line',
    unit: ' pts',
    data: series([21, 24, 19, 27, 30, 28]),
    kpiIds: ['kpi-stakeholder-sentiment', 'kpi-share-of-voice', 'kpi-campaign-engagement'],
    dataSource: 'Social listening + survey panel',
    refreshCadence: 'Weekly',
    businessQuestions: [
      { title: 'Is sentiment trending up?', description: 'Direction and momentum over six months.' },
      { title: 'When did it change?', description: 'Pinpoint the month a shift began.' },
    ],
  },
  {
    id: 'viz-affiliate-comparison',
    type: 'dataviz',
    name: 'Affiliate Comparison',
    subtitle: 'Side-by-side KPI performance by affiliate',
    description: 'Bar chart comparing a single KPI across affiliates for benchmarking.',
    tags: ['affiliates', 'benchmarking'],
    scope: 'Universal',
    usageCount: 755,
    updatedAt: '2024-05-14',
    trendingScore: 66,
    chartType: 'bar',
    unit: ' pts',
    data: series([82, 64, 91, 57], AFFILIATES),
    kpiIds: ['kpi-distributor-reach', 'kpi-media-coverage'],
    dataSource: 'Affiliate reporting warehouse',
    refreshCadence: 'Monthly',
    businessQuestions: [
      { title: 'Which affiliate leads?', description: 'Rank affiliates on the selected KPI.' },
      { title: 'Who needs support?', description: 'Find affiliates below the group average.' },
    ],
  },
  {
    id: 'viz-engagement-trend',
    type: 'dataviz',
    name: 'Engagement Over Time',
    subtitle: 'Monthly campaign engagement line',
    description: 'Line chart of engagement rate across active campaigns.',
    tags: ['campaigns', 'engagement'],
    scope: 'Universal',
    usageCount: 1102,
    updatedAt: '2024-07-08',
    trendingScore: 81,
    chartType: 'line',
    unit: '%',
    data: series([2.1, 2.4, 2.2, 2.9, 3.1, 3.4]),
    kpiIds: ['kpi-campaign-engagement'],
    dataSource: 'Campaign analytics',
    refreshCadence: 'Daily',
    businessQuestions: [
      { title: 'Is engagement improving?', description: 'Trend across all live campaigns.' },
      { title: 'Did the creative refresh help?', description: 'Compare before and after a change.' },
    ],
  },

  // -------------------------------------------------------------- Layouts
  {
    id: 'layout-intes',
    type: 'layout',
    name: 'INTES',
    subtitle: 'Integrated Stakeholder & Coverage Overview',
    description:
      'One view of earned coverage, stakeholder sentiment and distributor activity. Built for weekly comms stand-ups and local-market briefings.',
    tags: ['comms', 'coverage', 'stakeholders'],
    scope: 'Universal',
    usageCount: 2485,
    updatedAt: '2024-07-23',
    featured: true,
    trendingScore: 95,
    pageCount: 6,
    kpiIds: ['kpi-media-coverage', 'kpi-stakeholder-sentiment', 'kpi-distributor-reach', 'kpi-share-of-voice'],
    businessQuestions: [
      { title: 'How did we do this week?', description: 'Coverage, sentiment and reach on one page.' },
      { title: 'Which markets need a push?', description: 'Distributor reach by local market.' },
      { title: 'What are stakeholders saying?', description: 'Sentiment by stakeholder group with drill-down.' },
      { title: 'Are our messages landing?', description: 'Share of voice against the competitor set.' },
    ],
  },
  {
    id: 'layout-exec-summary',
    type: 'layout',
    name: 'Executive Summary',
    subtitle: 'Monthly leadership snapshot',
    description: 'Three-page snapshot of headline comms KPIs, built for monthly leadership reviews.',
    tags: ['leadership', 'monthly'],
    scope: 'Universal',
    usageCount: 1740,
    updatedAt: '2024-07-01',
    trendingScore: 83,
    pageCount: 3,
    kpiIds: ['kpi-share-of-voice', 'kpi-campaign-engagement'],
    businessQuestions: [
      { title: 'What should leadership know?', description: 'The three numbers that matter this month.' },
      { title: 'Are we on track?', description: 'Progress against quarterly targets.' },
    ],
  },
  {
    id: 'layout-affiliate-scorecard',
    type: 'layout',
    name: 'Affiliate Scorecard',
    subtitle: 'Performance benchmarks by subsidiary',
    description: 'Compares every affiliate on reach, coverage and messaging, with a page per affiliate.',
    tags: ['affiliates', 'benchmarking'],
    scope: 'Affiliate',
    usageCount: 860,
    updatedAt: '2024-06-05',
    trendingScore: 64,
    pageCount: 4,
    kpiIds: ['kpi-distributor-reach', 'kpi-message-pull-through', 'kpi-media-coverage'],
    businessQuestions: [
      { title: 'How do affiliates compare?', description: 'Side-by-side benchmarks.' },
      { title: 'Where should we invest?', description: 'Identify the biggest gaps to close.' },
    ],
  },
  {
    id: 'layout-campaign-tracker',
    type: 'layout',
    name: 'Campaign Tracker',
    subtitle: 'In-flight campaign health',
    description: 'Tracks every live campaign from launch to wrap-up: engagement, pull-through and spend pacing.',
    tags: ['campaigns', 'engagement'],
    scope: 'Universal',
    usageCount: 1320,
    updatedAt: '2024-07-15',
    trendingScore: 77,
    pageCount: 5,
    kpiIds: ['kpi-campaign-engagement', 'kpi-message-pull-through'],
    businessQuestions: [
      { title: 'Which campaigns are underperforming?', description: 'Flag campaigns below benchmark.' },
      { title: 'Is the message getting through?', description: 'Pull-through per campaign.' },
    ],
  },

  // ---------------------------------------------------------- Storyboards
  {
    id: 'sb-quarterly-review',
    type: 'storyboard',
    name: 'Quarterly Business Review',
    subtitle: 'QBR deck with coverage & sentiment narrative',
    description: 'A 12-slide QBR narrative that pairs headline KPIs with commentary placeholders.',
    tags: ['leadership', 'quarterly'],
    scope: 'Universal',
    usageCount: 940,
    updatedAt: '2024-07-05',
    trendingScore: 72,
    restricted: true,
    slideCount: 12,
    kpiIds: ['kpi-share-of-voice', 'kpi-stakeholder-sentiment', 'kpi-media-coverage'],
    filters: ['Period: Quarter to date', 'Region: All', 'Channel: Earned'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'What happened this quarter?', description: 'Headline results with context.' },
      { title: 'What is next quarter’s focus?', description: 'Priorities backed by the data.' },
    ],
  },
  {
    id: 'sb-distributor-pitch',
    type: 'storyboard',
    name: 'Distributor Pitch',
    subtitle: 'Evangelize new lines to local-market distributors',
    description:
      'Slides that show distributors the traction behind a new line, filtered to their local market.',
    tags: ['distributors', 'markets'],
    scope: 'Affiliate',
    usageCount: 610,
    updatedAt: '2024-06-27',
    featured: true,
    trendingScore: 68,
    slideCount: 8,
    kpiIds: ['kpi-distributor-reach', 'kpi-campaign-engagement'],
    filters: ['Market: Local', 'Period: Last 90 days'],
    affiliates: ['Aurora Foods', 'Bluefin Logistics'],
    businessQuestions: [
      { title: 'Why should a distributor carry this?', description: 'Demand signals for the new line.' },
      { title: 'How are peers performing?', description: 'Reach among comparable distributors.' },
    ],
  },
  {
    id: 'sb-board-update',
    type: 'storyboard',
    name: 'Board Update',
    subtitle: 'Reputation & risk summary for the board',
    description: 'Board-ready slides on reputation, stakeholder sentiment and emerging risks.',
    tags: ['leadership', 'risk'],
    scope: 'Universal',
    usageCount: 320,
    updatedAt: '2024-05-20',
    trendingScore: 55,
    restricted: true,
    slideCount: 10,
    kpiIds: ['kpi-stakeholder-sentiment', 'kpi-message-pull-through'],
    filters: ['Period: Fiscal year', 'Audience: Board'],
    affiliates: AFFILIATES,
    businessQuestions: [
      { title: 'Is our reputation at risk?', description: 'Sentiment shifts and emerging issues.' },
      { title: 'Are we telling a consistent story?', description: 'Message pull-through across affiliates.' },
    ],
  },
  {
    id: 'sb-launch-recap',
    type: 'storyboard',
    name: 'Launch Recap',
    subtitle: 'Post-launch performance story',
    description: 'Tells the story of a launch’s first 30 days, from coverage spike to engagement tail.',
    tags: ['campaigns', 'launch'],
    scope: 'Universal',
    usageCount: 705,
    updatedAt: '2024-06-11',
    trendingScore: 63,
    slideCount: 7,
    kpiIds: ['kpi-campaign-engagement', 'kpi-share-of-voice', 'kpi-media-coverage'],
    filters: ['Campaign: Spring launch', 'Period: Launch + 30 days'],
    affiliates: ['Cedar Health', 'Delta Media'],
    businessQuestions: [
      { title: 'Did the launch hit its goals?', description: 'Results against launch targets.' },
      { title: 'What should we repeat?', description: 'The tactics that drove the most engagement.' },
    ],
  },
];

const BY_ID = new Map(ASSETS.map((asset) => [asset.id, asset]));

export function getAssetById(id: string): Asset | undefined {
  return BY_ID.get(id);
}

/** Resolve a list of IDs, silently dropping any that no longer exist. */
export function getAssetsByIds(ids: string[]): Asset[] {
  return ids.map((id) => BY_ID.get(id)).filter((asset): asset is Asset => asset !== undefined);
}

export function getKpisByIds(ids: string[]): KpiAsset[] {
  return getAssetsByIds(ids).filter((asset): asset is KpiAsset => asset.type === 'kpi');
}

export const FEATURED_ASSETS = ASSETS.filter((asset) => asset.featured);

/** Most popular first. Featured assets are excluded so the landing view doesn't show the same card twice. */
export const TRENDING_ASSETS = ASSETS.filter((asset) => !asset.featured).sort(
  (a, b) => b.trendingScore - a.trendingScore,
);

/** All assets of one type, most-used first. */
export function getAssetsByType(type: AssetType): Asset[] {
  return ASSETS.filter((asset) => asset.type === type).sort((a, b) => b.usageCount - a.usageCount);
}

// ---------------------------------------------------------------- Search

/**
 * Pre-computed lowercase text per asset so search doesn't rebuild strings on
 * every keystroke. Includes the fields a user is likely to type: name,
 * descriptions, tags, type label and (for KPIs) metric IDs.
 */
const SEARCH_INDEX = new Map(
  ASSETS.map((asset) => {
    const parts = [
      asset.name,
      asset.subtitle,
      asset.description,
      ASSET_TYPE_META[asset.type].label,
      ...asset.tags,
      ...(asset.type === 'kpi' ? asset.metricIds : []),
    ];
    return [asset.id, parts.join(' ').toLowerCase()];
  }),
);

/**
 * Case-insensitive, multi-word search.
 *
 * - Every word must match somewhere (AND), so adding words narrows results.
 * - Name matches rank above matches in other fields; ties fall back to
 *   trending score so popular assets surface first.
 * - A leading `#` is ignored so `#comms` matches the `comms` tag.
 */
export function searchAssets(query: string, type?: AssetType): Asset[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/^#/, ''))
    .filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { asset: Asset; score: number }[] = [];
  for (const asset of ASSETS) {
    if (type && asset.type !== type) continue;
    const name = asset.name.toLowerCase();
    const haystack = SEARCH_INDEX.get(asset.id) ?? '';

    let score = 0;
    for (const term of terms) {
      if (name.includes(term)) score += 3;
      else if (haystack.includes(term)) score += 1;
      else {
        score = 0;
        break;
      }
    }
    if (score > 0) scored.push({ asset, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || b.asset.trendingScore - a.asset.trendingScore)
    .map(({ asset }) => asset);
}

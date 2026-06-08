import {
  payment,
  statsData,
  grossRevenue as staticGross,
  transactionSummary,
  activeUser as defaultActiveSeries
} from 'data/dashboard/saas';
import { totalSale as staticTotalSale } from 'data/dashboard/ecom';
import { users, files } from 'data/dashboard/default';
import logoPlaceholder from 'assets/img/logos/bs-5.png';

const sumSeries = arr =>
  (Array.isArray(arr) ? arr : []).reduce((a, x) => a + (Number(x) || 0), 0);

const formatMoney = v => {
  if (v == null || v === '') return '—';
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isFinite(n)) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(v);
};

export function mergeStatsCards(apiCards, defaults = statsData) {
  if (!Array.isArray(apiCards) || !apiCards.length) return defaults;
  return apiCards.map((a, i) => {
    const def = defaults[i] || defaults[defaults.length - 1] || {};
    if (!a || typeof a !== 'object') return def;
    return {
      ...def,
      title: a.title != null ? a.title : def.title,
      value: a.value != null ? Number(a.value) : def.value,
      decimal: a.decimal != null ? a.decimal : def.decimal,
      suffix: a.suffix != null ? a.suffix : def.suffix,
      prefix: a.prefix != null ? a.prefix : def.prefix,
      badgeBg: a.badgeBg != null ? a.badgeBg : def.badgeBg,
      badgeText: a.badgeText != null ? a.badgeText : def.badgeText,
      link: a.link != null ? a.link : def.link,
      linkText: a.linkText != null ? a.linkText : def.linkText
    };
  });
}

function mergeLinePayment(lp) {
  const fallback = payment;
  if (!lp || typeof lp !== 'object') {
    return {
      chart: fallback,
      title: 'Today SMS',
      subtitle: 'Yesterday',
      subtitleValue: '—'
    };
  }
  const hasSeries = Array.isArray(lp.all) && lp.all.length > 0;
  const chart = hasSeries
    ? {
        all: lp.all.map(n => Number(n) || 0),
        successful: (lp.successful || []).map(n => Number(n) || 0),
        labels: Array.isArray(lp.labels) && lp.labels.length ? lp.labels : undefined
      }
    : fallback;
  return {
    chart,
    title: 'SMS Volume (24h)',
    subtitle: '',
    subtitleValue: ''
  };
}

function normalizeGrossChart(apiGross) {
  const months = Object.keys(staticGross);
  const out = { ...staticGross };
  if (!apiGross || typeof apiGross !== 'object') return out;
  for (const m of months) {
    const row = apiGross[m];
    if (Array.isArray(row) && row.length) {
      out[m] = row.map(x => Number(x) || 0);
    }
  }
  return out;
}

function mapTopSidsToFiles(items) {
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((row, i) => ({
    id: row.id != null ? row.id : i + 1,
    name: row.name || 'SID',
    user: row.user || `${row.count ?? 0} SMS`,
    time: row.time || 'This month',
    img: row.img || logoPlaceholder,
    border: Boolean(row.border ?? i % 2 === 0)
  }));
}

const AVATAR_COLORS = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
const pickColor = i => AVATAR_COLORS[i % AVATAR_COLORS.length];

function mapTopCustomersToUsers(items) {
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((row, i) => {
    const name = row.name || 'Customer';
    return {
      id: row.id,
      name,
      role: '',
      avatar: { name, color: pickColor(i) }
    };
  });
}

function mapTopDestinations(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  return rows.map((row, i) => ({
    id: row.name != null ? String(row.name) : `d-${i}`,
    name: row.name != null ? String(row.name) : '—',
    role: '',
    avatar: {
      name: row.name != null ? String(row.name).slice(0, 2) : 'D',
      color: pickColor(i)
    }
  }));
}

function mapTopSidsToUsers(items) {
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((row, i) => ({
    id: row.id != null ? row.id : i + 1,
    name: String(row.name || 'SID'),
    role: '',
    avatar: {
      name: String(row.name || 'SI').slice(0, 2),
      color: pickColor(i)
    }
  }));
}

function mapRecentAgentsToUsers(items) {
  if (!Array.isArray(items) || !items.length) return [];
  const seen = new Set();
  return items
    .filter(row => {
      const key = String(row.id ?? row.name ?? '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row, i) => ({
      id: row.id != null ? row.id : row.name,
      name: String(row.name || 'Agent'),
      role: '',
      avatar: {
        name: String(row.name || 'AG').slice(0, 2),
        color: pickColor(i)
      }
    }));
}

export function buildGrossTableRows(d) {
  if (!d || typeof d !== 'object') return null;
  const growth = d.growthRate != null ? String(d.growthRate) : '';
  const up = growth && !String(growth).trim().startsWith('-');

  if (d.totalRevenue != null && d.netProfit != null) {
    return [
      {
        id: 1,
        title: 'Total revenue',
        revenue: formatMoney(d.totalRevenue),
        marketValue: { up, value: growth || '—' }
      },
      {
        id: 2,
        title: 'Net profit',
        revenue: formatMoney(d.netProfit),
        marketValue: { up: true, value: '' }
      }
    ];
  }

  if (d.totalRevenue != null) {
    return [
      {
        id: 1,
        title: 'Total revenue',
        revenue: formatMoney(d.totalRevenue),
        marketValue: { up, value: growth || '—' }
      },
      {
        id: 2,
        title: 'SMS (month)',
        revenue: String(d.smsThisMonth ?? 0),
        marketValue: { up: true, value: '' }
      }
    ];
  }

  return [
    {
      id: 1,
      title: 'SMS (month)',
      revenue: String(d.smsThisMonth ?? 0),
      marketValue: { up, value: growth || '—' }
    },
    {
      id: 2,
      title: 'Companies',
      revenue: d.totalCompanies != null ? String(d.totalCompanies) : '—',
      marketValue: { up: true, value: '' }
    }
  ];
}

function normalizeTotalSaleVolume(ts) {
  const lm0 = staticTotalSale.lastMonth;
  const py0 = staticTotalSale.previousYear;
  const numArr = a => (Array.isArray(a) ? a.map(x => Number(x) || 0) : null);
  // accept both previousMonth (new) and previousYear (legacy) key names
  const prevOf = obj => obj?.previousMonth ?? obj?.previousYear ?? null;
  const labelsOf = obj => (Array.isArray(obj?.labels) ? obj.labels.map(String) : null);

  if (!ts || typeof ts !== 'object') {
    return {
      labels: null,
      all: { lastMonth: [...lm0], previousYear: [...py0] },
      successful: { lastMonth: [...lm0], previousYear: [...py0] },
      failed: { lastMonth: lm0.map(() => 0), previousYear: py0.map(() => 0) }
    };
  }

  const labels = labelsOf(ts);

  if (ts.all && ts.successful && Array.isArray(ts.all.lastMonth) && Array.isArray(ts.successful.lastMonth)) {
    return {
      labels,
      all: {
        lastMonth: numArr(ts.all.lastMonth) || [...lm0],
        previousYear: numArr(prevOf(ts.all)) || [...py0]
      },
      successful: {
        lastMonth: numArr(ts.successful.lastMonth) || [...lm0],
        previousYear: numArr(prevOf(ts.successful)) || [...py0]
      },
      failed: {
        lastMonth: (ts.failed ? numArr(ts.failed.lastMonth) : null) || lm0.map(() => 0),
        previousYear: (ts.failed ? numArr(prevOf(ts.failed)) : null) || py0.map(() => 0)
      }
    };
  }

  const lastMonth = numArr(ts.lastMonth) || [...lm0];
  const previousYear = numArr(prevOf(ts)) || [...py0];
  return {
    labels,
    all: { lastMonth, previousYear },
    successful: { lastMonth, previousYear },
    failed: { lastMonth: lastMonth.map(() => 0), previousYear: previousYear.map(() => 0) }
  };
}

export function buildSmsDashboardView(api) {
  const d = api && typeof api === 'object' ? api : null;
  const lp = mergeLinePayment(d?.linePayment);
  const totalSaleVolume = normalizeTotalSaleVolume(d?.totalSale);

  const allCards = mergeStatsCards(d?.statsCards);
  const primaryCards = allCards.slice(0, 3);
  // If the backend returns fewer than 6 cards (e.g. old build), fall back to
  // the static defaults for the comparison row so Yesterday/LastWeek/LastMonth
  // remain visible (with value 0) instead of vanishing.
  const comparisonCards = allCards.length >= 6 ? allCards.slice(3) : statsData.slice(3);

  return {
    statsCards: allCards,
    primaryStatsCards: primaryCards,
    comparisonStatsCards: comparisonCards,
    linePayment: lp,
    totalSaleVolume,
    grossRevenue: normalizeGrossChart(d?.grossRevenue),
    grossHeader: d?.grossHeader && typeof d.grossHeader === 'object' ? d.grossHeader : null,
    grossTableRows: buildGrossTableRows(d) || null,
    revenueCard: d?.revenueCard && typeof d.revenueCard === 'object' ? d.revenueCard : null,
    deliveryCard: d?.deliveryCard && typeof d.deliveryCard === 'object' ? d.deliveryCard : null,
    newCustomersSparkline:
      Array.isArray(d?.newCustomersSparkline) && d.newCustomersSparkline.length
        ? d.newCustomersSparkline.map(x => Number(x) || 0)
        : defaultActiveSeries,
    newCustomersTotal:
      d?.newCustomersTotal != null
        ? Number(d.newCustomersTotal)
        : sumSeries(defaultActiveSeries),
    depositBanner: typeof d?.depositBanner === 'string' ? d.depositBanner : null,
    deliveryGauge: d?.deliveryGauge != null ? Math.min(100, Math.max(0, Number(d.deliveryGauge))) : null,
    bandwidthSub: typeof d?.bandwidthSub === 'string' ? d.bandwidthSub : null,
    bandwidthTotal: typeof d?.bandwidthTotal === 'string' ? d.bandwidthTotal : null,
  //  transactions: Array.isArray(d?.transactions) && d.transactions.length ? d.transactions : transactionSummary,
    topSidsFiles: mapTopSidsToFiles(d?.topSidsUi),
    topSidsUsers: mapTopSidsToUsers(d?.topSids),
    topCustomersUsers: mapTopCustomersToUsers(d?.topCustomersUi),
    topDestinationUsers: mapTopDestinations(d?.topDestinations),
    recentAgentsUsers: mapRecentAgentsToUsers(d?.recentAgents),
    raw: d
  };
}

export function formatCompactCount(n) {
  if (n == null || !Number.isFinite(Number(n))) return '0';
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000) return `${(v / 1_000).toFixed(1)}k`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}k`;
  return String(Math.round(v));
}

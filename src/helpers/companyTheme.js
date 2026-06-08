export const COMPANY_STORAGE_KEY = 'sms-companies';

const normalizeHost = (value = '') =>
  String(value)
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .replace(/\s+/g, '')
    .toLowerCase();

export const getCompaniesFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveCompaniesToStorage = (companies) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(Array.isArray(companies) ? companies : []);
    window.localStorage.setItem(COMPANY_STORAGE_KEY, payload);
  } catch (error) {
    // ignore storage errors
  }
};

export const getCompanyThemeByHostname = (hostname) => {
  const companies = getCompaniesFromStorage();
  if (!companies.length) return null;
  const normalizedHost = normalizeHost(hostname || '');

  const match = companies.find((company) => {
    const domain = normalizeHost(company?.domain);
    return domain && (normalizedHost === domain || normalizedHost.endsWith(`.${domain}`));
  });

  return match ?? null;
};

export const getDefaultCompanyTheme = () => ({
  name: 'SMS Pro',
  logoUrl: '',
  loginBackgroundUrl: '',
  loginFooter: ''
});

export const getCompanyInfoByHostname = (hostname = '') => {
  const theme = getCompanyThemeByHostname(hostname) || getDefaultCompanyTheme();
  const normalizedHost = normalizeHost(hostname);
  const fallbackName = normalizedHost ? normalizedHost.split('.')[0] : 'Company';
  const companyName = theme?.name || fallbackName;

  const domain = normalizeHost(theme?.domain || normalizedHost);
  const website = domain ? `https://${domain}` : '';
  const websiteHost = domain || '';

  return {
    companyName,
    website,
    websiteHost
  };
};

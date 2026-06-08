import apiClient from './apiClient';

/**
 * Fetch company details by domain from the backend API
 * @param {string} domain
 * @returns {Promise}
 */
export function fetchCompanyByDomain(domain) {
  return apiClient.get(`/companies/domain/${encodeURIComponent(domain)}`);
}

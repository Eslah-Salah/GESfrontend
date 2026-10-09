import { escapeHtml } from '../lib/common';
import { getPlatformUsage } from '../data/platform-usage';

export function renderPlatformUsage(): string {
  const usage = getPlatformUsage();
  const rows = [...usage.rows].sort((a, b) => b.usage - a.usage);
  const stat = (value: number, label: string) =>
    `<article class="glass-card stat-card"><div class="stat-number">${value}</div><div class="stat-label">${label}</div></article>`;

  return `
    <section class="intro">
      <span class="eyebrow">Super admin</span>
      <h1>Usage across <em>all properties</em></h1>
      <p>See which properties are active, which have gone quiet, and how much each one uses the system.</p>
    </section>
    <section class="stat-grid">
      ${stat(usage.activeProperties, 'Active properties')}
      ${stat(usage.quietProperties, 'Quiet properties')}
      ${stat(usage.modulesInUse, 'Parts of the system in use')}
    </section>
    <section class="glass-card table-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Property name</th><th scope="col">Usage</th></tr></thead>
          <tbody>${rows.map((row) => `
            <tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.usage)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length === 0 ? '<div class="empty-state">No properties yet.</div>' : ''}
    </section>
    <footer class="footer-note">GMS · PLATFORM USAGE</footer>`;
}
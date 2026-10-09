import { escapeHtml, formatDateTime } from '../lib/common';
import { canViewGuestAccessLog, getGuestAccessLog } from '../data/guest-access-log';

export function renderGuestAccessLog(): string {
  if (!canViewGuestAccessLog()) {
    return `
      <section class="glass-card panel access-refused">
        <h2>You cannot open this.</h2>
        <p class="subtle">You do not have access to this page.</p>
      </section>`;
  }

  const rows = [...getGuestAccessLog()].sort((a, b) => b.openedAt - a.openedAt);
  return `
    <section class="intro">
      <span class="eyebrow">Privacy audit</span>
      <h1>Who opened <em>this guest</em></h1>
      <p>Every time a staff member opens a guest profile, it is recorded here.</p>
    </section>
    <section class="glass-card table-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Staff name</th><th scope="col">Guest name</th><th scope="col">Date and time</th></tr></thead>
          <tbody>${rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.staffName)}</td>
              <td>${escapeHtml(row.guestName)}</td>
              <td>${escapeHtml(formatDateTime(row.openedAt))}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length === 0 ? '<div class="empty-state">No guest profiles have been opened yet.</div>' : ''}
    </section>
    <footer class="footer-note">GMS · GUEST ACCESS AUDIT</footer>`;
}

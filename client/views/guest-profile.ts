import { escapeHtml, formatDateTime } from '../lib/common';
import type { Guest } from '../data/guests';

export function renderGuestHeader(guest: Guest): string {
  return `
    <article class="glass-card panel guest-header">
      <span class="section-kicker">Guest profile</span>
      <h2>${escapeHtml(guest.name)}</h2>
      <p class="subtle" lang="ar" dir="rtl">${escapeHtml(guest.nameAr)}</p>
      <p class="guest-phone">${escapeHtml(guest.phone)}</p>
    </article>`;
}

export function renderPreferences(guest: Guest): string {
  return `
    <article class="glass-card panel">
      <div class="panel-heading"><span class="section-kicker">Saved</span><h2>Preferences</h2></div>
      ${guest.preferences.length
        ? `<dl class="pref-list">${guest.preferences.map((pref) => `
            <div><dt>${escapeHtml(pref.label)}</dt><dd>${escapeHtml(pref.value)}</dd></div>`).join('')}
          </dl>`
        : '<div class="empty-state">No preferences saved.</div>'}
    </article>`;
}

export function renderTimeline(guest: Guest): string {
  const items = [...guest.timeline].sort((a, b) => b.at - a.at);
  return `
    <article class="glass-card panel">
      <div class="timeline-head">
        <div class="panel-heading"><span class="section-kicker">History</span><h2>Timeline</h2></div>
        <div class="timeline-actions"></div>
      </div>
      <div id="contact-slot"></div>
      ${items.length
        ? `<ul class="timeline" id="guest-timeline">${items.map((item) => `
            <li>
              <span class="timeline-kind timeline-kind-${escapeHtml(item.kind)}">${escapeHtml(item.kind)}</span>
              <span>${escapeHtml(item.title)}</span>
              <span class="timeline-date">${escapeHtml(formatDateTime(item.at))}</span>
            </li>`).join('')}
          </ul>`
        : '<div class="empty-state">No history yet.</div>'}
    </article>`;
}

export function renderGuestProfile(guest: Guest): string {
  return `
    <section class="intro">
      <span class="eyebrow">Guest</span>
      <h1>Guest <em>profile</em></h1>
    </section>
    <div id="guest-profile">
      ${renderGuestHeader(guest)}
      <div class="guest-grid">
        ${renderPreferences(guest)}
        ${renderTimeline(guest)}
      </div>
    </div>
    <footer class="footer-note">GMS · GUEST PROFILE</footer>`;
}

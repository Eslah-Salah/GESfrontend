import './styles.css';
import { getGuest } from './data/guests';
import { renderGuestAccessLog } from './views/guest-access-log';
import { renderGuestProfile } from './views/guest-profile';

type PropertyStatus = 'Approved' | 'Pending' | 'Rejected' | 'Suspended';
type PropertyType = 'Hotel' | 'Travel agency';
type PropertyAction = 'Approve' | 'Reject' | 'Suspend' | 'Turn back on';
type View = 'admin' | 'property' | 'register' | 'guest-access-log' | 'guest-profile';

interface PropertyLog {
  at: number;
  person: string;
  action: string;
  reason: string;
}

interface PropertyRecord {
  id: string;
  name: string;
  nameAr: string;
  type: PropertyType;
  status: PropertyStatus;
  plan: string;
  users: number;
  details: {
    cr: string;
    tax: string;
    phone: string;
    fax: string;
    email: string;
    city: string;
    address: string;
    languages: string;
    openingDays: string;
  };
  accessEndsAt: number | null;
  holdStarted: boolean;
  holdStartedAt: number | null;
  logs: PropertyLog[];
}

const app: HTMLElement = (() => {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Application root element was not found.');
  return root;
})();

let properties: PropertyRecord[] = [];
let currentView: View = 'admin';
let selectedPropertyId: string | null = null;
let notice: { message: string; success: boolean } | null = null;
const selectedGuestId = 'guest-001'; // demo default; the guest search page (another task) will set this later

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const payload = result as { message?: string | string[] };
    const message = Array.isArray(payload.message)
      ? payload.message.join(' ')
      : payload.message;
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return result as T;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] ?? char);
}

function selectedProperty(): PropertyRecord | null {
  return properties.find((property) => property.id === selectedPropertyId)
    ?? properties[0]
    ?? null;
}

function formatTime(value: number | null): string {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusBadge(status: PropertyStatus): string {
  return `<span class="status status-${status.toLowerCase()}">${escapeHtml(status)}</span>`;
}

function renderLog(logs: PropertyLog[] | undefined): string {
  if (!logs?.length) {
    return '<div class="empty-state">No actions have been recorded for this property.</div>';
  }
  return `<div class="log-list">${logs.map((entry) => `
    <div class="log-entry">
      <span class="log-time">${escapeHtml(formatTime(entry.at))}</span>
      <span class="log-person">${escapeHtml(entry.person)}</span>
      <span class="log-action">${escapeHtml(entry.action)}${entry.reason ? `<span class="log-reason">${escapeHtml(entry.reason)}</span>` : ''}</span>
    </div>`).join('')}
  </div>`;
}

function renderAdmin(): string {
  const property = selectedProperty();
  return `
    <section class="intro page-heading">
      <div>
        <span class="eyebrow">Management console</span>
        <h1>Property <em>overview</em></h1>
        <p>Review every registered property, its current status, plan, and user count.</p>
      </div>
      <span class="count-label">${properties.length} ${properties.length === 1 ? 'property' : 'properties'} in workspace</span>
    </section>
    <section class="glass-card table-card" aria-labelledby="properties-heading">
      <div class="table-head">
        <div><span class="section-kicker">Directory</span><h2 id="properties-heading">All properties</h2></div>
        <span class="count-label">Select a property to manage its access log</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Property name</th><th scope="col">Status</th><th scope="col">Plan</th><th scope="col">Users</th></tr></thead>
          <tbody>${properties.map((item) => `
            <tr data-select="${escapeHtml(item.id)}" class="${item.id === selectedPropertyId ? 'is-selected' : ''}" aria-selected="${item.id === selectedPropertyId}">
              <td>
                <button class="property-name property-link" type="button" data-open-property="${escapeHtml(item.id)}" aria-label="Open overview for ${escapeHtml(item.name)}">${escapeHtml(item.name)}</button>
                ${item.nameAr ? `<span class="property-ar" lang="ar" dir="rtl">${escapeHtml(item.nameAr)}</span>` : ''}
                <div class="property-meta">${escapeHtml(item.type)}</div>
                <div class="row-actions" aria-label="Actions for ${escapeHtml(item.name)}">
                  ${(['Approve', 'Reject', 'Suspend', 'Turn back on'] as const).map((action) =>
                    `<button class="action-button" data-action="${action}" data-id="${escapeHtml(item.id)}">${action}</button>`).join('')}
                </div>
              </td>
              <td>${statusBadge(item.status)}</td>
              <td><span class="plan-name">${escapeHtml(item.plan)}</span></td>
              <td><span class="user-count"><span class="user-icon" aria-hidden="true">♙</span>${escapeHtml(item.users)}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
    ${property ? `
      <section class="below-table">
        <article class="glass-card panel">
          <div class="panel-heading">
            <span class="section-kicker">Access control</span>
            <h2>Timed access hold</h2>
            <p>Start a temporary hold for <strong>${escapeHtml(property.name)}</strong>. Access restores automatically when the hold ends.</p>
            <p class="selection-note">Select another property by clicking its row.</p>
          </div>
          <form class="access-form" id="access-form">
            <div class="field">
              <label for="hold-reason">Reason</label>
              <input id="hold-reason" name="reason" maxlength="240" placeholder="Explain why access is being paused" required />
            </div>
            <div class="field">
              <label for="hold-duration">Hold duration</label>
              <select id="hold-duration" name="duration">
                <option value="1">1 hour</option><option value="24" selected>24 hours</option><option value="168">7 days</option>
              </select>
            </div>
            <div><button class="gold-button" type="submit">Start hold</button></div>
          </form>
          <p class="form-error" id="hold-error" role="alert"></p>
          <div class="access-end"><strong>Access ends:</strong> ${property.accessEndsAt ? escapeHtml(formatTime(property.accessEndsAt)) : 'No timed hold is active.'}</div>
        </article>
        <article class="glass-card panel">
          <div class="panel-heading">
            <span class="section-kicker">Property audit</span><h2>Action log</h2>
            <p class="log-property-title">${escapeHtml(property.name)}</p>
          </div>
          ${renderLog(property.logs)}
        </article>
      </section>` : ''}
    <footer class="footer-note">GMS · MULTI-TENANT PROPERTY MANAGEMENT</footer>`;
}

function renderRegistration(): string {
  return `
    <section class="intro">
      <span class="eyebrow">New workspace</span>
      <h1>Register your <em>property</em></h1>
      <p>Submit your business information for review. Your workspace stays closed until a super admin approves it.</p>
    </section>
    ${notice ? `<div class="notice ${notice.success ? 'success-notice' : ''}" role="status">${escapeHtml(notice.message)}</div>` : ''}
    <section class="glass-card register-card">
      <div class="register-header">
        <span class="section-kicker">Property details</span>
        <h2>Business registration</h2>
        <p>Complete every required field. We’ll show the approval status after you save.</p>
      </div>
      <form class="register-form" id="registration-form">
        <div class="register-grid">
          <div class="field"><label for="business-ar">Business name in Arabic *</label><input id="business-ar" name="businessAr" dir="rtl" lang="ar" placeholder="اسم المنشأة" maxlength="120" required /></div>
          <div class="field"><label for="business-en">Business name in English *</label><input id="business-en" name="businessEn" placeholder="Registered business name" maxlength="120" required /></div>
          <div class="field"><label for="property-type">Property type *</label><select id="property-type" name="type" required><option value="" selected disabled>Select property type</option><option value="Hotel">Hotel</option><option value="Travel agency">Travel agency</option></select></div>
          <div class="field"><label for="cr-number">Commercial registration number *</label><input id="cr-number" name="cr" placeholder="Commercial registration number" maxlength="40" required /></div>
          <div class="field"><label for="tax-number">Tax number *</label><input id="tax-number" name="tax" placeholder="Tax registration number" maxlength="40" required /></div>
          <div class="field"><label for="phone">Phone *</label><input id="phone" name="phone" type="tel" placeholder="+966 5X XXX XXXX" maxlength="40" required /></div>
          <div class="field"><label for="fax">Fax</label><input id="fax" name="fax" type="tel" placeholder="Optional" maxlength="40" /></div>
          <div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" autocomplete="email" placeholder="name@business.com" maxlength="254" required /></div>
          <div class="field"><label for="city">City *</label><input id="city" name="city" placeholder="City" maxlength="100" required /></div>
          <div class="field wide"><label for="address">Address *</label><input id="address" name="address" placeholder="Street and building address" maxlength="240" required /></div>
          <div class="field"><label for="languages">Languages *</label><input id="languages" name="languages" placeholder="Arabic, English" maxlength="100" required /></div>
          <div class="field"><label for="opening-days">Opening days *</label><input id="opening-days" name="openingDays" placeholder="Sunday–Thursday" maxlength="100" required /></div>
        </div>
        <div class="form-footer"><button class="gold-button" type="submit">Save</button></div>
      </form>
    </section>
    <footer class="footer-note">GMS · YOUR INFORMATION IS REVIEWED BEFORE ACCESS IS GRANTED</footer>`;
}

function renderPropertyView(): string {
  const property = selectedProperty();
  if (!property) {
    return '<section class="glass-card panel"><h2>No property registered</h2><p class="subtle">Register a property to preview its workspace.</p></section>';
  }
  const detail = (label: string, value: string) =>
    `<div class="detail-cell"><span>${label}</span><strong>${escapeHtml(value || '—')}</strong></div>`;
  const accessMessage = property.status === 'Pending'
    ? '<div class="workspace-closed"><strong>Waiting for approval.</strong> Your workspace is closed until a super admin approves the property.</div>'
    : property.status === 'Approved'
      ? '<div class="workspace-closed workspace-open">Your workspace is approved and active.</div>'
      : `<div class="workspace-closed">Workspace access is ${escapeHtml(property.status.toLowerCase())}. Contact your administrator for assistance.</div>`;

  return `
    <section class="intro">
      <span class="eyebrow">Property portal · Private view</span>
      <h1>Your <em>workspace</em></h1>
      <p>This view only shows this property’s information and its own admin action log.</p>
    </section>
    <section class="property-view">
      <article class="glass-card property-banner">
        <span class="section-kicker">Property status</span>
        <h2>${escapeHtml(property.name)}</h2>
        ${property.nameAr ? `<p lang="ar" dir="rtl">${escapeHtml(property.nameAr)}</p>` : ''}
        ${statusBadge(property.status)}
        ${accessMessage}
        ${property.accessEndsAt ? `<div class="access-end"><strong>Access ends:</strong> ${escapeHtml(formatTime(property.accessEndsAt))}</div>` : ''}
        <div class="property-details">
          ${detail('Property type', property.type)}
          ${detail('Commercial registration', property.details.cr)}
          ${detail('Tax number', property.details.tax)}
          ${detail('Phone', property.details.phone)}
          ${detail('Fax', property.details.fax)}
          ${detail('Email', property.details.email)}
          ${detail('City', property.details.city)}
          ${detail('Address', property.details.address)}
          ${detail('Languages', property.details.languages)}
          ${detail('Opening days', property.details.openingDays)}
        </div>
      </article>
      <article class="glass-card panel">
        <div class="panel-heading"><span class="section-kicker">Visible to this property</span><h2>Admin action log</h2><p>Only actions related to ${escapeHtml(property.name)} are shown here.</p></div>
        ${renderLog(property.logs.filter((entry) => entry.person === 'Super Admin'))}
      </article>
    </section>
    <footer class="footer-note">GMS · PROPERTY-SCOPED ACTIVITY LOG</footer>`;
}

function render(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-role]').forEach((button) => {
    const active = currentView === 'register'
      ? false
      : button.dataset.role === currentView;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
    const active = button.dataset.view === currentView;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const page = currentView === 'register'
    ? renderRegistration()
    : currentView === 'property'
      ? renderPropertyView()
      : currentView === 'guest-access-log'
        ? renderGuestAccessLog()
        : currentView === 'guest-profile'
          ? renderGuestProfile(getGuest(selectedGuestId))
          : renderAdmin();
  const errorNotice = notice && currentView !== 'register'
    ? `<div class="notice" role="alert">${escapeHtml(notice.message)}</div>`
    : '';
  app.innerHTML = `${errorNotice}${page}`;
}

async function refreshProperties(): Promise<void> {
  properties = await api<PropertyRecord[]>('/properties');
  if (!properties.some((property) => property.id === selectedPropertyId)) {
    selectedPropertyId = properties[0]?.id ?? null;
  }
  render();
}

function showError(error: unknown): void {
  notice = {
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    success: false,
  };
  render();
}

document.querySelectorAll<HTMLButtonElement>('[data-role]').forEach((button) => {
  button.addEventListener('click', () => {
    currentView = button.dataset.role === 'property'
      ? 'property'
      : button.dataset.role === 'guest-access-log'
        ? 'guest-access-log'
        : button.dataset.role === 'guest-profile'
          ? 'guest-profile'
          : 'admin';
    notice = null;
    render();
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    currentView = button.dataset.view as View;
    notice = null;
    render();
  });
});

document.querySelector<HTMLButtonElement>('#register-nav')?.addEventListener('click', () => {
  currentView = 'register';
  notice = null;
  document.querySelectorAll<HTMLButtonElement>('[data-role]').forEach((button) => {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  });
  render();
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const propertyLink = event.target.closest<HTMLButtonElement>('[data-open-property]');
  if (propertyLink?.dataset.openProperty) {
    selectedPropertyId = propertyLink.dataset.openProperty;
    currentView = 'property';
    notice = null;
    render();
    return;
  }
  const actionButton = event.target.closest<HTMLButtonElement>('[data-action]');
  if (actionButton?.dataset.id && actionButton.dataset.action) {
    const { id, action } = actionButton.dataset;
    if (!['Approve', 'Reject', 'Suspend', 'Turn back on'].includes(action)) return;
    try {
      await api<PropertyRecord>(`/properties/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      notice = null;
      selectedPropertyId = id;
      await refreshProperties();
    } catch (error) {
      showError(error);
    }
    return;
  }

  const row = event.target.closest<HTMLElement>('[data-select]');
  if (row?.dataset.select && !event.target.closest('button')) {
    selectedPropertyId = row.dataset.select;
    currentView = 'property';
    notice = null;
    render();
  }
});

app.addEventListener('submit', async (event) => {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  const form = event.target;
  if (form.id === 'registration-form') {
    const data = new FormData(form);
    const body = Object.fromEntries(data.entries());
    try {
      const property = await api<PropertyRecord>('/properties', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      selectedPropertyId = property.id;
      properties = await api<PropertyRecord[]>('/properties');
      notice = { message: 'Registration submitted. Your workspace is waiting for approval.', success: true };
      render();
      form.reset();
    } catch (error) {
      showError(error);
    }
  } else if (form.id === 'access-form') {
    const data = new FormData(form);
    const property = selectedProperty();
    if (!property) return;
    try {
      await api<PropertyRecord>(`/properties/${encodeURIComponent(property.id)}/access-hold`, {
        method: 'POST',
        body: JSON.stringify({
          reason: String(data.get('reason') ?? ''),
          duration: Number(data.get('duration')),
        }),
      });
      notice = null;
      await refreshProperties();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start the access hold.';
      const holdError = document.querySelector<HTMLElement>('#hold-error');
      if (holdError) holdError.textContent = message;
      else showError(error);
    }
  }
});

void refreshProperties().catch(showError);

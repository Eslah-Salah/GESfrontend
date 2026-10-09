import { addGuestContact, type TimelineKind } from '../data/guests';
import { escapeHtml } from '../lib/common';

export const CONTACT_TYPES = ['call', 'visit', 'message', 'request'] as const;
type ContactType = (typeof CONTACT_TYPES)[number];

let formOpen = false;
let formError: string | null = null;
let draftType: ContactType = 'call';
let draftNote = '';

export function openContactForm(): void {
  formOpen = true;
  formError = null;
}

export function closeContactForm(): void {
  formOpen = false;
  formError = null;
  draftType = 'call';
  draftNote = '';
}

export function submitContact(guestId: string, data: FormData): void {
  const type = String(data.get('type') ?? '');
  const note = String(data.get('note') ?? '').trim();
  draftNote = note;
  if (!(CONTACT_TYPES as readonly string[]).includes(type)) {
    formError = 'Choose a contact type.';
    return;
  }
  draftType = type as ContactType;
  if (!note) {
    formError = 'Write a short note.';
    return;
  }
  if (note.length > 500) {
    formError = 'The note is too long (500 characters max).';
    return;
  }
  addGuestContact(guestId, type as TimelineKind, note);
  closeContactForm();
}

export function renderContactForm(): string {
  if (!formOpen) return '';
  return `
    <form id="contact-form" class="contact-form">
      <div class="field">
        <label for="contact-type">Type</label>
        <select id="contact-type" name="type">
          ${CONTACT_TYPES.map((type) => `<option value="${type}"${type === draftType ? ' selected' : ''}>${type.charAt(0).toUpperCase()}${type.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="contact-note">Note</label>
        <textarea id="contact-note" name="note" maxlength="500" placeholder="What happened?" required>${escapeHtml(draftNote)}</textarea>
      </div>
      <p class="form-error" role="alert">${formError ? escapeHtml(formError) : ''}</p>
      <div class="actions">
        <button class="gold-button" type="submit">Save</button>
        <button class="quiet-button" type="button" data-contact-cancel>Cancel</button>
      </div>
    </form>`;
}

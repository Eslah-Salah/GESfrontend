import { escapeHtml } from '../lib/common';
import { STAGES_BY_TYPE, type Guest } from '../data/guests';

export function renderJourneyStage(guest: Guest): string {
  const stages = STAGES_BY_TYPE[guest.propertyType];
  return `
    <div class="journey-row">
      <span class="section-kicker">Current stage</span>
      <strong class="stage-label">${escapeHtml(guest.currentStage)}</strong>
      <select id="journey-stage-select" data-journey-stage aria-label="Change journey stage">
        ${stages.map((stage) => `<option value="${escapeHtml(stage)}"${stage === guest.currentStage ? ' selected' : ''}>${escapeHtml(stage)}</option>`).join('')}
      </select>
    </div>`;
}

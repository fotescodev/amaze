/**
 * Lexicon Explorer
 * Toggleable vocabulary browser with cluster tabs, playable chord cards,
 * and fidelity tags (CANON, FAN-EXTENDED, etc.).
 */

import { LEXICON_CLUSTERS, BASE_LEXICON } from './lexicon.js';
import { ensureAudioReady, getAudioContext } from './audio-engine.js';

const FIDELITY_TITLES = {
  'CANON': 'Canon — directly from the novel text',
  'AUDIOBOOK-DERIVED': 'Audiobook-derived — inferred from the audiobook performance',
  'FAN-EXTENDED': 'Fan-extended — community interpretation consistent with canon rules',
  'AI-EXTENDED': 'AI-extended — generated to fill gaps using canonical constraints',
};

let activeCluster = null;
let currentlyPlaying = null;

export function initLexiconExplorer() {
  const toggle = document.getElementById('lexicon-toggle');
  const panel = document.getElementById('lexicon-panel');
  const countEl = document.getElementById('lexicon-count');
  const tabsEl = document.getElementById('lexicon-tabs');
  const gridEl = document.getElementById('lexicon-grid');

  // Show total word count
  countEl.textContent = `${BASE_LEXICON.length} words`;

  // Build cluster tabs
  const clusterNames = Object.keys(LEXICON_CLUSTERS);
  activeCluster = clusterNames[0];

  for (const name of clusterNames) {
    const tab = document.createElement('button');
    tab.className = 'lexicon-tab';
    tab.role = 'tab';
    tab.textContent = name;
    tab.dataset.cluster = name;
    tab.addEventListener('click', () => switchCluster(name, tabsEl, gridEl));
    tabsEl.appendChild(tab);
  }

  // Toggle panel
  toggle.addEventListener('click', () => {
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    toggle.classList.toggle('active');
    toggle.querySelector('.lexicon-chevron').style.transform =
      isHidden ? 'rotate(180deg)' : '';

    // Render first cluster on first open
    if (isHidden && gridEl.children.length === 0) {
      switchCluster(activeCluster, tabsEl, gridEl);
    }
  });
}

function switchCluster(name, tabsEl, gridEl) {
  activeCluster = name;

  // Update tab states
  for (const tab of tabsEl.children) {
    tab.classList.toggle('active', tab.dataset.cluster === name);
  }

  // Render cards
  const entries = LEXICON_CLUSTERS[name];
  gridEl.innerHTML = '';

  for (const entry of entries) {
    gridEl.appendChild(createChordCard(entry));
  }
}

function createChordCard(entry) {
  const card = document.createElement('div');
  card.className = 'chord-card';

  const tones = entry.syllables[0].tones;
  const tonesStr = tones.map(t => `${t}\u00a0Hz`).join(' + ');

  card.innerHTML = `
    <div class="chord-card-header">
      <div class="chord-card-left">
        <span class="chord-glyph">${entry.glyph}</span>
        <div class="chord-info">
          <span class="chord-word">${entry.word}</span>
          <span class="chord-tones">${tonesStr}</span>
        </div>
      </div>
      <div class="chord-card-right">
        <span class="fidelity-tag fidelity-${entry.fidelity.toLowerCase()}" title="${FIDELITY_TITLES[entry.fidelity] || ''}">${entry.fidelity}</span>
        <button class="chord-play-btn" aria-label="Play chord for ${entry.word}">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    </div>
    <div class="chord-card-details hidden">
      <dl>
        <div class="detail-row">
          <dt>Interval:</dt>
          <dd>${entry.intervalType}</dd>
        </div>
        ${entry.syllables.length > 1 ? `
        <div class="detail-row">
          <dt>Syllables:</dt>
          <dd>${entry.syllables.map((s, i) => `${i > 0 ? ' ~ ' : ''}[${s.tones.join(', ')}]`).join('')}</dd>
        </div>` : ''}
        <div class="detail-row">
          <dt>Rationale:</dt>
          <dd>${entry.gloss}</dd>
        </div>
      </dl>
    </div>
  `;

  // Expand/collapse on card click
  card.addEventListener('click', (e) => {
    // Don't toggle if play button was clicked
    if (e.target.closest('.chord-play-btn')) return;
    const details = card.querySelector('.chord-card-details');
    details.classList.toggle('hidden');
    card.classList.toggle('expanded');
  });

  // Play button
  const playBtn = card.querySelector('.chord-play-btn');
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playChordCard(entry, playBtn);
  });

  return card;
}

async function playChordCard(entry, btn) {
  if (currentlyPlaying) return;
  currentlyPlaying = btn;

  await ensureAudioReady();
  const ctx = getAudioContext();

  btn.classList.add('playing');
  btn.innerHTML = '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

  // Schedule all syllables
  const ATTACK = 0.04, DECAY = 0.08, SUSTAIN_DURATION = 0.25, RELEASE = 0.2;
  const CHORD_DUR = ATTACK + DECAY + SUSTAIN_DURATION + RELEASE;
  const SYLLABLE_GAP = 0.08;
  const MASTER = 0.35;

  let t = ctx.currentTime + 0.05;

  for (let s = 0; s < entry.syllables.length; s++) {
    const tones = entry.syllables[s].tones;
    const perOsc = MASTER / Math.sqrt(tones.length);

    for (const hz of tones) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(perOsc, t + ATTACK);
      gain.gain.linearRampToValueAtTime(perOsc * 0.7, t + ATTACK + DECAY);
      gain.gain.setValueAtTime(perOsc * 0.7, t + ATTACK + DECAY + SUSTAIN_DURATION);
      gain.gain.linearRampToValueAtTime(0.0001, t + CHORD_DUR);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + CHORD_DUR + 0.01);
    }

    t += CHORD_DUR;
    if (s < entry.syllables.length - 1) t += SYLLABLE_GAP;
  }

  const duration = (t - ctx.currentTime) * 1000;
  setTimeout(() => {
    btn.classList.remove('playing');
    btn.innerHTML = '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    currentlyPlaying = null;
  }, Math.max(duration, 400));
}

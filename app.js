const MONTHS = ['ޖަނަވަރީ', 'ފެބްރުއަރީ', 'މާރިޗު', 'އޭޕްރީލް', 'މެއި', 'ޖޫން', 'ޖުލައި', 'އޯގަސްޓު', 'ސެޕްޓެމްބަރު', 'އޮކްޓޫބަރު', 'ނޮވެމްބަރު', 'ޑިސެމްބަރު'];
const TYPES = { dhauraa: 'ދައުރާ', dharus: 'ދަރުސް' };

const state = { records: [], type: 'all', year: 'all', q: '' };
const $ = (id) => document.getElementById(id);

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Arabic is shown without harakat, even if a record includes them.
function stripHarakat(s) {
  return String(s ?? '').replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  return state.records.filter((r) =>
    (state.type === 'all' || r.type === state.type) &&
    (state.year === 'all' || r.date.startsWith(state.year)) &&
    (!q || [r.title, r.speaker, r.place, r.topic, r.description].join(' ').toLowerCase().includes(q))
  );
}

function render() {
  const items = filtered();
  $('list').innerHTML = items.map((r) => `
    <div class="item ${r.type}" tabindex="0" data-id="${esc(r.id)}">
      <span class="badge ${r.type}">${TYPES[r.type]}</span>
      <h3>${esc(r.title)}</h3>
      <div class="meta">
        <span>${formatDate(r.date)}${r.time ? ' · ' + esc(r.time) : ''}</span>
        ${r.speaker ? `<span>${esc(r.speaker)}</span>` : ''}
        ${r.place ? `<span>${esc(r.place)}</span>` : ''}
      </div>
    </div>`).join('');
  $('count').textContent = `${items.length} ރެކޯޑު`;
  $('empty').hidden = items.length > 0;
}

function renderStats() {
  const count = (t) => state.records.filter((r) => r.type === t).length;
  $('stat-dharus').textContent = count('dharus');
  $('stat-dhauraa').textContent = count('dhauraa');
  $('stat-people').textContent = state.records.reduce((n, r) => n + (Number(r.participants) || 0), 0);

  const years = [...new Set(state.records.map((r) => r.date.slice(0, 4)))].sort().reverse();
  $('year').insertAdjacentHTML('beforeend', years.map((y) => `<option value="${y}">${y}</option>`).join(''));
}

function openDetail(id) {
  const r = state.records.find((x) => x.id === id);
  if (!r) return;
  $('d-type').textContent = TYPES[r.type];
  $('d-type').className = `badge ${r.type}`;
  $('d-title').textContent = r.title;
  $('d-arabic').textContent = stripHarakat(r.arabic);

  const fields = [
    ['ތާރީޚް', formatDate(r.date)],
    ['ވަގުތު', r.time],
    ['ތަން', r.place],
    ['ދެއްވި ފަރާތް', r.speaker],
    ['މައުޟޫޢު', r.topic],
    ['ބައިވެރިން', r.participants],
  ].filter(([, v]) => v !== undefined && v !== '');
  $('d-fields').innerHTML = fields.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');

  const paras = [r.description, r.notes].filter(Boolean);
  $('d-desc').innerHTML = paras.map((p) => `<p>${esc(p)}</p>`).join('');
  $('detail').showModal();
}

document.querySelectorAll('.tab').forEach((btn) => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
  state.type = btn.dataset.type;
  render();
}));
$('year').addEventListener('change', (e) => { state.year = e.target.value; render(); });
$('search').addEventListener('input', (e) => { state.q = e.target.value; render(); });
$('list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) openDetail(item.dataset.id);
});
$('list').addEventListener('keydown', (e) => {
  const item = e.target.closest('.item');
  if (item && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDetail(item.dataset.id); }
});
$('close').addEventListener('click', () => $('detail').close());
$('detail').addEventListener('click', (e) => { if (e.target === $('detail')) $('detail').close(); });
$('year-now').textContent = new Date().getFullYear();

fetch('data/records.json')
  .then((res) => res.json())
  .then((data) => {
    state.records = data.sort((a, b) => b.date.localeCompare(a.date));
    renderStats();
    render();
  })
  .catch(() => { $('empty').hidden = false; });

const MONTHS = ['ޖަނަވަރީ', 'ފެބްރުއަރީ', 'މާރިޗު', 'އޭޕްރީލް', 'މެއި', 'ޖޫން', 'ޖުލައި', 'އޯގަސްޓު', 'ސެޕްޓެމްބަރު', 'އޮކްޓޫބަރު', 'ނޮވެމްބަރު', 'ޑިސެމްބަރު'];
const TYPES = { dhauraa: 'ދައުރާ', dharus: 'ދަރުސް' };
const FIELDS = ['type', 'title', 'arabic', 'date', 'time', 'place', 'speaker', 'topic', 'participants', 'description', 'notes'];

const $ = (id) => document.getElementById(id);
const state = { records: [], q: '', editingId: null };
let db;

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2500);
}

function show(view) {
  for (const id of ['setup', 'login', 'panel']) $(id).hidden = id !== view;
  $('user-box').hidden = view !== 'panel';
}

// --- Auth ---

async function onSession(session) {
  if (!session) return show('login');

  const { data: isAdmin, error } = await db.rpc('is_admin');
  if (error || !isAdmin) {
    await db.auth.signOut();
    $('login-error').textContent = 'މި އެކައުންޓަށް އެޑްމިން ހުއްދައެއް ނެތް';
    $('login-error').hidden = false;
    return show('login');
  }

  $('user-email').textContent = session.user.email;
  show('panel');
  loadRecords();
}

$('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  $('login-error').hidden = true;
  btn.disabled = true;
  const { data, error } = await db.auth.signInWithPassword({
    email: form.email.value.trim(),
    password: form.password.value,
  });
  btn.disabled = false;
  if (error) {
    $('login-error').textContent = 'އީމެއިލް ނުވަތަ ޕާސްވޯޑް ރަނގަޅެއް ނޫން';
    $('login-error').hidden = false;
    return;
  }
  form.password.value = '';
  onSession(data.session);
});

$('logout').addEventListener('click', async () => {
  await db.auth.signOut();
  state.records = [];
  show('login');
});

// --- Records list ---

async function loadRecords() {
  const { data, error } = await db.from('records').select('*').order('date', { ascending: false });
  if (error) return toast('ރެކޯޑުތައް ލޯޑު ނުކުރެވުނު');
  state.records = data;
  renderList();
}

function renderList() {
  const q = state.q.trim().toLowerCase();
  const items = state.records.filter((r) =>
    !q || [r.title, r.speaker, r.place, r.topic].join(' ').toLowerCase().includes(q)
  );
  $('admin-count').textContent = `(${state.records.length})`;
  $('admin-empty').hidden = items.length > 0;
  $('admin-list').innerHTML = items.map((r) => `
    <div class="row ${r.type}">
      <div class="info">
        <span class="badge ${r.type}">${TYPES[r.type]}</span>
        <h3>${esc(r.title)}</h3>
        <div class="meta">${formatDate(r.date)}${r.speaker ? ' · ' + esc(r.speaker) : ''}${r.place ? ' · ' + esc(r.place) : ''}</div>
      </div>
      <div class="buttons">
        <button class="btn-small" data-edit="${r.id}">ބަދަލުކުރޭ</button>
        <button class="btn-small danger" data-delete="${r.id}">ފޮހެލާ</button>
      </div>
    </div>`).join('');
}

$('admin-search').addEventListener('input', (e) => { state.q = e.target.value; renderList(); });

$('admin-list').addEventListener('click', async (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;
  if (editId) openEditor(state.records.find((r) => r.id === editId));
  if (deleteId) {
    const r = state.records.find((x) => x.id === deleteId);
    if (!confirm(`"${r.title}" ފޮހެލަން ބޭނުންތޯ؟`)) return;
    const { error } = await db.from('records').delete().eq('id', deleteId);
    if (error) return toast('ފޮހެލައެއް ނުލެވުނު');
    toast('ފޮހެލެވިއްޖެ');
    loadRecords();
  }
});

// --- Editor ---

const form = $('record-form');

function openEditor(record) {
  form.reset();
  $('form-error').hidden = true;
  state.editingId = record?.id ?? null;
  $('editor-title').textContent = record ? 'ރެކޯޑު ބަދަލުކުރުން' : 'އައު ރެކޯޑެއް';
  if (record) {
    for (const f of FIELDS) {
      if (f === 'type') form.querySelector(`input[name="type"][value="${record.type}"]`).checked = true;
      else form[f].value = record[f] ?? '';
    }
  }
  $('editor').showModal();
}

function readForm() {
  const row = {};
  for (const f of FIELDS) {
    const v = f === 'type' ? form.querySelector('input[name="type"]:checked')?.value : form[f].value.trim();
    row[f] = v === '' || v === undefined ? null : v;
  }
  if (row.participants !== null) row.participants = Number(row.participants);
  return row;
}

$('new-record').addEventListener('click', () => openEditor(null));
$('editor-close').addEventListener('click', () => $('editor').close());
$('cancel').addEventListener('click', () => $('editor').close());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const row = readForm();
  const btn = $('save');
  btn.disabled = true;
  const { error } = state.editingId
    ? await db.from('records').update(row).eq('id', state.editingId)
    : await db.from('records').insert(row);
  btn.disabled = false;
  if (error) {
    $('form-error').textContent = 'ރައްކާ ނުކުރެވުނު: ' + error.message;
    $('form-error').hidden = false;
    return;
  }
  $('editor').close();
  toast('ރައްކާކުރެވިއްޖެ');
  loadRecords();
});

// --- Start ---

if (!window.supabaseReady()) {
  show('setup');
} else {
  db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  db.auth.getSession().then(({ data }) => onSession(data.session));
}

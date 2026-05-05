let todos = [
  { id: 1, text: 'Design the new landing page',    done: false, created: Date.now() - 86400000 },
  { id: 2, text: 'Fix bug in authentication flow', done: true,  created: Date.now() - 43200000 },
  { id: 3, text: 'Review pull requests',           done: false, created: Date.now() - 3600000  },
];
let nextId = 4;
let activeId = null;

// ── Icons ─────────────────────────────────────────────────────────────────────

function icon(type) {
  const icons = {
    view:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    edit:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    del:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
    check: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  };
  return icons[type] || '';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  const h = Math.floor(d / 3600000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const list  = document.getElementById('todo-list');
  const empty = document.getElementById('empty-state');
  const badge = document.getElementById('count-badge');

  badge.textContent = todos.filter(t => !t.done).length;

  if (!todos.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  list.innerHTML = todos.map(t => `
    <li class="todo-item${t.done ? ' done' : ''}" data-id="${t.id}">
      <button class="check-btn" data-action="toggle" data-id="${t.id}" title="Mark complete">
        ${icon('check')}
      </button>
      <span class="todo-text" title="${t.text}">${t.text}</span>
      <div class="todo-actions">
        <button class="action-btn view" data-action="view" data-id="${t.id}" title="View">${icon('view')}</button>
        <button class="action-btn edit" data-action="edit" data-id="${t.id}" title="Edit">${icon('edit')}</button>
        <button class="action-btn del"  data-action="delete" data-id="${t.id}" title="Remove">${icon('del')}</button>
      </div>
    </li>
  `).join('');
}

// ── Actions ───────────────────────────────────────────────────────────────────

function addTodo() {
  const input = document.getElementById('todo-input');
  const val = input.value.trim();
  if (!val) return;
  todos.unshift({ id: nextId++, text: val, done: false, created: Date.now() });
  input.value = '';
  render();
}

function toggleDone(id) {
  const t = todos.find(t => t.id === id);
  if (t) t.done = !t.done;
  render();
}

function viewTodo(id) {
  const t = todos.find(t => t.id === id);
  if (!t) return;
  document.getElementById('view-text').textContent = t.text;
  document.getElementById('view-meta').textContent =
    `Created ${timeAgo(t.created)} · Status: ${t.done ? 'completed' : 'active'}`;
  openModal('view-modal');
}

function editTodo(id) {
  const t = todos.find(t => t.id === id);
  if (!t) return;
  activeId = id;
  document.getElementById('edit-input').value = t.text;
  openModal('edit-modal');
  setTimeout(() => document.getElementById('edit-input').focus(), 50);
}

function saveEdit() {
  const val = document.getElementById('edit-input').value.trim();
  if (!val) return;
  const t = todos.find(t => t.id === activeId);
  if (t) t.text = val;
  closeModal('edit-modal');
  render();
}

function deleteTodo(id) {
  activeId = id;
  openModal('del-modal');
}

function confirmDelete() {
  todos = todos.filter(t => t.id !== activeId);
  closeModal('del-modal');
  render();
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.getElementById('add-btn').addEventListener('click', addTodo);

document.getElementById('todo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// Delegate all list actions from the ul
document.getElementById('todo-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (action === 'toggle') toggleDone(id);
  if (action === 'view')   viewTodo(id);
  if (action === 'edit')   editTodo(id);
  if (action === 'delete') deleteTodo(id);
});

// Modal buttons
document.getElementById('view-close').addEventListener('click',  () => closeModal('view-modal'));
document.getElementById('edit-cancel').addEventListener('click', () => closeModal('edit-modal'));
document.getElementById('edit-save').addEventListener('click',   saveEdit);
document.getElementById('del-cancel').addEventListener('click',  () => closeModal('del-modal'));
document.getElementById('del-confirm').addEventListener('click', confirmDelete);

document.getElementById('edit-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEdit();
});

// Close modals by clicking the backdrop
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────

render();
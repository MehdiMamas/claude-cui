const defaults = [
  { label: 'Explain', text: 'Explain how this works.' },
  { label: 'Review', text: 'Review this and suggest improvements.' },
  { label: 'Test', text: 'Suggest tests for this change.' }
];
const $ = id => document.getElementById(id);
let actions = defaults.map(action => ({ ...action }));
let editing = false;
function status(message) { $('status').textContent = message; }
try {
  const saved = JSON.parse(localStorage.getItem('actions'));
  if (Array.isArray(saved) && saved.every(a => a && typeof a.label === 'string' && typeof a.text === 'string')) actions = saved;
  $('draft').value = localStorage.getItem('draft') || '';
} catch { status('Saved settings could not be read. Using example buttons.'); }
function save() {
  try { localStorage.setItem('actions', JSON.stringify(actions)); localStorage.setItem('draft', $('draft').value); }
  catch { status('Could not save on this device. Your draft is still available to copy.'); }
}
function render() {
  $('actions').replaceChildren();
  actions.forEach((action, index) => {
    const group = document.createElement('div'); group.className = 'action';
    const button = document.createElement('button'); button.textContent = action.label; button.title = action.text;
    button.addEventListener('click', () => {
      $('draft').value = $('draft').value ? $('draft').value + '\n\n' + action.text : action.text;
      status(action.label + ' appended'); save();
    });
    group.append(button);
    if (editing) {
      const remove = document.createElement('button'); remove.textContent = '×'; remove.className = 'remove'; remove.setAttribute('aria-label', 'Remove ' + action.label);
      remove.addEventListener('click', () => { actions.splice(index, 1); save(); render(); }); group.append(remove);
    }
    $('actions').append(group);
  });
  if (!actions.length) $('actions').textContent = 'Add your first button using Edit buttons.';
}
$('edit').addEventListener('click', () => { editing = !editing; $('editor').hidden = !editing; $('edit').textContent = editing ? 'Done' : 'Edit buttons'; render(); });
$('editor').addEventListener('submit', event => {
  event.preventDefault(); const label = $('label').value.trim(); const text = $('text').value.trim();
  if (!label || !text) return;
  actions.push({ label, text }); save(); render(); $('editor').reset(); status('Button added');
});
$('reset').addEventListener('click', () => {
  if (!confirm('Replace your buttons with the three examples?')) return;
  actions = defaults.map(a => ({ ...a })); save(); render();
});
$('draft').addEventListener('input', save);
$('clear').addEventListener('click', () => {
  if ($('draft').value && !confirm('Clear your draft?')) return;
  $('draft').value = ''; save(); status('Draft cleared');
});
$('copy').addEventListener('click', async () => {
  if (!$('draft').value.trim()) { status('Add some text first.'); return; }
  try { await window.companion.copy($('draft').value); status('Copied. Paste into Claude when you’re ready.'); }
  catch { status('Copy failed. Select the draft and copy it manually.'); }
});
$('pin').addEventListener('change', async () => {
  try { await window.companion.pin($('pin').checked); }
  catch { status('Could not change window pinning.'); }
});
render();

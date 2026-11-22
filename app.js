'use strict';

/* ======================================================
   Mi Súper — lista de compras personal.
   Todo se guarda SOLO en este teléfono (localStorage).
   No usa internet, cuenta, cámara, contactos ni ubicación.
   ====================================================== */

const STORAGE_KEY = 'misuper.v1';

const CATEGORIES = [
  { id: 'frutas',    label: '🥑 Frutas y verduras' },
  { id: 'carnes',    label: '🥩 Carnes y pescado' },
  { id: 'lacteos',   label: '🧀 Lácteos y huevo' },
  { id: 'pan',       label: '🥖 Pan y tortillas' },
  { id: 'despensa',  label: '🥫 Despensa' },
  { id: 'bebidas',   label: '🥤 Bebidas' },
  { id: 'congelados',label: '🧊 Congelados' },
  { id: 'limpieza',  label: '🧽 Limpieza y hogar' },
  { id: 'personal',  label: '🧴 Cuidado personal' },
  { id: 'otros',     label: '📦 Otros' },
];

// Palabras clave para adivinar el pasillo automáticamente
const KEYWORDS = {
  frutas: 'manzana platano banana jitomate tomate cebolla aguacate limon papa zanahoria lechuga chile ajo naranja fresa pepino calabaza cilantro perejil uva mango pina melon sandia papaya brocoli espinaca elote nopal fruta verdura champinon pera kiwi',
  carnes: 'pollo carne res cerdo jamon salchicha pescado chorizo tocino molida bistec pechuga camaron salmon arrachera milanesa costilla',
  lacteos: 'leche queso yogur yogurt crema mantequilla huevo huevos panela requeson',
  pan: 'pan tortilla tortillas bolillo telera baguette tostadas concha',
  despensa: 'arroz frijol frijoles pasta sopa aceite azucar sal cafe cereal atun harina galletas salsa mayonesa catsup mostaza lenteja avena miel chocolate especias pimienta consome enlatado granola',
  bebidas: 'agua refresco jugo cerveza vino soda te leche-de-almendra electrolit',
  congelados: 'helado hielo congelado congelada nuggets papas-fritas pizza',
  limpieza: 'jabon detergente cloro papel servilletas suavizante esponja fabuloso pinol escoba bolsas basura trapo lavatrastes aluminio',
  personal: 'shampoo champu acondicionador desodorante cepillo pasta-dental crema-dental rastrillo toallas algodon higienico',
};

// ---------- Estado ----------
let state = load();
let currentCat = 'auto';
let lastRemoved = null;
let toastTimer = null;
let wakeLock = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return { items: data.items || [], history: data.history || {}, view: data.view || 'list' };
    }
  } catch (e) { /* datos dañados o no disponibles: se empieza de cero */ }
  return { items: [], history: {}, view: 'list' };
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || CATEGORIES.at(-1)).label;

function guessCategory(name) {
  const n = norm(name);
  // ¿Ya lo compraste antes? Usa el mismo pasillo.
  if (state.history[n]) return state.history[n].cat;
  const words = n.split(/\s+/);
  // Primero frases de dos palabras (p. ej. "pasta dental"), luego palabras sueltas
  for (let i = 0; i < words.length - 1; i++) {
    const pair = words[i] + '-' + words[i + 1];
    for (const [cat, list] of Object.entries(KEYWORDS)) {
      if (list.split(' ').includes(pair)) return cat;
    }
  }
  for (const w of words) {
    const forms = [w, w.replace(/s$/, ''), w.replace(/es$/, '')]; // "aguacates", "limones"
    for (const [cat, list] of Object.entries(KEYWORDS)) {
      const kw = list.split(' ');
      if (forms.some((f) => kw.includes(f))) return cat;
    }
  }
  return 'otros';
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function vibrate(ms) { if (navigator.vibrate) navigator.vibrate(ms); }

// ---------- Acciones ----------
function addItem(rawName, qty, cat) {
  const name = capitalize(rawName.trim().replace(/\s+/g, ' '));
  if (!name) return;
  const key = norm(name);
  const finalCat = cat === 'auto' ? guessCategory(name) : cat;

  // Si ya está pendiente en la lista, solo actualiza la cantidad
  const existing = state.items.find((i) => norm(i.name) === key && !i.done);
  if (existing) {
    if (qty) existing.qty = qty;
    existing.cat = finalCat;
  } else {
    state.items.push({ id: uid(), name, qty: qty.trim(), cat: finalCat, done: false, t: Date.now() });
  }
  const h = state.history[key] || { name, cat: finalCat, count: 0 };
  h.count += 1; h.cat = finalCat; h.name = name;
  state.history[key] = h;
  save(); render();
}

function toggleItem(id) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  item.done = !item.done;
  vibrate(item.done ? 15 : 8);
  save(); render();
}

function removeItem(id) {
  const idx = state.items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const [item] = state.items.splice(idx, 1);
  lastRemoved = { items: [item], index: idx };
  save(); render();
  showToast(`"${item.name}" eliminado`);
}

function finishShopping() {
  const done = state.items.filter((i) => i.done);
  if (!done.length) return;
  lastRemoved = { items: done, index: -1 };
  state.items = state.items.filter((i) => !i.done);
  save(); render();
  showToast(`${done.length} producto${done.length > 1 ? 's' : ''} comprado${done.length > 1 ? 's' : ''} ✓`);
}

function undo() {
  if (!lastRemoved) return;
  if (lastRemoved.index >= 0) state.items.splice(lastRemoved.index, 0, ...lastRemoved.items);
  else state.items.push(...lastRemoved.items);
  lastRemoved = null;
  hideToast(); save(); render();
}

function showToast(text) {
  $('#toast-text').textContent = text;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() { $('#toast').hidden = true; }

// ---------- Vistas ----------
function setView(view) {
  state.view = view;
  save();
  $('#tab-list').setAttribute('aria-selected', view === 'list');
  $('#tab-shop').setAttribute('aria-selected', view === 'shop');
  $('#view-list').hidden = view !== 'list';
  $('#view-shop').hidden = view !== 'shop';
  window.scrollTo({ top: 0 });
  keepScreenOn(view === 'shop');
  render();
}

// En el súper la pantalla no se apaga (no requiere permisos)
async function keepScreenOn(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) {
      await wakeLock.release(); wakeLock = null;
    }
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.view === 'shop') keepScreenOn(true);
});

function groupByCat(items) {
  const groups = new Map();
  for (const c of CATEGORIES) groups.set(c.id, []);
  for (const it of items) (groups.get(it.cat) || groups.get('otros')).push(it);
  return [...groups.entries()].filter(([, list]) => list.length);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function renderCats() {
  const box = $('#cat-picker');
  box.innerHTML = '';
  const all = [{ id: 'auto', label: '✨ Automático' }, ...CATEGORIES];
  for (const c of all) {
    const b = el('button', 'cat-chip', c.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', c.id === currentCat);
    b.addEventListener('click', () => { currentCat = c.id; renderCats(); $('#item-name').focus(); });
    box.appendChild(b);
  }
}

function renderSuggestions() {
  const typed = norm($('#item-name').value);
  const pending = new Set(state.items.filter((i) => !i.done).map((i) => norm(i.name)));
  let list = Object.entries(state.history)
    .filter(([k]) => !pending.has(k))
    .filter(([k]) => !typed || k.includes(typed))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12);

  const box = $('#suggestion-chips');
  box.innerHTML = '';
  $('#suggestions').hidden = list.length === 0;
  for (const [, h] of list) {
    const b = el('button', 'chip', h.name);
    b.type = 'button';
    b.addEventListener('click', () => { addItem(h.name, '', h.cat); $('#item-name').value = ''; renderSuggestions(); });
    box.appendChild(b);
  }
}

function renderList() {
  const root = $('#list-groups');
  root.innerHTML = '';
  $('#empty-list').hidden = state.items.length > 0;
  for (const [cat, items] of groupByCat(state.items)) {
    const g = el('div', 'group');
    g.appendChild(el('h3', null, catLabel(cat)));
    for (const it of items) {
      const row = el('div', 'item' + (it.done ? ' is-done' : ''));
      row.appendChild(el('span', 'name', it.name));
      if (it.qty) row.appendChild(el('span', 'qty', it.qty));
      const del = el('button', 'del', '✕');
      del.setAttribute('aria-label', 'Eliminar ' + it.name);
      del.addEventListener('click', () => removeItem(it.id));
      row.appendChild(del);
      g.appendChild(row);
    }
    root.appendChild(g);
  }
}

function shopButton(it) {
  const b = el('button', 'shop-item' + (it.done ? ' is-done' : ''));
  b.appendChild(el('span', 'box'));
  b.appendChild(el('span', 'name', it.name));
  if (it.qty) b.appendChild(el('span', 'qty', it.qty));
  b.addEventListener('click', () => toggleItem(it.id));
  return b;
}

function renderShop() {
  const pending = state.items.filter((i) => !i.done);
  const done = state.items.filter((i) => i.done);
  const root = $('#shop-groups');
  root.innerHTML = '';
  for (const [cat, items] of groupByCat(pending)) {
    const g = el('div', 'group');
    g.appendChild(el('h3', null, catLabel(cat)));
    items.forEach((it) => g.appendChild(shopButton(it)));
    root.appendChild(g);
  }
  $('#empty-shop').hidden = pending.length > 0;
  $('#empty-shop').textContent = state.items.length ? '¡Ya tienes todo! 🎉' : 'Tu lista está vacía.';
  $('#cart-section').hidden = done.length === 0;
  $('#cart-count').textContent = `(${done.length})`;
  const cart = $('#cart-items');
  cart.innerHTML = '';
  done.forEach((it) => cart.appendChild(shopButton(it)));
}

function renderHeader() {
  const total = state.items.length;
  const done = state.items.filter((i) => i.done).length;
  $('#counter').textContent = total
    ? `${done} de ${total} en el carrito · faltan ${total - done}`
    : 'Lista vacía';
  $('#progress-bar').style.width = total ? `${(done / total) * 100}%` : '0';
}

function render() {
  renderHeader();
  if (state.view === 'list') { renderList(); renderSuggestions(); }
  else renderShop();
}

// ---------- Eventos ----------
$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#item-name').value;
  if (!name.trim()) return;
  addItem(name, $('#item-qty').value, currentCat);
  $('#item-name').value = '';
  $('#item-qty').value = '';
  currentCat = 'auto';
  renderCats();
  $('#item-name').focus();
});
$('#item-name').addEventListener('input', renderSuggestions);
$('#tab-list').addEventListener('click', () => setView('list'));
$('#tab-shop').addEventListener('click', () => setView('shop'));
$('#finish-btn').addEventListener('click', finishShopping);
$('#toast-undo').addEventListener('click', undo);

// ---------- Inicio ----------
renderCats();
setView(state.view);

// Permite usarla sin internet una vez instalada
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

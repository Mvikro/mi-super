'use strict';

/* ======================================================
   Mandado — lista de compras para todo.
   Todo se guarda SOLO en este teléfono (localStorage).
   No usa internet, cuenta, cámara, contactos ni ubicación.
   ====================================================== */

const STORAGE_KEY = 'mandado.v1';
const OLD_KEY = 'misuper.v1'; // versión anterior "Mi Súper"

// ---------- Lugares donde se compra ----------
const STORES = [
  { id: 'super',      emoji: '🛒', label: 'Súper' },
  { id: 'verduleria', emoji: '🥬', label: 'Verdulería / mercado' },
  { id: 'carniceria', emoji: '🥩', label: 'Carnicería / pollería' },
  { id: 'tiendita',   emoji: '🏪', label: 'Tiendita de la esquina' },
  { id: 'farmacia',   emoji: '💊', label: 'Farmacia' },
  { id: 'tlapaleria', emoji: '🔩', label: 'Tlapalería / ferretería' },
  { id: 'hogar',      emoji: '🛋️', label: 'Hogar y muebles' },
  { id: 'papeleria',  emoji: '✏️', label: 'Papelería' },
  { id: 'ropa',       emoji: '👕', label: 'Ropa y calzado' },
  { id: 'mascotas',   emoji: '🐾', label: 'Mascotas' },
  { id: 'enlinea',    emoji: '📦', label: 'En línea' },
  { id: 'otros',      emoji: '📌', label: 'Otros' },
];

// ---------- Pasillos dentro del súper ----------
const AISLES = [
  { id: 'frutas',     label: '🥑 Frutas y verduras' },
  { id: 'carnes',     label: '🥩 Carnes y salchichonería' },
  { id: 'lacteos',    label: '🧀 Lácteos y huevo' },
  { id: 'pan',        label: '🥖 Pan y tortillas' },
  { id: 'despensa',   label: '🥫 Despensa' },
  { id: 'bebidas',    label: '🥤 Bebidas' },
  { id: 'congelados', label: '🧊 Congelados' },
  { id: 'limpieza',   label: '🧽 Limpieza' },
  { id: 'personal',   label: '🧴 Cuidado personal' },
  { id: 'otros',      label: '📦 Otros' },
];

/* ---------- Diccionario para clasificar ----------
   [lugar, pasillo-si-va-al-súper, palabras]
   Palabras de dos en dos se escriben con guion: "papel-higienico".
   Se ignoran "de", "para", "la", etc.: "pasta de dientes" = "pasta-dientes". */
const RULES = [
  ['verduleria', 'frutas', 'manzana platano banana jitomate tomate tomatillo cebolla aguacate limon papa zanahoria lechuga chile ajo naranja fresa pepino calabaza calabacita cilantro perejil uva mango pina melon sandia papaya brocoli coliflor espinaca elote nopal fruta verdura champinon hongo pera kiwi guayaba mandarina toronja jicama betabel apio rabano ejote chayote epazote hierbabuena jengibre durazno ciruela tuna chicharo camote frambuesa zarzamora arandano coco pimiento acelga'],
  ['carniceria', 'carnes', 'pollo carne res cerdo puerco chorizo molida bistec pechuga milanesa costilla arrachera chuleta pierna muslo alitas carnitas longaniza higado cecina suadero filete'],
  ['super', 'carnes', 'jamon salchicha tocino salami pepperoni pescado camaron salmon tilapia surimi marisco atun-fresco'],
  ['super', 'lacteos', 'leche queso yogur yogurt crema mantequilla huevo panela requeson jocoque margarina'],
  ['super', 'pan', 'pan bolillo telera baguette tostada concha pan-dulce pan-integral pan-caja bimbo'],
  ['super', 'despensa', 'arroz frijol pasta sopa aceite azucar sal cafe cereal atun harina galleta salsa mayonesa catsup mostaza lenteja avena miel chocolate especia pimienta consome granola mermelada crema-cacahuate vinagre gelatina pure leche-condensada sardina chipotle aderezo tortilla-harina'],
  ['super', 'bebidas', 'agua jugo vino cerveza te leche-almendra electrolit suero bebida tequila mezcal licor'],
  ['super', 'congelados', 'helado congelado congelada nugget papas-congeladas pizza verduras-congeladas'],
  ['super', 'limpieza', 'jabon detergente cloro servilleta suavizante esponja fabuloso pinol lavatrastes aluminio papel papel-higienico bolsas-basura basura fibra desinfectante aromatizante insecticida raid servitoalla toallita escoba trapeador recogedor cubeta jerga'],
  ['super', 'personal', 'shampoo champu acondicionador desodorante cepillo pasta-dental crema-dental pasta-dientes cepillo-dientes rastrillo toallas-femeninas toallas-sanitarias algodon hilo-dental enjuague jabon-tocador crema-corporal gel panal'],
  ['farmacia', 'personal', 'medicina medicamento pastilla paracetamol ibuprofeno aspirina vitamina curita gasa alcohol agua-oxigenada termometro jarabe antibiotico antiacido omeprazol loratadina suero-oral protector-solar bloqueador gota pomada venda condon preservativo receta cubrebocas naproxeno diclofenaco melatonina'],
  ['tiendita', 'despensa', 'refresco coca tortilla botana papitas sabritas dulce chicle hielo cigarro garrafon'],
  ['tlapaleria', 'otros', 'pegamento resistol kola-loca silicon clavo tornillo taquete pija foco pintura brocha rodillo cinta cinta-aislar cinta-canela pila bateria herramienta martillo desarmador pinza llave cable extension contacto apagador manguera candado lija thinner sellador impermeabilizante cemento yeso tubo pvc cerradura bisagra cadena alambre lubricante flexometro nivel taladro broca escalera interruptor socket tuerca rondana regadera llave-agua mezcladora teflon'],
  ['hogar', 'otros', 'mueble repisa cortina tapete lampara almohada sabana cobija edredon toalla organizador cojin silla mesa escritorio espejo cuadro maceta colchon closet ropero librero sarten olla vaso plato cubierto taza cuchillo tupper recipiente licuadora cafetera tostador microondas plancha ventilador perchero gancho canasta cesto bote-basura tabla-picar sofa sillon buro comoda zapatera reloj decoracion florero vela tendedero burro-planchar charola jarra termo'],
  ['papeleria', 'otros', 'cuaderno libreta pluma lapiz lapices hoja folder sobre cartulina marcador plumon post-it nota engrapadora grapa clip sacapuntas goma borrador regla carpeta etiqueta impresion copia tinta toner papel-bond'],
  ['ropa', 'otros', 'camisa camiseta playera pantalon calcetin zapato tenis chamarra sudadera ropa calzon boxer brasier pijama vestido falda cinturon gorra sombrero sandalia chancla sueter jeans short uniforme bufanda guante'],
  ['mascotas', 'otros', 'croqueta arena alimento-perro alimento-gato collar correa juguete-perro premio-perro desparasitante'],
  ['enlinea', 'otros', 'cargador audifono funda mouse teclado memoria usb cable-usb cable-hdmi hdmi bocina celular tablet laptop monitor control router adaptador smartwatch libro kindle impresora disco-duro webcam'],
];

const STOPWORDS = new Set(['de', 'del', 'para', 'la', 'el', 'los', 'las', 'en', 'con', 'y', 'un', 'una', 'unos', 'unas', 'a', 'al']);

// Índice: palabra -> { store, aisle }
const INDEX = new Map();
for (const [store, aisle, words] of RULES) {
  for (const w of words.split(' ')) if (!INDEX.has(w)) INDEX.set(w, { store, aisle });
}

// ---------- Estado ----------
let state; // se carga al final, cuando todo está definido
let addStore = 'auto';
let lastRemoved = null;
let toastTimer = null;
let toastFn = null;
let wakeLock = null;
let editing = null; // { id, store, aisle }

function emptyState() { return { items: [], history: {}, view: 'list', shopStore: 'all' }; }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(emptyState(), JSON.parse(raw));
    // Pasa la lista de la versión "Mi Súper" a la nueva
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const data = JSON.parse(old);
      const s = emptyState();
      s.items = (data.items || []).map((i) => {
        const g = guess(i.name, {});
        return { id: i.id, name: i.name, qty: i.qty || '', store: g.store, aisle: g.aisle, done: !!i.done, t: i.t || Date.now() };
      });
      for (const [k, h] of Object.entries(data.history || {})) {
        const g = guess(h.name, {});
        s.history[k] = { name: h.name, store: g.store, aisle: g.aisle, count: h.count || 1 };
      }
      return s;
    }
  } catch (e) { /* datos dañados o no disponibles: se empieza de cero */ }
  return emptyState();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const store = (id) => STORES.find((s) => s.id === id) || STORES.at(-1);
const storeName = (id) => `${store(id).emoji} ${store(id).label}`;
const aisleName = (id) => (AISLES.find((a) => a.id === id) || AISLES.at(-1)).label;
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const vibrate = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

function lookup(word) {
  for (const f of [word, word.replace(/s$/, ''), word.replace(/es$/, '')]) {
    if (INDEX.has(f)) return INDEX.get(f);
  }
  return null;
}

// Adivina dónde se compra algo. Si ya lo compraste antes, respeta dónde lo pusiste.
function guess(name, history = state.history) {
  const n = norm(name);
  if (history[n]) return { store: history[n].store, aisle: history[n].aisle || 'otros' };
  const words = n.split(/[^a-z0-9ñ-]+/).filter((w) => w && !STOPWORDS.has(w));
  for (let i = 0; i < words.length - 1; i++) {        // primero frases de 2 palabras
    const hit = lookup(words[i] + '-' + words[i + 1]) || INDEX.get(words[i] + '-' + words[i + 1]);
    if (hit) return { ...hit };
  }
  for (const w of words) {                              // luego palabras sueltas
    const hit = lookup(w);
    if (hit) return { ...hit };
  }
  return { store: 'otros', aisle: 'otros' };
}

// Pasillo sugerido si algo se mueve al súper
function aisleFor(name) {
  const n = norm(name);
  const words = n.split(/[^a-z0-9ñ-]+/).filter((w) => w && !STOPWORDS.has(w));
  for (const w of words) { const hit = lookup(w); if (hit) return hit.aisle; }
  return 'otros';
}

function remember(name, storeId, aisle) {
  const key = norm(name);
  const h = state.history[key] || { name, count: 0 };
  h.name = name; h.store = storeId; h.aisle = aisle;
  state.history[key] = h;
  return h;
}

// ---------- Acciones ----------
function addItem(rawName, qty, chosenStore) {
  const name = capitalize(rawName.trim().replace(/\s+/g, ' '));
  if (!name) return null;
  const key = norm(name);
  let { store: st, aisle } = guess(name);
  if (chosenStore !== 'auto') {
    st = chosenStore;
    if (st === 'super' && aisle === 'otros') aisle = aisleFor(name);
  }

  let item = state.items.find((i) => norm(i.name) === key && !i.done);
  if (item) {
    if (qty) item.qty = qty.trim();
    item.store = st; item.aisle = aisle;
  } else {
    item = { id: uid(), name, qty: (qty || '').trim(), store: st, aisle, done: false, t: Date.now() };
    state.items.push(item);
  }
  remember(name, st, aisle).count += 1;
  save(); render();
  return item;
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
  showToast(`"${item.name}" eliminado`, 'Deshacer', undo);
}

function finishShopping() {
  const inFilter = (i) => state.shopStore === 'all' || i.store === state.shopStore;
  const done = state.items.filter((i) => i.done && inFilter(i));
  if (!done.length) return;
  lastRemoved = { items: done, index: -1 };
  state.items = state.items.filter((i) => !(i.done && inFilter(i)));
  save(); render();
  showToast(`${done.length} comprado${done.length > 1 ? 's' : ''} ✓`, 'Deshacer', undo);
}

function undo() {
  if (!lastRemoved) return;
  if (lastRemoved.index >= 0) state.items.splice(lastRemoved.index, 0, ...lastRemoved.items);
  else state.items.push(...lastRemoved.items);
  lastRemoved = null;
  hideToast(); save(); render();
}

function showToast(text, actionLabel, fn) {
  $('#toast-text').textContent = text;
  $('#toast-action').textContent = actionLabel || '';
  $('#toast-action').hidden = !actionLabel;
  toastFn = fn || null;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() { $('#toast').hidden = true; toastFn = null; }

// ---------- Hoja de edición ----------
function openEditor(id) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  editing = { id, store: it.store, aisle: it.aisle || 'otros' };
  $('#edit-name').value = it.name;
  $('#edit-qty').value = it.qty || '';
  renderEditor();
  $('#sheet-backdrop').hidden = false;
  hideToast();
}

function renderEditor() {
  const stores = $('#edit-stores');
  stores.innerHTML = '';
  for (const s of STORES) {
    const b = chipButton(`${s.emoji} ${s.label}`, editing.store === s.id, () => {
      editing.store = s.id;
      if (s.id === 'super' && editing.aisle === 'otros') editing.aisle = aisleFor($('#edit-name').value);
      renderEditor();
    });
    stores.appendChild(b);
  }
  $('#edit-aisle-box').hidden = editing.store !== 'super';
  const aisles = $('#edit-aisles');
  aisles.innerHTML = '';
  for (const a of AISLES) {
    aisles.appendChild(chipButton(a.label, editing.aisle === a.id, () => { editing.aisle = a.id; renderEditor(); }));
  }
}

function closeEditor() { $('#sheet-backdrop').hidden = true; editing = null; }

function saveEditor() {
  const it = state.items.find((i) => i.id === editing.id);
  if (it) {
    const name = capitalize($('#edit-name').value.trim().replace(/\s+/g, ' ')) || it.name;
    it.name = name;
    it.qty = $('#edit-qty').value.trim();
    it.store = editing.store;
    it.aisle = editing.aisle;
    remember(name, it.store, it.aisle); // la próxima vez irá al mismo lugar
  }
  closeEditor(); save(); render();
}

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

// De compras: la pantalla no se apaga (no requiere permisos)
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

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function chipButton(label, pressed, onClick) {
  const b = el('button', 'cat-chip', label);
  b.type = 'button';
  b.setAttribute('aria-pressed', pressed);
  b.addEventListener('click', onClick);
  return b;
}

// Agrupa por lugar, en el orden de STORES
function byStore(items) {
  return STORES.map((s) => [s.id, items.filter((i) => i.store === s.id)]).filter(([, l]) => l.length);
}
// Agrupa por pasillo del súper
function byAisle(items) {
  return AISLES.map((a) => [a.id, items.filter((i) => (i.aisle || 'otros') === a.id)]).filter(([, l]) => l.length);
}

function renderStorePicker() {
  const box = $('#store-picker');
  box.innerHTML = '';
  box.appendChild(chipButton('✨ Automático', addStore === 'auto', () => { addStore = 'auto'; renderStorePicker(); }));
  for (const s of STORES) {
    box.appendChild(chipButton(`${s.emoji} ${s.label}`, addStore === s.id, () => { addStore = s.id; renderStorePicker(); $('#item-name').focus(); }));
  }
}

function renderSuggestions() {
  const typed = norm($('#item-name').value);
  const pending = new Set(state.items.filter((i) => !i.done).map((i) => norm(i.name)));
  const list = Object.entries(state.history)
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
    b.addEventListener('click', () => { addItem(h.name, '', h.store); $('#item-name').value = ''; renderSuggestions(); });
    box.appendChild(b);
  }
}

function listRow(it) {
  const row = el('div', 'item' + (it.done ? ' is-done' : ''));
  const main = el('button', 'item-main');
  main.type = 'button';
  main.appendChild(el('span', 'name', it.name));
  if (it.qty) main.appendChild(el('span', 'qty', it.qty));
  main.addEventListener('click', () => openEditor(it.id));
  row.appendChild(main);
  const del = el('button', 'del', '✕');
  del.setAttribute('aria-label', 'Eliminar ' + it.name);
  del.addEventListener('click', () => removeItem(it.id));
  row.appendChild(del);
  return row;
}

function storeHeader(id, count) {
  const h = el('h2', 'store-title');
  h.appendChild(el('span', null, storeName(id)));
  h.appendChild(el('span', 'count', String(count)));
  return h;
}

function renderList() {
  const root = $('#list-groups');
  root.innerHTML = '';
  $('#empty-list').hidden = state.items.length > 0;
  $('#list-hint').hidden = state.items.length === 0;
  for (const [sid, items] of byStore(state.items)) {
    const g = el('div', 'store-group');
    g.appendChild(storeHeader(sid, items.filter((i) => !i.done).length));
    if (sid === 'super') {
      for (const [aid, list] of byAisle(items)) {
        g.appendChild(el('h3', 'aisle-title', aisleName(aid)));
        list.forEach((it) => g.appendChild(listRow(it)));
      }
    } else {
      items.forEach((it) => g.appendChild(listRow(it)));
    }
    root.appendChild(g);
  }
}

function shopButton(it, showStore) {
  const b = el('button', 'shop-item' + (it.done ? ' is-done' : ''));
  b.appendChild(el('span', 'box'));
  const txt = el('span', 'name', it.name);
  b.appendChild(txt);
  if (showStore && it.done) b.appendChild(el('span', 'where', store(it.store).emoji));
  if (it.qty) b.appendChild(el('span', 'qty', it.qty));
  b.addEventListener('click', () => toggleItem(it.id));
  return b;
}

function renderShopFilter() {
  const box = $('#shop-filter');
  box.innerHTML = '';
  const counts = {};
  for (const i of state.items) counts[i.store] = (counts[i.store] || 0) + (i.done ? 0 : 1);
  const present = STORES.filter((s) => state.items.some((i) => i.store === s.id));
  if (state.shopStore !== 'all' && !present.some((s) => s.id === state.shopStore)) state.shopStore = 'all';
  const pending = state.items.filter((i) => !i.done).length;
  box.appendChild(chipButton(`Todo · ${pending}`, state.shopStore === 'all', () => { state.shopStore = 'all'; save(); render(); }));
  for (const s of present) {
    box.appendChild(chipButton(`${s.emoji} ${s.label} · ${counts[s.id] || 0}`, state.shopStore === s.id, () => {
      state.shopStore = s.id; save(); render(); window.scrollTo({ top: 0 });
    }));
  }
}

function renderShop() {
  renderShopFilter();
  const f = state.shopStore;
  const visible = state.items.filter((i) => f === 'all' || i.store === f);
  const pending = visible.filter((i) => !i.done);
  const done = visible.filter((i) => i.done);
  const root = $('#shop-groups');
  root.innerHTML = '';

  const addAisles = (parent, items) => {
    for (const [aid, list] of byAisle(items)) {
      parent.appendChild(el('h3', 'aisle-title', aisleName(aid)));
      list.forEach((it) => parent.appendChild(shopButton(it)));
    }
  };

  if (f === 'all') {
    for (const [sid, items] of byStore(pending)) {
      const g = el('div', 'store-group');
      g.appendChild(storeHeader(sid, items.length));
      if (sid === 'super') addAisles(g, items);
      else items.forEach((it) => g.appendChild(shopButton(it)));
      root.appendChild(g);
    }
  } else if (f === 'super') {
    addAisles(root, pending);
  } else {
    pending.forEach((it) => root.appendChild(shopButton(it)));
  }

  const empty = $('#empty-shop');
  empty.hidden = pending.length > 0;
  empty.textContent = !state.items.length ? 'Tu lista está vacía.'
    : f === 'all' ? '¡Ya tienes todo! 🎉' : `Nada pendiente en ${storeName(f)} 🎉`;

  $('#cart-section').hidden = done.length === 0;
  $('#cart-count').textContent = `(${done.length})`;
  const cart = $('#cart-items');
  cart.innerHTML = '';
  done.forEach((it) => cart.appendChild(shopButton(it, f === 'all')));
}

function renderHeader() {
  const total = state.items.length;
  const done = state.items.filter((i) => i.done).length;
  const pending = total - done;
  const places = new Set(state.items.filter((i) => !i.done).map((i) => i.store)).size;
  $('#counter').textContent = !total ? 'Nada pendiente'
    : pending === 0 ? `¡Listo! ${done} comprado${done > 1 ? 's' : ''}`
    : `${pending} pendiente${pending > 1 ? 's' : ''} en ${places} lugar${places > 1 ? 'es' : ''}`;
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
  const item = addItem(name, $('#item-qty').value, addStore);
  $('#item-name').value = '';
  $('#item-qty').value = '';
  addStore = 'auto';
  renderStorePicker();
  renderSuggestions();
  $('#item-name').focus();
  if (item) showToast(`${item.name} → ${storeName(item.store)}`, 'Cambiar', () => openEditor(item.id));
});
$('#item-name').addEventListener('input', renderSuggestions);
$('#tab-list').addEventListener('click', () => setView('list'));
$('#tab-shop').addEventListener('click', () => setView('shop'));
$('#finish-btn').addEventListener('click', finishShopping);
$('#toast-action').addEventListener('click', () => { const fn = toastFn; hideToast(); if (fn) fn(); });
$('#edit-save').addEventListener('click', saveEditor);
$('#edit-delete').addEventListener('click', () => { const id = editing.id; closeEditor(); removeItem(id); });
$('#sheet-backdrop').addEventListener('click', (e) => { if (e.target.id === 'sheet-backdrop') closeEditor(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && editing) closeEditor(); });

// ---------- Inicio ----------
state = load();
save(); // guarda de inmediato si se migró desde "Mi Súper"
renderStorePicker();
setView(state.view);

// Permite usarla sin internet una vez instalada
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

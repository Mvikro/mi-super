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
  { id: 'super',      emoji: '🛒', label: 'Súper',                   short: 'Súper' },
  { id: 'verduleria', emoji: '🥬', label: 'Verdulería / mercado',    short: 'Mercado' },
  { id: 'carniceria', emoji: '🥩', label: 'Carnicería / pollería',   short: 'Carnicería' },
  { id: 'tiendita',   emoji: '🏪', label: 'Tiendita de la esquina',  short: 'Tiendita' },
  { id: 'farmacia',   emoji: '💊', label: 'Farmacia',                short: 'Farmacia' },
  { id: 'tlapaleria', emoji: '🔩', label: 'Tlapalería / ferretería', short: 'Ferretería' },
  { id: 'hogar',      emoji: '🛋️', label: 'Hogar y muebles',         short: 'Hogar' },
  { id: 'papeleria',  emoji: '✏️', label: 'Papelería',               short: 'Papelería' },
  { id: 'ropa',       emoji: '👕', label: 'Ropa y calzado',          short: 'Ropa' },
  { id: 'mascotas',   emoji: '🐾', label: 'Mascotas',                short: 'Mascotas' },
  { id: 'enlinea',    emoji: '📦', label: 'En línea',                short: 'En línea' },
  { id: 'otros',      emoji: '📌', label: 'Otros',                   short: 'Otros' },
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

/* ---------- Dónde se consigue cada cosa ----------
   [lugares del más fácil al menos fácil, pasillo-si-va-al-súper, palabras]
   Palabras de dos en dos con guion: "papel-higienico".
   Se ignoran "de", "para", "la", etc.: "pasta de dientes" = "pasta-dientes". */
const RULES = [
  // Comida fresca
  ['verduleria,super', 'frutas', 'manzana platano banana jitomate tomate tomatillo cebolla aguacate limon papa zanahoria lechuga chile ajo naranja fresa pepino calabaza calabacita cilantro perejil uva mango pina melon sandia papaya brocoli coliflor espinaca elote nopal fruta verdura champinon hongo pera kiwi guayaba mandarina toronja jicama betabel apio rabano ejote chayote epazote hierbabuena jengibre durazno ciruela tuna chicharo camote frambuesa zarzamora arandano coco pimiento acelga'],
  ['carniceria,super', 'carnes', 'pollo carne res cerdo puerco chorizo molida bistec pechuga milanesa costilla arrachera chuleta pierna muslo alitas carnitas longaniza higado cecina suadero filete'],
  ['super,tiendita', 'carnes', 'jamon salchicha tocino salami pepperoni'],
  ['super,verduleria', 'carnes', 'pescado camaron salmon tilapia surimi marisco'],
  ['super,tiendita', 'lacteos', 'leche queso yogur yogurt crema mantequilla huevo panela requeson jocoque margarina'],
  ['super,tiendita', 'pan', 'pan bolillo telera baguette tostada concha pan-dulce pan-integral pan-caja bimbo'],
  // Despensa
  ['super,tiendita,enlinea', 'despensa', 'arroz frijol pasta sopa aceite azucar sal cafe cereal atun galleta salsa mayonesa catsup mostaza lenteja avena chocolate consome sardina chipotle aderezo pure leche-condensada gelatina harina mermelada vinagre'],
  ['super,enlinea', 'despensa', 'granola especia pimienta miel quinoa chia crema-cacahuate aceite-oliva proteina'],
  ['super,tiendita', 'bebidas', 'agua jugo cerveza te leche-almendra electrolit suero bebida'],
  ['super,enlinea,tiendita', 'bebidas', 'vino tequila mezcal licor whisky ron'],
  ['super', 'congelados', 'helado congelado congelada nugget papas-congeladas pizza verduras-congeladas'],
  ['tiendita,super', 'despensa', 'refresco coca tortilla botana papitas sabritas dulce chicle hielo cigarro garrafon'],
  // Limpieza y cuidado personal
  ['super,tiendita,enlinea', 'limpieza', 'jabon detergente cloro servilleta suavizante esponja fabuloso pinol lavatrastes aluminio papel papel-higienico bolsas-basura basura fibra desinfectante aromatizante servitoalla toallita'],
  ['super,tlapaleria,verduleria', 'limpieza', 'escoba trapeador recogedor cubeta jerga'],
  ['super,tlapaleria', 'limpieza', 'insecticida raid veneno-ratas'],
  ['super,farmacia,tiendita', 'personal', 'shampoo champu acondicionador desodorante cepillo pasta-dental crema-dental pasta-dientes cepillo-dientes rastrillo toallas-femeninas toallas-sanitarias algodon hilo-dental enjuague jabon-tocador crema-corporal gel panal'],
  // Farmacia
  ['farmacia,super', 'personal', 'medicina medicamento pastilla paracetamol ibuprofeno aspirina curita gasa alcohol agua-oxigenada termometro jarabe antibiotico antiacido omeprazol loratadina suero-oral gota pomada venda receta cubrebocas naproxeno diclofenaco'],
  ['farmacia,super,enlinea', 'personal', 'vitamina protector-solar bloqueador melatonina colageno'],
  ['farmacia,super,tiendita', 'personal', 'condon preservativo'],
  // Ferretería
  ['tlapaleria,papeleria,super', 'otros', 'pegamento resistol kola-loca'],
  ['tiendita,super,tlapaleria,enlinea', 'otros', 'pila bateria'],
  ['tlapaleria,super,enlinea', 'otros', 'foco cinta cinta-aislar cinta-canela extension contacto apagador silicon clavo tornillo taquete pija lija lubricante candado manguera'],
  ['tlapaleria,enlinea', 'otros', 'herramienta martillo desarmador pinza llave flexometro nivel taladro broca escalera brocha rodillo pintura cerradura bisagra cadena alambre cable regadera llave-agua mezcladora interruptor'],
  ['tlapaleria', 'otros', 'cemento yeso impermeabilizante thinner sellador tubo pvc tuerca rondana teflon socket'],
  // Hogar
  ['hogar,enlinea', 'otros', 'mueble sofa sillon colchon closet ropero librero escritorio silla mesa buro comoda cuadro espejo florero lampara reloj decoracion'],
  ['enlinea,hogar,tlapaleria', 'otros', 'repisa organizador perchero gancho zapatera estante soporte'],
  ['hogar,enlinea,super', 'otros', 'cortina tapete cojin almohada sabana cobija edredon toalla vela'],
  ['hogar,super,verduleria,enlinea', 'otros', 'sarten olla vaso plato cubierto taza cuchillo tupper recipiente tabla-picar charola jarra termo canasta cesto bote-basura tendedero'],
  ['enlinea,hogar,super', 'otros', 'licuadora cafetera tostador microondas plancha ventilador burro-planchar freidora'],
  ['hogar,verduleria,enlinea', 'otros', 'maceta planta tierra-plantas'],
  ['tlapaleria,enlinea,super', 'otros', 'filtro purificador'],
  // Otros
  ['papeleria,super,enlinea', 'otros', 'cuaderno libreta pluma lapiz lapices hoja folder sobre cartulina marcador plumon post-it engrapadora grapa clip sacapuntas goma borrador regla carpeta etiqueta papel-bond'],
  ['papeleria', 'otros', 'impresion copia'],
  ['papeleria,enlinea', 'otros', 'tinta toner'],
  ['ropa,enlinea,super', 'otros', 'camisa camiseta playera pantalon calcetin zapato tenis chamarra sudadera ropa calzon boxer brasier pijama vestido falda cinturon gorra sombrero sandalia chancla sueter jeans short uniforme bufanda guante'],
  ['mascotas,super,enlinea', 'otros', 'croqueta arena alimento-perro alimento-gato collar correa juguete-perro premio-perro desparasitante'],
  ['enlinea,super', 'otros', 'cargador audifono funda mouse teclado memoria usb cable-usb cable-hdmi hdmi bocina celular tablet laptop monitor control router adaptador smartwatch libro kindle impresora disco-duro webcam'],
];

/* ---------- Palabras que cambian dónde conviene comprar ----------
   Suman puntos a ciertos lugares. Ej.: "repisa DE MADERA para el BAÑO". */
const MODIFIERS = [
  ['madera metal metalica metalico vidrio cristal pared flotante empotrable medida grande plegable ajustable acero', { enlinea: 2, hogar: 1, tlapaleria: 1 }],
  ['bano cocina recamara sala comedor jardin patio cochera lavanderia', { hogar: 1, enlinea: 1 }],
  ['modelo repuesto refaccion compatible original marca', { enlinea: 3 }],
  ['kit juego set paquete mayoreo', { enlinea: 1, super: 1 }],
  ['electrico electrica led inteligente bluetooth wifi recargable inalambrico usb', { enlinea: 2, tlapaleria: 1 }],
  ['organico organica fresco fresca natural', { verduleria: 1 }],
  ['regalo', { enlinea: 2 }],
];

const STOPWORDS = new Set(['de', 'del', 'para', 'la', 'el', 'los', 'las', 'en', 'con', 'y', 'un', 'una', 'unos', 'unas', 'a', 'al', 'mi', 'poner', 'que', 'por']);

// Índices
const INDEX = new Map(); // palabra -> { stores:[...], aisle }
for (const [stores, aisle, words] of RULES) {
  for (const w of words.split(' ')) if (!INDEX.has(w)) INDEX.set(w, { stores: stores.split(','), aisle });
}
const MOD_INDEX = new Map(); // palabra -> { lugar: puntos }
for (const [words, boost] of MODIFIERS) for (const w of words.split(' ')) MOD_INDEX.set(w, boost);

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
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const data = JSON.parse(old);
      const s = emptyState();
      s.items = (data.items || []).map((i) => {
        const g = analyze(i.name);
        return { id: i.id, name: i.name, qty: i.qty || '', store: g.store, aisle: g.aisle, done: !!i.done, t: i.t || Date.now() };
      });
      for (const [k, h] of Object.entries(data.history || {})) {
        const g = analyze(h.name);
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
const storeShort = (id) => `${store(id).emoji} ${store(id).short}`;
const aisleName = (id) => (AISLES.find((a) => a.id === id) || AISLES.at(-1)).label;
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const vibrate = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

function wordsOf(name) {
  return norm(name).split(/[^a-z0-9ñ-]+/).filter((w) => w && !STOPWORDS.has(w));
}

function lookupIn(map, word) {
  for (const f of [word, word.replace(/s$/, ''), word.replace(/es$/, '')]) {
    if (map.has(f)) return map.get(f);
  }
  return null;
}

/* Analiza el nombre y devuelve TODOS los lugares donde se puede comprar,
   ordenados del más conveniente al menos conveniente. */
function analyze(name) {
  const words = wordsOf(name);
  let base = null;
  for (let i = 0; i < words.length - 1 && !base; i++) base = lookupIn(INDEX, words[i] + '-' + words[i + 1]);
  for (let i = 0; i < words.length && !base; i++) base = lookupIn(INDEX, words[i]);

  const score = {};
  if (base) base.stores.forEach((s, i) => { score[s] = 6 - i; });
  for (const w of words) {
    const boost = lookupIn(MOD_INDEX, w);
    if (boost) for (const [s, p] of Object.entries(boost)) score[s] = (score[s] || 0) + p;
  }
  let ranking = Object.keys(score).sort((a, b) => score[b] - score[a]);
  if (!ranking.length) ranking = ['otros'];
  return { ranking, store: ranking[0], aisle: base ? base.aisle : 'otros' };
}

// Lugar principal: el que tú elegiste antes, o el mejor sugerido
function placeFor(name) {
  const a = analyze(name);
  const h = state.history[norm(name)];
  if (h && h.store) return { ...a, store: h.store, aisle: h.aisle || a.aisle };
  return a;
}

// Otros lugares donde también lo encuentras (máx. 3)
function altsFor(item) {
  return analyze(item.name).ranking.filter((s) => s !== item.store && s !== 'otros').slice(0, 3);
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
  let { store: st, aisle } = placeFor(name);
  if (chosenStore !== 'auto') st = chosenStore;

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

function moveItem(id, storeId, rememberIt = true) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  it.store = storeId;
  if (rememberIt) remember(it.name, it.store, it.aisle);
  save(); render();
}

function toggleItem(id) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  item.done = !item.done;
  vibrate(item.done ? 15 : 8);
  save(); render();
}

// Comprado en otro lugar del planeado: se pasa a este lugar y se tacha
function buyHere(id, storeId) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  it.store = storeId; it.done = true;
  vibrate(15);
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
  const suggested = analyze($('#edit-name').value || '').ranking.filter((s) => s !== 'otros');
  const rest = STORES.map((s) => s.id).filter((id) => !suggested.includes(id));
  const fill = (box, ids) => {
    box.innerHTML = '';
    for (const id of ids) {
      box.appendChild(chipButton(storeName(id), editing.store === id, () => { editing.store = id; renderEditor(); }));
    }
  };
  $('#edit-suggested-box').hidden = suggested.length === 0;
  fill($('#edit-suggested'), suggested);
  fill($('#edit-stores'), rest);
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
    it.name = capitalize($('#edit-name').value.trim().replace(/\s+/g, ' ')) || it.name;
    it.qty = $('#edit-qty').value.trim();
    it.store = editing.store;
    it.aisle = editing.aisle;
    remember(it.name, it.store, it.aisle); // la próxima vez irá al mismo lugar
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

function byStore(items) {
  return STORES.map((s) => [s.id, items.filter((i) => i.store === s.id)]).filter(([, l]) => l.length);
}
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

// Mientras escribes, te dice dónde lo puedes conseguir
function renderPreview() {
  const box = $('#preview');
  const name = $('#item-name').value.trim();
  if (name.length < 3 || addStore !== 'auto') { box.hidden = true; return; }
  const p = placeFor(name);
  const top = [p.store, ...p.ranking.filter((s) => s !== p.store && s !== 'otros')].slice(0, 4);
  box.innerHTML = '';
  box.appendChild(el('span', 'preview-label', 'Lo encuentras en:'));
  top.forEach((s, i) => box.appendChild(el('span', 'preview-chip' + (i === 0 ? ' is-main' : ''), storeShort(s))));
  box.hidden = false;
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
    b.addEventListener('click', () => { addItem(h.name, '', h.store); $('#item-name').value = ''; renderPreview(); renderSuggestions(); });
    box.appendChild(b);
  }
}

function listRow(it) {
  const row = el('div', 'item' + (it.done ? ' is-done' : ''));
  const body = el('div', 'item-body');
  const main = el('button', 'item-main');
  main.type = 'button';
  main.appendChild(el('span', 'name', it.name));
  if (it.qty) main.appendChild(el('span', 'qty', it.qty));
  main.addEventListener('click', () => openEditor(it.id));
  body.appendChild(main);

  const alts = altsFor(it);
  if (alts.length && !it.done) {
    const line = el('div', 'alts');
    line.appendChild(el('span', 'alts-label', 'También en:'));
    for (const s of alts) {
      const b = el('button', 'alt-chip', storeShort(s));
      b.type = 'button';
      b.setAttribute('aria-label', `Mover ${it.name} a ${store(s).label}`);
      b.addEventListener('click', () => {
        const from = it.store;
        moveItem(it.id, s);
        showToast(`${it.name} → ${storeName(s)}`, 'Deshacer', () => moveItem(it.id, from));
      });
      line.appendChild(b);
    }
    body.appendChild(line);
  }
  row.appendChild(body);

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

function shopButton(it, opts = {}) {
  const b = el('button', 'shop-item' + (it.done ? ' is-done' : ''));
  b.appendChild(el('span', 'box'));
  const txt = el('span', 'name-col');
  txt.appendChild(el('span', 'name', it.name));
  if (opts.from) txt.appendChild(el('span', 'from', `Lo tenías para ${storeShort(it.store)}`));
  b.appendChild(txt);
  if (opts.showStore && it.done) b.appendChild(el('span', 'where', store(it.store).emoji));
  if (it.qty) b.appendChild(el('span', 'qty', it.qty));
  b.addEventListener('click', () => (opts.buyAt ? buyHere(it.id, opts.buyAt) : toggleItem(it.id)));
  return b;
}

function renderShopFilter() {
  const box = $('#shop-filter');
  box.innerHTML = '';
  const pending = state.items.filter((i) => !i.done);
  const main = {}; const extra = {};
  for (const i of pending) {
    main[i.store] = (main[i.store] || 0) + 1;
    for (const s of altsFor(i)) extra[s] = (extra[s] || 0) + 1;
  }
  const present = STORES.filter((s) => main[s.id] || extra[s.id] || state.items.some((i) => i.done && i.store === s.id));
  if (state.shopStore !== 'all' && !present.some((s) => s.id === state.shopStore)) state.shopStore = 'all';
  box.appendChild(chipButton(`Todo · ${pending.length}`, state.shopStore === 'all', () => { state.shopStore = 'all'; save(); render(); }));
  for (const s of present) {
    const label = `${s.emoji} ${s.short} · ${main[s.id] || 0}${extra[s.id] ? ` +${extra[s.id]}` : ''}`;
    box.appendChild(chipButton(label, state.shopStore === s.id, () => {
      state.shopStore = s.id; save(); render(); window.scrollTo({ top: 0 });
    }));
  }
  // Deja visible el lugar elegido dentro de la fila deslizable
  const sel = box.querySelector('[aria-pressed="true"]');
  if (sel) box.scrollLeft = Math.max(0, sel.offsetLeft - box.clientWidth / 2 + sel.offsetWidth / 2);
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

  // "También lo puedes conseguir aquí": cosas planeadas para otro lugar
  const alsoBox = $('#also-here');
  const also = f === 'all' ? [] : state.items.filter((i) => !i.done && i.store !== f && altsFor(i).includes(f));
  alsoBox.hidden = also.length === 0;
  const alsoList = $('#also-items');
  alsoList.innerHTML = '';
  also.forEach((it) => alsoList.appendChild(shopButton(it, { from: true, buyAt: f })));

  const empty = $('#empty-shop');
  empty.hidden = pending.length > 0 || also.length > 0;
  empty.textContent = !state.items.length ? 'Tu lista está vacía.'
    : f === 'all' ? '¡Ya tienes todo! 🎉' : `Nada pendiente en ${storeName(f)} 🎉`;

  $('#cart-section').hidden = done.length === 0;
  $('#cart-count').textContent = `(${done.length})`;
  const cart = $('#cart-items');
  cart.innerHTML = '';
  done.forEach((it) => cart.appendChild(shopButton(it, { showStore: f === 'all' })));
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
  renderPreview();
  renderSuggestions();
  $('#item-name').focus();
  if (item) {
    const alts = altsFor(item).map((s) => store(s).emoji).join(' ');
    showToast(`${item.name} → ${storeShort(item.store)}${alts ? ` · también ${alts}` : ''}`, 'Cambiar', () => openEditor(item.id));
  }
});
$('#item-name').addEventListener('input', () => { renderPreview(); renderSuggestions(); });
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
save();
renderStorePicker();
setView(state.view);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

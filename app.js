'use strict';

/* ======================================================
   Mandado — lista de compras para todo.
   Todo se guarda SOLO en este teléfono (localStorage).
   No usa internet, cuenta, cámara, contactos ni ubicación.
   ====================================================== */

const STORAGE_KEY = 'mandado.v1';
const OLD_KEY = 'misuper.v1'; // versión anterior "Mi Súper"

/* ---------- Íconos de línea (dibujados aquí mismo, sin internet) ---------- */
const SVG = {
  super: '<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
  verduleria: '<path d="M5 19c0-8 5-13.5 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>',
  carniceria: '<path d="M15.5 3.5a5 5 0 0 1 5 5c0 4.5-4.5 6.5-8 7L9 19l-1 2-2-2 1-1 3.5-3.5c.5-3.5 2.5-11 5-11z"/>',
  tiendita: '<path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6c0 1.5-1.3 2.5-3 2.5S15 11.5 15 10c0 1.5-1.3 2.5-3 2.5S9 11.5 9 10c0 1.5-1.3 2.5-3 2.5S3 11.5 3 10z"/><path d="M10 20v-4h4v4"/>',
  farmacia: '<path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',
  tlapaleria: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  hogar: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 11h18v6H3z"/><path d="M5 17v2M19 17v2"/>',
  papeleria: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
  ropa: '<path d="M8 4L3 7l2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  mascotas: '<path d="M12 13c-3 0-5 3-5 5 0 1.5 2 2 5 2s5-.5 5-2c0-2-2-5-5-5z"/><circle cx="6" cy="10" r="1.6"/><circle cx="9.5" cy="6" r="1.6"/><circle cx="14.5" cy="6" r="1.6"/><circle cx="18" cy="10" r="1.6"/>',
  enlinea: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  otros: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  list: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17"/>',
  bag: '<path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  all: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  proveedor: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
};
function icon(name) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', 'i');
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = SVG[name] || SVG.otros;
  return s;
}

// ---------- Lugares donde se compra ----------
const STORES = [
  { id: 'super',      label: 'Súper',                   short: 'Súper' },
  { id: 'verduleria', label: 'Verdulería / mercado',    short: 'Mercado' },
  { id: 'carniceria', label: 'Carnicería / pollería',   short: 'Carnicería' },
  { id: 'tiendita',   label: 'Tiendita de la esquina',  short: 'Tiendita' },
  { id: 'farmacia',   label: 'Farmacia',                short: 'Farmacia' },
  { id: 'tlapaleria', label: 'Tlapalería / ferretería', short: 'Ferretería' },
  { id: 'hogar',      label: 'Hogar y muebles',         short: 'Hogar' },
  { id: 'papeleria',  label: 'Papelería',               short: 'Papelería' },
  { id: 'ropa',       label: 'Ropa y calzado',          short: 'Ropa' },
  { id: 'mascotas',   label: 'Mascotas',                short: 'Mascotas' },
  { id: 'proveedor',  label: 'Proveedor de control de plagas', short: 'Proveedor' },
  { id: 'enlinea',   label: 'En línea',                short: 'En línea' },
  { id: 'otros',      label: 'Otros',                   short: 'Otros' },
];

// ---------- Pasillos dentro del súper ----------
const AISLES = [
  { id: 'frutas',     label: 'Frutas y verduras' },
  { id: 'carnes',     label: 'Carnes y salchichonería' },
  { id: 'lacteos',    label: 'Lácteos y huevo' },
  { id: 'pan',        label: 'Pan y tortillas' },
  { id: 'despensa',   label: 'Despensa' },
  { id: 'bebidas',    label: 'Bebidas' },
  { id: 'congelados', label: 'Congelados' },
  { id: 'limpieza',   label: 'Limpieza' },
  { id: 'personal',   label: 'Cuidado personal' },
  { id: 'otros',      label: 'Otros' },
];

/* ---------- Dónde se consigue cada cosa ----------
   [lugares del más fácil al menos fácil, pasillo-si-va-al-súper, palabras]
   Palabras de dos en dos con guion: "papel-higienico".
   Se ignoran "de", "para", "la", etc.: "pasta de dientes" = "pasta-dientes". */
/* --- TRABAJO (el 4.º dato "true" lo marca como compra de trabajo) --- */
const PLAGUICIDAS = 'plaguicida pesticida insecticida-profesional cipermetrina alfacipermetrina zetacipermetrina deltametrina lambda-cihalotrina lambdacihalotrina cihalotrina permetrina bifentrina ciflutrina cyfluthrin tetrametrina praletrina fenotrina sumithrin fipronil imidacloprid clorpirifos diazinon malation propoxur bendiocarb hidrametilnona brodifacoum bromadiolona difetialona difenacoum fosfuro acido-borico piriproxifeno metopreno abamectina emamectina indoxacarb tiametoxam clotianidina dinotefuran acetamiprid spinosad carbaril temefos novaluron lufenuron hexaflumuron diflubenzuron glifosato larvicida adulticida rodenticida raticida cucarachicida hormiguicida termiticida herbicida fungicida demand k-othrine kothrine temprid termidor advion maxforce siege contrac talon klerat storm ratimin tempo suspend cynoff biothrine solfac ficam gentrol archer alpine arilon optigard goliath vendetta phantom premise talstar fendona aqua-reslin abate cebo gel-cucarachas gel-hormigas';
const RULES = [
  ['proveedor,enlinea', 'otros', PLAGUICIDAS, true],
  ['proveedor,enlinea,tlapaleria', 'otros', 'aspersora bomba-aspersora nebulizadora termonebulizadora espolvoreadora cebadera estacion-cebo trampa pegatrampa trampa-pegamento trampa-luz lampara-uv malla-antiaves pico-antipaloma repelente-aves boquilla', true],
  ['tlapaleria,proveedor,enlinea', 'otros', 'guante-nitrilo guante-latex guante-carnaza guante-seguridad mascarilla respirador cartucho cartucho-respirador filtro-respirador careta goggles lente-seguridad gafa-seguridad overol tyvek traje-tyvek chaleco bota-seguridad casco tapon-auditivo orejera faja arnes', true],
  ['tlapaleria,enlinea', 'otros', 'herramienta martillo desarmador pinza llave flexometro nivel taladro broca escalera linterna lampara-mano cinturon-herramienta caja-herramienta multimetro', true],
  ['verduleria,super', 'frutas', 'manzana platano banana jitomate tomate tomatillo cebolla aguacate limon papa zanahoria lechuga chile ajo naranja fresa pepino calabaza calabacita cilantro perejil uva mango pina melon sandia papaya brocoli coliflor espinaca elote nopal fruta verdura champinon hongo pera kiwi guayaba mandarina toronja jicama betabel apio rabano ejote chayote epazote hierbabuena jengibre durazno ciruela tuna chicharo camote frambuesa zarzamora arandano coco pimiento acelga'],
  ['carniceria,super', 'carnes', 'pollo carne res cerdo puerco chorizo molida bistec pechuga milanesa costilla arrachera chuleta pierna muslo alitas carnitas longaniza higado cecina suadero filete'],
  ['super,tiendita', 'carnes', 'jamon salchicha tocino salami pepperoni'],
  ['super,verduleria', 'carnes', 'pescado camaron salmon tilapia surimi marisco'],
  ['super,tiendita', 'lacteos', 'leche queso yogur yogurt crema mantequilla huevo panela requeson jocoque margarina'],
  ['super,tiendita', 'pan', 'pan bolillo telera baguette tostada concha pan-dulce pan-integral pan-caja bimbo'],
  ['super,tiendita,enlinea', 'despensa', 'arroz frijol pasta sopa aceite azucar sal cafe cereal atun galleta salsa mayonesa catsup mostaza lenteja avena chocolate consome sardina chipotle aderezo pure leche-condensada gelatina harina mermelada vinagre'],
  ['super,enlinea', 'despensa', 'granola especia pimienta miel quinoa chia crema-cacahuate aceite-oliva proteina'],
  ['super,tiendita', 'bebidas', 'agua jugo cerveza te leche-almendra electrolit suero bebida'],
  ['super,enlinea,tiendita', 'bebidas', 'vino tequila mezcal licor whisky ron'],
  ['super', 'congelados', 'helado congelado congelada nugget papas-congeladas pizza verduras-congeladas'],
  ['tiendita,super', 'despensa', 'refresco coca tortilla botana papitas sabritas dulce chicle hielo cigarro garrafon'],
  ['super,tiendita,enlinea', 'limpieza', 'jabon detergente cloro servilleta suavizante esponja fabuloso pinol lavatrastes aluminio papel papel-higienico bolsas-basura basura fibra desinfectante aromatizante servitoalla toallita'],
  ['super,tlapaleria,verduleria', 'limpieza', 'escoba trapeador recogedor cubeta jerga'],
  ['super,tlapaleria', 'limpieza', 'insecticida raid veneno-ratas'],
  ['super,farmacia,tiendita', 'personal', 'shampoo champu acondicionador desodorante cepillo pasta-dental crema-dental pasta-dientes cepillo-dientes rastrillo toallas-femeninas toallas-sanitarias algodon hilo-dental enjuague jabon-tocador crema-corporal gel panal'],
  ['farmacia,super', 'personal', 'medicina medicamento pastilla paracetamol ibuprofeno aspirina curita gasa alcohol agua-oxigenada termometro jarabe antibiotico antiacido omeprazol loratadina suero-oral gota pomada venda receta cubrebocas naproxeno diclofenaco'],
  ['farmacia,super,enlinea', 'personal', 'vitamina protector-solar bloqueador melatonina colageno'],
  ['farmacia,super,tiendita', 'personal', 'condon preservativo'],
  ['tlapaleria,papeleria,super', 'otros', 'pegamento resistol kola-loca'],
  ['tiendita,super,tlapaleria,enlinea', 'otros', 'pila bateria'],
  ['tlapaleria,super,enlinea', 'otros', 'foco cinta cinta-aislar cinta-canela extension contacto apagador silicon clavo tornillo taquete pija lija lubricante candado manguera'],
  ['tlapaleria,enlinea', 'otros', 'brocha rodillo pintura cerradura bisagra cadena alambre cable regadera llave-agua mezcladora interruptor'],
  ['tlapaleria', 'otros', 'cemento yeso impermeabilizante thinner sellador tubo pvc tuerca rondana teflon socket'],
  ['hogar,enlinea', 'otros', 'mueble sofa sillon colchon closet ropero librero escritorio silla mesa buro comoda cuadro espejo florero lampara reloj decoracion'],
  ['enlinea,hogar,tlapaleria', 'otros', 'repisa organizador perchero gancho zapatera estante soporte'],
  ['hogar,enlinea,super', 'otros', 'cortina tapete cojin almohada sabana cobija edredon toalla vela'],
  ['hogar,super,verduleria,enlinea', 'otros', 'sarten olla vaso plato cubierto taza cuchillo tupper recipiente tabla-picar charola jarra termo canasta cesto bote-basura tendedero'],
  ['enlinea,hogar,super', 'otros', 'licuadora cafetera tostador microondas plancha ventilador burro-planchar freidora'],
  ['hogar,verduleria,enlinea', 'otros', 'maceta planta tierra-plantas'],
  ['tlapaleria,enlinea,super', 'otros', 'filtro purificador'],
  ['papeleria,super,enlinea', 'otros', 'cuaderno libreta pluma lapiz lapices hoja folder sobre cartulina marcador plumon post-it engrapadora grapa clip sacapuntas goma borrador regla carpeta etiqueta papel-bond'],
  ['papeleria', 'otros', 'impresion copia'],
  ['papeleria,enlinea', 'otros', 'tinta toner'],
  ['ropa,enlinea,super', 'otros', 'camisa camiseta playera pantalon calcetin zapato tenis chamarra sudadera ropa calzon boxer brasier pijama vestido falda cinturon gorra sombrero sandalia chancla sueter jeans short uniforme bufanda guante'],
  ['mascotas,super,enlinea', 'otros', 'croqueta arena alimento-perro alimento-gato collar correa juguete-perro premio-perro desparasitante'],
  ['enlinea,super', 'otros', 'cargador audifono funda mouse teclado memoria usb cable-usb cable-hdmi hdmi bocina celular tablet laptop monitor control router adaptador smartwatch libro kindle impresora disco-duro webcam'],
];

/* ---------- Palabras que cambian dónde conviene comprar ---------- */
const MODIFIERS = [
  ['madera metal metalica metalico vidrio cristal pared flotante empotrable medida grande plegable ajustable acero', { enlinea: 2, hogar: 1, tlapaleria: 1 }],
  ['bano cocina recamara sala comedor jardin patio cochera lavanderia', { hogar: 1, enlinea: 1 }],
  ['modelo repuesto refaccion compatible original marca', { enlinea: 3 }],
  ['kit juego set paquete mayoreo', { enlinea: 1, super: 1 }],
  ['electrico electrica led rgb inteligente smart bluetooth wifi recargable inalambrico usb', { enlinea: 2, tlapaleria: 1 }],
  ['organico organica fresco fresca natural', { verduleria: 1 }],
  ['regalo', { enlinea: 2 }],
  // Estas palabras también marcan la compra como de TRABAJO
  ['seguridad industrial profesional nitrilo plagas fumigacion fumigar', { tlapaleria: 1, enlinea: 1 }, true],
];

/* ---------- Ícono de cada producto ----------
   [ícono, palabras]. Si no reconoce el producto, usa el ícono del lugar. */
const PRODUCT_ICONS = [
  // Trabajo
  ['🐀', 'rodenticida raticida brodifacoum bromadiolona difetialona difenacoum fosfuro klerat storm talon ratimin contrac'],
  ['🪳', 'cucarachicida gel-cucarachas maxforce advion hidrametilnona'],
  ['🐜', 'hormiguicida gel-hormigas termiticida termidor'],
  ['🪤', 'trampa pegatrampa trampa-pegamento cebadera estacion-cebo cebo'],
  ['💨', 'aspersora bomba-aspersora nebulizadora termonebulizadora espolvoreadora boquilla'],
  ['😷', 'mascarilla respirador cartucho cartucho-respirador filtro-respirador cubrebocas'],
  ['🥽', 'careta goggles lente-seguridad gafa-seguridad'],
  ['🦺', 'chaleco overol tyvek traje-tyvek arnes faja'],
  ['🥾', 'bota-seguridad'], ['⛑️', 'casco'], ['🦻', 'tapon-auditivo orejera'],
  ['🔦', 'linterna lampara-mano lampara-uv trampa-luz'], ['🐦', 'malla-antiaves pico-antipaloma repelente-aves'],
  ['🧰', 'caja-herramienta cinturon-herramienta herramienta'], ['🧤', 'guante-nitrilo guante-latex guante-carnaza guante-seguridad'], ['📟', 'multimetro'],
  ['🧪', PLAGUICIDAS],
  // Casa
  ['🍎', 'manzana'], ['🍌', 'platano banana'], ['🍅', 'jitomate tomate tomatillo'], ['🧅', 'cebolla'],
  ['🥑', 'aguacate'], ['🍋', 'limon'], ['🥔', 'papa camote'], ['🥕', 'zanahoria'],
  ['🥬', 'lechuga acelga espinaca apio verdura'], ['🌶️', 'chile chipotle'], ['🧄', 'ajo'],
  ['🍊', 'naranja mandarina toronja'], ['🍓', 'fresa frambuesa zarzamora'], ['🥒', 'pepino calabaza calabacita chayote ejote'],
  ['🌿', 'cilantro perejil epazote hierbabuena'], ['🍇', 'uva arandano'], ['🥭', 'mango'], ['🍍', 'pina'],
  ['🍈', 'melon'], ['🍉', 'sandia'], ['🥦', 'brocoli coliflor'], ['🌽', 'elote'], ['🌵', 'nopal'],
  ['🍄', 'champinon hongo'], ['🍐', 'pera'], ['🥝', 'kiwi'], ['🍑', 'durazno ciruela'], ['🥥', 'coco'], ['🫑', 'pimiento'],
  ['🍎', 'fruta'],
  ['🍗', 'pollo pechuga pierna muslo alitas'], ['🥩', 'carne res bistec arrachera filete cecina chuleta costilla milanesa suadero molida cerdo puerco carnitas higado'],
  ['🌭', 'salchicha chorizo longaniza'], ['🥓', 'tocino'], ['🍖', 'jamon salami pepperoni'],
  ['🐟', 'pescado tilapia salmon surimi'], ['🦐', 'camaron marisco'],
  ['🥛', 'leche leche-condensada leche-almendra'], ['🧀', 'queso panela requeson jocoque'], ['🥚', 'huevo'], ['🧈', 'mantequilla margarina'],
  ['🥣', 'yogur yogurt cereal granola avena'],
  ['🍞', 'pan pan-caja pan-integral bimbo'], ['🥖', 'bolillo telera baguette'], ['🥐', 'concha pan-dulce'], ['🫓', 'tortilla tostada'],
  ['🍚', 'arroz'], ['🫘', 'frijol lenteja'], ['🍝', 'pasta sopa'], ['🫒', 'aceite aceite-oliva'], ['🧂', 'sal pimienta especia'],
  ['🍬', 'azucar dulce chicle'], ['☕', 'cafe te'], ['🥫', 'atun sardina consome pure catsup salsa mayonesa mostaza aderezo vinagre gelatina'],
  ['🍪', 'galleta'], ['🍯', 'miel mermelada'], ['🍫', 'chocolate'], ['🥜', 'crema-cacahuate'], ['🌾', 'harina quinoa chia proteina'],
  ['💧', 'agua garrafon electrolit suero'], ['🧃', 'jugo'], ['🍺', 'cerveza'], ['🍷', 'vino'], ['🥃', 'tequila mezcal licor whisky ron'],
  ['🥤', 'refresco coca bebida vaso'], ['🧊', 'hielo congelado congelada'], ['🍦', 'helado'], ['🍕', 'pizza'], ['🍟', 'papas-congeladas nugget'],
  ['🍿', 'botana papitas sabritas'], ['🚬', 'cigarro'],
  ['🧼', 'jabon jabon-tocador lavatrastes'], ['🧺', 'detergente suavizante canasta cesto tendedero plancha burro-planchar'],
  ['🧴', 'cloro fabuloso pinol desinfectante aromatizante shampoo champu acondicionador crema-corporal gel protector-solar bloqueador desodorante pegamento resistol kola-loca silicon lubricante'],
  ['🧻', 'papel papel-higienico servilleta servitoalla toallita'], ['🧽', 'esponja fibra jerga'], ['🗑️', 'bolsas-basura basura bote-basura'],
  ['🧹', 'escoba trapeador recogedor'], ['🪣', 'cubeta'], ['🪰', 'insecticida raid veneno-ratas'],
  ['🪥', 'cepillo cepillo-dientes pasta-dental pasta-dientes crema-dental hilo-dental enjuague'], ['🪒', 'rastrillo'], ['👶', 'panal'],
  ['🩸', 'toallas-femeninas toallas-sanitarias'], ['☁️', 'algodon'],
  ['💊', 'medicina medicamento pastilla paracetamol ibuprofeno aspirina antibiotico antiacido omeprazol loratadina naproxeno diclofenaco vitamina melatonina colageno receta'],
  ['🩹', 'curita gasa venda'], ['🌡️', 'termometro'], ['😷', 'cubrebocas'], ['🧪', 'alcohol agua-oxigenada jarabe gota pomada suero-oral'], ['🛡️', 'condon preservativo'],
  ['🔋', 'pila bateria'], ['💡', 'foco lampara'], ['🔩', 'tornillo tuerca rondana pija taquete clavo bisagra'], ['🔨', 'martillo herramienta'],
  ['🪛', 'desarmador'], ['🔧', 'llave pinza'], ['🎨', 'pintura brocha rodillo'], ['🧱', 'cemento yeso impermeabilizante sellador thinner'],
  ['🔌', 'extension contacto apagador cable interruptor socket cargador adaptador licuadora cafetera tostador microondas freidora'],
  ['🪜', 'escalera'], ['🔒', 'candado cerradura'], ['🚿', 'regadera llave-agua mezcladora'], ['🚰', 'filtro purificador tubo pvc manguera teflon'],
  ['📏', 'flexometro nivel regla'], ['🪚', 'taladro broca lija'], ['🎀', 'cinta cinta-aislar cinta-canela'], ['⛓️', 'cadena alambre'],
  ['🪑', 'silla mueble escritorio mesa'], ['🛋️', 'sofa sillon'], ['🛏️', 'colchon cama sabana cobija edredon almohada'], ['🪞', 'espejo'],
  ['🖼️', 'cuadro decoracion florero'], ['🪴', 'maceta planta tierra-plantas'], ['🕯️', 'vela'], ['🕰️', 'reloj'],
  ['🗄️', 'repisa estante librero organizador closet ropero comoda buro zapatera perchero gancho soporte'], ['🪟', 'cortina'],
  ['🧶', 'tapete cojin'], ['🛁', 'toalla'], ['🍳', 'sarten olla'], ['🍽️', 'plato cubierto charola'], ['🔪', 'cuchillo tabla-picar'],
  ['🥡', 'tupper recipiente'], ['🫖', 'jarra termo taza'], ['🌀', 'ventilador'],
  ['📓', 'cuaderno libreta'], ['🖊️', 'pluma'], ['✏️', 'lapiz lapices sacapuntas goma borrador'], ['📄', 'hoja papel-bond impresion copia'],
  ['📁', 'folder carpeta'], ['✉️', 'sobre'], ['🖍️', 'marcador plumon cartulina'], ['📎', 'clip grapa engrapadora post-it'], ['🏷️', 'etiqueta'],
  ['🖨️', 'tinta toner impresora'],
  ['👕', 'camisa camiseta playera ropa sudadera sueter uniforme'], ['👖', 'pantalon jeans'], ['🧦', 'calcetin'], ['👟', 'tenis zapato'],
  ['🧥', 'chamarra'], ['🩲', 'calzon boxer'], ['👗', 'vestido falda'], ['🧢', 'gorra sombrero'], ['🩴', 'sandalia chancla'],
  ['🧣', 'bufanda'], ['🧤', 'guante'], ['🩳', 'short'], ['👚', 'brasier pijama'], ['🪢', 'cinturon'],
  ['🐶', 'croqueta alimento-perro juguete-perro premio-perro collar correa desparasitante'], ['🐱', 'arena alimento-gato'],
  ['🎧', 'audifono'], ['📱', 'celular funda'], ['🖱️', 'mouse'], ['⌨️', 'teclado'], ['💾', 'memoria usb disco-duro'],
  ['💻', 'laptop tablet monitor'], ['🔊', 'bocina'], ['📚', 'libro kindle'], ['📷', 'webcam'], ['📡', 'router'], ['⌚', 'smartwatch'], ['🎮', 'control'],
  ['🎁', 'regalo'],
];

const STOPWORDS = new Set(['de', 'del', 'para', 'la', 'el', 'los', 'las', 'en', 'con', 'y', 'un', 'una', 'unos', 'unas', 'a', 'al', 'mi', 'poner', 'que', 'por']);

// Índices
const INDEX = new Map();
for (const [stores, aisle, words, work] of RULES) {
  for (const w of words.split(' ')) if (!INDEX.has(w)) INDEX.set(w, { stores: stores.split(','), aisle, work: !!work });
}
const MOD_INDEX = new Map();
for (const [words, boost, work] of MODIFIERS) for (const w of words.split(' ')) MOD_INDEX.set(w, { boost, work: !!work });
const ICON_INDEX = new Map();
for (const [emo, words] of PRODUCT_ICONS) for (const w of words.split(' ')) if (!ICON_INDEX.has(w)) ICON_INDEX.set(w, emo);

// ---------- Estado ----------
let state;
let lastRemoved = null;
let toastTimer = null;
let toastFn = null;
let wakeLock = null;
let editing = null;      // { id, store, aisle }
let addChoice = null;    // lugar elegido a mano en la hoja de agregar
let addWork = null;      // null = automático; true/false = elegido a mano
let showAllStores = false;

function emptyState() { return { items: [], history: {}, view: 'list', shopSel: [], shopWork: false, collapsed: [], scope: 'all' }; }

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
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const store = (id) => STORES.find((s) => s.id === id) || STORES.at(-1);
const aisleName = (id) => (AISLES.find((a) => a.id === id) || AISLES.at(-1)).label;
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const vibrate = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function wordsOf(name) { return norm(name).split(/[^a-z0-9ñ-]+/).filter((w) => w && !STOPWORDS.has(w)); }
const forms = (w) => [w, w.replace(/s$/, ''), w.replace(/es$/, '')];
function lookupIn(map, word) {
  for (const f of forms(word)) if (map.has(f)) return map.get(f);
  return null;
}
// Frases de 2 palabras: "botas de seguridad" -> "bota-seguridad"
function lookupPair(map, a, b) {
  for (const fa of forms(a)) for (const fb of forms(b)) { const k = fa + '-' + fb; if (map.has(k)) return map.get(k); }
  return null;
}
// Todas las coincidencias en orden (primero frases de 2 palabras), con la palabra que coincidió
function matchAll(map, words) {
  const out = [];
  const find = (cands) => { for (const k of cands) if (map.has(k)) return k; return null; };
  for (let i = 0; i < words.length - 1; i++) {
    const k = find(forms(words[i]).flatMap((a) => forms(words[i + 1]).map((b) => a + '-' + b)));
    if (k) out.push({ key: k, hit: map.get(k) });
  }
  for (const w of words) { const k = find(forms(w)); if (k) out.push({ key: k, hit: map.get(k) }); }
  return out;
}
// La coincidencia que manda: si alguna palabra es de trabajo, esa gana ("gel cucarachicida")
function mainMatch(words) {
  const all = matchAll(INDEX, words);
  return all.find((m) => m.hit.work) || all[0] || null;
}
function iconFor(name) {
  const words = wordsOf(name);
  const m = mainMatch(words);
  if (m) { const e = lookupIn(ICON_INDEX, m.key); if (e) return e; }
  return firstMatch(ICON_INDEX, words);
}
function firstMatch(map, words) {
  for (let i = 0; i < words.length - 1; i++) { const h = lookupPair(map, words[i], words[i + 1]); if (h) return h; }
  for (const w of words) { const h = lookupIn(map, w); if (h) return h; }
  return null;
}

// Todos los lugares donde se puede comprar, del más conveniente al menos
function analyze(name) {
  const words = wordsOf(name);
  const m = mainMatch(words);
  const base = m ? m.hit : null;
  const score = {};
  let work = !!(base && base.work);
  if (base) base.stores.forEach((s, i) => { score[s] = 6 - i; });
  for (const w of words) {
    const mod = lookupIn(MOD_INDEX, w);
    if (!mod) continue;
    for (const [s, p] of Object.entries(mod.boost)) score[s] = (score[s] || 0) + p;
    if (mod.work) work = true;
  }
  let ranking = Object.keys(score).sort((a, b) => score[b] - score[a]);
  if (!ranking.length) ranking = ['otros'];
  return { ranking, store: ranking[0], aisle: base ? base.aisle : 'otros', work };
}
// Lugar (y si es de trabajo): lo que tú elegiste antes, o lo sugerido
function placeFor(name) {
  const a = analyze(name);
  const h = state.history[norm(name)];
  if (!h) return a;
  return { ...a, store: h.store || a.store, aisle: h.aisle || a.aisle, work: typeof h.work === 'boolean' ? h.work : a.work };
}
function altsFor(item) { return analyze(item.name).ranking.filter((s) => s !== item.store && s !== 'otros').slice(0, 3); }

// Ícono del producto (emoji) o, si no lo reconoce, el del lugar
function productPic(name, storeId) {
  const box = el('span', 'pic');
  const emo = iconFor(name);
  if (emo) box.textContent = emo; else box.appendChild(icon(storeId));
  return box;
}
function fillPic(box, name, storeId) {
  box.innerHTML = '';
  const emo = name ? iconFor(name) : null;
  if (emo) box.textContent = emo; else box.appendChild(icon(storeId || 'otros'));
}

function remember(name, storeId, aisle, work) {
  const key = norm(name);
  const h = state.history[key] || { name, count: 0 };
  h.name = name; h.store = storeId; h.aisle = aisle;
  if (typeof work === 'boolean') h.work = work;
  state.history[key] = h;
  return h;
}

// ---------- Acciones ----------
function addItem(rawName, qty, chosenStore, chosenWork) {
  const name = capitalize(rawName.trim().replace(/\s+/g, ' '));
  if (!name) return null;
  const key = norm(name);
  let { store: st, aisle, work } = placeFor(name);
  if (chosenStore && chosenStore !== 'auto') st = chosenStore;
  if (typeof chosenWork === 'boolean') work = chosenWork;
  let item = state.items.find((i) => norm(i.name) === key && !i.done);
  if (item) {
    if (qty) item.qty = qty.trim();
    item.store = st; item.aisle = aisle; item.work = work;
  } else {
    item = { id: uid(), name, qty: (qty || '').trim(), store: st, aisle, work, done: false, t: Date.now() };
    state.items.push(item);
  }
  remember(name, st, aisle, work).count += 1;
  if (state.scope === 'casa' && work) state.scope = 'trabajo';   // que lo veas donde cayó
  if (state.scope === 'trabajo' && !work) state.scope = 'casa';
  state.collapsed = state.collapsed.filter((c) => c !== st); // que se vea donde cayó
  save(); render();
  return item;
}
function moveItem(id, storeId) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  it.store = storeId;
  remember(it.name, it.store, it.aisle, !!it.work);
  save(); render();
}
function toggleItem(id) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  it.done = !it.done;
  vibrate(it.done ? 15 : 8);
  save(); render();
}
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
// Filtro de compras: lugares elegidos (varios) + opcional "solo trabajo"
const workOk = (i) => !state.shopWork || i.work;
const inShopFilter = (i) => workOk(i) && (state.shopSel.length === 0 || state.shopSel.includes(i.store));
const availableHere = (i) => workOk(i) && state.shopSel.length > 0 && !state.shopSel.includes(i.store)
  && altsFor(i).some((s) => state.shopSel.includes(s));
function finishShopping() {
  const inFilter = inShopFilter;
  const done = state.items.filter((i) => i.done && inFilter(i));
  if (!done.length) return;
  lastRemoved = { items: done, index: -1 };
  state.items = state.items.filter((i) => !(i.done && inFilter(i)));
  save(); render();
  showToast(`${done.length} comprado${done.length > 1 ? 's' : ''}`, 'Deshacer', undo);
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
  const t = $('#toast');
  t.hidden = true; void t.offsetWidth; t.hidden = false; // reinicia la animación
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4500);
}
function hideToast() { $('#toast').hidden = true; toastFn = null; }

// ---------- Componentes ----------
function pill(content, pressed, onClick, extra = '') {
  const b = el('button', 'pill ' + extra);
  b.type = 'button';
  if (typeof content === 'string') b.textContent = content; else content.forEach((c) => b.append(c));
  b.setAttribute('aria-pressed', !!pressed);
  b.addEventListener('click', onClick);
  return b;
}
const storePill = (id, pressed, onClick, suffix = '') => pill([icon(id), store(id).short + suffix], pressed, onClick);

// Renglón de producto, con deslizar a la izquierda para borrar
function productRow(it, { mode = 'list', buyAt = null, whereText = '' } = {}) {
  const wrap = el('div', 'swipe');
  const bg = el('div', 'swipe-bg');
  bg.append(icon('trash'), 'Eliminar');
  const row = el('div', 'row' + (it.done ? ' is-done' : ''));

  const check = el('button', 'check');
  check.type = 'button';
  check.setAttribute('aria-label', (it.done ? 'Desmarcar ' : 'Marcar ') + it.name);
  check.appendChild(icon('check'));
  check.addEventListener('click', (e) => { e.stopPropagation(); buyAt ? buyHere(it.id, buyAt) : toggleItem(it.id); });

  const main = el('button', 'row-main');
  main.type = 'button';
  const nm = el('span', 'row-name', it.name);
  if (it.work && !(mode === 'list' && state.scope === 'trabajo') && !(mode !== 'list' && state.shopWork)) {
    const tag = el('span', 'tag'); tag.append(icon('work'), 'Trabajo'); nm.appendChild(tag);
  }
  main.appendChild(nm);
  let sub = '';
  if (buyAt) sub = whereText || `La tenías para ${store(it.store).short}`;
  else if (mode === 'list' && !it.done) {
    const alts = altsFor(it);
    if (alts.length) sub = 'También en ' + alts.map((s) => store(s).short).join(' · ');
  } else if (mode === 'all-done') sub = store(it.store).short;
  if (sub) main.appendChild(el('span', 'row-sub', sub));
  main.addEventListener('click', () => {
    if (wrap.dataset.dragged) return;
    if (mode === 'list') openEditor(it.id);
    else buyAt ? buyHere(it.id, buyAt) : toggleItem(it.id);
  });

  row.append(check, productPic(it.name, it.store), main);
  if (it.qty) row.appendChild(el('span', 'qty', it.qty));
  if (mode === 'list') { wrap.append(bg, row); enableSwipe(wrap, row, it.id); }
  else wrap.append(row);
  return wrap;
}

function enableSwipe(wrap, row, id) {
  let x0 = 0, y0 = 0, dx = 0, active = false, horizontal = null;
  row.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    x0 = e.clientX; y0 = e.clientY; dx = 0; active = true; horizontal = null; delete wrap.dataset.dragged;
  });
  row.addEventListener('pointermove', (e) => {
    if (!active) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (horizontal === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) horizontal = Math.abs(mx) > Math.abs(my);
    if (!horizontal) return;
    dx = Math.min(0, Math.max(-160, mx));
    row.classList.add('dragging');
    row.style.transform = `translateX(${dx}px)`;
    if (Math.abs(dx) > 8) wrap.dataset.dragged = '1';
  });
  const end = () => {
    if (!active) return;
    active = false;
    row.classList.remove('dragging');
    if (dx < -90) {
      row.style.transform = 'translateX(-110%)';
      row.style.opacity = '0';
      vibrate(10);
      setTimeout(() => removeItem(id), 200);
    } else {
      row.style.transform = '';
    }
    setTimeout(() => delete wrap.dataset.dragged, 50);
  };
  row.addEventListener('pointerup', end);
  row.addEventListener('pointercancel', end);
  row.addEventListener('pointerleave', end);
}

/* Fila deslizable: con el dedo ya se mueve sola; esto permite arrastrarla
   también con el mouse (clic y arrastrar). Si arrastraste, no selecciona nada. */
function enableDragScroll(box) {
  let down = false, isMouse = false, startX = 0, startLeft = 0, moved = false, suppress = false;
  box.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    down = true; moved = false; isMouse = e.pointerType === 'mouse';
    startX = e.clientX; startLeft = box.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) { moved = true; if (isMouse) box.classList.add('dragging'); }
    if (moved && isMouse) { box.scrollLeft = startLeft - dx; e.preventDefault(); } // con el dedo se mueve sola
  });
  const end = (e) => {
    if (!down) return;
    down = false;
    if (e && Math.abs(e.clientX - startX) > 6) moved = true;
    box.classList.remove('dragging');
    if (moved) { suppress = true; setTimeout(() => { suppress = false; }, 350); }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', () => { if (down) { down = false; suppress = true; setTimeout(() => { suppress = false; }, 350); box.classList.remove('dragging'); } });
  box.addEventListener('click', (e) => { if (suppress) { e.stopPropagation(); e.preventDefault(); suppress = false; } }, true);
  box.addEventListener('scroll', () => updateEdges(box), { passive: true });
}
// Sombra en las orillas cuando hay más lugares a los lados
function updateEdges(box) {
  const max = box.scrollWidth - box.clientWidth;
  box.classList.toggle('more-left', box.scrollLeft > 4);
  box.classList.toggle('more-right', box.scrollLeft < max - 4);
}

function byStore(items) { return STORES.map((s) => [s.id, items.filter((i) => i.store === s.id)]).filter(([, l]) => l.length); }
function byAisle(items) { return AISLES.map((a) => [a.id, items.filter((i) => (i.aisle || 'otros') === a.id)]).filter(([, l]) => l.length); }

// ---------- Vistas ----------
function setView(view) {
  state.view = view;
  save();
  $('#nav-list').toggleAttribute('aria-current', view === 'list');
  $('#nav-shop').toggleAttribute('aria-current', view === 'shop');
  if (view === 'list') $('#nav-list').setAttribute('aria-current', 'page');
  if (view === 'shop') $('#nav-shop').setAttribute('aria-current', 'page');
  $('#view-list').hidden = view !== 'list';
  $('#view-shop').hidden = view !== 'shop';
  window.scrollTo({ top: 0 });
  keepScreenOn(view === 'shop');
  render();
}

async function keepScreenOn(on) {
  try {
    if (on && 'wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.view === 'shop') keepScreenOn(true);
});

function setRing(done, total) {
  const C = 2 * Math.PI * 20;
  const f = $('#ring-fill');
  f.style.strokeDasharray = C;
  f.style.strokeDashoffset = total ? C * (1 - done / total) : C;
  $('#ring-text').textContent = total ? `${done}/${total}` : '0';
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function renderHeader() {
  if (state.view === 'shop') {
    const S = state.shopSel;
    const items = state.items.filter(inShopFilter);
    const done = items.filter((i) => i.done).length;
    const pending = items.length - done;
    const extra = state.items.filter((i) => !i.done && availableHere(i)).length;
    $('#greet').textContent = S.length ? 'Estás en' : 'De compras';
    $('#title').textContent = S.length === 0 ? (state.shopWork ? 'Para el trabajo' : 'Todo')
      : S.length === 1 ? store(S[0]).label
      : S.length <= 3 ? S.map((s) => store(s).short).join(' + ') : `${S.length} lugares`;
    const work = state.shopWork && S.length ? ' · solo trabajo' : '';
    $('#summary').textContent = (pending ? `Te falta${pending > 1 ? 'n' : ''} ${pending}` : items.length ? '¡Ya tienes todo aquí!' : 'Nada pendiente')
      + (extra ? ` · +${extra} que también venden aquí` : '') + work;
    setRing(done, items.length);
    return;
  }
  const total = state.items.length;
  const done = state.items.filter((i) => i.done).length;
  const pending = total - done;
  const places = new Set(state.items.filter((i) => !i.done).map((i) => i.store)).size;
  $('#greet').textContent = greeting();
  $('#title').textContent = 'Mandado';
  $('#summary').textContent = !total ? 'Nada pendiente'
    : pending === 0 ? `¡Listo! ${done} comprado${done > 1 ? 's' : ''}`
    : `${pending} pendiente${pending > 1 ? 's' : ''} en ${places} lugar${places > 1 ? 'es' : ''}`;
  setRing(done, total);
}

const inScope = (i) => state.scope === 'all' || (state.scope === 'trabajo' ? i.work : !i.work);

function renderScope() {
  const box = $('#scope-seg');
  box.innerHTML = '';
  const pend = (f) => state.items.filter((i) => !i.done && f(i)).length;
  const opts = [
    ['all', 'all', 'Todo', pend(() => true)],
    ['casa', 'home', 'Casa', pend((i) => !i.work)],
    ['trabajo', 'work', 'Trabajo', pend((i) => i.work)],
  ];
  for (const [id, ic, label, n] of opts) {
    const b = el('button', 'seg-btn');
    b.type = 'button';
    b.setAttribute('aria-pressed', state.scope === id);
    b.append(icon(ic), label);
    if (n) b.appendChild(el('span', 'seg-n', String(n)));
    b.addEventListener('click', () => { state.scope = id; save(); render(); });
    box.appendChild(b);
  }
}

function renderList() {
  renderScope();
  const root = $('#list-groups');
  root.innerHTML = '';
  const scoped = state.items.filter(inScope);
  $('#empty-list').hidden = state.items.length > 0;
  const emptyScope = $('#empty-scope');
  emptyScope.hidden = !(state.items.length > 0 && scoped.length === 0);
  emptyScope.textContent = state.scope === 'trabajo' ? 'Nada pendiente para el trabajo.' : 'Nada pendiente para la casa.';
  for (const [sid, items] of byStore(scoped)) {
    const card = el('div', 'store-card' + (state.collapsed.includes(sid) ? ' collapsed' : ''));
    const head = el('button', 'store-head');
    head.type = 'button';
    const tile = el('span', 'tile'); tile.appendChild(icon(sid));
    const pending = items.filter((i) => !i.done).length;
    const chev = icon('chev'); chev.classList.add('chev');
    head.append(tile, el('span', 'store-name', store(sid).label), el('span', 'store-count', pending ? String(pending) : '✓'), chev);
    head.addEventListener('click', () => {
      const c = state.collapsed;
      state.collapsed = c.includes(sid) ? c.filter((x) => x !== sid) : [...c, sid];
      card.classList.toggle('collapsed');
      save();
    });
    const body = el('div', 'store-body');
    const inner = el('div');
    if (sid === 'super') {
      for (const [aid, list] of byAisle(items)) {
        inner.appendChild(el('div', 'aisle', aisleName(aid)));
        list.forEach((it) => inner.appendChild(productRow(it)));
      }
    } else items.forEach((it) => inner.appendChild(productRow(it)));
    body.appendChild(inner);
    card.append(head, body);
    root.appendChild(card);
  }
}

// Un solo lugar: donde estás. Tocarlo otra vez regresa a "Todo".
function toggleShopStore(id) {
  state.shopSel = state.shopSel[0] === id ? [] : [id];
  vibrate(8);
  save(); render(); window.scrollTo({ top: 0 });
}

function renderShopFilter() {
  const box = $('#shop-filter');
  const prevScroll = box.scrollLeft;
  box.innerHTML = '';
  const pending = state.items.filter((i) => !i.done && workOk(i));
  const main = {}; const extra = {};
  for (const i of pending) {
    main[i.store] = (main[i.store] || 0) + 1;
    for (const s of altsFor(i)) extra[s] = (extra[s] || 0) + 1;
  }
  const present = STORES.filter((s) => main[s.id] || extra[s.id] || state.items.some((i) => i.done && i.store === s.id));
  state.shopSel = state.shopSel.filter((id) => present.some((s) => s.id === id));
  const hasWork = state.items.some((i) => i.work);
  if (!hasWork) state.shopWork = false;

  box.appendChild(pill(`Todo · ${pending.length}`, state.shopSel.length === 0, () => { state.shopSel = []; save(); render(); }));
  if (hasWork) {
    const nw = state.items.filter((i) => !i.done && i.work).length;
    box.appendChild(pill([icon('work'), `Trabajo${nw ? ' · ' + nw : ''}`], state.shopWork, () => { state.shopWork = !state.shopWork; save(); render(); }, 'work-pill'));
  }
  for (const s of present) {
    const n = `${main[s.id] ? ' · ' + main[s.id] : ''}${extra[s.id] ? ' +' + extra[s.id] : ''}`;
    box.appendChild(storePill(s.id, state.shopSel.includes(s.id), () => toggleShopStore(s.id), n));
  }
  box.scrollLeft = prevScroll;
  const selPill = box.querySelector('.pill[aria-pressed="true"]:not(.work-pill)');
  if (selPill && state.shopSel.length) box.scrollLeft = Math.max(0, selPill.offsetLeft - box.clientWidth / 2 + selPill.offsetWidth / 2);
  requestAnimationFrame(() => updateEdges(box));
  $('#shop-hint').textContent = state.shopSel.length ? '' : 'Elige el lugar donde estás.';
  $('#shop-hint').hidden = state.shopSel.length > 0;
}

function renderShop() {
  renderShopFilter();
  const S = state.shopSel;
  const grouped = S.length !== 1;
  const visible = state.items.filter(inShopFilter);
  const pending = visible.filter((i) => !i.done);
  const done = visible.filter((i) => i.done);
  $('#shop-bar').style.width = visible.length ? `${(done.length / visible.length) * 100}%` : '0';

  const root = $('#shop-groups');
  root.innerHTML = '';
  root.className = 'big';
  const addAisles = (parent, items) => {
    for (const [aid, list] of byAisle(items)) {
      parent.appendChild(el('div', 'aisle', aisleName(aid)));
      list.forEach((it) => parent.appendChild(productRow(it, { mode: 'shop' })));
    }
  };
  if (grouped) {
    for (const [sid, items] of byStore(pending)) {
      const head = el('div', 'store-head');
      const tile = el('span', 'tile'); tile.appendChild(icon(sid));
      head.append(tile, el('span', 'store-name', store(sid).label), el('span', 'store-count', String(items.length)));
      root.appendChild(head);
      if (sid === 'super') addAisles(root, items); else items.forEach((it) => root.appendChild(productRow(it, { mode: 'shop' })));
    }
  } else if (S[0] === 'super') addAisles(root, pending);
  else pending.forEach((it) => root.appendChild(productRow(it, { mode: 'shop' })));

  // Lo que anotaste para otro lugar, pero también venden en los lugares elegidos
  const also = state.items.filter((i) => !i.done && availableHere(i));
  $('#also-here').hidden = also.length === 0;
  $('#also-title').textContent = S.length > 1 ? 'También lo consigues en estos lugares' : 'También lo puedes conseguir aquí';
  const alsoList = $('#also-items');
  alsoList.innerHTML = '';
  alsoList.className = 'big also';
  for (const it of also) {
    const here = altsFor(it).filter((s) => S.includes(s));
    const whereText = S.length > 1
      ? `En ${here.map((s) => store(s).short).join(' · ')} · la tenías para ${store(it.store).short}`
      : `La tenías para ${store(it.store).short}`;
    alsoList.appendChild(productRow(it, { mode: 'shop', buyAt: here[0], whereText }));
  }

  const empty = $('#empty-shop');
  empty.hidden = pending.length > 0 || also.length > 0;
  empty.textContent = !state.items.length ? 'Tu lista está vacía.'
    : S.length === 0 ? (state.shopWork ? 'Nada pendiente para el trabajo' : '¡Ya tienes todo!')
    : S.length === 1 ? `Nada pendiente en ${store(S[0]).label}` : 'Nada pendiente en estos lugares';

  $('#cart-section').hidden = done.length === 0;
  $('#cart-count').textContent = `(${done.length})`;
  const cart = $('#cart-items');
  cart.innerHTML = '';
  done.forEach((it) => cart.appendChild(productRow(it, { mode: grouped ? 'all-done' : 'shop' })));
}

function render() {
  renderHeader();
  if (state.view === 'list') renderList(); else renderShop();
}

// ---------- Hoja: agregar ----------
// ¿Lo nuevo es de trabajo? Lo elegido a mano, lo detectado, o si estás en la pestaña Trabajo
function effectiveWork(name) {
  if (addWork !== null) return addWork;
  if (name && placeFor(name).work) return true;
  return state.scope === 'trabajo';
}
function renderWorkToggle(btn, on) {
  btn.innerHTML = '';
  btn.append(icon('work'), on ? 'Para el trabajo' : '¿Es para el trabajo?');
  btn.setAttribute('aria-pressed', on);
}

function openAdd() {
  addChoice = null; addWork = null; showAllStores = false;
  $('#item-name').value = ''; $('#item-qty').value = '';
  $('#added-note').hidden = true;
  renderAdd();
  $('#add-sheet').hidden = false;
  hideToast();
  setTimeout(() => $('#item-name').focus(), 80);
}
function closeAdd() { $('#add-sheet').hidden = true; }

function renderAdd() {
  const name = $('#item-name').value.trim();
  const box = $('#add-stores');
  box.innerHTML = '';
  if (name.length < 2) {
    $('#add-where').hidden = true;
    fillPic($('#add-icon'), '', 'otros');
    $('#add-submit').textContent = 'Agregar';
  } else {
    const p = placeFor(name);
    const chosen = addChoice || p.store;
    const suggested = [p.store, ...p.ranking.filter((s) => s !== p.store && s !== 'otros')].slice(0, 4);
    const list = showAllStores ? [...suggested, ...STORES.map((s) => s.id).filter((id) => !suggested.includes(id))] : suggested;
    if (addChoice && !list.includes(addChoice)) list.push(addChoice);
    for (const id of list) box.appendChild(storePill(id, id === chosen, () => { addChoice = id; renderAdd(); }));
    if (!showAllStores) box.appendChild(pill('Otro lugar', false, () => { showAllStores = true; renderAdd(); }, 'ghost'));
    $('#add-where').hidden = false;
    fillPic($('#add-icon'), name, chosen);
    $('#add-submit').textContent = `Agregar a ${store(chosen).short}`;
  }
  renderWorkToggle($('#work-toggle'), effectiveWork(name));
  renderSuggestions();
}

function renderSuggestions() {
  const typed = norm($('#item-name').value);
  const pending = new Set(state.items.filter((i) => !i.done).map((i) => norm(i.name)));
  const list = Object.entries(state.history)
    .filter(([k]) => !pending.has(k) && (!typed || k.includes(typed)))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  const box = $('#suggestion-chips');
  box.innerHTML = '';
  $('#suggestions').hidden = list.length === 0;
  for (const [, h] of list) {
    const emo = iconFor(h.name);
    box.appendChild(pill(`${emo ? emo + ' ' : '+ '}${h.name}`, false, () => {
      const it = addItem(h.name, '', h.store);
      noteAdded(it);
      $('#item-name').value = '';
      renderAdd();
    }));
  }
}

function noteAdded(it) {
  if (!it) return;
  const n = $('#added-note');
  const emo = iconFor(it.name);
  n.innerHTML = '';
  n.append(`${emo ? emo + ' ' : ''}`, el('b', null, it.name), ` → ${store(it.store).label}`);
  n.hidden = true; void n.offsetWidth; n.hidden = false;
  vibrate(10);
}

function stepQty(delta) {
  const inp = $('#item-qty');
  const m = inp.value.match(/^\s*(\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) { if (delta > 0) inp.value = '1'; return; }
  const n = Math.round((parseFloat(m[1].replace(',', '.')) + delta) * 100) / 100;
  inp.value = n <= 0 ? '' : `${n}${m[2]}`;
}

// ---------- Hoja: editar ----------
function openEditor(id) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  editing = { id, store: it.store, aisle: it.aisle || 'otros', work: !!it.work };
  $('#edit-name').value = it.name;
  $('#edit-qty').value = it.qty || '';
  renderEditor();
  $('#edit-sheet').hidden = false;
  hideToast();
}
function renderEditor() {
  const name = $('#edit-name').value || '';
  fillPic($('#edit-icon'), name, editing.store);
  renderWorkToggle($('#edit-work'), editing.work);
  const suggested = analyze(name).ranking.filter((s) => s !== 'otros');
  const rest = STORES.map((s) => s.id).filter((id) => !suggested.includes(id));
  const fill = (box, ids) => {
    box.innerHTML = '';
    ids.forEach((id) => box.appendChild(storePill(id, editing.store === id, () => { editing.store = id; renderEditor(); })));
  };
  fill($('#edit-suggested'), suggested);
  fill($('#edit-stores'), rest);
  $('#edit-aisle-box').hidden = editing.store !== 'super';
  const aisles = $('#edit-aisles');
  aisles.innerHTML = '';
  AISLES.forEach((a) => aisles.appendChild(pill(a.label, editing.aisle === a.id, () => { editing.aisle = a.id; renderEditor(); })));
}
function closeEditor() { $('#edit-sheet').hidden = true; editing = null; }
function saveEditor() {
  const it = state.items.find((i) => i.id === editing.id);
  if (it) {
    it.name = capitalize($('#edit-name').value.trim().replace(/\s+/g, ' ')) || it.name;
    it.qty = $('#edit-qty').value.trim();
    it.store = editing.store;
    it.aisle = editing.aisle;
    it.work = editing.work;
    remember(it.name, it.store, it.aisle, it.work);
  }
  closeEditor(); save(); render();
}

// ---------- Eventos ----------
$('#nav-list').append(icon('list'), 'Mi lista');
$('#nav-shop').append(icon('bag'), 'De compras');
$('#fab').appendChild(icon('plus'));
$('#qty-minus').appendChild(icon('minus'));
$('#qty-plus').appendChild(icon('plus'));

enableDragScroll($('#shop-filter'));
$('#nav-list').addEventListener('click', () => setView('list'));
$('#nav-shop').addEventListener('click', () => setView('shop'));
$('#fab').addEventListener('click', openAdd);
$('#add-close').addEventListener('click', closeAdd);
$('#item-name').addEventListener('input', () => { addChoice = null; addWork = null; renderAdd(); });
$('#work-toggle').addEventListener('click', () => { addWork = !effectiveWork($('#item-name').value.trim()); renderAdd(); });
$('#edit-work').addEventListener('click', () => { editing.work = !editing.work; renderEditor(); });
$('#qty-minus').addEventListener('click', () => stepQty(-1));
$('#qty-plus').addEventListener('click', () => stepQty(1));
$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#item-name').value;
  if (!name.trim()) { $('#item-name').focus(); return; }
  const it = addItem(name, $('#item-qty').value, addChoice || 'auto', effectiveWork(name));
  noteAdded(it);
  $('#item-name').value = ''; $('#item-qty').value = '';
  addChoice = null; addWork = null; showAllStores = false;
  renderAdd();
  $('#item-name').focus();
});
$('#edit-name').addEventListener('input', renderEditor);
$('#finish-btn').addEventListener('click', finishShopping);
$('#toast-action').addEventListener('click', () => { const fn = toastFn; hideToast(); if (fn) fn(); });
$('#edit-save').addEventListener('click', saveEditor);
$('#edit-delete').addEventListener('click', () => { const id = editing.id; closeEditor(); removeItem(id); });
for (const id of ['add-sheet', 'edit-sheet']) {
  $('#' + id).addEventListener('click', (e) => { if (e.target.id === id) id === 'add-sheet' ? closeAdd() : closeEditor(); });
}
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (editing) closeEditor(); else if (!$('#add-sheet').hidden) closeAdd();
});

// ---------- Inicio ----------
state = load();
if (!Array.isArray(state.collapsed)) state.collapsed = [];
if (state.shopStore !== undefined || !Array.isArray(state.shopSel)) {   // versión anterior guardaba "shopStore"
  state.shopSel = state.shopStore && !['all', 'work'].includes(state.shopStore) ? [state.shopStore] : [];
  state.shopWork = state.shopStore === 'work';
}
// Productos que ya tenías: detecta si son de trabajo
for (const it of state.items) if (typeof it.work !== 'boolean') it.work = placeFor(it.name).work;
state.shopSel = state.shopSel.slice(0, 1); // solo un lugar a la vez
delete state.shopStore;
save();
setView(state.view);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

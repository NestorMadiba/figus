// ============================================================
// FIGURITAS SALTA 2026 - App Logic
// Reemplazá estos valores con los de tu proyecto Supabase:
// https://app.supabase.com → Settings → API
// ============================================================

const SUPABASE_URL      = 'https://iuxatihfcpauzvolbhvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eGF0aWhmY3BhdXp2b2xiaHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDMwMTQsImV4cCI6MjA5NDYxOTAxNH0.vqixx0b0gUweEM1JOQgkaPmTnHr0gd70S6Swo3TtMZw';

// ============================================================
// SUPABASE CLIENT
// ============================================================
const { createClient } = supabase;
let sb = null;

function initSupabase() {
  if (SUPABASE_URL.includes('TU_PROYECTO')) {
    console.warn('⚠️ Supabase no configurado. Modo demo activo.');
    return false;
  }
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

// ============================================================
// STATE
// ============================================================
let currentUser      = null;
let currentProfile   = null;
let currentStickers  = { repetidas: [], faltantes: [] };
let currentMatches   = [];
let activeChatUserId = null;
let chatChannel      = null;
let chatMessages     = {};
let demoMode         = true;
let previewNum       = null;

// Demo data
const DEMO_USERS = [
  { id:'u1', nombre:'Martín Rodríguez',  barrio:'Capital - Norte',  whatsapp:'+5493876001234' },
  { id:'u2', nombre:'Lucía Fernández',   barrio:'Capital - Centro', whatsapp:'+5493876005678' },
  { id:'u3', nombre:'Diego Mamani',      barrio:'Cerrillos',        whatsapp:'' },
  { id:'u4', nombre:'Ana Quispe',        barrio:'General Güemes',   whatsapp:'+5493876009999' },
];
const DEMO_STICKERS = [
  { user_id:'u1', repetidas:[3,7,12,45,67,88],  faltantes:[1,2,5,10,33] },
  { user_id:'u2', repetidas:[1,2,5,10,33,99],   faltantes:[3,45,67,100] },
  { user_id:'u3', repetidas:[10,33,100,110],     faltantes:[7,12,88] },
  { user_id:'u4', repetidas:[7,45],              faltantes:[99,110,111] },
];

// Puntos de encuentro en Salta
const MEETING_POINTS = [
  { name:'Plaza 9 de Julio',         lat:-24.7892, lng:-65.4106, desc:'Plaza central, frente a la Catedral. Ideal los fines de semana.' },
  { name:'Parque San Martín',        lat:-24.7823, lng:-65.4198, desc:'Zona de juegos. Sábados a la mañana hay intercambio espontáneo.' },
  { name:'Paseo Balcarce',           lat:-24.7915, lng:-65.4078, desc:'Zona comercial y gastronómica. Muy transitada.' },
  { name:'Terminal de Ómnibus',      lat:-24.8015, lng:-65.4110, desc:'Referencia para llegar desde distintos barrios.' },
  { name:'Plaza Güemes',             lat:-24.7848, lng:-65.4059, desc:'Barrio histórico, ambiente familiar.' },
  { name:'Shopping El Paseo',        lat:-24.7920, lng:-65.4250, desc:'Punto de encuentro cubierto para días de lluvia.' },
  { name:'Estadio Padre Martearena', lat:-24.7756, lng:-65.4303, desc:'Zona norte, para quienes viven en Capital Norte.' },
];

// ============================================================
// INIT
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  demoMode = !initSupabase();

  setTimeout(async () => {
    document.getElementById('loading-screen').style.display = 'none';
    initLandingMap();
    loadStats();

    if (!demoMode) {
      const { data } = await sb.auth.getSession();
      if (data.session) {
        currentUser = data.session.user;
        await loadUserAndDashboard();
      } else {
        showSection('landing');
      }
      sb.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') { currentUser = session.user; loadUserAndDashboard(); }
        else if (event === 'SIGNED_OUT') { currentUser = null; showSection('landing'); }
      });
    } else {
      showSection('landing');
    }
  }, 800);
});

// ============================================================
// NAVIGATION
// ============================================================
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  window.scrollTo(0, 0);
}

function switchAuthTab(tab) {
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('tab-active', tab === 'login');
  document.getElementById('tab-login').classList.toggle('text-gray-400', tab !== 'login');
  document.getElementById('tab-register').classList.toggle('tab-active', tab !== 'login');
  document.getElementById('tab-register').classList.toggle('text-gray-400', tab === 'login');
}

function switchDashTab(tab) {
  document.querySelectorAll('.dtab').forEach(t => { t.classList.remove('tab-active'); t.classList.add('text-gray-400'); });
  document.querySelectorAll('.dtab-content').forEach(c => c.classList.add('hidden'));
  const btn = document.getElementById(`dtab-${tab}`);
  btn.classList.add('tab-active'); btn.classList.remove('text-gray-400');
  document.getElementById(`dtab-content-${tab}`).classList.remove('hidden');
  if (tab === 'mapa')    initDashMap();
  if (tab === 'chat')    loadChatList();
  if (tab === 'matches') resetMatchesView();
}

function resetMatchesView() {
  if (currentMatches.length === 0) {
    document.getElementById('matches-empty').classList.remove('hidden');
    document.getElementById('matches-list').classList.add('hidden');
  }
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, icon = '✅', duration = 3000) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent  = msg;
  document.getElementById('toast-icon').textContent = icon;
  t.classList.remove('opacity-0', 'pointer-events-none');
  t.classList.add('opacity-100');
  setTimeout(() => { t.classList.add('opacity-0','pointer-events-none'); t.classList.remove('opacity-100'); }, duration);
}

// ============================================================
// AUTH
// ============================================================
async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return showToast('Completá todos los campos', '⚠️');
  if (demoMode) {
    currentUser    = { id:'demo-user', email };
    currentProfile = { nombre:'Usuario Demo', barrio:'Capital - Centro', whatsapp:'+54 387 1234567' };
    currentStickers = { repetidas:[10,45,88,130,200,350], faltantes:[1,3,90,91,92,180] };
    loadDashboard(); return;
  }
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) showToast(error.message, '❌');
}

async function handleRegister() {
  const nombre   = document.getElementById('reg-nombre').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const barrio   = document.getElementById('reg-barrio').value;
  const whatsapp = document.getElementById('reg-whatsapp').value.trim();
  if (!nombre || !email || !password || !barrio) return showToast('Completá los campos obligatorios', '⚠️');
  if (password.length < 6) return showToast('La contraseña debe tener al menos 6 caracteres', '⚠️');
  if (demoMode) {
    currentUser = { id:'demo-user', email };
    currentProfile = { nombre, barrio, whatsapp };
    currentStickers = { repetidas:[], faltantes:[] };
    loadDashboard(); return;
  }
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return showToast(error.message, '❌');
  await sb.from('users').insert({ id:data.user.id, nombre, barrio, whatsapp, email });
  showToast('¡Cuenta creada! Revisá tu email para confirmar.', '📧');
  switchAuthTab('login');
}

async function handleLogout() {
  if (!demoMode) await sb.auth.signOut();
  currentUser = null; currentProfile = null;
  currentStickers = { repetidas:[], faltantes:[] }; currentMatches = [];
  showSection('landing');
}

// ============================================================
// USER DATA
// ============================================================
async function loadUserAndDashboard() {
  if (demoMode) return loadDashboard();
  const { data:profile }  = await sb.from('users').select('*').eq('id', currentUser.id).single();
  currentProfile = profile;
  const { data:stickers } = await sb.from('stickers').select('*').eq('user_id', currentUser.id).single();
  if (stickers) currentStickers = { repetidas:stickers.repetidas||[], faltantes:stickers.faltantes||[] };
  loadDashboard();
}

function loadDashboard() {
  const p      = currentProfile || {};
  const nombre = p.nombre || currentUser?.email?.split('@')[0] || 'Usuario';
  document.getElementById('user-name-nav').textContent       = nombre.split(' ')[0];
  document.getElementById('profile-avatar-big').textContent  = nombre[0]?.toUpperCase() || 'U';
  document.getElementById('profile-name-big').textContent    = nombre;
  document.getElementById('profile-barrio-big').textContent  = p.barrio || 'Sin barrio';
  document.getElementById('prof-nombre').value               = nombre;
  document.getElementById('prof-barrio').value               = p.barrio   || '';
  document.getElementById('prof-whatsapp').value             = p.whatsapp || '';
  renderStickerGrids();
  updateProgress();
  showSection('dashboard');
  showToast(`¡Hola, ${nombre.split(' ')[0]}! 🎉`);
}

// ============================================================
// STICKER CARD RENDERER
// ============================================================
function makeStickerCard(num, onRemove, size = 'normal') {
  const s   = getStickerInfo(num);
  const pal = getStickerColor(s);

  const w = size === 'small' ? '64px' : '90px';
  const h = size === 'small' ? '84px' : '120px';
  const numSize  = size === 'small' ? '1.3rem' : '1.6rem';
  const flagSize = size === 'small' ? '1rem'   : '1.5rem';
  const nameSize = size === 'small' ? '0.38rem': '0.55rem';
  const badgeSize= size === 'small' ? '0.42rem': '0.48rem';

  const card = document.createElement('div');
  card.className = `sticker-card${s.tipo === 'especial' ? ' especial' : ''}`;
  card.style.cssText = `
    background:${pal.bg}; color:${pal.text};
    width:${w}; height:${h};
    border-radius:${size==='small'?'8px':'10px'};
    display:inline-flex; flex-direction:column;
    align-items:center; justify-content:space-between;
    padding:${size==='small'?'4px 2px':'6px 4px 5px'};
    cursor:pointer; position:relative; flex-shrink:0;
    border:2px solid rgba(255,255,255,0.35);
    box-shadow:0 3px 10px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.25);
    transition:transform 0.15s ease,box-shadow 0.15s ease; overflow:hidden;
  `;
  card.title = `#${num} – ${s.jugador} (${s.pais})`;
  card.innerHTML = `
    <span style="font-size:${badgeSize};font-weight:800;background:rgba(255,255,255,0.22);border-radius:99px;padding:1px ${size==='small'?'4':'5'}px;text-transform:uppercase;letter-spacing:.05em;color:${pal.text}">${s.bandera} ${s.code}</span>
    <span style="font-family:'Bebas Neue',sans-serif;font-size:${numSize};line-height:1;text-shadow:0 1px 3px rgba(0,0,0,0.3);color:${pal.text}">${num}</span>
    <span style="font-size:${flagSize};line-height:1">${s.bandera}</span>
    <span style="font-size:${nameSize};font-weight:800;text-align:center;max-width:${size==='small'?'58':'80'}px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-transform:uppercase;letter-spacing:.02em;color:${pal.text}">${s.jugador}</span>
  `;

  // Click → preview modal
  card.addEventListener('click', () => showStickerPreview(num));

  // Right-click / long-press → remove
  if (onRemove) {
    card.addEventListener('contextmenu', e => { e.preventDefault(); onRemove(num); });
    let longPressTimer;
    card.addEventListener('touchstart', () => { longPressTimer = setTimeout(() => onRemove(num), 600); }, { passive:true });
    card.addEventListener('touchend',   () => clearTimeout(longPressTimer));
  }

  // Hover effect
  card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-4px) scale(1.04)'; card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'; });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = '0 3px 10px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.25)'; });

  return card;
}

function renderStickerGrids() {
  renderGrid('rep-grid',  'rep-empty',  currentStickers.repetidas, 'repetidas');
  renderGrid('falt-grid', 'falt-empty', currentStickers.faltantes, 'faltantes');
  document.getElementById('rep-count').textContent  = currentStickers.repetidas.length;
  document.getElementById('falt-count').textContent = currentStickers.faltantes.length;
}

function renderGrid(gridId, emptyId, list, type) {
  const grid  = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  grid.querySelectorAll('.sticker-card').forEach(c => c.remove());
  if (list.length === 0) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  list.forEach(num => grid.appendChild(makeStickerCard(num, n => removeSticker(type, n))));
}

// ============================================================
// STICKER PREVIEW MODAL
// ============================================================
function showStickerPreview(num) {
  previewNum = num;
  const s   = getStickerInfo(num);
  const pal = getStickerColor(s);

  const bigCard = document.getElementById('preview-big-card');
  bigCard.style.cssText = `background:${pal.bg};color:${pal.text};`;
  bigCard.innerHTML = `
    <span style="font-size:.65rem;font-weight:800;background:rgba(255,255,255,0.22);border-radius:99px;padding:3px 10px;text-transform:uppercase;color:${pal.text}">${s.bandera} ${s.code}</span>
    <span style="font-family:'Bebas Neue',sans-serif;font-size:4rem;line-height:1;text-shadow:0 2px 6px rgba(0,0,0,0.3);color:${pal.text}">${num}</span>
    <span style="font-size:3rem;line-height:1">${s.bandera}</span>
    <span style="font-size:.8rem;font-weight:800;text-transform:uppercase;text-align:center;max-width:150px;color:${pal.text}">${s.jugador}</span>
    <span style="font-size:.65rem;font-weight:700;background:rgba(255,255,255,0.22);border-radius:99px;padding:3px 10px;color:${pal.text}">
      ${s.tipo==='escudo'?'✨ Escudo':s.tipo==='foto_equipo'?'📸 Foto equipo':s.tipo==='especial'?'⭐ Especial':'⚽ Jugador'}
    </span>
  `;

  document.getElementById('preview-title').textContent   = `Figurita #${num}`;
  document.getElementById('preview-pais').textContent    = `${s.bandera} ${s.pais}`;
  document.getElementById('preview-jugador').textContent = s.jugador;

  const inRep  = currentStickers.repetidas.includes(num);
  const inFalt = currentStickers.faltantes.includes(num);
  document.getElementById('btn-add-rep').textContent  = inRep  ? '✓ Ya en Repetidas'  : '➕ Agregar a Repetidas';
  document.getElementById('btn-add-falt').textContent = inFalt ? '✓ Ya en Faltantes'  : '➕ Agregar a Faltantes';

  const modal = document.getElementById('sticker-preview-modal');
  modal.classList.remove('hidden'); modal.classList.add('flex');
}

function hideStickerPreview() {
  document.getElementById('sticker-preview-modal').classList.add('hidden');
  document.getElementById('sticker-preview-modal').classList.remove('flex');
  previewNum = null;
}

function addToListFromPreview(type) {
  if (previewNum === null) return;
  const list = currentStickers[type];
  if (!list.includes(previewNum)) {
    list.push(previewNum);
    list.sort((a, b) => a - b);
    renderStickerGrids(); updateProgress();
    showToast(`Figurita #${previewNum} → ${type === 'repetidas' ? 'Repetidas' : 'Faltantes'}`, '✅');
  } else {
    showToast(`Ya está en ${type === 'repetidas' ? 'Repetidas' : 'Faltantes'}`, 'ℹ️');
  }
  hideStickerPreview();
}

// ============================================================
// STICKER SEARCH
// ============================================================
function searchStickers() {
  const query   = document.getElementById('search-sticker-input').value.trim().toLowerCase();
  const results = document.getElementById('search-results');
  const hint    = document.getElementById('search-hint');
  results.innerHTML = '';
  if (!query) { hint.style.display = 'block'; return; }
  hint.style.display = 'none';

  const isNum   = /^\d+$/.test(query);
  const matched = [];

  if (isNum) {
    const n = parseInt(query);
    for (let i = Math.max(1, n - 2); i <= Math.min(980, n + 7); i++) matched.push(getStickerInfo(i));
  } else {
    for (let i = 1; i <= 980; i++) {
      const s = getStickerInfo(i);
      if (s.jugador.toLowerCase().includes(query) || s.pais.toLowerCase().includes(query) || s.code.toLowerCase().includes(query)) {
        matched.push(s);
        if (matched.length >= 30) break;
      }
    }
  }

  if (matched.length === 0) {
    results.innerHTML = '<p class="text-gray-300 text-xs text-center py-3 w-full">Sin resultados. Probá con otro nombre o número.</p>';
    return;
  }
  matched.forEach(s => results.appendChild(makeStickerCard(s.num, null)));
}

function clearSearch() {
  document.getElementById('search-sticker-input').value = '';
  document.getElementById('search-results').innerHTML   = '';
  document.getElementById('search-hint').style.display  = 'block';
}

// ============================================================
// STICKERS ADD / REMOVE / SAVE
// ============================================================
function addStickers(type) {
  const inputId = type === 'repetidas' ? 'rep-input' : 'falt-input';
  const raw     = document.getElementById(inputId).value;
  const nums    = raw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1 && n <= 980);
  if (!nums.length) return showToast('Ingresá números válidos entre 1 y 980', '⚠️');
  let added = 0;
  nums.forEach(n => { if (!currentStickers[type].includes(n)) { currentStickers[type].push(n); added++; } });
  currentStickers[type].sort((a, b) => a - b);
  document.getElementById(inputId).value = '';
  renderStickerGrids(); updateProgress();
  if (added) showToast(`${added} figurita${added !== 1 ? 's' : ''} agregada${added !== 1 ? 's' : ''}`, '✅');
  else showToast('Esas figuritas ya las tenés cargadas', 'ℹ️');
}

function removeSticker(type, num) {
  currentStickers[type] = currentStickers[type].filter(n => n !== num);
  renderStickerGrids(); updateProgress();
  showToast(`Figurita #${num} eliminada`, '🗑️');
}

async function saveStickers() {
  if (demoMode) return showToast('Figuritas guardadas (modo demo)', '💾');
  const { error } = await sb.from('stickers').upsert({
    user_id: currentUser.id, repetidas: currentStickers.repetidas,
    faltantes: currentStickers.faltantes, updated_at: new Date().toISOString()
  }, { onConflict:'user_id' });
  if (error) return showToast('Error al guardar: ' + error.message, '❌');
  showToast('Figuritas guardadas ✓', '💾');
}

function updateProgress() {
  const rep   = currentStickers.repetidas.length;
  const falt  = currentStickers.faltantes.length;
  const have  = Math.max(0, 980 - falt);
  const pct   = Math.round((have / 980) * 100);
  document.getElementById('prog-rep').textContent   = rep;
  document.getElementById('prog-falt').textContent  = falt;
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-bar').style.width   = pct + '%';
  document.getElementById('prog-label').textContent = `${have} / 980 figuritas (~estimado)`;
  document.getElementById('rep-count').textContent  = rep;
  document.getElementById('falt-count').textContent = falt;
}

// ============================================================
// MATCH ALGORITHM
// ============================================================
async function findMatches() {
  document.getElementById('matches-empty').classList.add('hidden');
  document.getElementById('matches-list').classList.add('hidden');
  document.getElementById('matches-loading').classList.remove('hidden');

  let allUsers, allStickers;
  if (demoMode) { allUsers = DEMO_USERS; allStickers = DEMO_STICKERS; }
  else {
    const { data:u } = await sb.from('users').select('*').neq('id', currentUser.id);
    const { data:s } = await sb.from('stickers').select('*').neq('user_id', currentUser.id);
    allUsers = u||[]; allStickers = s||[];
  }

  const matches = [];
  allStickers.forEach(os => {
    const user = allUsers.find(u => u.id === os.user_id);
    if (!user) return;
    const theyHaveINeed = (os.repetidas||[]).filter(n => currentStickers.faltantes.includes(n));
    const iHaveTheyNeed = currentStickers.repetidas.filter(n => (os.faltantes||[]).includes(n));
    const score = theyHaveINeed.length + iHaveTheyNeed.length;
    if (score > 0) matches.push({ user, theyHaveINeed, iHaveTheyNeed, score });
  });
  matches.sort((a, b) => b.score - a.score);
  currentMatches = matches;
  document.getElementById('matches-loading').classList.add('hidden');
  document.getElementById('prog-matches').textContent = matches.length;

  if (matches.length === 0) {
    document.getElementById('matches-empty').innerHTML = `
      <div class="text-center py-16">
        <div class="text-5xl mb-3">😕</div>
        <p class="text-gray-500 font-semibold">No encontramos matches por ahora</p>
        <p class="text-gray-400 text-sm mt-1">Cargá más figuritas o esperá que se sumen más usuarios</p>
      </div>`;
    document.getElementById('matches-empty').classList.remove('hidden');
    return;
  }

  const list = document.getElementById('matches-list');
  list.innerHTML = '';
  matches.forEach(m => {
    const card = document.createElement('div');
    card.className = 'match-card bg-white rounded-2xl shadow-sm border border-blue-50 p-5';

    const makeCards = (nums) => {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
      nums.slice(0, 8).forEach(n => wrap.appendChild(makeStickerCard(n, null, 'small')));
      if (nums.length > 8) {
        const more = document.createElement('span');
        more.className = 'flex items-center text-xs text-gray-400 font-bold';
        more.textContent = `+${nums.length - 8} más`;
        wrap.appendChild(more);
      }
      return wrap;
    };

    card.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#74ACDF] to-[#2F7FC1] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            ${m.user.nombre[0].toUpperCase()}
          </div>
          <div>
            <p class="font-bold text-[#1e3a5f]">${m.user.nombre}</p>
            <p class="text-xs text-gray-400">📍 ${m.user.barrio}</p>
          </div>
        </div>
        <div class="bg-[#2F7FC1] text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
          ${m.score} match${m.score!==1?'es':''}
        </div>
      </div>
      ${m.theyHaveINeed.length > 0 ? `<p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🟢 Tienen lo que te falta (${m.theyHaveINeed.length})</p>` : ''}
    `;

    if (m.theyHaveINeed.length > 0) card.appendChild(makeCards(m.theyHaveINeed));

    if (m.iHaveTheyNeed.length > 0) {
      const lbl = document.createElement('p');
      lbl.className = 'text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 mt-3';
      lbl.textContent = `🟡 Necesitan lo que vos tenés (${m.iHaveTheyNeed.length})`;
      card.appendChild(lbl);
      card.appendChild(makeCards(m.iHaveTheyNeed));
    }

    const btn = document.createElement('button');
    btn.className = 'w-full bg-[#2F7FC1] hover:bg-[#1a5f9c] text-white font-bold py-2.5 rounded-xl text-sm transition mt-3';
    btn.textContent = 'Contactar →';
    btn.onclick = () => openContactModal(m.user.id);
    card.appendChild(btn);
    list.appendChild(card);
  });

  list.classList.remove('hidden');
  showToast(`¡${matches.length} match${matches.length!==1?'es':''} encontrado${matches.length!==1?'s':''}! 🎉`);
}

// ============================================================
// CONTACT MODAL
// ============================================================
let contactUserId = null;

function openContactModal(userId) {
  contactUserId = userId;
  const all  = demoMode ? DEMO_USERS : currentMatches.map(m => m.user);
  const user = all.find(u => u.id === userId);
  if (!user) return;
  document.getElementById('contact-modal-user').textContent = `${user.nombre} · ${user.barrio}`;
  const btn = document.getElementById('contact-wa-btn');
  if (user.whatsapp) { btn.classList.remove('hidden'); btn.dataset.number = user.whatsapp; btn.dataset.name = user.nombre; }
  else btn.classList.add('hidden');
  document.getElementById('contact-modal').classList.remove('hidden');
  document.getElementById('contact-modal').classList.add('flex');
}

function hideContactModal() {
  document.getElementById('contact-modal').classList.add('hidden');
  document.getElementById('contact-modal').classList.remove('flex');
}

function openWhatsApp() {
  const btn    = document.getElementById('contact-wa-btn');
  const number = (btn.dataset.number||'').replace(/\D/g,'');
  const msg    = encodeURIComponent('Hola! Te escribo desde Figuritas Salta 2026. ¿Podemos hacer un intercambio? 🏆⚽');
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  hideContactModal();
}

function startChat() {
  if (!contactUserId) return;
  hideContactModal();
  switchDashTab('chat');
  setTimeout(() => openChat(contactUserId), 100);
}

// ============================================================
// CHAT
// ============================================================
function loadChatList() {
  const list  = document.getElementById('chat-list');
  const known = Object.keys(chatMessages);
  if (known.length === 0) {
    list.innerHTML = '<div class="text-center text-gray-300 text-sm py-8">Sin conversaciones aún.<br>Iniciá desde un match.</div>';
    return;
  }
  list.innerHTML = '';
  known.forEach(uid => {
    const all  = demoMode ? DEMO_USERS : currentMatches.map(m => m.user);
    const user = all.find(u => u.id === uid);
    if (!user) return;
    const msgs = chatMessages[uid]||[];
    const last = msgs[msgs.length-1];
    const btn  = document.createElement('button');
    btn.className = `w-full text-left p-3 rounded-xl hover:bg-blue-50 transition ${activeChatUserId===uid?'bg-blue-50':''}`;
    btn.innerHTML = `<div class="flex items-center gap-2">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#74ACDF] to-[#2F7FC1] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">${user.nombre[0].toUpperCase()}</div>
      <div class="min-w-0"><p class="font-bold text-[#1e3a5f] text-sm truncate">${user.nombre}</p><p class="text-xs text-gray-400 truncate">${last?last.text:'...'}</p></div>
    </div>`;
    btn.onclick = () => openChat(uid);
    list.appendChild(btn);
  });
}

function openChat(userId) {
  const all  = demoMode ? DEMO_USERS : currentMatches.map(m => m.user);
  const user = all.find(u => u.id === userId);
  if (!user) return;
  activeChatUserId = userId;
  if (!chatMessages[userId]) chatMessages[userId] = [];
  document.getElementById('chat-avatar').textContent         = user.nombre[0].toUpperCase();
  document.getElementById('chat-partner-name').textContent   = user.nombre;
  document.getElementById('chat-partner-barrio').textContent = user.barrio;
  document.getElementById('chat-input-area').classList.remove('hidden');
  renderChatMessages(); loadChatList();
  if (!demoMode && sb) {
    if (chatChannel) chatChannel.unsubscribe();
    const roomId = [currentUser.id, userId].sort().join('_');
    chatChannel = sb.channel(`chat:${roomId}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`room_id=eq.${roomId}`},
        (payload) => {
          if (payload.new.sender_id !== currentUser.id) {
            chatMessages[userId].push({ text:payload.new.content, mine:false });
            if (activeChatUserId === userId) renderChatMessages();
            loadChatList();
          }
        }).subscribe();
    sb.from('messages').select('*').eq('room_id', roomId).order('created_at').then(({ data }) => {
      if (data) { chatMessages[userId] = data.map(m => ({ text:m.content, mine:m.sender_id===currentUser.id })); renderChatMessages(); }
    });
  }
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  const msgs      = chatMessages[activeChatUserId]||[];
  if (msgs.length === 0) { container.innerHTML = `<div class="text-center text-gray-400 text-sm py-8"><div class="text-3xl mb-2">👋</div>¡Empezá la conversación!</div>`; return; }
  container.innerHTML = msgs.map(m => `
    <div class="flex ${m.mine?'justify-end':'justify-start'}">
      <div class="${m.mine?'bubble-me':'bubble-other'} px-4 py-2 max-w-xs text-sm">${m.text}</div>
    </div>`).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text || !activeChatUserId) return;
  chatMessages[activeChatUserId].push({ text, mine:true });
  input.value = '';
  renderChatMessages(); loadChatList();
  if (!demoMode && sb) {
    const roomId = [currentUser.id, activeChatUserId].sort().join('_');
    await sb.from('messages').insert({ room_id:roomId, sender_id:currentUser.id, content:text });
  }
}

// ============================================================
// MAPS
// ============================================================
let landingMap = null, dashMap = null;

const customIcon = L.divIcon({
  className:'',
  html:`<div style="background:#2F7FC1;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
  iconSize:[32,32], iconAnchor:[16,16]
});

function addMapPoints(map) {
  MEETING_POINTS.forEach(p =>
    L.marker([p.lat,p.lng],{icon:customIcon}).addTo(map)
     .bindPopup(`<strong>${p.name}</strong><br><small>${p.desc}</small>`)
  );
}

function initLandingMap() {
  if (landingMap) return;
  landingMap = L.map('map-landing').setView([-24.7892,-65.4106],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(landingMap);
  addMapPoints(landingMap);
}

function initDashMap() {
  setTimeout(() => {
    if (dashMap) { dashMap.invalidateSize(); return; }
    dashMap = L.map('map-dashboard').setView([-24.7892,-65.4106],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(dashMap);
    addMapPoints(dashMap); renderPointsList();
  }, 100);
}

function renderPointsList() {
  document.getElementById('points-list').innerHTML = MEETING_POINTS.map(p => `
    <div class="bg-white rounded-xl p-4 border border-blue-50 cursor-pointer hover:border-[#74ACDF] transition"
         onclick="dashMap.setView([${p.lat},${p.lng}],16)">
      <p class="font-bold text-[#1e3a5f] text-sm">📍 ${p.name}</p>
      <p class="text-gray-400 text-xs mt-1">${p.desc}</p>
    </div>`).join('');
}

// ============================================================
// SUGGEST MODAL
// ============================================================
function showSuggestModal() { document.getElementById('suggest-modal').classList.remove('hidden'); document.getElementById('suggest-modal').classList.add('flex'); }
function hideSuggestModal()  { document.getElementById('suggest-modal').classList.add('hidden'); document.getElementById('suggest-modal').classList.remove('flex'); }

async function submitSuggestion() {
  const name    = document.getElementById('suggest-name').value.trim();
  const address = document.getElementById('suggest-address').value.trim();
  const desc    = document.getElementById('suggest-desc').value.trim();
  if (!name || !address) return showToast('Completá nombre y dirección', '⚠️');
  if (!demoMode && sb) await sb.from('suggested_points').insert({ user_id:currentUser.id, name, address, description:desc, status:'pending' });
  hideSuggestModal();
  ['suggest-name','suggest-address','suggest-desc'].forEach(id => document.getElementById(id).value = '');
  showToast('¡Sugerencia enviada! La revisaremos pronto 🙏');
}

// ============================================================
// PROFILE
// ============================================================
async function saveProfile() {
  const nombre   = document.getElementById('prof-nombre').value.trim();
  const barrio   = document.getElementById('prof-barrio').value;
  const whatsapp = document.getElementById('prof-whatsapp').value.trim();
  if (!nombre || !barrio) return showToast('Completá nombre y barrio', '⚠️');
  currentProfile = { ...currentProfile, nombre, barrio, whatsapp };
  document.getElementById('user-name-nav').textContent      = nombre.split(' ')[0];
  document.getElementById('profile-avatar-big').textContent = nombre[0].toUpperCase();
  document.getElementById('profile-name-big').textContent   = nombre;
  document.getElementById('profile-barrio-big').textContent = barrio;
  if (!demoMode && sb) {
    const { error } = await sb.from('users').upsert({ id:currentUser.id, nombre, barrio, whatsapp, email:currentUser.email });
    if (error) return showToast('Error: ' + error.message, '❌');
  }
  showToast('Perfil actualizado ✓', '👤');
}

// ============================================================
// STATS
// ============================================================
async function loadStats() {
  if (demoMode) { animateCount('stat-users',47); animateCount('stat-stickers',1203); animateCount('stat-matches',89); return; }
  try {
    const [{ count:u },{ count:s },{ count:m }] = await Promise.all([
      sb.from('users').select('*',{count:'exact',head:true}),
      sb.from('stickers').select('*',{count:'exact',head:true}),
      sb.from('matches').select('*',{count:'exact',head:true}),
    ]);
    animateCount('stat-users',u||0); animateCount('stat-stickers',s||0); animateCount('stat-matches',m||0);
  } catch { animateCount('stat-users',0); animateCount('stat-stickers',0); animateCount('stat-matches',0); }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const step  = Math.ceil(target/40);
  const timer = setInterval(() => { current = Math.min(current+step,target); el.textContent = current.toLocaleString('es-AR'); if (current>=target) clearInterval(timer); }, 30);
}

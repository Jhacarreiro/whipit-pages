
let offersRequest;
let searchVersion = 0;
const base = (window.REFURB_BASE_PATH || '').replace(/\/$/, '');
const eur = v => (v === null || v === undefined) ? '—' : `${Math.round(Number(v)).toLocaleString('pt-PT')}€`;
const eurDelta = v => Number(v) < 1 ? `${Number(v).toFixed(2).replace('.', ',')}€` : eur(v);
const verdictLabel = v => ({excellent:'Excelente', good:'Bom', maybe:'Talvez', avoid:'Evitar', false:'Falso negócio'}[v] || '—');
const verdictClass = v => ({excellent:'good', good:'good', maybe:'warn', avoid:'bad', false:'bad'}[v] || '');
function escapeHtml(s){return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/'/g, '&#39;');}
function cleanTitle(s){
  s = String(s || 'Oferta').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*\([^)]*PT\)\s*$/i, '');
  s = s.replace(/\b(Recondicionado|Flippers|Reuse|Como Novo|Marcas Mínimas|Sinais de Uso|Funcional|Seminovo|Muito Bom|Bom)\b/gi, ' ');
  s = s.replace(/[()]/g, ' ');
  s = s.replace(/\s*-\s*/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const cuts = [
    /\s+Intel Core\b/i,
    /\s+AMD Ryzen\b/i,
    /\s+Smart TV\b/i,
    /\s+\d{2,3}Hz\b/i,
    /\s+\d+(?:\.\d+)?ms\b/i,
    /\s+Rapid IPS\b/i,
    /\s+Fast IPS\b/i,
    /\s+Adaptive Sync\b/i,
    /\s+AdaptiveSync\b/i,
    /\s+FreeSync\b/i,
    /\s+G-Sync\b/i,
    /\s+Altura\b/i,
    /\s+HDR10\b/i,
    /\s+Dolby\b/i,
    /, com\s+/i,
    /\s+Filtro\b/i
  ];
  for (const re of cuts){ const m = s.search(re); if(m > 24){ s = s.slice(0, m).trim(); break; } }
  if(s.length > 52){ const cut = s.slice(0,52); s = cut.slice(0, Math.max(cut.lastIndexOf(' '), 34)).trim(); }
  return s;
}
function skuOf(o){const raw = o.sku || o.model || String(o.product_id || '').replace(/^(pccomponentes|ean|worten)-/, '') || 'n/d'; return String(raw).replace(/#reac$/i, '');}
function offerCard(o){
  const warrantyMonths = Number(o.warranty_months || 0);
  const warrantyLabel = warrantyMonths % 12 === 0 && warrantyMonths >= 24 ? `${warrantyMonths / 12} anos` : `${warrantyMonths} meses`;
  const warrantyBadge = warrantyMonths ? `<span class="badge${warrantyMonths >= 36 ? ' good' : ''}">🛡️ ${warrantyLabel}</span>` : '<span class="badge warn">Garantia n/d</span>';
  const note = (o.warnings || [])[0] || 'Confirma preço, estado e garantia na loja original antes de comprar';
  const state = o.condition || 'a confirmar na loja';
  const displayTitle = cleanTitle(o.title);
  const falseDeal = o.verdict === 'false' || Number(o.refurbished_price || 0) >= Number(o.best_new_price || 0);
  const delta = Number(o.refurbished_price || 0) - Number(o.best_new_price || 0);
  const dearer = delta > 0.005;
  const comparisonHead = dearer ? 'Mais caro que novo' : 'Sem poupança';
  const comparisonText = dearer ? `Novo ${eurDelta(delta)} mais barato` : 'Novo ao mesmo preço';
  const comparisonBox = falseDeal
    ? `<div class="price-box saving-box false-box"><small>Comparação</small><strong>${comparisonHead}</strong><span class="saving-value">${comparisonText}</span></div>`
    : `<div class="price-box saving-box"><small>Poupança</small><strong>${o.saving_percent || 0}%</strong><span class="saving-value">${eur(o.saving_eur)}</span></div>`;
  return `<article class="card${falseDeal ? ' card-false' : ''}" data-offer-card><div class="card-top"><div><h3 title="${escapeAttr(displayTitle)}">${escapeHtml(displayTitle)}</h3><div class="meta">SKU: ${escapeHtml(skuOf(o))}</div></div><div class="card-status">${warrantyBadge}<span class="state-badge">Estado: ${escapeHtml(state)}</span></div></div><div class="badges">${falseDeal ? '<span class="badge bad">🚩 FALSO NEGÓCIO</span>' : ''}<span class="badge warn">⚠️ ${escapeHtml(note)}</span></div><div class="price-row"><a class="price-box" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.listing_url || '#')}"><small>Recondicionado</small><strong>${eur(o.refurbished_price)}</strong></a><a class="price-box" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.url_new || '#')}"><small>Novo</small><strong>${eur(o.best_new_price)}</strong></a>${comparisonBox}</div><div class="meta">${escapeHtml(o.store || 'PcComponentes')}</div><div class="actions two-actions"><a class="button primary" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.listing_url || '#')}">Recondicionado</a><a class="button" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.url_new || '#')}">Novo</a></div></article>`;
}
async function offers(){
  if (!offersRequest) {
    offersRequest = fetch(`${base}/data/offers.json`, {cache:'no-cache'}).then(async response => {
      if (!response.ok) throw new Error('Offers unavailable');
      const data = await response.json();
      if (!Array.isArray(data.offers)) throw new Error('Invalid offers');
      return data.offers;
    }).catch(error => { offersRequest = undefined; throw error; });
  }
  return offersRequest;
}
async function runSearch(q){
  const content = document.querySelector('#page-content');
  const results = document.querySelector('#search-results');
  if(!results || !content) return;
  const version = ++searchVersion;
  q = q.trim().toLowerCase();
  if(!q){results.hidden = true; results.innerHTML = ''; content.hidden = false; return;}
  let allOffers;
  try { allOffers = await offers(); }
  catch {
    if (version !== searchVersion) return;
    content.hidden = false;
    results.hidden = false;
    results.textContent = 'Pesquisa indisponível. Podes consultar as ofertas abaixo.';
    return;
  }
  if (version !== searchVersion) return;
  const list = allOffers.filter(o => [o.title,o.category_label,o.store,o.seller,o.condition,o.brand,o.model,skuOf(o),o.sku,o.raw_sku,o.mpn,o.ean].join(' ').toLowerCase().includes(q));
  content.hidden = true; results.hidden = false;
  results.innerHTML = `<div class="section-title full"><h2>Resultados</h2><small>${list.length} ${list.length === 1 ? 'oferta' : 'ofertas'}</small></div>`;
  if (!list.length) {
    results.insertAdjacentHTML('beforeend', '<div class="empty">Sem resultados.</div>');
    return;
  }
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'button more-results';
  more.textContent = 'Mostrar mais resultados';
  results.append(more);
  let shown = 0;
  function showBatch(event) {
    const start = shown;
    shown = Math.min(start + 48, list.length);
    more.insertAdjacentHTML('beforebegin', list.slice(start, shown).map(offerCard).join(''));
    if (event) results.querySelectorAll('[data-offer-card]')[start]?.querySelector('a')?.focus();
    if (shown === list.length) more.remove();
  }
  more.addEventListener('click', showBatch);
  showBatch();
}
document.addEventListener('input', e => { if(e.target && e.target.id === 'search') runSearch(e.target.value); });

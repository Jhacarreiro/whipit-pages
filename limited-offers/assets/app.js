function track(name,data){try{if(window.loTrack)window.loTrack(name,data||{})}catch(e){}}
/* The page is only rebuilt by a successful run, so a stale warning decided at build time never showed once updates stopped. Decide it when the page is read. */
(function staleWarning(){
  const el=document.querySelector('.updated[data-generated-at]');
  if(!el||el.nextElementSibling?.classList.contains('stale'))return;
  const at=Date.parse(el.dataset.generatedAt);
  const after=Number(el.dataset.staleAfterDays),copy=el.dataset.staleWarn;
  if(!Number.isFinite(at)||!copy||!(after>=0))return;
  const day=86400000,elapsed=Date.now()-at;
  if(elapsed<after*day)return;
  const warn=document.createElement('div');
  warn.className='notice stale';
  warn.textContent=copy.replace('{n}',Math.floor(elapsed/day));
  el.after(warn);
})();
const body=document.body, country=body.dataset.country||'PT', locale=body.dataset.locale||'pt-PT', base=body.dataset.basePath||'https://offers.gallivanter.biz', lidlDomain=body.dataset.lidlDomain||'https://www.lidl.pt';
const UI = JSON.parse(document.getElementById('lidl-ui')?.textContent || '{}');
const q=document.getElementById('q'),brand=document.getElementById('brand'),cat=document.getElementById('cat'),sortEl=document.getElementById('sort'),count=document.getElementById('count'),grid=document.getElementById('grid');
const cards=[...document.querySelectorAll('[data-card]')], stateRank={now:0,lastcall:1,future:2,past:3,unknown:4};
function priceOf(card) {
  const price = card.dataset.price;
  return price?.trim() && Number.isFinite(Number(price)) ? Number(price) : Infinity;
}

function allowedByMode(status, mode) {
  if (mode === 'fresh') return status === 'now' || status === 'lastcall';
  if (mode === 'upcoming') return status === 'future';
  if (mode === 'lastcall' || mode === 'past') return status === mode;
  return true;
}

function sortCards(rows, mode) {
  rows.sort((a,b) => {
    const dateOrder = (a.dataset.date || '').localeCompare(b.dataset.date || '');
    let order;
    if (mode === 'price') order = priceOf(a) - priceOf(b);
    else if (mode === 'upcoming' || mode === 'lastcall') order = dateOrder;
    else if (mode === 'past') order = -dateOrder;
    else order = (stateRank[a.dataset.status] ?? 9) - (stateRank[b.dataset.status] ?? 9) || -dateOrder;
    return order || (a.dataset.title || '').localeCompare(b.dataset.title || '', locale);
  });
}

const retailerButtons = [...document.querySelectorAll('[data-retailer-toggle]')];
const activeRetailers = new Set(retailerButtons.map(b => b.dataset.retailerToggle));
retailerButtons.forEach(button => button.addEventListener('click', () => {
  const retailer = button.dataset.retailerToggle;
  if (activeRetailers.has(retailer)) activeRetailers.delete(retailer);
  else activeRetailers.add(retailer);
  button.classList.toggle('active', activeRetailers.has(retailer));
  button.setAttribute('aria-pressed', String(activeRetailers.has(retailer)));
  apply();
}));

function apply() {
  const term = fold(q.value.trim()), mode = sortEl.value || 'all';
  const visible = cards.filter(card => {
    const data = card.dataset;
    card.hidden = !activeRetailers.has(data.retailer || 'LIDL') || !allowedByMode(data.status, mode) ||
      (term && !fold(data.search).includes(term)) || (brand.value && data.brand !== brand.value) ||
      (cat.value && data.category !== cat.value);
    return !card.hidden;
  });
  sortCards(visible, mode);
  visible.forEach(card => grid.appendChild(card));
  count.textContent = visible.length;
}
/* Alert links carry ?q=, ?brand= or ?cat=. Nothing read them, so every digest link opened the unfiltered catalogue. */
(function hydrateFromQuery(){
  var params;
  try{params=new URLSearchParams(location.search)}catch(e){return}
  function setField(el,value){
    if(!el||!value)return false;
    if(el.tagName==='SELECT'){
      var match=Array.prototype.find.call(el.options,function(o){
        return o.value&&o.value.toLowerCase()===value.toLowerCase()});
      if(!match)return false;
      el.value=match.value;return true}
    el.value=value;return true}
  var brandParam=params.get('brand'),catParam=params.get('cat'),qParam=params.get('q');
  var matched=setField(brand,brandParam);
  matched=setField(cat,catParam)||matched;
  setField(sortEl,params.get('sort'));
  /* A subscription stores what the user typed, which need not be an exact
     option. Fall back to the search box so the link still narrows. */
  var fallback=qParam||(!matched?(brandParam||catParam):'');
  if(fallback)setField(q,fallback);
})();
[q,brand,cat,sortEl].forEach(el=>el&&el.addEventListener('input',apply));apply();
const modal=document.getElementById('shops-modal'), list=document.getElementById('shops-list'), statusBox=document.getElementById('shops-status'), sourceNote=document.getElementById('shops-source-note')||document.querySelector('.shops-source-note'), storeSearch=document.getElementById('store-search'), useLocation=document.getElementById('use-location'), productBox=document.getElementById('availability-product'), productLink=document.getElementById('availability-product-link');
let storesRequest, userPos, currentProduct, availabilityAbort, availabilityTimer;
const availabilityApi = 'https://webhook.gallivanter.biz/api/lidl/availability';

function bindDialog(dialog, closeSelector, onClose) {
  if (!dialog) return;
  dialog.querySelectorAll(closeSelector).forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    document.body.classList.remove('modal-open');
    if (onClose) onClose();
  });
}

function showDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}

function cancelSearch() {
  clearTimeout(availabilityTimer);
  availabilityAbort?.abort();
}

function openAvailability(card) {
  cancelSearch();
  currentProduct = card.dataset;
  userPos = null;
  storeSearch.value = '';
  list.replaceChildren();
  const aldi = currentProduct.retailer === 'ALDI';
  sourceNote.textContent = aldi ? UI.estimated_note : UI.note;
  productLink.href = currentProduct.productUrl || lidlDomain;
  productBox.innerHTML = `<a class="availability-product-card" href="${escapeAttr(productLink.href)}" target="_blank" rel="nofollow noopener"><div>
    <strong>${escapeHtml(currentProduct.productBrand)}</strong><h3>${escapeHtml(currentProduct.productTitle)}</h3>
    <p>${escapeHtml(currentProduct.productPrice)} · ${escapeHtml(currentProduct.productDateLabel)}</p>
    ${currentProduct.globalAvailabilityText ? `<p class="global-availability-text">${escapeHtml(currentProduct.globalAvailabilityText)}</p>` : ''}
  </div></a>`;
  statusBox.textContent = currentProduct.age === 'future' ? UI.future_intro :
    aldi || currentProduct.availabilityId ? UI.modal : UI.no_id;
  showDialog(modal);
}

document.querySelectorAll('[data-availability]').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('[data-card]');
  track('availability_open',{retailer:card.dataset.retailer});
  openAvailability(card);
}));
bindDialog(modal, '[data-close-shops]', cancelSearch);

function loadStores() {
  if (!storesRequest) {
    storesRequest = fetch(`${base}/data/stores.json`, {cache:'no-cache'}).then(async response => {
      if (!response.ok) throw new Error('stores unavailable');
      const data = await response.json();
      if (!Array.isArray(data.stores)) throw new Error('invalid store list');
      return data.stores;
    }).catch(error => {
      storesRequest = null;
      throw error;
    });
  }
  return storesRequest;
}

function fold(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replaceAll('ł', 'l');
}

function km(a,b,c,d) {
  const radians = x => x * Math.PI / 180;
  const arc = Math.sin(radians(c-a)/2)**2 + Math.cos(radians(a))*Math.cos(radians(c))*Math.sin(radians(d-b)/2)**2;
  return 12742*Math.asin(Math.sqrt(Math.min(1,arc)));
}
function hoursFor(store, timeZone) {
  const items = store.opening_hours?.items || [];
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone}).format(new Date());
  const exact = items.find(item => item.date === today);
  if (exact) return {item:exact, from:today, exact:true};
  const weekday = date => new Date(`${date}T00:00:00Z`).getUTCDay();
  const sameDay = weekday(today);
  const fallback = items.filter(item => item.date && weekday(item.date) === sameDay)
    .sort((a,b) => b.date.localeCompare(a.date))[0];
  return fallback ? {item:fallback, from:fallback.date, exact:false} : null;
}

function formatRanges(item) {
  const ranges = item.timeRanges || [];
  return ranges.length ? ranges.map(r => `${(r.from || '').slice(11,16)}–${(r.to || '').slice(11,16)}`).join(', ') : UI.closed;
}

function storeCard(store, result) {
  const aldi = store.retailer === 'ALDI';
  const retailer = aldi ? 'ALDI' : 'Lidl';
  const origin = aldi ? 'https://www.aldi.pt' : lidlDomain;
  let official = origin;
  try {
    const url = new URL(store.official_url);
    if (url.origin === origin && !url.username && !url.password) official = url.href;
  } catch {}
  const distance = Number.isFinite(store.distance) ? `<span>${store.distance.toFixed(store.distance < 10 ? 1 : 0)} km</span>` : '';
  const hours = hoursFor(store, body.dataset.timezone);
  const hoursText = hours ? formatRanges(hours.item) : UI.hours_unknown;
  const from = hours && !hours.exact ? ` (${UI.hours_from} ${hours.from})` : '';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.latitude},${store.longitude}`)}`;
  const mapsLink = hasCoordinates(store) ? `<a href="${mapsUrl}" target="_blank" rel="nofollow noopener">Maps</a>` : '';
  return `<article class="store-card availability ${escapeAttr(result.class)}">
    <div><h3>${escapeHtml(store.city || retailer)}</h3><p>${escapeHtml(store.street)}</p>
    <div class="store-meta">${distance}<span>${escapeHtml(hoursText + from)}</span></div></div>
    <div class="store-stock"><b>${escapeHtml(result.bars)}</b><span>${escapeHtml(result.label)}</span></div>
    <div class="store-actions">${mapsLink}<a href="${escapeAttr(official)}" target="_blank" rel="nofollow noopener">${retailer}</a></div>
  </article>`;
}

function hasCoordinates(store) {
  return [store.latitude, store.longitude].every(n => n != null && String(n).trim() && Number.isFinite(Number(n)));
}

function candidateStores(stores, term) {
  const retailer = currentProduct.retailer || 'LIDL';
  let rows = stores.filter(s => (s.retailer || 'LIDL') === retailer &&
    fold(`${s.city || ''} ${s.street || ''} ${s.zip || ''}`).includes(term));
  if (userPos) {
    rows = rows.filter(hasCoordinates).map(s => ({...s, distance: km(userPos.lat, userPos.lon, s.latitude, s.longitude)}));
  }
  rows.sort((a,b) => (userPos ? a.distance - b.distance : 0) ||
    (b.stock_score || 0) - (a.stock_score || 0) || (a.city || '').localeCompare(b.city || '', locale));
  return rows.slice(0,5);
}

async function fetchAvailability(stores, signal) {
  const response = await fetch(availabilityApi, {
    method:'POST', signal, cache:'no-cache', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({country, product_code:currentProduct.availabilityId, store_ids:stores.map(s => s.id)})
  });
  if (!response.ok) throw new Error('availability unavailable');
  const data = await response.json();
  return new Map(data.stores.map(row => [String(row.store_id), row]));
}

async function verifyStores(signal) {
  const term = fold(storeSearch.value.trim());
  if (!userPos && term.length < 2) {
    statusBox.textContent = UI.type_two;
    return;
  }
  let stores;
  try {
    stores = await loadStores();
  } catch {
    if (!signal.aborted && modal.open) statusBox.textContent = UI.stores_unavailable;
    return;
  }
  if (signal.aborted || !modal.open) return;
  const rows = candidateStores(stores, term);
  if (!rows.length) {
    statusBox.textContent = stores.length ? UI.no_stores : UI.stores_unavailable;
    return;
  }
  const render = getResult => { list.innerHTML = rows.map(s => storeCard(s, getResult(s))).join(''); };
  if (currentProduct.stockMode === 'estimated') {
    render(s => ({bars:s.stock_bars || '▰▰▱', label:s.stock_label || UI.estimate, class:'estimated'}));
    statusBox.textContent = UI.estimated_note;
    return;
  }
  const unknown = {bars:'▱▱▱', label:UI.no_info, class:'unknown'};
  if (!currentProduct.availabilityId) {
    render(() => unknown);
    statusBox.textContent = UI.no_id;
    return;
  }
  render(() => ({bars:'…', label:UI.checking, class:'loading'}));
  statusBox.textContent = UI.checking;
  try {
    const results = await fetchAvailability(rows, signal);
    if (signal.aborted || !modal.open) return;
    render(s => results.get(String(s.id)) || unknown);
    statusBox.textContent = rows.some(s => (results.get(String(s.id)) || unknown).class !== 'unknown') ? UI.done : UI.no_info;
  } catch {
    if (signal.aborted || !modal.open) return;
    render(() => unknown);
    statusBox.textContent = UI.api_failed;
  }
}

function startSearch() {
  cancelSearch();
  availabilityAbort = new AbortController();
  list.replaceChildren();
  return availabilityAbort.signal;
}

storeSearch?.addEventListener('input', () => {
  const signal = startSearch();
  availabilityTimer = setTimeout(() => verifyStores(signal), 350);
});
useLocation?.addEventListener('click', () => {
  const signal = startSearch();
  if (!window.isSecureContext || !navigator.geolocation) {
    statusBox.textContent = UI.geo_unavailable;
    return;
  }
  statusBox.textContent = UI.geo_asking;
  navigator.geolocation.getCurrentPosition(pos => {
    if (signal.aborted || !modal.open) return;
    userPos = {lat:pos.coords.latitude, lon:pos.coords.longitude};
    verifyStores(signal);
  }, error => {
    if (!signal.aborted && modal.open) statusBox.textContent = error.code === 1 ? UI.geo_denied : UI.geo_failed;
  }, {enableHighAccuracy:false, timeout:15000, maximumAge:300000});
});
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}function escapeAttr(s){return escapeHtml(s).replace(/'/g,'&#39;')}


/* Limited Offers alerts UI — zero LLM */
(function(){
  const $=id=>document.getElementById(id);
  const modal=$('alerts-modal'), status=$('alerts-status'), auth=$('alerts-auth'), app=$('alerts-app');
  if(!modal||!status) return;
  const tokenKey='limitedOffersAlertToken';
  const token=()=>localStorage.getItem(tokenKey)||'';
  const setStatus=t=>{status.textContent=t};
  async function call(payload,authz=true){
    const headers={'Content-Type':'application/json'};
    if(authz&&token()) headers.Authorization='Bearer '+token();
    const res=await fetch(availabilityApi,{method:'POST',cache:'no-cache',headers,body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({ok:false,error:'Resposta inválida'}));
    if(!res.ok||data.ok===false) throw Object.assign(new Error(data.error||('HTTP '+res.status)), {status:res.status});
    return data;
  }
  function currentAlert(){
    return {match_type:$('alerts-type')?.value||'keyword', match_value:($('alerts-value')?.value||'').trim(), label:($('alerts-label')?.value||'').trim()};
  }
  function validAlert(){
    const a=currentAlert();
    if(!a.match_value){setStatus('Escolhe primeiro o alerta: keyword, marca, categoria ou produto.');return null}
    return a;
  }
  function open(){showDialog(modal);refresh().catch(e => setStatus(e.message))}
  bindDialog(modal, '[data-close-alerts]');
  $('alerts-open')?.addEventListener('click',()=>{ if($('alerts-type')) $('alerts-type').value='keyword'; if($('alerts-value')) $('alerts-value').value=''; if($('alerts-label')) $('alerts-label').value=''; open(); });
  async function refresh(){
    const session = token();
    auth.hidden = !!session;
    app.hidden = !session;
    $('alerts-list').replaceChildren();
    if (!session) {
      setStatus('Confirma o contacto por WhatsApp ou email para consultar e gerir os teus alertas.');
      return false;
    }
    try {
      const data = await call({alerts_action:'list'});
      if (session !== token()) return false;
      renderList(data.alerts || []);
      setStatus('Sessão activa. Podes guardar e desligar alertas.');
      return true;
    } catch (error) {
      if (session !== token()) return false;
      if (error.status === 401) {
        localStorage.removeItem(tokenKey);
        auth.hidden = false;
        app.hidden = true;
        setStatus('Sessão expirada. Confirma o contacto outra vez.');
      } else {
        setStatus('Não foi possível carregar os alertas. Volta a abrir para tentar novamente.');
      }
      return false;
    }
  }
  function bindAction(button, action) {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try { await action(); }
      catch (error) { setStatus(error.message); }
      finally { button.disabled = false; }
    });
  }

  function renderList(alerts) {
    const box = $('alerts-list');
    const active = alerts.filter(a => a.enabled !== 0);
    if (!active.length) {
      box.innerHTML = '<p class="modal-note">Ainda não tens alertas activos.</p>';
      return;
    }
    box.innerHTML = active.map(a => `<article class="alert-item"><div>
      <b>${escapeHtml(a.label || a.match_value)}</b><span>${escapeHtml(a.channel)}</span>
      </div><button class="button secondary" type="button" data-alert-delete="${escapeAttr(a.id)}">Desligar</button></article>`).join('');
    box.querySelectorAll('[data-alert-delete]').forEach(button => bindAction(button, async () => {
      await call({alerts_action:'delete', alert_id:button.dataset.alertDelete});
      if (await refresh()) setStatus('Alerta desligado.');
    }));
  }

  function contact() {
    return {channel:$('alerts-channel').value, destination:$('alerts-destination').value.trim()};
  }

  bindAction($('alerts-start'), async () => {
    const recipient = contact();
    if (!recipient.destination) {
      setStatus('Indica o WhatsApp ou email para receber o código.');
      return;
    }
    await call({alerts_action:'auth_start', ...recipient}, false);
    $('alerts-code-row').hidden = false;
    $('alerts-code').focus();
    setStatus('Código enviado. Introduz o código para confirmar.');
  });

  bindAction($('alerts-verify'), async () => {
    const code = $('alerts-code').value.trim();
    const data = await call({alerts_action:'auth_verify', ...contact(), code}, false);
    localStorage.setItem(tokenKey, data.token);
    $('alerts-code').value = '';
    $('alerts-code-row').hidden = true;
    if (await refresh()) setStatus('Contacto confirmado. Podes gerir os teus alertas.');
  });

  bindAction($('alerts-create'), async () => {
    const alert = validAlert();
    if (!alert) return;
    await call({alerts_action:'create', ...alert});
    $('alerts-value').value = '';
    $('alerts-label').value = '';
    track('alert_created',{match_type:alert.match_type});
    if (await refresh()) setStatus('Alerta guardado.');
  });

  bindAction($('alerts-logout'), async () => {
    await call({alerts_action:'logout'});
    localStorage.removeItem(tokenKey);
    $('alerts-destination').value = '';
    $('alerts-code').value = '';
    $('alerts-code-row').hidden = true;
    await refresh();
    setStatus('Sessão terminada.');
  });
  function openManagementLink() {
    if (location.hash === '#alerts' && !modal.open) open();
  }
  window.addEventListener('hashchange', openManagementLink);
  openManagementLink();
  document.querySelectorAll('[data-alert-product]').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('[data-card]'); if(!card) return;
    open();
    const value=card.dataset.productKey||card.dataset.availabilityId||card.dataset.productTitle||'';
    $('alerts-type').value='product'; $('alerts-value').value=value; $('alerts-label').value=card.dataset.productTitle||'';
    setStatus('Alerta preparado para este produto. Confirma contacto e guarda.')
  }));
})();

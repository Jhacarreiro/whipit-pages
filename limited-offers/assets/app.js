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
const byId = id => document.getElementById(id);
const grid = byId('grid'), q = byId('q'), brand = byId('brand'), order = byId('order');
const cards = [...document.querySelectorAll('[data-card]')];
const retailers = [...document.querySelectorAll('[data-retailer-toggle]')];
const categories = [...document.querySelectorAll('[data-category-choice]')];
const periods = [...document.querySelectorAll('[data-period]')];
const shops = new Set(retailers.map(button => button.dataset.retailerToggle));
const storeKey = 'limitedOffersShops' + country, savedKey = 'limitedOffersSaved' + country;
let saved = new Set(), savedOnly = false, category = '', period = 'all', limit = 12, featured, selectedOffer;
function readSet(storage, key) {
  const values = JSON.parse(storage.getItem(key) || '[]');
  return new Set(Array.isArray(values) ? values : []);
}
function persist(storage, key, values) {
  try { window[storage].setItem(key, JSON.stringify([...values])); } catch {}
}
function offerKey(card) { return card.querySelector('.card-title').getAttribute('href'); }
function allowedByMode(status, mode) {
  if (mode === 'fresh') return status === 'now' || status === 'lastcall';
  if (mode === 'upcoming') return status === 'future';
  return mode === 'all' || status === mode;
}
function priceOf(card) {
  return card.dataset.price?.trim() && Number.isFinite(Number(card.dataset.price)) ? Number(card.dataset.price) : Infinity;
}
function setPressed(button, on) { button.setAttribute('aria-pressed', String(on)); }
function present(prefix, card) {
  const photo = byId(prefix+'-image'), source = card.querySelector('.offer-photo img');
  photo.src = source.src;
  photo.alt = source.alt;
  byId(prefix+'-meta').replaceChildren(...[...card.querySelector('.offer-meta').childNodes].map(node => node.cloneNode(true)));
  byId(prefix+'-title').textContent = card.dataset.productTitle;
  byId(prefix+'-price').textContent = card.dataset.productPrice;
}
function renderCatalogue() {
  if (!grid) return;
  const term = fold(q.value.trim());
  retailers.forEach(button => {
    const on = shops.has(button.dataset.retailerToggle);
    setPressed(button,on);
    button.setAttribute('aria-disabled', String(on && shops.size === 1));
  });
  categories.forEach(b => setPressed(b, b.dataset.categoryChoice === category));
  periods.forEach(b => setPressed(b, b.dataset.period === period));
  setPressed(byId('saved'), savedOnly);
  const rows = cards.filter(card => {
    card.hidden = true;
    const data = card.dataset;
    return shops.has(data.retailer) && allowedByMode(data.status,period) &&
      (!term || fold(data.search).includes(term)) && (!brand.value || data.brand === brand.value) &&
      (!category || data.category === category) && (!savedOnly || saved.has(offerKey(card)));
  });
  const rank = {now:0,lastcall:1,future:2,past:3,unknown:4};
  rows.sort((a,b) => {
    const ad = a.dataset, bd = b.dataset;
    const dateOrder = (ad.date || '').localeCompare(bd.date || '');
    return (order.value === 'price' && (priceOf(a)-priceOf(b))) ||
       ((rank[ad.status] ?? 9) - (rank[bd.status] ?? 9)) ||
       (ad.status === 'future' ? dateOrder : -dateOrder) || ad.title.localeCompare(bd.title,locale);
  });
  rows.slice(0,limit).forEach(card => {card.hidden=false; grid.appendChild(card);});
  byId('count').textContent = rows.length;
  byId('empty').hidden = rows.length > 0;
  byId('show-more').hidden = rows.length <= limit;
  const candidates = rows.filter(card => ['now','lastcall','future'].includes(card.dataset.status));
  featured = !category && !term && !brand.value && !savedOnly && period==='all' && order.value==='all' &&
    (candidates.find(card => card.dataset.brand==='PARKSIDE') || candidates[0]);
  byId('feature').hidden = !featured;
  if (featured) {
    present('feature',featured);
    byId('feature-category').textContent = UI.explore+' · '+featured.dataset.category;
  }
}
function refreshCatalogue() { limit=12;renderCatalogue(); }
function resetFilters() {
  q.value='';brand.value='';order.value='all';category='';period='all';savedOnly=false;
  retailers.forEach(button => shops.add(button.dataset.retailerToggle));
  persist('sessionStorage',storeKey,shops);
  refreshCatalogue();
}
function setBookmark(card, button) {
  const on = saved.has(offerKey(card));
  setPressed(button,on);
  button.setAttribute('aria-label',(on ? UI.unsave : UI.save)+' · '+card.dataset.productTitle);
}
function restoreCatalogue() {
  try {
    saved=readSet(localStorage,savedKey);
    const restored=readSet(sessionStorage,storeKey);
    if ([...shops].some(shop => restored.has(shop))) for (const shop of shops) if (!restored.has(shop)) shops.delete(shop);
  } catch {}
  const params=new URLSearchParams(location.search);
  const requestedBrand=params.get('brand'), requestedCategory=params.get('cat');
  const matchingBrand=[...brand.options].find(o => requestedBrand && fold(o.value)===fold(requestedBrand));
  const matchingCategory=categories.find(b => requestedCategory && fold(b.dataset.categoryChoice)===fold(requestedCategory));
  if (matchingBrand) brand.value=matchingBrand.value;
  if (matchingCategory) category=matchingCategory.dataset.categoryChoice;
  q.value=params.get('q') || (!matchingBrand && requestedBrand) || (!matchingCategory && requestedCategory) || '';
  const sort=params.get('sort');
  if (sort==='price') order.value='price';
  else if (periods.some(b => b.dataset.period===sort)) period=sort;
  if (q.value || requestedBrand || requestedCategory) retailers.forEach(b => shops.add(b.dataset.retailerToggle));
  cards.forEach(card => {
    const button=card.querySelector('[data-save]');
    setBookmark(card,button);
    button.addEventListener('click', () => {
      const key=offerKey(card);
      if (saved.has(key)) saved.delete(key); else saved.add(key);
      persist('localStorage',savedKey,saved);
      setBookmark(card,button);
      if (savedOnly) renderCatalogue();
    });
    card.querySelectorAll('[data-open-offer]').forEach(link => link.addEventListener('click',event => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openOffer(card);
    }));
  });
  retailers.forEach(button => button.addEventListener('click', () => {
    const shop=button.dataset.retailerToggle;
    if (shops.has(shop)) {if (shops.size===1) return; shops.delete(shop);} else shops.add(shop);
    persist('sessionStorage',storeKey,shops);refreshCatalogue();
  }));
  categories.forEach(b => b.addEventListener('click', () => {category=b.dataset.categoryChoice;refreshCatalogue();}));
  periods.forEach(b => b.addEventListener('click', () => {period=b.dataset.period;refreshCatalogue();}));
  byId('saved').addEventListener('click', () => {savedOnly=!savedOnly;refreshCatalogue();});
  byId('reset-filters').addEventListener('click',resetFilters);
  byId('show-more').addEventListener('click', () => {limit+=12;renderCatalogue();});
  byId('feature-category').addEventListener('click', () => {category=featured.dataset.category;refreshCatalogue();byId('catalogue').scrollIntoView();});
  [q,brand,order].forEach(control => control.addEventListener('input',refreshCatalogue));
  renderCatalogue();
}
if (grid && grid.querySelector) restoreCatalogue();
const offerDialog=byId('offer-detail');
let historyRequest;
async function openOffer(card) {
  selectedOffer=card;
  present('offer',card);
  byId('offer-date').textContent=card.querySelector('.tile-date').textContent;
  byId('offer-stock-note').textContent=card.dataset.stockMode==='estimated' ? UI.estimated_note : UI.alert_stock_note;
  byId('offer-store').href=card.dataset.productUrl;
  const detail=card.querySelector('.card-title').href;
  byId('offer-permalink').href=detail;
  const history=byId('offer-history'), list=history.querySelector('ul');
  history.hidden=true;
  list.replaceChildren();
  historyRequest?.abort();
  const request=new AbortController();
  historyRequest=request;
  showDialog(offerDialog);
  try {
    const response=await fetch(detail,{signal:request.signal});
    if (!response.ok) return;
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    if (request.signal.aborted || !offerDialog.open) return;
    for (const row of doc.querySelectorAll('.price-history li')) {
      const li=document.createElement('li');
      li.textContent=[...row.children].map(item => item.textContent).join(' · ');
      list.appendChild(li);
    }
    history.hidden=!list.children.length;
  } catch {}
}
bindDialog(offerDialog,'[data-close-offer]',() => historyRequest?.abort());
byId('offer-availability')?.addEventListener('click', () => {offerDialog.close();openAvailability(selectedOffer);});
const modal=document.getElementById('shops-modal'), list=document.getElementById('shops-list'), statusBox=document.getElementById('shops-status'), sourceNote=document.getElementById('shops-source-note')||document.querySelector('.shops-source-note'), storeSearch=document.getElementById('store-search'), useLocation=document.getElementById('use-location'), productBox=document.getElementById('availability-product'), productLink=document.getElementById('availability-product-link');
let storesRequest, userPos, currentProduct, availabilityAbort, availabilityTimer;
const availabilityApi = 'https://webhook.gallivanter.biz/api/lidl/availability';

function bindDialog(dialog, closeSelector, onClose) {
  if (!dialog) return;
  dialog.querySelectorAll(closeSelector).forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
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
  track('availability_open',{retailer:card.dataset.retailer});
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
  const saveButton = $('alerts-create');
  const alertList = $('alerts-list');
  const alertEmpty = $('alerts-empty');
  async function call(payload,authz=true){
    const headers={'Content-Type':'application/json'};
    if(authz&&token()) headers.Authorization='Bearer '+token();
    const res=await fetch(availabilityApi,{method:'POST',cache:'no-cache',headers,body:JSON.stringify({...payload,country})});
    const data=await res.json().catch(()=>({ok:false,error:UI.alert_error}));
    if (!res.ok || data.ok === false) {
      const problems = {
        'invalid email': ['Verifica o endereço de email.', 'Sprawdź adres e-mail.'],
        'invalid phone': ['Indica o número com o indicativo do país.', 'Podaj numer z kodem kraju.'],
        'invalid code': ['O código está incorreto ou expirou.', 'Kod jest nieprawidłowy lub wygasł.'],
        'too many alerts, switch one off first': ['Atingiste o limite de alertas. Desliga um para continuar.', 'Osiągnięto limit alertów. Wyłącz jeden, aby kontynuować.']
      };
      const retry = ['Demasiados pedidos. Tenta mais tarde.', 'Za dużo prób. Spróbuj później.'];
      const message = (problems[data.error] || (res.status === 429 && retry))?.[country==='PL' ? 1 : 0];
      throw Object.assign(new Error(message || UI.alert_error), {status:res.status});
    }
    return data;
  }
  const matchType = $('alerts-type');
  const matchFields = {
    keyword: $('alerts-value'),
    brand: $('alerts-brand'),
    category: $('alerts-category'),
    product: $('alerts-product')
  };
  const matchLabels = {keyword: UI.keyword, brand: UI.brand_option, category: UI.category_option, product: UI.alert_product_reference};
  function syncMatchField() {
    const selected = matchType.value;
    for (const [type, field] of Object.entries(matchFields)) {
      field.hidden = field.disabled = type !== selected;
    }
    const label = $('alerts-match-label');
    label.htmlFor = matchFields[selected].id;
    label.textContent = matchLabels[selected];
  }
  function prepareAlert(type, value, label = '') {
    matchType.value = type;
    for (const field of Object.values(matchFields)) field.value = '';
    matchFields[type].value = value;
    $('alerts-label').value = label;
    syncMatchField();
  }
  matchType.addEventListener('change', syncMatchField);
  function currentAlert() {
    return {
      match_type: matchType.value,
      match_value: matchFields[matchType.value].value.trim(),
      label: $('alerts-label').value.trim()
    };
  }
  function validAlert(){
    const a=currentAlert();
    if(!a.match_value){setStatus(UI.match_required);return null}
    return a;
  }
  function open(){showDialog(modal);refresh().catch(e => setStatus(e.message))}
  bindDialog(modal, '[data-close-alerts]');
  $('alerts-open')?.addEventListener('click', () => {
    const term=q?.value.trim();
    const type = term ? 'keyword' : brand?.value ? 'brand' : category ? 'category' : 'keyword';
    prepareAlert(type, term || brand?.value || category || '');
    open();
  });
  async function refresh(){
    const session = token();
    auth.hidden = Boolean(session);
    app.hidden = saveButton.hidden = !session;
    alertList.replaceChildren();
    alertEmpty.hidden = true;
    if (!session) {
      setStatus(UI.confirm_contact);
      return false;
    }
    setStatus('');
    try {
      const data = await call({alerts_action:'list'});
      if (session !== token()) return false;
      renderList(data.alerts || []);
      return true;
    } catch (error) {
      if (session !== token()) return false;
      if (error.status === 401) {
        localStorage.removeItem(tokenKey);
        auth.hidden = false;
        app.hidden = saveButton.hidden = true;
        setStatus(UI.expired_session);
      } else {
        setStatus(UI.load_failed);
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
    const active = alerts.filter(a => a.enabled !== 0 && (a.country || 'PT') === country);
    const channels = {email: 'Email', whatsapp: 'WhatsApp'};
    alertEmpty.hidden = Boolean(active.length);
    alertList.innerHTML = active.map(alert => {
      const id = escapeAttr(alert.id);
      return `<li class="alert-item">
        <div><strong id="alert-entry-${id}">${escapeHtml(alert.label || alert.match_value)}</strong><span>${escapeHtml(channels[alert.channel] || alert.channel)}</span></div>
        <button class="alerts-text-action" type="button" data-alert-delete="${id}" aria-describedby="alert-entry-${id}">${escapeHtml(UI.disable)}</button>
      </li>`;
    }).join('');
    alertList.querySelectorAll('[data-alert-delete]').forEach((button, index) => bindAction(button, async () => {
      await call({alerts_action:'delete', alert_id:button.dataset.alertDelete});
      if (await refresh()) {
        const remaining = alertList.querySelectorAll('[data-alert-delete]');
        const next = remaining[Math.min(index, remaining.length - 1)] || $('alerts-active-title');
        next.focus();
        setStatus(UI.disabled);
      }
    }));
  }

  const channel = $('alerts-channel');
  const destination = $('alerts-destination');
  function resetCode() {
    $('alerts-code').value = '';
    $('alerts-code-row').hidden = true;
    setStatus(UI.confirm_contact);
  }

  channel.addEventListener('change', () => {
    const email = channel.value === 'email';
    destination.type = email ? 'email' : 'tel';
    destination.autocomplete = email ? 'email' : 'tel';
    destination.placeholder = email ? UI.email_example : UI.phone_example;
    $('alerts-destination-label').textContent = email ? UI.email_label : UI.phone_label;
    resetCode();
  });
  destination.addEventListener('input', () => {
    if (!$('alerts-code-row').hidden) resetCode();
  });

  function contact() {
    return {channel:channel.value, destination:destination.value.trim()};
  }

  bindAction($('alerts-start'), async () => {
    const recipient = contact();
    if (!recipient.destination) {
      setStatus(UI.need_contact);
      return;
    }
    await call({alerts_action:'auth_start', ...recipient}, false);
    const current = contact();
    if (recipient.channel !== current.channel || recipient.destination !== current.destination) return;
    $('alerts-code-row').hidden = false;
    $('alerts-code').focus();
    setStatus(UI.code_sent);
  });

  bindAction($('alerts-verify'), async () => {
    const code = $('alerts-code').value.trim();
    const data = await call({alerts_action:'auth_verify', ...contact(), code}, false);
    localStorage.setItem(tokenKey, data.token);
    $('alerts-code').value = '';
    $('alerts-code-row').hidden = true;
    if (await refresh()) setStatus(UI.confirmed);
  });

  bindAction(saveButton, async () => {
    const alert = validAlert();
    if (!alert) return;
    await call({alerts_action:'create', ...alert});
    matchFields[alert.match_type].value = '';
    $('alerts-label').value = '';
    track('alert_created',{match_type:alert.match_type});
    if (await refresh()) setStatus(UI.alert_created);
  });

  bindAction($('alerts-logout'), async () => {
    await call({alerts_action:'logout'});
    localStorage.removeItem(tokenKey);
    destination.value = '';
    $('alerts-code').value = '';
    $('alerts-code-row').hidden = true;
    await refresh();
    setStatus(UI.logged_out);
    channel.focus();
  });
  function openManagementLink() {
    if (location.hash === '#alerts' && !modal.open) open();
  }
  window.addEventListener('hashchange', openManagementLink);
  openManagementLink();
  document.querySelectorAll('[data-alert-product]').forEach(btn=>btn.addEventListener('click',()=>{
    const card=selectedOffer; if(!card) return;
    offerDialog.close();
    open();
    const value=card.dataset.productKey||card.dataset.availabilityId||card.dataset.productTitle||'';
    prepareAlert('product', value, card.dataset.productTitle || '');
    setStatus(UI.product_ready)
  }));
})();

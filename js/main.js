/* ==========================================
   THE DESIGN VAULT — COMMON JS LIBRARY
   ========================================== */

const thumb = id => `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
const prev  = id => `https://drive.google.com/file/d/${id}/preview`;

let activeCat = 'All';
let q = '';

function buildStrip(catalogData, catOrder) {
  const counts = {};
  catalogData.forEach(d => { counts[d.c] = (counts[d.c] || 0) + 1; });
  const known = catOrder.filter(c => counts[c]);
  const extra = Object.keys(counts).filter(c => !catOrder.includes(c)).sort();
  const cats = ['All', ...known, ...extra];
  const strip = document.getElementById('strip');
  if (!strip) return;

  strip.innerHTML = '';
  cats.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'pill' + (cat === 'All' ? ' on' : '');
    const n = cat === 'All' ? catalogData.length : (counts[cat] || 0);
    b.innerHTML = `${esc(cat)} <span>${n}</span>`;
    b.onclick = () => {
      activeCat = cat;
      strip.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
      b.classList.add('on');
      filter(catalogData);
    };
    strip.appendChild(b);
  });
}

function buildGrid(catalogData) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  grid.innerHTML = '';
  catalogData.forEach(d => {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.cat = d.c;
    div.dataset.title = d.t.toLowerCase();
    div.onclick = () => openModal(d);

    div.innerHTML = `<div class="thumb">
      <div class="ph">
        <svg width="38" height="46" viewBox="0 0 38 46" fill="none" stroke="#fff" stroke-width="1.3">
          <rect x="1.5" y="1.5" width="35" height="43" rx="3"/>
          <line x1="9" y1="13" x2="29" y2="13"/>
          <line x1="9" y1="19" x2="29" y2="19"/>
          <line x1="9" y1="25" x2="21" y2="25"/>
        </svg>
        <span>No thumbnail</span>
      </div>
      <img src="${thumb(d.p)}" alt="${esc(d.t)}" loading="lazy">
      <div class="grad"></div><div class="ob">View PDF</div>
    </div>
    <div class="meta">
      <div class="ct">${esc(d.c)}</div>
      <div class="ttl">${esc(d.t)}</div>
    </div>`;

    div.querySelector('img').addEventListener('error', function() {
      this.style.display = 'none';
    });

    grid.appendChild(div);
  });

  const e = document.createElement('div');
  e.className = 'empty';
  e.id = 'empty';
  e.innerHTML = '<p>No items found</p><small>Try a different category or search terms</small>';
  grid.appendChild(e);
}

function filter(catalogData) {
  const cards = document.querySelectorAll('.card');
  let n = 0;
  cards.forEach(c => {
    const ok = (activeCat === 'All' || c.dataset.cat === activeCat) &&
               (!q || c.dataset.title.includes(q) || c.dataset.cat.toLowerCase().includes(q));
    c.classList.toggle('hide', !ok);
    if (ok) n++;
  });

  const countElem = document.getElementById('count');
  if (countElem) {
    countElem.textContent = n + ' item' + (n !== 1 ? 's' : '');
  }

  const e = document.getElementById('empty');
  if (e) e.classList.toggle('show', n === 0);
}

function initSearch(catalogData) {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      q = e.target.value.toLowerCase().trim();
      filter(catalogData);
    });
  }
}

function openModal(d) {
  document.getElementById('mt').textContent = d.t;
  document.getElementById('mc').textContent = d.c;
  document.getElementById('ml').classList.remove('gone');

  const fr = document.getElementById('mfr');
  const old = fr.querySelector('iframe');
  if (old) old.remove();

  const iframe = document.createElement('iframe');
  iframe.src = prev(d.p);
  iframe.allow = 'autoplay';
  iframe.setAttribute('allowfullscreen', '');
  iframe.onload = () => document.getElementById('ml').classList.add('gone');

  fr.appendChild(iframe);
  document.getElementById('mbg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const mbg = document.getElementById('mbg');
  if (mbg) mbg.classList.remove('open');
  document.body.style.overflow = '';
  const fr = document.getElementById('mfr');
  if (fr) {
    const iframe = fr.querySelector('iframe');
    if (iframe) iframe.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mbg = document.getElementById('mbg');
  if (mbg) {
    mbg.addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

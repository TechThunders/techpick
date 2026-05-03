/* ═══════════════════════════════════════
   TECHPICK — app.js
   Google Sheets backend integration
   ═══════════════════════════════════════

   SETUP (read README.md for full guide):
   1. Create a Google Sheet with these columns in Row 1:
      Date | Type | Title | Description | Price | Link | Image | Tags

   2. Deploy a Google Apps Script as a Web App (see README.md)
      and paste the URL below.

   3. Change ADMIN_PASSWORD in admin.html.
═══════════════════════════════════════ */

// ── YOUR GOOGLE APPS SCRIPT WEB APP URL ──
// Replace this after deploying your Apps Script
const SHEET_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// ── FETCH ALL POSTS ──
async function fetchPosts() {
  try {
    // If no sheet configured, return demo data
    if (SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return getDemoPosts();
    }
    const res = await fetch(`${SHEET_URL}?action=get`);
    const data = await res.json();
    return data.posts || [];
  } catch (e) {
    console.warn('Sheet fetch failed, using demo data:', e);
    return getDemoPosts();
  }
}

// ── APPEND A NEW ROW ──
async function appendToSheet(rowData) {
  try {
    if (SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      console.warn('Sheet URL not configured.');
      return false;
    }
    const params = new URLSearchParams({
      action: 'append',
      date:   rowData[0],
      type:   rowData[1],
      title:  rowData[2],
      desc:   rowData[3],
      price:  rowData[4],
      link:   rowData[5],
      img:    rowData[6],
      tags:   rowData[7]
    });
    const res = await fetch(`${SHEET_URL}?${params}`);
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Append failed:', e);
    return false;
  }
}

// ── DELETE A ROW ──
async function deleteSheetRow(rowIndex) {
  try {
    if (SHEET_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') return false;
    const res = await fetch(`${SHEET_URL}?action=delete&index=${rowIndex}`);
    const data = await res.json();
    return data.success === true;
  } catch (e) {
    console.error('Delete failed:', e);
    return false;
  }
}

// ── BUILD A CARD ──
function buildCard(post, isPreview = false) {
  const imgHtml = post.img
    ? `<img class="card-img" src="${post.img}" alt="${post.title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'card-img-placeholder\\'>${post.type === 'deal' ? '🔥' : '⚖️'}</div>'" />`
    : `<div class="card-img-placeholder">${post.type === 'deal' ? '🔥' : '⚖️'}</div>`;

  const tagsHtml = post.tags
    ? post.tags.split(',').map(t => t.trim()).filter(Boolean)
        .map(t => `<span class="card-tag">${t}</span>`).join('')
    : '';

  return `
    <div class="post-card" data-type="${post.type}" style="animation-delay:${isPreview ? '0' : Math.random() * 0.3}s">
      ${imgHtml}
      <div class="card-body">
        <div class="card-meta">
          <span class="card-type ${post.type}">${post.type === 'deal' ? '🔥 Deal' : '⚖️ Compare'}</span>
          <span class="card-date">${post.date}</span>
          ${tagsHtml}
        </div>
        <div class="card-title">${post.title}</div>
        <div class="card-desc">${post.desc}</div>
        ${post.price ? `<div class="card-price">${post.price}</div>` : ''}
      </div>
      <div class="card-footer">
        <a href="${post.link}" target="_blank" rel="noopener sponsored" class="card-btn">
          View on Amazon →
        </a>
        <span class="card-ad-label">#ad</span>
      </div>
    </div>
  `;
}

// ── LOAD POSTS ON MAIN PAGE ──
async function loadPosts() {
  const container = document.getElementById('posts-container');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  const posts = await fetchPosts();

  if (!posts || posts.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.innerHTML = posts.slice().reverse()
    .map(p => buildCard(p)).join('');
}

// ── DEMO POSTS (shown before Google Sheet is configured) ──
function getDemoPosts() {
  return [
    {
      date: new Date().toLocaleDateString('en-IN'),
      type: 'deal',
      title: 'Redmi Buds 5 Pro',
      desc: 'Solid ANC performance at this price point. Call quality is better than expected. Not for audiophiles but great for daily commute use.',
      price: '₹2,999 (was ₹3,999)',
      link: '#',
      img: '',
      tags: 'budget, audio'
    },
    {
      date: new Date().toLocaleDateString('en-IN'),
      type: 'comparison',
      title: 'Redmi Note 14 Pro vs POCO X7',
      desc: 'Both are solid mid-rangers. Note 14 Pro wins on camera and display. POCO X7 wins on performance and charging speed. Pick based on your priority.',
      price: 'From ₹22,999',
      link: '#',
      img: '',
      tags: 'phone, budget'
    },
    {
      date: new Date().toLocaleDateString('en-IN'),
      type: 'deal',
      title: 'boAt Rockerz 450 Pro',
      desc: 'Bassy sound signature, 70hr battery life. Build quality is average but hard to beat at ₹1,299. Perfect gym headphone.',
      price: '₹1,299 (was ₹2,990)',
      link: '#',
      img: '',
      tags: 'budget, audio'
    }
  ];
}

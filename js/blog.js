/* ==============================
   NUTRIVIDA — blog.js
   Blog dinámico desde posts.json
   ============================== */

const POSTS_URL = './data/posts.json';

// ── Shared: load posts ────────────────────────────
async function loadPosts() {
  const res = await fetch(POSTS_URL);
  return res.json();
}

// ── Format date to Spanish ────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Build blog card HTML ──────────────────────────
function buildCard(post) {
  return `
    <article class="blog-card reveal" onclick="location.href='post.html?slug=${post.slug}'">
      <div class="blog-card-img">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
      </div>
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="blog-cat">${post.category}</span>
          <span class="blog-date">${formatDate(post.date)}</span>
          <span class="blog-read">📖 ${post.readTime}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <div class="blog-card-footer">
          <span class="read-more">Leer artículo →</span>
          <div class="blog-tags">
            ${post.tags.slice(0,2).map(t => `<span class="blog-tag">#${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </article>
  `;
}

// ── Skeleton loader ───────────────────────────────
function renderSkeletons(container, count = 3) {
  container.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line short"></div>
        <div class="skel-line"></div>
        <div class="skel-line mid"></div>
        <div class="skel-line short"></div>
      </div>
    </div>
  `).join('');
}

// ── HOME PAGE: latest 3 posts ─────────────────────
async function initHomeBlog() {
  const grid = document.getElementById('home-blog-grid');
  if (!grid) return;
  renderSkeletons(grid, 3);
  try {
    const posts = await loadPosts();
    grid.innerHTML = posts.slice(0, 3).map(buildCard).join('');
    // trigger reveal
    grid.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  } catch {
    grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1">No se pudieron cargar los artículos.</p>';
  }
}

// ── BLOG PAGE: all posts with filter + search ─────
async function initBlogPage() {
  const grid = document.getElementById('blog-page-grid');
  const filtersWrap = document.getElementById('blog-filters');
  const searchInput = document.getElementById('blog-search');
  if (!grid) return;

  renderSkeletons(grid, 6);
  let allPosts = [];
  let activeFilter = 'Todos';

  try {
    allPosts = await loadPosts();
  } catch {
    grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1">No se pudieron cargar los artículos.</p>';
    return;
  }

  // Build filters
  const categories = ['Todos', ...new Set(allPosts.map(p => p.category))];
  if (filtersWrap) {
    filtersWrap.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'Todos' ? 'active' : ''}" data-cat="${cat}">${cat}</button>
    `).join('');
    filtersWrap.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filtersWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat;
        render();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', render);
  }

  function render() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = allPosts.filter(p => {
      const matchCat = activeFilter === 'Todos' || p.category === activeFilter;
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1;padding:40px 0">No se encontraron artículos.</p>';
      return;
    }
    grid.innerHTML = filtered.map(buildCard).join('');
    grid.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 100);
    });
  }

  render();
}

// ── POST PAGE: single post ────────────────────────
async function initPostPage() {
  const slug = new URLSearchParams(location.search).get('slug');
  const heroEl = document.getElementById('post-hero');
  const bodyEl = document.getElementById('post-body');
  const relatedEl = document.getElementById('related-posts');
  if (!bodyEl) return;

  try {
    const posts = await loadPosts();
    const post = posts.find(p => p.slug === slug);
    if (!post) {
      bodyEl.innerHTML = '<p>Artículo no encontrado. <a href="blog.html" style="color:var(--green-main);font-weight:700">Volver al blog</a></p>';
      return;
    }

    // Update page title
    document.title = `${post.title} — NutriVida`;

    // Hero
    if (heroEl) {
      document.getElementById('post-cat').textContent = post.category;
      document.getElementById('post-title').textContent = post.title;
      document.getElementById('post-date').textContent = formatDate(post.date);
      document.getElementById('post-read').textContent = `📖 ${post.readTime} de lectura`;
      document.getElementById('post-img').src = post.image;
      document.getElementById('post-img').alt = post.title;
    }

    // Body
    bodyEl.innerHTML = post.content;

    // Related posts (same category, exclude current)
    if (relatedEl) {
      const related = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3);
      if (!related.length) { relatedEl.closest('section').style.display = 'none'; }
      else { relatedEl.innerHTML = related.map(buildCard).join(''); }
    }

  } catch (err) {
    bodyEl.innerHTML = '<p>Error cargando el artículo.</p>';
  }
}

// ── Run on page load ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHomeBlog();
  initBlogPage();
  initPostPage();
});

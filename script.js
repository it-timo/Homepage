const DATA_FILES = ['site', 'projects', 'albums', 'songs', 'articles', 'timeline', 'experiments'];
const navigation = [
  ['/', 'Home'], ['/music/', 'Music'], ['/projects/', 'Projects'], ['/experiments/', 'Worlds'],
  ['/library/', 'Library'], ['/timeline/', 'Timeline'], ['/about/', 'About']
];

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));
const statusClass = status => status.toLowerCase().replace(/\s+/g, '-');
const status = value => `<span class="status ${statusClass(value)}">${escapeHtml(value)}</span>`;
const tags = values => `<div class="tags">${values.map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>`;
const pageHero = (kicker, title, intro, meta = '') => `
  <section class="page-hero"><div class="wrap">
    <div class="kicker">${escapeHtml(kicker)}</div><h1>${title}</h1>
    <p class="intro">${escapeHtml(intro)}</p>${meta ? `<div class="page-meta">${meta}</div>` : ''}
  </div></section>`;
const sectionHeading = (index, title, link = '') => `<div class="section-heading"><span class="index">${index}</span><h2>${title}</h2>${link}</div>`;
const monthName = date => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${date}-01T12:00:00`));

function renderHeader() {
  const path = window.location.pathname;
  const activeRoot = navigation.find(([href]) => href !== '/' && path.startsWith(href))?.[0] || '/';
  document.querySelector('[data-header]').innerHTML = `
    <a class="brand" href="/"><img src="/assets/orbit-logo.svg" alt=""><span><strong>Timo Schmidt</strong><small>Systems · sound · stories</small></span></a>
    <nav class="nav" id="site-nav">${navigation.map(([href, label]) => `<a class="${activeRoot === href ? 'active' : ''}" href="${href}">${label}</a>`).join('')}<a href="/contact/">Contact ↗</a></nav>
    <button class="menu-button" type="button" aria-controls="site-nav" aria-expanded="false">Menu</button>`;
  const button = document.querySelector('.menu-button');
  button.addEventListener('click', () => {
    const isOpen = document.querySelector('.nav').classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
  });
}

function renderFooter(site) {
  document.querySelector('[data-footer]').innerHTML = `
    <div>© ${new Date().getFullYear()} ${escapeHtml(site.name)}</div>
    <img class="footer-orbit" src="/assets/orbit-logo.svg" alt="">
    <div>${escapeHtml(site.location)}</div>`;
}

function projectCard(project, index) {
  return `<article class="card">
    <span class="card-number">${String(index + 1).padStart(2, '0')} / ${escapeHtml(project.kind)}</span>
    <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p>
    <div class="card-footer">${status(project.status)}<span class="text-link">${project.year}</span></div>
  </article>`;
}

function albumCard(album) {
  const href = album.slug === 'grounded-fire' ? `/music/albums/${album.slug}.html` : '/music/albums/';
  return `<a class="card album-card ${escapeHtml(album.tone)}" href="${href}">
    <div class="album-art" role="img" aria-label="Placeholder cover for ${escapeHtml(album.title)}"></div>
    <div class="album-info"><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml(album.type)} · ${escapeHtml(album.year)} · ${escapeHtml(album.catalog)}</p><div class="card-footer">${status(album.status)}<span>↗</span></div></div>
  </a>`;
}

function timelineRows(items, includeYear = false) {
  return items.map(item => `<div class="timeline-row">
    <time>${includeYear ? item.date : monthName(item.date)}</time>
    <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>${status(item.status)}
  </div>`).join('');
}

function renderHome(data) {
  const featured = data.projects.filter(project => project.featured).slice(0, 3);
  const currentYear = data.timeline.filter(item => item.year === 2026).slice(0, 3);
  return `<section class="hero"><div class="wrap hero-grid"><div>
      <div class="kicker">Independent digital ecosystem · Est. 2024</div>
      <h1>Things made<br>to <em>understand.</em></h1>
      <p class="hero-lead">${escapeHtml(data.site.statement)}</p>
      <div class="hero-actions"><a class="button" href="/timeline/">Enter the timeline <span>→</span></a><a class="button ghost" href="/about/">Read the field note</a></div>
    </div><aside class="hero-aside"><label>Now / June 2026</label><p>${escapeHtml(data.site.now)}</p><label>Coordinates</label><p>${escapeHtml(data.site.location)}</p></aside></div></section>
    <section class="section"><div class="wrap">${sectionHeading('01 / FIELD WORK', 'Selected systems in motion', '<a class="text-link" href="/projects/">All projects →</a>')}<div class="grid three">${featured.map(projectCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHeading('02 / DISCOGRAPHY', 'Records, transmissions, unfinished signals', '<a class="text-link" href="/music/">Enter music archive →</a>')}<div class="grid three">${data.albums.map(albumCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHeading('03 / LIVING ARCHIVE', 'Recent coordinates', '<a class="text-link" href="/timeline/">Full timeline →</a>')}<div class="timeline-preview"><div class="timeline-preview-year">2026</div><div class="timeline-items">${timelineRows(currentYear)}</div></div></div></section>
    <section class="section"><div class="wrap manifesto"><blockquote>Not a portfolio.<br>A record of <em>becoming.</em></blockquote><div class="manifesto-copy"><p>This site is built to hold more than finished work. It keeps the questions, abandoned directions, release notes, lyrics, project histories, and small observations that make the finished work possible.</p><p>Different mediums live here because the underlying obsession is the same: how simple rules become complex systems, and how those systems become stories.</p></div></div></section>`;
}

function renderProjects(data) {
  return `${pageHero('Systems / tools / infrastructure', 'Projects', 'Software is one of the ways I think. These are active systems, useful tools, and archived questions — presented with their history intact.', '<span>4 records</span><span>2025—Now</span>')}
  <section class="section"><div class="wrap"><div class="filter-bar" data-filters>${['ALL','CONCEPT','EXPLORING','ALPHA','ACTIVE','ARCHIVED'].map((item, index) => `<button class="filter-button ${index === 0 ? 'active' : ''}" data-filter="${item}">${item}</button>`).join('')}</div><div class="grid three" data-project-grid>${data.projects.map(projectCard).join('')}</div></div></section>`;
}

function renderMusic(data) {
  return `${pageHero('Discography / videos / lyrics', 'Music', 'Records are long-form worlds. This archive follows each one from first fragment to release, with room for songs, visuals, credits, and commentary.', '<span>3 albums</span><span>2 songs documented</span>')}
  <section class="section"><div class="wrap">${sectionHeading('01 / RECORDS', 'Album chronology')}<div class="grid three">${data.albums.map(albumCard).join('')}</div></div></section>
  <section class="section"><div class="wrap">${sectionHeading('02 / SONG INDEX', 'Songs and transmissions', '<a class="text-link" href="/music/songs/">Full song index →</a>')}<div class="collection-list">${data.songs.map((song, index) => `<a class="collection-row" href="${song.slug === 'used-to-be-easy' ? `/music/songs/${song.slug}.html` : '/music/songs/'}"><span class="num">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.album)} · ${escapeHtml(song.duration)}</p>${status(song.status)}</a>`).join('')}</div></div></section>`;
}

function renderAlbums(data) {
  return `${pageHero('Music archive / collection 01', 'Albums', 'A chronological home for released records, works in production, and ideas that do not have names yet.')}
  <section class="section"><div class="wrap"><div class="grid three">${data.albums.map(albumCard).join('')}</div></div></section>`;
}

function renderAlbumDetail(data, slug) {
  const album = data.albums.find(item => item.slug === slug);
  if (!album) return renderNotFound();
  return `<section class="section"><div class="wrap detail-hero"><div class="detail-art"></div><div><div class="kicker">${escapeHtml(album.catalog)} / ${escapeHtml(album.type)}</div><h1 style="font-size:clamp(52px,7vw,96px);line-height:.96;letter-spacing:-.06em;font-weight:300;margin:28px 0">${escapeHtml(album.title)}</h1><p class="hero-lead">${escapeHtml(album.description)}</p><div class="page-meta"><span>${album.year}</span>${status(album.status)}</div><div class="track-list">${album.tracks.map(track => `<div class="track"><span>${escapeHtml(track)}</span><span>—</span></div>`).join('')}</div></div></div></section>
  <section class="section"><div class="wrap">${sectionHeading('LINER NOTE', 'Heat with somewhere to go')}<div class="prose"><p>Grounded Fire holds the tension between motion and control. It began as a collection of hard-edged electronic sketches and slowly became a record about learning which forces should be contained — and which should be followed.</p></div></div></section>`;
}

function renderSongs(data) {
  return `${pageHero('Music archive / collection 02', 'Songs', 'Individual entries for lyrics, credits, videos, release context, and the ideas around each track.')}
  <section class="section"><div class="wrap"><div class="collection-list">${data.songs.map((song,index) => `<a class="collection-row" href="${song.slug === 'used-to-be-easy' ? `/music/songs/${song.slug}.html` : '#'}"><span class="num">${String(index+1).padStart(2,'0')}</span><h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.description)}</p>${status(song.status)}</a>`).join('')}</div></div></section>`;
}

function renderSongDetail(data, slug) {
  const song = data.songs.find(item => item.slug === slug);
  if (!song) return renderNotFound();
  return `${pageHero(`${song.album} / ${song.year}`, song.title, song.description, `<span>${song.duration}</span>${status(song.status)}<span>${song.video ? 'Video available' : 'No video yet'}</span>`)}
  <section class="section"><div class="wrap detail-hero"><div class="prose"><div class="kicker">Lyrics / publication placeholder</div>${song.lyrics.map(line => `<p>${escapeHtml(line)}</p>`).join('')}</div><aside class="credits"><span class="meta-label">Credits</span>${song.credits.map(credit => `<p>${escapeHtml(credit)}</p>`).join('')}<span class="meta-label" style="margin-top:35px">Listen</span><div class="tags"><span class="tag">Spotify</span><span class="tag">Bandcamp</span><span class="tag">YouTube</span></div></aside></div></section>`;
}

function renderLibrary(data, collection = '') {
  const categoryMap = {'articles':'Articles','notes':'Notes','project-journals':'Project Journals','music-commentary':'Music Commentary'};
  const selected = categoryMap[collection];
  const articles = selected ? data.articles.filter(article => article.collection === selected) : data.articles;
  const title = selected || 'Library';
  const intro = selected ? `The ${selected.toLowerCase()} shelf: a growing collection of durable thoughts and working observations.` : 'A working archive for essays, short notes, project journals, and writing about music. Finished arguments live beside useful fragments.';
  return `${pageHero('Notes / essays / journals', title, intro, `<span>${articles.length} ${articles.length === 1 ? 'entry' : 'entries'}</span><span>Updated irregularly</span>`)}
  ${selected ? '' : `<section class="section"><div class="wrap"><div class="library-categories">${Object.entries(categoryMap).map(([slug,label],index) => `<a class="library-category" href="/library/${slug}/"><span>0${index+1}</span><h3>${label}</h3><span class="text-link">Open shelf →</span></a>`).join('')}</div></div></section>`}
  <section class="section"><div class="wrap">${sectionHeading(selected ? 'COLLECTION' : 'LATEST', selected ? 'All entries' : 'Recently filed')}<div class="collection-list">${articles.map((article,index) => `<a class="collection-row" href="${article.slug === 'building-to-understand' ? `/library/articles/${article.slug}.html` : '#'}"><span class="num">${String(index+1).padStart(2,'0')}</span><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.summary)}</p><span class="text-link">${escapeHtml(article.readTime)}</span></a>`).join('')}</div></div></section>`;
}

function renderArticle(data, slug) {
  const article = data.articles.find(item => item.slug === slug);
  if (!article) return renderNotFound();
  return `${pageHero(article.collection, article.title, article.summary, `<span>${article.date}</span><span>${article.readTime} read</span>`)}
  <article class="section"><div class="wrap detail-hero"><div class="prose">${article.body.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div><aside class="credits"><span class="meta-label">Filed under</span>${tags(article.tags)}<span class="meta-label" style="margin-top:35px">Status</span><p>Living document. Last reviewed ${escapeHtml(article.date)}.</p></aside></div></article>`;
}

function renderTimeline(data) {
  const years = [...new Set(data.timeline.map(item => item.year))];
  return `${pageHero('Everything connects eventually', 'Timeline', 'Releases, prototypes, detours, and decisions. A chronological layer across every part of this site.', `<span>${years.at(-1)}—${years[0]}</span><span>${data.timeline.length} coordinates</span>`)}
  <section class="section"><div class="wrap">${years.map(year => `<div class="timeline-preview" style="margin-bottom:55px"><div class="timeline-preview-year">${year}</div><div class="timeline-items">${timelineRows(data.timeline.filter(item => item.year === year), true)}</div></div>`).join('')}</div></section>`;
}

function renderExperiments(data) {
  return `${pageHero('Worlds / narratives / simulations', 'Worlds', 'Not every system is software. These are story spaces, game ideas, and experiments designed to discover what happens next.', '<span>3 open worlds</span><span>No fixed medium</span>')}
  <section class="section"><div class="wrap"><div class="grid three">${data.experiments.map((item,index) => `<article class="card"><span class="card-number">${String(index+1).padStart(2,'0')} / ${escapeHtml(item.type)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="card-footer">${status(item.status)}<span class="text-link">Open file →</span></div></article>`).join('')}</div></div></section>`;
}

function renderAbout(data) {
  return `${pageHero('About / operating principles', 'One practice,<br>many mediums.', data.site.statement)}
  <section class="section"><div class="wrap manifesto"><blockquote>I follow ideas that keep returning until they become <em>work.</em></blockquote><div class="prose"><p>I am Timo Schmidt: an engineer, builder, musician, and persistent collector of systems. I work across software, sound, narrative, and visual experiments.</p><p>This website is the long-term container for that practice. It is intentionally built as an archive rather than a highlight reel, because unfinished work and changed direction are part of the story.</p></div></div></section>
  <section class="section"><div class="wrap">${sectionHeading('PRINCIPLES', 'How the work moves')}<div class="grid three">${['Build to understand','Keep the history','Let mediums cross'].map((title,index) => `<div class="card"><span class="card-number">0${index+1}</span><h3>${title}</h3><p>${['Prototypes are thinking tools before they are products.','Archived paths make future decisions more honest.','A software idea can become a song. A story can become an interface.'][index]}</p></div>`).join('')}</div></div></section>`;
}

function renderContact(data) {
  return `${pageHero('Contact / open channel', 'Say hello.', 'For collaborations, conversations, and interesting problems. Context is always more useful than polish.')}
  <section class="section"><div class="wrap contact-grid"><div><span class="meta-label">Direct transmission</span><a class="email-link" href="mailto:${escapeHtml(data.site.email)}">${escapeHtml(data.site.email)}</a></div><div><span class="meta-label">Elsewhere</span><div class="contact-list">${data.site.links.map(link => `<a href="#"><span>${escapeHtml(link)}</span><span>↗</span></a>`).join('')}</div></div></div></section>`;
}

function renderNotFound() {
  return `<div class="error-state wrap"><div class="kicker" style="justify-content:center">404 / Lost coordinate</div><h1>Nothing orbits here yet.</h1><p><a class="button" href="/">Return home →</a></p></div>`;
}

function route(data) {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  if (path === '/') return renderHome(data);
  if (path === '/projects/') return renderProjects(data);
  if (path === '/music/') return renderMusic(data);
  if (path === '/music/albums/') return renderAlbums(data);
  if (path.startsWith('/music/albums/') && path.endsWith('.html')) return renderAlbumDetail(data, path.split('/').pop().replace('.html',''));
  if (path === '/music/songs/') return renderSongs(data);
  if (path.startsWith('/music/songs/') && path.endsWith('.html')) return renderSongDetail(data, path.split('/').pop().replace('.html',''));
  if (path === '/library/') return renderLibrary(data);
  if (path.startsWith('/library/articles/') && path.endsWith('.html')) return renderArticle(data, path.split('/').pop().replace('.html',''));
  const libraryCollection = path.match(/^\/library\/(articles|notes|project-journals|music-commentary)\/$/);
  if (libraryCollection) return renderLibrary(data, libraryCollection[1]);
  if (path === '/timeline/') return renderTimeline(data);
  if (path === '/experiments/') return renderExperiments(data);
  if (path === '/about/') return renderAbout(data);
  if (path === '/contact/') return renderContact(data);
  return renderNotFound();
}

function initializeFilters(data) {
  const filterBar = document.querySelector('[data-filters]');
  if (!filterBar) return;
  filterBar.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filterBar.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    const projects = filter === 'ALL' ? data.projects : data.projects.filter(project => project.status === filter);
    document.querySelector('[data-project-grid]').innerHTML = projects.map(projectCard).join('');
  });
}

async function initialize() {
  renderHeader();
  const entries = await Promise.all(DATA_FILES.map(async file => [file, await fetch(`/data/${file}.json`).then(response => {
    if (!response.ok) throw new Error(`Could not load ${file}.json`);
    return response.json();
  })]));
  const data = Object.fromEntries(entries);
  document.querySelector('[data-page]').innerHTML = route(data);
  renderFooter(data.site);
  initializeFilters(data);
}

initialize().catch(error => {
  console.error(error);
  document.querySelector('[data-page]').innerHTML = `<div class="error-state wrap"><h1>The archive is temporarily offline.</h1><p>${escapeHtml(error.message)}</p></div>`;
});

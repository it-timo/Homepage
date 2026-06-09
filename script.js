const DATA_FILES = ['site', 'profile', 'projects', 'albums', 'songs', 'experiments', 'in-motion', 'library', 'timeline'];

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const status = value => `<span class="status status-${slugify(value)}">${escapeHtml(value)}</span>`;
const tagList = values => `<div class="tags">${values.map(value => `<span class="tag">${escapeHtml(value)}</span>`).join('')}</div>`;
const list = (values, className = 'fact-list') => `<ul class="${className}">${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
const linkOrArticle = (item, content, className = '') => item.path
  ? `<a class="${className}" href="${item.path}">${content}</a>`
  : `<article class="${className}">${content}</article>`;

function pageHero(eyebrow, title, intro, note = '') {
  return `<section class="page-hero"><div class="wrap page-hero-grid"><div>
    <p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${title}</h1><p class="page-intro">${escapeHtml(intro)}</p>
  </div>${note ? `<aside class="context-note"><span>Context</span><p>${escapeHtml(note)}</p></aside>` : ''}</div></section>`;
}

function sectionHead(title, description = '', link = '') {
  return `<header class="section-head"><div><h2>${escapeHtml(title)}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>${link}</header>`;
}

function renderHeader(site) {
  const path = window.location.pathname;
  const activePath = site.navigation.find(item => item.path !== '/' && path.startsWith(item.path))?.path || '/';
  document.querySelector('[data-header]').innerHTML = `
    <a class="brand" href="/" aria-label="Timo Schmidt home"><img src="/assets/orbit-logo.svg" alt=""><span><strong>${escapeHtml(site.name)}</strong><small>${escapeHtml(site.identity)}</small></span></a>
    <nav class="nav" id="site-nav" aria-label="Primary navigation">${site.navigation.map(item => `<a class="${activePath === item.path ? 'active' : ''}" href="${item.path}">${escapeHtml(item.label)}</a>`).join('')}<a href="/contact/">Contact</a></nav>
    <button class="menu-button" type="button" aria-controls="site-nav" aria-expanded="false">Menu</button>`;
  const button = document.querySelector('.menu-button');
  button.addEventListener('click', () => {
    const open = document.querySelector('.nav').classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
}

function renderFooter(site) {
  document.querySelector('[data-footer]').innerHTML = `
    <div><img src="/assets/orbit-logo.svg" alt=""><span>${escapeHtml(site.identity)}</span></div>
    <p>A living archive of software, music, writing, and experiments.</p>
    <p>© ${new Date().getFullYear()} ${escapeHtml(site.name)}</p>`;
}

function motionRow(item) {
  return linkOrArticle(item, `<div><span class="record-type">${escapeHtml(item.domain || item.type)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary || item.description)}</p></div><div>${status(item.status)}<span class="row-arrow" aria-hidden="true">↗</span></div>`, 'record-row');
}

function projectCard(project) {
  return linkOrArticle(project, `<div class="card-top"><span class="record-type">${escapeHtml(project.kind)}</span>${status(project.status)}</div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p>${tagList(project.technologies)}${project.path ? '<span class="quiet-link">Read the project record →</span>' : '<span class="quiet-link">Public record not yet expanded</span>'}`, 'archive-card');
}

function albumCard(album) {
  return `<a class="album-record tone-${escapeHtml(album.tone)}" href="${album.path}"><div class="album-signal" aria-hidden="true"><span></span></div><div class="album-copy"><div class="card-top"><span class="record-type">${escapeHtml(album.format)}</span>${status(album.status)}</div><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml(album.theme)}</p><div class="album-meta"><span>13 tracks</span><span>${album.focus.slice(0, 2).map(escapeHtml).join(' · ')}</span></div></div></a>`;
}

function renderHome(data) {
  const primaryProjects = data.projects.filter(item => item.featured);
  return `<section class="home-intro"><div class="wrap home-grid"><div>
      <p class="eyebrow">${escapeHtml(data.site.identity)}</p>
      <h1>Different mediums.<br><em>Same curiosity.</em></h1>
      <p class="home-statement">${escapeHtml(data.site.statement)}</p>
      <p class="home-thread">${escapeHtml(data.site.thread)}</p>
    </div><aside class="identity-index"><span>Current role</span><strong>${escapeHtml(data.profile.role)}</strong><span>Primary disciplines</span>${data.profile.disciplines.map(value => `<strong>${escapeHtml(value)}</strong>`).join('')}<a href="/about/">Background and principles →</a></aside></div></section>
    <section class="section"><div class="wrap">${sectionHead('In motion', 'Current attention, without pretending it forms a fixed roadmap.', '<a class="quiet-link" href="/in-motion/">Full current-state record →</a>')}<div class="record-list">${data['in-motion'].map(motionRow).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Engineering records', 'Systems are documented here through their constraints, decisions, and reasons for existing.', '<a class="quiet-link" href="/projects/">All engineering work →</a>')}<div class="archive-grid">${primaryProjects.map(projectCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Music is primary work', 'The same questions about identity, persistence, technology, and connection reappear in lyrical form.', '<a class="quiet-link" href="/music/">Music archive →</a>')}<div class="album-grid">${data.albums.map(albumCard).join('')}</div></div></section>
    <section class="section connective"><div class="wrap split"><div><p class="eyebrow">The recurring thread</p><h2>How do complex things emerge, evolve, persist, and connect?</h2></div><div class="question-list">${data.profile.questions.map(question => `<p>${escapeHtml(question)}</p>`).join('')}</div></div></section>`;
}

function renderInMotion(data) {
  return `${pageHero('Current state', 'In Motion', 'A record of present attention across engineering and creative work.', 'These are priorities, not promises. Future directions intentionally remain open.')}
    <section class="section"><div class="wrap"><div class="record-list expanded">${data['in-motion'].map(motionRow).join('')}</div></div></section>
    <section class="section"><div class="wrap narrow"><h2>No rigid roadmap</h2><p class="large-copy">Long-running work changes when its assumptions change. This page records what currently has energy without turning exploration into a release schedule.</p></div></section>`;
}

function renderProjects(data) {
  return `${pageHero('Software / automation / architecture', 'Projects', 'Engineering records centered on purpose, constraints, and maintainability—not a grid of technologies.', 'Professional work spans backend engineering, software quality, test automation, architecture, and approximately 5.5 years at Alpha Strike Labs GmbH.')}
    <section class="section"><div class="wrap"><div class="filter-bar" data-filters>${['ALL', ...new Set(data.projects.map(item => item.status))].map((value, index) => `<button class="filter-button ${index === 0 ? 'active' : ''}" data-filter="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join('')}</div><div class="archive-grid" data-project-grid>${data.projects.map(projectCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Working principles')}<div class="principle-grid">${data.profile.principles.map((value, index) => `<div><span>0${index + 1}</span><p>${escapeHtml(value)}</p></div>`).join('')}</div></div></section>`;
}

function renderProject(data, slug) {
  const project = data.projects.find(item => item.slug === slug);
  if (!project) return renderNotFound();
  return `${pageHero(project.kind, project.title, project.summary, project.purpose)}
    <section class="section"><div class="wrap detail-grid"><div><p class="eyebrow">Why it exists</p><p class="large-copy">${escapeHtml(project.purpose)}</p>${project.principle ? `<blockquote class="principle-quote">${escapeHtml(project.principle)}</blockquote>` : ''}</div><aside><span class="meta-label">State</span>${status(project.status)}<span class="meta-label">Technologies</span>${tagList(project.technologies)}${project.technologyNote ? `<p class="small-note">${escapeHtml(project.technologyNote)}</p>` : ''}</aside></div></section>
    <section class="section"><div class="wrap">${sectionHead('Known characteristics', 'Concrete facts currently preserved in the public record.')} ${project.facts.length ? list(project.facts, 'fact-grid') : '<p class="empty-note">This record will expand when stable public detail is available.</p>'}</div></section>
    <section class="section"><div class="wrap narrow"><p class="eyebrow">Recurring themes</p>${tagList(project.themes)}</div></section>`;
}

function renderMusic(data) {
  const song = data.songs[0];
  return `${pageHero('Albums / songs / visual work', 'Music', 'Music is one of the primary outputs of this archive, not a side category.', 'Identity, resilience, persistence, authenticity, technology and humanity, responsibility, loneliness, connection, and self-reflection recur across the work.')}
    <section class="section"><div class="wrap">${sectionHead('Album archive', 'Complete themes and tracklists, without invented dates or release metadata.')}<div class="album-grid">${data.albums.map(albumCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Visual work')}<a class="feature-record" href="${song.path}"><div><span class="record-type">Current major video production</span><h2>${escapeHtml(song.title)}</h2><p>${escapeHtml(song.summary)}</p></div><div>${status(song.status)}<span class="quiet-link">Production record →</span></div></a></div></section>`;
}

function renderAlbums(data) {
  return `${pageHero('Music archive', 'Albums', 'Three bodies of work connected by resilience, technology, identity, and reconnection.')}
    <section class="section"><div class="wrap"><div class="album-grid">${data.albums.map(albumCard).join('')}</div></div></section>`;
}

function renderAlbum(data, slug) {
  const album = data.albums.find(item => item.slug === slug);
  if (!album) return renderNotFound();
  return `<section class="album-hero tone-${escapeHtml(album.tone)}"><div class="wrap album-hero-grid"><div class="album-signal large" aria-hidden="true"><span></span></div><div><p class="eyebrow">${escapeHtml(album.format)}</p><h1>${escapeHtml(album.title)}</h1><p class="page-intro">${escapeHtml(album.theme)}</p>${status(album.status)}${tagList(album.focus)}</div></div></section>
    ${album.acts ? `<section class="act-strip"><div class="wrap">${album.acts.map(act => `<div><span>${escapeHtml(act.range)}</span><strong>${escapeHtml(act.title)}</strong></div>`).join('')}</div></section>` : ''}
    <section class="section"><div class="wrap detail-grid"><div>${sectionHead('Tracklist')}<ol class="track-list">${album.tracks.map(track => `<li class="${album.notableTracks.includes(track) ? 'notable' : ''}"><span>${escapeHtml(track)}</span>${album.notableTracks.includes(track) ? '<em>Notable track</em>' : ''}</li>`).join('')}</ol></div><aside><span class="meta-label">Focus</span>${list(album.focus)}<span class="meta-label">About this record</span><p class="small-note">This page preserves the known concept and sequence. Dates, credits, lyrics, and listening links will be added only when verified.</p></aside></div></section>`;
}

function renderSongs(data) {
  return `${pageHero('Music archive', 'Songs & visual work', 'Individual records hold song context, lyrics when available, credits, and related visual production.')}
    <section class="section"><div class="wrap"><div class="record-list">${data.songs.map(item => linkOrArticle(item, `<div><span class="record-type">${escapeHtml(item.album)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></div><div>${status(item.status)}<span class="row-arrow">↗</span></div>`, 'record-row')).join('')}</div></div></section>`;
}

function renderSong(data, slug) {
  const song = data.songs.find(item => item.slug === slug);
  if (!song) return renderNotFound();
  return `${pageHero(`${song.album} / visual production`, song.title, song.summary, 'This record documents verified creative direction. Lyrics and release links are intentionally absent until ready for publication.')}
    <section class="section"><div class="wrap detail-grid"><div><p class="eyebrow">The Walker</p><h2 class="detail-title">${escapeHtml(song.video.character)}</h2><p class="large-copy">${escapeHtml(song.video.description)}</p></div><aside><span class="meta-label">Production state</span>${status(song.status)}<span class="meta-label">Themes</span>${tagList(song.video.themes)}</aside></div></section>
    <section class="section memory-section"><div class="wrap narrow"><p class="eyebrow">Visual motif</p><blockquote>${escapeHtml(song.video.motif)}</blockquote></div></section>`;
}

function renderExperiments(data) {
  return `${pageHero('Worldbuilding / simulation / narrative systems', 'Experiments', 'Ideas that may become games, simulations, stories, or something that does not yet have a category.', 'Exploration is allowed to remain exploratory. These records do not imply a production roadmap.')}
    <section class="section"><div class="wrap experiment-stack">${data.experiments.map(item => `<article class="experiment-record"><div><span class="record-type">${escapeHtml(item.type)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p>${tagList(item.themes)}</div><aside>${status(item.status)}${list(item.structure)}</aside></article>`).join('')}</div></section>`;
}

function renderLibrary(data, collectionSlug = '') {
  const selected = data.library.collections.find(item => item.slug === collectionSlug);
  const title = selected?.title || 'Library';
  const intro = selected?.description || 'A durable home for notes, articles, project journals, and music commentary as the archive grows.';
  return `${pageHero('Writing / documentation / context', title, intro, 'No articles are presented as published before they exist. The shelves are defined; entries will appear when there is something worth preserving.')}
    <section class="section"><div class="wrap">${selected ? `<a class="quiet-link back-link" href="/library/">← All library collections</a>` : ''}<div class="library-grid">${(selected ? [selected] : data.library.collections).map(item => `<a class="library-record" href="/library/${item.slug}/"><span class="record-type">${escapeHtml(item.status)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><span class="entry-count">0 entries — structure ready</span></a>`).join('')}</div></div></section>`;
}

function renderTimeline(data) {
  const periods = [...new Set(data.timeline.map(item => item.period))];
  return `${pageHero('State / history / continuity', 'Timeline', 'A chronology where dates are known, and an honest state index where they are not.', 'The current knowledge base does not establish exact dates for most work. This page does not invent them.')}
    <section class="section"><div class="wrap timeline">${periods.map(period => `<section class="timeline-group"><h2>${escapeHtml(period)}</h2><div>${data.timeline.filter(item => item.period === period).map(item => `<a class="timeline-entry" href="${item.path}"><span class="timeline-node"></span><div><span class="record-type">${escapeHtml(item.type)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>${status(item.status)}</a>`).join('')}</div></section>`).join('')}</div></section>`;
}

function renderAbout(data) {
  return `${pageHero('Background / principles / recurring questions', 'About', data.site.statement, data.site.thread)}
    <section class="section"><div class="wrap detail-grid"><div><p class="eyebrow">Professional background</p><h2 class="detail-title">${escapeHtml(data.profile.role)}</h2><p class="large-copy">Approximately 5.5 years at Alpha Strike Labs GmbH, working across OSINT systems, backend development, test automation, CI/CD, Docker environments, VPN testing, and mentoring interns.</p></div><aside><span class="meta-label">Primary disciplines</span>${list(data.profile.disciplines)}<span class="meta-label">Primary languages</span>${tagList(data.profile.languages)}</aside></div></section>
    <section class="section"><div class="wrap">${sectionHead('Engineering philosophy', 'Principles intended to survive changes in tools and trends.')}<div class="principle-grid">${data.profile.principles.map((value, index) => `<div><span>0${index + 1}</span><p>${escapeHtml(value)}</p></div>`).join('')}</div></div></section>
    <section class="section connective"><div class="wrap split"><div><p class="eyebrow">Across every medium</p><h2>Systems, stories, and experiments are different ways of approaching the same questions.</h2></div><div class="question-list">${data.profile.questions.map(question => `<p>${escapeHtml(question)}</p>`).join('')}</div></div></section>`;
}

function renderContact(data) {
  const email = data.site.email;
  return `${pageHero('Contact', 'A quiet channel.', 'Contact details belong here when there is a verified public channel to publish.', 'The previous implementation used placeholder social links and an unverified email address. They have been removed rather than presented as real.')}
    <section class="section"><div class="wrap narrow contact-copy">${email ? `<a class="email-link" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : '<p class="large-copy">No public contact address is listed yet.</p>'}<p>This page is intentionally complete without pretending that placeholder destinations are useful. A verified email or social profile can be added in <code>data/site.json</code> without changing the template.</p></div></section>`;
}

function renderNotFound() {
  return `<section class="error-state wrap"><p class="eyebrow">404 / No archive record</p><h1>This path does not hold a record yet.</h1><a class="quiet-link" href="/">Return to the index →</a></section>`;
}

function route(data) {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  if (path === '/') return renderHome(data);
  if (path === '/in-motion/') return renderInMotion(data);
  if (path === '/projects/') return renderProjects(data);
  if (/^\/projects\/[^/]+\.html$/.test(path)) return renderProject(data, path.split('/').pop().replace('.html', ''));
  if (path === '/music/') return renderMusic(data);
  if (path === '/music/albums/') return renderAlbums(data);
  if (/^\/music\/albums\/[^/]+\.html$/.test(path)) return renderAlbum(data, path.split('/').pop().replace('.html', ''));
  if (path === '/music/songs/') return renderSongs(data);
  if (/^\/music\/songs\/[^/]+\.html$/.test(path)) return renderSong(data, path.split('/').pop().replace('.html', ''));
  if (path === '/experiments/') return renderExperiments(data);
  if (path === '/library/') return renderLibrary(data);
  const collection = path.match(/^\/library\/(notes|articles|project-journals|music-commentary)\/$/);
  if (collection) return renderLibrary(data, collection[1]);
  if (path === '/timeline/') return renderTimeline(data);
  if (path === '/about/') return renderAbout(data);
  if (path === '/contact/') return renderContact(data);
  return renderNotFound();
}

function updateDocumentTitle(data) {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  const records = [...data.projects, ...data.albums, ...data.songs];
  const record = records.find(item => item.path === path);
  const navigationItem = data.site.navigation.find(item => item.path === path);
  const title = record?.title || navigationItem?.label || (path === '/contact/' ? 'Contact' : data.site.name);
  document.title = `${title} — ${data.site.name}`;
}

function initializeFilters(data) {
  const filters = document.querySelector('[data-filters]');
  if (!filters) return;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    const selected = button.dataset.filter;
    const projects = selected === 'ALL' ? data.projects : data.projects.filter(item => item.status === selected);
    document.querySelector('[data-project-grid]').innerHTML = projects.map(projectCard).join('');
  });
}

async function initialize() {
  const entries = await Promise.all(DATA_FILES.map(async name => {
    const response = await fetch(`/data/${name}.json`);
    if (!response.ok) throw new Error(`Unable to load ${name}.json`);
    return [name, await response.json()];
  }));
  const data = Object.fromEntries(entries);
  renderHeader(data.site);
  updateDocumentTitle(data);
  document.querySelector('[data-page]').innerHTML = route(data);
  renderFooter(data.site);
  initializeFilters(data);
}

initialize().catch(error => {
  console.error(error);
  document.querySelector('[data-page]').innerHTML = `<section class="error-state wrap"><h1>The archive could not be assembled.</h1><p>${escapeHtml(error.message)}</p></section>`;
});

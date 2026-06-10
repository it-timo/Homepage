const DATA_FILES = ['site', 'profile', 'project_context', 'projects', 'music_catalog', 'content_catalog', 'entities', 'search_index', 'experiments', 'videos', 'in-motion', 'library', 'timeline'];

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


function relationshipSection(data, entityId) {
  const entity = data.entities.entities.find(item => item.id === entityId);
  if (!entity) return '';
  const relations = [...entity.relationships, ...entity.incoming_relationships]
    .filter((relation, index, all) => relation.target !== entity.id && relation.path && relation.path !== entity.path && all.findIndex(item => item.target === relation.target || item.path === relation.path) === index);
  if (!relations.length) return '';
  return `<section class="section related-section"><div class="wrap">${sectionHead('Connected records', 'Follow the relationships around this record.')}<div class="relationship-grid">${relations.map(relation => `<a href="${relation.path}"><span class="record-type">${escapeHtml(relation.type.replaceAll('_', ' '))} · ${escapeHtml(relation.entity_type)}</span><h3>${escapeHtml(relation.title)}</h3><span class="quiet-link">Open connected record →</span></a>`).join('')}</div></div></section>`;
}

function motionRow(item) {
  return linkOrArticle(item, `<div><span class="record-type">${escapeHtml(item.domain || item.type)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary || item.description)}</p></div><div>${status(item.status)}<span class="row-arrow" aria-hidden="true">↗</span></div>`, 'record-row');
}

function projectCard(project) {
  return linkOrArticle(project, `<div class="card-top"><span class="record-type">${escapeHtml(project.kind)}</span>${status(project.status)}</div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p>${tagList(project.technologies)}${project.path ? '<span class="quiet-link">Read the project record →</span>' : '<span class="quiet-link">Public record not yet expanded</span>'}`, 'archive-card');
}

function albumArtwork(album, className = 'album-signal') {
  return album.cover_path
    ? `<img class="album-cover" src="${album.cover_path}" alt="${escapeHtml(album.title)} album cover">`
    : `<div class="${className}" aria-hidden="true"><span></span></div>`;
}

function albumCard(album) {
  const year = album.year || 'Year not catalogued';
  const runtime = album.total_runtime || 'Runtime available on album page';
  return `<a class="album-record" href="${album.path}">${albumArtwork(album)}<div class="album-copy"><div class="card-top"><span class="record-type">Album · ${escapeHtml(year)}</span>${status(album.status)}</div><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml(album.description)}</p><div class="album-meta"><span>${album.track_count} ${album.track_count === 1 ? 'track' : 'tracks'}</span><span>${escapeHtml(runtime)}</span></div></div></a>`;
}

function repositoryCard(repository) {
  const languages = repository.languages?.length ? repository.languages : (repository.language ? [repository.language] : []);
  return `<article class="repository-card ${repository.featured ? 'featured' : ''}"><div class="card-top"><span class="record-type">${repository.featured ? 'Featured repository' : 'GitHub repository'}</span><time datetime="${escapeHtml(repository.updated_at)}">Updated ${escapeHtml(new Date(repository.updated_at).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }))}</time></div><h3>${escapeHtml(repository.name)}</h3><p>${escapeHtml(repository.description || repository.readme_excerpt || 'No repository description is published.')}</p>${repository.readme_excerpt ? `<blockquote>${escapeHtml(repository.readme_excerpt)}</blockquote>` : ''}<div class="repository-meta"><div><span class="meta-label">Languages</span>${tagList(languages)}</div><div><span class="meta-label">Topics</span>${repository.topics.length ? tagList(repository.topics) : '<span class="small-note">No topics</span>'}</div><div><span class="meta-label">Activity</span><span class="small-note">${repository.metrics.stars} stars · ${repository.metrics.forks} forks · ${repository.metrics.open_issues} open issues</span></div></div><a class="quiet-link" href="${repository.url}" rel="me noopener" target="_blank">View repository on GitHub ↗</a></article>`;
}

function renderHome(data) {
  const primaryProjects = data.project_context.filter(item => item.featured);
  return `<section class="home-intro"><div class="wrap home-grid"><div>
      <p class="eyebrow">${escapeHtml(data.site.identity)}</p>
      <h1>Different mediums.<br><em>Same curiosity.</em></h1>
      <p class="home-statement">${escapeHtml(data.site.statement)}</p>
      <p class="home-thread">${escapeHtml(data.site.thread)}</p>
    </div><aside class="identity-index"><span>Current role</span><strong>${escapeHtml(data.profile.role)}</strong><span>Primary disciplines</span>${data.profile.disciplines.map(value => `<strong>${escapeHtml(value)}</strong>`).join('')}<a href="/about/">Background and principles →</a></aside></div></section>
    <section class="section"><div class="wrap">${sectionHead('In motion', 'Current attention, without pretending it forms a fixed roadmap.', '<a class="quiet-link" href="/in-motion/">Full current-state record →</a>')}<div class="record-list">${data['in-motion'].map(motionRow).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Engineering records', 'Systems are documented here through their constraints, decisions, and reasons for existing.', '<a class="quiet-link" href="/projects/">All engineering work →</a>')}<div class="archive-grid">${primaryProjects.map(projectCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Music is primary work', 'The same questions about identity, persistence, technology, and connection reappear in lyrical form.', '<a class="quiet-link" href="/music/">Music archive →</a>')}<div class="album-grid">${data.music_catalog.albums.map(albumCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('From the knowledge base', 'Markdown notes and articles become connected archive records.', '<a class="quiet-link" href="/library/">Open the library →</a>')}<div class="record-list">${data.content_catalog.entries.map(contentRow).join('')}</div></div></section>
    <section class="section connective"><div class="wrap split"><div><p class="eyebrow">The recurring thread</p><h2>How do complex things emerge, evolve, persist, and connect?</h2></div><div class="question-list">${data.profile.questions.map(question => `<p>${escapeHtml(question)}</p>`).join('')}</div></div></section>`;
}

function renderInMotion(data) {
  return `${pageHero('Current state', 'In Motion', 'A record of present attention across engineering and creative work.', 'These are priorities, not promises. Future directions intentionally remain open.')}
    <section class="section"><div class="wrap"><div class="record-list expanded">${data['in-motion'].map(motionRow).join('')}</div></div></section>
    <section class="section"><div class="wrap narrow"><h2>No rigid roadmap</h2><p class="large-copy">Long-running work changes when its assumptions change. This page records what currently has energy without turning exploration into a release schedule.</p></div></section>`;
}

function renderProjects(data) {
  const featured = data.projects.filter(item => item.featured);
  const repositories = [...featured, ...data.projects.filter(item => !item.featured)];
  return `${pageHero('Software / automation / architecture', 'Projects', 'Documented systems and the current public GitHub record for it-timo.', 'Repository data is generated from GitHub. Forks and archived repositories are excluded; featured repositories are selected in data/project_featured.json.')}
    <section class="section"><div class="wrap">${sectionHead('Engineering records', 'Long-running systems documented through purpose, constraints, and maintainability.')}<div class="archive-grid">${data.project_context.map(projectCard).join('')}</div></div></section>
    <section class="section"><div class="wrap">${sectionHead('GitHub repositories', 'Public, non-fork, non-archived repositories sorted by most recent update.')} ${repositories.length ? `<div class="repository-grid">${repositories.map(repositoryCard).join('')}</div>` : '<p class="empty-note">The GitHub catalog has not been generated in this checkout. Run <code>python3 tools/update_github.py</code> with network access.</p>'}</div></section>
    <section class="section"><div class="wrap">${sectionHead('Working principles')}<div class="principle-grid">${data.profile.principles.map((value, index) => `<div><span>0${index + 1}</span><p>${escapeHtml(value)}</p></div>`).join('')}</div></div></section>`;
}

function renderProject(data, slug) {
  const project = data.project_context.find(item => item.slug === slug);
  if (!project) return renderNotFound();
  return `${pageHero(project.kind, project.title, project.summary, project.purpose)}
    <section class="section"><div class="wrap detail-grid"><div><p class="eyebrow">Why it exists</p><p class="large-copy">${escapeHtml(project.purpose)}</p>${project.principle ? `<blockquote class="principle-quote">${escapeHtml(project.principle)}</blockquote>` : ''}</div><aside><span class="meta-label">State</span>${status(project.status)}<span class="meta-label">Technologies</span>${tagList(project.technologies)}${project.technologyNote ? `<p class="small-note">${escapeHtml(project.technologyNote)}</p>` : ''}</aside></div></section>
    <section class="section"><div class="wrap">${sectionHead('Known characteristics', 'Concrete facts currently preserved in the public record.')} ${project.facts.length ? list(project.facts, 'fact-grid') : '<p class="empty-note">This record will expand when stable public detail is available.</p>'}</div></section>
    <section class="section"><div class="wrap narrow"><p class="eyebrow">Recurring themes</p>${tagList(project.themes)}</div></section>${relationshipSection(data, project.id)}`;
}

function renderMusic(data) {
  const albums = data.music_catalog.albums;
  return `${pageHero('Albums / tracks / lyrics', 'Music', 'The music archive is generated from committed album and track metadata while the FLAC, artwork, and lyric files remain deployed directly on the website.', 'Media does not need to live in Git. A small tracks.json index preserves titles and filenames; the browser reads runtime from the deployed FLAC metadata.')}
    <section class="section"><div class="wrap">${sectionHead('Album catalog', 'Tracklists are versioned as metadata. Runtime is synchronized from deployed FLAC files when an album or song page opens.')}<div class="album-grid">${albums.map(albumCard).join('')}</div></div></section>`;
}

function renderAlbums(data) {
  return renderMusic(data);
}

function trackRow(track) {
  return `<div><a class="track-row" href="${track.path}"><span>${String(track.track).padStart(2, '0')}</span><strong>${escapeHtml(track.title)}</strong><span data-runtime-value>${escapeHtml(track.duration || 'Reading runtime…')}</span></a>${track.audio ? `<audio hidden preload="metadata" src="${track.audio}" data-runtime-audio></audio>` : ''}</div>`;
}

function renderAlbum(data, slug) {
  const album = data.music_catalog.albums.find(item => item.slug === slug);
  if (!album) return renderNotFound();
  const year = album.year || 'Not catalogued';
  return `<section class="album-hero"><div class="wrap album-hero-grid">${albumArtwork(album, 'album-signal large')}<div><p class="eyebrow">Album · ${escapeHtml(year)}</p><h1>${escapeHtml(album.title)}</h1><p class="page-intro">${escapeHtml(album.description)}</p>${status(album.status)}${tagList(album.themes)}<dl class="album-statistics"><div><dt>Tracks</dt><dd>${album.track_count}</dd></div><div><dt>Runtime</dt><dd data-album-runtime>${escapeHtml(album.total_runtime || 'Reading FLAC metadata…')}</dd></div><div><dt>Year</dt><dd>${escapeHtml(year)}</dd></div></dl></div></div></section>
    <section class="section"><div class="wrap">${sectionHead('Tracklist', 'Versioned metadata points to FLAC, cover, and LRC files deployed directly on the website.')} ${album.tracks.length ? `<div class="track-table">${album.tracks.map(trackRow).join('')}</div>` : '<p class="empty-note">No track metadata has been catalogued for this album yet.</p>'}</div></section>${relationshipSection(data, album.id)}`;
}

function findTrack(data, albumSlug, trackSlug) {
  const album = data.music_catalog.albums.find(item => item.slug === albumSlug);
  return { album, track: album?.tracks.find(item => item.slug === trackSlug) };
}

function renderTrack(data, albumSlug, trackSlug) {
  const { album, track } = findTrack(data, albumSlug, trackSlug);
  if (!album || !track) return renderNotFound();
  const artwork = track.cover
    ? `<img class="track-cover" src="${track.cover}" alt="Cover for ${escapeHtml(track.title)}">`
    : albumArtwork(album, 'album-signal large');
  return `<section class="track-hero"><div class="wrap track-hero-grid"><div>${artwork}</div><div><p class="eyebrow">Track ${String(track.track).padStart(2, '0')} · ${escapeHtml(album.title)}</p><h1>${escapeHtml(track.title)}</h1><p class="track-runtime" data-runtime-value>${escapeHtml(track.duration || 'Reading FLAC metadata…')}</p>${track.audio ? `<audio controls preload="metadata" src="${track.audio}" data-runtime-audio data-lyric-audio>Your browser does not support HTML5 audio.</audio>` : '<p class="empty-note">No deployed FLAC path is catalogued for this track.</p>'}</div></div></section>
    <section class="section"><div class="wrap narrow">${sectionHead('Lyrics', 'Timestamped lines follow the music and remain readable; select a line to seek without forcing playback.')}<div class="lyrics-shell"><p class="lyric-mode small-note" data-lyric-mode aria-live="polite">${track.lyrics ? 'Loading lyrics…' : 'Lyrics unavailable'}</p><div class="lyrics" ${track.lyrics ? `data-lyrics-url="${track.lyrics}"` : ''}>${track.lyrics ? '<p class="small-note">Preparing lyric view…</p>' : '<p class="empty-note">No LRC file is present for this track.</p>'}</div></div></div></section>
    <nav class="track-navigation wrap" aria-label="Track navigation"><div>${track.previous ? `<span>Previous track</span><a href="${track.previous.path}">${escapeHtml(track.previous.title)}</a>` : ''}</div><a class="back-album" href="${album.path}">Back to album</a><div>${track.next ? `<span>Next track</span><a href="${track.next.path}">${escapeHtml(track.next.title)}</a>` : ''}</div></nav>${relationshipSection(data, track.id)}`;
}

function experimentConnections(data, entityId) {
  const entity = data.entities.entities.find(item => item.id === entityId);
  if (!entity) return '';
  const relations = [...entity.relationships, ...entity.incoming_relationships]
    .filter((relation, index, all) => relation.path && relation.target !== entityId && all.findIndex(item => item.target === relation.target) === index);
  if (!relations.length) return '';
  return `<div class="experiment-connections"><span class="meta-label">Connected ideas</span>${relations.map(relation => `<a href="${relation.path}">${escapeHtml(relation.title)} →</a>`).join('')}</div>`;
}

function renderExperiments(data) {
  return `${pageHero('Worldbuilding / simulation / narrative systems', 'Experiments', 'Ideas that may become games, simulations, stories, or something that does not yet have a category.', 'Exploration is allowed to remain exploratory. These records do not imply a production roadmap.')}
    <section class="section"><div class="wrap experiment-stack">${data.experiments.map(item => `<article class="experiment-record" id="${escapeHtml(item.slug)}"><div><span class="record-type">${escapeHtml(item.type)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.summary)}</p>${tagList(item.themes)}</div><aside>${status(item.status)}${list(item.structure)}${experimentConnections(data, item.id)}</aside></article>`).join('')}</div></section>`;
}

function contentRow(item) {
  return `<a class="record-row" href="${item.path}"><div><span class="record-type">${escapeHtml(item.collection)} · ${escapeHtml(item.status)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></div><div>${tagList(item.themes.slice(0, 2))}<span class="row-arrow">↗</span></div></a>`;
}

function renderLibrary(data, collectionSlug = '') {
  const selected = data.library.collections.find(item => item.slug === collectionSlug);
  const entries = selected ? data.content_catalog.entries.filter(item => item.collection === collectionSlug) : data.content_catalog.entries;
  const title = selected?.title || 'Library';
  const intro = selected?.description || 'Markdown notes and articles, ingested into the same relationship graph as music, projects, videos, and experiments.';
  return `${pageHero('Writing / documentation / context', title, intro, 'Source Markdown remains readable outside the website. The build adds routes, relationships, timeline entries, and search records.')}
    <section class="section"><div class="wrap">${!selected ? `<div class="library-grid">${data.library.collections.map(item => `<a class="library-record" href="/library/${item.slug}/"><span class="record-type">${escapeHtml(item.status)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><span class="entry-count">${data.content_catalog.entries.filter(entry => entry.collection === item.slug).length} entries</span></a>`).join('')}</div>` : `<a class="quiet-link back-link" href="/library/">← All library collections</a><div class="record-list">${entries.length ? entries.map(contentRow).join('') : '<p class="empty-note">No entries in this collection yet.</p>'}</div>`}</div></section>`;
}

function renderContent(data, collection, slug) {
  const item = data.content_catalog.entries.find(entry => entry.collection === collection && entry.slug === slug);
  if (!item) return renderNotFound();
  return `${pageHero(`${item.collection} · ${item.status}`, item.title, item.summary, item.year ? `Catalogued ${item.year}` : 'Living archive entry')}
    <article class="section"><div class="wrap article-layout"><div class="prose">${item.body.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div><aside><span class="meta-label">Themes</span>${tagList(item.themes)}<span class="meta-label">Source</span><code>${escapeHtml(item.source)}</code></aside></div></article>${relationshipSection(data, item.id)}`;
}

function renderSearch(data) {
  return `${pageHero('Connected archive search', 'Search', 'Find records by title, summary, theme, type, or the names of connected entities.', 'Search is generated from the same validated entity graph that drives cross-links.')}
    <section class="section"><div class="wrap"><label class="search-box"><span>Search the archive</span><input type="search" data-search-input placeholder="Try resilience, architecture, memory…" autocomplete="off"></label><p class="search-count" data-search-count>${data.search_index.records.length} records indexed</p><div class="search-results record-list" data-search-results></div></div></section>`;
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
  const albumRoute = path.match(/^\/music\/([^/]+)\/$/);
  if (albumRoute) return renderAlbum(data, albumRoute[1]);
  const trackRoute = path.match(/^\/music\/([^/]+)\/([^/]+)\/$/);
  if (trackRoute) return renderTrack(data, trackRoute[1], trackRoute[2]);
  if (path === '/experiments/') return renderExperiments(data);
  if (path === '/library/') return renderLibrary(data);
  const contentRoute = path.match(/^\/library\/(articles|notes|project-journals|music-commentary)\/([^/]+)\/$/);
  if (contentRoute) return renderContent(data, contentRoute[1], contentRoute[2]);
  const collection = path.match(/^\/library\/(notes|articles|project-journals|music-commentary)\/$/);
  if (collection) return renderLibrary(data, collection[1]);
  if (path === '/timeline/') return renderTimeline(data);
  if (path === '/search/') return renderSearch(data);
  if (path === '/about/') return renderAbout(data);
  if (path === '/contact/') return renderContact(data);
  return renderNotFound();
}

function updateDocumentTitle(data) {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  const albums = data.music_catalog.albums;
  const tracks = albums.flatMap(album => album.tracks);
  const records = [...data.project_context, ...data.projects, ...albums, ...tracks, ...data.content_catalog.entries];
  const record = records.find(item => item.path === path);
  const navigationItem = data.site.navigation.find(item => item.path === path);
  const title = record?.title || navigationItem?.label || (path === '/contact/' ? 'Contact' : data.site.name);
  document.title = `${title} — ${data.site.name}`;
}

function parseLrc(source) {
  const metadata = {};
  const synced = [];
  const plain = [];
  const timestampPattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  for (const rawLine of source.replace(/\r/g, '').split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const metadataMatch = line.match(/^\[([a-z]+):([^\]]*)\]$/i);
    if (metadataMatch) {
      metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2].trim();
      continue;
    }
    const timestamps = [...line.matchAll(timestampPattern)];
    const text = line.replace(timestampPattern, '').trim();
    if (text) plain.push(text);
    for (const match of timestamps) {
      if (!text) continue;
      const fraction = match[3] ? Number(`0.${match[3]}`) : 0;
      synced.push({ time: Number(match[1]) * 60 + Number(match[2]) + fraction, text });
    }
  }
  const parsedOffset = Number(metadata.offset || 0);
  const offset = Number.isFinite(parsedOffset) ? parsedOffset / 1000 : 0;
  synced.forEach(line => { line.time = Math.max(0, line.time + offset); });
  synced.sort((a, b) => a.time - b.time);
  return { metadata, plain, synced };
}

function findActiveLyricIndex(lines, playbackTime) {
  let low = 0;
  let high = lines.length - 1;
  let active = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lines[middle].time <= playbackTime) {
      active = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return active;
}

function keepLyricVisible(container, line) {
  const lineTop = line.offsetTop;
  const lineBottom = lineTop + line.offsetHeight;
  const safeTop = container.scrollTop + container.clientHeight * 0.25;
  const safeBottom = container.scrollTop + container.clientHeight * 0.75;
  if (lineTop >= safeTop && lineBottom <= safeBottom) return;
  container.scrollTo({
    top: Math.max(0, lineTop - container.clientHeight / 2 + line.offsetHeight / 2),
    behavior: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}

async function initializeLyrics() {
  const container = document.querySelector('[data-lyrics-url]');
  if (!container) return;
  const mode = document.querySelector('[data-lyric-mode]');
  const player = document.querySelector('[data-lyric-audio]');
  try {
    const response = await fetch(container.dataset.lyricsUrl);
    if (!response.ok) throw new Error('Lyrics could not be loaded.');
    const lyrics = parseLrc(await response.text());
    if (!lyrics.synced.length) {
      container.classList.add('lyrics-plain');
      container.innerHTML = lyrics.plain.length
        ? lyrics.plain.map(text => `<p>${escapeHtml(text)}</p>`).join('')
        : '<p class="empty-note">The LRC file contains no lyric lines.</p>';
      if (mode) mode.textContent = 'Plain lyrics · timestamps are not available for this track';
      return;
    }

    container.classList.add('lyrics-synced');
    container.setAttribute('aria-label', 'Synchronized lyrics');
    container.innerHTML = lyrics.synced.map((line, index) => `
      <button class="lyric-line" type="button" data-lyric-index="${index}" data-time="${line.time}" aria-label="Seek to ${formatRuntime(line.time)}: ${escapeHtml(line.text)}">
        <span class="lyric-time" aria-hidden="true">${formatRuntime(line.time)}</span>
        <span>${escapeHtml(line.text)}</span>
      </button>`).join('');
    if (mode) mode.textContent = player
      ? 'Synchronized lyrics · select any line to seek'
      : 'Timestamped lyrics · audio player unavailable';
    if (!player) return;

    const lineElements = [...container.querySelectorAll('[data-lyric-index]')];
    let activeIndex = -1;
    const updateActiveLine = () => {
      const nextIndex = findActiveLyricIndex(lyrics.synced, player.currentTime);
      if (nextIndex === activeIndex) return;
      if (activeIndex >= 0) {
        lineElements[activeIndex].classList.remove('is-active');
        lineElements[activeIndex].removeAttribute('aria-current');
      }
      activeIndex = nextIndex;
      if (activeIndex < 0) return;
      const activeLine = lineElements[activeIndex];
      activeLine.classList.add('is-active');
      activeLine.setAttribute('aria-current', 'true');
      keepLyricVisible(container, activeLine);
    };
    container.addEventListener('click', event => {
      const line = event.target.closest('[data-time]');
      if (!line || !container.contains(line)) return;
      const seekTime = Number(line.dataset.time);
      if (player.readyState) {
        player.currentTime = seekTime;
        updateActiveLine();
      } else {
        player.addEventListener('loadedmetadata', () => { player.currentTime = seekTime; updateActiveLine(); }, { once: true });
      }
    });
    player.addEventListener('timeupdate', updateActiveLine);
    player.addEventListener('seeking', updateActiveLine);
    player.addEventListener('play', updateActiveLine);
    player.addEventListener('loadedmetadata', updateActiveLine);
    updateActiveLine();
  } catch (error) {
    if (mode) mode.textContent = 'Lyrics unavailable';
    container.innerHTML = `<p class="empty-note">${escapeHtml(error.message)}</p>`;
  }
}

function formatRuntime(seconds) {
  if (!Number.isFinite(seconds)) return 'Runtime unavailable';
  const rounded = Math.round(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remaining = rounded % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}` : `${minutes}:${String(remaining).padStart(2, '0')}`;
}

function initializeAudioMetadata() {
  const players = [...document.querySelectorAll('[data-runtime-audio]')];
  if (!players.length) return;
  const durations = new Map();
  const albumRuntime = document.querySelector('[data-album-runtime]');
  const updateAlbumRuntime = () => {
    if (!albumRuntime || durations.size !== players.length) return;
    albumRuntime.textContent = formatRuntime([...durations.values()].reduce((total, value) => total + value, 0));
  };
  players.forEach((player, index) => {
    const runtime = player.parentElement.querySelector('[data-runtime-value]');
    player.addEventListener('loadedmetadata', () => {
      if (!Number.isFinite(player.duration)) return;
      durations.set(index, player.duration);
      if (runtime) runtime.textContent = formatRuntime(player.duration);
      updateAlbumRuntime();
    });
    player.addEventListener('error', () => {
      if (runtime) runtime.textContent = 'Runtime unavailable';
      if (albumRuntime) albumRuntime.textContent = 'Runtime unavailable';
    });
  });
}

function initializeSearch(data) {
  const input = document.querySelector('[data-search-input]');
  if (!input) return;
  const results = document.querySelector('[data-search-results]');
  const count = document.querySelector('[data-search-count]');
  const render = () => {
    const terms = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = terms.length ? data.search_index.records.filter(record => terms.every(term => record.search_text.includes(term))) : [];
    count.textContent = terms.length ? `${matches.length} matching records` : `${data.search_index.records.length} records indexed`;
    results.innerHTML = terms.length ? (matches.length ? matches.map(record => `<a class="record-row" href="${record.path}"><div><span class="record-type">${escapeHtml(record.type)}</span><h3>${escapeHtml(record.title)}</h3><p>${escapeHtml(record.summary)}</p></div><span class="row-arrow">↗</span></a>`).join('') : '<p class="empty-note">No connected records match this search.</p>') : '';
  };
  input.addEventListener('input', render);
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
  initializeLyrics();
  initializeAudioMetadata();
  initializeSearch(data);
  if (window.location.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ block: 'start' }));
}

if (typeof document !== 'undefined') {
  initialize().catch(error => {
    console.error(error);
    document.querySelector('[data-page]').innerHTML = `<section class="error-state wrap"><h1>The archive could not be assembled.</h1><p>${escapeHtml(error.message)}</p></section>`;
  });
}

if (typeof module !== 'undefined') module.exports = { parseLrc, findActiveLyricIndex, formatRuntime };

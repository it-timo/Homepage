import { readFileSync, existsSync } from 'node:fs';

const load = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const site = load('site');
const context = load('project_context');
const repositories = load('projects');
const music = load('music_catalog');
const experiments = load('experiments');
const motion = load('in-motion');
const library = load('library');
const timeline = load('timeline');

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const required = (record, fields, collection) => fields.forEach(field => assert(record[field] !== undefined, `${collection}/${record.slug || record.name || record.title}: missing ${field}`));
const unique = (records, field, collection) => {
  const values = records.map(record => record[field]).filter(Boolean);
  assert(new Set(values).size === values.length, `${collection}: duplicate ${field}`);
};
const routeFile = path => path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);

context.forEach(record => required(record, ['slug', 'title', 'status', 'kind', 'summary', 'purpose', 'technologies', 'themes'], 'project_context'));
repositories.forEach(record => required(record, ['name', 'description', 'language', 'languages', 'topics', 'updated_at', 'url', 'readme_excerpt', 'featured'], 'projects'));
music.albums.forEach(album => {
  required(album, ['slug', 'path', 'title', 'year', 'status', 'description', 'themes', 'track_count', 'total_runtime', 'tracks'], 'music_catalog');
  assert(album.track_count === album.tracks.length, `music_catalog/${album.slug}: track_count does not match tracks`);
  album.tracks.forEach(track => required(track, ['track', 'slug', 'title', 'path', 'audio', 'cover', 'lyrics', 'duration_seconds', 'duration', 'previous', 'next'], `music_catalog/${album.slug}`));
  unique(album.tracks, 'track', `music_catalog/${album.slug}`);
  unique(album.tracks, 'slug', `music_catalog/${album.slug}`);
});
experiments.forEach(record => required(record, ['slug', 'title', 'type', 'status', 'summary', 'structure', 'themes'], 'experiments'));
motion.forEach(record => required(record, ['title', 'status', 'domain', 'summary', 'path'], 'in-motion'));
timeline.forEach(record => required(record, ['period', 'order', 'title', 'type', 'status', 'description', 'path'], 'timeline'));
library.collections.forEach(record => required(record, ['slug', 'title', 'description', 'status'], 'library'));

unique(context, 'slug', 'project_context');
unique(repositories, 'name', 'projects');
unique(music.albums, 'slug', 'music_catalog');
assert(site.navigation.some(item => item.path === '/in-motion/'), 'navigation: missing In Motion');
assert(library.entries.length === 0, 'library: entries must not be fabricated');
assert(repositories.every(repo => !repo.fork && !repo.archived), 'projects: forks or archived repositories must be excluded');
for (let index = 1; index < repositories.length; index += 1) {
  assert(repositories[index - 1].updated_at >= repositories[index].updated_at, 'projects: repositories are not sorted by updated_at descending');
}

const linkedRoutes = [
  ...site.navigation.map(item => item.path), '/contact/',
  ...context.map(item => item.path).filter(Boolean),
  ...music.albums.map(item => item.path),
  ...music.albums.flatMap(album => album.tracks.map(track => track.path)),
];
for (const path of new Set(linkedRoutes)) {
  assert(existsSync(new URL(`../${routeFile(path)}`, import.meta.url)), `route: ${path} has no HTML entry point`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
const tracks = music.albums.reduce((total, album) => total + album.track_count, 0);
console.log(`Content audit passed: ${context.length} engineering records, ${repositories.length} GitHub repositories, ${music.albums.length} albums, ${tracks} discovered tracks.`);

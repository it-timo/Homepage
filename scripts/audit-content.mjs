import { readFileSync, existsSync } from 'node:fs';

const load = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const site = load('site');
const projects = load('projects');
const albums = load('albums');
const songs = load('songs');
const experiments = load('experiments');
const motion = load('in-motion');
const library = load('library');
const timeline = load('timeline');

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const required = (record, fields, collection) => fields.forEach(field => assert(record[field] !== undefined && record[field] !== '', `${collection}/${record.slug || record.title}: missing ${field}`));
const unique = (records, field, collection) => {
  const values = records.map(record => record[field]).filter(Boolean);
  assert(new Set(values).size === values.length, `${collection}: duplicate ${field}`);
};
const routeFile = path => path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1);

projects.forEach(record => required(record, ['slug', 'title', 'status', 'kind', 'summary', 'purpose', 'technologies', 'themes'], 'projects'));
albums.forEach(record => required(record, ['slug', 'path', 'title', 'format', 'status', 'theme', 'focus', 'tracks', 'notableTracks'], 'albums'));
songs.forEach(record => required(record, ['slug', 'path', 'title', 'album', 'status', 'summary', 'video'], 'songs'));
experiments.forEach(record => required(record, ['slug', 'title', 'type', 'status', 'summary', 'structure', 'themes'], 'experiments'));
motion.forEach(record => required(record, ['title', 'status', 'domain', 'summary', 'path'], 'in-motion'));
timeline.forEach(record => required(record, ['period', 'order', 'title', 'type', 'status', 'description', 'path'], 'timeline'));
library.collections.forEach(record => required(record, ['slug', 'title', 'description', 'status'], 'library'));

unique(projects, 'slug', 'projects');
unique(albums, 'slug', 'albums');
unique(songs, 'slug', 'songs');
assert(site.navigation.some(item => item.path === '/in-motion/'), 'navigation: missing In Motion');
assert(library.entries.length === 0, 'library: entries must not be fabricated');

const linkedRoutes = [
  ...site.navigation.map(item => item.path), '/contact/',
  ...projects.map(item => item.path).filter(Boolean),
  ...albums.map(item => item.path), ...songs.map(item => item.path)
];
for (const path of new Set(linkedRoutes)) {
  assert(existsSync(new URL(`../${routeFile(path)}`, import.meta.url)), `route: ${path} has no HTML entry point`);
}
for (const album of albums) {
  assert(album.tracks.length === 13, `albums/${album.slug}: expected verified 13-track sequence`);
  assert(album.notableTracks.every(track => album.tracks.includes(track)), `albums/${album.slug}: notable track missing from tracklist`);
}

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Content audit passed: ${projects.length} projects, ${albums.length} albums, ${songs.length} song/video record, ${experiments.length} experiments, ${timeline.length} timeline records.`);

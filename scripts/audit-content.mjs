import { readFileSync, existsSync } from 'node:fs';
const load = name => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)));
const site=load('site'), context=load('project_context'), repositories=load('projects'), music=load('music_catalog');
const experiments=load('experiments'), motion=load('in-motion'), library=load('library'), timeline=load('timeline');
const content=load('content_catalog'), graph=load('entities'), search=load('search_index'), milestones=load('milestones');
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};
const required=(record,fields,collection)=>fields.forEach(field=>assert(record[field]!==undefined,`${collection}/${record.slug||record.name||record.title}: missing ${field}`));
const unique=(records,field,collection)=>{const values=records.map(record=>record[field]).filter(Boolean);assert(new Set(values).size===values.length,`${collection}: duplicate ${field}`)};
const routeFile=path=>path.endsWith('/')?`${path.slice(1)}index.html`:path.slice(1);

context.forEach(record=>required(record,['id','slug','title','status','kind','summary','purpose','technologies','themes','relationships'],'project_context'));
repositories.forEach(record=>required(record,['id','name','description','language','languages','topics','updated_at','url','readme_excerpt','featured','metrics','relationships'],'projects'));
music.albums.forEach(album=>{
  required(album,['id','slug','path','title','year','status','description','themes','track_count','total_runtime','tracks','relationships'],'music_catalog');
  assert(album.track_count===album.tracks.length,`music_catalog/${album.slug}: track_count does not match tracks`);
  album.tracks.forEach(track=>required(track,['id','track','slug','title','path','audio','cover','lyrics','duration_seconds','duration','previous','next','themes','relationships'],`music_catalog/${album.slug}`));
  unique(album.tracks,'track',`music_catalog/${album.slug}`); unique(album.tracks,'slug',`music_catalog/${album.slug}`);
});
experiments.forEach(record=>required(record,['id','slug','title','type','status','summary','structure','themes','relationships'],'experiments'));
motion.forEach(record=>required(record,['title','status','domain','summary','path'],'in-motion'));
timeline.forEach(record=>required(record,['id','period','title','type','status','description','path','relationships'],'timeline'));
content.entries.forEach(record=>required(record,['id','slug','title','collection','status','summary','themes','relationships','body','path'],'content_catalog'));
milestones.forEach(record=>required(record,['id','type','title','status','year','summary','themes','relationships'],'milestones'));
library.collections.forEach(record=>required(record,['slug','title','description','status'],'library'));

unique(context,'id','project_context'); unique(milestones,'id','milestones'); unique(repositories,'id','projects'); unique(music.albums,'id','music_catalog'); unique(content.entries,'id','content_catalog'); unique(graph.entities,'id','entities');
assert(site.navigation.some(item=>item.path==='/in-motion/'),'navigation: missing In Motion');
assert(repositories.every(repo=>!repo.fork&&!repo.archived),'projects: forks or archived repositories must be excluded');
for(let index=1;index<repositories.length;index+=1)assert(repositories[index-1].updated_at>=repositories[index].updated_at,'projects: repositories are not sorted by updated_at descending');
const entityIds=new Set(graph.entities.map(entity=>entity.id));
graph.edges.forEach(edge=>{assert(entityIds.has(edge.source),`entities: missing edge source ${edge.source}`);assert(entityIds.has(edge.target),`entities: missing edge target ${edge.target}`)});
search.records.forEach(record=>assert(entityIds.has(record.id),`search: unknown entity ${record.id}`));
const linkedRoutes=[...site.navigation.map(item=>item.path),'/contact/',...context.map(item=>item.path).filter(Boolean),...music.albums.map(item=>item.path),...music.albums.flatMap(album=>album.tracks.map(track=>track.path)),...content.entries.map(item=>item.path)];
for(const path of new Set(linkedRoutes))assert(existsSync(new URL(`../${routeFile(path)}`,import.meta.url)),`route: ${path} has no HTML entry point`);
if(errors.length){console.error(errors.map(error=>`- ${error}`).join('\n'));process.exit(1)}
const tracks=music.albums.reduce((total,album)=>total+album.track_count,0);
console.log(`Content audit passed: ${graph.entities.length} entities, ${graph.edges.length} relationships, ${content.entries.length} Markdown entries, ${music.albums.length} albums, ${tracks} tracks.`);

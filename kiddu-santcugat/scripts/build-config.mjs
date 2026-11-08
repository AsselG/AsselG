// Turns config/*.yaml into lib/generated/config.json so the hosted app never reads files at runtime.
import fs from 'node:fs';
import YAML from 'yaml';
const read = (f) => YAML.parse(fs.readFileSync(`config/${f}`, 'utf8'));
fs.mkdirSync('lib/generated', { recursive: true });
fs.writeFileSync('lib/generated/config.json', JSON.stringify({ site: read('site.yaml'), areas: read('areas.yaml').areas, sources: read('sources.yaml') }, null, 2));
console.log('config → lib/generated/config.json');

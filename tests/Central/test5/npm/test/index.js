import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
console.log(__dirname);
import Central from '../../../../../classes/Central';
Central.addNodeModule(__dirname);
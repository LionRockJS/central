import url from "node:url";
const dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
import Test from './classes/Test.mjs';
console.log('test1 index');
export default {
  dirname,
  Test
}
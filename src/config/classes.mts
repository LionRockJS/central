import {Central, CentralEnv} from '../index.js';
export default {
  cache : Central.ENV !== CentralEnv.DEVELOPMENT
};

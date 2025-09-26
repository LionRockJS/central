import Central from '../classes/Central.mjs';
export default {
  cache : Central.ENV !== Central.ENV_DEV,
  audit: false
};

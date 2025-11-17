import Central from '../dist/Central.mjs';
export default {
  cache : Central.ENV !== Central.ENV_DEV
};

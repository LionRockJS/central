export default {
  execute: async (Controller, request) => new Controller(request).execute(),
};

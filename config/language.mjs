export default {
  route: '/:language(mis|en|zh-hant|zh-hans)',
  default: 'mis',
  names: new Map([['mis', '-'], ['en', 'English'], ['zh-hans', '简体中文']]),
};

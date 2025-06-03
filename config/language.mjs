export default {
  route: '/:language(en|zh-hant|zh-hans)',
  default: 'en',
  names: new Map([['en', 'English'], ['zh-hant', '繁體中文'], ['zh-hans', '简体中文']]),
};

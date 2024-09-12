export default {
  route: '/:language(en|zh-hant|zh-hans)',
  default: 'en',
  names: new Map([['en', 'English'], ['zh-hans', '简体中文']]),
};

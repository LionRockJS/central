import {View} from '@lionrockjs/mvc';

export default class JSONView extends View {
  constructor(placeholder="main", data={}) {
    super(placeholder, data);
  }

  async render() {
    return JSON.stringify(this.data[this.file]);
  }
}
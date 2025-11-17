import {View} from '@lionrockjs/mvc';

export default class JSONView extends View {
  constructor(placeholder: string = "main", data: any = {}) {
    super(placeholder, data);
  }

  async render(): Promise<string>{
    return JSON.stringify(this.data[this.file]);
  }
}
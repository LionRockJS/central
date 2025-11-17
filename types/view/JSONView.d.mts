import { View } from '@lionrockjs/mvc';
export default class JSONView extends View {
    constructor(placeholder?: string, data?: any);
    render(): Promise<string>;
}

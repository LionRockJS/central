import { ControllerMixin } from '@lionrockjs/mvc';
import DatabaseAdapter from '../adapter/Database.mjs';
export default class ControllerMixinDatabase extends ControllerMixin {
    #private;
    static DATABASE_MAP: string;
    static DATABASE_ADAPTER: string;
    static DATABASES: string;
    static defaultAdapter: typeof DatabaseAdapter;
    static init(state: Map<string, any>): void;
    static setup(state: Map<string, any>): Promise<void>;
}

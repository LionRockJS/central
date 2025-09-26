import { Model } from '@lionrockjs/central';

export default class Access extends Model{
  access_type_id = null;
  user = null;
  ip = null;
  sql = null;
  value = null;
  result = null;

  static joinTablePrefix = 'access';
  static tableName = 'accesses';

  static fields = new Map([
    ["user", "String"],
    ["ip", "String"],
    ["sql", "String"],
    ["value", "String"],
    ["result", "String"]
  ]);
  static belongsTo = new Map([
    ["access_type_id", "AccessType"]
  ]);
}

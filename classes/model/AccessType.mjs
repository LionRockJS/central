import { Model } from '@lionrockjs/central';

export default class AccessType extends Model{
  name = null;

  static joinTablePrefix = 'access_type';
  static tableName = 'access_types';

  static fields = new Map([
    ["name", "String!"]
  ]);
  static hasMany = [
    ["access_type_id", "Access"]
  ];
}

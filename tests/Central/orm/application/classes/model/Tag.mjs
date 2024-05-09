import Model from '../../../../../../classes/Model.mjs';

export default class Tag extends Model{
  name;

  static joinTablePrefix = 'tag';
  static tableName = 'tags';

  static fields = new Map([
    ['name', 'String']
  ]);
}

import { describe, test } from "bun:test";
import HelperCache from "../../src/helper/central/Cache.mts";

describe('HelperCache Source', () => {
  test('instantiation', () => {
    new HelperCache();
  });
});

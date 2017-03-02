import { UNDEFINED_REFERENCE } from '../../references';
import { EMPTY_ARRAY, EMPTY_DICT } from '../../utils';
import { PathReference, Tag, combineTagged } from '@glimmer/reference';
import { Option, Dict, Opaque, assert, dict } from '@glimmer/util';

export class EvaluatedNamedArgs {
  static create(map: Dict<PathReference<Opaque>>) {
    let keys = Object.keys(map);
    let length = keys.length;

    if (length > 0) {
      let values: PathReference<Opaque>[] = new Array(length);

      for (let i=0; i<length; i++) {
        values[i] = map[keys[i]];
      }

      return new this(keys, values, map);
    } else {
      return EVALUATED_EMPTY_NAMED_ARGS;
    }
  }

  static empty(): EvaluatedNamedArgs {
    return EVALUATED_EMPTY_NAMED_ARGS;
  }

  public tag: Tag;
  public length: number;

  constructor(
    public keys: ReadonlyArray<string>,
    public values: ReadonlyArray<PathReference<Opaque>>,
    private _map: Option<Dict<PathReference<Opaque>>> = null
  ) {
    this.tag = combineTagged(values);
    this.length = keys.length;
    assert(keys.length === values.length, 'Keys and values do not have the same length');
  }

  get map(): Dict<PathReference<Opaque>> {
    let { _map: map } = this;

    if (map) {
      return map;
    }

    map = this._map = dict<PathReference<Opaque>>();

    let { keys, values, length } = this;

    for(let i=0; i<length; i++) {
      map[keys[i]] = values[i];
    }

    return map;
  }

  get(key: string): PathReference<Opaque> {
    let { keys, values } = this;
    let index = keys.indexOf(key);
    return (index === -1) ? UNDEFINED_REFERENCE : values[index];
  }

  has(key: string): boolean {
    return this.keys.indexOf(key) !== -1;
  }

  value(): Dict<Opaque> {
    let { keys, values } = this;

    let out = dict<Opaque>();

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let ref = values[i];
      out[key] = ref.value();
    }

    return out;
  }
}

export const EVALUATED_EMPTY_NAMED_ARGS: EvaluatedNamedArgs = new (class extends EvaluatedNamedArgs {
  constructor() {
    super(EMPTY_ARRAY, EMPTY_ARRAY, EMPTY_DICT);
  }

  get(): PathReference<Opaque> {
    return UNDEFINED_REFERENCE;
  }

  has(_key: string): boolean {
    return false;
  }

  value(): Dict<Opaque> {
    return EMPTY_DICT;
  }
});
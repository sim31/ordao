/**
 * Like Record but forces you to check if entry you're trying to access exists.
 * Alternative for noUcheckedIndexedAccess.
 */
export type SafeRecord<K extends keyof any, V> = Partial<Record<K, V>>;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function flattenObj1X(obj: any, flattenErrors?: boolean) {
  var result = Object.create(obj);
  for(var key in result) {
    Object.defineProperty(result, key, {
      value: obj[key],
      enumerable: true
    });
  }
  // 'message' and 'stack' properties are not enumerable in Error objects, but we want to keep them
  // and make sure they are included in the flattened object
  if (flattenErrors && 'message' in obj) {
    Object.defineProperty(result, 'message', {
      value: obj['message'],
      enumerable: true
    });
  }
  if (flattenErrors && 'stack' in obj) {
    Object.defineProperty(result, 'stack', {
      value: obj['stack'],
      enumerable: true
    });
  }
  if (flattenErrors && 'cause' in obj) {
    Object.defineProperty(result, 'cause', {
      value: obj['cause'],
      enumerable: true
    });
  }
  return result;
}

/**
 * https://stackoverflow.com/questions/8779249/how-to-stringify-inherited-objects-to-json
 * @param stringifyErrors stringifies errors fully, including non-enumerable properties - message, stack, cause
 * @returns 
 */
export const stringify = (obj: any, flatten?: boolean, stringifyErrors?: boolean) => JSON.stringify(
  obj,
  (_, v) => {
    if (typeof v === 'bigint') {
      return v.toString();
    } else if (typeof v === 'object' && v !== null && flatten) {
      return flattenObj1X(v, stringifyErrors)
    } else {
      return v;
    }
  },
  2
);

// Note that this handles only one level of inheritance (prototype chain)
export const flatStringify = (obj: any) => stringify(obj, true, true);

export const deleteUndefined = (obj: any) => Object.keys(obj).forEach(key => {
  if (typeof obj[key] === 'object') {
    deleteUndefined(obj[key]);
  } else if (obj[key] === undefined) {
    delete obj[key];
  }
});

export function withoutUndefined<T extends object>(obj: T): T {
  let newObj: any = {};
  const o: any = obj;
  Object.keys(obj).forEach((key) => {
    if (typeof o[key] === 'object' && o[key] !== null) {
      newObj[key] = withoutUndefined(o[key]);
    } else if (o[key] !== undefined) {
      newObj[key] = o[key];
    }
  });
  return newObj as T;
}

export function withoutProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K
): Omit<T, K> {
  const ret = {
    ...obj,
  }
  delete ret[key];
  return ret;
}

export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export const flattenObj = (obj: any, ignoreKeys: string[] = []) => {
  let result: any = {};

  for (const i in obj) {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i]) && !ignoreKeys.includes(i)) {
      const temp = flattenObj(obj[i]);
      for (const j in temp) {
        result[i + '.' + j] = temp[j];
      }
    } else {
      result[i] = obj[i];
    }
  }

  return result;
};

export { ErrorWithCause } from "./ErrorWithCause.js";

export * from "./version.js";
export function createIdGenerator(initial: number = 0) {
  let counter = initial;

  return () => {
    return ++counter;
  };
}

/**
 * Check object has property
 */
export function has(obj: Object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * return void func
 */
export function noop() {}

/**
 * Check value is plain object
 * @param maybeObject
 * @returns
 */
export function isPlainObject(maybeObject: any): boolean {
  return (
    typeof maybeObject === "object" &&
    maybeObject !== null &&
    !Array.isArray(maybeObject)
  );
}

type Unpacked<T> = T extends (infer U)[] ? U : T;
/**
 * Wrap non list value to List<value>
 * @param value
 * @returns
 */
export function toArray<T>(value: T): Unpacked<T>[] {
  // @ts-ignore
  return Array.isArray(value) ? value : [value];
}

export function createIdGenerator(initial: number = 0) {
  let counter = initial;

  return () => {
    return ++counter;
  };
}

export const counter = createIdGenerator();

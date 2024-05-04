type asyncFn<T extends any[] = [], U = void> = (...args: T) => Promise<U>;

export function requestHandlerCreator<T>(fn: asyncFn<[], T>): () => Promise<T> {
  let dataBuffer: Promise<T> | null;
  return function requestHandler(): Promise<T> {
    return (dataBuffer ??= new Promise<T>((fulfill, reject) =>
      fn()
        .then(fulfill, reject)
        .finally(() => (dataBuffer = null))
    ));
  };
}

export function queueManagerCreator<T extends any[], U>(fn: asyncFn<T, U>): asyncFn<T, U> {
  let it: AsyncGenerator<PromiseSettledResult<U>, never, T> = queue(fn);
  it.next();
  return async function queueManager(...args: T): Promise<U> {
    let res: PromiseSettledResult<U> = (await it.next(args)).value;
    if (res.status == "fulfilled") {
      return res.value;
    } else {
      throw res.reason;
    }
  };
}
async function* queue<T extends any[], U>(fn: asyncFn<T, U>): AsyncGenerator<PromiseSettledResult<U>, never, T> {
  let res: PromiseSettledResult<U>;
  while (true) {
    try {
      res = {status: "fulfilled", value: await fn(...(yield res!))};
    } catch (err) {
      res = {status: "rejected", reason: err};
    }
  }
}

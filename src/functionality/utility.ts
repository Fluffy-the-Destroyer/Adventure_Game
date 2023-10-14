type AsyncFunc<argTypes extends any[], returnType> = (
	...args: argTypes
) => Promise<returnType>;

export function requestHandlerCreator<returnType>(
	fn: () => Promise<returnType>
): () => Promise<returnType> {
	var requestInProgress: boolean = false;
	var dataBuffer: Promise<returnType>;
	return function requestHandler(): Promise<returnType> {
		if (!requestInProgress) {
			requestInProgress = true;
			dataBuffer = new Promise<returnType>((resolve, reject): void => {
				fn()
					.then(resolve, reject)
					.finally(() => void (requestInProgress = false));
			});
		}
		return dataBuffer;
	};
}

export function queueManagerCreator<argTypes extends any[], returnType>(
	fn: AsyncFunc<argTypes, returnType>
): AsyncFunc<argTypes, returnType> {
	var counter: number = 0;
	var dataBuffer: Promise<returnType>;
	return function queueManager(...args: argTypes): Promise<returnType> {
		var ticket: number = counter++;
		if (counter == 1) {
			dataBuffer = fn(...args);
		}
		return new Promise<returnType>((resolve, reject): void => {
			(function queue(): void {
				dataBuffer.then(
					(value): void => {
						switch (ticket--) {
							case 0:
								counter--;
								resolve(value);
								break;
							case 1:
								dataBuffer = fn(...args);
							default:
								setTimeout(queue);
						}
					},
					(reason): void => {
						switch (ticket--) {
							case 0:
								counter--;
								reject(reason);
								break;
							case 1:
								dataBuffer = fn(...args);
							default:
								setTimeout(queue);
						}
					}
				);
			})();
		});
	};
}

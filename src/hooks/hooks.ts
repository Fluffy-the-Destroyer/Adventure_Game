import {useEffect, useState} from "react";

/**Takes an iterator for a generator function, provides it with a function to advance itself, then returns the returned JSX
 * @param generator - The iterator, should yield and return JSX or null, and should not expect any parameters in next calls, however, it should expect one next call at the beginning to provide it with a function to advance it
 * @returns JSX (or null) held in state
 */
export function useGenerator(
	generator: Generator<
		React.JSX.Element,
		React.JSX.Element | null,
		void | (() => void)
	>
): React.JSX.Element | null {
	const [iterator] =
		useState<
			Generator<
				React.JSX.Element,
				React.JSX.Element | null,
				void | (() => void)
			>
		>(generator);
	const [displayBuffer, setDisplayBuffer] =
		useState<React.JSX.Element | null>(null);
	useEffect((): (() => void) => {
		iterator.next();
		setDisplayBuffer(
			iterator.next((): void => {
				setDisplayBuffer(iterator.next().value);
			}).value
		);
		return (): void => {
			iterator.return(null);
		};
	}, [iterator, setDisplayBuffer]);
	return displayBuffer;
}

import {useEffect, useState} from "react";

/**Takes an iterator for a generator function, provides it with a function to advance itself, then returns the returned JSX
 * @param generator - The iterator, should yield and return JSX or null, and should not expect any parameters in next calls, however, it should expect one next call at the beginning to provide it with a function to advance it
 * @returns JSX (or null) held in state
 */
export function useGenerator(
  generator: Generator<React.ReactNode, React.ReactNode, void | (() => void)>
): React.ReactNode {
  const [iterator] = useState<Generator<React.ReactNode, React.ReactNode, void | (() => void)>>(generator);
  const [displayBuffer, setDisplayBuffer] = useState<React.ReactNode>(null);
  useEffect(
    function (): () => void {
      iterator.next();
      setDisplayBuffer(iterator.next(() => setDisplayBuffer(iterator.next().value)).value);
      return () => iterator.return(null);
    },
    [iterator, setDisplayBuffer]
  );
  return displayBuffer;
}

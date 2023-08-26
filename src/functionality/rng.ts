/**Returns a random floating point number between given values
 * @param min - minimum value, this is allowed
 * @param max - maximum value, this is not allowed
 */
export function randomFloat(min: number, max: number): number {
	if (max < min) {
		return randomFloat(max, min);
	}
	return Math.random() * (max - min) + min;
}
/**Returns a random integer between given values
 * @param min - minimum value, this is allowed
 * @param max - maximum value, this is not allowed
 */
export function randomInt(min: number, max: number): number {
	return Math.floor(randomFloat(min, max));
}

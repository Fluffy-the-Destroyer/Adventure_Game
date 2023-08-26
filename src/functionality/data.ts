import {randomFloat, randomInt} from "./rng";

export const errorMessages: string[] = [];

export class itemKey {
	private static value: number = 0;
	static gen(): number {
		this.value++;
		//console.log(`keygen: ${this.value}`);
		return this.value;
	}
}
/**For holding a choice of action */
export interface actionChoice {
	/**0 is nothing, 1 is weapon, 2 is spell, 3 is dual weapons */
	actionType: 0 | 1 | 2 | 3;
	/**Slot of 1st chosen item */
	slot1?: number;
	/**Slot of 2nd weapon, if dual wielding */
	slot2?: number;
}

export function numFromString(input: string): {value: number; output: string} {
	input = input.split(" ").join("");
	if (input.length == 0) {
		return {value: 0, output: input};
	}
	let value: number = 0,
		minus: boolean = false;
	if (input[0] == "-") {
		minus = true;
		input = input.slice(1);
	}
	if (input.slice(0, 4) == "rng(") {
		input = input.slice(4);
		let value2: number;
		({value: value, output: input} = numFromString(input));
		if (input[0] != ",") {
			return {value: 0, output: input};
		}
		input = input.slice(1);
		({value: value2, output: input} = numFromString(input));
		if (input[0] != ")") {
			return {value: 0, output: input};
		}
		input = input.slice(1);
		value = randomInt(value, value2);
		if (minus) {
			value *= -1;
		}
		return {value: value, output: input};
	}
	while (!Number.isNaN(parseInt(input[0]))) {
		value *= 10;
		value += parseInt(input[0]);
		input = input.slice(1);
	}
	if (minus) {
		value *= -1;
	}
	return {value: value, output: input};
}

export function floatFromString(input: string): {
	value: number;
	output: string;
} {
	input = input.split(" ").join("");
	if (input.length == 0) {
		return {value: 0, output: input};
	}
	let value: number = 0,
		minus: boolean = false;
	if (input[0] == "-") {
		minus = true;
		input = input.slice(1);
	}
	if (input.slice(0, 4) == "rng(") {
		input = input.slice(4);
		let value2: number;
		({value: value, output: input} = floatFromString(input));
		if (input[0] != ",") {
			return {value: 0, output: input};
		}
		input = input.slice(1);
		({value: value2, output: input} = floatFromString(input));
		if (input[0] != ")") {
			return {value: 0, output: input};
		}
		input = input.slice(1);
		value = randomFloat(value, value2);
		if (minus) {
			value *= -1;
		}
		return {value: value, output: input};
	}
	while (!Number.isNaN(parseInt(input[0]))) {
		value *= 10;
		value += parseInt(input[0]);
		input = input.slice(1);
	}
	if (input[0] != ".") {
		if (minus) {
			value *= -1;
		}
		return {value: value, output: input};
	}
	input = input.slice(1);
	let dp: number = 0;
	while (!Number.isNaN(parseInt(input[0]))) {
		value *= 10;
		value += parseInt(input[0]);
		input = input.slice(1);
		dp++;
	}
	for (let i: number = 0; i < dp; i++) {
		value /= 10;
	}
	if (minus) {
		value *= -1;
	}
	return {value: value, output: input};
}

export function deepCopy<Type = number | boolean | string | bigint>(
	arr: Type[]
): Type[] {
	let newArr: Type[] = [];
	let count: number = arr.length;
	for (let i: number = 0; i < count; i++) {
		newArr.push(arr[i]);
	}
	return newArr;
}

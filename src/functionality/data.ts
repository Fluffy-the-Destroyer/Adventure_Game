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
interface noAction {
	/**0 is no action, 1 is a weapon, 2 is a spell, 3 is dual weapons */
	actionType: 0;
}
interface weaponAction {
	/**0 is no action, 1 is a weapon, 2 is a spell, 3 is dual weapons */
	actionType: 1;
	/**Slot of selected weapon */
	slot1: number;
}
interface dualWeaponAction {
	/**0 is no action, 1 is a weapon, 2 is a spell, 3 is dual weapons */
	actionType: 3;
	/**Slot of first selected weapon */
	slot1: number;
	/**Slot of second weapon */
	slot2: number;
}
interface spellAction {
	/**0 is no action, 1 is a weapon, 2 is a spell, 3 is dual weapons */
	actionType: 2;
	/**Slot of selected spell */
	slot1: number;
}
/**Holds a choice of action */
export type actionChoice =
	| noAction
	| weaponAction
	| dualWeaponAction
	| spellAction;

export function numFromString(input: string): {value: number; output: string} {
	input = input.split(" ").join("");
	if (input.length == 0) {
		return {value: 0, output: input};
	}
	var value: number = 0,
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
	var value: number = 0,
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
	var dp: number = 0;
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

//export function deepCopy<Type = number | boolean | string | bigint>(
//	arr: Type[]
//): Type[] {
//	let newArr: Type[] = [];
//	let count: number = arr.length;
//	for (let i: number = 0; i < count; i++) {
//		newArr.push(arr[i]);
//	}
//	return newArr;
//}

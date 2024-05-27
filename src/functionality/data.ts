import { player } from "./player";
import { randomFloat, randomInt } from "./rng";
import { variables } from "./variables";

export const errorMessages: string[] = [];

let key: number = 0;
export function itemKeyGen(): number {
  return ++key;
}

export function numFromString(input: string, vars?: variables): { value: number; output: string } {
  input = input.trimStart();
  if (input.length == 0) {
    return { value: 0, output: input };
  }
  let value: number = 0;
  let minus: boolean = false;
  if (input[0] == "-") {
    minus = true;
    input = input.slice(1);
  }
  if (input.slice(0, 4) == "rng(") {
    input = input.slice(4).trimStart();
    let value2: number;
    ({ value, output: input } = numFromString(input, vars));
    input = input.trimStart();
    if (input[0] != ",") {
      return { value: 0, output: input };
    }
    input = input.slice(1).trimStart();
    ({ value: value2, output: input } = numFromString(input, vars));
    input = input.trimStart();
    if (input[0] != ")") {
      return { value: 0, output: input };
    }
    input = input.slice(1);
    value = randomInt(value, value2);
    if (minus) {
      value *= -1;
    }
    return { value, output: input };
  }
  if (input.slice(0, 2) == "v_") {
    if (vars == undefined) {
      return { value: 0, output: input };
    }
    input = input.slice(2);
    let endIndex: number = input.indexOf("_");
    if (endIndex == -1) {
      return { value: 0, output: input };
    }
    value = Math.trunc(vars.vars[input.slice(0, endIndex)] ?? 0);
    if (minus) {
      value *= -1;
    }
    return { value, output: input.slice(endIndex + 1) };
  }
  while (!Number.isNaN(parseInt(input[0]))) {
    value *= 10;
    value += parseInt(input[0]);
    input = input.slice(1);
  }
  if (minus) {
    value *= -1;
  }
  return { value, output: input };
}

export function floatFromString(
  input: string,
  vars?: variables,
  playerCharacter?: player
): { value: number; output: string } {
  input = input.trimStart();
  if (input.length == 0) {
    return { value: 0, output: input };
  }
  let value: number = 0;
  let minus: boolean = false;
  if (input[0] == "-") {
    minus = true;
    input = input.slice(1);
  }
  if (input.slice(0, 4) == "rng(") {
    input = input.slice(4).trimStart();
    let value2: number;
    ({ value, output: input } = floatFromString(input));
    input = input.trimStart();
    if (input[0] != ",") {
      return { value: 0, output: input };
    }
    input = input.slice(1).trimStart();
    ({ value: value2, output: input } = floatFromString(input));
    input = input.trimStart();
    if (input[0] != ")") {
      return { value: 0, output: input };
    }
    input = input.slice(1);
    value = randomFloat(value, value2);
    if (minus) {
      value *= -1;
    }
    return { value, output: input };
  }
  if (input.slice(0, 2) == "v_") {
    if (vars == undefined) {
      return { value: 0, output: input };
    }
    input = input.slice(2);
    let endIndex: number = input.indexOf("_");
    if (endIndex == -1) {
      return { value: 0, output: input };
    }
    value = vars.vars[input.slice(0, endIndex)] ?? 0;
    if (minus) {
      value *= -1;
    }
    return { value, output: input.slice(endIndex + 1) };
  }
  if (input.slice(0, 2) == "p_") {
    if (playerCharacter == undefined) {
      return { value: 0, output: input };
    }
    input = input.slice(2);
    if (input.slice(0, 6) == "health") {
      input = input.slice(6);
      value = playerCharacter.getHealth();
    } else if (input.slice(0, 9) == "maxHealth") {
      input = input.slice(9);
      value = playerCharacter.getMaxHealth();
    } else if (input.slice(0, 11) == "projectiles") {
      input = input.slice(0, 11);
      value = playerCharacter.getProjectiles();
    } else if (input.slice(0, 4) == "mana") {
      input = input.slice(4);
      value = playerCharacter.getMana();
    } else if (input.slice(0, 7) == "maxMana") {
      input = input.slice(7);
      value = playerCharacter.getMaxMana();
    } else if (input.slice(0, 13) == "turnManaRegen") {
      input = input.slice(13);
      value = playerCharacter.getTurnManaRegen();
    } else if (input.slice(0, 15) == "battleManaRegen") {
      input = input.slice(15);
      value = playerCharacter.getBattleManaRegen();
    } else if (input.slice(0, 12) == "poisonResist") {
      input = input.slice(12);
      value = playerCharacter.getPoisonResist();
    } else if (input.slice(0, 11) == "bleedResist") {
      input = input.slice(11);
      value = playerCharacter.getBleedResist();
    } else if (input.slice(0, 9) == "turnRegen") {
      input = input.slice(9);
      value = playerCharacter.getTurnRegen();
    } else if (input.slice(0, 11) == "battleRegen") {
      input = input.slice(11);
      value = playerCharacter.getBattleRegen();
    } else if (input.slice(0, 11) == "weaponSlots") {
      input = input.slice(11);
      value = playerCharacter.getWeaponSlots();
    } else if (input.slice(0, 10) == "spellSlots") {
      input = input.slice(10);
      value = playerCharacter.getSpellSlots();
    } else if (input.slice(0, 10) == "flatArmour") {
      input = input.slice(10);
      value = playerCharacter.getFlatArmour();
    } else if (input.slice(0, 15) == "flatMagicArmour") {
      input = input.slice(15);
      value = playerCharacter.getFlatMagicArmour();
    } else if (input.slice(0, 10) == "propArmour") {
      input = input.slice(10);
      value = playerCharacter.getPropArmour();
    } else if (input.slice(0, 15) == "propMagicArmour") {
      input = input.slice(15);
      value = playerCharacter.getPropMagicArmour();
    } else if (input.slice(0, 18) == "flatDamageModifier") {
      input = input.slice(18);
      value = playerCharacter.getFlatDamageModifier();
    } else if (input.slice(0, 18) == "propDamageModifier") {
      input = input.slice(18);
      value = playerCharacter.getPropDamageModifier();
    } else if (input.slice(0, 23) == "flatMagicDamageModifier") {
      input = input.slice(23);
      value = playerCharacter.getFlatMagicDamageModifier();
    } else if (input.slice(0, 23) == "propMagicDamageModifier") {
      input = input.slice(23);
      value = playerCharacter.getPropMagicDamageModifier();
    } else if (input.slice(0, 32) == "flatArmourPiercingDamageModifier") {
      input = input.slice(32);
      value = playerCharacter.getFlatArmourPiercingDamageModifier();
    } else if (input.slice(0, 32) == "propArmourPiercingDamageModifier") {
      input = input.slice(32);
      value = playerCharacter.getPropArmourPiercingDamageModifier();
    } else if (input.slice(0, 11) == "evadeChance") {
      input = input.slice(11);
      value = playerCharacter.getEvadeChance();
    } else if (input.slice(0, 19) == "counterAttackChance") {
      input = input.slice(19);
      value = playerCharacter.getCounterAttackChance();
    } else if (input.slice(0, 12) == "bonusActions") {
      input = input.slice(12);
      value = playerCharacter.getBonusActions();
    } else if (input.slice(0, 10) == "initiative") {
      input = input.slice(10);
      value = playerCharacter.getInitiative();
    } else if (input.slice(0, 2) == "xp") {
      input = input.slice(2);
      value = playerCharacter.getXp();
    } else if (input.slice(0, 5) == "maxXp") {
      input = input.slice(5);
      value = playerCharacter.getMaxXp();
    } else if (input.slice(0, 5) == "level") {
      input = input.slice(5);
      value = playerCharacter.getLevel();
    }
    if (minus) {
      value *= -1;
    }
    return { value, output: input };
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
    return { value, output: input };
  }
  input = input.slice(1);
  let dp: number = 0;
  while (!Number.isNaN(parseInt(input[0]))) {
    value *= 10;
    value += parseInt(input[0]);
    input = input.slice(1);
    dp++;
  }
  for (let i = 0; i < dp; i++) {
    value /= 10;
  }
  if (minus) {
    value *= -1;
  }
  return { value: value, output: input };
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

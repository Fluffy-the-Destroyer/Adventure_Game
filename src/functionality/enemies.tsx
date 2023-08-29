import {weapon} from "./weapons";
import {spell} from "./spells";
import {
	POISON_MULTIPLIER,
	BLEED_MULTIPLIER,
	REGEN_MULTIPLIER
} from "../components/battle";
import {randomFloat, randomInt} from "./rng";
import enemyData from "../data/enemies.json";
import {
	actionChoice,
	errorMessages,
	floatFromString,
	numFromString
} from "./data";
export const AI_TYPES_NO = 7;
export const AI_HEALING_THRESHOLD = 0.8;
export const ENEMY_OVERHEAL_DECAY = 5;
export const ENEMY_MANA_DECAY = 5;

//Enemy AI types:
// All weapons are considered attacking, also enemies will always use specified initial spell (as long as they can afford it, and even if it kills them)
// 0: Does nothing, should not happen
// Types which use weapons and spells
// 1: Aggressive, rarely heals, attacks 75% of the time
// 2: Balanced, sometimes heals, attacks half the time
// 3: Defensive, heals more often, attacks 25% of the time
// Mage classes, will only use weapons if they have no available spells, or if all available spells would kill them, if all available actions would kill them, prefers spells
// 4: Aggressive
// 5: Balanced
// 6: Defensive
//
// 7: Berserker, never casts spells

export class enemy {
	private real: boolean = false;
	private name: string | undefined;
	private introduction: string | undefined;
	private health: number = 0;
	private maxHealth: number = 50;
	private projectiles: number = 10;
	private mana: number = 0;
	private maxMana: number = 50;
	private turnManaRegen: number = 5;
	private poison: number = 0;
	private poisonResist: number = 0.1;
	private bleed: number = 0;
	private bleedResist: number = 0.1;
	private tempRegen: number = 0;
	private turnRegen: number = 0;
	private weapons: weapon[] = [];
	private spells: spell[] = [];
	private initialSpell: number = -1;
	private deathSpell: spell | undefined;
	private flatArmour: number = 0;
	private propArmour: number = 0;
	private flatMagicArmour: number = 0;
	private propMagicArmour: number = 0;
	private flatDamageModifier: number = 0;
	private propDamageModifier: number = 0;
	private flatMagicDamageModifier: number = 0;
	private propMagicDamageModifier: number = 0;
	private flatArmourPiercingDamageModifier: number = 0;
	private propArmourPiercingDamageModifier: number = 0;
	private evadeChance: number = 0.1;
	private counterAttackChance: number = 0.1;
	private bonusActions: number = 1;
	private currentBonusActions: number = 0;
	private AIType: number = 2;
	private noCounterWeapons: string[] = [];
	private noCounterSpells: string[] = [];
	private initiative: number = 10;
	private xp: number | undefined;
	getReal(): boolean {
		return this.real;
	}
	getName(): string {
		return this.name ?? "";
	}
	getIntroduction(): string {
		return this.introduction ?? "";
	}
	getHealth(): number {
		return this.health;
	}
	getMaxHealth(): number {
		return this.maxHealth;
	}
	getProjectiles(): number {
		return this.projectiles;
	}
	getMana(): number {
		return this.mana;
	}
	getMaxMana(): number {
		return this.maxMana;
	}
	getTurnManaRegen(): number {
		return this.turnManaRegen;
	}
	getPoison(): number {
		return this.poison;
	}
	getPoisonResist(): number {
		return this.poisonResist;
	}
	getBleed(): number {
		return this.bleed;
	}
	getBleedResist(): number {
		return this.bleedResist;
	}
	getTempRegen(): number {
		return this.tempRegen;
	}
	getWeapon(i: number): weapon {
		if (i >= this.weapons.length || i < 0) {
			throw 6;
		}
		return this.weapons[i];
	}
	getSpell(i: number): spell {
		if (i >= this.spells.length) {
			throw 6;
		}
		return this.spells[i];
	}
	getInitialSpell(): number {
		return this.initialSpell;
	}
	getDeathSpell(): spell | undefined {
		return this.deathSpell;
	}
	getFlatArmour(): number {
		return this.flatArmour;
	}
	getPropArmour(): number {
		return this.propArmour;
	}
	getFlatMagicArmour(): number {
		return this.flatMagicArmour;
	}
	getPropMagicArmour(): number {
		return this.propMagicArmour;
	}
	getFlatDamageModifier(): number {
		return this.flatDamageModifier;
	}
	getPropDamageModifier(): number {
		return this.propDamageModifier;
	}
	getFlatMagicDamageModifier(): number {
		return this.flatMagicDamageModifier;
	}
	getPropMagicDamageModifier(): number {
		return this.propMagicDamageModifier;
	}
	getFlatArmourPiercingDamageModifier(): number {
		return this.flatArmourPiercingDamageModifier;
	}
	getPropArmourPiercingDamageModifier(): number {
		return this.propArmourPiercingDamageModifier;
	}
	getEvadeChance(): number {
		return this.evadeChance;
	}
	getCounterAttackChance(): number {
		return this.counterAttackChance;
	}
	getBonusActions(): number {
		return this.bonusActions;
	}
	getCurrentBonusActions(): number {
		return this.currentBonusActions;
	}
	getAIType(): number {
		return this.AIType;
	}
	getInitiative(): number {
		return this.initiative;
	}
	getXp(): number {
		return this.xp ?? 0;
	}
	removeAllHealth(): void {
		this.health = 0;
	}
	/**Deals flat damage, applies armour
	 * @param p - physical damage
	 * @param m - magic damage, defaults to 0
	 * @param a - armour piercing damage, defaults to 0
	 * @param overHeal - if true, allows overhealing, defaults to false
	 * @returns actual health loss
	 */
	flatDamage(
		p: number,
		m: number = 0,
		a: number = 0,
		overHeal: boolean = false
	): number {
		if (p > 0) {
			p = Math.max(0, p - this.flatArmour);
			p = Math.trunc(p * (1 + this.propArmour));
		}
		if (m > 0) {
			m = Math.max(0, m - this.flatMagicArmour);
			m = Math.trunc(m * (1 + this.propMagicArmour));
		}
		let totDamage: number = p + m + a;
		if (totDamage > 0) {
			this.health -= totDamage;
			return totDamage;
		} else if (totDamage < 0) {
			if (overHeal) {
				this.health -= totDamage;
				return totDamage;
			} else {
				if (this.health >= this.maxHealth) {
					return 0;
				}
				if (this.health - totDamage > this.maxHealth) {
					totDamage = this.health - this.maxHealth;
					this.health = this.maxHealth;
					return totDamage;
				}
				this.health -= totDamage;
				return totDamage;
			}
		}
		return 0;
	}
	/**Deals proportional damage
	 * @param d - damage
	 */
	propDamage(d: number): void {
		if (d > 0) {
			d = Math.min(d, 1);
			this.health = Math.trunc(this.health * (1 - d));
		} else if (d < 0) {
			d = Math.max(d, -1);
			if (this.health + this.maxHealth * -d >= this.maxHealth) {
				this.health = this.maxHealth;
			} else {
				this.health += Math.trunc(this.maxHealth * -d);
			}
		}
	}
	/**Modifies health directly, cannot overheal
	 * @param h - health change
	 */
	modifyHealth(h: number): void {
		if (h > 0) {
			if (this.health >= this.maxHealth) {
				return;
			}
			if (this.health + h > this.maxHealth) {
				this.health = this.maxHealth;
			} else {
				this.health += h;
			}
		} else if (h < 0) {
			this.health += h;
		}
	}
	/**Modifies max health, if increasing, heals
	 * @param m - max health change
	 */
	modifyMaxHealth(m: number): void {
		this.maxHealth += m;
	}
	/**Modifies projectile count
	 * @param p - change in projectile count
	 */
	modifyProjectiles(p: number): void {
		if (p > 0) {
			this.projectiles += p;
		} else if (p < 0) {
			this.projectiles = Math.max(0, this.projectiles + p);
		}
	}
	/**Modifies mana
	 * @param m - mana change
	 * @param overCharge - if true, allows mana to go past max, defaults to false
	 */
	modifyMana(m: number, overCharge: boolean = false): void {
		if (m > 0) {
			if (this.mana + m > this.maxMana) {
				if (overCharge) {
					this.mana += m;
				} else {
					this.mana = this.maxMana;
				}
			} else {
				this.mana += m;
			}
		} else if (m < 0) {
			this.mana = Math.max(0, this.mana + m);
		}
	}
	/**Modifies max mana
	 * @param m - max mana change
	 */
	modifyMaxMana(m: number): void {
		this.maxMana += m;
	}
	/**Modifies turnManaRegen
	 * @param m - turnManaRegen change
	 */
	modifyTurnManaRegen(m: number): void {
		this.turnManaRegen += m;
	}
	/**Modifies poison level by specified amount
	 * @param p - amount to modify poison by
	 * @param resist - whether the poison can be resisted, defaults to true
	 * @returns false if it was resisted, true otherwise
	 */
	modifyPoison(p: number, resist: boolean = true): boolean {
		if (p > 0) {
			if (resist) {
				if (Math.random() < this.poisonResist) {
					return false;
				}
			}
			this.poison = Math.min(255, this.poison + p);
		} else if (p < 0) {
			this.poison = Math.max(0, this.poison + p);
		}
		return true;
	}
	/**Modifies bleed
	 * @param b - change in bleed
	 * @param resist - whether it can be resisted, defaults to true
	 * @returns false if it was resisted, true otherwise
	 */
	modifyBleed(b: number, resist: boolean = true): boolean {
		if (b > 0) {
			if (resist) {
				if (Math.random() < this.bleedResist) {
					return false;
				}
			}
			this.bleed = Math.min(255, this.bleed + b);
		} else if (b < 0) {
			this.bleed = Math.max(0, this.bleed + b);
		}
		return true;
	}
	modifyTempRegen(r: number): void {
		if (r > 0) {
			this.tempRegen = Math.min(255, this.tempRegen + r);
		} else if (r < 0) {
			this.tempRegen = Math.max(0, this.tempRegen + r);
		}
	}
	modifyTurnRegen(c: number): void {
		this.turnRegen += c;
	}
	modifyFlatArmour(f: number): void {
		this.flatArmour += f;
	}
	/**Modifies prop armour
	 * @param p - prop armour change
	 */
	modifyPropArmour(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.propArmour = (this.propArmour + 1) * (p + 1) - 1;
	}
	/**Modifies flat magic armour
	 * @param f - flat magic armour change
	 */
	modifyFlatMagicArmour(f: number): void {
		this.flatMagicArmour += f;
	}
	/**Modifies prop magic armour
	 * @param p - prop magic armour change
	 */
	modifyPropMagicArmour(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.propMagicArmour = (this.propMagicArmour + 1) * (p + 1) - 1;
	}
	/**Modifies flat damage modifier
	 * @param f - change in modifier
	 */
	modifyFlatDamageModifier(f: number): void {
		this.flatDamageModifier += f;
	}
	/**Modifies prop damage modifier
	 * @param p - change in modifier
	 */
	modifyPropDamageModifier(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.propDamageModifier = (this.propDamageModifier + 1) * (p + 1) - 1;
	}
	/**Modifier flat magic damage modifier
	 * @param f - change in modifier
	 */
	modifyFlatMagicDamageModifier(f: number): void {
		this.flatMagicDamageModifier += f;
	}
	/**Modifier prop magic damage modifier
	 * @param p - change in modifier
	 */
	modifyPropMagicDamageModifier(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.propMagicDamageModifier =
			(this.propMagicDamageModifier + 1) * (p + 1) - 1;
	}
	/**Modifies flat ap damage modifier
	 * @param f - change in modifier
	 */
	modifyFlatArmourPiercingDamageModifier(f: number): void {
		this.flatArmourPiercingDamageModifier += f;
	}
	/**Modifier prop ap damage modifier
	 * @param p - change in modifier
	 */
	modifyPropArmourPiercingDamageModifier(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.propArmourPiercingDamageModifier =
			(this.propArmourPiercingDamageModifier + 1) * (p + 1) - 1;
	}
	/**Modifies evade chance
	 * @param e - change in evade chance
	 */
	modifyEvadeChance(e: number): void {
		if (e < -1) {
			e = -1;
		}
		this.evadeChance *= e + 1;
	}
	/**Modifies poison resist
	 * @param p - change in poison resist
	 */
	modifyPoisonResist(p: number): void {
		if (p < -1) {
			p = -1;
		}
		this.poisonResist *= p + 1;
	}
	/**Modifies bleed resist
	 * @param b - change in bleed resist
	 */
	modifyBleedResist(b: number): void {
		if (b < -1) {
			b = -1;
		}
		this.bleedResist *= b + 1;
	}
	/**Modifies counter attack chance
	 * @param c - change in counter attack chance
	 */
	modifyCounterAttackChance(c: number): void {
		if (c < -1) {
			c = -1;
		}
		this.counterAttackChance *= c + 1;
	}
	/**Modifies bonus actions
	 * @param b - change in bonus actions
	 */
	modifyBonusActions(b: number): void {
		if (b > 255) {
			this.bonusActions = 127;
		} else if (b < -255) {
			this.bonusActions = -127;
		} else if (this.bonusActions + b > 127) {
			this.bonusActions = 127;
		} else if (this.bonusActions + b < -127) {
			this.bonusActions = -127;
		} else {
			this.bonusActions += b;
		}
	}
	resetBonusActions(): void {
		if (this.bonusActions < 0) {
			this.currentBonusActions = 0;
		} else {
			this.currentBonusActions = this.bonusActions;
		}
	}
	decBonusActions(): void {
		if (this.currentBonusActions > 0) {
			this.currentBonusActions--;
		}
	} /**Start of turn, decrements cooldowns, applies and then decrements dot/regen */
	turnStart(): void {
		this.modifyHealth(
			-(POISON_MULTIPLIER * this.poison + BLEED_MULTIPLIER * this.bleed)
		);
		this.modifyHealth(this.turnRegen + REGEN_MULTIPLIER * this.tempRegen);
		if (this.health > this.maxHealth) {
			this.health = Math.max(
				this.maxHealth,
				this.health - ENEMY_OVERHEAL_DECAY
			);
		}
		this.modifyMana(this.turnManaRegen);
		if (this.mana > this.maxMana) {
			this.mana = Math.max(this.maxMana, this.mana - ENEMY_MANA_DECAY);
		}
		if (this.poison > 0) {
			this.poison--;
		}
		if (this.bleed > 0) {
			this.bleed--;
		}
		if (this.tempRegen > 0) {
			this.tempRegen--;
		}
		{
			let length: number = this.spells.length;
			for (let i: number = 0; i < length; i++) {
				this.spells[i].decCooldown();
			}
		}
		if (this.bonusActions < 0) {
			this.currentBonusActions = 0;
		} else {
			this.currentBonusActions = this.bonusActions;
		}
	}
	rollInitiative(): number {
		return randomInt(0, Math.max(0, this.initiative));
	}
	constructor(blueprint: string | enemy = "EMPTY") {
		if (typeof blueprint == "string") {
			this.loadFromFile(blueprint);
		} else {
			this.real = blueprint.real;
			if (this.real) {
				let counter: number;
				this.name = blueprint.name;
				this.introduction = blueprint.introduction;
				this.health = blueprint.health;
				this.maxHealth = blueprint.maxHealth;
				this.projectiles = blueprint.projectiles;
				this.mana = blueprint.mana;
				this.maxMana = blueprint.maxMana;
				this.turnManaRegen = blueprint.turnManaRegen;
				this.poison = blueprint.poison;
				this.poisonResist = blueprint.poisonResist;
				this.bleed = blueprint.bleed;
				this.bleedResist = blueprint.bleedResist;
				counter = blueprint.weapons.length;
				for (let i: number = 0; i < counter; i++) {
					this.weapons.push(new weapon(blueprint.weapons[i]));
				}
				counter = blueprint.spells.length;
				for (let i: number = 0; i < counter; i++) {
					this.spells.push(new spell(blueprint.spells[i]));
				}
				this.initialSpell = blueprint.initialSpell;
				this.deathSpell = blueprint.deathSpell
					? new spell(blueprint.deathSpell)
					: undefined;
				this.flatArmour = blueprint.flatArmour;
				this.propArmour = blueprint.propArmour;
				this.flatMagicArmour = blueprint.flatMagicArmour;
				this.propMagicArmour = blueprint.propMagicArmour;
				this.flatDamageModifier = blueprint.flatDamageModifier;
				this.propDamageModifier = blueprint.propDamageModifier;
				this.flatMagicDamageModifier =
					blueprint.flatMagicDamageModifier;
				this.propMagicDamageModifier =
					blueprint.propMagicDamageModifier;
				this.flatArmourPiercingDamageModifier =
					blueprint.flatArmourPiercingDamageModifier;
				this.propArmourPiercingDamageModifier =
					blueprint.propArmourPiercingDamageModifier;
				this.evadeChance = blueprint.evadeChance;
				this.counterAttackChance = blueprint.counterAttackChance;
				this.bonusActions = blueprint.bonusActions;
				this.currentBonusActions = blueprint.currentBonusActions;
				this.AIType = blueprint.AIType;
				counter = blueprint.noCounterWeapons.length;
				for (let i: number = 0; i < counter; i++) {
					this.noCounterWeapons.push(blueprint.noCounterWeapons[i]);
				}
				counter = blueprint.noCounterSpells.length;
				for (let i: number = 0; i < counter; i++) {
					this.noCounterSpells.push(blueprint.noCounterSpells[i]);
				}
				this.initiative = blueprint.initiative;
				this.xp = blueprint.xp;
			}
		}
	}
	loadFromFile(blueprint: string = "EMPTY"): void {
		this.real = false;
		this.name = this.introduction = this.deathSpell = this.xp = undefined;
		this.weapons.length =
			this.spells.length =
			this.noCounterWeapons.length =
			this.noCounterSpells.length =
				0;
		if (blueprint == "EMPTY") {
			return;
		}
		try {
			//@ts-expect-error
			let selectedEnemy = enemyData[blueprint];
			if (selectedEnemy == undefined) {
				throw 1;
			}
			for (let i: number = 0; Array.isArray(selectedEnemy); i++) {
				if (i == 10) {
					throw 9;
				}
				if (selectedEnemy.length == 0) {
					throw 5;
				}
				blueprint = selectedEnemy[randomInt(0, selectedEnemy.length)];
				if (blueprint == "EMPTY") {
					return;
				} else if (typeof blueprint != "string") {
					throw 1;
				}
				//@ts-expect-error
				selectedEnemy = enemyData[blueprint];
				if (selectedEnemy == undefined) {
					throw 1;
				}
			}
			this.poison =
				this.bleed =
				this.tempRegen =
				this.turnRegen =
				this.flatArmour =
				this.propArmour =
				this.flatMagicArmour =
				this.propMagicArmour =
				this.flatDamageModifier =
				this.propDamageModifier =
				this.flatMagicDamageModifier =
				this.propMagicDamageModifier =
				this.flatArmourPiercingDamageModifier =
				this.propArmourPiercingDamageModifier =
					0;
			this.poisonResist =
				this.bleedResist =
				this.evadeChance =
				this.counterAttackChance =
					0.1;
			this.maxHealth = this.maxMana = 50;
			this.turnManaRegen = 5;
			this.projectiles = this.initiative = 10;
			this.initialSpell = -1;
			this.bonusActions = 1;
			this.AIType = 2;
			this.real = true;
			if (typeof selectedEnemy.name == "string") {
				this.name = selectedEnemy.name || undefined;
			}
			if (typeof selectedEnemy.introduction == "string") {
				this.introduction = selectedEnemy.introduction || undefined;
			}
			switch (typeof selectedEnemy.maxHealth) {
				case "number":
					this.maxHealth = Math.trunc(selectedEnemy.maxHealth);
					break;
				case "string":
					this.maxHealth = numFromString(
						selectedEnemy.maxHealth
					).value;
			}
			if (this.maxHealth < 0) {
				this.maxHealth = 0;
			}
			this.health = this.maxHealth;
			switch (typeof selectedEnemy.projectiles) {
				case "number":
					this.projectiles = Math.trunc(selectedEnemy.projectiles);
					break;
				case "string":
					this.projectiles = numFromString(
						selectedEnemy.projectiles
					).value;
			}
			if (this.projectiles < 0) {
				this.projectiles = 0;
			}
			switch (typeof selectedEnemy.maxMana) {
				case "number":
					this.maxMana = Math.trunc(selectedEnemy.maxMana);
					break;
				case "string":
					this.maxMana = numFromString(selectedEnemy.maxMana).value;
			}
			if (this.maxMana < 0) {
				this.maxMana = 0;
			}
			this.mana = this.maxMana;
			switch (typeof selectedEnemy.turnManaRegen) {
				case "number":
					this.turnManaRegen = Math.trunc(
						selectedEnemy.turnManaRegen
					);
					break;
				case "string":
					this.turnManaRegen = numFromString(
						selectedEnemy.turnManaRegen
					).value;
			}
			switch (typeof selectedEnemy.poisonResist) {
				case "number":
					this.poisonResist = selectedEnemy.poisonResist;
					break;
				case "string":
					this.poisonResist = floatFromString(
						selectedEnemy.poisonResist
					).value;
			}
			if (this.poisonResist < 0) {
				this.poisonResist = 0;
			}
			switch (typeof selectedEnemy.bleedResist) {
				case "number":
					this.bleedResist = selectedEnemy.bleedResist;
					break;
				case "string":
					this.bleedResist = floatFromString(
						selectedEnemy.bleedResist
					).value;
			}
			if (this.bleedResist < 0) {
				this.bleedResist = 0;
			}
			switch (typeof selectedEnemy.turnRegen) {
				case "number":
					this.turnRegen = Math.trunc(selectedEnemy.turnRegen);
					break;
				case "string":
					this.turnRegen = numFromString(
						selectedEnemy.turnRegen
					).value;
			}
			if (Array.isArray(selectedEnemy.weapons)) {
				let weapons: any[] = selectedEnemy.weapons,
					weaponCount: number = Math.min(weapons.length, 256),
					weaponBlueprint;
				for (let i: number = 0; i < weaponCount; i++) {
					weaponBlueprint = weapons[i];
					if (weaponBlueprint == "EMPTY") {
						continue;
					} else if (typeof weaponBlueprint != "string") {
						throw 1;
					}
					this.weapons.push(new weapon(weaponBlueprint));
					if (!this.weapons.at(-1)?.getReal()) {
						this.weapons.pop();
					} else if (!this.weapons.at(-1)!.getCanCounter()) {
						this.addNoCounter(
							false,
							this.weapons.at(-1)!.getName()
						);
					}
				}
			}
			if (Array.isArray(selectedEnemy.spells)) {
				let spells: any[] = selectedEnemy.spells,
					spellCount: number = Math.min(spells.length, 256),
					spellBlueprint;
				for (let i: number = 0; i < spellCount; i++) {
					spellBlueprint = spells[i];
					if (spellBlueprint == "EMPTY") {
						continue;
					} else if (typeof spellBlueprint != "string") {
						throw 1;
					}
					this.spells.push(new spell(spellBlueprint));
					if (!this.spells.at(-1)?.getReal()) {
						this.spells.pop();
					} else if (this.spells.at(-1)!.getNoCounter()) {
						this.addNoCounter(true, this.spells.at(-1)!.getName());
					}
				}
			}
			switch (typeof selectedEnemy.initialSpell) {
				case "number":
					this.initialSpell = Math.trunc(selectedEnemy.initialSpell);
					break;
				case "string":
					this.initialSpell = numFromString(
						selectedEnemy.initialSpell
					).value;
			}
			if (
				this.initialSpell < -1 ||
				this.initialSpell >= this.spells.length
			) {
				this.initialSpell = -1;
			}
			if (
				typeof selectedEnemy.deathSpell == "string" &&
				selectedEnemy.deathSpell != "EMPTY"
			) {
				this.deathSpell = new spell(selectedEnemy.deathSpell);
				if (!this.deathSpell.getReal()) {
					this.deathSpell = undefined;
				} else if (this.deathSpell.getNoCounter()) {
					this.addNoCounter(true, this.deathSpell.getName());
				}
			}
			switch (typeof selectedEnemy.flatArmour) {
				case "number":
					this.flatArmour = Math.trunc(selectedEnemy.flatArmour);
					break;
				case "string":
					this.flatArmour = numFromString(
						selectedEnemy.flatArmour
					).value;
			}
			switch (typeof selectedEnemy.propArmour) {
				case "number":
					this.propArmour = selectedEnemy.propArmour;
					break;
				case "string":
					this.propArmour = floatFromString(
						selectedEnemy.propArmour
					).value;
			}
			if (this.propArmour < -1) {
				this.propArmour = -1;
			}
			switch (typeof selectedEnemy.flatMagicArmour) {
				case "number":
					this.flatMagicArmour = Math.trunc(
						selectedEnemy.flatMagicArmour
					);
					break;
				case "string":
					this.flatMagicArmour = numFromString(
						selectedEnemy.flatMagicArmour
					).value;
			}
			switch (typeof selectedEnemy.propMagicArmour) {
				case "number":
					this.propMagicArmour = selectedEnemy.propMagicArmour;
					break;
				case "string":
					this.propMagicArmour = floatFromString(
						selectedEnemy.propMagicArmour
					).value;
			}
			if (this.propMagicArmour < -1) {
				this.propMagicArmour = -1;
			}
			switch (typeof selectedEnemy.flatDamageModifier) {
				case "number":
					this.flatDamageModifier = Math.trunc(
						selectedEnemy.flatDamageModifier
					);
					break;
				case "string":
					this.flatDamageModifier = numFromString(
						selectedEnemy.flatDamageModifier
					).value;
			}
			switch (typeof selectedEnemy.propDamageModifier) {
				case "number":
					this.propDamageModifier = selectedEnemy.propDamageModifier;
					break;
				case "string":
					this.propDamageModifier = floatFromString(
						selectedEnemy.propDamageModifier
					).value;
			}
			if (this.propDamageModifier < -1) {
				this.propDamageModifier = -1;
			}
			switch (typeof selectedEnemy.flatMagicDamageModifier) {
				case "number":
					this.flatMagicDamageModifier = Math.trunc(
						selectedEnemy.flatMagicDamageModifier
					);
					break;
				case "string":
					this.flatMagicDamageModifier = numFromString(
						selectedEnemy.flatMagicDamageModifier
					).value;
			}
			switch (typeof selectedEnemy.propMagicDamageModifier) {
				case "number":
					this.propMagicDamageModifier =
						selectedEnemy.propMagicDamageModifier;
					break;
				case "string":
					this.propMagicDamageModifier = floatFromString(
						selectedEnemy.propMagicDamageModifier
					).value;
			}
			if (this.propMagicDamageModifier < -1) {
				this.propMagicDamageModifier = -1;
			}
			switch (typeof selectedEnemy.flatArmourPiercingDamageModifier) {
				case "number":
					this.flatArmourPiercingDamageModifier = Math.trunc(
						selectedEnemy.flatArmourPiercingDamageModifier
					);
					break;
				case "string":
					this.flatArmourPiercingDamageModifier = numFromString(
						selectedEnemy.flatArmourPiercingDamageModifier
					).value;
			}
			switch (typeof selectedEnemy.propArmourPiercingDamageModifier) {
				case "number":
					this.propArmourPiercingDamageModifier =
						selectedEnemy.propArmourPiercingDamageModifier;
					break;
				case "string":
					this.propArmourPiercingDamageModifier = floatFromString(
						selectedEnemy.propArmourPiercingDamageModifier
					).value;
			}
			if (this.propArmourPiercingDamageModifier < -1) {
				this.propArmourPiercingDamageModifier = -1;
			}
			switch (typeof selectedEnemy.evadeChance) {
				case "number":
					this.evadeChance = selectedEnemy.evadeChance;
					break;
				case "string":
					this.evadeChance = floatFromString(
						selectedEnemy.evadeChance
					).value;
			}
			if (this.evadeChance < -1) {
				this.evadeChance = -1;
			}
			switch (typeof selectedEnemy.counterAttackChance) {
				case "number":
					this.counterAttackChance =
						selectedEnemy.counterAttackChance;
					break;
				case "string":
					this.counterAttackChance = floatFromString(
						selectedEnemy.counterAttackChance
					).value;
			}
			if (this.counterAttackChance < -1) {
				this.counterAttackChance = -1;
			}
			switch (typeof selectedEnemy.bonusActions) {
				case "number":
					this.bonusActions = Math.trunc(selectedEnemy.bonusActions);
					break;
				case "string":
					this.bonusActions = numFromString(
						selectedEnemy.bonusActions
					).value;
			}
			this.currentBonusActions = Math.max(0, this.bonusActions);
			switch (typeof selectedEnemy.AIType) {
				case "number":
					this.AIType = Math.trunc(selectedEnemy.AIType);
					break;
				case "string":
					this.AIType = numFromString(selectedEnemy.AIType).value;
			}
			if (this.AIType < 1 || this.AIType > AI_TYPES_NO) {
				this.AIType = 2;
			}
			switch (typeof selectedEnemy.initiative) {
				case "number":
					this.initiative = Math.trunc(selectedEnemy.initiative);
					break;
				case "string":
					this.initiative = numFromString(
						selectedEnemy.initiative
					).value;
			}
			switch (typeof selectedEnemy.xp) {
				case "number":
					this.xp = Math.trunc(selectedEnemy.xp);
					break;
				case "string":
					this.xp = numFromString(selectedEnemy.xp).value;
			}
		} catch (err) {
			switch (err) {
				case 1:
					errorMessages.push(
						`Unable to parse enemy blueprint ${blueprint}`
					);
					break;
				case 2:
					errorMessages.push(
						`Unable to find enemy blueprint ${blueprint}`
					);
					break;
				case 5:
					errorMessages.push(
						`Enemy blueprint list ${blueprint} is empty`
					);
					break;
				case 9:
					errorMessages.push(
						`Exceeded maximum list depth loading enemy blueprint ${blueprint}`
					);
					break;
				default:
					throw err;
			}
		}
	}
	/**Chooses an action to take
	 * @param timing - What point in the turn it is, defaults to 0
	 * @param firstTurn - Indicates it is the enemy's first turn
	 * @param itemName1 - Name of the first item the player is attacking with, defaults to nothing
	 * @param itemName2 - Name of the second item the player is attacking with, defaults to nothing
	 * @returns an object {actionType, slot1?, slot2?} actionType 0 is nothing, 1 is a weapon, 2 is a spell, 3 is two weapons
	 */
	chooseAction(
		timing: 0 | 1 | 2 | 3 | 4 = 0,
		firstTurn: boolean = false,
		itemName1: string = "",
		itemName2: string = ""
	): actionChoice {
		let selectedType: 0 | 1 | 2 | 3 = 0,
			selection1: number | undefined = 0,
			selection2: number | undefined = 0; //For holding slot selection
		let selection: actionChoice;
		if (firstTurn && timing == 0) {
			//If an initial spell is set, cast if possible
			if (this.initialSpell >= 0) {
				selection1 = this.initialSpell;
				//Check if can cast initial spell
				if (this.check(true, selection1, 0, true)) {
					return {actionType: 2, slot1: selection1};
				}
			}
		}
		switch (this.AIType) {
			//Combined types
			case 1:
			case 2:
			case 3:
				switch (timing) {
					case 0:
						//Make healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							//Make attack check
							if (this.attackCheck()) {
								selection = this.chooseAttack();
								switch (selection.actionType) {
									case 3:
										this.currentBonusActions--;
									case 1:
									case 2:
										return selection;
								}
								//Cast utility spell
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								//No survivable actions found, will have to suicide
								return this.chooseSuicide();
							}
							//Cast utility spell
							selection1 = this.chooseSpell(3);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							//Try attack
							selection = this.chooseAttack();
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
								case 2:
									return selection;
							}
							//No survivable actions
							return this.chooseSuicide();
						}
						if (this.attackCheck()) {
							selection = this.chooseAttack();
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
								case 2:
									return selection;
							}
							//Couldn't find attack, make another healing check
							if (this.healingCheck()) {
								//Look for a healing spell
								selection1 = this.chooseSpell(2);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								//Look for a utility spell
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								//Suicide
								return this.chooseSuicide();
							}
							//Look for utility, then healing
							selection1 = this.chooseSpell(3);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							//Suicide
							return this.chooseSuicide();
						}
						//Cast utility spell
						selection1 = this.chooseSpell(3);
						if (selection1 >= 0) {
							return {actionType: 2, slot1: selection1};
						}
						//Healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							selection = this.chooseAttack();
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
								case 2:
									return selection;
							}
							//Suicide
							return this.chooseSuicide();
						}
						//Look for attack
						selection = this.chooseAttack();
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
							case 2:
								return selection;
						}
						//Heal
						selection1 = this.chooseSpell(2);
						if (selection1 >= 0) {
							return {actionType: 2, slot1: selection1};
						}
						//Suicide
						return this.chooseSuicide();
					case 4:
					case 1: //Responding to weapon attack
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						//Check if can be countered
						if (
							this.checkCounter(false, itemName1) ||
							(timing == 4 && this.checkCounter(false, itemName2))
						) {
							//Look for a counter spell
							selection1 =
								this.chooseWeaponCounterSpell(firstTurn);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						//Healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							//Make attack check
							if (this.attackCheck()) {
								selection1 = this.chooseSpell(
									1,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(
									3,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								return {actionType: 0};
							}
							selection1 = this.chooseSpell(
								3,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							return {actionType: 0};
						}
						//Attack check
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						selection1 = this.chooseSpell(3, 1, false, firstTurn);
						if (selection1 >= 0) {
							this.currentBonusActions--;
							return {actionType: 2, slot1: selection1};
						}
						return {actionType: 0};
					case 2: //Responding to spell
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						//Check if can be countered
						if (this.checkCounter(true, itemName1)) {
							selection1 =
								this.chooseSpellCounterSpell(firstTurn);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						//Healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							//Make attack check
							if (this.attackCheck()) {
								selection1 = this.chooseSpell(
									1,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(
									3,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								return {actionType: 0};
							}
							selection1 = this.chooseSpell(
								3,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							return {actionType: 0};
						}
						//Attack check
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						selection1 = this.chooseSpell(3, 1, false, firstTurn);
						if (selection1 >= 0) {
							this.currentBonusActions--;
							return {actionType: 2, slot1: selection1};
						}
						return {actionType: 0};
					case 3: //Counter attack
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						if (this.attackCheck()) {
							selection = this.chooseAttack(3, false, firstTurn);
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
								case 2:
									this.currentBonusActions--;
									return selection;
							}
							selection1 = this.chooseSpell(
								3,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							return {actionType: 0};
						}
						selection1 = this.chooseSpell(3, 3, false, firstTurn);
						if (selection1 >= 0) {
							this.currentBonusActions--;
							return {actionType: 2, slot1: selection1};
						}
						selection = this.chooseAttack(3, false, firstTurn);
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
							case 2:
								this.currentBonusActions--;
							default:
								return selection;
						}
				}
			case 4:
			case 5:
			case 6:
				switch (timing) {
					case 0:
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							if (this.attackCheck()) {
								selection1 = this.chooseSpell(1);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
							} else {
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(1);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
							}
							selection = this.chooseWeapon();
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
									return selection;
							}
							return this.chooseSuicide();
						}
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(1);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							if (this.healingCheck()) {
								selection1 = this.chooseSpell(2);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
							} else {
								selection1 = this.chooseSpell(3);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(2);
								if (selection1 >= 0) {
									return {actionType: 2, slot1: selection1};
								}
							}
							selection = this.chooseWeapon();
							switch (selection.actionType) {
								case 3:
									this.currentBonusActions--;
								case 1:
									return selection;
							}
							return this.chooseSuicide();
						}
						selection1 = this.chooseSpell(3);
						if (selection1 >= 0) {
							return {actionType: 2, slot1: selection1};
						}
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(1);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
						} else {
							selection1 = this.chooseSpell(1);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(2);
							if (selection1 >= 0) {
								return {actionType: 2, slot1: selection1};
							}
						}
						selection = this.chooseWeapon();
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
								return selection;
						}
						return this.chooseSuicide();
					case 4:
					case 1:
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						if (
							this.checkCounter(false, itemName1) ||
							(timing == 4 && this.checkCounter(false, itemName2))
						) {
							selection1 =
								this.chooseWeaponCounterSpell(firstTurn);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						//Healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							//Make attack check
							if (this.attackCheck()) {
								selection1 = this.chooseSpell(
									1,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(
									3,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								return {actionType: 0};
							}
							selection1 = this.chooseSpell(
								3,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							return {actionType: 0};
						}
						//Attack check
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						selection1 = this.chooseSpell(3, 1, false, firstTurn);
						if (selection1 >= 0) {
							this.currentBonusActions--;
							return {actionType: 2, slot1: selection1};
						}
						return {actionType: 0};
					case 2: //Responding to spell
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						if (this.checkCounter(true, itemName1)) {
							selection1 =
								this.chooseSpellCounterSpell(firstTurn);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						//Healing check
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							if (this.attackCheck()) {
								selection1 = this.chooseSpell(
									1,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								selection1 = this.chooseSpell(
									3,
									1,
									false,
									firstTurn
								);
								if (selection1 >= 0) {
									this.currentBonusActions--;
									return {actionType: 2, slot1: selection1};
								}
								return {actionType: 0};
							}
							selection1 = this.chooseSpell(
								3,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							return {actionType: 0};
						}
						//Attack check
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(
								1,
								1,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						selection1 = this.chooseSpell(3, 1, false, firstTurn);
						if (selection1 >= 0) {
							this.currentBonusActions--;
							return {actionType: 2, slot1: selection1};
						}
						return {actionType: 0};
					case 3: //Counter attack
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						if (this.healingCheck()) {
							selection1 = this.chooseSpell(
								2,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						if (this.attackCheck()) {
							selection1 = this.chooseSpell(
								1,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								3,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						} else {
							selection1 = this.chooseSpell(
								3,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
							selection1 = this.chooseSpell(
								1,
								3,
								false,
								firstTurn
							);
							if (selection1 >= 0) {
								this.currentBonusActions--;
								return {actionType: 2, slot1: selection1};
							}
						}
						selection = this.chooseWeapon(3, false, firstTurn);
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
								this.currentBonusActions--;
							default:
								return selection;
						}
				}
			case 7: //Melee berserker
				switch (timing) {
					case 0:
						selection = this.chooseWeapon();
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
								return selection;
						}
						return this.chooseSuicide();
					case 3:
						if (this.currentBonusActions <= 0) {
							return {actionType: 0};
						}
						selection = this.chooseWeapon(3, false, firstTurn);
						switch (selection.actionType) {
							case 3:
								this.currentBonusActions--;
							case 1:
								this.currentBonusActions--;
								return selection;
						}
						return this.chooseSuicide();
				}
				break;
		}
		return {actionType: 0};
	}
	/**Checks if enemy can afford to use weapon or spell, then if kamikaze is false, checks it would not lead to suicide.If specified weapon or spell is out of range or not real, returns false
	 * @param type - true is a spell, false is a weapon
	 * @param slot - weapon or spell slot to check
	 * @param timing - turn timing, defaults to 0
	 * @param kamikaze - is the enemy allowed to suicide, defaults to false
	 * @param firstTurn - is it the enemy's first turn, defaults to false
	 * @returns whether the action can be taken
	 */
	check(
		type: boolean,
		slot: number,
		timing: 0 | 1 | 2 | 3 = 0,
		kamikaze: boolean = false,
		firstTurn: boolean = false
	): boolean {
		if (timing != 0 && this.currentBonusActions <= 0) {
			return false;
		}
		let currentHealth = this.health,
			currentMana = this.mana,
			currentConstRegen = this.turnRegen,
			currentTurnManaRegen = this.turnManaRegen,
			currentMaxMana = this.maxMana,
			currentMaxHealth = this.maxHealth,
			currentProjectiles = this.projectiles,
			currentBleed = this.bleed,
			currentPoison = this.poison,
			currentTempRegen = this.tempRegen;
		switch (type) {
			case false: //Weapon
				//Check weapon exists
				if (
					slot >= this.weapons.length ||
					slot < 0 ||
					!this.weapons[slot].getReal()
				) {
					return false;
				}
				switch (timing) {
					case 0:
						if (this.weapons[slot].getHitCount() <= 0) {
							return false;
						}
						break;
					case 1: //Responding to weapon
					case 2: //Responding to spell
						return false;
					case 3: //Counter attack
						if (this.weapons[slot].getCounterHits() <= 0) {
							return false;
						}
						break;
					default:
						return false;
				}
				//Health cost
				if (
					this.weapons[slot].getHealthChange() < 0 &&
					(this.health + this.weapons[slot].getHealthChange() < 0 ||
						(!kamikaze &&
							this.health +
								this.weapons[slot].getHealthChange() ==
								0))
				) {
					return false;
				}
				//Mana cost
				if (
					this.weapons[slot].getManaChange() < 0 &&
					this.mana + this.weapons[slot].getManaChange() < 0
				) {
					return false;
				}
				//Projectile cost
				if (
					this.weapons[slot].getProjectileChange() < 0 &&
					this.projectiles +
						this.weapons[slot].getProjectileChange() <
						0
				) {
					return false;
				}
				//Can afford costs and can use at this timing
				if (kamikaze) {
					return true;
				}
				//Apply costs and maximum possible self damage
				this.modifyHealth(this.weapons[slot].getHealthChange());
				this.propDamage(this.weapons[slot].getPropSelfDamage());
				this.flatDamage(
					this.weapons[slot].getFlatSelfDamageMax(),
					this.weapons[slot].getFlatSelfMagicDamageMax(),
					this.weapons[slot].getFlatSelfArmourPiercingDamageMax(),
					this.weapons[slot].getSelfOverHeal()
				);
				this.modifyMana(this.weapons[slot].getManaChange());
				this.modifyProjectiles(
					this.weapons[slot].getProjectileChange()
				);
				if (this.health <= 0) {
					//Would die
					this.health = currentHealth;
					this.mana = currentMana;
					this.projectiles = currentProjectiles;
					return false;
				}
				//Check if would die next turn to poison/bleed
				this.modifyPoison(this.weapons[slot].getSelfPoison());
				this.modifyBleed(this.weapons[slot].getSelfBleed());
				this.simulateTurn();
				if (this.health <= 0) {
					this.health = currentHealth;
					this.poison = currentPoison;
					this.bleed = currentBleed;
					this.mana = currentMana;
					this.projectiles = currentProjectiles;
					return false;
				}
				if (firstTurn && this.initialSpell >= 0) {
					//Check if will be able to cast initial spell next turn
					if (!this.check(true, this.initialSpell, 0, true)) {
						this.health = currentHealth;
						this.poison = currentPoison;
						this.bleed = currentBleed;
						this.mana = currentMana;
						this.projectiles = currentProjectiles;
						return false;
					}
				}
				this.health = currentHealth;
				this.poison = currentPoison;
				this.bleed = currentBleed;
				this.mana = currentMana;
				this.projectiles = currentProjectiles;
				return true;
			case true: //Spell
				//Check spell exists
				if (
					slot >= this.spells.length ||
					slot < 0 ||
					!this.spells[slot].getReal()
				) {
					return false;
				}
				//Check cooldown
				if (this.spells[slot].getCurrentCooldown() > 0) {
					return false;
				}
				//Timing
				switch (timing) {
					case 0:
						if (this.spells[slot].getTiming() == 2) {
							return false;
						}
						break;
					case 1:
					case 2:
						if (this.spells[slot].getTiming() == 0) {
							return false;
						}
						break;
					case 3:
						if (this.spells[slot].getCounterHits() <= 0) {
							return false;
						}
						break;
					default:
						return false;
				}
				//Check costs
				if (
					this.spells[slot].getHealthChange() < 0 &&
					(this.health + this.spells[slot].getHealthChange() < 0 ||
						(!kamikaze &&
							this.health + this.spells[slot].getHealthChange() ==
								0))
				) {
					return false;
				}
				if (
					this.spells[slot].getManaChange() < 0 &&
					this.mana + this.spells[slot].getManaChange() < 0
				) {
					return false;
				}
				if (
					this.spells[slot].getProjectileChange() < 0 &&
					this.projectiles + this.spells[slot].getProjectileChange() <
						0
				) {
					return false;
				}
				//Kamikaze check
				if (kamikaze) {
					return true;
				}
				if (firstTurn && slot == this.initialSpell) {
					return true;
				}
				//Apply self damage
				this.modifyHealth(this.spells[slot].getHealthChange());
				this.propDamage(this.spells[slot].getPropSelfDamage());
				this.flatDamage(
					this.spells[slot].getFlatSelfDamageMax(),
					this.spells[slot].getFlatSelfMagicDamageMax(),
					this.spells[slot].getFlatSelfArmourPiercingDamageMax(),
					this.spells[slot].getSelfOverHeal()
				);
				this.modifyMaxHealth(this.spells[slot].getMaxHealthModifier());
				if (this.health <= 0) {
					this.health = currentHealth;
					this.maxHealth = currentMaxHealth;
					return false;
				}
				//Apply poison/bleed/regen and simulate a turn
				this.modifyPoison(this.spells[slot].getSelfPoison());
				this.modifyBleed(this.spells[slot].getSelfBleed());
				this.modifyTempRegen(this.spells[slot].getTempRegenSelf());
				this.modifyTurnRegen(this.spells[slot].getTurnRegenModifier());
				this.modifyTurnManaRegen(
					this.spells[slot].getTurnManaRegenModifier()
				);
				this.modifyMana(this.spells[slot].getManaChange());
				this.modifyMaxMana(this.spells[slot].getMaxManaModifier());
				this.modifyProjectiles(this.spells[slot].getProjectileChange());
				this.simulateTurn();
				if (this.health <= 0) {
					this.health = currentHealth;
					this.maxHealth = currentMaxHealth;
					this.poison = currentPoison;
					this.bleed = currentBleed;
					this.tempRegen = currentTempRegen;
					this.turnRegen = currentConstRegen;
					this.turnManaRegen = currentTurnManaRegen;
					this.mana = currentMana;
					this.maxMana = currentMaxMana;
					this.projectiles = currentProjectiles;
					return false;
				}
				if (firstTurn && this.initialSpell >= 0) {
					if (!this.check(true, this.initialSpell, 0, true)) {
						this.health = currentHealth;
						this.maxHealth = currentMaxHealth;
						this.poison = currentPoison;
						this.bleed = currentBleed;
						this.tempRegen = currentTempRegen;
						this.turnRegen = currentConstRegen;
						this.turnManaRegen = currentTurnManaRegen;
						this.mana = currentMana;
						this.maxMana = currentMaxMana;
						this.projectiles = currentProjectiles;
						return false;
					}
				}
				this.health = currentHealth;
				this.maxHealth = currentMaxHealth;
				this.poison = currentPoison;
				this.bleed = currentBleed;
				this.tempRegen = currentTempRegen;
				this.turnRegen = currentConstRegen;
				this.turnManaRegen = currentTurnManaRegen;
				this.mana = currentMana;
				this.maxMana = currentMaxMana;
				this.projectiles = currentProjectiles;
				return true;
		}
	}
	/**Simulates a turn of dot/regen */
	simulateTurn(): void {
		this.modifyHealth(
			-(POISON_MULTIPLIER * this.poison + BLEED_MULTIPLIER * this.bleed)
		);
		this.modifyHealth(this.turnRegen + REGEN_MULTIPLIER * this.tempRegen);
		if (this.health > this.maxHealth) {
			this.health = Math.max(
				this.maxHealth,
				this.health - ENEMY_OVERHEAL_DECAY
			);
		}
		this.modifyMana(this.turnManaRegen);
		if (this.mana > this.maxMana) {
			this.mana = Math.max(this.maxMana, this.mana - ENEMY_MANA_DECAY);
		}
	}
	/**Chooses a spell
	 * @param type - spell type to look for
	 * @param timing - spell timing
	 * @param kamikaze - is the enemy allowed to suicide
	 * @param firstTurn - is it the enemy's first turn
	 * @returns slot of the chosen spell, -1 if it didn't pick one
	 */
	chooseSpell(
		type: number,
		timing: 0 | 1 | 2 | 3 = 0,
		kamikaze: boolean = false,
		firstTurn: boolean = false
	): number {
		let spellSlots: number = this.spells.length;
		if (spellSlots == 0) {
			return -1;
		}
		/**Holds slot numbers of spells which could be chosen */
		let possibleSpells: number[] = [];
		for (let i: number = 0; i < spellSlots; i++) {
			if (
				this.spells[i].checkSpellType(type) &&
				this.check(true, i, timing, kamikaze, firstTurn)
			) {
				possibleSpells.push(i);
			}
		}
		if (possibleSpells.length == 0) {
			return -1;
		}
		return possibleSpells[randomInt(0, possibleSpells.length)];
	}
	/**Chooses a weapon
	 * @param timing - attack timing
	 * @param kamikaze - is the enemy allowed to suicide
	 * @param firstTurn - is it the enemy's first turn
	 * @returns an object {actionType, slot1, slot2?}.
	 */
	chooseWeapon(
		timing: 0 | 1 | 2 | 3 = 0,
		kamikaze: boolean = false,
		firstTurn: boolean = false
	): actionChoice {
		let weaponSlots: number = this.weapons.length;
		if (weaponSlots == 0) {
			return {actionType: 0};
		}
		let possibleWeapons: number[] = [];
		for (let i: number = 0; i < weaponSlots; i++) {
			if (this.check(false, i, timing, kamikaze, firstTurn)) {
				possibleWeapons.push(i);
				if (!this.weapons[i].getDualWield()) {
					possibleWeapons.push(i);
				}
			}
		}
		if (possibleWeapons.length == 0) {
			return {actionType: 0};
		}
		let selection1: number =
			possibleWeapons[randomInt(0, possibleWeapons.length)];
		if (this.weapons[selection1].getDualWield()) {
			possibleWeapons.length = 0;
			for (let i: number = 0; i < weaponSlots; i++) {
				if (
					this.checkDualWield(
						selection1,
						i,
						timing,
						kamikaze,
						firstTurn
					)
				) {
					possibleWeapons.push(i);
				}
			}
			if (possibleWeapons.length == 0) {
				return {actionType: 1, slot1: selection1};
			}
			return {
				actionType: 3,
				slot1: selection1,
				slot2: possibleWeapons[randomInt(0, possibleWeapons.length)]
			};
		}
		return {actionType: 1, slot1: selection1};
	}
	/**Chooses a spell to counter a weapon
	 * @param firstTurn - is it the enemy's first turn
	 * @returns slot of the chosen spell, -1 if no spell chosen
	 */
	chooseWeaponCounterSpell(firstTurn: boolean = false): number {
		let spellSlots: number = this.spells.length;
		if (spellSlots == 0) {
			return -1;
		}
		let possibleSpells: number[] = [];
		for (let i: number = 0; i < spellSlots; i++) {
			if (
				(this.spells[i].getCounterSpell() == 2 ||
					this.spells[i].getCounterSpell() == 3) &&
				this.check(true, i, 1, false, firstTurn)
			) {
				possibleSpells.push(i);
			}
		}
		if (possibleSpells.length == 0) {
			return -1;
		}
		return possibleSpells[randomInt(0, possibleSpells.length)];
	}
	/**Chooses a spell to counter a spell
	 * @param firstTurn - is it the enemy's first turn
	 * @returns slot of the chosen spell, -1 if none chosen
	 */
	chooseSpellCounterSpell(firstTurn: boolean = false): number {
		let spellSlots: number = this.spells.length;
		if (spellSlots == 0) {
			return -1;
		}
		let possibleSpells: number[] = [];
		for (let i: number = 0; i < spellSlots; i++) {
			if (
				(this.spells[i].getCounterSpell() == 1 ||
					this.spells[i].getCounterSpell() == 3) &&
				this.check(true, i, 2, false, firstTurn)
			) {
				possibleSpells.push(i);
			}
		}
		if (possibleSpells.length == 0) {
			return -1;
		}
		return possibleSpells[randomInt(0, possibleSpells.length)];
	}
	/**Chooses an attack
	 * @param timing - attack timing
	 * @param kamikaze - is the enemy allowed to suicude
	 * @param firstTurn - is it the enemy's first turn
	 * @returns an object {actionType, slot1?, slot2?} actionType 0 is nothing, 1 is a weapon, 2 is a spell, 3 is two weapons
	 */
	chooseAttack(
		timing: 0 | 1 | 2 | 3 = 0,
		kamikaze: boolean = false,
		firstTurn: boolean = false
	): actionChoice {
		let weaponSlots: number = this.weapons.length,
			spellSlots: number = this.spells.length,
			slot: number;
		let possibleAttacks: number[] = [];
		for (let i: number = 0; i < weaponSlots; i++) {
			if (this.check(false, i, timing, kamikaze, firstTurn)) {
				possibleAttacks.push(i + 1);
				if (!this.weapons[i].getDualWield()) {
					possibleAttacks.push(i + 1);
				}
			}
		}
		for (let i: number = 0; i < spellSlots; i++) {
			if (
				this.spells[i].checkSpellType(1) &&
				this.check(true, i, timing, kamikaze, firstTurn)
			) {
				possibleAttacks.push(-(i + 1));
				possibleAttacks.push(-(i + 1));
			}
		}
		if (possibleAttacks.length == 0) {
			return {actionType: 0};
		}
		slot = possibleAttacks[randomInt(0, possibleAttacks.length)];
		//Weapon
		if (slot > 0) {
			slot--;
			if (this.weapons[slot].getDualWield()) {
				possibleAttacks.length = 0;
				for (let i: number = 0; i < weaponSlots; i++) {
					if (
						this.checkDualWield(
							slot,
							i,
							timing,
							kamikaze,
							firstTurn
						)
					) {
						possibleAttacks.push(i);
					}
				}
				if (possibleAttacks.length == 0) {
					return {actionType: 1, slot1: slot};
				}
				return {
					actionType: 3,
					slot1: slot,
					slot2: possibleAttacks[randomInt(0, possibleAttacks.length)]
				};
			}
			return {actionType: 1, slot1: slot};
		} else {
			return {actionType: 2, slot1: -(slot + 1)};
		}
	}
	/**Chooses an action when it has no survivable options
	 *@returns an object {actionType, slot1?, slot2?} actionType 0 is nothing, 1 is a weapon, 2 is a spell, 3 is two weapons
	 */
	chooseSuicide(): actionChoice {
		let selectedType: 0 | 1 | 2 | 3,
			selection1: number | undefined,
			selection2: number | undefined;
		let selection: actionChoice;
		switch (this.AIType) {
			case 1:
			case 2:
			case 3:
				selection = this.chooseAttack(0, true);
				switch (selection.actionType) {
					case 3:
						this.currentBonusActions--;
					case 1:
					case 2:
						return selection;
				}
				selection1 = this.chooseSpell(3, 0, true);
				if (selection1 >= 0) {
					return {actionType: 2, slot1: selection1};
				}
				selection1 = this.chooseSpell(2, 0, true);
				if (selection1 >= 0) {
					return {actionType: 2, slot1: selection1};
				}
				return {actionType: 0};
			case 4:
			case 5:
			case 6:
				selection1 = this.chooseSpell(1, 0, true);
				if (selection1 >= 0) {
					return {actionType: 2, slot1: selection1};
				}
				selection = this.chooseWeapon(0, true);
				switch (selection.actionType) {
					case 3:
						this.currentBonusActions--;
					case 1:
					case 2:
						return selection;
				}
				selection1 = this.chooseSpell(3, 0, true);
				if (selection1 >= 0) {
					return {actionType: 2, slot1: selection1};
				}
				selection1 = this.chooseSpell(2, 0, true);
				if (selection1 >= 0) {
					return {actionType: 2, slot1: selection1};
				}
				return {actionType: 0};
			case 7:
				selection = this.chooseWeapon(0, true);
				switch (selection.actionType) {
					case 3:
						this.currentBonusActions--;
					case 1:
					case 2:
						return selection;
				}
		}
		return {actionType: 0};
	}
	/**Makes a healing check
	 * @returns whether the check passed
	 */
	healingCheck(): boolean {
		let healthProp: number = this.health / this.maxHealth;
		if (healthProp >= AI_HEALING_THRESHOLD) {
			return false;
		}
		switch (this.AIType) {
			case 1:
			case 4:
				return randomFloat(0, 1) < Math.pow(healthProp, 4);
			case 2:
			case 5:
				return randomFloat(0, 1) < Math.pow(healthProp, 3);
			case 3:
			case 6:
				return randomFloat(0, 1) < Math.pow(healthProp, 2);
		}
		return false;
	}
	/**Makes an attack check
	 * @returns whether the check passed
	 */
	attackCheck(): boolean {
		switch (this.AIType) {
			case 1:
			case 4:
				return randomFloat(0, 1) < 0.75;
			case 2:
			case 5:
				return randomFloat(0, 1) < 0.5;
			case 3:
			case 6:
				return randomFloat(0, 1) < 0.25;
		}
		return true;
	}
	/**Checks if two weapons can be dual wielded
	 * @param weapon1 - slot of first weapon
	 * @param weapon2 - slot of second weapon
	 * @param timing - attack timing
	 * @param kamikaze - is the enemy allowed to suicide
	 * @param firstTurn - is it the enemy's first turn
	 * @returns whether they can
	 */
	checkDualWield(
		weapon1: number,
		weapon2: number,
		timing: 0 | 1 | 2 | 3 = 0,
		kamikaze: boolean = false,
		firstTurn: boolean = false
	): boolean {
		if (
			this.currentBonusActions <= 0 ||
			(timing != 0 && this.currentBonusActions <= 1)
		) {
			return false;
		}
		let currentHealth: number = this.health,
			currentProjectiles: number = this.projectiles,
			currentMana: number = this.mana,
			currentPoison: number = this.poison,
			currentBleed: number = this.bleed;
		if (weapon1 == weapon2) {
			return false;
		}
		if (
			!this.weapons[weapon2].getDualWield() ||
			!this.weapons[weapon1].getDualWield()
		) {
			return false;
		}
		if (
			weapon2 >= this.weapons.length ||
			!this.weapons[weapon2].getReal()
		) {
			return false;
		}
		if (!this.check(false, weapon2, timing, kamikaze, firstTurn)) {
			return false;
		}
		this.modifyHealth(this.weapons[weapon1].getHealthChange());
		this.modifyMana(this.weapons[weapon1].getManaChange());
		this.modifyProjectiles(this.weapons[weapon1].getProjectileChange());
		if (
			this.weapons[weapon2].getHealthChange() < 0 &&
			(this.health + this.weapons[weapon2].getHealthChange() < 0 ||
				(!kamikaze &&
					this.health + this.weapons[weapon2].getHealthChange() == 0))
		) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			return false;
		}
		if (
			this.weapons[weapon2].getManaChange() < 0 &&
			this.mana + this.weapons[weapon2].getManaChange() < 0
		) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			return false;
		}
		if (
			this.weapons[weapon2].getProjectileChange() < 0 &&
			this.projectiles + this.weapons[weapon2].getProjectileChange() < 0
		) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			return false;
		}
		if (kamikaze) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			return true;
		}
		//Apply weapon2 costs
		this.modifyHealth(this.weapons[weapon2].getHealthChange());
		this.modifyMana(this.weapons[weapon2].getManaChange());
		this.modifyProjectiles(this.weapons[weapon2].getProjectileChange());
		//Apply maximum self damage
		if (this.weapons[weapon1].getPropSelfDamage() > 0) {
			this.propDamage(this.weapons[weapon2].getPropSelfDamage());
			this.propDamage(this.weapons[weapon1].getPropSelfDamage());
		} else {
			this.propDamage(this.weapons[weapon1].getPropSelfDamage());
			this.propDamage(this.weapons[weapon2].getPropSelfDamage());
		}
		if (this.weapons[weapon1].getSelfOverHeal()) {
			this.flatDamage(
				this.weapons[weapon2].getFlatSelfDamageMax(),
				this.weapons[weapon2].getFlatSelfMagicDamageMax(),
				this.weapons[weapon2].getFlatSelfArmourPiercingDamageMax(),
				this.weapons[weapon2].getSelfOverHeal()
			);
			this.flatDamage(
				this.weapons[weapon1].getFlatSelfDamageMax(),
				this.weapons[weapon1].getFlatSelfMagicDamageMax(),
				this.weapons[weapon1].getFlatSelfArmourPiercingDamageMax(),
				true
			);
		} else {
			this.flatDamage(
				this.weapons[weapon1].getFlatSelfDamageMax(),
				this.weapons[weapon1].getFlatSelfMagicDamageMax(),
				this.weapons[weapon1].getFlatSelfArmourPiercingDamageMax()
			);
			this.flatDamage(
				this.weapons[weapon2].getFlatSelfDamageMax(),
				this.weapons[weapon2].getFlatSelfMagicDamageMax(),
				this.weapons[weapon2].getFlatSelfArmourPiercingDamageMax(),
				this.weapons[weapon2].getSelfOverHeal()
			);
		}
		if (this.health <= 0) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			return false;
		}
		//Apply poison/bleed
		this.modifyPoison(this.weapons[weapon1].getSelfPoison(), false);
		this.modifyPoison(this.weapons[weapon2].getSelfPoison(), false);
		this.modifyBleed(this.weapons[weapon1].getSelfBleed(), false);
		this.modifyBleed(this.weapons[weapon2].getSelfBleed(), false);
		this.simulateTurn();
		if (this.health <= 0) {
			this.health = currentHealth;
			this.mana = currentMana;
			this.projectiles = currentProjectiles;
			this.poison = currentPoison;
			this.bleed = currentBleed;
			return false;
		}
		if (firstTurn && this.initialSpell >= 0) {
			//Check if will be able to cast initial spell next turn
			if (!this.check(true, this.initialSpell, 0, true)) {
				this.health = currentHealth;
				this.mana = currentMana;
				this.projectiles = currentProjectiles;
				this.poison = currentPoison;
				this.bleed = currentBleed;
				return false;
			}
		}
		this.health = currentHealth;
		this.mana = currentMana;
		this.projectiles = currentProjectiles;
		this.poison = currentPoison;
		this.bleed = currentBleed;
		return true;
	}
	/**Adds weapon/spell to list of uncounterable things
	 * @param type - true is a spell, false is a weapon
	 * @param itemName - name of weapon/spell
	 */
	addNoCounter(type: boolean, itemName: string): void {
		let noCounters: number;
		if (type) {
			noCounters = this.noCounterSpells.length;
			for (let i: number = 0; i < noCounters; i++) {
				if (itemName == this.noCounterSpells[i]) {
					return;
				}
			}
			this.noCounterSpells.push(itemName);
		} else {
			noCounters = this.noCounterWeapons.length;
			for (let i: number = 0; i < noCounters; i++) {
				if (itemName == this.noCounterWeapons[i]) {
					return;
				}
			}
			this.noCounterWeapons.push(itemName);
		}
		return;
	}
	/**Checks if the weapon/spell is known to be uncounterable
	 * @param type - true is a spell, false is a weapon
	 * @param itemName - name of weapon/spell
	 * @returns false if uncounterable
	 */
	checkCounter(type: boolean, itemName: string): boolean {
		let noCounters: number;
		if (type) {
			noCounters = this.noCounterSpells.length;
			for (let i: number = 0; i < noCounters; i++) {
				if (itemName == this.noCounterSpells[i]) {
					return false;
				}
			}
		} else {
			noCounters = this.noCounterWeapons.length;
			for (let i: number = 0; i < noCounters; i++) {
				if (itemName == this.noCounterWeapons[i]) {
					return false;
				}
			}
		}
		return true;
	}
	/**Applies modifiers to damage
	 * @param p - physical damage
	 * @param m - magic damage
	 * @param a - ap damage
	 * @returns an object containing the modified damage
	 */
	applyDamageModifiers(
		p: number,
		m: number,
		a: number
	): {p: number; m: number; a: number} {
		if (p > 0) {
			p += this.flatDamageModifier;
			if (p < 0) {
				p = 0;
			} else {
				p *= 1 + this.propDamageModifier;
			}
		}
		if (m > 0) {
			m += this.flatMagicDamageModifier;
			if (m < 0) {
				m = 0;
			} else {
				m *= 1 + this.propMagicDamageModifier;
			}
		}
		if (a > 0) {
			a += this.flatArmourPiercingDamageModifier;
			if (a < 0) {
				a = 0;
			} else {
				a *= 1 + this.propArmourPiercingDamageModifier;
			}
		}
		return {p: p, m: m, a: a};
	}
	/**Resets cooldowns, only for debugging */
	reset(): void {
		let length: number = this.spells.length;
		for (let i: number = 0; i < length; i++) {
			this.spells[i].resetCooldown();
		}
	}
}

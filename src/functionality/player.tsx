import {Fragment, useState} from "react";
import {DisplayWeaponName, weapon} from "./weapons";
import {DisplaySpellName, spell} from "./spells";
import {
	DisplayArmourName,
	armourFeet,
	armourHead,
	armourLegs,
	armourTorso
} from "./armour";
import {randomInt} from "./rng";
import {
	POISON_MULTIPLIER,
	BLEED_MULTIPLIER,
	REGEN_MULTIPLIER
} from "../components/battle";
import classData from "../data/classes.json";
import {actionChoice, floatFromString, numFromString} from "./data";
import {
	IonButton,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonIcon,
	IonLabel,
	IonList,
	IonListHeader,
	IonRow,
	IonSegment,
	IonSegmentButton,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import {close} from "ionicons/icons";

export const PLAYER_OVERHEAL_DECAY = 5;
export const MANA_DECAY = 5;

export class player {
	private className: string = "";
	private health: number = 150;
	private maxHealthBase: number = 150;
	private maxHealth: number = 150;
	private projectiles: number = 0;
	private mana: number = 0;
	private maxManaBase: number = 100;
	private maxMana: number = 0;
	private turnManaRegenBase: number = 5;
	private turnManaRegen: number = 0;
	private battleManaRegenBase: number = 10;
	private battleManaRegen: number = 0;
	private poison: number = 0;
	private poisonResistBase: number = 0.1;
	private poisonResist: number = 0;
	private bleed: number = 0;
	private bleedResistBase: number = 0.1;
	private bleedResist: number = 0;
	private tempRegen: number = 0;
	private turnRegenBase: number = 0;
	private turnRegen: number = 0;
	private battleRegenBase: number = 0;
	private battleRegen: number = 0;
	private weapons: weapon[] = [];
	private spells: spell[] = [];
	private flatArmourBase: number = 0;
	private flatArmour: number = 0;
	private propArmourBase: number = 0;
	private propArmour: number = 0;
	private flatMagicArmourBase: number = 0;
	private flatMagicArmour: number = 0;
	private propMagicArmourBase: number = 0;
	private propMagicArmour: number = 0;
	private helmet: armourHead = new armourHead();
	private chestPlate: armourTorso = new armourTorso();
	private greaves: armourLegs = new armourLegs();
	private boots: armourFeet = new armourFeet();
	private flatDamageModifierBase: number = 0;
	private flatDamageModifier: number = 0;
	private propDamageModifierBase: number = 0;
	private propDamageModifier: number = 0;
	private flatMagicDamageModifierBase: number = 0;
	private flatMagicDamageModifier: number = 0;
	private propMagicDamageModifierBase: number = 0;
	private propMagicDamageModifier: number = 0;
	private flatArmourPiercingDamageModifierBase: number = 0;
	private flatArmourPiercingDamageModifier: number = 0;
	private propArmourPiercingDamageModifierBase: number = 0;
	private propArmourPiercingDamageModifier: number = 0;
	private evadeChanceBase: number = 0.1;
	private evadeChance: number = 0;
	private counterAttackChanceBase: number = 0.1;
	private counterAttackChance: number = 0;
	private bonusActionsBase: number = 1;
	private currentBonusActions: number = 1;
	private bonusActions: number = 1;
	private initiativeBase: number = 10;
	private initiative: number = 10;
	private xp: number = 0;
	private maxXp: number = 0;
	private nextLevel: string = "EMPTY";
	private level: number = 1;
	removeAllHealth(): void {
		this.health = 0;
	}
	fullHeal(): void {
		this.health = this.maxHealth;
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
	calculateMaxHealth(): void {
		this.maxHealth = this.maxHealthBase;
		this.modifyMaxHealth(this.helmet.getMaxHealthModifier());
		this.modifyMaxHealth(this.chestPlate.getMaxHealthModifier());
		this.modifyMaxHealth(this.greaves.getMaxHealthModifier());
		this.modifyMaxHealth(this.boots.getMaxHealthModifier());
		if (this.health > this.maxHealth) {
			this.health = this.maxHealth;
		}
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
	calculateMaxMana(): void {
		this.maxMana = this.maxManaBase;
		this.modifyMaxMana(this.helmet.getMaxManaModifier());
		this.modifyMaxMana(this.chestPlate.getMaxManaModifier());
		this.modifyMaxMana(this.greaves.getMaxManaModifier());
		this.modifyMaxMana(this.boots.getMaxManaModifier());
		if (this.mana > this.maxMana) {
			this.mana = this.maxMana;
		}
	}
	fullMana(): void {
		this.mana = this.maxMana;
	}
	/**Modifies turnManaRegen
	 * @param m - turnManaRegen change
	 */
	modifyTurnManaRegen(m: number): void {
		this.turnManaRegen += m;
	}
	calculateTurnManaRegen(): void {
		this.turnManaRegen = this.turnManaRegenBase;
		this.modifyTurnManaRegen(this.helmet.getTurnManaRegenModifier());
		this.modifyTurnManaRegen(this.chestPlate.getTurnManaRegenModifier());
		this.modifyTurnManaRegen(this.greaves.getTurnManaRegenModifier());
		this.modifyTurnManaRegen(this.boots.getTurnManaRegenModifier());
	}
	/**Modifies battleManaRegen
	 * @param b - battleManaRegen change
	 */
	modifyBattleManaRegen(b: number): void {
		this.battleManaRegen += b;
	}
	calculateBattleManaRegen(): void {
		this.battleManaRegen = this.battleManaRegenBase;
		this.modifyBattleManaRegen(this.helmet.getBattleManaRegenModifier());
		this.modifyBattleManaRegen(
			this.chestPlate.getBattleManaRegenModifier()
		);
		this.modifyBattleManaRegen(this.greaves.getBattleManaRegenModifier());
		this.modifyBattleManaRegen(this.boots.getBattleManaRegenModifier());
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
	curePoison(): void {
		this.poison = 0;
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
	cureBleed(): void {
		this.bleed = 0;
	}
	/**Modifies tempRegen
	 * @param r - change in regen
	 */
	modifyTempRegen(r: number): void {
		if (r > 0) {
			this.tempRegen = Math.min(255, this.tempRegen + r);
		} else if (r < 0) {
			this.tempRegen = Math.max(0, this.tempRegen + r);
		}
	}
	removeTempRegen(): void {
		this.tempRegen = 0;
	}
	/**Modifies turn regen
	 * @param r - change in turn regen
	 */
	modifyTurnRegen(c: number): void {
		this.turnRegen += c;
	}
	calculateTurnRegen(): void {
		this.turnRegen = this.turnRegenBase;
		this.modifyTurnRegen(this.helmet.getTurnRegenModifier());
		this.modifyTurnRegen(this.chestPlate.getTurnRegenModifier());
		this.modifyTurnRegen(this.greaves.getTurnRegenModifier());
		this.modifyTurnRegen(this.boots.getTurnRegenModifier());
	}
	/**Modifies battleRegen
	 * @param b - change in battleRegen
	 */
	modifyBattleRegen(b: number): void {
		this.battleRegen += b;
	}
	calculateBattleRegen(): void {
		this.battleRegen = this.battleRegenBase;
		this.modifyBattleRegen(this.helmet.getBattleRegenModifier());
		this.modifyBattleRegen(this.chestPlate.getBattleRegenModifier());
		this.modifyBattleRegen(this.greaves.getBattleRegenModifier());
		this.modifyBattleRegen(this.boots.getBattleRegenModifier());
	}
	/**Modifies flat armour
	 * @param f - flat armour change
	 */
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
	calculateArmour(): void {
		this.flatArmour = this.flatArmourBase;
		this.modifyFlatArmour(this.helmet.getFlatArmourModifier());
		this.modifyFlatArmour(this.chestPlate.getFlatArmourModifier());
		this.modifyFlatArmour(this.greaves.getFlatArmourModifier());
		this.modifyFlatArmour(this.boots.getFlatArmourModifier());
		this.propArmour = this.propArmourBase;
		this.modifyPropArmour(this.helmet.getPropArmourModifier());
		this.modifyPropArmour(this.chestPlate.getPropArmourModifier());
		this.modifyPropArmour(this.greaves.getPropArmourModifier());
		this.modifyPropArmour(this.boots.getPropArmourModifier());
		this.flatMagicArmour = this.flatMagicArmourBase;
		this.modifyFlatMagicArmour(this.helmet.getFlatMagicArmourModifier());
		this.modifyFlatMagicArmour(
			this.chestPlate.getFlatMagicArmourModifier()
		);
		this.modifyFlatMagicArmour(this.greaves.getFlatMagicArmourModifier());
		this.modifyFlatMagicArmour(this.boots.getFlatMagicArmourModifier());
		this.propMagicArmour = this.propMagicArmourBase;
		this.modifyPropMagicArmour(this.helmet.getPropMagicArmourModifier());
		this.modifyPropMagicArmour(
			this.chestPlate.getPropMagicArmourModifier()
		);
		this.modifyPropMagicArmour(this.greaves.getPropMagicArmourModifier());
		this.modifyPropMagicArmour(this.boots.getPropMagicArmourModifier());
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
	calculateDamageModifiers(): void {
		//Flat
		this.flatDamageModifier = this.flatDamageModifierBase;
		this.modifyFlatDamageModifier(this.helmet.getFlatDamageModifier());
		this.modifyFlatDamageModifier(this.chestPlate.getFlatDamageModifier());
		this.modifyFlatDamageModifier(this.greaves.getFlatDamageModifier());
		this.modifyFlatDamageModifier(this.boots.getFlatDamageModifier());
		//Prop
		this.propDamageModifier = this.propDamageModifierBase;
		this.modifyPropDamageModifier(this.helmet.getPropDamageModifier());
		this.modifyPropDamageModifier(this.chestPlate.getPropDamageModifier());
		this.modifyPropDamageModifier(this.greaves.getPropDamageModifier());
		this.modifyPropDamageModifier(this.boots.getPropDamageModifier());
		//Flat magic
		this.flatMagicDamageModifier = this.flatMagicDamageModifierBase;
		this.modifyFlatMagicDamageModifier(
			this.helmet.getFlatMagicDamageModifier()
		);
		this.modifyFlatMagicDamageModifier(
			this.chestPlate.getFlatMagicDamageModifier()
		);
		this.modifyFlatMagicDamageModifier(
			this.greaves.getFlatMagicDamageModifier()
		);
		this.modifyFlatMagicDamageModifier(
			this.boots.getFlatMagicDamageModifier()
		);
		{
			let length: number = this.weapons.length;
			for (let i: number = 0; i < length; i++) {
				if (this.weapons[i].getReal()) {
					this.modifyFlatMagicDamageModifier(
						this.weapons[i].getFlatMagicDamageModifier()
					);
				}
			}
		}
		//Prop magic
		this.propMagicDamageModifier = this.propMagicDamageModifierBase;
		this.modifyPropMagicDamageModifier(
			this.helmet.getPropMagicDamageModifier()
		);
		this.modifyPropMagicDamageModifier(
			this.chestPlate.getPropMagicDamageModifier()
		);
		this.modifyPropMagicDamageModifier(
			this.greaves.getPropMagicDamageModifier()
		);
		this.modifyPropMagicDamageModifier(
			this.boots.getPropMagicDamageModifier()
		);
		//Flat AP
		this.flatArmourPiercingDamageModifier =
			this.flatArmourPiercingDamageModifierBase;
		this.modifyFlatArmourPiercingDamageModifier(
			this.helmet.getFlatArmourPiercingDamageModifier()
		);
		this.modifyFlatArmourPiercingDamageModifier(
			this.chestPlate.getFlatArmourPiercingDamageModifier()
		);
		this.modifyFlatArmourPiercingDamageModifier(
			this.greaves.getFlatArmourPiercingDamageModifier()
		);
		this.modifyFlatArmourPiercingDamageModifier(
			this.boots.getFlatArmourPiercingDamageModifier()
		);
		//Prop AP
		this.propArmourPiercingDamageModifier =
			this.propArmourPiercingDamageModifierBase;
		this.modifyPropArmourPiercingDamageModifier(
			this.helmet.getPropArmourPiercingDamageModifier()
		);
		this.modifyPropArmourPiercingDamageModifier(
			this.chestPlate.getPropArmourPiercingDamageModifier()
		);
		this.modifyPropArmourPiercingDamageModifier(
			this.greaves.getPropArmourPiercingDamageModifier()
		);
		this.modifyPropArmourPiercingDamageModifier(
			this.boots.getPropArmourPiercingDamageModifier()
		);
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
	calculateEvadeChance(): void {
		this.evadeChance = this.evadeChanceBase;
		this.modifyEvadeChance(this.helmet.getEvadeChanceModifier());
		this.modifyEvadeChance(this.chestPlate.getEvadeChanceModifier());
		this.modifyEvadeChance(this.greaves.getEvadeChanceModifier());
		this.modifyEvadeChance(this.boots.getEvadeChanceModifier());
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
	calculatePoisonResist(): void {
		this.poisonResist = this.poisonResistBase;
		this.modifyPoisonResist(this.helmet.getPoisonResistModifier());
		this.modifyPoisonResist(this.chestPlate.getPoisonResistModifier());
		this.modifyPoisonResist(this.greaves.getPoisonResistModifier());
		this.modifyPoisonResist(this.boots.getPoisonResistModifier());
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
	calculateBleedResist(): void {
		this.bleedResist = this.bleedResistBase;
		this.modifyBleedResist(this.helmet.getBleedResistModifier());
		this.modifyBleedResist(this.chestPlate.getBleedResistModifier());
		this.modifyBleedResist(this.greaves.getBleedResistModifier());
		this.modifyBleedResist(this.boots.getBleedResistModifier());
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
	calculateCounterAttackChance(): void {
		this.counterAttackChance = this.counterAttackChanceBase;
		this.modifyCounterAttackChance(
			this.helmet.getCounterAttackChanceModifier()
		);
		this.modifyCounterAttackChance(
			this.chestPlate.getCounterAttackChanceModifier()
		);
		this.modifyCounterAttackChance(
			this.greaves.getCounterAttackChanceModifier()
		);
		this.modifyCounterAttackChance(
			this.boots.getCounterAttackChanceModifier()
		);
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
	calculateBonusActions(): void {
		this.bonusActions = this.bonusActionsBase;
		this.modifyBonusActions(this.helmet.getBonusActionsModifier());
		this.modifyBonusActions(this.chestPlate.getBonusActionsModifier());
		this.modifyBonusActions(this.greaves.getBonusActionsModifier());
		this.modifyBonusActions(this.boots.getBonusActionsModifier());
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
	}
	calculateModifiers(): void {
		this.calculateMaxHealth();
		this.calculateMaxMana();
		this.calculateTurnManaRegen();
		this.calculateBattleManaRegen();
		this.calculateTurnRegen();
		this.calculateBattleRegen();
		this.calculateArmour();
		this.calculateDamageModifiers();
		this.calculateEvadeChance();
		this.calculatePoisonResist();
		this.calculateBleedResist();
		this.calculateCounterAttackChance();
		this.calculateBonusActions();
		this.calculateInitiative();
	}
	/**Modifies initiative
	 * @param i - change in initiative
	 */
	modifyInitiative(i: number): void {
		this.initiative += i;
	}
	calculateInitiative(): void {
		this.initiative = this.initiativeBase;
		this.modifyInitiative(this.helmet.getInitiativeModifier());
		this.modifyInitiative(this.chestPlate.getInitiativeModifier());
		this.modifyInitiative(this.greaves.getInitiativeModifier());
		this.modifyInitiative(this.boots.getInitiativeModifier());
	}
	/**Start of turn, decrements cooldowns, applies and then decrements dot/regen */
	turnStart(): void {
		this.modifyHealth(
			-(POISON_MULTIPLIER * this.poison + BLEED_MULTIPLIER * this.bleed)
		);
		this.modifyHealth(this.turnRegen + REGEN_MULTIPLIER * this.tempRegen);
		if (this.health > this.maxHealth) {
			this.health = Math.max(
				this.maxHealth,
				this.health - PLAYER_OVERHEAL_DECAY
			);
		}
		this.modifyMana(this.turnManaRegen);
		if (this.mana > this.maxMana) {
			this.mana = Math.max(this.maxMana, this.mana - MANA_DECAY);
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
	getHealth(): number {
		return this.health;
	}
	getMaxHealth(): number {
		return this.maxHealth;
	}
	getMaxHealthBase(): number {
		return this.maxHealthBase;
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
	getMaxManaBase(): number {
		return this.maxManaBase;
	}
	getTurnManaRegenBase(): number {
		return this.turnManaRegenBase;
	}
	getTurnManaRegen(): number {
		return this.turnManaRegen;
	}
	getBattleManaRegenBase(): number {
		return this.battleManaRegenBase;
	}
	getBattleManaRegen(): number {
		return this.battleManaRegen;
	}
	getPoison(): number {
		return this.poison;
	}
	getPoisonResist(): number {
		return this.poisonResist;
	}
	getPoisonResistBase(): number {
		return this.poisonResistBase;
	}
	getBleed(): number {
		return this.bleed;
	}
	getBleedResist(): number {
		return this.bleedResist;
	}
	getBleedResistBase(): number {
		return this.bleedResistBase;
	}
	getRegen(): number {
		return this.tempRegen;
	}
	getTurnRegen(): number {
		return this.turnRegen;
	}
	getTurnRegenBase(): number {
		return this.turnRegenBase;
	}
	getBattleRegen(): number {
		return this.battleRegen;
	}
	getBattleRegenBase(): number {
		return this.battleRegenBase;
	}
	getWeaponSlots(): number {
		return this.weapons.length;
	}
	getWeapon(i: number): weapon {
		if (i >= this.weapons.length || i < 0) {
			throw 6;
		}
		return this.weapons[i];
	}
	getSpellSlots(): number {
		return this.spells.length;
	}
	getSpell(i: number): spell {
		if (i >= this.spells.length || i < 0) {
			throw 6;
		}
		return this.spells[i];
	}
	getFlatArmourBase(): number {
		return this.flatArmourBase;
	}
	getFlatArmour(): number {
		return this.flatArmour;
	}
	getPropArmourBase(): number {
		return this.propArmourBase;
	}
	getPropArmour(): number {
		return this.propArmour;
	}
	getHelmet(): armourHead {
		return this.helmet;
	}
	getChestPlate(): armourTorso {
		return this.chestPlate;
	}
	getGreaves(): armourLegs {
		return this.greaves;
	}
	getBoots(): armourFeet {
		return this.boots;
	}
	getFlatDamageModifierBase(): number {
		return this.flatDamageModifierBase;
	}
	getFlatDamageModifier(): number {
		return this.flatDamageModifier;
	}
	getPropDamageModifierBase(): number {
		return this.propDamageModifierBase;
	}
	getPropDamageModifier(): number {
		return this.propDamageModifier;
	}
	getFlatMagicDamageModifierBase(): number {
		return this.flatMagicDamageModifierBase;
	}
	getFlatMagicDamageModifier(): number {
		return this.flatMagicDamageModifier;
	}
	getPropMagicDamageModifierBase(): number {
		return this.propMagicDamageModifierBase;
	}
	getPropMagicDamageModifier(): number {
		return this.propMagicDamageModifier;
	}
	getFlatArmourPiercingDamageModifierBase(): number {
		return this.flatArmourPiercingDamageModifierBase;
	}
	getFlatArmourPiercingDamageModifier(): number {
		return this.flatArmourPiercingDamageModifier;
	}
	getPropArmourPiercingDamageModifierBase(): number {
		return this.propArmourPiercingDamageModifierBase;
	}
	getPropArmourPiercingDamageModifier(): number {
		return this.propArmourPiercingDamageModifier;
	}
	getFlatMagicArmourBase(): number {
		return this.flatMagicArmourBase;
	}
	getFlatMagicArmour(): number {
		return this.flatMagicArmour;
	}
	getPropMagicArmourBase(): number {
		return this.propMagicArmourBase;
	}
	getPropMagicArmour(): number {
		return this.propMagicArmour;
	}
	getEvadeChanceBase(): number {
		return this.evadeChanceBase;
	}
	getEvadeChance(): number {
		return this.evadeChance;
	}
	getCounterAttackChanceBase(): number {
		return this.counterAttackChanceBase;
	}
	getCounterAttackChance(): number {
		return this.counterAttackChance;
	}
	getBonusActionsBase(): number {
		return this.bonusActionsBase;
	}
	getBonusActions(): number {
		return this.bonusActions;
	}
	getCurrentBonusActions(): number {
		return this.currentBonusActions;
	}
	getClassName(): string {
		return this.className;
	}
	getInitiativeBase(): number {
		return this.initiativeBase;
	}
	getInitiative(): number {
		return this.initiative;
	}
	rollInitiative(): number {
		return randomInt(0, Math.max(0, this.initiative));
	}
	getXp(): number {
		return this.xp;
	}
	getMaxXp(): number {
		return this.maxXp;
	}
	getLevel(): number {
		return this.level;
	}
	constructor(playerClass?: string | player) {
		if (playerClass) {
			if (typeof playerClass == "string") {
				this.loadClass(playerClass);
			} else {
				//console.log(playerClass.weapons);
				let counter: number;
				this.className = playerClass.className;
				this.health = playerClass.health;
				this.maxHealthBase = playerClass.maxHealthBase;
				this.maxHealth = playerClass.maxHealth;
				this.projectiles = playerClass.projectiles;
				this.mana = playerClass.mana;
				this.maxManaBase = playerClass.maxManaBase;
				this.maxMana = playerClass.maxMana;
				this.turnManaRegenBase = playerClass.turnManaRegenBase;
				this.turnManaRegen = playerClass.turnManaRegen;
				this.battleManaRegenBase = playerClass.battleManaRegenBase;
				this.battleManaRegen = playerClass.battleManaRegen;
				this.poison = playerClass.poison;
				this.poisonResistBase = playerClass.poisonResistBase;
				this.poisonResist = playerClass.poisonResist;
				this.bleed = playerClass.bleed;
				this.bleedResistBase = playerClass.bleedResistBase;
				this.bleedResist = playerClass.bleedResist;
				this.tempRegen = playerClass.tempRegen;
				this.turnRegenBase = playerClass.turnRegenBase;
				this.turnRegen = playerClass.turnRegen;
				this.battleRegenBase = playerClass.battleRegenBase;
				this.battleRegen = playerClass.battleRegen;
				counter = playerClass.weapons.length;
				for (let i: number = 0; i < counter; i++) {
					this.weapons.push(new weapon(playerClass.weapons[i]));
				}
				counter = playerClass.spells.length;
				for (let i: number = 0; i < counter; i++) {
					this.spells.push(new spell(playerClass.spells[i]));
				}
				this.flatArmourBase = playerClass.flatArmourBase;
				this.flatArmour = playerClass.flatArmour;
				this.propArmourBase = playerClass.propArmourBase;
				this.propArmour = playerClass.propArmour;
				this.flatMagicArmourBase = playerClass.flatMagicArmourBase;
				this.flatMagicArmour = playerClass.flatMagicArmour;
				this.propMagicArmourBase = playerClass.propMagicArmourBase;
				this.propMagicArmour = playerClass.propMagicArmour;
				this.helmet = new armourHead(playerClass.helmet);
				this.chestPlate = new armourTorso(playerClass.chestPlate);
				this.greaves = new armourLegs(playerClass.greaves);
				this.boots = new armourFeet(playerClass.boots);
				this.flatDamageModifierBase =
					playerClass.flatDamageModifierBase;
				this.flatDamageModifier = playerClass.flatDamageModifier;
				this.propDamageModifierBase =
					playerClass.propDamageModifierBase;
				this.propDamageModifier = playerClass.propDamageModifier;
				this.flatMagicDamageModifierBase =
					playerClass.flatMagicDamageModifierBase;
				this.flatMagicDamageModifier =
					playerClass.flatMagicDamageModifier;
				this.propMagicDamageModifierBase =
					playerClass.propMagicDamageModifierBase;
				this.propMagicDamageModifier =
					playerClass.propMagicDamageModifier;
				this.flatArmourPiercingDamageModifierBase =
					playerClass.flatArmourPiercingDamageModifierBase;
				this.flatArmourPiercingDamageModifier =
					playerClass.flatArmourPiercingDamageModifier;
				this.propArmourPiercingDamageModifierBase =
					playerClass.propArmourPiercingDamageModifierBase;
				this.propArmourPiercingDamageModifier =
					playerClass.propArmourPiercingDamageModifier;
				this.evadeChanceBase = playerClass.evadeChanceBase;
				this.evadeChance = playerClass.evadeChance;
				this.counterAttackChanceBase =
					playerClass.counterAttackChanceBase;
				this.counterAttackChance = playerClass.counterAttackChance;
				this.bonusActionsBase = playerClass.bonusActionsBase;
				this.bonusActions = playerClass.bonusActions;
				this.currentBonusActions = playerClass.currentBonusActions;
				this.initiativeBase = playerClass.initiativeBase;
				this.initiative = playerClass.initiative;
				this.xp = playerClass.xp;
				this.maxXp = playerClass.maxXp;
				this.nextLevel = playerClass.nextLevel;
				this.level = playerClass.level;
			}
		}
	}
	loadClass(playerClass: string): void {
		this.className = "";
		this.nextLevel = "EMPTY";
		this.maxHealthBase = 150;
		this.projectiles =
			this.turnRegenBase =
			this.battleRegenBase =
			this.weapons.length =
			this.spells.length =
			this.flatArmourBase =
			this.propArmourBase =
			this.flatMagicArmourBase =
			this.propMagicArmourBase =
			this.flatDamageModifierBase =
			this.propDamageModifierBase =
			this.flatMagicDamageModifierBase =
			this.propMagicDamageModifierBase =
			this.flatArmourPiercingDamageModifierBase =
			this.propArmourPiercingDamageModifierBase =
			this.xp =
			this.maxXp =
				0;
		this.maxManaBase = 100;
		this.turnManaRegenBase = 5;
		this.battleManaRegenBase = this.initiativeBase = 10;
		this.poisonResistBase =
			this.bleedResistBase =
			this.evadeChanceBase =
			this.counterAttackChanceBase =
				0.1;
		this.bonusActionsBase = this.level = 1;
		this.helmet.loadFromFile();
		this.chestPlate.loadFromFile();
		this.greaves.loadFromFile();
		this.boots.loadFromFile();
		//@ts-expect-error
		let selectedClass = classData[playerClass];
		if (selectedClass == undefined) {
			throw 2;
		}
		for (let i: number = 0; Array.isArray(selectedClass); i++) {
			if (i == 10) {
				throw 9;
			}
			if (selectedClass.length == 0) {
				throw 5;
			}
			playerClass = selectedClass[randomInt(0, selectedClass.length)];
			if (typeof playerClass != "string") {
				throw 1;
			}
			//@ts-expect-error
			selectedClass = classData[playerClass];
			if (selectedClass == undefined) {
				throw 2;
			}
		}
		if (typeof selectedClass.className == "string") {
			this.className = selectedClass.className;
		}
		switch (typeof selectedClass.maxHealth) {
			case "number":
				this.maxHealthBase = Math.trunc(selectedClass.maxHealth);
				break;
			case "string":
				this.maxHealthBase = numFromString(
					selectedClass.maxHealth
				).value;
		}
		switch (typeof selectedClass.projectiles) {
			case "number":
				this.projectiles = Math.trunc(selectedClass.projectiles);
				break;
			case "string":
				this.projectiles = numFromString(
					selectedClass.projectiles
				).value;
		}
		if (this.projectiles < 0) {
			this.projectiles = 0;
		}
		switch (typeof selectedClass.maxMana) {
			case "number":
				this.maxManaBase = Math.trunc(selectedClass.maxMana);
				break;
			case "string":
				this.maxManaBase = numFromString(selectedClass.maxMana).value;
		}
		switch (typeof selectedClass.turnManaRegen) {
			case "number":
				this.turnManaRegenBase = Math.trunc(
					selectedClass.turnManaRegen
				);
				break;
			case "string":
				this.turnManaRegenBase = numFromString(
					selectedClass.turnManaRegen
				).value;
		}
		switch (typeof selectedClass.battleManaRegen) {
			case "number":
				this.battleManaRegenBase = Math.trunc(
					selectedClass.battleManaRegen
				);
				break;
			case "string":
				this.battleManaRegenBase = numFromString(
					selectedClass.battleManaRegen
				).value;
		}
		switch (typeof selectedClass.poisonResist) {
			case "number":
				this.poisonResistBase = selectedClass.poisonResist;
				break;
			case "string":
				this.poisonResistBase = floatFromString(
					selectedClass.poisonResist
				).value;
		}
		if (this.poisonResistBase < 0) {
			this.poisonResistBase = 0;
		}
		switch (typeof selectedClass.bleedResist) {
			case "number":
				this.bleedResistBase = selectedClass.bleedResist;
				break;
			case "string":
				this.bleedResistBase = floatFromString(
					selectedClass.bleedResist
				).value;
		}
		if (this.bleedResistBase < 0) {
			this.bleedResistBase = 0;
		}
		switch (typeof selectedClass.turnRegen) {
			case "number":
				this.turnRegenBase = Math.trunc(selectedClass.turnRegen);
				break;
			case "string":
				this.turnRegenBase = numFromString(
					selectedClass.turnRegen
				).value;
		}
		switch (typeof selectedClass.battleRegen) {
			case "number":
				this.battleRegenBase = Math.trunc(selectedClass.battleRegen);
				break;
			case "string":
				this.battleRegenBase = numFromString(
					selectedClass.battleRegen
				).value;
		}
		if (Array.isArray(selectedClass.weapons)) {
			let weapons: any[] = selectedClass.weapons;
			let weaponCount = Math.min(256, weapons.length);
			let weaponBlueprint;
			for (let i: number = 0; i < weaponCount; i++) {
				weaponBlueprint = weapons[i];
				if (typeof weaponBlueprint != "string") {
					throw 1;
				}
				this.weapons.push(new weapon(weaponBlueprint));
			}
		}
		if (Array.isArray(selectedClass.spells)) {
			let spells: any[] = selectedClass.spells;
			let spellCount = Math.min(256, spells.length);
			let spellBlueprint;
			for (let i: number = 0; i < spellCount; i++) {
				spellBlueprint = spells[i];
				if (typeof spellBlueprint != "string") {
					throw 1;
				}
				this.spells.push(new spell(spellBlueprint));
			}
		}
		switch (typeof selectedClass.flatArmour) {
			case "number":
				this.flatArmourBase = Math.trunc(selectedClass.flatArmour);
				break;
			case "string":
				this.flatArmourBase = numFromString(
					selectedClass.flatArmour
				).value;
		}
		switch (typeof selectedClass.propArmour) {
			case "number":
				this.propArmourBase = selectedClass.propArmour;
				break;
			case "string":
				this.propArmourBase = floatFromString(
					selectedClass.propArmour
				).value;
		}
		if (this.propArmourBase < -1) {
			this.propArmourBase = -1;
		}
		switch (typeof selectedClass.flatMagicArmour) {
			case "number":
				this.flatMagicArmourBase = Math.trunc(
					selectedClass.flatMagicArmour
				);
				break;
			case "string":
				this.flatMagicArmourBase = numFromString(
					selectedClass.flatMagicArmour
				).value;
		}
		switch (typeof selectedClass.propMagicArmour) {
			case "number":
				this.propMagicArmourBase = selectedClass.propMagicArmour;
				break;
			case "string":
				this.propMagicArmourBase = floatFromString(
					selectedClass.propMagicArmour
				).value;
		}
		if (this.propMagicArmourBase < -1) {
			this.propMagicArmourBase = -1;
		}
		if (typeof selectedClass.helmet == "string") {
			this.helmet = new armourHead(selectedClass.helmet);
		}
		if (typeof selectedClass.chestPlate == "string") {
			this.chestPlate = new armourTorso(selectedClass.chestPlate);
		}
		if (typeof selectedClass.greaves == "string") {
			this.greaves = new armourLegs(selectedClass.greaves);
		}
		if (typeof selectedClass.boots == "string") {
			this.boots = new armourFeet(selectedClass.boots);
		}
		switch (typeof selectedClass.flatDamageModifier) {
			case "number":
				this.flatDamageModifierBase = Math.trunc(
					selectedClass.flatDamageModifier
				);
				break;
			case "string":
				this.flatDamageModifierBase = numFromString(
					selectedClass.flatDamageModifier
				).value;
		}
		switch (typeof selectedClass.propDamageModifier) {
			case "number":
				this.propDamageModifierBase = selectedClass.propDamageModifier;
				break;
			case "string":
				this.propDamageModifierBase = floatFromString(
					selectedClass.propDamageModifier
				).value;
		}
		if (this.propDamageModifierBase < -1) {
			this.propDamageModifierBase = -1;
		}
		switch (typeof selectedClass.flatMagicDamageModifier) {
			case "number":
				this.flatMagicDamageModifierBase = Math.trunc(
					selectedClass.flatMagicDamageModifier
				);
				break;
			case "string":
				this.flatMagicDamageModifierBase = numFromString(
					selectedClass.flatMagicDamageModifier
				).value;
		}
		switch (typeof selectedClass.propMagicDamageModifier) {
			case "number":
				this.propMagicDamageModifierBase =
					selectedClass.propMagicDamageModifier;
				break;
			case "string":
				this.propMagicDamageModifierBase = floatFromString(
					selectedClass.propMagicDamageModifier
				).value;
		}
		if (this.propMagicDamageModifierBase < -1) {
			this.propMagicDamageModifierBase = -1;
		}
		switch (typeof selectedClass.flatArmourPiercingDamageModifier) {
			case "number":
				this.flatArmourPiercingDamageModifierBase = Math.trunc(
					selectedClass.flatArmourPiercingDamageModifier
				);
				break;
			case "string":
				this.flatArmourPiercingDamageModifierBase = numFromString(
					selectedClass.flatArmourPiercingDamageModifier
				).value;
		}
		switch (typeof selectedClass.propArmourPiercingDamageModifier) {
			case "number":
				this.propArmourPiercingDamageModifierBase =
					selectedClass.propArmourPiercingDamageModifier;
				break;
			case "string":
				this.propArmourPiercingDamageModifierBase = floatFromString(
					selectedClass.propArmourPiercingDamageModifier
				).value;
		}
		if (this.propArmourPiercingDamageModifierBase < -1) {
			this.propArmourPiercingDamageModifierBase = -1;
		}
		switch (typeof selectedClass.evadeChance) {
			case "number":
				this.evadeChanceBase = selectedClass.evadeChance;
				break;
			case "string":
				this.evadeChanceBase = floatFromString(
					selectedClass.evadeChance
				).value;
		}
		if (this.evadeChanceBase < 0) {
			this.evadeChanceBase = 0;
		}
		switch (typeof selectedClass.counterAttackChance) {
			case "number":
				this.counterAttackChanceBase =
					selectedClass.counterAttackChance;
				break;
			case "string":
				this.counterAttackChanceBase = floatFromString(
					selectedClass.counterAttackChance
				).value;
		}
		if (this.counterAttackChanceBase < 0) {
			this.counterAttackChanceBase = 0;
		}
		switch (typeof selectedClass.bonusActions) {
			case "number":
				this.bonusActionsBase = Math.trunc(selectedClass.bonusActions);
				break;
			case "string":
				this.bonusActionsBase = numFromString(
					selectedClass.bonusActions
				).value;
		}
		switch (typeof selectedClass.initiative) {
			case "number":
				this.initiativeBase = Math.trunc(selectedClass.initiative);
				break;
			case "string":
				this.initiativeBase = numFromString(
					selectedClass.initiative
				).value;
		}
		switch (typeof selectedClass.maxXp) {
			case "number":
				this.maxXp = Math.trunc(selectedClass.maxXp);
				break;
			case "string":
				this.maxXp = numFromString(selectedClass.maxXp).value;
		}
		if (this.maxXp < 0) {
			this.maxXp = 0;
		}
		if (typeof selectedClass.nextLevel == "string") {
			this.nextLevel = selectedClass.nextLevel;
		}
		this.calculateModifiers();
		this.fullHeal();
		this.fullMana();
		this.currentBonusActions = this.bonusActions;
	}
	/**For end of battle, applies battle regens, removes status effects and recalculates modidiers */
	reset(): void {
		this.modifyHealth(this.battleRegen);
		this.modifyMana(this.battleManaRegen);
		let length: number = this.spells.length;
		for (let i: number = 0; i < length; i++) {
			this.spells[i].resetCooldown();
		}
		this.calculateModifiers();
		this.cureBleed();
		this.curePoison();
		this.removeTempRegen();
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
	getStatusEffect(): boolean {
		if (this.poison || this.bleed || this.tempRegen) {
			return true;
		}
		return false;
	}
	/**Checks if the player can use the specified item
	 * @param type - false is a weapon, true is a spell
	 * @param timing - current timing
	 * @param slot - the slot containing the item
	 * @returns whether the player can use it
	 */
	check(type: boolean, timing: 0 | 1 | 2 | 3 | 4, slot: number): boolean {
		if (type) {
			if (
				slot < 0 ||
				slot >= this.spells.length ||
				!this.spells[slot].getReal()
			) {
				return false;
			}
			switch (timing) {
				//Main action
				case 0:
					if (
						this.spells[slot].getTiming() == 2 ||
						this.spells[slot].getHitCount() <= 0
					) {
						return false;
					}
					break;
				//Responding to weapon
				case 1:
				//Responding to spell
				case 2:
				//Responding to dual weapons
				case 4:
					if (
						this.spells[slot].getTiming() == 0 ||
						this.currentBonusActions <= 0
					) {
						return false;
					}
					break;
				//Counter attacking
				case 3:
					if (
						this.spells[slot].getCounterHits() <= 0 ||
						this.currentBonusActions <= 0
					) {
						return false;
					}
					break;
			}
			if (
				this.spells[slot].getCurrentCooldown() > 0 ||
				(this.spells[slot].getManaChange() < 0 &&
					this.mana + this.spells[slot].getManaChange() < 0) ||
				(this.spells[slot].getHealthChange() < 0 &&
					this.health + this.spells[slot].getHealthChange() < 0) ||
				(this.spells[slot].getProjectileChange() < 0 &&
					this.projectiles + this.spells[slot].getProjectileChange() <
						0)
			) {
				return false;
			}
		} else {
			if (
				slot < 0 ||
				slot >= this.weapons.length ||
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
				case 3:
					if (
						this.weapons[slot].getCounterHits() <= 0 ||
						this.currentBonusActions <= 0
					) {
						return false;
					}
					break;
				case 1:
				case 2:
				case 4:
					return false;
			}
			if (
				(this.weapons[slot].getProjectileChange() < 0 &&
					this.projectiles +
						this.weapons[slot].getProjectileChange() <
						0) ||
				(this.weapons[slot].getManaChange() < 0 &&
					this.mana + this.weapons[slot].getManaChange() < 0) ||
				(this.weapons[slot].getHealthChange() < 0 &&
					this.health + this.weapons[slot].getHealthChange() < 0)
			) {
				return false;
			}
		}
		return true;
	}
	/**Checks if two weapons can be dual wielded
	 * @param timing - action timing
	 * @param slot1 - the first weapon slot
	 * @param slot2 - the second weapon slot
	 * @returns whether they can
	 */
	checkDualWeapons(
		timing: 0 | 1 | 2 | 3 | 4,
		slot1: number,
		slot2: number
	): boolean {
		if (slot1 == slot2) {
			return false;
		}
		if (
			slot1 < 0 ||
			slot2 < 0 ||
			slot1 >= this.weapons.length ||
			slot2 >= this.weapons.length ||
			!this.weapons[slot1].getReal() ||
			!this.weapons[slot2].getReal()
		) {
			return false;
		}
		if (
			!this.weapons[slot1].getDualWield() ||
			!this.weapons[slot2].getDualWield()
		) {
			return false;
		}
		if (
			!this.check(false, timing, slot1) ||
			!this.check(false, timing, slot2)
		) {
			return false;
		}
		//timing must be 0 or 3 at this point, as otherwise the earlier checks would have returned false
		if (timing == 0) {
			if (this.currentBonusActions <= 0) {
				return false;
			}
		} else {
			if (this.currentBonusActions <= 1) {
				return false;
			}
		}
		const totHealthChange: number =
				this.weapons[slot1].getHealthChange() +
				this.weapons[slot2].getHealthChange(),
			totManaChange: number =
				this.weapons[slot1].getManaChange() +
				this.weapons[slot2].getManaChange(),
			totProjectileChange: number =
				this.weapons[slot1].getProjectileChange() +
				this.weapons[slot2].getProjectileChange();
		if (
			(totHealthChange < 0 && this.health + totHealthChange < 0) ||
			(totManaChange < 0 && this.mana + totManaChange < 0) ||
			(totProjectileChange < 0 &&
				this.projectiles + totProjectileChange < 0)
		) {
			return false;
		}
		return true;
	}
	/**Checks if the player has any available actions
	 * @param timing - The action timing
	 * @returns whether the player has any actions
	 */
	checkPlayerActions(timing: 0 | 1 | 2 | 3 | 4): boolean {
		switch (timing) {
			case 0:
				return true;
			case 1:
			case 2:
			case 4:
				return this.spells.some((v, i) => this.check(true, timing, i));
			case 3:
				return (
					this.spells.some((v, i) => this.check(true, timing, i)) ||
					this.weapons.some((v, i) => this.check(false, timing, i))
				);
		}
	}
}
/**Equips a weapon */
export function EquipWeapon(props: {
	/**The player */
	playerCharacter: player;
	/**The weapon to equip */
	weaponry: weapon;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Equips a spell */
export function EquipSpell(props: {
	/**The player */
	playerCharacter: player;
	/**The spell to equip */
	magic: spell;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Equips a helmet */
export function EquipHelmet(props: {
	/**The player */
	playerCharacter: player;
	/**The helmet to equip */
	helmet: armourHead;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Equips a chestplate */
export function EquipChestPlate(props: {
	/**The player */
	playerCharacter: player;
	/**The chestplate to equip */
	chestPlate: armourTorso;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Equips greaves */
export function EquipGreaves(props: {
	/**The player */
	playerCharacter: player;
	/**The greaves to equip */
	greaves: armourLegs;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Equips boots */
export function EquipBoots(props: {
	/**The player */
	playerCharacter: player;
	/**The boots to equip */
	boots: armourFeet;
}): JSX.Element {
	return <Fragment></Fragment>;
}
/**Displays the player's equipment */
export function ShowPlayerEquipment(props: {
	/**The player */
	playerCharacter: player;
}): JSX.Element {
	const playerWeapons: weapon[] = [];
	const playerSpells: spell[] = [];
	let weaponCount: number = props.playerCharacter.getWeaponSlots();
	let spellCount: number = props.playerCharacter.getSpellSlots();
	for (let i: number = 0; i < weaponCount; i++) {
		playerWeapons.push(props.playerCharacter.getWeapon(i));
	}
	for (let i: number = 0; i < spellCount; i++) {
		playerSpells.push(props.playerCharacter.getSpell(i));
	}
	return (
		<Fragment>
			<h5 className="ion-text-center">Armour</h5>
			<IonGrid>
				<IonRow>
					<IonCol>
						<DisplayArmourName
							armourPiece={props.playerCharacter.getHelmet()}
						/>
					</IonCol>
					<IonCol>
						<DisplayArmourName
							armourPiece={props.playerCharacter.getChestPlate()}
						/>
					</IonCol>
				</IonRow>
				<IonRow>
					<IonCol>
						<DisplayArmourName
							armourPiece={props.playerCharacter.getGreaves()}
						/>
					</IonCol>
					<IonCol>
						<DisplayArmourName
							armourPiece={props.playerCharacter.getBoots()}
						/>
					</IonCol>
				</IonRow>
			</IonGrid>
			<IonGrid>
				<IonRow>
					<IonCol>
						<IonList>
							<IonListHeader>Weapons</IonListHeader>
							{playerWeapons.map((w) => (
								<DisplayWeaponName
									weaponry={w}
									key={w.getKey()}
								/>
							))}
						</IonList>
					</IonCol>
					<IonCol>
						<IonList>
							<IonListHeader>Spells</IonListHeader>
							{playerSpells.map((s) => (
								<DisplaySpellName magic={s} key={s.getKey()} />
							))}
						</IonList>
					</IonCol>
				</IonRow>
			</IonGrid>
		</Fragment>
	);
}
/**Displays the player's stats */
export function DisplayPlayerStats(props: {
	/**The player */
	playerCharacter: player;
}): JSX.Element {
	return (
		<IonGrid className="ion-text-center ion-no-padding">
			<IonRow className="player-stats-row">
				<IonCol>
					{Math.abs(props.playerCharacter.getTurnRegen())} health{" "}
					{props.playerCharacter.getTurnRegen() >= 0
						? "gained"
						: "lost"}{" "}
					per turn
				</IonCol>
				<IonCol>
					{Math.abs(props.playerCharacter.getBattleRegen())} health{" "}
					{props.playerCharacter.getBattleRegen() >= 0
						? "gained"
						: "lost"}{" "}
					at end of battle
				</IonCol>
			</IonRow>
			<IonRow className="player-stats-row">
				<IonCol>
					{Math.abs(props.playerCharacter.getTurnManaRegen())} mana{" "}
					{props.playerCharacter.getTurnManaRegen() >= 0
						? "gained"
						: "lost"}{" "}
					per turn
				</IonCol>
				<IonCol>
					{Math.abs(props.playerCharacter.getBattleManaRegen())} mana{" "}
					{props.playerCharacter.getBattleManaRegen() >= 0
						? "gained"
						: "lost"}{" "}
					at end of battle
				</IonCol>
			</IonRow>
			<IonRow className="player-stats-row">
				<IonCol>
					{Math.round(props.playerCharacter.getPoisonResist() * 100)}%
					poison resist
				</IonCol>
				<IonCol>
					{Math.round(props.playerCharacter.getBleedResist() * 100)}%
					bleed resist
				</IonCol>
			</IonRow>
			<IonRow className="player-stats-row">
				{props.playerCharacter.getFlatArmour() == 0 &&
				props.playerCharacter.getPropArmour() == 0 ? (
					<IonCol>No physical armour</IonCol>
				) : null}
				{props.playerCharacter.getFlatArmour() != 0 ? (
					<IonCol>
						Incoming physical damage{" "}
						{props.playerCharacter.getFlatArmour() > 0
							? "reduced"
							: "increased"}{" "}
						by {Math.abs(props.playerCharacter.getFlatArmour())}
					</IonCol>
				) : null}
				{props.playerCharacter.getPropArmour() != 0 ? (
					<IonCol>
						Incoming physical damage{" "}
						{props.playerCharacter.getPropArmour() > 0
							? "increased"
							: "reduced"}{" "}
						by{" "}
						{Math.abs(
							Math.round(props.playerCharacter.getPropArmour())
						)}
						%
					</IonCol>
				) : null}
			</IonRow>
			<IonRow className="player-stats-row">
				{props.playerCharacter.getFlatMagicArmour() == 0 &&
				props.playerCharacter.getPropMagicArmour() == 0 ? (
					<IonCol>No magic armour</IonCol>
				) : null}
				{props.playerCharacter.getFlatMagicArmour() != 0 ? (
					<IonCol>
						Incoming magic damage{" "}
						{props.playerCharacter.getFlatMagicArmour() > 0
							? "reduced"
							: "increased"}{" "}
						by{" "}
						{Math.abs(props.playerCharacter.getFlatMagicArmour())}
					</IonCol>
				) : null}
				{props.playerCharacter.getPropMagicArmour() != 0 ? (
					<IonCol>
						Incoming magic damage{" "}
						{props.playerCharacter.getPropMagicArmour() > 0
							? "increased"
							: "reduced"}{" "}
						by{" "}
						{Math.abs(
							Math.round(
								props.playerCharacter.getPropMagicArmour()
							)
						)}
						%
					</IonCol>
				) : null}
			</IonRow>
			<IonRow className="player-stats-row">
				{props.playerCharacter.getFlatDamageModifier() == 0 &&
				props.playerCharacter.getPropDamageModifier() == 0 ? (
					<IonCol>No physical damage modifier</IonCol>
				) : null}
				{props.playerCharacter.getFlatDamageModifier() != 0 ? (
					<IonCol>
						{props.playerCharacter.getFlatDamageModifier() > 0
							? "+"
							: null}
						{props.playerCharacter.getFlatDamageModifier()} physical
						damage
					</IonCol>
				) : null}
				{props.playerCharacter.getPropDamageModifier() != 0 ? (
					<IonCol>
						{props.playerCharacter.getPropDamageModifier() > 0
							? "+"
							: null}
						{Math.round(
							props.playerCharacter.getPropDamageModifier() * 100
						)}
						% physical damage
					</IonCol>
				) : null}
			</IonRow>
			<IonRow className="player-stats-row">
				{props.playerCharacter.getFlatMagicDamageModifier() == 0 &&
				props.playerCharacter.getPropMagicDamageModifier() == 0 ? (
					<IonCol>No magic damage modifier</IonCol>
				) : null}
				{props.playerCharacter.getFlatMagicDamageModifier() != 0 ? (
					<IonCol>
						{props.playerCharacter.getFlatMagicDamageModifier() > 0
							? "+"
							: null}
						{props.playerCharacter.getFlatMagicDamageModifier()}{" "}
						magic damage
					</IonCol>
				) : null}
				{props.playerCharacter.getPropMagicDamageModifier() != 0 ? (
					<IonCol>
						{props.playerCharacter.getPropMagicDamageModifier() > 0
							? "+"
							: null}
						{Math.round(
							props.playerCharacter.getPropMagicDamageModifier() *
								100
						)}
						% magic damage
					</IonCol>
				) : null}
			</IonRow>
			<IonRow className="player-stats-row">
				{props.playerCharacter.getFlatArmourPiercingDamageModifier() ==
					0 &&
				props.playerCharacter.getPropArmourPiercingDamageModifier() ==
					0 ? (
					<IonCol>No armour piercing damage modifier</IonCol>
				) : null}
				{props.playerCharacter.getFlatArmourPiercingDamageModifier() !=
				0 ? (
					<IonCol>
						{props.playerCharacter.getFlatArmourPiercingDamageModifier() >
						0
							? "+"
							: null}
						{props.playerCharacter.getFlatArmourPiercingDamageModifier()}{" "}
						armour piercing damage
					</IonCol>
				) : null}
				{props.playerCharacter.getPropArmourPiercingDamageModifier() !=
				0 ? (
					<IonCol>
						{props.playerCharacter.getPropArmourPiercingDamageModifier() >
						0
							? "+"
							: null}
						{Math.round(
							props.playerCharacter.getPropArmourPiercingDamageModifier() *
								100
						)}
						% armour piercing damage
					</IonCol>
				) : null}
			</IonRow>
			<IonRow className="player-stats-row">
				<IonCol>
					{Math.round(props.playerCharacter.getEvadeChance() * 100)}%
					evade chance
				</IonCol>
				<IonCol>
					{Math.round(
						props.playerCharacter.getCounterAttackChance() * 100
					)}
					% counter attack chance
				</IonCol>
			</IonRow>
			<IonRow className="player-stats-row">
				<IonCol>
					{Math.max(0, props.playerCharacter.getBonusActions())} bonus
					action
					{props.playerCharacter.getBonusActions() == 1
						? null
						: "s"}{" "}
					per turn
				</IonCol>
				<IonCol>
					{props.playerCharacter.getInitiative()} initiative
				</IonCol>
			</IonRow>
		</IonGrid>
	);
}
/**Displays the player's inventory */
export function ShowPlayerInventory(props: {
	/**The player */
	playerCharacter: player;
	/**A function which closes the inventory */
	closeInventory: () => void;
}): JSX.Element {
	/**True is inventory, false is stats */
	const [segment, setSegment] = useState<boolean>(true);
	return (
		<Fragment>
			<IonHeader>
				<IonToolbar>
					<IonGrid className="ion-no-padding">
						<IonRow>
							<IonCol size="1">
								<IonButton
									size="small"
									fill="clear"
									color="dark"
									onClick={props.closeInventory}
								>
									<IonIcon
										slot="icon-only"
										icon={close}
									></IonIcon>
								</IonButton>
							</IonCol>
							<IonCol size="10">
								<IonTitle className="ion-text-center">
									Level {props.playerCharacter.getLevel()}{" "}
									{props.playerCharacter.getClassName()}
								</IonTitle>
							</IonCol>
						</IonRow>
					</IonGrid>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<h5 className="ion-text-center">Current stats</h5>
				<IonGrid>
					<IonRow>
						<IonCol className="ion-text-center">
							Health: {props.playerCharacter.getHealth()}/
							{props.playerCharacter.getMaxHealth()}
						</IonCol>
						<IonCol className="ion-text-center">
							Mana: {props.playerCharacter.getMana()}/
							{props.playerCharacter.getMaxMana()}
						</IonCol>
						<IonCol className="ion-text-center">
							Arrows: {props.playerCharacter.getProjectiles()}
						</IonCol>
					</IonRow>
					{props.playerCharacter.getStatusEffect() ? (
						<IonRow>
							{props.playerCharacter.getPoison() ? (
								<IonCol className="ion-text-center">
									Poison: {props.playerCharacter.getPoison()}
								</IonCol>
							) : null}
							{props.playerCharacter.getBleed() ? (
								<IonCol className="ion-text-center">
									Bleed: {props.playerCharacter.getBleed()}
								</IonCol>
							) : null}
							{props.playerCharacter.getRegen() ? (
								<IonCol className="ion-text-center">
									Regeneration:{" "}
									{props.playerCharacter.getRegen()}
								</IonCol>
							) : null}
						</IonRow>
					) : null}
				</IonGrid>
				<IonSegment
					mode="ios"
					value={segment ? "inventory" : "stats"}
					onIonChange={() => setSegment(!segment)}
				>
					<IonSegmentButton value="inventory">
						<IonLabel>Inventory</IonLabel>
					</IonSegmentButton>
					<IonSegmentButton value="stats">
						<IonLabel>Stats</IonLabel>
					</IonSegmentButton>
				</IonSegment>
				{segment ? (
					<ShowPlayerEquipment
						playerCharacter={props.playerCharacter}
					/>
				) : (
					<DisplayPlayerStats
						playerCharacter={props.playerCharacter}
					/>
				)}
			</IonContent>
		</Fragment>
	);
}
/**Allows the player to choose an action */
export function ChoosePlayerAction(props: {
	/**The player */
	playerCharacter: player;
	/**The name of the enemy */
	enemyName: string;
	/**Action timing */
	timing: 0 | 1 | 2 | 3 | 4;
	/**A function which takes a choice and proceeds to next battle phase */
	submitChoice: (choice: actionChoice) => void;
	/**Name of first item enemy is using */
	itemName1?: string;
	/**Name of second item enemy is using */
	itemName2?: string;
}): JSX.Element {
	/**Tracks currently selected weapons/spells */
	const [currentChoice, setCurrentChoice] = useState<actionChoice>({
		actionType: 0
	});
	//noActionCheck: {
	//	let spellCount: number = props.playerCharacter.getSpellSlots();
	//	let weaponCount: number = props.playerCharacter.getWeaponSlots();
	//	switch (props.timing) {
	//		case 0:
	//			break noActionCheck;
	//		case 1:
	//		case 2:
	//		case 4:
	//			if (props.playerCharacter.getCurrentBonusActions() <= 0) {
	//				break;
	//			}
	//			for (let i: number = 0; i < spellCount; i++) {
	//				if (
	//					props.playerCharacter.getSpell(i).getReal() &&
	//					props.playerCharacter.getSpell(i).getTiming() != 0
	//				) {
	//					break noActionCheck;
	//				}
	//			}
	//			break;
	//		case 3:
	//			if (props.playerCharacter.getCurrentBonusActions() <= 0) {
	//				break;
	//			}
	//			for (let i: number = 0; i < weaponCount; i++) {
	//				if (
	//					props.playerCharacter.getWeapon(i).getReal() &&
	//					props.playerCharacter.getWeapon(i).getCounterHits() > 0
	//				) {
	//					break noActionCheck;
	//				}
	//			}
	//			for (let i: number = 0; i < spellCount; i++) {
	//				if (
	//					props.playerCharacter.getSpell(i).getReal() &&
	//					props.playerCharacter.getSpell(i).getCounterHits() > 0
	//				) {
	//					break noActionCheck;
	//				}
	//			}
	//			break;
	//	}
	//	props.submitChoice({actionType: 0});
	//	return <IonContent>This should never appear</IonContent>;
	//}
	/**Handles the toggling of a weapon/spell
	 * @param action - false is a weapon, true is a spell
	 * @param slot - the weapon or spell slot toggled
	 */
	function selectHandler(action: boolean, slot: number): void {
		if (action) {
			if (currentChoice.actionType == 2 && currentChoice.slot1 == slot) {
				//Deselecting
				setCurrentChoice({actionType: 0});
				return;
			}
			setCurrentChoice({actionType: 2, slot1: slot});
			return;
		}
		if (currentChoice.actionType == 1 && currentChoice.slot1 == slot) {
			//Deselecting
			setCurrentChoice({actionType: 0});
			return;
		}
		if (currentChoice.actionType == 3) {
			if (currentChoice.slot1 == slot) {
				//Deselecting
				setCurrentChoice({actionType: 1, slot1: currentChoice.slot2});
				return;
			}
			if (currentChoice.slot2 == slot) {
				//Deselecting
				setCurrentChoice({actionType: 1, slot1: currentChoice.slot1});
				return;
			}
		}
		//Selecting a new weapon
		if (props.playerCharacter.getWeapon(slot).getDualWield()) {
			if (currentChoice.actionType == 1) {
				if (currentChoice.slot1 != undefined) {
					if (
						props.playerCharacter.checkDualWeapons(
							props.timing,
							currentChoice.slot1,
							slot
						)
					) {
						setCurrentChoice({
							actionType: 3,
							slot1: currentChoice.slot1,
							slot2: slot
						});
						return;
					}
				}
			}
		}
		setCurrentChoice({actionType: 1, slot1: slot});
		return;
	}
	const weaponArray: boolean[] = Array(
			props.playerCharacter.getWeaponSlots()
		).fill(false),
		spellArray: boolean[] = Array(
			props.playerCharacter.getSpellSlots()
		).fill(false);
	switch (currentChoice.actionType) {
		case 3:
			weaponArray[currentChoice.slot2!] = true;
		case 1:
			weaponArray[currentChoice.slot1!] = true;
			break;
		case 2:
			spellArray[currentChoice.slot1!] = true;
	}
	return (
		<IonContent>
			<div className="ion-text-center">
				{props.timing == 0
					? "Choose an action"
					: (props.timing == 1
							? `${props.enemyName} attacks with ${props.itemName1}`
							: props.timing == 2
							? `${props.enemyName} casts ${props.itemName1}`
							: props.timing == 3
							? "Counter attack opportunity"
							: `${props.enemyName} attacks with ${props.itemName1} and ${props.itemName2}`) +
					  ", choose an action"}
			</div>
			<IonGrid>
				<IonRow>
					<IonCol>
						<IonList>
							<IonListHeader>Weapons</IonListHeader>
							{weaponArray.map((v, i) => (
								<DisplayWeaponName
									key={props.playerCharacter
										.getWeapon(i)
										.getKey()}
									weaponry={props.playerCharacter.getWeapon(
										i
									)}
									inBattle
									selected={v}
									canUse={props.playerCharacter.check(
										false,
										props.timing,
										i
									)}
									onToggle={() => selectHandler(false, i)}
								/>
							))}
						</IonList>
					</IonCol>
					<IonCol>
						<IonList>
							<IonListHeader>Spells</IonListHeader>
							{spellArray.map((v, i) => (
								<DisplaySpellName
									key={props.playerCharacter
										.getSpell(i)
										.getKey()}
									magic={props.playerCharacter.getSpell(i)}
									inBattle
									selected={v}
									canUse={props.playerCharacter.check(
										true,
										props.timing,
										i
									)}
									onToggle={() => selectHandler(true, i)}
								/>
							))}
						</IonList>
					</IonCol>
				</IonRow>
			</IonGrid>
			<IonButton
				mode="ios"
				onClick={() => {
					if (currentChoice.actionType != 0) {
						if (currentChoice.actionType == 3) {
							props.playerCharacter.decBonusActions();
						}
						if (props.timing != 0) {
							props.playerCharacter.decBonusActions();
						}
					}
					props.submitChoice(currentChoice);
				}}
			>
				Submit
			</IonButton>
		</IonContent>
	);
}

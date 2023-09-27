import {useState} from "react";
import {errorMessages, floatFromString, itemKey, numFromString} from "./data";
import {randomInt} from "./rng";
import spellData from "../data/spells.json";
import {
	IonButton,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonModal,
	IonRow,
	IonTitle,
	IonToggle,
	IonToolbar
} from "@ionic/react";
import {close} from "ionicons/icons";
export const SPELL_TYPES_NO = 5;
export const ATTACK_SPELL_FLAT_CUTOFF = 10;
export const ATTACK_SPELL_PROP_CUTOFF = 0.2;
export const HEALING_SPELL_FLAT_CUTOFF = -10;
export const HEALING_SPELL_PROP_CUTOFF = -0.2;

export class spell {
	private key: number | undefined;
	private real: boolean = false;
	private name: string | undefined;
	private description: string | undefined;
	private flatDamageMin: number | undefined;
	private flatDamageMax: number | undefined;
	private flatMagicDamageMin: number | undefined;
	private flatMagicDamageMax: number | undefined;
	private flatArmourPiercingDamageMin: number | undefined;
	private flatArmourPiercingDamageMax: number | undefined;
	private propDamage: number | undefined;
	private flatSelfDamageMin: number | undefined;
	private flatSelfDamageMax: number | undefined;
	private flatSelfMagicDamageMin: number | undefined;
	private flatSelfMagicDamageMax: number | undefined;
	private flatSelfArmourPiercingDamageMin: number | undefined;
	private flatSelfArmourPiercingDamageMax: number | undefined;
	private propSelfDamage: number | undefined;
	private hitCount: number = 1;
	private counterHits: number | undefined;
	private responseHits: number | undefined;
	private noEvade: boolean | undefined;
	private canCounterAttack: boolean | undefined;
	private noCounter: boolean | undefined;
	private manaChangeEnemy: number | undefined;
	private manaChange: number | undefined;
	private projectileChange: number | undefined;
	private poison: number | undefined;
	private selfPoison: number | undefined;
	private bleed: number | undefined;
	private selfBleed: number | undefined;
	private maxHealthModifierEnemy: number | undefined;
	private maxHealthModifier: number | undefined;
	private maxManaModifierEnemy: number | undefined;
	private maxManaModifier: number | undefined;
	private turnManaRegenModifierEnemy: number | undefined;
	private turnManaRegenModifier: number | undefined;
	private battleManaRegenModifierEnemy: number | undefined;
	private battleManaRegenModifier: number | undefined;
	private poisonResistModifierEnemy: number | undefined;
	private poisonResistModifier: number | undefined;
	private bleedResistModifierEnemy: number | undefined;
	private bleedResistModifier: number | undefined;
	private tempRegen: number | undefined;
	private tempRegenSelf: number | undefined;
	private turnRegenModifierEnemy: number | undefined;
	private turnRegenModifier: number | undefined;
	private battleRegenModifierEnemy: number | undefined;
	private battleRegenModifier: number | undefined;
	private flatArmourModifierEnemy: number | undefined;
	private flatArmourModifier: number | undefined;
	private propArmourModifierEnemy: number | undefined;
	private propArmourModifier: number | undefined;
	private flatMagicArmourModifierEnemy: number | undefined;
	private flatMagicArmourModifier: number | undefined;
	private propMagicArmourModifierEnemy: number | undefined;
	private propMagicArmourModifier: number | undefined;
	private flatDamageModifierEnemy: number | undefined;
	private flatDamageModifier: number | undefined;
	private propDamageModifierEnemy: number | undefined;
	private propDamageModifier: number | undefined;
	private flatMagicDamageModifierEnemy: number | undefined;
	private flatMagicDamageModifier: number | undefined;
	private propMagicDamageModifierEnemy: number | undefined;
	private propMagicDamageModifier: number | undefined;
	private flatArmourPiercingDamageModifierEnemy: number | undefined;
	private flatArmourPiercingDamageModifier: number | undefined;
	private propArmourPiercingDamageModifierEnemy: number | undefined;
	private propArmourPiercingDamageModifier: number | undefined;
	private evadeChanceModifierEnemy: number | undefined;
	private evadeChanceModifier: number | undefined;
	private counterAttackChanceModifierEnemy: number | undefined;
	private counterAttackChanceModifier: number | undefined;
	private cooldown: number = 1;
	private currentCooldown: number | undefined;
	/**1 is attack spell, 2 is healing spell, 3 is support spell, 4 is attack and healing, 5 is counter only */
	private spellType: number = 0;
	/**0 is sorcery, 1 is instant, 2 is instant speed only */
	private timing: number | undefined;
	/**0 is no countering, 1 is can counter spells, 2 is can counter weapons, 3 is can counter both */
	private counterSpell: number | undefined;
	private bonusActionsModifierEnemy: number | undefined;
	private bonusActionsModifier: number | undefined;
	private lifeLink: boolean | undefined;
	private healthChange: number | undefined;
	private selfOverHeal: boolean | undefined;
	private targetOverHeal: boolean | undefined;
	/**0 is no effect, 1 is only affects caster, 2 is also target, 3 is only target. 10s digit is for flat damage, units for everything else */
	private effectType: Uint8Array = new Uint8Array(2);
	private upgrade: string | undefined;
	private initiativeModifier: number | undefined;
	constructor(blueprint: string | spell = "EMPTY") {
		if (typeof blueprint == "string") {
			this.loadFromFile(blueprint);
		} else {
			this.key = blueprint.key;
			this.real = blueprint.real;
			if (this.real) {
				this.name = blueprint.name;
				this.description = blueprint.description;
				this.flatDamageMin = blueprint.flatDamageMin;
				this.flatDamageMax = blueprint.flatDamageMax;
				this.flatMagicDamageMin = blueprint.flatMagicDamageMin;
				this.flatMagicDamageMax = blueprint.flatMagicDamageMax;
				this.flatArmourPiercingDamageMin =
					blueprint.flatArmourPiercingDamageMin;
				this.flatArmourPiercingDamageMax =
					blueprint.flatArmourPiercingDamageMax;
				this.propDamage = blueprint.propDamage;
				this.flatSelfDamageMin = blueprint.flatSelfDamageMin;
				this.flatSelfDamageMax = blueprint.flatSelfDamageMax;
				this.flatSelfMagicDamageMin = blueprint.flatSelfMagicDamageMin;
				this.flatSelfMagicDamageMax = blueprint.flatSelfMagicDamageMax;
				this.flatSelfArmourPiercingDamageMin =
					blueprint.flatSelfArmourPiercingDamageMin;
				this.flatSelfArmourPiercingDamageMax =
					blueprint.flatSelfArmourPiercingDamageMax;
				this.propSelfDamage = blueprint.propSelfDamage;
				this.hitCount = blueprint.hitCount;
				this.counterHits = blueprint.counterHits;
				this.responseHits = blueprint.responseHits;
				this.noEvade = blueprint.noEvade;
				this.canCounterAttack = blueprint.canCounterAttack;
				this.noCounter = blueprint.noCounter;
				this.manaChangeEnemy = blueprint.manaChangeEnemy;
				this.manaChange = blueprint.manaChange;
				this.projectileChange = blueprint.projectileChange;
				this.poison = blueprint.poison;
				this.selfPoison = blueprint.selfPoison;
				this.bleed = blueprint.bleed;
				this.selfBleed = blueprint.selfBleed;
				this.maxHealthModifierEnemy = blueprint.maxHealthModifierEnemy;
				this.maxHealthModifier = blueprint.maxHealthModifier;
				this.maxManaModifierEnemy = blueprint.maxManaModifierEnemy;
				this.maxManaModifier = blueprint.maxManaModifier;
				this.turnManaRegenModifierEnemy =
					blueprint.turnManaRegenModifierEnemy;
				this.turnManaRegenModifier = blueprint.turnManaRegenModifier;
				this.battleManaRegenModifierEnemy =
					blueprint.battleManaRegenModifierEnemy;
				this.battleManaRegenModifier =
					blueprint.battleManaRegenModifier;
				this.poisonResistModifierEnemy =
					blueprint.poisonResistModifierEnemy;
				this.poisonResistModifier = blueprint.poisonResistModifier;
				this.bleedResistModifierEnemy =
					blueprint.bleedResistModifierEnemy;
				this.bleedResistModifier = blueprint.bleedResistModifier;
				this.tempRegen = blueprint.tempRegen;
				this.tempRegenSelf = blueprint.tempRegenSelf;
				this.turnRegenModifierEnemy = blueprint.turnRegenModifierEnemy;
				this.turnRegenModifier = blueprint.turnRegenModifier;
				this.battleRegenModifierEnemy =
					blueprint.battleRegenModifierEnemy;
				this.battleRegenModifier = blueprint.battleRegenModifier;
				this.flatArmourModifierEnemy =
					blueprint.flatArmourModifierEnemy;
				this.flatArmourModifier = blueprint.flatArmourModifier;
				this.propArmourModifierEnemy =
					blueprint.propArmourModifierEnemy;
				this.propArmourModifier = blueprint.propArmourModifier;
				this.flatMagicArmourModifierEnemy =
					blueprint.flatMagicArmourModifierEnemy;
				this.flatMagicArmourModifier =
					blueprint.flatMagicArmourModifier;
				this.propMagicArmourModifierEnemy =
					blueprint.propMagicArmourModifierEnemy;
				this.propMagicArmourModifier =
					blueprint.propMagicArmourModifier;
				this.flatDamageModifierEnemy =
					blueprint.flatDamageModifierEnemy;
				this.flatDamageModifier = blueprint.flatDamageModifier;
				this.propDamageModifierEnemy =
					blueprint.propDamageModifierEnemy;
				this.propDamageModifier = blueprint.propDamageModifier;
				this.flatMagicDamageModifierEnemy =
					blueprint.flatMagicDamageModifierEnemy;
				this.flatMagicDamageModifier =
					blueprint.flatMagicDamageModifier;
				this.propMagicDamageModifierEnemy =
					blueprint.propMagicDamageModifierEnemy;
				this.propMagicDamageModifier =
					blueprint.propMagicDamageModifier;
				this.flatArmourPiercingDamageModifierEnemy =
					blueprint.flatArmourPiercingDamageModifierEnemy;
				this.flatArmourPiercingDamageModifier =
					blueprint.flatArmourPiercingDamageModifier;
				this.propArmourPiercingDamageModifierEnemy =
					blueprint.propArmourPiercingDamageModifierEnemy;
				this.propArmourPiercingDamageModifier =
					blueprint.propArmourPiercingDamageModifier;
				this.evadeChanceModifierEnemy =
					blueprint.evadeChanceModifierEnemy;
				this.evadeChanceModifier = blueprint.evadeChanceModifier;
				this.counterAttackChanceModifierEnemy =
					blueprint.counterAttackChanceModifierEnemy;
				this.counterAttackChanceModifier =
					blueprint.counterAttackChanceModifier;
				this.cooldown = blueprint.cooldown;
				this.currentCooldown = blueprint.currentCooldown;
				this.spellType = blueprint.spellType;
				this.timing = blueprint.timing;
				this.counterSpell = blueprint.counterSpell;
				this.bonusActionsModifierEnemy =
					blueprint.bonusActionsModifierEnemy;
				this.bonusActionsModifier = blueprint.bonusActionsModifier;
				this.lifeLink = blueprint.lifeLink;
				this.healthChange = blueprint.healthChange;
				this.selfOverHeal = blueprint.selfOverHeal;
				this.targetOverHeal = blueprint.targetOverHeal;
				this.effectType = blueprint.effectType;
				this.upgrade = blueprint.upgrade;
				this.initiativeModifier = blueprint.initiativeModifier;
			}
		}
	}
	loadFromFile(blueprint: string = "EMPTY"): void {
		this.real = false;
		this.key =
			this.name =
			this.description =
			this.flatDamageMin =
			this.flatDamageMax =
			this.flatMagicDamageMin =
			this.flatMagicDamageMax =
			this.flatArmourPiercingDamageMin =
			this.flatArmourPiercingDamageMax =
			this.propDamage =
			this.flatSelfDamageMin =
			this.flatSelfDamageMax =
			this.flatSelfMagicDamageMin =
			this.flatSelfMagicDamageMax =
			this.flatSelfArmourPiercingDamageMin =
			this.flatSelfArmourPiercingDamageMax =
			this.propSelfDamage =
			this.counterHits =
			this.responseHits =
			this.noEvade =
			this.canCounterAttack =
			this.noCounter =
			this.manaChangeEnemy =
			this.manaChange =
			this.projectileChange =
			this.poison =
			this.selfPoison =
			this.bleed =
			this.selfBleed =
			this.maxHealthModifierEnemy =
			this.maxHealthModifier =
			this.maxManaModifierEnemy =
			this.maxManaModifier =
			this.turnManaRegenModifierEnemy =
			this.turnManaRegenModifier =
			this.battleManaRegenModifierEnemy =
			this.battleManaRegenModifier =
			this.poisonResistModifierEnemy =
			this.poisonResistModifier =
			this.bleedResistModifierEnemy =
			this.bleedResistModifier =
			this.tempRegen =
			this.tempRegenSelf =
			this.turnRegenModifierEnemy =
			this.turnRegenModifier =
			this.battleRegenModifierEnemy =
			this.battleRegenModifier =
			this.flatArmourModifierEnemy =
			this.flatArmourModifier =
			this.propArmourModifierEnemy =
			this.propArmourModifier =
			this.flatMagicArmourModifierEnemy =
			this.flatMagicArmourModifier =
			this.propMagicArmourModifierEnemy =
			this.propMagicArmourModifier =
			this.flatDamageModifierEnemy =
			this.flatDamageModifier =
			this.propDamageModifierEnemy =
			this.propDamageModifier =
			this.flatMagicDamageModifierEnemy =
			this.flatMagicDamageModifier =
			this.propMagicDamageModifierEnemy =
			this.propMagicDamageModifier =
			this.flatArmourPiercingDamageModifierEnemy =
			this.flatArmourPiercingDamageModifier =
			this.propArmourPiercingDamageModifierEnemy =
			this.propArmourPiercingDamageModifier =
			this.evadeChanceModifierEnemy =
			this.evadeChanceModifier =
			this.counterAttackChanceModifierEnemy =
			this.counterAttackChanceModifier =
			this.timing =
			this.counterSpell =
			this.bonusActionsModifierEnemy =
			this.bonusActionsModifier =
			this.lifeLink =
			this.healthChange =
			this.selfOverHeal =
			this.targetOverHeal =
			this.upgrade =
			this.initiativeModifier =
				undefined;
		this.effectType[0] = this.effectType[1] = 0;
		this.hitCount = this.cooldown = 1;
		this.spellType = 0;
		if (blueprint == "EMPTY") {
			return;
		}
		try {
			//@ts-expect-error
			let selectedSpell = spellData[blueprint];
			if (selectedSpell == undefined) {
				throw 2;
			}
			for (let i: number = 0; Array.isArray(selectedSpell); i++) {
				if (i == 10) {
					throw 9;
				}
				if (selectedSpell.length == 0) {
					throw 5;
				}
				blueprint = selectedSpell[randomInt(0, selectedSpell.length)];
				if (blueprint == "EMPTY") {
					return;
				} else if (typeof blueprint != "string") {
					throw 1;
				}
				//@ts-expect-error
				selectedSpell = spellData[blueprint];
				if (selectedSpell == undefined) {
					throw 2;
				}
			}
			this.real = true;
			if (typeof selectedSpell.name == "string") {
				this.name = selectedSpell.name || undefined;
			}
			if (typeof selectedSpell.description == "string") {
				this.description = selectedSpell.description || undefined;
			}
			switch (typeof selectedSpell.flatDamage) {
				case "number":
					this.flatDamageMin = this.flatDamageMax =
						Math.trunc(selectedSpell.flatDamage) || undefined;
					break;
				case "string":
					this.flatDamageMin = this.flatDamageMax =
						numFromString(selectedSpell.flatDamage).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatDamageMin) {
				case "number":
					this.flatDamageMin =
						Math.trunc(selectedSpell.flatDamageMin) || undefined;
					break;
				case "string":
					this.flatDamageMin =
						numFromString(selectedSpell.flatDamageMin).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatDamageMax) {
				case "number":
					this.flatDamageMax =
						Math.trunc(selectedSpell.flatDamageMax) || undefined;
					break;
				case "string":
					this.flatDamageMax =
						numFromString(selectedSpell.flatDamageMax).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatMagicDamage) {
				case "number":
					this.flatMagicDamageMin = this.flatMagicDamageMax =
						Math.trunc(selectedSpell.flatMagicDamage) || undefined;
					break;
				case "string":
					this.flatMagicDamageMin = this.flatMagicDamageMax =
						numFromString(selectedSpell.flatMagicDamage).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatMagicDamageMin) {
				case "number":
					this.flatMagicDamageMin =
						Math.trunc(selectedSpell.flatMagicDamageMin) ||
						undefined;
					break;
				case "string":
					this.flatMagicDamageMin =
						numFromString(selectedSpell.flatMagicDamageMin).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatMagicDamageMax) {
				case "number":
					this.flatMagicDamageMax =
						Math.trunc(selectedSpell.flatMagicDamageMax) ||
						undefined;
					break;
				case "string":
					this.flatMagicDamageMax =
						numFromString(selectedSpell.flatMagicDamageMax).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatArmourPiercingDamage) {
				case "number":
					this.flatArmourPiercingDamageMin =
						this.flatArmourPiercingDamageMax =
							Math.trunc(
								selectedSpell.flatArmourPiercingDamage
							) || undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageMin =
						this.flatArmourPiercingDamageMax =
							numFromString(
								selectedSpell.flatArmourPiercingDamage
							).value || undefined;
			}
			switch (typeof selectedSpell.flatArmourPiercingDamageMin) {
				case "number":
					this.flatArmourPiercingDamageMin =
						Math.trunc(selectedSpell.flatArmourPiercingDamageMin) ||
						undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageMin =
						numFromString(selectedSpell.flatArmourPiercingDamageMin)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatArmourPiercingDamageMax) {
				case "number":
					this.flatArmourPiercingDamageMax =
						Math.trunc(selectedSpell.flatArmourPiercingDamageMax) ||
						undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageMax =
						numFromString(selectedSpell.flatArmourPiercingDamageMax)
							.value || undefined;
			}
			switch (typeof selectedSpell.propDamage) {
				case "number":
					this.propDamage = selectedSpell.propDamage || undefined;
					break;
				case "string":
					this.propDamage =
						floatFromString(selectedSpell.propDamage).value ||
						undefined;
			}
			if (this.propDamage != undefined) {
				if (this.propDamage > 1) {
					this.propDamage = 1;
				} else if (this.propDamage < -1) {
					this.propDamage = -1;
				}
			}
			switch (typeof selectedSpell.flatSelfDamage) {
				case "number":
					this.flatSelfDamageMin = this.flatSelfDamageMax =
						Math.trunc(selectedSpell.flatSelfDamage) || undefined;
					break;
				case "string":
					this.flatSelfDamageMin = this.flatSelfDamageMax =
						numFromString(selectedSpell.flatSelfDamage).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatSelfDamageMin) {
				case "number":
					this.flatSelfDamageMin =
						Math.trunc(selectedSpell.flatSelfDamageMin) ||
						undefined;
					break;
				case "string":
					this.flatSelfDamageMin =
						numFromString(selectedSpell.flatSelfDamageMin).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatSelfDamageMax) {
				case "number":
					this.flatSelfDamageMax =
						Math.trunc(selectedSpell.flatSelfDamageMax) ||
						undefined;
					break;
				case "string":
					this.flatSelfDamageMax =
						numFromString(selectedSpell.flatSelfDamageMax).value ||
						undefined;
			}
			switch (typeof selectedSpell.flatSelfMagicDamage) {
				case "number":
					this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax =
						Math.trunc(selectedSpell.flatSelfMagicDamage) ||
						undefined;
					break;
				case "string":
					this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax =
						numFromString(selectedSpell.flatSelfMagicDamage)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatSelfMagicDamageMin) {
				case "number":
					this.flatSelfMagicDamageMin =
						Math.trunc(selectedSpell.flatSelfMagicDamageMin) ||
						undefined;
					break;
				case "string":
					this.flatSelfMagicDamageMin =
						numFromString(selectedSpell.flatSelfMagicDamageMin)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatSelfMagicDamageMax) {
				case "number":
					this.flatSelfMagicDamageMax =
						Math.trunc(selectedSpell.flatSelfMagicDamageMax) ||
						undefined;
					break;
				case "string":
					this.flatSelfMagicDamageMax =
						numFromString(selectedSpell.flatSelfMagicDamageMax)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatSelfArmourPiercingDamage) {
				case "number":
					this.flatSelfArmourPiercingDamageMin =
						this.flatSelfArmourPiercingDamageMax =
							Math.trunc(
								selectedSpell.flatSelfArmourPiercingDamage
							) || undefined;
					break;
				case "string":
					this.flatSelfArmourPiercingDamageMin =
						this.flatSelfArmourPiercingDamageMax =
							numFromString(
								selectedSpell.flatSelfArmourPiercingDamage
							).value || undefined;
			}
			switch (typeof selectedSpell.flatSelfArmourPiercingDamageMin) {
				case "number":
					this.flatSelfArmourPiercingDamageMin =
						Math.trunc(
							selectedSpell.flatSelfArmourPiercingDamageMin
						) || undefined;
					break;
				case "string":
					this.flatSelfArmourPiercingDamageMin =
						numFromString(
							selectedSpell.flatSelfArmourPiercingDamageMin
						).value || undefined;
			}
			switch (typeof selectedSpell.flatSelfArmourPiercingDamageMax) {
				case "number":
					this.flatSelfArmourPiercingDamageMax =
						Math.trunc(
							selectedSpell.flatSelfArmourPiercingDamageMax
						) || undefined;
					break;
				case "string":
					this.flatSelfArmourPiercingDamageMax =
						numFromString(
							selectedSpell.flatSelfArmourPiercingDamageMax
						).value || undefined;
			}
			switch (typeof selectedSpell.propSelfDamage) {
				case "number":
					this.propSelfDamage =
						selectedSpell.propSelfDamage || undefined;
					break;
				case "string":
					this.propSelfDamage =
						floatFromString(selectedSpell.propSelfDamage).value ||
						undefined;
			}
			if (this.propSelfDamage != undefined) {
				if (this.propSelfDamage > 1) {
					this.propSelfDamage = 1;
				} else if (this.propSelfDamage < -1) {
					this.propSelfDamage = -1;
				}
			}
			switch (typeof selectedSpell.hitCount) {
				case "number":
					this.hitCount = Math.trunc(selectedSpell.hitCount);
					break;
				case "string":
					this.hitCount = numFromString(selectedSpell.hitCount).value;
			}
			if (this.hitCount < 0) {
				this.hitCount = 0;
			}
			switch (typeof selectedSpell.counterHits) {
				case "number":
					this.counterHits =
						Math.trunc(selectedSpell.counterHits) || undefined;
					break;
				case "string":
					this.counterHits =
						numFromString(selectedSpell.counterHits).value ||
						undefined;
			}
			if (this.counterHits != undefined && this.counterHits <= 0) {
				this.counterHits = undefined;
			}
			switch (typeof selectedSpell.responseHits) {
				case "number":
					this.responseHits =
						Math.trunc(selectedSpell.responseHits) || undefined;
					break;
				case "string":
					this.responseHits =
						numFromString(selectedSpell.responseHits).value ||
						undefined;
			}
			if (this.responseHits != undefined && this.responseHits < 0) {
				this.responseHits = 0;
			}
			if (typeof selectedSpell.noEvade == "boolean") {
				this.noEvade = selectedSpell.noEvade || undefined;
			}
			if (typeof selectedSpell.canCounterAttack == "boolean") {
				this.canCounterAttack =
					selectedSpell.canCounterAttack || undefined;
			}
			if (typeof selectedSpell.noCounter == "boolean") {
				this.noCounter = selectedSpell.noCounter || undefined;
			}
			switch (typeof selectedSpell.manaChangeEnemy) {
				case "number":
					this.manaChangeEnemy =
						Math.trunc(selectedSpell.manaChangeEnemy) || undefined;
					break;
				case "string":
					this.manaChangeEnemy =
						numFromString(selectedSpell.manaChangeEnemy).value ||
						undefined;
			}
			switch (typeof selectedSpell.manaChange) {
				case "number":
					this.manaChange =
						Math.trunc(selectedSpell.manaChange) || undefined;
					break;
				case "string":
					this.manaChange =
						numFromString(selectedSpell.manaChange).value ||
						undefined;
			}
			switch (typeof selectedSpell.projectileChange) {
				case "number":
					this.projectileChange =
						Math.trunc(selectedSpell.projectileChange) || undefined;
					break;
				case "string":
					this.projectileChange =
						numFromString(selectedSpell.projectileChange).value ||
						undefined;
			}
			switch (typeof selectedSpell.poison) {
				case "number":
					this.poison = Math.trunc(selectedSpell.poison) || undefined;
					break;
				case "string":
					this.poison =
						numFromString(selectedSpell.poison).value || undefined;
			}
			if (this.poison != undefined) {
				if (this.poison < -255) {
					this.poison = -255;
				} else if (this.poison > 255) {
					this.poison = 255;
				}
			}
			switch (typeof selectedSpell.selfPoison) {
				case "number":
					this.selfPoison =
						Math.trunc(selectedSpell.selfPoison) || undefined;
					break;
				case "string":
					this.selfPoison =
						numFromString(selectedSpell.selfPoison).value ||
						undefined;
			}
			if (this.selfPoison != undefined) {
				if (this.selfPoison < -255) {
					this.selfPoison = -255;
				} else if (this.selfPoison > 255) {
					this.selfPoison = 255;
				}
			}
			switch (typeof selectedSpell.bleed) {
				case "number":
					this.bleed = Math.trunc(selectedSpell.bleed) || undefined;
					break;
				case "string":
					this.bleed =
						numFromString(selectedSpell.bleed).value || undefined;
			}
			if (this.bleed != undefined) {
				if (this.bleed < -255) {
					this.bleed = -255;
				} else if (this.bleed > 255) {
					this.bleed = 255;
				}
			}
			switch (typeof selectedSpell.selfBleed) {
				case "number":
					this.selfBleed =
						Math.trunc(selectedSpell.selfBleed) || undefined;
					break;
				case "string":
					this.selfBleed =
						numFromString(selectedSpell.selfBleed).value ||
						undefined;
			}
			if (this.selfBleed != undefined) {
				if (this.selfBleed < -255) {
					this.selfBleed = -255;
				} else if (this.selfBleed > 255) {
					this.selfBleed = 255;
				}
			}
			switch (typeof selectedSpell.maxHealthModifierEnemy) {
				case "number":
					this.maxHealthModifierEnemy =
						Math.trunc(selectedSpell.maxHealthModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.maxHealthModifierEnemy =
						numFromString(selectedSpell.maxHealthModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.maxHealthModifier) {
				case "number":
					this.maxHealthModifier =
						Math.trunc(selectedSpell.maxHealthModifier) ||
						undefined;
					break;
				case "string":
					this.maxHealthModifier =
						numFromString(selectedSpell.maxHealthModifier).value ||
						undefined;
			}
			switch (typeof selectedSpell.maxManaModifierEnemy) {
				case "number":
					this.maxManaModifierEnemy =
						Math.trunc(selectedSpell.maxManaModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.maxManaModifierEnemy =
						numFromString(selectedSpell.maxManaModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.maxManaModifier) {
				case "number":
					this.maxManaModifier =
						Math.trunc(selectedSpell.maxManaModifier) || undefined;
					break;
				case "string":
					this.maxManaModifier =
						numFromString(selectedSpell.maxManaModifier).value ||
						undefined;
			}
			switch (typeof selectedSpell.turnManaRegenModifierEnemy) {
				case "number":
					this.turnManaRegenModifierEnemy =
						Math.trunc(selectedSpell.turnManaRegenModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.turnManaRegenModifierEnemy =
						numFromString(selectedSpell.turnManaRegenModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.turnManaRegenModifier) {
				case "number":
					this.turnManaRegenModifier =
						Math.trunc(selectedSpell.turnManaRegenModifier) ||
						undefined;
					break;
				case "string":
					this.turnManaRegenModifier =
						numFromString(selectedSpell.turnManaRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedSpell.battleManaRegenModifierEnemy) {
				case "number":
					this.battleManaRegenModifierEnemy =
						Math.trunc(
							selectedSpell.battleManaRegenModifierEnemy
						) || undefined;
					break;
				case "string":
					this.battleManaRegenModifierEnemy =
						numFromString(
							selectedSpell.battleManaRegenModifierEnemy
						).value || undefined;
			}
			switch (typeof selectedSpell.battleManaRegenModifier) {
				case "number":
					this.battleManaRegenModifier =
						Math.trunc(selectedSpell.battleManaRegenModifier) ||
						undefined;
					break;
				case "string":
					this.battleManaRegenModifier =
						numFromString(selectedSpell.battleManaRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedSpell.poisonResistModifierEnemy) {
				case "number":
					this.poisonResistModifierEnemy =
						selectedSpell.poisonResistModifierEnemy || undefined;
					break;
				case "string":
					this.poisonResistModifierEnemy =
						floatFromString(selectedSpell.poisonResistModifierEnemy)
							.value || undefined;
			}
			if (
				this.poisonResistModifierEnemy != undefined &&
				this.poisonResistModifierEnemy < -1
			) {
				this.poisonResistModifierEnemy = -1;
			}
			switch (typeof selectedSpell.poisonResistModifier) {
				case "number":
					this.poisonResistModifier =
						selectedSpell.poisonResistModifier || undefined;
					break;
				case "string":
					this.poisonResistModifier =
						floatFromString(selectedSpell.poisonResistModifier)
							.value || undefined;
			}
			if (
				this.poisonResistModifier != undefined &&
				this.poisonResistModifier < -1
			) {
				this.poisonResistModifier = -1;
			}
			switch (typeof selectedSpell.bleedResistModifierEnemy) {
				case "number":
					this.bleedResistModifierEnemy =
						selectedSpell.bleedResistModifierEnemy || undefined;
					break;
				case "string":
					this.bleedResistModifierEnemy =
						floatFromString(selectedSpell.bleedResistModifierEnemy)
							.value || undefined;
			}
			if (
				this.bleedResistModifierEnemy != undefined &&
				this.bleedResistModifierEnemy < -1
			) {
				this.bleedResistModifierEnemy = -1;
			}
			switch (typeof selectedSpell.bleedResistModifier) {
				case "number":
					this.bleedResistModifier =
						selectedSpell.bleedResistModifier || undefined;
					break;
				case "string":
					this.bleedResistModifier =
						floatFromString(selectedSpell.bleedResistModifier)
							.value || undefined;
			}
			if (
				this.bleedResistModifier != undefined &&
				this.bleedResistModifier < -1
			) {
				this.bleedResistModifier = -1;
			}
			switch (typeof selectedSpell.tempRegen) {
				case "number":
					this.tempRegen =
						Math.trunc(selectedSpell.tempRegen) || undefined;
					break;
				case "string":
					this.tempRegen =
						numFromString(selectedSpell.tempRegen).value ||
						undefined;
			}
			if (this.tempRegen != undefined) {
				if (this.tempRegen < -255) {
					this.tempRegen = -255;
				} else if (this.tempRegen > 255) {
					this.tempRegen = 255;
				}
			}
			switch (typeof selectedSpell.tempRegenSelf) {
				case "number":
					this.tempRegenSelf =
						Math.trunc(selectedSpell.tempRegenSelf) || undefined;
					break;
				case "string":
					this.tempRegenSelf =
						numFromString(selectedSpell.tempRegenSelf).value ||
						undefined;
			}
			if (this.tempRegenSelf != undefined) {
				if (this.tempRegenSelf < -255) {
					this.tempRegenSelf = -255;
				} else if (this.tempRegenSelf > 255) {
					this.tempRegenSelf = 255;
				}
			}
			switch (typeof selectedSpell.turnRegenModifierEnemy) {
				case "number":
					this.turnRegenModifierEnemy =
						Math.trunc(selectedSpell.turnRegenModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.turnRegenModifierEnemy =
						numFromString(selectedSpell.turnRegenModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.turnRegenModifier) {
				case "number":
					this.turnRegenModifier =
						Math.trunc(selectedSpell.turnRegenModifier) ||
						undefined;
					break;
				case "string":
					this.turnRegenModifier =
						numFromString(selectedSpell.turnRegenModifier).value ||
						undefined;
			}
			switch (typeof selectedSpell.battleRegenModifierEnemy) {
				case "number":
					this.battleRegenModifierEnemy =
						Math.trunc(selectedSpell.battleRegenModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.battleRegenModifierEnemy =
						numFromString(selectedSpell.battleRegenModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.battleRegenModifier) {
				case "number":
					this.battleRegenModifier =
						Math.trunc(selectedSpell.battleRegenModifier) ||
						undefined;
					break;
				case "string":
					this.battleRegenModifier =
						numFromString(selectedSpell.battleRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatArmourModifierEnemy) {
				case "number":
					this.flatArmourModifierEnemy =
						Math.trunc(selectedSpell.flatArmourModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.flatArmourModifierEnemy =
						numFromString(selectedSpell.flatArmourModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatArmourModifier) {
				case "number":
					this.flatArmourModifier =
						Math.trunc(selectedSpell.flatArmourModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.flatArmourModifier =
						numFromString(selectedSpell.flatArmourModifier).value ||
						undefined;
			}
			switch (typeof selectedSpell.propArmourModifierEnemy) {
				case "number":
					this.propArmourModifierEnemy =
						selectedSpell.propArmourModifierEnemy || undefined;
					break;
				case "string":
					this.propArmourModifierEnemy =
						floatFromString(selectedSpell.propArmourModifierEnemy)
							.value || undefined;
			}
			if (
				this.propArmourModifierEnemy != undefined &&
				this.propArmourModifierEnemy < -1
			) {
				this.propArmourModifierEnemy = -1;
			}
			switch (typeof selectedSpell.propArmourModifier) {
				case "number":
					this.propArmourModifier =
						selectedSpell.propArmourModifier || undefined;
					break;
				case "string":
					this.propArmourModifier =
						floatFromString(selectedSpell.propArmourModifier)
							.value || undefined;
			}
			if (
				this.propArmourModifier != undefined &&
				this.propArmourModifier < -1
			) {
				this.propArmourModifier = -1;
			}
			switch (typeof selectedSpell.flatMagicArmourModifierEnemy) {
				case "number":
					this.flatMagicArmourModifierEnemy =
						Math.trunc(
							selectedSpell.flatMagicArmourModifierEnemy
						) || undefined;
					break;
				case "string":
					this.flatMagicArmourModifierEnemy =
						numFromString(
							selectedSpell.flatMagicArmourModifierEnemy
						).value || undefined;
			}
			switch (typeof selectedSpell.flatMagicArmourModifier) {
				case "number":
					this.flatMagicArmourModifier =
						Math.trunc(selectedSpell.flatMagicArmourModifier) ||
						undefined;
					break;
				case "string":
					this.flatMagicArmourModifier =
						numFromString(selectedSpell.flatMagicArmourModifier)
							.value || undefined;
			}
			switch (typeof selectedSpell.propMagicArmourModifierEnemy) {
				case "number":
					this.propMagicArmourModifierEnemy =
						selectedSpell.propMagicArmourModifierEnemy || undefined;
					break;
				case "string":
					this.propMagicArmourModifierEnemy =
						floatFromString(
							selectedSpell.flatMagicArmourModifierEnemy
						).value || undefined;
			}
			if (
				this.propMagicArmourModifierEnemy != undefined &&
				this.propMagicArmourModifierEnemy < -1
			) {
				this.propMagicArmourModifierEnemy = -1;
			}
			switch (typeof selectedSpell.propMagicArmourModifier) {
				case "number":
					this.propMagicArmourModifier =
						selectedSpell.propMagicArmourModifier || undefined;
					break;
				case "string":
					this.propMagicArmourModifier =
						floatFromString(selectedSpell.propMagicArmourModifier)
							.value || undefined;
			}
			if (
				this.propMagicArmourModifier != undefined &&
				this.propMagicArmourModifier < -1
			) {
				this.propMagicArmourModifier = -1;
			}
			switch (typeof selectedSpell.flatDamageModifierEnemy) {
				case "number":
					this.flatDamageModifierEnemy =
						Math.trunc(selectedSpell.flatDamageModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.flatDamageModifierEnemy =
						numFromString(selectedSpell.flatDamageModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.flatDamageModifier) {
				case "number":
					this.flatDamageModifier =
						Math.trunc(selectedSpell.flatDamageModifier) ||
						undefined;
					break;
				case "string":
					this.flatDamageModifier =
						numFromString(selectedSpell.flatDamageModifier).value ||
						undefined;
			}
			switch (typeof selectedSpell.propDamageModifierEnemy) {
				case "number":
					this.propDamageModifierEnemy =
						selectedSpell.propDamageModifierEnemy || undefined;
					break;
				case "string":
					this.propDamageModifierEnemy =
						floatFromString(selectedSpell.propDamageModifierEnemy)
							.value || undefined;
			}
			if (
				this.propDamageModifierEnemy != undefined &&
				this.propDamageModifierEnemy < -1
			) {
				this.propDamageModifierEnemy = -1;
			}
			switch (typeof selectedSpell.propDamageModifier) {
				case "number":
					this.propDamageModifier =
						selectedSpell.propDamageModifier || undefined;
					break;
				case "string":
					this.propDamageModifier =
						floatFromString(selectedSpell.propDamageModifier)
							.value || undefined;
			}
			if (
				this.propDamageModifier != undefined &&
				this.propDamageModifier < -1
			) {
				this.propDamageModifier = -1;
			}
			switch (typeof selectedSpell.flatMagicDamageModifierEnemy) {
				case "number":
					this.flatMagicDamageModifierEnemy =
						Math.trunc(
							selectedSpell.flatMagicDamageModifierEnemy
						) || undefined;
					break;
				case "string":
					this.flatMagicDamageModifierEnemy =
						numFromString(
							selectedSpell.flatMagicDamageModifierEnemy
						).value || undefined;
			}
			switch (typeof selectedSpell.flatMagicDamageModifier) {
				case "number":
					this.flatMagicDamageModifier =
						Math.trunc(selectedSpell.flatMagicDamageModifier) ||
						undefined;
					break;
				case "string":
					this.flatMagicDamageModifier =
						numFromString(selectedSpell.flatMagicDamageModifier)
							.value || undefined;
			}
			switch (typeof selectedSpell.propMagicDamageModifierEnemy) {
				case "number":
					this.propMagicDamageModifierEnemy =
						selectedSpell.propMagicDamageModifierEnemy || undefined;
					break;
				case "string":
					this.propMagicDamageModifierEnemy =
						floatFromString(
							selectedSpell.propMagicDamageModifierEnemy
						).value || undefined;
			}
			if (
				this.propMagicDamageModifierEnemy != undefined &&
				this.propMagicDamageModifierEnemy < -1
			) {
				this.propMagicDamageModifierEnemy = -1;
			}
			switch (typeof selectedSpell.propMagicDamageModifier) {
				case "number":
					this.propMagicDamageModifier =
						selectedSpell.propMagicDamageModifier || undefined;
					break;
				case "string":
					this.propMagicDamageModifier =
						floatFromString(selectedSpell.propMagicDamageModifier)
							.value || undefined;
			}
			if (
				this.propMagicDamageModifier != undefined &&
				this.propMagicDamageModifier < -1
			) {
				this.propMagicDamageModifier = -1;
			}
			switch (
				typeof selectedSpell.flatArmourPiercingDamageModifierEnemy
			) {
				case "number":
					this.flatArmourPiercingDamageModifierEnemy =
						Math.trunc(
							selectedSpell.flatArmourPiercingDamageModifierEnemy
						) || undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageModifierEnemy =
						numFromString(
							selectedSpell.flatArmourPiercingDamageModifierEnemy
						).value || undefined;
			}
			switch (typeof selectedSpell.flatArmourPiercingDamageModifier) {
				case "number":
					this.flatArmourPiercingDamageModifier =
						Math.trunc(
							selectedSpell.flatArmourPiercingDamageModifier
						) || undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageModifier =
						numFromString(
							selectedSpell.flatArmourPiercingDamageModifier
						).value || undefined;
			}
			switch (
				typeof selectedSpell.propArmourPiercingDamageModifierEnemy
			) {
				case "number":
					this.propArmourPiercingDamageModifierEnemy =
						selectedSpell.propArmourPiercingDamageModifierEnemy ||
						undefined;
					break;
				case "string":
					this.propArmourPiercingDamageModifierEnemy =
						floatFromString(
							selectedSpell.propArmourPiercingDamageModifierEnemy
						).value || undefined;
			}
			if (
				this.propArmourPiercingDamageModifierEnemy != undefined &&
				this.propArmourPiercingDamageModifierEnemy < -1
			) {
				this.propArmourPiercingDamageModifierEnemy = -1;
			}
			switch (typeof selectedSpell.propArmourPiercingDamageModifier) {
				case "number":
					this.propArmourPiercingDamageModifier =
						selectedSpell.propArmourPiercingDamageModifier ||
						undefined;
					break;
				case "string":
					this.propArmourPiercingDamageModifier =
						floatFromString(
							selectedSpell.propArmourPiercingDamageModifier
						).value || undefined;
			}
			if (
				this.propArmourPiercingDamageModifier != undefined &&
				this.propArmourPiercingDamageModifier < -1
			) {
				this.propArmourPiercingDamageModifier = -1;
			}
			switch (typeof selectedSpell.evadeChanceModifierEnemy) {
				case "number":
					this.evadeChanceModifierEnemy =
						selectedSpell.evadeChanceModifierEnemy || undefined;
					break;
				case "string":
					this.evadeChanceModifierEnemy =
						floatFromString(selectedSpell.evadeChanceModifierEnemy)
							.value || undefined;
			}
			if (
				this.evadeChanceModifierEnemy != undefined &&
				this.evadeChanceModifierEnemy < -1
			) {
				this.evadeChanceModifierEnemy = -1;
			}
			switch (typeof selectedSpell.evadeChanceModifier) {
				case "number":
					this.evadeChanceModifier =
						selectedSpell.evadeChanceModifier || undefined;
					break;
				case "string":
					this.evadeChanceModifier =
						floatFromString(selectedSpell.evadeChanceModifier)
							.value || undefined;
			}
			if (
				this.evadeChanceModifier != undefined &&
				this.evadeChanceModifier < -1
			) {
				this.evadeChanceModifier = -1;
			}
			switch (typeof selectedSpell.counterAttackChanceModifierEnemy) {
				case "number":
					this.counterAttackChanceModifierEnemy =
						selectedSpell.counterAttackChanceModifierEnemy ||
						undefined;
					break;
				case "string":
					this.counterAttackChanceModifierEnemy =
						floatFromString(
							selectedSpell.counterAttackChanceModifierEnemy
						).value || undefined;
			}
			if (
				this.counterAttackChanceModifierEnemy != undefined &&
				this.counterAttackChanceModifierEnemy < -1
			) {
				this.counterAttackChanceModifierEnemy = -1;
			}
			switch (typeof selectedSpell.counterAttackChanceModifier) {
				case "number":
					this.counterAttackChanceModifier =
						selectedSpell.counterAttackChanceModifier || undefined;
					break;
				case "string":
					this.counterAttackChanceModifier =
						floatFromString(
							selectedSpell.counterAttackChanceModifier
						).value || undefined;
			}
			if (
				this.counterAttackChanceModifier != undefined &&
				this.counterAttackChanceModifier < -1
			) {
				this.counterAttackChanceModifier = -1;
			}
			switch (typeof selectedSpell.cooldown) {
				case "number":
					this.cooldown = selectedSpell.cooldown;
					break;
				case "string":
					this.cooldown = numFromString(selectedSpell.cooldown).value;
			}
			if (this.cooldown < 0) {
				this.cooldown = 0;
			}
			switch (typeof selectedSpell.spellType) {
				case "number":
					this.spellType = Math.trunc(selectedSpell.spellType);
					break;
				case "string":
					this.spellType = numFromString(
						selectedSpell.spellType
					).value;
			}
			if (this.spellType < 0 || this.spellType > SPELL_TYPES_NO) {
				this.spellType = 0;
			}
			switch (typeof selectedSpell.timing) {
				case "number":
					this.timing = Math.trunc(selectedSpell.timing) || undefined;
					break;
				case "string":
					this.timing =
						numFromString(selectedSpell.timing).value || undefined;
			}
			if (
				this.timing != undefined &&
				(this.timing < 0 || this.timing > 2)
			) {
				this.timing = undefined;
			}
			switch (typeof selectedSpell.counterSpell) {
				case "number":
					this.counterSpell =
						Math.trunc(selectedSpell.counterSpell) || undefined;
					break;
				case "string":
					this.counterSpell =
						numFromString(selectedSpell.counterSpell).value ||
						undefined;
			}
			if (
				this.counterSpell != undefined &&
				(this.counterSpell < 0 || this.counterSpell > 3)
			) {
				this.counterSpell = undefined;
			}
			switch (typeof selectedSpell.bonusActionsModifierEnemy) {
				case "number":
					this.bonusActionsModifierEnemy =
						Math.trunc(selectedSpell.bonusActionsModifierEnemy) ||
						undefined;
					break;
				case "string":
					this.bonusActionsModifierEnemy =
						numFromString(selectedSpell.bonusActionsModifierEnemy)
							.value || undefined;
			}
			switch (typeof selectedSpell.bonusActionsModifier) {
				case "number":
					this.bonusActionsModifier =
						Math.trunc(selectedSpell.bonusActionsModifier) ||
						undefined;
					break;
				case "string":
					this.bonusActionsModifier =
						numFromString(selectedSpell.bonusActionsModifier)
							.value || undefined;
			}
			if (typeof selectedSpell.lifeLink == "boolean") {
				this.lifeLink = selectedSpell.lifeLink || undefined;
			}
			switch (typeof selectedSpell.healthChange) {
				case "number":
					this.healthChange =
						Math.trunc(selectedSpell.healthChange) || undefined;
					break;
				case "string":
					this.healthChange =
						numFromString(selectedSpell.healthChange).value ||
						undefined;
			}
			if (typeof selectedSpell.selfOverHeal == "boolean") {
				this.selfOverHeal = selectedSpell.selfOverHeal || undefined;
			}
			if (typeof selectedSpell.targetOverHeal == "boolean") {
				this.targetOverHeal = selectedSpell.targetOverHeal || undefined;
			}
			if (typeof selectedSpell.upgrade == "string") {
				this.upgrade = selectedSpell.upgrade || undefined;
			}
			switch (typeof selectedSpell.initiativeModifier) {
				case "number":
					this.initiativeModifier =
						Math.trunc(selectedSpell.initiativeModifier) ||
						undefined;
					break;
				case "string":
					this.initiativeModifier =
						numFromString(selectedSpell.initiativeModifier).value ||
						undefined;
			}
			if (!this.spellType) {
				this.setSpellType();
			}
		} catch (err) {
			switch (err) {
				case 1:
					errorMessages.push(
						`Unable to parse spell blueprint ${blueprint}`
					);
					break;
				case 2:
					errorMessages.push(
						`Unable to find spell blueprint ${blueprint}`
					);
					break;
				case 5:
					errorMessages.push(
						`Spell blueprint list ${blueprint} is empty`
					);
					break;
				case 9:
					errorMessages.push(
						`Exceeded maximum list depth loading spell blueprint ${blueprint}`
					);
					break;
				default:
					throw err;
			}
		}
		this.setEffectType();
		//Ensure max damage values are at least min values
		if ((this.flatDamageMin ?? 0) > (this.flatDamageMax ?? 0)) {
			var buffer: number | undefined = this.flatDamageMin;
			this.flatDamageMin = this.flatDamageMax;
			this.flatDamageMax = buffer;
		}
		if ((this.flatMagicDamageMin ?? 0) > (this.flatMagicDamageMax ?? 0)) {
			var buffer: number | undefined = this.flatMagicDamageMin;
			this.flatMagicDamageMin = this.flatMagicDamageMax;
			this.flatMagicDamageMax = buffer;
		}
		if (
			(this.flatArmourPiercingDamageMin ?? 0) >
			(this.flatArmourPiercingDamageMax ?? 0)
		) {
			var buffer: number | undefined = this.flatArmourPiercingDamageMin;
			this.flatArmourPiercingDamageMin = this.flatArmourPiercingDamageMax;
			this.flatArmourPiercingDamageMax = buffer;
		}
		if ((this.flatSelfDamageMin ?? 0) > (this.flatSelfDamageMax ?? 0)) {
			var buffer: number | undefined = this.flatSelfDamageMin;
			this.flatSelfDamageMin = this.flatSelfDamageMax;
			this.flatSelfDamageMax = buffer;
		}
		if (
			(this.flatSelfMagicDamageMin ?? 0) >
			(this.flatSelfMagicDamageMax ?? 0)
		) {
			var buffer: number | undefined = this.flatSelfMagicDamageMin;
			this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax;
			this.flatSelfMagicDamageMax = buffer;
		}
		if (
			(this.flatSelfArmourPiercingDamageMin ?? 0) >
			(this.flatSelfArmourPiercingDamageMax ?? 0)
		) {
			var buffer: number | undefined =
				this.flatSelfArmourPiercingDamageMin;
			this.flatSelfArmourPiercingDamageMin =
				this.flatSelfArmourPiercingDamageMax;
			this.flatSelfArmourPiercingDamageMax = buffer;
		}
	}
	startCooldown(): void {
		this.currentCooldown = this.cooldown;
	}
	resetCooldown(): void {
		this.currentCooldown = 0;
	}
	decCooldown(): void {
		if (this.currentCooldown != undefined && this.currentCooldown > 0) {
			this.currentCooldown--;
		}
	}
	getKey(): number {
		if (this.key == undefined) {
			this.key = itemKey.gen();
		}
		return this.key;
	}
	getName(): string {
		return this.real && this.name != undefined ? this.name : "None";
	}
	getDescription(): string {
		return this.description ?? "";
	}
	getFlatDamage(): number {
		if (this.flatDamageMin == undefined) {
			return this.flatDamageMax ?? 0;
		}
		return this.flatDamageMax == undefined
			? this.flatDamageMin
			: randomInt(this.flatDamageMin, this.flatDamageMax);
	}
	getFlatDamageMin(): number {
		return this.flatDamageMin ?? 0;
	}
	getFlatDamageMax(): number {
		return this.flatDamageMax ?? 0;
	}
	getFlatMagicDamage(): number {
		if (this.flatMagicDamageMin == undefined) {
			return this.flatMagicDamageMax ?? 0;
		}
		return this.flatMagicDamageMax == undefined
			? this.flatMagicDamageMin
			: randomInt(this.flatMagicDamageMin, this.flatMagicDamageMax);
	}
	getFlatMagicDamageMin(): number {
		return this.flatMagicDamageMin ?? 0;
	}
	getFlatMagicDamageMax(): number {
		return this.flatMagicDamageMax ?? 0;
	}
	getFlatArmourPiercingDamage(): number {
		if (this.flatArmourPiercingDamageMin == undefined) {
			return this.flatArmourPiercingDamageMax ?? 0;
		}
		return this.flatArmourPiercingDamageMax == undefined
			? this.flatArmourPiercingDamageMin
			: randomInt(
					this.flatArmourPiercingDamageMin,
					this.flatArmourPiercingDamageMax
			  );
	}
	getFlatArmourPiercingDamageMin(): number {
		return this.flatArmourPiercingDamageMin ?? 0;
	}
	getFlatArmourPiercingDamageMax(): number {
		return this.flatArmourPiercingDamageMax ?? 0;
	}
	getPropDamage(): number {
		return this.propDamage ?? 0;
	}
	getFlatSelfDamage(): number {
		if (this.flatSelfDamageMin == undefined) {
			return this.flatSelfDamageMax ?? 0;
		}
		return this.flatSelfDamageMax == undefined
			? this.flatSelfDamageMin
			: randomInt(this.flatSelfDamageMin, this.flatSelfDamageMax);
	}
	getFlatSelfDamageMin(): number {
		return this.flatSelfDamageMin ?? 0;
	}
	getFlatSelfDamageMax(): number {
		return this.flatSelfDamageMax ?? 0;
	}
	getFlatSelfMagicDamage(): number {
		if (this.flatSelfMagicDamageMin == undefined) {
			return this.flatSelfMagicDamageMax ?? 0;
		}
		return this.flatSelfMagicDamageMax == undefined
			? this.flatSelfMagicDamageMin
			: randomInt(
					this.flatSelfMagicDamageMin,
					this.flatSelfMagicDamageMax
			  );
	}
	getFlatSelfMagicDamageMin(): number {
		return this.flatSelfMagicDamageMin ?? 0;
	}
	getFlatSelfMagicDamageMax(): number {
		return this.flatSelfMagicDamageMax ?? 0;
	}
	getFlatSelfArmourPiercingDamage(): number {
		if (this.flatSelfArmourPiercingDamageMin == undefined) {
			return this.flatSelfArmourPiercingDamageMax ?? 0;
		}
		return this.flatSelfArmourPiercingDamageMax == undefined
			? this.flatSelfArmourPiercingDamageMin
			: randomInt(
					this.flatSelfArmourPiercingDamageMin,
					this.flatSelfArmourPiercingDamageMax
			  );
	}
	getFlatSelfArmourPiercingDamageMin(): number {
		return this.flatSelfArmourPiercingDamageMin ?? 0;
	}
	getFlatSelfArmourPiercingDamageMax(): number {
		return this.flatSelfArmourPiercingDamageMax ?? 0;
	}
	getPropSelfDamage(): number {
		return this.propSelfDamage ?? 0;
	}
	getHitCount(): number {
		return this.hitCount;
	}
	getNoEvade(): boolean {
		return this.noEvade ?? false;
	}
	getManaChangeEnemy(): number {
		return this.manaChangeEnemy ?? 0;
	}
	getManaChange(): number {
		return this.manaChange ?? 0;
	}
	getProjectileChange(): number {
		return this.projectileChange ?? 0;
	}
	getPoison(): number {
		return this.poison ?? 0;
	}
	getSelfPoison(): number {
		return this.selfPoison ?? 0;
	}
	getBleed(): number {
		return this.bleed ?? 0;
	}
	getSelfBleed(): number {
		return this.selfBleed ?? 0;
	}
	getMaxHealthModifierEnemy(): number {
		return this.maxHealthModifierEnemy ?? 0;
	}
	getMaxHealthModifier(): number {
		return this.maxHealthModifier ?? 0;
	}
	getMaxManaModifierEnemy(): number {
		return this.maxManaModifierEnemy ?? 0;
	}
	getMaxManaModifier(): number {
		return this.maxManaModifier ?? 0;
	}
	getTurnManaRegenModifierEnemy(): number {
		return this.turnManaRegenModifierEnemy ?? 0;
	}
	getTurnManaRegenModifier(): number {
		return this.turnManaRegenModifier ?? 0;
	}
	getBattleManaRegenModifierEnemy(): number {
		return this.battleManaRegenModifierEnemy ?? 0;
	}
	getBattleManaRegenModifier(): number {
		return this.battleManaRegenModifier ?? 0;
	}
	getPoisonResistModifierEnemy(): number {
		return this.poisonResistModifierEnemy ?? 0;
	}
	getPoisonResistModifier(): number {
		return this.poisonResistModifier ?? 0;
	}
	getBleedResistModifierEnemy(): number {
		return this.bleedResistModifierEnemy ?? 0;
	}
	getBleedResistModifier(): number {
		return this.bleedResistModifier ?? 0;
	}
	getTempRegen(): number {
		return this.tempRegen ?? 0;
	}
	getTempRegenSelf(): number {
		return this.tempRegenSelf ?? 0;
	}
	getTurnRegenModifierEnemy(): number {
		return this.turnRegenModifierEnemy ?? 0;
	}
	getTurnRegenModifier(): number {
		return this.turnRegenModifier ?? 0;
	}
	getBattleRegenModifierEnemy(): number {
		return this.battleRegenModifierEnemy ?? 0;
	}
	getBattleRegenModifier(): number {
		return this.battleRegenModifier ?? 0;
	}
	getFlatArmourModifierEnemy(): number {
		return this.flatArmourModifierEnemy ?? 0;
	}
	getFlatArmourModifier(): number {
		return this.flatArmourModifier ?? 0;
	}
	getPropArmourModifierEnemy(): number {
		return this.propArmourModifierEnemy ?? 0;
	}
	getPropArmourModifier(): number {
		return this.propArmourModifier ?? 0;
	}
	getFlatMagicArmourModifierEnemy(): number {
		return this.flatMagicArmourModifierEnemy ?? 0;
	}
	getFlatMagicArmourModifier(): number {
		return this.flatMagicArmourModifier ?? 0;
	}
	getPropMagicArmourModifierEnemy(): number {
		return this.propMagicArmourModifierEnemy ?? 0;
	}
	getPropMagicArmourModifier(): number {
		return this.propMagicArmourModifier ?? 0;
	}
	getFlatDamageModifierEnemy(): number {
		return this.flatDamageModifierEnemy ?? 0;
	}
	getFlatDamageModifier(): number {
		return this.flatDamageModifier ?? 0;
	}
	getPropDamageModifierEnemy(): number {
		return this.propDamageModifierEnemy ?? 0;
	}
	getPropDamageModifier(): number {
		return this.propDamageModifier ?? 0;
	}
	getFlatMagicDamageModifierEnemy(): number {
		return this.flatMagicDamageModifierEnemy ?? 0;
	}
	getFlatMagicDamageModifier(): number {
		return this.flatMagicDamageModifier ?? 0;
	}
	getPropMagicDamageModifierEnemy(): number {
		return this.propMagicDamageModifierEnemy ?? 0;
	}
	getPropMagicDamageModifier(): number {
		return this.propMagicDamageModifier ?? 0;
	}
	getFlatArmourPiercingDamageModifierEnemy(): number {
		return this.flatArmourPiercingDamageModifierEnemy ?? 0;
	}
	getFlatArmourPiercingDamageModifier(): number {
		return this.flatArmourPiercingDamageModifier ?? 0;
	}
	getPropArmourPiercingDamageModifierEnemy(): number {
		return this.propArmourPiercingDamageModifierEnemy ?? 0;
	}
	getPropArmourPiercingDamageModifier(): number {
		return this.propArmourPiercingDamageModifier ?? 0;
	}
	getEvadeChanceModifierEnemy(): number {
		return this.evadeChanceModifierEnemy ?? 0;
	}
	getEvadeChanceModifier(): number {
		return this.evadeChanceModifier ?? 0;
	}
	getCooldown(): number {
		return this.cooldown;
	}
	getCurrentCooldown(): number {
		return this.currentCooldown ?? 0;
	}
	getSpellType(): number {
		return this.spellType;
	}
	getCounterHits(): number {
		return this.counterHits ?? 0;
	}
	getResponseHits(): number {
		return this.responseHits ?? this.hitCount;
	}
	getCanCounterAttack(): boolean {
		return this.canCounterAttack ?? false;
	}
	getTiming(): number {
		return this.timing ?? 0;
	}
	getCounterSpell(): number {
		return this.counterSpell ?? 0;
	}
	getBonusActionsModifierEnemy(): number {
		return this.bonusActionsModifierEnemy ?? 0;
	}
	getBonusActionsModifier(): number {
		return this.bonusActionsModifier ?? 0;
	}
	getNoCounter(): boolean {
		return this.noCounter ?? false;
	}
	getReal(): boolean {
		return this.real;
	}
	getLifeLink(): boolean {
		return this.lifeLink ?? false;
	}
	getHealthChange(): number {
		return this.healthChange ?? 0;
	}
	getEffectType(): Uint8Array {
		return this.effectType;
	}
	getSelfOverHeal(): boolean {
		return this.selfOverHeal ?? false;
	}
	getTargetOverHeal(): boolean {
		return this.targetOverHeal ?? false;
	}
	getInitiativeModifier(): number {
		return this.initiativeModifier ?? 0;
	}
	getUpgrade(): string {
		return this.upgrade ?? "EMPTY";
	}
	getCounterAttackChanceModifierEnemy(): number {
		return this.counterAttackChanceModifierEnemy ?? 0;
	}
	getCounterAttackChanceModifier(): number {
		return this.counterAttackChanceModifier ?? 0;
	}
	/**Sets the type of spell, used by enemy AI */
	setSpellType(): void {
		if (this.flatDamageMin == undefined) {
			var workingTotal: number = this.flatDamageMax ?? 0;
		} else {
			var workingTotal: number =
				this.flatDamageMax == undefined
					? this.flatDamageMin
					: (this.flatDamageMin + this.flatDamageMax) / 2;
		}
		if (this.flatMagicDamageMin == undefined) {
			workingTotal += this.flatMagicDamageMax ?? 0;
		} else {
			workingTotal +=
				this.flatMagicDamageMax == undefined
					? this.flatMagicDamageMin
					: (this.flatMagicDamageMin + this.flatMagicDamageMax) / 2;
		}
		if (this.flatArmourPiercingDamageMin == undefined) {
			workingTotal += this.flatArmourPiercingDamageMax ?? 0;
		} else {
			workingTotal +=
				this.flatArmourPiercingDamageMax == undefined
					? this.flatArmourPiercingDamageMin
					: (this.flatArmourPiercingDamageMin +
							this.flatArmourPiercingDamageMax) /
					  2;
		}
		if (
			workingTotal >= ATTACK_SPELL_FLAT_CUTOFF ||
			(this.propDamage ?? 0) >= ATTACK_SPELL_PROP_CUTOFF
		) {
			if (this.flatSelfDamageMin == undefined) {
				workingTotal = this.flatSelfDamageMax ?? 0;
			} else {
				workingTotal =
					this.flatSelfDamageMax == undefined
						? this.flatSelfDamageMin
						: (this.flatSelfDamageMin + this.flatSelfDamageMax) / 2;
			}
			if (this.flatSelfMagicDamageMin == undefined) {
				workingTotal += this.flatSelfMagicDamageMax ?? 0;
			} else {
				workingTotal +=
					this.flatSelfMagicDamageMax == undefined
						? this.flatSelfMagicDamageMin
						: (this.flatSelfMagicDamageMin +
								this.flatSelfMagicDamageMax) /
						  2;
			}
			if (this.flatSelfArmourPiercingDamageMin == undefined) {
				workingTotal += this.flatSelfArmourPiercingDamageMax ?? 0;
			} else {
				workingTotal +=
					this.flatSelfArmourPiercingDamageMax == undefined
						? this.flatSelfArmourPiercingDamageMin
						: (this.flatSelfArmourPiercingDamageMin +
								this.flatSelfArmourPiercingDamageMax) /
						  2;
			}
			if (
				workingTotal <= HEALING_SPELL_FLAT_CUTOFF ||
				(this.propSelfDamage ?? 0) <= HEALING_SPELL_PROP_CUTOFF
			) {
				this.spellType = 4;
				return;
			}
			this.spellType = 1;
			return;
		}
		if (this.flatSelfDamageMin == undefined) {
			workingTotal = this.flatSelfDamageMax ?? 0;
		} else {
			workingTotal =
				this.flatSelfDamageMax == undefined
					? this.flatSelfDamageMin
					: (this.flatSelfDamageMin + this.flatSelfDamageMax) / 2;
		}
		if (this.flatSelfMagicDamageMin == undefined) {
			workingTotal += this.flatSelfMagicDamageMax ?? 0;
		} else {
			workingTotal +=
				this.flatSelfMagicDamageMax == undefined
					? this.flatSelfMagicDamageMin
					: (this.flatSelfMagicDamageMin +
							this.flatSelfMagicDamageMax) /
					  2;
		}
		if (this.flatSelfArmourPiercingDamageMin == undefined) {
			workingTotal += this.flatSelfArmourPiercingDamageMax ?? 0;
		} else {
			workingTotal +=
				this.flatSelfArmourPiercingDamageMax == undefined
					? this.flatSelfArmourPiercingDamageMin
					: (this.flatSelfArmourPiercingDamageMin +
							this.flatSelfArmourPiercingDamageMax) /
					  2;
		}
		if (
			workingTotal <= HEALING_SPELL_FLAT_CUTOFF ||
			(this.propSelfDamage ?? 0) <= HEALING_SPELL_PROP_CUTOFF
		) {
			this.spellType = 2;
			return;
		}
		this.spellType = 3;
	}
	/**Checks if the spell is the given type, type 4 spells count as type 1 and type 2
	 * @param type - The type to check the spell against
	 */
	checkSpellType(type: number): boolean {
		switch (type) {
			case 1:
				return this.spellType == 1 || this.spellType == 4;
			case 2:
				return this.spellType == 2 || this.spellType == 4;
			default:
				return this.spellType == type;
		}
	}
	/**Checks if the spell has any effect on the caster */
	checkSelfEffect(): boolean {
		return Boolean(
			this.propSelfDamage ||
				this.selfPoison ||
				this.selfBleed ||
				this.maxHealthModifier ||
				this.maxManaModifier ||
				this.turnManaRegenModifier ||
				this.turnRegenModifier ||
				this.battleManaRegenModifier ||
				this.battleRegenModifier ||
				this.poisonResistModifier ||
				this.bleedResistModifier ||
				this.tempRegenSelf ||
				this.flatArmourModifier ||
				this.propArmourModifier ||
				this.flatMagicArmourModifier ||
				this.propMagicArmourModifier ||
				this.flatDamageModifier ||
				this.propDamageModifier ||
				this.flatMagicDamageModifier ||
				this.propMagicDamageModifier ||
				this.flatArmourPiercingDamageModifier ||
				this.propArmourPiercingDamageModifier ||
				this.evadeChanceModifier ||
				this.counterAttackChanceModifier ||
				this.bonusActionsModifier
		);
	}
	/**Checks if the spell affects the target */
	checkTargetEffect(): boolean {
		return Boolean(
			this.propDamage ||
				this.manaChangeEnemy ||
				this.poison ||
				this.bleed ||
				this.maxHealthModifierEnemy ||
				this.maxManaModifierEnemy ||
				this.turnManaRegenModifierEnemy ||
				this.battleManaRegenModifierEnemy ||
				this.poisonResistModifierEnemy ||
				this.bleedResistModifierEnemy ||
				this.tempRegen ||
				this.turnRegenModifierEnemy ||
				this.battleRegenModifierEnemy ||
				this.flatArmourModifierEnemy ||
				this.propArmourModifierEnemy ||
				this.flatMagicArmourModifierEnemy ||
				this.propMagicArmourModifierEnemy ||
				this.flatDamageModifierEnemy ||
				this.propDamageModifierEnemy ||
				this.flatMagicDamageModifierEnemy ||
				this.propMagicDamageModifierEnemy ||
				this.flatArmourPiercingDamageModifierEnemy ||
				this.propArmourPiercingDamageModifierEnemy ||
				this.evadeChanceModifierEnemy ||
				this.counterAttackChanceModifierEnemy ||
				this.bonusActionsModifierEnemy
		);
	}
	/**Sets effectType */
	setEffectType(): void {
		if (this.checkSelfEffect()) {
			if (this.checkTargetEffect()) {
				this.effectType[0] = 2;
			} else {
				this.effectType[0] = 1;
			}
		} else {
			if (this.checkTargetEffect()) {
				this.effectType[0] = 3;
			} else {
				this.effectType[0] = 0;
			}
		}
		if (this.checkSelfDamage()) {
			if (this.checkTargetDamage()) {
				this.effectType[1] = 2;
			} else {
				this.effectType[1] = 1;
			}
		} else {
			if (this.checkTargetDamage()) {
				this.effectType[1] = 3;
			} else {
				this.effectType[1] = 0;
			}
		}
	}
	checkSelfDamage(): boolean {
		return Boolean(
			this.flatSelfDamageMin ||
				this.flatSelfDamageMax ||
				this.flatSelfMagicDamageMin ||
				this.flatSelfMagicDamageMax ||
				this.flatSelfArmourPiercingDamageMin ||
				this.flatSelfArmourPiercingDamageMax
		);
	}
	checkTargetDamage(): boolean {
		return Boolean(
			this.flatDamageMin ||
				this.flatDamageMax ||
				this.flatMagicDamageMin ||
				this.flatMagicDamageMax ||
				this.flatArmourPiercingDamageMin ||
				this.flatArmourPiercingDamageMax
		);
	}
	toString(): string {
		return this.name ?? "None";
	}
}
/**Displays a spell panel in the inventory or in battle */
export function DisplaySpellName(props: {
	/**The spell */
	magic: spell;
	/**True if displaying for selection in battle */
	inBattle?: boolean;
	/**Is it currently selected */
	selected?: boolean;
	/**Is the player allowed to use it */
	canUse?: boolean;
	/**A function to be run on selection being toggled */
	onToggle?: () => void;
}): React.JSX.Element {
	if (!props.magic.getReal()) {
		return (
			<IonItem>
				<IonLabel className="ion-text-center">None</IonLabel>
			</IonItem>
		);
	}
	const [isOpen, setIsOpen] = useState<boolean>(false);
	return (
		<IonItem>
			<IonLabel className="ion-text-center">
				{props.magic.getName()}
				{props.magic.getHealthChange() != 0 ||
				props.magic.getManaChange() != 0 ||
				props.magic.getProjectileChange() != 0 ? (
					<IonLabel className="equipment-costs">
						{props.magic.getHealthChange() != 0
							? ` ${
									props.magic.getHealthChange() > 0 ? "+" : ""
							  }${props.magic.getHealthChange()} health `
							: null}
						{props.magic.getManaChange() != 0
							? ` ${
									props.magic.getManaChange() > 0 ? "+" : ""
							  }${props.magic.getManaChange()} mana `
							: null}
						{props.magic.getHealthChange() != 0 &&
						props.magic.getManaChange() != 0 &&
						props.magic.getProjectileChange() != 0
							? "\n"
							: null}
						{props.magic.getProjectileChange() != 0
							? ` ${
									props.magic.getProjectileChange() > 0
										? "+"
										: ""
							  }${props.magic.getProjectileChange()} arrow${
									Math.abs(
										props.magic.getProjectileChange()
									) != 1
										? "s"
										: ""
							  } `
							: null}
					</IonLabel>
				) : null}
				{props.inBattle && props.magic.getCurrentCooldown() > 0 ? (
					<IonLabel className="cooldown">
						On cooldown: {props.magic.getCurrentCooldown()}
					</IonLabel>
				) : null}
			</IonLabel>
			{props.inBattle ? (
				<IonToggle
					aria-label="select spell"
					slot="end"
					checked={props.selected}
					disabled={!props.canUse}
					onIonChange={props.onToggle}
				></IonToggle>
			) : (
				<IonButton
					slot="end"
					mode="ios"
					size="small"
					onClick={() => setIsOpen(true)}
				>
					Stats
				</IonButton>
			)}
			<IonModal isOpen={isOpen} backdropDismiss={false}>
				<IonHeader>
					<IonToolbar className="ion-text-center">
						<IonGrid className="ion-no-padding">
							<IonRow>
								<IonCol size="1">
									<IonButton
										size="small"
										onClick={() => setIsOpen(false)}
										fill="clear"
										color="dark"
									>
										<IonIcon
											slot="icon-only"
											icon={close}
										></IonIcon>
									</IonButton>
								</IonCol>
								<IonCol size="10">
									<IonTitle>{props.magic.getName()}</IonTitle>
								</IonCol>
							</IonRow>
						</IonGrid>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<DisplaySpellStats magic={props.magic} />
				</IonContent>
			</IonModal>
		</IonItem>
	);
}
/**Displays spell stats */
export function DisplaySpellStats(props: {
	/**The spell */
	magic: spell;
}): React.JSX.Element {
	var healingMin: number = 0,
		healingMax: number = 0,
		healingSelfMin: number = 0,
		healingSelfMax: number = 0;
	if (props.magic.getFlatDamageMax() <= 0) {
		healingMin -= props.magic.getFlatDamageMax();
		healingMin -= props.magic.getFlatDamageMin();
	}
	if (props.magic.getFlatMagicDamageMax() <= 0) {
		healingMin -= props.magic.getFlatMagicDamageMax();
		healingMax -= props.magic.getFlatMagicDamageMin();
	}
	if (props.magic.getFlatArmourPiercingDamageMax() <= 0) {
		healingMin -= props.magic.getFlatArmourPiercingDamageMax();
		healingMax -= props.magic.getFlatArmourPiercingDamageMin();
	}
	if (props.magic.getFlatSelfDamageMax() <= 0) {
		healingSelfMin -= props.magic.getFlatSelfDamageMax();
		healingSelfMax -= props.magic.getFlatSelfDamageMin();
	}
	if (props.magic.getFlatSelfMagicDamageMax() <= 0) {
		healingSelfMin -= props.magic.getFlatSelfMagicDamageMax();
		healingSelfMax -= props.magic.getFlatSelfMagicDamageMin();
	}
	if (props.magic.getFlatSelfArmourPiercingDamageMax() <= 0) {
		healingSelfMin -= props.magic.getFlatSelfArmourPiercingDamageMax();
		healingSelfMax -= props.magic.getFlatSelfArmourPiercingDamageMin();
	}
	return (
		<IonList>
			<IonListHeader>{props.magic.getDescription()}</IonListHeader>
			{props.magic.getFlatDamageMin() ==
			props.magic.getFlatDamageMax() ? (
				props.magic.getFlatDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatDamageMax()} physical damage
					</IonItem>
				) : null
			) : props.magic.getFlatDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatDamageMin()} to{" "}
					{props.magic.getFlatDamageMax()} physical damage
				</IonItem>
			) : props.magic.getFlatDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatDamageMin()} to{" "}
					{props.magic.getFlatDamageMax()} physical damage, negative
					damage will heal the target
				</IonItem>
			) : null}
			{props.magic.getFlatMagicDamageMin() ==
			props.magic.getFlatMagicDamageMax() ? (
				props.magic.getFlatMagicDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatMagicDamageMax()} magic damage
					</IonItem>
				) : null
			) : props.magic.getFlatMagicDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatMagicDamageMin()} to{" "}
					{props.magic.getFlatMagicDamageMax()} magic damage
				</IonItem>
			) : props.magic.getFlatMagicDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatMagicDamageMin()} to{" "}
					{props.magic.getFlatMagicDamageMax()} magic damage, negative
					damage will heal the target
				</IonItem>
			) : null}
			{props.magic.getFlatArmourPiercingDamageMin() ==
			props.magic.getFlatArmourPiercingDamageMax() ? (
				props.magic.getFlatArmourPiercingDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatArmourPiercingDamageMax()}{" "}
						armour piercing damage
					</IonItem>
				) : null
			) : props.magic.getFlatArmourPiercingDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatArmourPiercingDamageMin()} to{" "}
					{props.magic.getFlatArmourPiercingDamageMax()} armour
					piercing damage
				</IonItem>
			) : props.magic.getFlatArmourPiercingDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatArmourPiercingDamageMin()} to{" "}
					{props.magic.getFlatArmourPiercingDamageMax()} armour
					piercing damage, negative damage will heal the target
				</IonItem>
			) : null}
			{healingMax > 0 ? (
				<IonItem>
					Heals the target for {healingMin}{" "}
					{healingMin != healingMax ? ` to ${healingMax}` : ""}
				</IonItem>
			) : null}
			{props.magic.getTargetOverHeal() ? (
				<IonItem>Attacks may over heal the target</IonItem>
			) : null}
			{props.magic.getPropDamage() > 0 ? (
				<IonItem>
					Reduces target's health by{" "}
					{Math.round(100 * props.magic.getPropDamage())}% per hit
				</IonItem>
			) : props.magic.getPropDamage() < 0 ? (
				<IonItem>
					Heals the target for{" "}
					{Math.round(-100 * props.magic.getPropDamage())}% of their
					maximum health per hit
				</IonItem>
			) : null}
			{props.magic.getFlatSelfDamageMin() ==
			props.magic.getFlatSelfDamageMax() ? (
				props.magic.getFlatSelfDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatSelfDamageMax()} physical
						damage to user on cast
					</IonItem>
				) : null
			) : props.magic.getFlatSelfDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfDamageMin()} to{" "}
					{props.magic.getFlatSelfDamageMax()} physical damage to user
					on cast
				</IonItem>
			) : props.magic.getFlatSelfDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfDamageMin()} to{" "}
					{props.magic.getFlatSelfDamageMax()} physical damage to user
					on cast, negative damage will heal
				</IonItem>
			) : null}
			{props.magic.getFlatSelfMagicDamageMin() ==
			props.magic.getFlatSelfMagicDamageMax() ? (
				props.magic.getFlatSelfMagicDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatSelfMagicDamageMax()} magic
						damage to user on cast
					</IonItem>
				) : null
			) : props.magic.getFlatSelfMagicDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfMagicDamageMin()} to{" "}
					{props.magic.getFlatSelfMagicDamageMax()} magic damage to
					user on cast
				</IonItem>
			) : props.magic.getFlatSelfMagicDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfMagicDamageMin()} to{" "}
					{props.magic.getFlatSelfMagicDamageMax()} magic damage to
					user on cast, negative damage will heal
				</IonItem>
			) : null}
			{props.magic.getFlatSelfArmourPiercingDamageMin() ==
			props.magic.getFlatSelfArmourPiercingDamageMax() ? (
				props.magic.getFlatSelfArmourPiercingDamageMax() > 0 ? (
					<IonItem>
						Deals {props.magic.getFlatSelfArmourPiercingDamageMax()}{" "}
						armour piercing damage to user on cast
					</IonItem>
				) : null
			) : props.magic.getFlatSelfArmourPiercingDamageMin() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfArmourPiercingDamageMin()} to{" "}
					{props.magic.getFlatSelfArmourPiercingDamageMax()} armour
					piercing damage to user on cast
				</IonItem>
			) : props.magic.getFlatSelfArmourPiercingDamageMax() >= 0 ? (
				<IonItem>
					Deals {props.magic.getFlatSelfArmourPiercingDamageMin()} to{" "}
					{props.magic.getFlatSelfArmourPiercingDamageMax()} armour
					piercing damage to user on cast, negative damage will heal
				</IonItem>
			) : null}
			{healingSelfMax > 0 ? (
				<IonItem>
					Heals user for {healingSelfMin}{" "}
					{healingSelfMin != healingSelfMax
						? ` to ${healingSelfMax}`
						: ""}
				</IonItem>
			) : null}
			{props.magic.getSelfOverHeal() ? (
				<IonItem>May over heal the caster</IonItem>
			) : null}
			{props.magic.getPropSelfDamage() > 0 ? (
				<IonItem>
					Reduces users's health by{" "}
					{Math.round(100 * props.magic.getPropSelfDamage())}% on cast
				</IonItem>
			) : props.magic.getPropSelfDamage() < 0 ? (
				<IonItem>
					Heals the user for{" "}
					{Math.round(-100 * props.magic.getPropSelfDamage())}% of
					their maximum health on cast
				</IonItem>
			) : null}
			{props.magic.getHealthChange() > 0 ? (
				<IonItem>
					User is healed for {props.magic.getHealthChange()}, even if
					spell is countered
				</IonItem>
			) : props.magic.getHealthChange() < 0 ? (
				<IonItem>
					Costs {-props.magic.getHealthChange()} health to cast (even
					if countered)
				</IonItem>
			) : null}
			{props.magic.getLifeLink() ? (
				<IonItem>
					On dealing damage to target, heals the caster by that much
				</IonItem>
			) : null}
			{props.magic.getHitCount() <= 0 ? (
				<IonItem>Cannot attack</IonItem>
			) : props.magic.getHitCount() == 2 ? (
				<IonItem>Hits twice per cast</IonItem>
			) : props.magic.getHitCount() > 2 ? (
				<IonItem>
					Hits {props.magic.getHitCount()} times per cast
				</IonItem>
			) : null}
			{props.magic.getResponseHits() != props.magic.getHitCount() &&
			props.magic.getTiming() != 0 ? (
				<IonItem>
					When cast in response to enemy action, hits{" "}
					{props.magic.getResponseHits() == 1
						? "once"
						: props.magic.getResponseHits() == 2
						? "twice"
						: `${props.magic.getResponseHits()} times`}
				</IonItem>
			) : null}
			{props.magic.getCounterHits() >= 1 ? (
				<IonItem>
					Usable for counter attacks, hits{" "}
					{props.magic.getCounterHits() == 1
						? "once"
						: props.magic.getCounterHits() == 2
						? "twice"
						: `${props.magic.getCounterHits()} times`}
				</IonItem>
			) : null}
			{props.magic.getNoEvade() ? (
				<IonItem>Cannot be dodged</IonItem>
			) : null}
			{props.magic.getCanCounterAttack() ? (
				<IonItem>Allows counter attacks</IonItem>
			) : null}
			{props.magic.getNoCounter() ? (
				<IonItem>Cannot be countered</IonItem>
			) : null}
			{props.magic.getTiming() == 1 ? (
				<IonItem>Can be cast in response to enemy action</IonItem>
			) : props.magic.getTiming() == 2 ? (
				<IonItem>Can only be cast in response to enemy action</IonItem>
			) : null}
			{props.magic.getCounterSpell() == 1 ||
			props.magic.getCounterSpell() == 3 ? (
				<IonItem>
					Can counter spells if cast in response, preventing their
					effects
				</IonItem>
			) : null}
			{props.magic.getCounterSpell() == 2 ||
			props.magic.getCounterSpell() == 3 ? (
				<IonItem>
					Can shield against some weapon attacks if cast in response,
					preventing their effects
				</IonItem>
			) : null}
			{props.magic.getBonusActionsModifierEnemy() == 1 ? (
				<IonItem>
					Target gains an additional bonus action (applied on hit)
				</IonItem>
			) : props.magic.getBonusActionsModifierEnemy() > 1 ? (
				<IonItem>
					Target gains {props.magic.getBonusActionsModifierEnemy()}{" "}
					additional bonus actions (applied on hit)
				</IonItem>
			) : props.magic.getBonusActionsModifierEnemy() == -1 ? (
				<IonItem>Target loses a bonus action (applied on hit)</IonItem>
			) : props.magic.getBonusActionsModifierEnemy() < -1 ? (
				<IonItem>
					Target loses {-props.magic.getBonusActionsModifierEnemy()}{" "}
					bonus actions (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getBonusActionsModifier() == 1 ? (
				<IonItem>Gain an additional bonus action on cast</IonItem>
			) : props.magic.getBonusActionsModifier() > 1 ? (
				<IonItem>
					Gain {props.magic.getBonusActionsModifier()} additional
					bonus actions on cast
				</IonItem>
			) : props.magic.getBonusActionsModifier() == -1 ? (
				<IonItem>Lose a bonus action on cast</IonItem>
			) : props.magic.getBonusActionsModifier() ? (
				<IonItem>
					Lose {-props.magic.getBonusActionsModifier()} bonus actions
					on cast
				</IonItem>
			) : null}
			{props.magic.getManaChangeEnemy() < 0 ? (
				<IonItem>
					Target loses {-props.magic.getManaChangeEnemy()} mana per
					hit
				</IonItem>
			) : props.magic.getManaChangeEnemy() > 0 ? (
				<IonItem>
					Target gains {props.magic.getManaChangeEnemy()} mana per hit
				</IonItem>
			) : null}
			{props.magic.getManaChange() < 0 ? (
				<IonItem>
					Costs {-props.magic.getManaChange()} mana to cast
				</IonItem>
			) : props.magic.getManaChange() > 0 ? (
				<IonItem>
					Gain {props.magic.getManaChange()} mana on cast
				</IonItem>
			) : null}
			{props.magic.getProjectileChange() == -1 ? (
				<IonItem>Requires 1 arrow to cast</IonItem>
			) : props.magic.getProjectileChange() < -1 ? (
				<IonItem>
					Requires {-props.magic.getProjectileChange()} arrows to cast
				</IonItem>
			) : props.magic.getProjectileChange() == 1 ? (
				<IonItem>Regain 1 arrow on cast</IonItem>
			) : props.magic.getProjectileChange() > 1 ? (
				<IonItem>
					Regain {props.magic.getProjectileChange()} arrows on cast
				</IonItem>
			) : null}
			<IonItem>Cooldown: {props.magic.getCooldown()}</IonItem>
			{props.magic.getPoison() > 0 ? (
				<IonItem>
					Applies {props.magic.getPoison()} poison to target on hit
				</IonItem>
			) : props.magic.getPoison() == -255 ? (
				<IonItem>Removes all poison from target on hit</IonItem>
			) : props.magic.getPoison() < 0 ? (
				<IonItem>
					Removes {-props.magic.getPoison()} poison from target on hit
				</IonItem>
			) : null}
			{props.magic.getSelfPoison() > 0 ? (
				<IonItem>
					Applies {props.magic.getSelfPoison()} poison to user on cast
				</IonItem>
			) : props.magic.getSelfPoison() == -255 ? (
				<IonItem>Removes all poison from user on cast</IonItem>
			) : props.magic.getSelfPoison() < 0 ? (
				<IonItem>
					Removes {-props.magic.getSelfPoison()} poison from user on
					cast
				</IonItem>
			) : null}
			{props.magic.getPoisonResistModifierEnemy() != 0 ? (
				<IonItem>
					On hit, target gets{" "}
					{props.magic.getPoisonResistModifierEnemy() > 0 ? "+" : ""}
					{Math.round(
						100 * props.magic.getPoisonResistModifierEnemy()
					)}
					% poison resist
				</IonItem>
			) : null}
			{props.magic.getPoisonResistModifier() != 0 ? (
				<IonItem>
					On cast, user gets{" "}
					{props.magic.getPoisonResistModifier() > 0 ? "+" : ""}
					{Math.round(100 * props.magic.getPoisonResistModifier())}%
					poison resist
				</IonItem>
			) : null}
			{props.magic.getBleed() > 0 ? (
				<IonItem>
					Applies {props.magic.getBleed()} bleed to target on hit
				</IonItem>
			) : props.magic.getBleed() == -255 ? (
				<IonItem>Removes all bleed from target on hit</IonItem>
			) : props.magic.getBleed() < 0 ? (
				<IonItem>
					Removes {-props.magic.getBleed()} bleed from target on hit
				</IonItem>
			) : null}
			{props.magic.getSelfBleed() > 0 ? (
				<IonItem>
					Applies {props.magic.getSelfBleed()} bleed to user on cast
				</IonItem>
			) : props.magic.getSelfBleed() == -255 ? (
				<IonItem>Removes all bleed from user on cast</IonItem>
			) : props.magic.getSelfBleed() < 0 ? (
				<IonItem>
					Removes {-props.magic.getSelfBleed()} bleed from user on
					cast
				</IonItem>
			) : null}
			{props.magic.getBleedResistModifierEnemy() != 0 ? (
				<IonItem>
					On hit, target gets{" "}
					{props.magic.getBleedResistModifierEnemy() > 0 ? "+" : ""}
					{Math.round(
						100 * props.magic.getBleedResistModifierEnemy()
					)}
					% bleed resist
				</IonItem>
			) : null}
			{props.magic.getBleedResistModifier() != 0 ? (
				<IonItem>
					On cast, user gets{" "}
					{props.magic.getBleedResistModifier() > 0 ? "+" : ""}
					{Math.round(100 * props.magic.getBleedResistModifier())}%
					bleed resist
				</IonItem>
			) : null}
			{props.magic.getMaxHealthModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's maximum health by{" "}
					{props.magic.getMaxHealthModifierEnemy()} on hit
				</IonItem>
			) : props.magic.getMaxHealthModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's maximum health by{" "}
					{-props.magic.getMaxHealthModifierEnemy()} on hit
				</IonItem>
			) : null}
			{props.magic.getMaxHealthModifier() > 0 ? (
				<IonItem>
					Increases user's maximum health by{" "}
					{props.magic.getMaxHealthModifier()} on cast
				</IonItem>
			) : props.magic.getMaxHealthModifier() < 0 ? (
				<IonItem>
					Reduces user's maximum health by{" "}
					{-props.magic.getMaxHealthModifier()} on cast
				</IonItem>
			) : null}
			{props.magic.getTempRegen() > 0 ? (
				<IonItem>
					Applies {props.magic.getTempRegen()} regeneration to target
					on hit
				</IonItem>
			) : props.magic.getTempRegen() == -255 ? (
				<IonItem>Removes all regeneration from target on hit</IonItem>
			) : props.magic.getTempRegen() < 0 ? (
				<IonItem>
					Removes {-props.magic.getTempRegen()} regeneration from
					target on hit
				</IonItem>
			) : null}
			{props.magic.getTempRegenSelf() > 0 ? (
				<IonItem>
					Applies {props.magic.getTempRegenSelf()} regeneration to
					user on cast
				</IonItem>
			) : props.magic.getTempRegenSelf() == -255 ? (
				<IonItem>Removes all regeneration from user on cast</IonItem>
			) : props.magic.getTempRegenSelf() < 0 ? (
				<IonItem>
					Removes {-props.magic.getTempRegenSelf()} regeneration from
					user on cast
				</IonItem>
			) : null}
			{props.magic.getTurnRegenModifierEnemy() != 0 ? (
				<IonItem>
					Target gets{" "}
					{props.magic.getTurnRegenModifierEnemy() > 0 ? "+" : ""}
					{props.magic.getTurnRegenModifierEnemy()} health per turn
					(applied on hit)
				</IonItem>
			) : null}
			{props.magic.getTurnRegenModifier() != 0 ? (
				<IonItem>
					User gets{" "}
					{props.magic.getTurnRegenModifier() > 0 ? "+" : ""}
					{props.magic.getTurnRegenModifier()} health per turn
				</IonItem>
			) : null}
			{props.magic.getBattleRegenModifierEnemy() != 0 ? (
				<IonItem>
					Target gains{" "}
					{props.magic.getBattleRegenModifierEnemy() > 0 ? "+" : ""}
					{props.magic.getBattleRegenModifierEnemy()} health at end of
					battle (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getBattleRegenModifier() != 0 ? (
				<IonItem>
					User gets{" "}
					{props.magic.getBattleRegenModifier() > 0 ? "+" : ""}
					{props.magic.getBattleRegenModifier()} health at end of
					battle
				</IonItem>
			) : null}
			{props.magic.getMaxManaModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's maximum mana by{" "}
					{props.magic.getMaxManaModifierEnemy()} on hit
				</IonItem>
			) : props.magic.getMaxManaModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's maximum mana by{" "}
					{-props.magic.getMaxManaModifierEnemy()} on hit
				</IonItem>
			) : null}
			{props.magic.getMaxManaModifier() > 0 ? (
				<IonItem>
					Increases user's maximum mana by{" "}
					{props.magic.getMaxManaModifier()} on cast
				</IonItem>
			) : props.magic.getMaxManaModifier() < 0 ? (
				<IonItem>
					Reduces user's maximum mana by{" "}
					{-props.magic.getMaxManaModifier()} on cast
				</IonItem>
			) : null}
			{props.magic.getTurnManaRegenModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's mana recovery by{" "}
					{props.magic.getTurnManaRegenModifierEnemy()} on hit
				</IonItem>
			) : props.magic.getTurnManaRegenModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's mana recovery by{" "}
					{-props.magic.getTurnManaRegenModifierEnemy()} on hit
				</IonItem>
			) : null}
			{props.magic.getTurnManaRegenModifier() > 0 ? (
				<IonItem>
					Increases user's mana recovery by{" "}
					{props.magic.getTurnManaRegenModifier()} on cast
				</IonItem>
			) : props.magic.getTurnManaRegenModifier() < 0 ? (
				<IonItem>
					Reduces user's mana recovery by{" "}
					{-props.magic.getTurnManaRegenModifier()} on cast
				</IonItem>
			) : null}
			{props.magic.getBattleManaRegenModifierEnemy() > 0 ? (
				<IonItem>
					Target recovers{" "}
					{props.magic.getBattleManaRegenModifierEnemy()} mana at end
					of battle (applied on hit)
				</IonItem>
			) : props.magic.getBattleManaRegenModifierEnemy() < 0 ? (
				<IonItem>
					Target loses{" "}
					{-props.magic.getBattleManaRegenModifierEnemy()} mana at end
					of battle (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getBattleManaRegenModifier() != 0 ? (
				<IonItem>
					User gets{" "}
					{props.magic.getBattleManaRegenModifier() > 0 ? "+" : ""}
					{props.magic.getBattleManaRegenModifier()} mana at end of
					battle
				</IonItem>
			) : null}
			{props.magic.getFlatArmourModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's physical armour rating by{" "}
					{props.magic.getFlatArmourModifierEnemy()} on hit
				</IonItem>
			) : props.magic.getFlatArmourModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's physical armour rating by{" "}
					{-props.magic.getFlatArmourModifierEnemy()} on hit
				</IonItem>
			) : null}
			{props.magic.getFlatArmourModifier() > 0 ? (
				<IonItem>
					Increases user's physical armour rating by{" "}
					{props.magic.getFlatArmourModifier()} on cast
				</IonItem>
			) : props.magic.getFlatArmourModifier() < 0 ? (
				<IonItem>
					Reduces user's physical armour rating by{" "}
					{-props.magic.getFlatArmourModifier()} on cast
				</IonItem>
			) : null}
			{props.magic.getPropArmourModifierEnemy() > 0 ? (
				<IonItem>
					Target receives{" "}
					{Math.round(100 * props.magic.getPropArmourModifierEnemy())}
					% more physical damage (applied on hit)
				</IonItem>
			) : props.magic.getPropArmourModifierEnemy() < 0 ? (
				<IonItem>
					Target receives{" "}
					{
						-Math.round(
							100 * props.magic.getPropArmourModifierEnemy()
						)
					}
					% less physical damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getPropArmourModifier() > 0 ? (
				<IonItem>
					User receives{" "}
					{Math.round(100 * props.magic.getPropArmourModifier())}%
					more physical damage
				</IonItem>
			) : props.magic.getPropArmourModifier() < 0 ? (
				<IonItem>
					User receives{" "}
					{-Math.round(100 * props.magic.getPropArmourModifier())}%
					less physical damage
				</IonItem>
			) : null}
			{props.magic.getFlatMagicArmourModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's magic armour rating by{" "}
					{props.magic.getFlatMagicArmourModifierEnemy()} on hit
				</IonItem>
			) : props.magic.getFlatMagicArmourModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's magic armour rating by{" "}
					{-props.magic.getFlatMagicArmourModifierEnemy()} on hit
				</IonItem>
			) : null}
			{props.magic.getFlatMagicArmourModifier() > 0 ? (
				<IonItem>
					Increases user's magic armour rating by{" "}
					{props.magic.getFlatMagicArmourModifier()} on cast
				</IonItem>
			) : props.magic.getFlatMagicArmourModifier() < 0 ? (
				<IonItem>
					Reduces user's magic armour rating by{" "}
					{-props.magic.getFlatMagicArmourModifier()} on cast
				</IonItem>
			) : null}
			{props.magic.getPropMagicArmourModifierEnemy() > 0 ? (
				<IonItem>
					Target receives{" "}
					{Math.round(
						100 * props.magic.getPropMagicArmourModifierEnemy()
					)}
					% more magic damage (applied on hit)
				</IonItem>
			) : props.magic.getPropMagicArmourModifierEnemy() < 0 ? (
				<IonItem>
					Target receives{" "}
					{
						-Math.round(
							100 * props.magic.getPropMagicArmourModifierEnemy()
						)
					}
					% less magic damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getPropMagicArmourModifier() > 0 ? (
				<IonItem>
					User receives{" "}
					{Math.round(100 * props.magic.getPropMagicArmourModifier())}
					% more magic damage
				</IonItem>
			) : props.magic.getPropMagicArmourModifier() < 0 ? (
				<IonItem>
					User receives{" "}
					{
						-Math.round(
							100 * props.magic.getPropMagicArmourModifier()
						)
					}
					% less magic damage
				</IonItem>
			) : null}
			{props.magic.getFlatDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals {props.magic.getFlatDamageModifierEnemy()} more
					physical damage (applied on hit)
				</IonItem>
			) : props.magic.getFlatDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals {-props.magic.getFlatDamageModifierEnemy()}{" "}
					less physical damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getFlatDamageModifier() > 0 ? (
				<IonItem>
					User deals {props.magic.getFlatDamageModifier()} more
					physical damage
				</IonItem>
			) : props.magic.getFlatDamageModifier() < 0 ? (
				<IonItem>
					User deals {-props.magic.getFlatDamageModifier()} less
					physical damage
				</IonItem>
			) : null}
			{props.magic.getPropDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals{" "}
					{Math.round(100 * props.magic.getPropDamageModifierEnemy())}
					% more physical damage (applied on hit)
				</IonItem>
			) : props.magic.getPropDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals{" "}
					{
						-Math.round(
							100 * props.magic.getPropDamageModifierEnemy()
						)
					}
					% less physical damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getPropDamageModifier() > 0 ? (
				<IonItem>
					User deals{" "}
					{Math.round(100 * props.magic.getPropDamageModifier())}%
					more physical damage
				</IonItem>
			) : props.magic.getPropDamageModifier() < 0 ? (
				<IonItem>
					User deals{" "}
					{-Math.round(100 * props.magic.getPropDamageModifier())}%
					less physical damage
				</IonItem>
			) : null}
			{props.magic.getFlatMagicDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals {props.magic.getFlatMagicDamageModifierEnemy()}{" "}
					more magic damage (applied on hit)
				</IonItem>
			) : props.magic.getFlatMagicDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals{" "}
					{-props.magic.getFlatMagicDamageModifierEnemy()} less magic
					damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getFlatMagicDamageModifier() > 0 ? (
				<IonItem>
					User deals {props.magic.getFlatMagicDamageModifier()} more
					magic damage
				</IonItem>
			) : props.magic.getFlatMagicDamageModifier() < 0 ? (
				<IonItem>
					User deals {-props.magic.getFlatMagicDamageModifier()} less
					magic damage
				</IonItem>
			) : null}
			{props.magic.getPropMagicDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals{" "}
					{Math.round(
						100 * props.magic.getPropMagicDamageModifierEnemy()
					)}
					% more magic damage (applied on hit)
				</IonItem>
			) : props.magic.getPropMagicDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals{" "}
					{
						-Math.round(
							100 * props.magic.getPropMagicDamageModifierEnemy()
						)
					}
					% less magic damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getPropMagicDamageModifier() > 0 ? (
				<IonItem>
					User deals{" "}
					{Math.round(100 * props.magic.getPropMagicDamageModifier())}
					% more magic damage
				</IonItem>
			) : props.magic.getPropMagicDamageModifier() < 0 ? (
				<IonItem>
					User deals{" "}
					{
						-Math.round(
							100 * props.magic.getPropMagicDamageModifier()
						)
					}
					% less magic damage
				</IonItem>
			) : null}
			{props.magic.getFlatArmourPiercingDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals{" "}
					{props.magic.getFlatArmourPiercingDamageModifierEnemy()}{" "}
					more armour piercing damage (applied on hit)
				</IonItem>
			) : props.magic.getFlatArmourPiercingDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals{" "}
					{-props.magic.getFlatArmourPiercingDamageModifierEnemy()}{" "}
					less armour piercing damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getFlatArmourPiercingDamageModifier() > 0 ? (
				<IonItem>
					User deals{" "}
					{props.magic.getFlatArmourPiercingDamageModifier()} more
					armour piercing damage
				</IonItem>
			) : props.magic.getFlatArmourPiercingDamageModifier() < 0 ? (
				<IonItem>
					User deals{" "}
					{-props.magic.getFlatArmourPiercingDamageModifier()} less
					armour piercing damage
				</IonItem>
			) : null}
			{props.magic.getPropArmourPiercingDamageModifierEnemy() > 0 ? (
				<IonItem>
					Target deals{" "}
					{Math.round(
						100 *
							props.magic.getPropArmourPiercingDamageModifierEnemy()
					)}
					% more armour piercing damage (applied on hit)
				</IonItem>
			) : props.magic.getPropArmourPiercingDamageModifierEnemy() < 0 ? (
				<IonItem>
					Target deals{" "}
					{
						-Math.round(
							100 *
								props.magic.getPropArmourPiercingDamageModifierEnemy()
						)
					}
					% less armour piercing damage (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getPropArmourPiercingDamageModifier() > 0 ? (
				<IonItem>
					User deals{" "}
					{Math.round(
						100 * props.magic.getPropArmourPiercingDamageModifier()
					)}
					% more armour piercing damage
				</IonItem>
			) : props.magic.getPropArmourPiercingDamageModifier() < 0 ? (
				<IonItem>
					User deals{" "}
					{
						-Math.round(
							100 *
								props.magic.getPropArmourPiercingDamageModifier()
						)
					}
					% less armour piercing damage
				</IonItem>
			) : null}
			{props.magic.getEvadeChanceModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's evasion chance by{" "}
					{Math.round(
						100 * props.magic.getEvadeChanceModifierEnemy()
					)}
					% (applied on hit)
				</IonItem>
			) : props.magic.getEvadeChanceModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's evasion chance by{" "}
					{
						-Math.round(
							100 * props.magic.getEvadeChanceModifierEnemy()
						)
					}
					% (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getEvadeChanceModifier() > 0 ? (
				<IonItem>
					Increases user's evasion chance by{" "}
					{Math.round(100 * props.magic.getEvadeChanceModifier())}%
				</IonItem>
			) : props.magic.getEvadeChanceModifier() < 0 ? (
				<IonItem>
					Reduces user's evasion chance by{" "}
					{-Math.round(100 * props.magic.getEvadeChanceModifier())}%
				</IonItem>
			) : null}
			{props.magic.getCounterAttackChanceModifierEnemy() > 0 ? (
				<IonItem>
					Increases target's counter attack chance by{" "}
					{Math.round(
						100 * props.magic.getCounterAttackChanceModifierEnemy()
					)}
					% (applied on hit)
				</IonItem>
			) : props.magic.getCounterAttackChanceModifierEnemy() < 0 ? (
				<IonItem>
					Reduces target's counter attack chance by{" "}
					{
						-Math.round(
							100 *
								props.magic.getCounterAttackChanceModifierEnemy()
						)
					}
					% (applied on hit)
				</IonItem>
			) : null}
			{props.magic.getCounterAttackChanceModifier() > 0 ? (
				<IonItem>
					Increases user's counter attack chance by{" "}
					{Math.round(
						100 * props.magic.getCounterAttackChanceModifier()
					)}
					%
				</IonItem>
			) : props.magic.getCounterAttackChanceModifier() < 0 ? (
				<IonItem>
					Reduces user's counter attack chance by{" "}
					{
						-Math.round(
							100 * props.magic.getCounterAttackChanceModifier()
						)
					}
					%
				</IonItem>
			) : null}
		</IonList>
	);
}

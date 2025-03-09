import { useState } from "react";
import { errorMessages, floatFromString, itemKeyGen, numFromString } from "./data";
import { randomInt } from "./rng";
import weaponData from "../data/weapons.json";
import {
  IonBadge,
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
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { fn } from "./interfaces";
import { variables } from "./variables";

type DisplayWeaponStatsProps = { weaponry: weapon };
type DisplayWeaponNameProps = {
  weaponry: weapon;
  inBattle?: boolean;
  selected?: boolean;
  canUse?: boolean;
  onToggle?: fn;
};
export class weapon {
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
  private healthChange: number | undefined;
  private hitCount: number = 1;
  private counterHits: number | undefined;
  private noEvade: boolean | undefined;
  private canCounter: boolean | undefined;
  private noCounterAttack: boolean | undefined;
  private manaChange: number | undefined;
  private projectileChange: number | undefined;
  private poison: number | undefined;
  private selfPoison: number | undefined;
  private bleed: number | undefined;
  private selfBleed: number | undefined;
  private lifeLink: boolean | undefined;
  private dualWield: boolean | undefined;
  private effectType: Uint8Array = new Uint8Array(2);
  private selfOverHeal: boolean | undefined;
  private targetOverHeal: boolean | undefined;
  private upgrade: string | undefined;
  private flatMagicDamageModifier: number | undefined;
  constructor(blueprint: string | weapon = "EMPTY", vars?: variables) {
    if (typeof blueprint == "string") {
      this.loadFromFile(blueprint, vars);
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
        this.flatArmourPiercingDamageMin = blueprint.flatArmourPiercingDamageMin;
        this.flatArmourPiercingDamageMax = blueprint.flatArmourPiercingDamageMax;
        this.propDamage = blueprint.propDamage;
        this.flatSelfDamageMin = blueprint.flatSelfDamageMin;
        this.flatSelfDamageMax = blueprint.flatSelfDamageMax;
        this.flatSelfMagicDamageMin = blueprint.flatSelfMagicDamageMin;
        this.flatSelfMagicDamageMax = blueprint.flatSelfMagicDamageMax;
        this.flatSelfArmourPiercingDamageMin = blueprint.flatSelfArmourPiercingDamageMin;
        this.flatSelfArmourPiercingDamageMax = blueprint.flatSelfArmourPiercingDamageMax;
        this.propSelfDamage = blueprint.propSelfDamage;
        this.healthChange = blueprint.healthChange;
        this.hitCount = blueprint.hitCount;
        this.counterHits = blueprint.counterHits;
        this.noEvade = blueprint.noEvade;
        this.canCounter = blueprint.canCounter;
        this.noCounterAttack = blueprint.noCounterAttack;
        this.manaChange = blueprint.manaChange;
        this.projectileChange = blueprint.projectileChange;
        this.poison = blueprint.poison;
        this.selfPoison = blueprint.selfPoison;
        this.bleed = blueprint.bleed;
        this.selfBleed = blueprint.selfBleed;
        this.lifeLink = blueprint.lifeLink;
        this.dualWield = blueprint.dualWield;
        this.effectType = blueprint.effectType;
        this.selfOverHeal = blueprint.selfOverHeal;
        this.targetOverHeal = blueprint.targetOverHeal;
        this.upgrade = blueprint.upgrade;
        this.flatMagicDamageModifier = blueprint.flatMagicDamageModifier;
      }
    }
  }
  toString(): string {
    return this.name ?? "None";
  }
  loadFromFile(blueprint: string = "EMPTY", vars?: variables): void {
    this.real = false;
    this.key = undefined;
    this.name = undefined;
    this.description = undefined;
    this.flatDamageMin = undefined;
    this.flatDamageMax = undefined;
    this.flatMagicDamageMin = undefined;
    this.flatMagicDamageMax = undefined;
    this.flatArmourPiercingDamageMin = undefined;
    this.flatArmourPiercingDamageMax = undefined;
    this.propDamage = undefined;
    this.flatSelfDamageMin = undefined;
    this.flatSelfDamageMax = undefined;
    this.flatSelfMagicDamageMin = undefined;
    this.flatSelfMagicDamageMax = undefined;
    this.flatSelfArmourPiercingDamageMin = undefined;
    this.flatSelfArmourPiercingDamageMax = undefined;
    this.propSelfDamage = undefined;
    this.healthChange = undefined;
    this.counterHits = undefined;
    this.noEvade = undefined;
    this.canCounter = undefined;
    this.noCounterAttack = undefined;
    this.manaChange = undefined;
    this.projectileChange = undefined;
    this.poison = undefined;
    this.selfPoison = undefined;
    this.bleed = undefined;
    this.selfBleed = undefined;
    this.lifeLink = undefined;
    this.dualWield = undefined;
    this.selfOverHeal = undefined;
    this.targetOverHeal = undefined;
    this.upgrade = undefined;
    this.flatMagicDamageModifier = undefined;
    this.effectType[0] = 0;
    this.effectType[1] = 0;
    this.hitCount = 1;
    if (blueprint == "EMPTY") {
      return;
    }
    //@ts-expect-error: Typescript is inferring the type from the json file
    let selectedWeapon = weaponData[blueprint];
    if (selectedWeapon == undefined) {
      errorMessages.push(`Unable to find weapon blueprint ${blueprint}`);
      return;
    }
    for (let i = 0; Array.isArray(selectedWeapon); i++) {
      if (i == 10) {
        errorMessages.push(`Exceeded maximum list depth loading weapon blueprint ${blueprint}`);
        return;
      }
      if (selectedWeapon.length == 0) {
        errorMessages.push(`Weapon blueprint list ${blueprint} is empty`);
        return;
      }
      blueprint = selectedWeapon[randomInt(0, selectedWeapon.length)];
      if (blueprint == "EMPTY") {
        return;
      }
      if (typeof blueprint != "string") {
        errorMessages.push(`Unable to parse weapon blueprint ${blueprint}`);
        return;
      }
      //@ts-expect-error: Typescript is inferring the type from the json file
      selectedWeapon = weaponData[blueprint];
      if (selectedWeapon == undefined) {
        errorMessages.push(`Unable to find weapon blueprint ${blueprint}`);
        return;
      }
    }
    this.real = true;
    if (typeof selectedWeapon.name == "string") {
      this.name = selectedWeapon.name || undefined;
    }
    if (typeof selectedWeapon.description == "string") {
      this.description = selectedWeapon.description || undefined;
    }
    switch (typeof selectedWeapon.flatDamage) {
      case "number":
        this.flatDamageMin = this.flatDamageMax = Math.trunc(selectedWeapon.flatDamage) || undefined;
        break;
      case "string":
        this.flatDamageMin = this.flatDamageMax = numFromString(selectedWeapon.flatDamage, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatDamageMin) {
      case "number":
        this.flatDamageMin = Math.trunc(selectedWeapon.flatDamageMin) || undefined;
        break;
      case "string":
        this.flatDamageMin = numFromString(selectedWeapon.flatDamageMin, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatDamageMax) {
      case "number":
        this.flatDamageMax = Math.trunc(selectedWeapon.flatDamageMax) || undefined;
        break;
      case "string":
        this.flatDamageMax = numFromString(selectedWeapon.flatDamageMax, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatMagicDamage) {
      case "number":
        this.flatMagicDamageMin = this.flatMagicDamageMax = Math.trunc(selectedWeapon.flatMagicDamage) || undefined;
        break;
      case "string":
        this.flatMagicDamageMin = this.flatMagicDamageMax =
          numFromString(selectedWeapon.flatMagicDamage, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatMagicDamageMin) {
      case "number":
        this.flatMagicDamageMin = Math.trunc(selectedWeapon.flatMagicDamageMin) || undefined;
        break;
      case "string":
        this.flatMagicDamageMin = numFromString(selectedWeapon.flatMagicDamageMin, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatMagicDamageMax) {
      case "number":
        this.flatMagicDamageMax = Math.trunc(selectedWeapon.flatMagicDamageMax) || undefined;
        break;
      case "string":
        this.flatMagicDamageMax = numFromString(selectedWeapon.flatMagicDamageMax, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatArmourPiercingDamage) {
      case "number":
        this.flatArmourPiercingDamageMin = this.flatArmourPiercingDamageMax =
          Math.trunc(selectedWeapon.flatArmourPiercingDamage) || undefined;
        break;
      case "string":
        this.flatArmourPiercingDamageMin = this.flatArmourPiercingDamageMax =
          numFromString(selectedWeapon.flatArmourPiercingDamage, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatArmourPiercingDamageMin) {
      case "number":
        this.flatArmourPiercingDamageMin = Math.trunc(selectedWeapon.flatArmourPiercingDamageMin) || undefined;
        break;
      case "string":
        this.flatArmourPiercingDamageMin =
          numFromString(selectedWeapon.flatArmourPiercingDamageMin, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatArmourPiercingDamageMax) {
      case "number":
        this.flatArmourPiercingDamageMax = Math.trunc(selectedWeapon.flatArmourPiercingDamageMax) || undefined;
        break;
      case "string":
        this.flatArmourPiercingDamageMax =
          numFromString(selectedWeapon.flatArmourPiercingDamageMax, vars).value || undefined;
    }
    switch (typeof selectedWeapon.propDamage) {
      case "number":
        this.propDamage = selectedWeapon.propDamage || undefined;
        break;
      case "string":
        this.propDamage = floatFromString(selectedWeapon.propDamage, vars).value || undefined;
    }
    if (this.propDamage != undefined) {
      if (this.propDamage < -1) {
        this.propDamage = -1;
      } else if (this.propDamage > 1) {
        this.propDamage = 1;
      }
    }
    switch (typeof selectedWeapon.flatSelfDamage) {
      case "number":
        this.flatSelfDamageMin = this.flatSelfDamageMax = Math.trunc(selectedWeapon.flatSelfDamage) || undefined;
        break;
      case "string":
        this.flatSelfDamageMin = this.flatSelfDamageMax =
          numFromString(selectedWeapon.flatSelfDamage, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatSelfDamageMin) {
      case "number":
        this.flatSelfDamageMin = Math.trunc(selectedWeapon.flatSelfDamageMin) || undefined;
        break;
      case "string":
        this.flatSelfDamageMin = numFromString(selectedWeapon.flatSelfDamageMin, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatSelfDamageMax) {
      case "number":
        this.flatSelfDamageMax = Math.trunc(selectedWeapon.flatSelfDamageMax) || undefined;
        break;
      case "string":
        this.flatSelfDamageMax = numFromString(selectedWeapon.flatSelfDamageMax, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatSelfMagicDamage) {
      case "number":
        this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax =
          Math.trunc(selectedWeapon.flatSelfMagicDamage) || undefined;
        break;
      case "string":
        this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax =
          numFromString(selectedWeapon.flatSelfMagicDamage, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatSelfMagicDamageMin) {
      case "number":
        this.flatSelfMagicDamageMin = Math.trunc(selectedWeapon.flatSelfMagicDamageMin) || undefined;
        break;
      case "string":
        this.flatSelfMagicDamageMin = numFromString(selectedWeapon.flatSelfMagicDamageMin, vars).value || undefined;
    }
    switch (typeof selectedWeapon.flatSelfMagicDamageMax) {
      case "number":
        this.flatSelfMagicDamageMax = Math.trunc(selectedWeapon.flatSelfMagicDamageMax) || undefined;
        break;
      case "string":
        this.flatSelfMagicDamageMax = numFromString(selectedWeapon.flatSelfMagicDamageMax, vars).value || undefined;
    }
    switch (typeof selectedWeapon.propSelfDamage) {
      case "number":
        this.propSelfDamage = selectedWeapon.propSelfDamage || undefined;
        break;
      case "string":
        this.propSelfDamage = floatFromString(selectedWeapon.propSelfDamage, vars).value || undefined;
    }
    if (this.propSelfDamage != undefined) {
      if (this.propSelfDamage < -1) {
        this.propSelfDamage = -1;
      } else if (this.propSelfDamage > 1) {
        this.propSelfDamage = 1;
      }
    }
    switch (typeof selectedWeapon.healthChange) {
      case "number":
        this.healthChange = Math.trunc(selectedWeapon.healthChange) || undefined;
        break;
      case "string":
        this.healthChange = numFromString(selectedWeapon.healthChange, vars).value || undefined;
    }
    switch (typeof selectedWeapon.hitCount) {
      case "number":
        this.hitCount = Math.trunc(selectedWeapon.hitCount);
        break;
      case "string":
        this.hitCount = numFromString(selectedWeapon.hitCount, vars).value;
    }
    if (this.hitCount < 0) {
      this.hitCount = 0;
    }
    switch (typeof selectedWeapon.counterHits) {
      case "number":
        this.counterHits = Math.trunc(selectedWeapon.counterHits) || undefined;
        break;
      case "string":
        this.counterHits = numFromString(selectedWeapon.counterHits, vars).value || undefined;
    }
    if (this.counterHits != undefined && this.counterHits < 0) {
      this.counterHits = 0;
    }
    if (typeof selectedWeapon.noEvade == "boolean") {
      this.noEvade = selectedWeapon.noEvade || undefined;
    }
    if (typeof selectedWeapon.canCounter == "boolean") {
      this.canCounter = selectedWeapon.canCounter || undefined;
    }
    if (typeof selectedWeapon.noCounterAttack == "boolean") {
      this.noCounterAttack = selectedWeapon.noCounterAttack || undefined;
    }
    switch (typeof selectedWeapon.manaChange) {
      case "number":
        this.manaChange = Math.trunc(selectedWeapon.manaChange) || undefined;
        break;
      case "string":
        this.manaChange = numFromString(selectedWeapon.manaChange, vars).value || undefined;
    }
    switch (typeof selectedWeapon.projectileChange) {
      case "number":
        this.projectileChange = Math.trunc(selectedWeapon.projectileChange) || undefined;
        break;
      case "string":
        this.projectileChange = numFromString(selectedWeapon.projectileChange, vars).value || undefined;
    }
    switch (typeof selectedWeapon.poison) {
      case "number":
        this.poison = Math.trunc(selectedWeapon.poison) || undefined;
        break;
      case "string":
        this.poison = numFromString(selectedWeapon.poison, vars).value || undefined;
    }
    if (this.poison != undefined) {
      if (this.poison < 0) {
        this.poison = 0;
      } else if (this.poison > 255) {
        this.poison = 255;
      }
    }
    switch (typeof selectedWeapon.selfPoison) {
      case "number":
        this.selfPoison = Math.trunc(selectedWeapon.selfPoison) || undefined;
        break;
      case "string":
        this.selfPoison = numFromString(selectedWeapon.selfPoison, vars).value || undefined;
    }
    if (this.selfPoison != undefined) {
      if (this.selfPoison < 0) {
        this.selfPoison = 0;
      } else if (this.selfPoison > 255) {
        this.selfPoison = 255;
      }
    }
    switch (typeof selectedWeapon.bleed) {
      case "number":
        this.bleed = Math.trunc(selectedWeapon.bleed) || undefined;
        break;
      case "string":
        this.bleed = numFromString(selectedWeapon.bleed, vars).value || undefined;
    }
    if (this.bleed != undefined) {
      if (this.bleed < 0) {
        this.bleed = 0;
      } else if (this.bleed > 255) {
        this.bleed = 255;
      }
    }
    switch (typeof selectedWeapon.selfBleed) {
      case "number":
        this.selfBleed = Math.trunc(selectedWeapon.selfBleed) || undefined;
        break;
      case "string":
        this.selfBleed = numFromString(selectedWeapon.selfBleed, vars).value || undefined;
    }
    if (this.selfBleed != undefined) {
      if (this.selfBleed < 0) {
        this.selfBleed = 0;
      } else if (this.selfBleed > 255) {
        this.selfBleed = 255;
      }
    }
    if (typeof selectedWeapon.lifeLink == "boolean") {
      this.lifeLink = selectedWeapon.lifeLink || undefined;
    }
    if (typeof selectedWeapon.dualWield == "boolean") {
      this.dualWield = selectedWeapon.dualWield || undefined;
    }
    if (typeof selectedWeapon.selfOverHeal == "boolean") {
      this.selfOverHeal = selectedWeapon.selfOverHeal || undefined;
    }
    if (typeof selectedWeapon.targetOverHeal == "boolean") {
      this.targetOverHeal = selectedWeapon.targetOverHeal || undefined;
    }
    if (typeof selectedWeapon.upgrade == "string") {
      this.upgrade = selectedWeapon.upgrade || undefined;
    }
    switch (typeof selectedWeapon.flatMagicDamageModifier) {
      case "number":
        this.flatMagicDamageModifier = Math.trunc(selectedWeapon.flatMagicDamageModifier) || undefined;
        break;
      case "string":
        this.flatMagicDamageModifier = numFromString(selectedWeapon.flatMagicDamageModifier, vars).value || undefined;
    }
    this.setEffectType();
    //Ensure max damage values are at least min values
    if ((this.flatDamageMin ?? 0) > (this.flatDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatDamageMin;
      this.flatDamageMin = this.flatDamageMax;
      this.flatDamageMax = buffer;
    }
    if ((this.flatMagicDamageMin ?? 0) > (this.flatMagicDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatMagicDamageMin;
      this.flatMagicDamageMin = this.flatMagicDamageMax;
      this.flatMagicDamageMax = buffer;
    }
    if ((this.flatArmourPiercingDamageMin ?? 0) > (this.flatArmourPiercingDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatArmourPiercingDamageMin;
      this.flatArmourPiercingDamageMin = this.flatArmourPiercingDamageMax;
      this.flatArmourPiercingDamageMax = buffer;
    }
    if ((this.flatSelfDamageMin ?? 0) > (this.flatSelfDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatSelfDamageMin;
      this.flatSelfDamageMin = this.flatSelfDamageMax;
      this.flatSelfDamageMax = buffer;
    }
    if ((this.flatSelfMagicDamageMin ?? 0) > (this.flatSelfMagicDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatSelfMagicDamageMin;
      this.flatSelfMagicDamageMin = this.flatSelfMagicDamageMax;
      this.flatSelfMagicDamageMax = buffer;
    }
    if ((this.flatSelfArmourPiercingDamageMin ?? 0) > (this.flatSelfArmourPiercingDamageMax ?? 0)) {
      let buffer: number | undefined = this.flatSelfArmourPiercingDamageMin;
      this.flatSelfArmourPiercingDamageMin = this.flatSelfArmourPiercingDamageMax;
      this.flatSelfArmourPiercingDamageMax = buffer;
    }
  }
  getKey(): number {
    return (this.key ??= itemKeyGen());
  }
  getReal(): boolean {
    return this.real;
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
    return this.flatDamageMax == undefined ? this.flatDamageMin : randomInt(this.flatDamageMin, this.flatDamageMax);
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
      : randomInt(this.flatArmourPiercingDamageMin, this.flatArmourPiercingDamageMax);
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
      : randomInt(this.flatSelfMagicDamageMin, this.flatSelfMagicDamageMax);
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
      : randomInt(this.flatSelfArmourPiercingDamageMin, this.flatSelfArmourPiercingDamageMax);
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
  getHealthChange(): number {
    return this.healthChange ?? 0;
  }
  getHitCount(): number {
    return this.hitCount;
  }
  getCounterHits(): number {
    return this.counterHits ?? 0;
  }
  getNoEvade(): boolean {
    return this.noEvade ?? false;
  }
  getCanCounter(): boolean {
    return this.canCounter ?? false;
  }
  getNoCounterAttack(): boolean {
    return this.noCounterAttack ?? false;
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
  getLifeLink(): boolean {
    return this.lifeLink ?? false;
  }
  getDualWield(): boolean {
    return this.dualWield ?? false;
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
  getUpgrade(): string {
    return this.upgrade ?? "EMPTY";
  }
  getFlatMagicDamageModifier(): number {
    return this.flatMagicDamageModifier ?? 0;
  }
  checkSelfEffect(): boolean {
    if (this.propSelfDamage || this.selfPoison || this.selfBleed) {
      return true;
    }
    return false;
  }
  checkTargetEffect(): boolean {
    if (this.propDamage || this.bleed || this.poison) {
      return true;
    }
    return false;
  }
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
  static DisplayStats({ weaponry }: DisplayWeaponStatsProps): React.ReactNode {
    let healingMin: number = 0;
    let healingMax: number = 0;
    let healingSelfMin: number = 0;
    let healingSelfMax: number = 0;
    if (weaponry.getFlatDamageMax() <= 0) {
      healingMin -= weaponry.getFlatDamageMax();
      healingMax -= weaponry.getFlatDamageMin();
    }
    if (weaponry.getFlatMagicDamageMax() <= 0) {
      healingMin -= weaponry.getFlatMagicDamageMax();
      healingMax -= weaponry.getFlatMagicDamageMin();
    }
    if (weaponry.getFlatArmourPiercingDamageMax() <= 0) {
      healingMin -= weaponry.getFlatArmourPiercingDamageMax();
      healingMax -= weaponry.getFlatArmourPiercingDamageMin();
    }
    if (weaponry.getFlatSelfDamageMax() <= 0) {
      healingSelfMin -= weaponry.getFlatSelfDamageMax();
      healingSelfMax -= weaponry.getFlatSelfDamageMin();
    }
    if (weaponry.getFlatSelfMagicDamageMax() <= 0) {
      healingSelfMin -= weaponry.getFlatSelfMagicDamageMax();
      healingSelfMax -= weaponry.getFlatSelfMagicDamageMin();
    }
    if (weaponry.getFlatSelfArmourPiercingDamageMax() <= 0) {
      healingSelfMin -= weaponry.getFlatSelfArmourPiercingDamageMax();
      healingSelfMax -= weaponry.getFlatSelfArmourPiercingDamageMin();
    }
    return (
      <IonList>
        <IonListHeader>{weaponry.getDescription()}</IonListHeader>
        {weaponry.getFlatDamageMin() == weaponry.getFlatDamageMax() ? (
          weaponry.getFlatDamageMax() > 0 ? (
            <IonItem>Deals {weaponry.getFlatDamageMax()} physical damage</IonItem>
          ) : null
        ) : weaponry.getFlatDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatDamageMin()} to {weaponry.getFlatDamageMax()} physical damage
          </IonItem>
        ) : weaponry.getFlatDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatDamageMin()} to {weaponry.getFlatDamageMax()} physical damage, negative damage will
            heal the target
          </IonItem>
        ) : null}
        {weaponry.getFlatMagicDamageMin() == weaponry.getFlatMagicDamageMax() ? (
          weaponry.getFlatMagicDamageMax() > 0 ? (
            <IonItem>Deals {weaponry.getFlatMagicDamageMax()} magic damage</IonItem>
          ) : null
        ) : weaponry.getFlatMagicDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatMagicDamageMin()} to {weaponry.getFlatMagicDamageMax()} magic damage
          </IonItem>
        ) : weaponry.getFlatMagicDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatMagicDamageMin()} to {weaponry.getFlatMagicDamageMax()} magic damage, negative damage
            will heal the target
          </IonItem>
        ) : null}
        {weaponry.getFlatArmourPiercingDamageMin() == weaponry.getFlatArmourPiercingDamageMax() ? (
          weaponry.getFlatArmourPiercingDamageMax() > 0 ? (
            <IonItem>Deals {weaponry.getFlatArmourPiercingDamageMax()} armour piercing damage</IonItem>
          ) : null
        ) : weaponry.getFlatArmourPiercingDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatArmourPiercingDamageMin()} to {weaponry.getFlatArmourPiercingDamageMax()} armour
            piercing damage
          </IonItem>
        ) : weaponry.getFlatArmourPiercingDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatArmourPiercingDamageMin()} to {weaponry.getFlatArmourPiercingDamageMax()} armour
            piercing damage, negative damage will heal the target
          </IonItem>
        ) : null}
        {healingMax > 0 ? (
          <IonItem>
            Heals the target for {healingMin} {healingMin != healingMax ? ` to ${healingMax}` : ""}
          </IonItem>
        ) : null}
        {weaponry.getTargetOverHeal() ? <IonItem>Attacks may over heal the target</IonItem> : null}
        {weaponry.getPropDamage() > 0 ? (
          <IonItem>Reduces target&apos;s health by {Math.round(100 * weaponry.getPropDamage())}%</IonItem>
        ) : weaponry.getPropDamage() < 0 ? (
          <IonItem>Heals target for {Math.round(-100 * weaponry.getPropDamage())}% of their maximum health</IonItem>
        ) : null}
        {weaponry.getFlatSelfDamageMin() == weaponry.getFlatSelfDamageMax() ? (
          weaponry.getFlatSelfDamageMax() > 0 ? (
            <IonItem>Deals {weaponry.getFlatSelfDamageMax()} physical damage to user on attack</IonItem>
          ) : null
        ) : weaponry.getFlatSelfDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfDamageMin()} to {weaponry.getFlatSelfDamageMax()} physical damage to user on
            attack
          </IonItem>
        ) : weaponry.getFlatSelfDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfDamageMin()} to {weaponry.getFlatSelfDamageMax()} physical damage to user on
            attack, negative damage will heal
          </IonItem>
        ) : null}
        {weaponry.getFlatSelfMagicDamageMin() == weaponry.getFlatSelfMagicDamageMax() ? (
          weaponry.getFlatSelfMagicDamageMax() > 0 ? (
            <IonItem>Deals {weaponry.getFlatSelfMagicDamageMax()} magic damage to user on attack</IonItem>
          ) : null
        ) : weaponry.getFlatSelfMagicDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfMagicDamageMin()} to {weaponry.getFlatSelfMagicDamageMax()} magic damage to user
            on attack
          </IonItem>
        ) : weaponry.getFlatSelfMagicDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfMagicDamageMin()} to {weaponry.getFlatSelfMagicDamageMax()} magic damage to user
            on attack, negative damage will heal
          </IonItem>
        ) : null}
        {weaponry.getFlatSelfArmourPiercingDamageMin() == weaponry.getFlatSelfArmourPiercingDamageMax() ? (
          weaponry.getFlatSelfArmourPiercingDamageMax() > 0 ? (
            <IonItem>
              Deals {weaponry.getFlatSelfArmourPiercingDamageMax()} armour piercing damage to user on attack
            </IonItem>
          ) : null
        ) : weaponry.getFlatSelfArmourPiercingDamageMin() >= 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfArmourPiercingDamageMin()} to {weaponry.getFlatSelfArmourPiercingDamageMax()}{" "}
            armour piercing damage to user on attack
          </IonItem>
        ) : weaponry.getFlatSelfArmourPiercingDamageMax() > 0 ? (
          <IonItem>
            Deals {weaponry.getFlatSelfArmourPiercingDamageMin()} to {weaponry.getFlatSelfArmourPiercingDamageMax()}{" "}
            armour piercing damage to user on attack, negative damage will heal
          </IonItem>
        ) : null}
        {healingSelfMax > 0 ? (
          <IonItem>
            Heals the user for {healingSelfMin} {healingSelfMin != healingSelfMax ? ` to ${healingSelfMax}` : ""}
          </IonItem>
        ) : null}
        {weaponry.getSelfOverHeal() ? <IonItem>May over heal user</IonItem> : null}
        {weaponry.getPropSelfDamage() > 0 ? (
          <IonItem>Reduces user&apos;s health by {Math.round(100 * weaponry.getPropSelfDamage())}%</IonItem>
        ) : weaponry.getPropSelfDamage() < 0 ? (
          <IonItem>Heals user for {Math.round(-100 * weaponry.getPropSelfDamage())}% of their maximum health</IonItem>
        ) : null}
        {weaponry.getHealthChange() > 0 ? (
          <IonItem>User is healed for {weaponry.getHealthChange()}, even if attack is shielded</IonItem>
        ) : weaponry.getHealthChange() < 0 ? (
          <IonItem>Costs {-weaponry.getHealthChange()} health to attack (even if shielded)</IonItem>
        ) : null}
        {weaponry.getLifeLink() ? <IonItem>On dealing damage to target, heals the user by that much</IonItem> : null}
        {weaponry.hitCount <= 0 ? (
          <IonItem>Cannot be used for attacks</IonItem>
        ) : weaponry.hitCount == 2 ? (
          <IonItem>Hits twice per attack</IonItem>
        ) : weaponry.hitCount > 2 ? (
          <IonItem>Hits {weaponry.hitCount} times per attack</IonItem>
        ) : null}
        {weaponry.getCounterHits() == 1 ? (
          <IonItem>Usable for counter attacks, hits once</IonItem>
        ) : weaponry.getCounterHits() == 2 ? (
          <IonItem>Usable for counter attacks, hits twice</IonItem>
        ) : weaponry.getCounterHits() > 2 ? (
          <IonItem>Usable for counter attacks, hits {weaponry.getCounterHits()} times per attack</IonItem>
        ) : null}
        {weaponry.getDualWield() ? <IonItem>Can be dual wielded</IonItem> : null}
        {weaponry.getNoEvade() ? <IonItem>Cannot be dodged</IonItem> : null}
        {weaponry.getNoCounterAttack() ? <IonItem>Does not allow counter attacks</IonItem> : null}
        {weaponry.getCanCounter() ? <IonItem>Effects can be shielded against by spells</IonItem> : null}
        {weaponry.getManaChange() < 0 ? (
          <IonItem>Costs {-weaponry.getManaChange()} to attack</IonItem>
        ) : weaponry.getManaChange() > 0 ? (
          <IonItem>Gain {weaponry.getManaChange()} mana on attack</IonItem>
        ) : null}
        {weaponry.getProjectileChange() == -1 ? (
          <IonItem>Requires 1 arrow to attack</IonItem>
        ) : weaponry.getProjectileChange() < -1 ? (
          <IonItem>Requires {-weaponry.getProjectileChange()} arrows to attack</IonItem>
        ) : weaponry.getProjectileChange() == 1 ? (
          <IonItem>Regain 1 arrow on attack</IonItem>
        ) : weaponry.getProjectileChange() > 1 ? (
          <IonItem>Regain {weaponry.getProjectileChange()} arrows on attack</IonItem>
        ) : null}
        {weaponry.getPoison() > 0 ? <IonItem>Applies {weaponry.getPoison()} poison on hit</IonItem> : null}
        {weaponry.getSelfPoison() > 0 ? (
          <IonItem>Applies {weaponry.getSelfPoison()} poison to user on attack</IonItem>
        ) : null}
        {weaponry.getBleed() > 0 ? <IonItem>Applies {weaponry.getBleed()} bleed on hit</IonItem> : null}
        {weaponry.getSelfBleed() > 0 ? (
          <IonItem>Applies {weaponry.getSelfBleed()} bleed to user on attack</IonItem>
        ) : null}
        {weaponry.getFlatMagicDamageModifier() != 0 ? (
          <IonItem>
            {weaponry.getFlatMagicDamageModifier() > 0 ? "+" : ""}
            {weaponry.getFlatMagicDamageModifier()} magic damage dealt (passive effect)
          </IonItem>
        ) : null}
      </IonList>
    );
  }
  static DisplayName({ weaponry, inBattle, selected, canUse, onToggle }: DisplayWeaponNameProps): React.ReactNode {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    if (!weaponry.real) {
      return (
        <IonItem>
          <IonLabel className="ion-text-center">None</IonLabel>
        </IonItem>
      );
    }
    return (
      <IonItem>
        {inBattle && weaponry.getDualWield() ? (
          <IonBadge slot="start" mode="ios" className="ion-no-margin">
            DW
          </IonBadge>
        ) : null}{" "}
        <IonLabel className="ion-text-center">
          {weaponry.getName()}
          {weaponry.getHealthChange() != 0 || weaponry.getManaChange() != 0 || weaponry.getProjectileChange() != 0 ? (
            <IonLabel className="equipment-costs">
              {weaponry.getHealthChange() != 0
                ? ` ${weaponry.getHealthChange() > 0 ? "+" : ""}${weaponry.getHealthChange()} health `
                : null}
              {weaponry.getManaChange() != 0
                ? ` ${weaponry.getManaChange() > 0 ? "+" : ""}${weaponry.getManaChange()} mana `
                : null}
              {weaponry.getHealthChange() != 0 && weaponry.getManaChange() != 0 && weaponry.getProjectileChange() != 0
                ? "\n"
                : null}
              {weaponry.getProjectileChange() != 0
                ? ` ${weaponry.getProjectileChange() > 0 ? "+" : ""}${weaponry.getProjectileChange()} arrow${
                    Math.abs(weaponry.getProjectileChange()) != 1 ? "s" : ""
                  } `
                : null}
            </IonLabel>
          ) : null}
        </IonLabel>
        {inBattle ? (
          <IonToggle
            aria-label="select weapon"
            slot="end"
            checked={selected}
            disabled={!canUse}
            onIonChange={onToggle}
          />
        ) : (
          <IonButton slot="end" mode="ios" size="small" onClick={() => setIsOpen(true)}>
            Stats
          </IonButton>
        )}
        <IonModal isOpen={isOpen} backdropDismiss={false}>
          <IonHeader>
            <IonToolbar className="ion-text-center">
              <IonGrid className="ion-no-padding">
                <IonRow>
                  <IonCol size="1">
                    <IonButton size="small" onClick={() => setIsOpen(false)} fill="clear" color="dark">
                      <IonIcon slot="icon-only" icon={close} />
                    </IonButton>
                  </IonCol>
                  <IonCol size="10">
                    <IonTitle>{weaponry.getName()}</IonTitle>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <weapon.DisplayStats weaponry={weaponry} />
          </IonContent>
        </IonModal>
      </IonItem>
    );
  }
}

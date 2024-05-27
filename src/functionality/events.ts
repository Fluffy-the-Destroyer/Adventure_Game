import { statChanges } from "./interfaces";
import { variables } from "./variables";
import eventData from "../data/events.json";
import { errorMessages, numFromString } from "./data";
import { randomInt } from "./rng";

class choice {
  text: string = "Continue";
  healthChange: number = 0;
  manaChange: number = 0;
  projectileChange: number = 0;
  req: string = "true";
  hidden: boolean = false;
  eventName: string = "EMPTY";
}

export class event {
  private real!: boolean;
  private preBattleText!: string;
  private preBattleSpell!: string;
  private enemyBlueprint!: string;
  private firstGo!: -1 | 0 | 1;
  private postBattleText!: string;
  private statChanges!: statChanges;
  private xpChange!: number;
  private reward!: string;
  private varChanges!: variables;
  private choices!: choice[];
  getReal(this: event): boolean {
    return this.real;
  }
  constructor(blueprint: string = "EMPTY", vars?: variables) {
    this.loadFromFile(blueprint, vars);
  }
  loadFromFile(this: event, blueprint: string = "EMPTY", vars?: variables): void {
    this.real = false;
    this.preBattleText = "";
    this.preBattleSpell = "";
    this.enemyBlueprint = "";
    this.firstGo = 0;
    this.postBattleText = "";
    this.statChanges = {};
    this.xpChange = 0;
    this.reward = "";
    this.varChanges = new variables();
    this.choices = [];
    if (blueprint == "EMPTY") {
      return;
    }
    //@ts-expect-error: Typescript is inferring the type from the json file
    let selectedEvent = eventData[blueprint];
    if (selectedEvent == undefined) {
      errorMessages.push(`Unable to find event blueprint ${blueprint}`);
      return;
    }
    for (let i = 0; Array.isArray(selectedEvent); i++) {
      if (i == 10) {
        errorMessages.push(`Exceeded maximum list depth loading event blueprint ${blueprint}`);
        return;
      }
      if (selectedEvent.length == 0) {
        errorMessages.push(`Event blueprint list ${blueprint} is empty`);
        return;
      }
      blueprint = selectedEvent[randomInt(0, selectedEvent.length)];
      if (blueprint == "EMPTY") {
        return;
      }
      if (typeof blueprint != "string") {
        errorMessages.push(`Unable to parse event blueprint ${blueprint}`);
        return;
      }
      //@ts-expect-error: Typescript is inferring the type from the json file
      selectedEvent = eventData[blueprint];
      if (selectedEvent == undefined) {
        errorMessages.push(`Unable to find event blueprint ${blueprint}`);
        return;
      }
    }
    this.real = true;
    if (typeof selectedEvent.preBattleText == "string") {
      this.preBattleText = selectedEvent.preBattleText;
    }
    if (typeof selectedEvent.preBattleSpell == "string") {
      this.preBattleSpell = selectedEvent.preBattleSpell;
    }
    if (typeof selectedEvent.enemyBlueprint?.blueprint == "string") {
      this.enemyBlueprint = selectedEvent.enemyBlueprint.blueprint;
      switch (selectedEvent.enemyBlueprint.first) {
        case "player":
          this.firstGo = 1;
          break;
        case "enemy":
          this.firstGo = -1;
      }
    }
    if (typeof selectedEvent.postBattleText == "string") {
      this.postBattleText = selectedEvent.postBattleText;
    }
    if (selectedEvent.statChanges != null && typeof selectedEvent.statChanges == "object") {
      switch (typeof selectedEvent.statChanges.health) {
        case "number":
          this.statChanges.health = Math.trunc(selectedEvent.statChanges.health) || undefined;
          break;
        case "string":
          this.statChanges.health = numFromString(selectedEvent.statChanges.health, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.maxHealth) {
        case "number":
          this.statChanges.maxHealth = Math.trunc(selectedEvent.statChanges.maxHealth) || undefined;
          break;
        case "string":
          this.statChanges.maxHealth = numFromString(selectedEvent.statChanges.maxHealth, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.projectiles) {
        case "number":
          this.statChanges.projectiles = Math.trunc(selectedEvent.statChanges.projectiles) || undefined;
          break;
        case "string":
          this.statChanges.projectiles = numFromString(selectedEvent.statChanges.projectiles, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.mana) {
        case "number":
          this.statChanges.mana = Math.trunc(selectedEvent.statChanges.mana) || undefined;
          break;
        case "string":
          this.statChanges.mana = numFromString(selectedEvent.statChanges.mana, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.maxMana) {
        case "number":
          this.statChanges.maxMana = Math.trunc(selectedEvent.statChanges.maxMana) || undefined;
          break;
        case "string":
          this.statChanges.maxMana = numFromString(selectedEvent.statChanges.maxMana, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.turnManaRegen) {
        case "number":
          this.statChanges.turnManaRegen = Math.trunc(selectedEvent.statChanges.turnManaRegen) || undefined;
          break;
        case "string":
          this.statChanges.turnManaRegen =
            numFromString(selectedEvent.statChanges.turnManaRegen, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.battleManaRegen) {
        case "number":
          this.statChanges.battleManaRegen = Math.trunc(selectedEvent.statChanges.battleManaRegen) || undefined;
          break;
        case "string":
          this.statChanges.battleManaRegen =
            numFromString(selectedEvent.statChanges.battleManaRegen, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.turnRegen) {
        case "number":
          this.statChanges.turnRegen = Math.trunc(selectedEvent.statChanges.turnRegen) || undefined;
          break;
        case "string":
          this.statChanges.turnRegen = numFromString(selectedEvent.statChanges.turnRegen, vars).value || undefined;
      }
      switch (typeof selectedEvent.statChanges.battleRegen) {
        case "number":
      }
    }
  }
  //*eventHandler(
  //  this: event,
  //  playerCharacter: player,
  //  vars: variables
  //): Generator<React.ReactNode, React.ReactNode, void | fn> {}
}

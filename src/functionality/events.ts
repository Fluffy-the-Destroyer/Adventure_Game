import { fn } from "./interfaces";
import { player } from "./player";
import { variables } from "./variables";
import eventData from "../data/events.json";
import { errorMessages } from "./data";
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
  private statChanges!: number[];
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
    this.statChanges = Array(18).fill(0);
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
  }
  *eventHandler(
    this: event,
    playerCharacter: player,
    vars: variables
  ): Generator<React.ReactNode, React.ReactNode, void | fn> {}
}

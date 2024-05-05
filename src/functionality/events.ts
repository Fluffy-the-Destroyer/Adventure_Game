import { fn } from "./interfaces";
import { player } from "./player";
import { variables } from "./variables";

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
  private statChanges!: number[] & { length: 18 };
  private xpChange!: number;
  private reward!: string;
  private varChanges!: variables;
  private choices!: choice[];
  getReal(this: event): boolean {
    return this.real;
  }
  constructor(blueprint: string = "EMPTY") {
    this.loadFromFile(blueprint);
  }
  loadFromFile(this: event, blueprint: string = "EMPTY"): void {}
  *eventHandler(
    this: event,
    playerCharacter: player,
    vars: variables
  ): Generator<React.ReactNode, React.ReactNode, void | fn> {}
}

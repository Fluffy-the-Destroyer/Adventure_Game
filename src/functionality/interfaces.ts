/**Holds a choice of action */
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

export type actionChoice = noAction | weaponAction | dualWeaponAction | spellAction;

export type fn<T extends unknown[] = [], U = void> = (...args: T) => U;
export type asyncFn<T extends unknown[] = [], U = void> = (...args: T) => Promise<U>;

export type command =
  | { command: "victory" }
  | { command: "defeat" }
  | { command: "text"; text: string }
  | { command: "event"; event: string }
  | { command: "var"; var: string; operation: "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "++" | "--" | "display" }
  | {
      command: "if";
      cond: string;
      commands: command[];
      elseif: { cond: string; commands: command[] }[];
      else: command[];
    }
  | { command: "while"; cond: string; commands: command[] }
  | { command: "break" }
  | { command: "continue" }
  | { command: "save" };

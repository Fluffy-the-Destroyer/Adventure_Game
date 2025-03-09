import { fn, statChanges } from "./interfaces";
import { variables } from "./variables";
import eventData from "../data/events.json";
import { errorMessages, evalCond, itemKeyGen, numFromString } from "./data";
import { randomInt } from "./rng";
import { player } from "./player";
import { Fragment } from "react";
import { IonButton, IonContent, IonItem, IonLabel, IonList, UseIonToastResult } from "@ionic/react";
import { spell } from "./spells";
import { enemy } from "./enemies";
import { SpellCast } from "../components/attacks";
import { battleHandler, BattleWrapper } from "../pages/battlePage";

class choice {
  private key: number | undefined;
  text: string = "Continue";
  healthChange: number = 0;
  manaChange: number = 0;
  projectileChange: number = 0;
  req: string = "true";
  hidden: boolean = false;
  eventName: string = "EMPTY";
  constructor(value: any) {
    if (value) {
      if (typeof value.text == "string") {
        this.text = value.text;
      }
      switch (typeof value.healthChange) {
        case "number":
          this.healthChange = Math.trunc(value.healthChange);
          break;
        case "string":
          this.healthChange = numFromString(value.healthChange).value;
      }
      switch (typeof value.manaChange) {
        case "number":
          this.manaChange = Math.trunc(value.manaChange);
          break;
        case "string":
          this.manaChange = numFromString(value.manaChange).value;
      }
      switch (typeof value.projectileChange) {
        case "number":
          this.projectileChange = Math.trunc(value.projectileChange);
          break;
        case "string":
          this.projectileChange = numFromString(value.projectileChange).value;
      }
      switch (typeof value.req) {
        case "boolean":
        case "string":
          this.req = String(value.req);
      }
      if (value.hidden === true) {
        this.hidden = true;
      }
      if (typeof value.eventName == "string") {
        this.eventName = value.eventName;
      }
    }
  }
  getKey(): number {
    return (this.key ??= itemKeyGen());
  }
}

export class event {
  private real!: boolean;
  private preBattleText: string | undefined;
  private preBattleSpell: string | undefined;
  private enemyBlueprint: string | undefined;
  private firstGo: -1 | 0 | 1 | undefined;
  private postBattleText: string | undefined;
  private statChanges!: statChanges;
  private xpChange: number | undefined;
  private reward: string | undefined;
  private varChanges!: variables;
  private choices!: choice[];
  private blueprintInternal!: string;
  getReal(this: event): boolean {
    return this.real;
  }
  constructor(blueprint: string = "EMPTY", vars?: variables) {
    this.loadFromFile(blueprint, vars);
  }
  loadFromFile(this: event, blueprint: string = "EMPTY", vars?: variables): void {
    this.real = false;
    this.preBattleText = undefined;
    this.preBattleSpell = undefined;
    this.enemyBlueprint = undefined;
    this.firstGo = undefined;
    this.postBattleText = undefined;
    this.statChanges = Object.create(null);
    this.xpChange = undefined;
    this.reward = undefined;
    this.varChanges = new variables();
    this.choices = [];
    this.blueprintInternal = "";
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
      this.preBattleText = selectedEvent.preBattleText || undefined;
    }
    if (typeof selectedEvent.preBattleSpell == "string") {
      this.preBattleSpell = selectedEvent.preBattleSpell || undefined;
    }
    if (typeof selectedEvent.enemyBlueprint?.blueprint == "string") {
      this.enemyBlueprint = selectedEvent.enemyBlueprint.blueprint || undefined;
      switch (selectedEvent.enemyBlueprint.first) {
        case "player":
          this.firstGo = 1;
          break;
        case "enemy":
          this.firstGo = -1;
      }
    }
    if (typeof selectedEvent.postBattleText == "string") {
      this.postBattleText = selectedEvent.postBattleText || undefined;
    }
    if (selectedEvent.statChanges != null && typeof selectedEvent.statChanges == "object") {
      let buffer: number | undefined;
      switch (typeof selectedEvent.statChanges.health) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.health) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.health, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.health = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.maxHealth) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.maxHealth) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.maxHealth, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.maxHealth = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.projectiles) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.projectiles) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.projectiles, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.projectiles = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.mana) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.mana) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.mana, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.mana = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.maxMana) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.maxMana) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.maxMana, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.maxMana = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.turnManaRegen) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.turnManaRegen) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.turnManaRegen, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.turnManaRegen = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.battleManaRegen) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.battleManaRegen) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.battleManaRegen, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.battleManaRegen = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.turnRegen) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.turnRegen) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.turnRegen, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.turnRegen = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.battleRegen) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.battleRegen) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.battleRegen, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.battleRegen = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.flatArmour) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.flatArmour) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.flatArmour, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.flatArmour = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.flatMagicArmour) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.flatMagicArmour) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.flatMagicArmour, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.flatMagicArmour = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.flatDamageModifier) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.flatDamageModifier) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.flatDamageModifier, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.flatDamageModifier = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.flatMagicDamageModifier) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.flatMagicDamageModifier) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.flatMagicDamageModifier, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.flatMagicDamageModifier = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.flatArmourPiercingDamageModifier) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.flatArmourPiercingDamageModifier) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.flatArmourPiercingDamageModifier, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.flatArmourPiercingDamageModifier = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.bonusActions) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.bonusActions) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.bonusActions, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.bonusActions = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.initiative) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.initiative) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.initiative, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.initiative = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.statPoints) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.statPoints) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.statPoints, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.statPoints = buffer;
        buffer = undefined;
      }
      switch (typeof selectedEvent.statChanges.upgradePoints) {
        case "number":
          buffer = Math.trunc(selectedEvent.statChanges.upgradePoints) || undefined;
          break;
        case "string":
          buffer = numFromString(selectedEvent.statChanges.upgradePoints, vars).value || undefined;
      }
      if (buffer != undefined) {
        this.statChanges.upgradePoints = buffer;
      }
      switch (typeof selectedEvent.statChanges.xpChange) {
        case "number":
          this.xpChange = Math.trunc(selectedEvent.statChanges.xpChange);
          break;
        case "string":
          this.xpChange = numFromString(selectedEvent.statChanges.xpChange, vars).value;
      }
    }
    if (typeof selectedEvent.reward == "string") {
      this.reward = selectedEvent.reward || undefined;
    }
    if (selectedEvent.varChanges != null && typeof selectedEvent.varChanges == "object") {
      for (let [name, value] of Object.entries(selectedEvent.varChanges)) {
        switch (typeof value) {
          case "number":
            this.varChanges.vars.set(name, Math.trunc(value));
            break;
          case "string":
            this.varChanges.vars.set(name, numFromString(value, vars).value);
        }
      }
    }
    if (Array.isArray(selectedEvent.choices)) {
      for (let eventChoice of selectedEvent.choices) {
        this.choices.push(new choice(eventChoice));
      }
    }
    this.blueprintInternal = blueprint;
  }
  get blueprint() {
    return this.blueprintInternal;
  }
  *eventHandler(
    this: event,
    playerCharacter: player,
    vars: variables,
    present: UseIonToastResult[0],
    endEvent?: fn,
    Wrapper: React.FC<React.PropsWithChildren> = Fragment
  ): Generator<React.ReactNode, undefined, void | fn> {
    const advanceEventFn: fn | void = yield;
    if (advanceEventFn == undefined) {
      throw Error("No advance event function provided");
    }
    const advanceEvent: fn = advanceEventFn;
    let eventSpell: spell = new spell();
    let opponent: enemy = new enemy();
    while (true) {
      if (this.preBattleText) {
        yield (
          <Wrapper>
            <IonContent>
              <div className="ion-text-center">{this.preBattleText}</div>
              <ContinueButton />
            </IonContent>
          </Wrapper>
        );
      }
      vars.add(this.varChanges);
      eventSpell.loadFromFile(this.preBattleSpell, vars);
      opponent.loadFromFile(this.enemyBlueprint, vars);
      if (eventSpell.getReal()) {
        yield (
          <Wrapper>
            <IonContent>
              <SpellCast magic={eventSpell} target={playerCharacter} />
              <ContinueButton />
            </IonContent>
          </Wrapper>
        );
        if (playerCharacter.getHealth() <= 0) {
          yield (
            <Wrapper>
              <IonContent>
                <div className="ion-text-center">You are dead</div>
                <ContinueButton />
              </IonContent>
            </Wrapper>
          );
          break;
        }
      }
      if (opponent.getReal()) {
        const battleLog: string[] = [];
        const BoundWrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
          <BattleWrapper playerCharacter={playerCharacter} battleLog={battleLog}>
            {children}
          </BattleWrapper>
        );
        let battleIterator: Generator<React.ReactNode, React.ReactNode, void | fn> = battleHandler(
          playerCharacter,
          opponent,
          battleLog,
          undefined,
          BoundWrapper,
          this.firstGo
        );
        battleIterator.next();
        yield battleIterator.next(advanceEvent).value;
        let battleEndPage: React.ReactNode = yield* battleIterator;
        if (playerCharacter.getHealth() <= 0) {
          yield battleEndPage;
          break;
        }
        yield battleEndPage;
        playerCharacter.reset();
        if (playerCharacter.getHealth() <= 0) {
          yield (
            <Wrapper>
              <IonContent>
                <div className="ion-text-center">
                  You defeat {opponent.getName()}, but succumb to your wounds after the battle
                </div>
                <ContinueButton />
              </IonContent>
            </Wrapper>
          );
          break;
        }
      } else {
        playerCharacter.removeStatusEffects();
        playerCharacter.calculateModifiers();
      }
      if (this.postBattleText) {
        yield (
          <Wrapper>
            <IonContent>
              <div className="ion-text-center">{this.postBattleText}</div>
              <ContinueButton />
            </IonContent>
          </Wrapper>
        );
      }
      {
        let statChangesDisplay: React.ReactNode[] = player.statChanges(playerCharacter, this.statChanges);
        if (statChangesDisplay.length > 0) {
          yield (
            <Wrapper>
              <IonContent>
                {statChangesDisplay}
                <ContinueButton />
              </IonContent>
            </Wrapper>
          );
        }
      }
      //TODO: add xp change
      //TODO: add reward
      playerCharacter.calculateModifiers();
      //Check if stat changes have caused the player to die
      if (playerCharacter.getHealth() <= 0) {
        yield (
          <Wrapper>
            <IonContent>
              <div className="ion-text-center">You are dead</div>
              <ContinueButton />
            </IonContent>
          </Wrapper>
        );
        break;
      }
      let possibleChoices: choice[] = this.choices.filter(
        (choice) =>
          evalCond(choice.req, playerCharacter, vars) &&
          (choice.hidden ||
            (choice.manaChange >= -playerCharacter.getMana() &&
              choice.healthChange >= -playerCharacter.getHealth() &&
              choice.projectileChange >= -playerCharacter.getProjectiles()))
      );
      if (possibleChoices.length == 0) {
        break;
      }
      let chosen: choice;
      const choose: fn<[number]> = function (index: number): void {
        chosen = possibleChoices[index];
        advanceEvent();
      };
      yield (
        <Wrapper>
          <IonContent>
            <IonList>
              {possibleChoices.map((choice, index) => (
                <IonItem button onClick={() => choose(index)} key={choice.getKey()}>
                  <IonLabel className="ion-text-center">
                    {choice.text}
                    {!choice.hidden &&
                    (choice.healthChange != 0 || choice.manaChange != 0 || choice.projectileChange != 0) ? (
                      <div>
                        (
                        {choice.healthChange != 0
                          ? `${choice.healthChange > 0 ? "+" : ""}${choice.healthChange} health`
                          : null}
                        {choice.manaChange != 0
                          ? `${choice.healthChange != 0 ? ", " : ""}${choice.manaChange > 0 ? "+" : ""}${
                              choice.manaChange
                            } mana`
                          : null}
                        {choice.projectileChange != 0
                          ? `${choice.healthChange != 0 || choice.manaChange != 0 ? ", " : ""}${
                              choice.projectileChange > 0 ? "+" : ""
                            }${choice.projectileChange} arrow${Math.abs(choice.projectileChange) != 1 ? "s" : ""}`
                          : null}
                        )
                      </div>
                    ) : null}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </Wrapper>
      );
      playerCharacter.modifyHealth(chosen!.healthChange);
      playerCharacter.modifyMana(chosen!.manaChange);
      playerCharacter.modifyProjectiles(chosen!.projectileChange);
      this.loadFromFile(chosen!.eventName, vars);
      if (!this.real) {
        if (playerCharacter.getHealth() <= 0) {
          yield (
            <Wrapper>
              <IonContent>
                <div className="ion-text-center">You are dead</div>
                <ContinueButton />
              </IonContent>
            </Wrapper>
          );
        }
        break;
      }
    }
    endEvent?.();
    return;
    function ContinueButton(): React.ReactNode {
      return (
        <IonButton mode="ios" onClick={advanceEvent}>
          Continue
        </IonButton>
      );
    }
  }
}

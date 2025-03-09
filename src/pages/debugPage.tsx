import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonModal,
  IonPage,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { useRef, useState } from "react";
import { player } from "../functionality/player";
import { errorMessages } from "../functionality/data";
import { enemy } from "../functionality/enemies";
import { BattlePage } from "./battlePage";
import { deleteStoredPlayer, getStoredPlayer, storePlayer } from "../data/localStorage";
import { event } from "../functionality/events";
import { variables } from "../functionality/variables";
import { EventPage } from "./eventPage";

/**Debugging page
 * @hook
 */
export function DebugPage(): React.ReactNode {
  const [playerCharacter, setPlayerCharacter] = useState<player>(new player());
  const [opponent, setOpponent] = useState<enemy>(new enemy("BAD_GUY"));
  const [currentEvent, setCurrentEvent] = useState<event>(new event("TEST_EVENT"));
  const [classInputValue, setClassInputValue] = useState<string>("");
  const [enemyInputValue, setEnemyInputValue] = useState<string>("");
  const [eventInputValue, setEventInputValue] = useState<string>("");
  const [present] = useIonToast();
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<"debug" | "battle" | "event">("debug");
  const varsRef = useRef<variables>(new variables());
  //const [isIntroductionOpen, setIsIntroductionOpen] =
  //useState<boolean>(false);
  switch (debugMode) {
    case "debug":
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/main_menu" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonInput
              label="Class Blueprint"
              labelPlacement="stacked"
              placeholder="EMPTY"
              value={classInputValue}
              //@ts-expect-error: I don't know what the types are supposed to be here
              onInput={(e) => setClassInputValue(e.target.value)}
              onIonChange={playerClickHandler}
            />
            <IonButton mode="ios" onClick={playerClickHandler}>
              Load Class
            </IonButton>
            <IonButton mode="ios" onClick={() => setIsInventoryOpen(true)}>
              Show inventory
            </IonButton>
            <IonModal isOpen={isInventoryOpen} onDidDismiss={() => setIsInventoryOpen(false)}>
              <player.ShowInventory
                playerCharacter={playerCharacter}
                closeInventory={() => setIsInventoryOpen(false)}
              />
            </IonModal>
            <div>Currently loaded class: {playerCharacter.getClassName() || "None"}</div>
            <IonInput
              label="Enemy Blueprint"
              labelPlacement="stacked"
              placeholder="EMPTY"
              value={enemyInputValue}
              //@ts-expect-error: I don't know what the types are supposed to be here
              onInput={(e) => setEnemyInputValue(e.target.value)}
              onIonChange={enemyClickHandler}
            />
            <IonButton mode="ios" onClick={enemyClickHandler}>
              Load Enemy
            </IonButton>
            <div>Currently loaded enemy: {opponent.getName() || "None"}</div>
            <IonInput
              label="Event Blueprint"
              labelPlacement="stacked"
              placeholder="EMPTY"
              value={eventInputValue}
              //@ts-expect-error: I don't know what the types are supposed to be here
              onInput={(e) => setEventInputValue(e.target.value)}
              onIonChange={eventClickHandler}
            />
            <IonButton mode="ios" onClick={eventClickHandler}>
              Load Event
            </IonButton>
            <div>Currently loaded event: {currentEvent.blueprint || "None"}</div>
            <IonButton
              mode="ios"
              onClick={function () {
                if (opponent.getReal()) {
                  setDebugMode("battle");
                }
              }}
            >
              Start Battle
            </IonButton>
            <IonButton
              mode="ios"
              onClick={function () {
                if (currentEvent.getReal()) {
                  setDebugMode("event");
                }
              }}
            >
              Start Event
            </IonButton>
            <IonButton mode="ios" onClick={() => storePlayer(playerCharacter).catch(console.error)}>
              Save player
            </IonButton>
            <IonButton mode="ios" onClick={() => getStoredPlayer().then(setPlayerCharacter).catch(console.error)}>
              Load saved player
            </IonButton>
            <IonButton mode="ios" onClick={deleteStoredPlayer}>
              Delete saved player
            </IonButton>
            <IonButton mode="ios" onClick={() => varsRef.current.reset()}>
              Reset variables
            </IonButton>
          </IonContent>
        </IonPage>
      );
    case "battle":
      return (
        <BattlePage
          playerCharacter={playerCharacter}
          opponent={opponent}
          endBattle={function () {
            playerCharacter.reset();
            opponent.reset();
            setDebugMode("debug");
          }}
        />
      );
    case "event":
      return (
        <EventPage
          playerCharacter={playerCharacter}
          event={currentEvent}
          endEvent={function () {
            playerCharacter.reset();
            setDebugMode("debug");
          }}
          vars={varsRef.current}
        />
      );
  }
  /**Loads new player class */
  function playerClickHandler(): void {
    try {
      setPlayerCharacter(new player(classInputValue));
    } catch (err) {
      console.error(err);
      errorMessages.push(err.message);
    }
    if (errorMessages.length == 0) {
      return;
    }
    void present({
      message: errorMessages.join("\n"),
      duration: 3000 * errorMessages.length,
      cssClass: "error-message ion-text-center",
    });
    errorMessages.length = 0;
  }
  /**Loads new enemy class */
  function enemyClickHandler(): void {
    if (enemyInputValue.length > 0) {
      setOpponent(new enemy(enemyInputValue));
      if (errorMessages.length == 0) {
        return;
      }
      void present({
        message: errorMessages.join("\n"),
        duration: 3000 * errorMessages.length,
        cssClass: "error-message ion-text-center",
      });
      errorMessages.length = 0;
    }
  }
  /**Loads new event */
  function eventClickHandler(): void {
    if (eventInputValue.length > 0) {
      setCurrentEvent(new event(eventInputValue));
      if (errorMessages.length == 0) {
        return;
      }
      void present({
        message: errorMessages.join("\n"),
        duration: 3000 * errorMessages.length,
        cssClass: "error-message ion-text-center",
      });
      errorMessages.length = 0;
    }
  }
}

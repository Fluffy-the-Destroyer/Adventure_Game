import React, { useRef, useState } from "react";
import { player } from "../functionality/player";
import { event } from "../functionality/events";
import { fn } from "../functionality/interfaces";
import { IonButton, IonButtons, IonHeader, IonModal, IonPage, IonToolbar, useIonToast } from "@ionic/react";
import { variables } from "../functionality/variables";
import { useGenerator } from "../hooks/hooks";

type EventPageProps = { playerCharacter: player; event: event; vars: variables; endEvent: fn };
export function EventPage({ playerCharacter, event, vars, endEvent }: EventPageProps): React.ReactNode {
  const wrapperRef = useRef<React.FC<React.PropsWithChildren>>();
  const [present] = useIonToast();
  if (wrapperRef.current == null) {
    wrapperRef.current = function BoundWrapper({ children }) {
      return (
        <EventWrapper playerCharacter={playerCharacter} endEvent={endEvent}>
          {children}
        </EventWrapper>
      );
    };
  }
  const displayBuffer: React.ReactNode = useGenerator(
    event.eventHandler(playerCharacter, vars, present, endEvent, wrapperRef.current)
  );
  return displayBuffer;
}

type EventWrapperProps = { playerCharacter: player; endEvent?: fn; children: React.ReactNode };
function EventWrapper({ playerCharacter, endEvent, children }: EventWrapperProps): React.ReactNode {
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {endEvent != undefined ? (
            <IonButtons slot="start">
              <IonButton mode="ios" onClick={endEvent}>
                End Event
              </IonButton>
            </IonButtons>
          ) : null}
          <IonButtons slot="end">
            <IonButton mode="ios" onClick={() => setIsInventoryOpen(true)}>
              Inventory
            </IonButton>
            <IonModal isOpen={isInventoryOpen} onDidDismiss={() => setIsInventoryOpen(false)}>
              <player.ShowInventory
                playerCharacter={playerCharacter}
                closeInventory={() => setIsInventoryOpen(false)}
              />
            </IonModal>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {children}
    </IonPage>
  );
}

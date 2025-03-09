import { player } from "../functionality/player";
import { queueManagerCreator, requestHandlerCreator } from "../functionality/utility";
import localforage from "localforage";

export const storePlayer = queueManagerCreator(async function storePlayerInternal(
  playerCharacter: player
): Promise<void> {
  await localforage.setItem("playerCharacter", playerCharacter);
});

//export const storePlayer = queueManagerCreator(async function storePlayerInternal(
//  playerCharacter: player
//): Promise<void> {
//  await Preferences.set({ key: "playerCharacter", value: JSON.stringify(playerCharacter) });
//});

export const getStoredPlayer = requestHandlerCreator(async function getStoredPlayerInternal(): Promise<player> {
  return new player(await localforage.getItem("playerCharacter"));
});

//export const getStoredPlayer = requestHandlerCreator(async function getStoredPlayerInternal(): Promise<player> {
//  return new player(JSON.parse((await Preferences.get({ key: "playerCharacter" })).value!));
//});

export const deleteStoredPlayer = requestHandlerCreator(async function deleteStoredPlayerInternal(): Promise<void> {
  await localforage.removeItem("playerCharacter");
});

//export const deleteStoredPlayer = requestHandlerCreator(async function deleteStoredPlayerInternal(): Promise<void> {
//  await Preferences.remove({ key: "playerCharacter" }).catch(console.error);
//});

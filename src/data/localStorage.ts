import {Preferences} from "@capacitor/preferences";
import {player} from "../functionality/player";
import {
	queueManagerCreator,
	requestHandlerCreator
} from "../functionality/utility";

export const storePlayer = queueManagerCreator(
	async function storePlayerInternal(playerCharacter: player): Promise<void> {
		await Preferences.set({
			key: "playerCharacter",
			value: JSON.stringify(playerCharacter)
		});
	}
);

export const getStoredPlayer = requestHandlerCreator(
	async function getStoredPlayerInternal(): Promise<player> {
		return JSON.parse(
			(
				await Preferences.get({
					key: "playerCharacter"
				})
			).value!
		);
	}
);

export const deleteStoredPlayer = requestHandlerCreator(
	async function deleteStoredPlayerInternal(): Promise<void> {
		await Preferences.remove({
			key: "playerCharacter"
		});
	}
);

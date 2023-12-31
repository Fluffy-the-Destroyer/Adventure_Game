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
	useIonToast
} from "@ionic/react";
import {Fragment, useState} from "react";
import {ShowPlayerInventory, player} from "../functionality/player";
import {errorMessages} from "../functionality/data";
import {enemy} from "../functionality/enemies";
import {BattlePage} from "./battlePage";
import {
	deleteStoredPlayer,
	getStoredPlayer,
	storePlayer
} from "../data/localStorage";

/**Debugging page
 * @hook
 */
export function DebugPage(): React.JSX.Element {
	const [playerCharacter, setPlayerCharacter] = useState<player>(
		new player()
	);
	const [opponent, setOpponent] = useState<enemy>(new enemy("BAD_GUY"));
	const [classInputValue, setClassInputValue] = useState<string>("");
	const [enemyInputValue, setEnemyInputValue] = useState<string>("");
	const [present] = useIonToast();
	const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
	const [battle, setBattle] = useState<boolean>(false);
	//const [isIntroductionOpen, setIsIntroductionOpen] =
	//useState<boolean>(false);
	return (
		<Fragment>
			{battle ? (
				<BattlePage
					playerCharacter={playerCharacter}
					opponent={opponent}
					endBattle={() => {
						playerCharacter.reset();
						opponent.reset();
						setBattle(false);
					}}
				/>
			) : (
				<IonPage>
					<IonHeader>
						<IonToolbar>
							<IonButtons slot="start">
								<IonBackButton defaultHref="/main_menu"></IonBackButton>
							</IonButtons>
						</IonToolbar>
					</IonHeader>
					<IonContent>
						<IonInput
							label="Class Blueprint"
							labelPlacement="stacked"
							placeholder="EMPTY"
							value={classInputValue}
							//@ts-expect-error
							onInput={(e) => setClassInputValue(e.target.value)}
							onIonChange={playerClickHandler}
						></IonInput>
						<IonButton mode="ios" onClick={playerClickHandler}>
							Load Class
						</IonButton>
						<IonButton
							mode="ios"
							onClick={() => setIsInventoryOpen(true)}
						>
							Show inventory
						</IonButton>
						<IonModal
							isOpen={isInventoryOpen}
							onDidDismiss={() => setIsInventoryOpen(false)}
						>
							<ShowPlayerInventory
								playerCharacter={playerCharacter}
								closeInventory={() => setIsInventoryOpen(false)}
							/>
						</IonModal>
						<div>
							Currently loaded class:{" "}
							{playerCharacter.getClassName() || "None"}
						</div>
						<IonInput
							label="Enemy Blueprint"
							labelPlacement="stacked"
							placeholder="EMPTY"
							value={enemyInputValue}
							//@ts-expect-error
							onInput={(e) => setEnemyInputValue(e.target.value)}
							onIonChange={enemyClickHandler}
						></IonInput>
						<IonButton mode="ios" onClick={enemyClickHandler}>
							Load Enemy
						</IonButton>
						<div>
							Currently loaded enemy:{" "}
							{opponent.getName() || "None"}
						</div>
						<IonButton
							mode="ios"
							onClick={() => {
								if (opponent.getReal()) {
									setBattle(true);
								}
							}}
						>
							Start Battle
						</IonButton>
						<IonButton
							mode="ios"
							onClick={() => storePlayer(playerCharacter)}
						>
							Save player
						</IonButton>
						<IonButton
							mode="ios"
							onClick={() =>
								getStoredPlayer().then((playerCharacter) =>
									setPlayerCharacter(
										new player(playerCharacter)
									)
								)
							}
						>
							Load saved player
						</IonButton>
						<IonButton mode="ios" onClick={deleteStoredPlayer}>
							Delete saved player
						</IonButton>
					</IonContent>
				</IonPage>
			)}
		</Fragment>
	);
	/**Loads new player class */
	function playerClickHandler(): void {
		try {
			setPlayerCharacter(new player(classInputValue));
		} catch (err) {
			switch (err) {
				case 1:
					errorMessages.push(
						`Error parsing JSON while loading player blueprint ${classInputValue}`
					);
					break;
				case 2:
					errorMessages.push(
						`Unable to find player blueprint ${classInputValue}`
					);
					break;
				case 9:
					errorMessages.push(
						`Maximum list depth exceeded trying to load player blueprint ${classInputValue}`
					);
					break;
				case 5:
					errorMessages.push(
						`Player blueprint list ${classInputValue} contains no entries`
					);
					break;
				default:
					throw err;
			}
		}
		if (errorMessages.length == 0) {
			return;
		}
		present({
			message: errorMessages.join("\n"),
			duration: 3000 * errorMessages.length,
			cssClass: "error-message ion-text-center"
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
			present({
				message: errorMessages.join("\n"),
				duration: 3000 * errorMessages.length,
				cssClass: "error-message ion-text-center"
			});
			errorMessages.length = 0;
		}
	}
}

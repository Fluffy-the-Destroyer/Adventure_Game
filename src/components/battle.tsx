import {
	IonButton,
	IonButtons,
	IonContent,
	IonFooter,
	IonHeader,
	IonIcon,
	IonModal,
	IonPage,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import {enemy} from "../functionality/enemies";
import {
	ChoosePlayerAction,
	ShowPlayerInventory,
	player
} from "../functionality/player";
import {Fragment, useState} from "react";
import {actionChoice} from "../functionality/data";
import {close} from "ionicons/icons";

export const POISON_MULTIPLIER = 1;
export const BLEED_MULTIPLIER = 1;
export const REGEN_MULTIPLIER = 1;

/**Turn phases
 * Non-integral values indicate displaying results of the phase represented by their integer part
 * -1 - Pre battle stuff
 * 0 - Main action declaration
 * 1 - Response declaration
 * 2 - Response resolution
 * 3 - Main action resolution
 * 4 - Counter attack declaration
 * 5 - Counter attack resolution
 * 6 - Enemy dead
 * 6.5 - Enemy casting death spell
 * 7 - Player dead
 */

export const BattlePage: React.FC<{
	playerCharacter: player;
	opponent: enemy;
	endBattle: () => void;
}> = (props) => {
	/**Holds the battle log */
	const [battleLog, setBattleLog] = useState<string[]>([]);
	/**Tracks whether the battle log is open */
	const [isBattleLogOpen, setIsBattleLogOpen] = useState<boolean>(false);
	/**Tracks whether the inventory is open */
	const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton mode="ios" onClick={() => props.endBattle()}>
							End Battle
						</IonButton>
					</IonButtons>
					<IonButtons slot="end">
						<IonButton
							mode="ios"
							onClick={() => setIsInventoryOpen(true)}
						>
							Inventory
						</IonButton>
						<IonModal
							isOpen={isInventoryOpen}
							onDidDismiss={() => setIsInventoryOpen(false)}
						>
							<ShowPlayerInventory
								playerCharacter={props.playerCharacter}
								closeInventory={() => setIsInventoryOpen(false)}
							/>
						</IonModal>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<BattleHandler
				playerCharacter={props.playerCharacter}
				opponent={props.opponent}
				endBattle={props.endBattle}
				battleLog={battleLog}
			/>
			<IonFooter>
				<IonToolbar>
					<IonButtons slot="end">
						<IonButton
							mode="ios"
							onClick={() => setIsBattleLogOpen(true)}
						>
							Battle Log
						</IonButton>
						<IonModal
							isOpen={isBattleLogOpen}
							onDidDismiss={() => setIsBattleLogOpen(false)}
						>
							<IonHeader>
								<IonToolbar>
									<IonButtons slot="start">
										<IonButton
											fill="clear"
											color="dark"
											onClick={() =>
												setIsBattleLogOpen(false)
											}
										>
											<IonIcon
												slot="icon-only"
												icon={close}
											></IonIcon>
										</IonButton>
									</IonButtons>
								</IonToolbar>
							</IonHeader>
						</IonModal>
					</IonButtons>
				</IonToolbar>
			</IonFooter>
		</IonPage>
	);
};
export const BattleHandler: React.FC<{
	playerCharacter: player;
	opponent: enemy;
	endBattle: () => void;
	battleLog: string[];
}> = (props) => {
	/**Tracks whose turn it is, true is player turn */
	const [playerTurn, setPlayerTurn] = useState<boolean>(
		props.playerCharacter.rollInitiative() > props.opponent.rollInitiative()
	);
	const [firstTurn, setFirstTurn] = useState<boolean>(true);
	/**Tracks which phase of the turn we are in */
	const [phaseCounter, setPhaseCounter] = useState<
		| -1
		| 0
		| 0.5
		| 1
		| 1.5
		| 2
		| 2.5
		| 3
		| 3.5
		| 4
		| 4.5
		| 5
		| 5.5
		| 6
		| 6.5
		| 7
	>(-1);
	/**Tracks player actions */
	const [playerSelection, setPlayerSelection] = useState<actionChoice>({
		actionType: 0
	});
	/**Stores enemy actions */
	const [enemySelection, setEnemySelection] = useState<actionChoice>({
		actionType: 0
	});
	/**Checks if player or enemy is dead
	 * @returns true if one of them is dead
	 */
	function deathCheck(): boolean {
		if (props.opponent.getHealth() <= 0) {
			if (props.opponent.getDeathSpell()?.getReal()) {
				setPhaseCounter(6.5);
				return true;
			}
			if (props.playerCharacter.getHealth() <= 0) {
				setPhaseCounter(7);
				return true;
			}
			setPhaseCounter(6);
			return true;
		}
		if (props.playerCharacter.getHealth() <= 0) {
			setPhaseCounter(7);
			return true;
		}
		return false;
	}
	switch (phaseCounter) {
		case -1:
			props.battleLog.push(props.opponent.getIntroduction());
			props.battleLog.push(
				playerTurn
					? "You go first"
					: `${props.opponent.getName()} goes first`
			);
			return (
				<IonContent>
					<div className="ion-text-center">
						{props.opponent.getIntroduction()}
					</div>
					<div className="ion-text-center">
						{playerTurn
							? "You go first"
							: `${props.opponent.getName()} goes first`}
					</div>
					<IonButton
						mode="ios"
						className="ion-text-center"
						onClick={() => {
							if (!deathCheck()) {
								setPhaseCounter(0);
							}
						}}
					>
						Continue
					</IonButton>
				</IonContent>
			);
		case 0:
			if (playerTurn) {
				props.playerCharacter.turnStart();
				return (
					<Fragment>
						<ChoosePlayerAction
							playerCharacter={props.playerCharacter}
							enemyName={props.opponent.getName()}
							timing={0}
							submitChoice={(choice: actionChoice) => {
								setPlayerSelection(choice);
								setPhaseCounter(0.5);
							}}
						/>
						<IonFooter></IonFooter>
					</Fragment>
				);
			} else {
				props.opponent.turnStart();
				setEnemySelection(props.opponent.chooseAction(0, firstTurn));
				setPhaseCounter(0.5);
			}
			break;
		case 0.5:
			if (playerTurn) {
				if (playerSelection.actionType == 0) {
					setPhaseCounter(0);
					setPlayerTurn(false);
					break;
				}
			} else {
				if (enemySelection.actionType == 0) {
				}
			}
		case 1:
		case 1.5:
		case 2:
		case 2.5:
		case 3:
		case 3.5:
		case 4:
		case 4.5:
		case 5:
		case 5.5:
		case 6:
		case 6.5:
		case 7:
			return (
				<Fragment>
					<IonContent>{phaseCounter}</IonContent>
				</Fragment>
			);
	}
	return (
		<IonContent>
			<IonButton mode="ios" onClick={props.endBattle}>
				Something went wrong, click to go back
			</IonButton>
		</IonContent>
	);
};

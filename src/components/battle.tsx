import {
	IonButton,
	IonButtons,
	IonContent,
	IonFooter,
	IonHeader,
	IonIcon,
	IonModal,
	IonPage,
	IonToolbar
} from "@ionic/react";
import {enemy} from "../functionality/enemies";
import {
	ChoosePlayerAction,
	ShowPlayerInventory,
	player
} from "../functionality/player";
import {Fragment, useEffect, useState} from "react";
import {actionChoice} from "../functionality/data";
import {close} from "ionicons/icons";
import {spell} from "../functionality/spells";
import {weapon} from "../functionality/weapons";
import {randomFloat} from "../functionality/rng";

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

/**Displays the Battle page */
export function BattlePage(props: {
	/**The player */
	playerCharacter: player;
	/**The enemy */
	opponent: enemy;
	/**Ends the battle (will cause parent component to stop displaying battle) */
	endBattle: () => void;
}): React.JSX.Element {
	/**Holds the battle log */
	const [battleLog] = useState<string[]>([]);
	/**Tracks whether the battle log is open */
	const [isBattleLogOpen, setIsBattleLogOpen] = useState<boolean>(false);
	/**Tracks whether the inventory is open */
	const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
	/**Holds the battle handler iterator */
	const [battleHandlerIterator] = useState<
		Generator<
			React.JSX.Element | null,
			React.JSX.Element | null,
			() => void
		>
	>(
		battleHandler(
			props.playerCharacter,
			props.opponent,
			props.endBattle,
			battleLog
		)
	);
	/**Holds the JSX returned from the battle handler */
	const [displayBuffer, setDisplayBuffer] =
		useState<React.JSX.Element | null>(null);
	useEffect(() => {
		battleHandlerIterator.next();
		setDisplayBuffer(
			battleHandlerIterator.next(() => {
				var newDisplay: React.JSX.Element | null =
					battleHandlerIterator.next().value;
				while (newDisplay == null) {
					newDisplay = battleHandlerIterator.next().value;
				}
				setDisplayBuffer(newDisplay);
			}).value
		);
	}, [battleHandlerIterator, setDisplayBuffer]);
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
			{displayBuffer}
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
							<IonContent></IonContent>
						</IonModal>
					</IonButtons>
				</IonToolbar>
			</IonFooter>
		</IonPage>
	);
}
/**Handles the actual battle */
export function BattleHandler(props: {
	/**The player */
	playerCharacter: player;
	/**The enemy */
	opponent: enemy;
	/**Ends the battle */
	endBattle: () => void;
	/**Array containing the battle log */
	battleLog: string[];
}): React.JSX.Element | null {
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
		//| 1.5
		| 2
		| 2.5
		| 3
		| 3.5
		| 4
		//| 4.5
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
	/**Stores health of active fighter after declaring main action, to test whether to run a death check after a response */
	const [postDeclarationHealth, setPostDeclarationHealth] =
		useState<number>(0);
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
	/**Runs start of battle set up */
	phaseSwitch: switch (phaseCounter) {
		//Battle initialisation
		case -1:
			if (deathCheck()) {
				break phaseSwitch;
			}
			props.playerCharacter.resetBonusActions();
			props.opponent.resetBonusActions();
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
		//Main action selection
		case 0:
			if (playerTurn) {
				props.playerCharacter.turnStart();
				if (deathCheck()) {
					break phaseSwitch;
				}
				return (
					<ChoosePlayerAction
						playerCharacter={props.playerCharacter}
						enemyName={props.opponent.getName()}
						timing={0}
						submitChoice={(choice: actionChoice) => {
							setPlayerSelection(choice);
							setPhaseCounter(0.5);
						}}
					/>
				);
			} else {
				props.opponent.turnStart();
				if (deathCheck()) {
					break phaseSwitch;
				}
				setEnemySelection(props.opponent.chooseAction(0, firstTurn));
				setPhaseCounter(0.5);
			}
			break phaseSwitch;
		//Main action declaration
		case 0.5:
			console.log("test");
			if (playerTurn) {
				switch (playerSelection.actionType) {
					case 0:
						setPhaseCounter(0);
						setPlayerTurn(false);
						break phaseSwitch;
					case 1:
						props.battleLog.push(
							`You attack with ${props.playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()}`
						);
						weaponDeclare(
							props.playerCharacter,
							props.playerCharacter.getWeapon(
								playerSelection.slot1
							)
						);
						break;
					case 3:
						props.battleLog.push(
							`You attack with ${props.playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()} and ${props.playerCharacter
								.getWeapon(playerSelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							props.playerCharacter,
							props.playerCharacter.getWeapon(
								playerSelection.slot1
							),
							props.playerCharacter.getWeapon(
								playerSelection.slot2
							)
						);
						break;
					case 2:
						props.battleLog.push(
							`You cast ${props.playerCharacter
								.getSpell(playerSelection.slot1)
								.getName()}`
						);
						spellDeclare(
							props.playerCharacter.getSpell(
								playerSelection.slot1
							),
							props.playerCharacter
						);
				}
				return (
					<IonContent>
						<div className="ion-text-center">
							{props.battleLog.at(-1)}
						</div>
						<IonButton
							mode="ios"
							onClick={() => {
								setPhaseCounter(1);
								setPostDeclarationHealth(
									props.playerCharacter.getHealth()
								);
							}}
						>
							Continue
						</IonButton>
					</IonContent>
				);
			} else {
				switch (enemySelection.actionType) {
					case 0:
						props.battleLog.push(
							`${props.opponent.getName()} does nothing`
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.opponent.getName()} does nothing
								</div>
								<IonButton
									mode="ios"
									onClick={() => {
										setPhaseCounter(0);
										setPlayerTurn(true);
										setFirstTurn(false);
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 1:
						props.battleLog.push(
							`${props.opponent.getName()} attacks with ${props.opponent
								.getWeapon(enemySelection.slot1)
								.getName()}`
						);
						weaponDeclare(
							props.opponent,
							props.opponent.getWeapon(enemySelection.slot1)
						);
						break;
					case 3:
						props.battleLog.push(
							`${props.opponent.getName()} attacks with ${props.opponent
								.getWeapon(enemySelection.slot1)
								.getName()} and ${props.opponent
								.getWeapon(enemySelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							props.opponent,
							props.opponent.getWeapon(enemySelection.slot1),
							props.opponent.getWeapon(enemySelection.slot2)
						);
						break;
					case 2:
						props.battleLog.push(
							`${props.opponent.getName()} casts ${props.opponent
								.getSpell(enemySelection.slot1)
								.getName()}`
						);
						spellDeclare(
							props.opponent.getSpell(enemySelection.slot1),
							props.opponent
						);
				}
				return (
					<IonContent>
						<div className="ion-text-center">
							{props.battleLog.at(-1)}
						</div>
						<IonButton
							mode="ios"
							onClick={() => {
								setPhaseCounter(1);
								setPostDeclarationHealth(
									props.opponent.getHealth()
								);
							}}
						>
							Continue
						</IonButton>
					</IonContent>
				);
			}
		//Response action selection
		case 1:
			if (playerTurn) {
				switch (playerSelection.actionType) {
					case 1:
						setEnemySelection(
							props.opponent.chooseAction(
								1,
								firstTurn,
								props.playerCharacter
									.getWeapon(playerSelection.slot1)
									.getName()
							)
						);
						break;
					case 3:
						setEnemySelection(
							props.opponent.chooseAction(
								4,
								firstTurn,
								props.playerCharacter
									.getWeapon(playerSelection.slot1)
									.getName(),
								props.playerCharacter
									.getWeapon(playerSelection.slot2)
									.getName()
							)
						);
						break;
					case 2:
						setEnemySelection(
							props.opponent.chooseAction(
								2,
								firstTurn,
								props.playerCharacter
									.getSpell(playerSelection.slot1)
									.getName()
							)
						);
						break;
				}
				setPhaseCounter(2);
				break phaseSwitch;
			} else {
				switch (enemySelection.actionType) {
					case 1:
						if (!props.playerCharacter.checkPlayerActions(1)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={props.playerCharacter}
								enemyName={props.opponent.getName()}
								timing={1}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={props.opponent
									.getWeapon(enemySelection.slot1)
									.getName()}
							/>
						);
					case 3:
						if (!props.playerCharacter.checkPlayerActions(4)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={props.playerCharacter}
								enemyName={props.opponent.getName()}
								timing={3}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={props.opponent
									.getWeapon(enemySelection.slot1)
									.getName()}
								itemName2={props.opponent
									.getWeapon(enemySelection.slot2)
									.getName()}
							/>
						);
					case 2:
						if (!props.playerCharacter.checkPlayerActions(2)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={props.playerCharacter}
								enemyName={props.opponent.getName()}
								timing={2}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={props.opponent
									.getSpell(enemySelection.slot1)
									.getName()}
							/>
						);
				}
			}
			break phaseSwitch;
		//Response action resolution
		case 2:
			if (playerTurn) {
				if (enemySelection.actionType == 0) {
					setPhaseCounter(3);
					break phaseSwitch;
				} else {
					props.battleLog.push(
						`${props.opponent.getName()} casts ${props.opponent
							.getSpell(enemySelection.slot1)
							.getName()} in response`
					);
					spellDeclare(
						props.opponent.getSpell(enemySelection.slot1),
						props.opponent
					);
					return (
						<IonContent>
							<div className="ion-text-center">
								{props.battleLog.at(-1)}
							</div>
							<SpellCast
								magic={props.opponent.getSpell(
									enemySelection.slot1
								)}
								caster={props.opponent}
								target={props.playerCharacter}
								battleLog={props.battleLog}
								timing={1}
							/>
							<IonButton
								mode="ios"
								onClick={() => {
									if (
										props.opponent
											.getSpell(enemySelection.slot1)
											.getPropDamage() > 0 ||
										props.playerCharacter.getHealth() <
											postDeclarationHealth
									) {
										if (!deathCheck()) {
											setPhaseCounter(2.5);
										}
									} else {
										setPhaseCounter(2.5);
									}
								}}
							>
								Continue
							</IonButton>
						</IonContent>
					);
				}
			} else {
				if (playerSelection.actionType == 0) {
					setPhaseCounter(3);
					break phaseSwitch;
				} else {
					props.battleLog.push(
						`You cast ${props.playerCharacter
							.getSpell(playerSelection.slot1)
							.getName()} in response`
					);
					spellDeclare(
						props.playerCharacter.getSpell(playerSelection.slot1),
						props.playerCharacter
					);
					return (
						<IonContent>
							<div className="ion-text-center">
								{props.battleLog.at(-1)}
							</div>
							<SpellCast
								magic={props.playerCharacter.getSpell(
									playerSelection.slot1
								)}
								caster={props.playerCharacter}
								target={props.opponent}
								timing={1}
								battleLog={props.battleLog}
							/>
							<IonButton
								mode="ios"
								onClick={() => {
									if (
										props.playerCharacter
											.getSpell(playerSelection.slot1)
											.getPropDamage() > 0 ||
										props.opponent.getHealth() <
											postDeclarationHealth
									) {
										if (!deathCheck()) {
											setPhaseCounter(2.5);
										}
									} else {
										setPhaseCounter(2.5);
									}
								}}
							>
								Continue
							</IonButton>
						</IonContent>
					);
				}
			}
		//Response action resolution effects
		case 2.5:
			if (playerTurn) {
				switch (playerSelection.actionType) {
					case 1:
						if (
							props.opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								props.playerCharacter
									.getWeapon(playerSelection.slot1)
									.getCanCounter()
							) {
								props.battleLog.push(
									`The effects of ${props.playerCharacter
										.getWeapon(playerSelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => {
												if (!deathCheck()) {
													setPhaseCounter(0);
													setPlayerTurn(false);
												}
											}}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							} else {
								props.opponent.addNoCounter(
									false,
									props.playerCharacter
										.getWeapon(playerSelection.slot1)
										.getName()
								);
								props.battleLog.push(
									`${props.playerCharacter
										.getWeapon(playerSelection.slot1)
										.getName()} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => setPhaseCounter(3)}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							}
						} else {
							setPhaseCounter(3);
							break phaseSwitch;
						}
					case 2:
						if (
							props.opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() == 1 ||
							props.opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() == 3
						) {
							if (
								props.playerCharacter
									.getSpell(playerSelection.slot1)
									.getNoCounter()
							) {
								props.battleLog.push(
									`${props.playerCharacter
										.getSpell(playerSelection.slot1)
										.getName()} cannot be countered`
								);
								props.opponent.addNoCounter(
									true,
									props.playerCharacter
										.getSpell(playerSelection.slot1)
										.getName()
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => setPhaseCounter(3)}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							} else {
								props.battleLog.push(
									`The effects of ${props.playerCharacter
										.getSpell(playerSelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => {
												if (!deathCheck()) {
													setPhaseCounter(0);
													setPlayerTurn(false);
												}
											}}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							}
						} else {
							setPhaseCounter(3);
							break phaseSwitch;
						}
					case 3:
						if (
							props.opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								props.playerCharacter
									.getWeapon(playerSelection.slot1)
									.getCanCounter()
							) {
								if (
									props.playerCharacter
										.getWeapon(playerSelection.slot2)
										.getCanCounter()
								) {
									props.battleLog.push(
										`The effects of ${props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} and ${props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} are countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													if (!deathCheck()) {
														setPhaseCounter(0);
														setPlayerTurn(false);
													}
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								} else {
									props.battleLog.push(
										`The effects of ${props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} are countered, but ${props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} cannot be countered`
									);
									props.opponent.addNoCounter(
										false,
										props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													setPhaseCounter(3);
													setPlayerSelection({
														actionType: 1,
														slot1: playerSelection.slot2
													});
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								}
							} else {
								if (
									props.playerCharacter
										.getWeapon(playerSelection.slot2)
										.getCanCounter()
								) {
									props.battleLog.push(
										`The effects of ${props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} are countered, but ${props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} cannot be countered`
									);
									props.opponent.addNoCounter(
										false,
										props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													setPhaseCounter(3);
													setPlayerSelection({
														actionType: 1,
														slot1: playerSelection.slot1
													});
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								} else {
									props.battleLog.push(
										`${props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} and ${props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} cannot be countered`
									);
									props.opponent.addNoCounter(
										false,
										props.playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()
									);
									props.opponent.addNoCounter(
										false,
										props.playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() =>
													setPhaseCounter(3)
												}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								}
							}
						} else {
							setPhaseCounter(3);
							break phaseSwitch;
						}
					default:
						setPhaseCounter(3);
						break phaseSwitch;
				}
			} else {
				switch (enemySelection.actionType) {
					case 1:
						if (
							props.playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								props.opponent
									.getWeapon(enemySelection.slot1)
									.getCanCounter()
							) {
								props.battleLog.push(
									`The effects of ${props.opponent
										.getWeapon(enemySelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => {
												if (!deathCheck()) {
													setPhaseCounter(0);
													setPlayerTurn(true);
													setFirstTurn(false);
												}
											}}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							} else {
								props.battleLog.push(
									`${props.opponent
										.getWeapon(enemySelection.slot1)
										.getName()} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => setPhaseCounter(3)}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							}
						} else {
							setPhaseCounter(3);
							break phaseSwitch;
						}
					case 2:
						if (
							props.playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() == 1 ||
							props.playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() == 3
						) {
							if (
								props.opponent
									.getSpell(enemySelection.slot1)
									.getNoCounter()
							) {
								props.battleLog.push(
									`${props.opponent
										.getSpell(enemySelection.slot1)
										.getName()} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => setPhaseCounter(3)}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							} else {
								props.battleLog.push(
									`The effects of ${props.opponent
										.getSpell(enemySelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{props.battleLog.at(-1)}
										</div>
										<IonButton
											mode="ios"
											onClick={() => {
												if (!deathCheck()) {
													setPhaseCounter(0);
													setPlayerTurn(true);
													setFirstTurn(false);
												}
											}}
										>
											Continue
										</IonButton>
									</IonContent>
								);
							}
						} else {
							setPhaseCounter(3);
							break phaseSwitch;
						}
					case 3:
						if (
							props.playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								props.opponent
									.getWeapon(enemySelection.slot1)
									.getCanCounter()
							) {
								if (
									props.opponent
										.getWeapon(enemySelection.slot2)
										.getCanCounter()
								) {
									props.battleLog.push(
										`The effects of ${props.opponent
											.getWeapon(enemySelection.slot1)
											.getName()} and ${props.opponent
											.getWeapon(enemySelection.slot2)
											.getName()} are countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													if (!deathCheck()) {
														setPhaseCounter(0);
														setPlayerTurn(true);
														setFirstTurn(false);
													}
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								} else {
									props.battleLog.push(
										`The effects of ${props.opponent
											.getWeapon(enemySelection.slot1)
											.getName()} are countered, but ${props.opponent
											.getWeapon(enemySelection.slot2)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													setEnemySelection({
														actionType: 1,
														slot1: enemySelection.slot2
													});
													setPhaseCounter(3);
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								}
							} else {
								if (
									props.opponent
										.getWeapon(enemySelection.slot2)
										.getCanCounter()
								) {
									props.battleLog.push(
										`The effects of ${props.opponent
											.getWeapon(enemySelection.slot2)
											.getName()} are countered, but ${props.opponent
											.getWeapon(enemySelection.slot1)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() => {
													setEnemySelection({
														actionType: 1,
														slot1: enemySelection.slot1
													});
													setPhaseCounter(3);
												}}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								} else {
									props.battleLog.push(
										`${props.opponent
											.getWeapon(enemySelection.slot1)
											.getName()} and ${props.opponent
											.getWeapon(enemySelection.slot2)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{props.battleLog.at(-1)}
											</div>
											<IonButton
												mode="ios"
												onClick={() =>
													setPhaseCounter(3)
												}
											>
												Continue
											</IonButton>
										</IonContent>
									);
								}
							}
						}
					default:
						setPhaseCounter(3);
						break phaseSwitch;
				}
			}
		//Main action resolution
		case 3:
			if (playerTurn) {
				switch (playerSelection.actionType) {
					case 1:
						return (
							<IonContent>
								<WeaponAttack
									weapon1={props.playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									attacker={props.playerCharacter}
									target={props.opponent}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												props.playerCharacter
													.getWeapon(
														playerSelection.slot1
													)
													.getNoCounterAttack() ||
												randomFloat(0, 1) >=
													props.opponent.getEvadeChance()
											) {
												setPhaseCounter(0);
												setPlayerTurn(false);
											} else {
												setPhaseCounter(4);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 3:
						return (
							<IonContent>
								<WeaponAttack
									weapon1={props.playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									weapon2={props.playerCharacter.getWeapon(
										playerSelection.slot2
									)}
									attacker={props.playerCharacter}
									target={props.opponent}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												(props.playerCharacter
													.getWeapon(
														playerSelection.slot1
													)
													.getNoCounterAttack() &&
													props.playerCharacter
														.getWeapon(
															playerSelection.slot2
														)
														.getNoCounterAttack()) ||
												randomFloat(0, 1) >=
													props.opponent.getEvadeChance()
											) {
												setPhaseCounter(0);
												setPlayerTurn(false);
											} else {
												setPhaseCounter(4);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 2:
						return (
							<IonContent>
								<SpellCast
									magic={props.playerCharacter.getSpell(
										playerSelection.slot1
									)}
									caster={props.playerCharacter}
									target={props.opponent}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												props.playerCharacter
													.getSpell(
														playerSelection.slot1
													)
													.getCanCounterAttack() &&
												randomFloat(0, 1) <
													props.opponent.getEvadeChance()
											) {
												setPhaseCounter(4);
											} else {
												setPhaseCounter(0);
												setPlayerTurn(false);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					default:
						setPhaseCounter(0);
						setPlayerTurn(false);
						break phaseSwitch;
				}
			} else {
				switch (enemySelection.actionType) {
					case 1:
						return (
							<IonContent>
								<WeaponAttack
									weapon1={props.opponent.getWeapon(
										enemySelection.slot1
									)}
									attacker={props.opponent}
									target={props.playerCharacter}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												props.opponent
													.getWeapon(
														enemySelection.slot1
													)
													.getNoCounterAttack() ||
												randomFloat(0, 1) >=
													props.playerCharacter.getEvadeChance()
											) {
												setPhaseCounter(0);
												setPlayerTurn(true);
												setFirstTurn(false);
											} else {
												setPhaseCounter(4);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 3:
						return (
							<IonContent>
								<WeaponAttack
									weapon1={props.opponent.getWeapon(
										enemySelection.slot1
									)}
									weapon2={props.opponent.getWeapon(
										enemySelection.slot2
									)}
									attacker={props.opponent}
									target={props.playerCharacter}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												(props.opponent
													.getWeapon(
														enemySelection.slot1
													)
													.getNoCounterAttack() &&
													props.opponent
														.getWeapon(
															enemySelection.slot2
														)
														.getNoCounterAttack()) ||
												randomFloat(0, 1) >=
													props.playerCharacter.getEvadeChance()
											) {
												setPhaseCounter(0);
												setPlayerTurn(true);
												setFirstTurn(false);
											} else {
												setPhaseCounter(4);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 2:
						return (
							<IonContent>
								<SpellCast
									magic={props.opponent.getSpell(
										enemySelection.slot1
									)}
									caster={props.opponent}
									target={props.playerCharacter}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												props.opponent
													.getSpell(
														enemySelection.slot1
													)
													.getCanCounterAttack() &&
												randomFloat(0, 1) <
													props.playerCharacter.getEvadeChance()
											) {
												setPhaseCounter(4);
											} else {
												setPhaseCounter(0);
												setPlayerTurn(true);
												setFirstTurn(false);
											}
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					default:
						setPhaseCounter(0);
						break phaseSwitch;
				}
			}
		//Main action resolution effects
		//case 3.5:
		//Counter attack selection
		case 4:
			if (playerTurn) {
				setEnemySelection(props.opponent.chooseAction(3, firstTurn));
				if (enemySelection.actionType == 0) {
					setPhaseCounter(0);
					setPlayerTurn(false);
				} else {
					setPhaseCounter(5);
				}
				break phaseSwitch;
			} else {
				if (props.playerCharacter.checkPlayerActions(3)) {
					return (
						<ChoosePlayerAction
							playerCharacter={props.playerCharacter}
							enemyName={props.opponent.getName()}
							timing={3}
							submitChoice={(choice) => {
								if (choice.actionType == 0) {
									setPhaseCounter(0);
									setPlayerTurn(true);
									setFirstTurn(false);
								} else {
									setPhaseCounter(5);
								}
							}}
						/>
					);
				} else {
					setPhaseCounter(0);
					setPlayerTurn(true);
					setFirstTurn(false);
					break phaseSwitch;
				}
			}
		//Counter attack resolution
		//case 4.5:
		//Counter attack resolution
		case 5:
			if (playerTurn) {
				switch (enemySelection.actionType) {
					case 1:
						props.battleLog.push(
							`${props.opponent.getName()} counter attacks with ${props.opponent.getWeapon(
								enemySelection.slot1
							)}`
						);
						weaponDeclare(
							props.opponent,
							props.opponent.getWeapon(enemySelection.slot1)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={props.opponent.getWeapon(
										enemySelection.slot1
									)}
									attacker={props.opponent}
									target={props.playerCharacter}
									counter
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 3:
						props.battleLog.push(
							`${props.opponent.getName()} counter attacks with ${props.opponent
								.getWeapon(enemySelection.slot1)
								.getName()} and ${props.opponent
								.getWeapon(enemySelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							props.opponent,
							props.opponent.getWeapon(enemySelection.slot1),
							props.opponent.getWeapon(enemySelection.slot2)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={props.opponent.getWeapon(
										enemySelection.slot1
									)}
									weapon2={props.opponent.getWeapon(
										enemySelection.slot2
									)}
									attacker={props.opponent}
									target={props.playerCharacter}
									counter
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 2:
						props.battleLog.push(
							`${props.opponent.getName()} counter attacks by casting ${props.opponent
								.getSpell(enemySelection.slot1)
								.getName()}`
						);
						spellDeclare(
							props.opponent.getSpell(enemySelection.slot1),
							props.opponent
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<SpellCast
									magic={props.opponent.getSpell(
										enemySelection.slot1
									)}
									caster={props.opponent}
									target={props.playerCharacter}
									timing={3}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					default:
						setPhaseCounter(0);
						setPlayerTurn(false);
						break phaseSwitch;
				}
			} else {
				switch (playerSelection.actionType) {
					case 1:
						props.battleLog.push(
							`You counter attack with ${props.playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()}`
						);
						weaponDeclare(
							props.playerCharacter,
							props.playerCharacter.getWeapon(
								playerSelection.slot1
							)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={props.playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									attacker={props.playerCharacter}
									target={props.opponent}
									counter
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(false);
											setFirstTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 3:
						props.battleLog.push(
							`You counter attack with ${props.playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()} and ${props.playerCharacter
								.getWeapon(playerSelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							props.playerCharacter,
							props.playerCharacter.getWeapon(
								playerSelection.slot1
							),
							props.playerCharacter.getWeapon(
								playerSelection.slot2
							)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(true);
											setFirstTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					case 2:
						props.battleLog.push(
							`You counter attack by casting ${props.playerCharacter
								.getSpell(playerSelection.slot1)
								.getName()}`
						);
						spellDeclare(
							props.playerCharacter.getSpell(
								playerSelection.slot1
							),
							props.playerCharacter
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{props.battleLog.at(-1)}
								</div>
								<SpellCast
									magic={props.playerCharacter.getSpell(
										playerSelection.slot1
									)}
									caster={props.playerCharacter}
									target={props.opponent}
									timing={3}
									battleLog={props.battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											setPhaseCounter(0);
											setPlayerTurn(true);
											setFirstTurn(false);
										}
									}}
								>
									Continue
								</IonButton>
							</IonContent>
						);
					default:
						setPhaseCounter(0);
						break phaseSwitch;
				}
			}
		//Counter attack resolution effects
		case 5.5:
		//Enemy dead
		case 6:
		//Enemy casting death spell
		case 6.5:
		//Player dead
		case 7:
		//Failsafe
		default:
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
}

/**Weapon declare
 * @param attacker - The attacker
 * @param weapon1 - The first weapon
 * @param weapon2 - The second weapon (if present)
 */
function weaponDeclare(
	attacker: player | enemy,
	weapon1: weapon,
	weapon2?: weapon
): void {
	attacker.modifyHealth(weapon1.getHealthChange());
	attacker.modifyMana(weapon1.getManaChange());
	attacker.modifyProjectiles(weapon1.getProjectileChange());
	if (weapon2 != undefined) {
		attacker.modifyHealth(weapon2.getHealthChange());
		attacker.modifyMana(weapon2.getManaChange());
		attacker.modifyProjectiles(weapon2.getProjectileChange());
	}
}

/**Weapon attack */
function WeaponAttack(props: {
	weapon1: weapon;
	weapon2?: weapon;
	attacker: player;
	target: enemy;
	counter?: boolean;
	battleLog: string[];
}): React.JSX.Element;
function WeaponAttack(props: {
	weapon1: weapon;
	weapon2?: weapon;
	attacker: enemy;
	target: player;
	counter?: boolean;
	battleLog: string[];
}): React.JSX.Element;
function WeaponAttack(props: {
	/**First weapon */
	weapon1: weapon;
	/**Second weapon (if present) */
	weapon2?: weapon;
	/**Attacker */
	attacker: player | enemy;
	/**Target */
	target: player | enemy;
	/**Is it a counter attack */
	counter?: boolean;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	//If dual wielding, ensure weapon1 hits at least as many times as weapon2
	if (props.weapon2 != undefined) {
		if (props.counter) {
			if (
				props.weapon2.getCounterHits() > props.weapon1.getCounterHits()
			) {
				return (
					//@ts-expect-error
					<WeaponAttack
						weapon1={props.weapon2}
						weapon2={props.weapon1}
						attacker={props.attacker}
						target={props.target}
						battleLog={props.battleLog}
						counter
					/>
				);
			}
		} else {
			if (props.weapon2.getHitCount() > props.weapon1.getHitCount()) {
				return (
					//@ts-expect-error
					<WeaponAttack
						weapon1={props.weapon2}
						weapon2={props.weapon1}
						attacker={props.attacker}
						target={props.target}
						battleLog={props.battleLog}
					/>
				);
			}
		}
	}
	/**An array of divs displaying effects on the attacker */
	const attackerEffects: React.JSX.Element[] = [];
	let outputText: string;
	/**For holding damage values */
	let damageBuffer: number;
	if (
		props.weapon1.getEffectType()[1] == 1 ||
		props.weapon1.getEffectType()[1] == 2 ||
		props.weapon1.getEffectType()[0] == 1 ||
		props.weapon1.getEffectType()[0] == 2 ||
		props.weapon2?.getEffectType()[1] == 1 ||
		props.weapon2?.getEffectType()[1] == 2 ||
		props.weapon2?.getEffectType()[0] == 1 ||
		props.weapon2?.getEffectType()[0] == 2
	) {
		outputText = "Attacker effects:";
		props.battleLog.push(outputText);
		attackerEffects.push(
			<div className="ion-text-center" key="attacker-effects">
				{outputText}
			</div>
		);
	}
	//Positive and negative prop damage do not commute, so take care over the ordering
	if (props.weapon1.getPropSelfDamage() > 0) {
		//@ts-expect-error
		if (props.weapon2?.getPropSelfDamage() > 0) {
			damageBuffer =
				props.weapon1.getPropSelfDamage() +
				props.weapon2!.getPropSelfDamage() -
				props.weapon1.getPropSelfDamage() *
					props.weapon2!.getPropSelfDamage();
			props.attacker.propDamage(damageBuffer);
			outputText = `${-Math.round(100 * damageBuffer)}% health`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (props.weapon2?.getPropSelfDamage() < 0) {
			props.attacker.propDamage(props.weapon1.getPropSelfDamage());
			props.attacker.propDamage(props.weapon2!.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon1.getPropSelfDamage()
			)}% health, then ${-Math.round(
				100 * props.weapon2!.getPropSelfDamage()
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else {
			props.attacker.propDamage(props.weapon1.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon1.getPropSelfDamage()
			)}% health`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	} else if (props.weapon1.getPropSelfDamage() < 0) {
		//@ts-expect-error
		if (props.weapon2?.getPropSelfDamage() > 0) {
			props.attacker.propDamage(props.weapon2!.getPropSelfDamage());
			props.attacker.propDamage(props.weapon1.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon2!.getPropSelfDamage()
			)}% health, then ${-Math.round(
				100 * props.weapon1.getPropSelfDamage()
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (props.weapon2?.getPropSelfDamage() < 0) {
			damageBuffer = Math.max(
				-1,
				props.weapon1.getPropSelfDamage() +
					props.weapon2!.getPropSelfDamage()
			);
			props.attacker.propDamage(damageBuffer);
			outputText = `${-Math.round(
				100 * damageBuffer
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else {
			props.attacker.propDamage(props.weapon1.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon1.getPropSelfDamage()
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	} else {
		//@ts-expect-error
		if (props.weapon2?.getPropSelfDamage() > 0) {
			props.attacker.propDamage(props.weapon2!.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon2!.getPropSelfDamage()
			)}% health`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (props.weapon2?.getPropSelfDamage() < 0) {
			props.attacker.propDamage(props.weapon2!.getPropSelfDamage());
			outputText = `${-Math.round(
				100 * props.weapon2!.getPropSelfDamage()
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	}
	selfDamage: {
		if (
			props.weapon1.getEffectType()[1] == 1 ||
			props.weapon1.getEffectType()[1] == 2
		) {
			if (
				props.weapon2?.getEffectType()[1] == 1 ||
				props.weapon2?.getEffectType()[1] == 2
			) {
				if (props.weapon1.getSelfOverHeal()) {
					damageBuffer =
						props.attacker.flatDamage(
							props.weapon2.getFlatSelfDamage(),
							props.weapon2.getFlatSelfMagicDamage(),
							props.weapon2.getFlatSelfArmourPiercingDamage(),
							props.weapon2.getSelfOverHeal()
						) +
						props.attacker.flatDamage(
							props.weapon1.getFlatSelfDamage(),
							props.weapon1.getFlatSelfMagicDamage(),
							props.weapon1.getFlatSelfArmourPiercingDamage(),
							true
						);
				} else {
					damageBuffer =
						props.attacker.flatDamage(
							props.weapon1.getFlatSelfDamage(),
							props.weapon1.getFlatSelfMagicDamage(),
							props.weapon1.getFlatSelfArmourPiercingDamage()
						) +
						props.attacker.flatDamage(
							props.weapon2.getFlatSelfDamage(),
							props.weapon2.getFlatSelfMagicDamage(),
							props.weapon2.getFlatSelfArmourPiercingDamage(),
							props.weapon2.getSelfOverHeal()
						);
				}
			} else {
				damageBuffer = props.attacker.flatDamage(
					props.weapon1.getFlatSelfDamage(),
					props.weapon1.getFlatSelfMagicDamage(),
					props.weapon1.getFlatSelfArmourPiercingDamage(),
					props.weapon1.getSelfOverHeal()
				);
			}
		} else if (
			props.weapon2?.getEffectType()[1] == 1 ||
			props.weapon2?.getEffectType()[1] == 2
		) {
			damageBuffer = props.attacker.flatDamage(
				props.weapon2.getFlatSelfDamage(),
				props.weapon2.getFlatSelfMagicDamage(),
				props.weapon2.getFlatSelfArmourPiercingDamage(),
				props.weapon2.getSelfOverHeal()
			);
		} else {
			break selfDamage;
		}
		if (damageBuffer > 0) {
			outputText = `${damageBuffer} damage`;
		} else if (damageBuffer < 0) {
			outputText = `${-damageBuffer} healing`;
		} else {
			outputText = "No damage";
		}
		props.battleLog.push(outputText);
		attackerEffects.push(
			<div className="ion-text-center" key="flatSelfDamage">
				{outputText}
			</div>
		);
	}
	{
		const selfPoison =
				props.weapon1.getSelfPoison() +
				(props.weapon2?.getSelfPoison() ?? 0),
			selfBleed =
				props.weapon1.getSelfBleed() +
				(props.weapon2?.getSelfBleed() ?? 0);
		if (selfPoison > 0 || selfBleed > 0) {
			let dotEffects: string = "";
			if (selfPoison > 0) {
				if (props.attacker.modifyPoison(selfPoison)) {
					dotEffects = `+${selfPoison} poison, `;
				} else {
					dotEffects = "Poison resisted, ";
				}
			}
			if (selfBleed > 0) {
				if (props.attacker.modifyBleed(selfBleed)) {
					dotEffects += `+${selfBleed} bleed, `;
				} else {
					dotEffects += "Bleed resisted, ";
				}
			}
			outputText = dotEffects.slice(0, -2);
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="dotSelf">
					{outputText}
				</div>
			);
		}
	}
	if (
		props.weapon1.getEffectType()[1] < 2 &&
		props.weapon1.getEffectType()[0] < 2 &&
		(props.weapon2 == undefined ||
			(props.weapon2.getEffectType()[1] < 2 &&
				props.weapon2.getEffectType()[0] < 2))
	) {
		return <Fragment>{attackerEffects}</Fragment>;
	}
	const targetEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="target-effects">
			Target effects:
		</div>
	];
	let hits1: number, hits2: number | undefined;
	if (props.counter) {
		hits1 = props.weapon1.getCounterHits();
		hits2 = props.weapon2?.getCounterHits();
	} else {
		hits1 = props.weapon1.getHitCount();
		hits2 = props.weapon2?.getHitCount();
	}
	for (let i: number = 0; i < hits1; i++) {
		targetEffects.push(
			//@ts-expect-error
			<WeaponHit
				key={`${props.weapon1.getKey()}-${i}`}
				weaponry={props.weapon1}
				attacker={props.attacker}
				target={props.target}
				battleLog={props.battleLog}
			/>
		);
		//@ts-expect-error
		if (i < hits2) {
			targetEffects.push(
				//@ts-expect-error
				<WeaponHit
					key={`${props.weapon2?.getKey()}-${i}`}
					weaponry={props.weapon2}
					attacker={props.attacker}
					target={props.target}
					battleLog={props.battleLog}
				/>
			);
		}
	}
	return (
		<Fragment>
			{attackerEffects}
			{targetEffects}
		</Fragment>
	);
}

/**Weapon hit */
function WeaponHit(props: {
	weaponry: weapon;
	attacker: player;
	target: enemy;
	battleLog: string[];
}): React.JSX.Element;
function WeaponHit(props: {
	weaponry: weapon;
	attacker: enemy;
	target: player;
	battleLog: string[];
}): React.JSX.Element;
function WeaponHit(props: {
	/**The weapon */
	weaponry: weapon;
	/**The attacker */
	attacker: player | enemy;
	/**The target */
	target: player | enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	if (
		!props.weaponry.getNoEvade() &&
		randomFloat(0, 1) < props.target.getEvadeChance()
	) {
		props.battleLog.push("Evade!");
		return (
			<div className="ion-text-center" key="hit">
				Evade!
			</div>
		);
	}
	props.battleLog.push("Hit!");
	const hitEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="hit">
			Hit!
		</div>
	];
	let outputText: string;
	props.target.propDamage(props.weaponry.getPropDamage());
	if (props.weaponry.getPropDamage() > 0) {
		outputText = `${-Math.round(
			100 * props.weaponry.getPropDamage()
		)}% health`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	} else if (props.weaponry.getPropDamage() < 0) {
		outputText = `${-Math.round(
			100 * props.weaponry.getPropDamage()
		)} % of health recovered`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	}
	if (props.weaponry.getEffectType()[1] > 1) {
		let healthSteal: number = Math.max(0, props.target.getHealth());
		let {
			p: p,
			m: m,
			a: a
		} = props.attacker.applyDamageModifiers(
			props.weaponry.getFlatDamage(),
			props.weaponry.getFlatMagicDamage(),
			props.weaponry.getFlatArmourPiercingDamage()
		);
		let healthLoss: number = props.target.flatDamage(
			p,
			m,
			a,
			props.weaponry.getTargetOverHeal()
		);
		if (healthLoss > 0) {
			outputText = `${healthLoss} damage`;
			if (props.weaponry.getLifeLink()) {
				healthSteal = Math.min(healthSteal, healthLoss);
				if (healthSteal > 0) {
					outputText += ` (attacker is healed for ${healthSteal} by lifelink)`;
					props.attacker.modifyHealth(healthSteal);
				}
			}
		} else if (healthLoss < 0) {
			outputText = `${-healthLoss} healing`;
		} else {
			outputText = "No damage";
		}
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatDamage">
				{outputText}
			</div>
		);
	}
	if (props.weaponry.getPoison() > 0 || props.weaponry.getBleed() > 0) {
		outputText = "";
		if (props.weaponry.getPoison() > 0) {
			if (props.target.modifyPoison(props.weaponry.getPoison())) {
				outputText = `+${props.weaponry.getPoison()} poison, `;
			} else {
				outputText = "Poison resisted, ";
			}
		}
		if (props.weaponry.getBleed() > 0) {
			if (props.target.modifyBleed(props.weaponry.getBleed())) {
				outputText += `+${props.weaponry.getBleed()} bleed, `;
			} else {
				outputText += "Bleed resisted, ";
			}
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="dot">
				{outputText}
			</div>
		);
	}
	return <Fragment>{hitEffects}</Fragment>;
}

/**Spell declare
 * @param magic - The spell
 * @param caster - The caster
 */
function spellDeclare(magic: spell, caster: player | enemy): void {
	magic.startCooldown();
	caster.modifyHealth(magic.getHealthChange());
	caster.modifyMana(magic.getManaChange());
	caster.modifyProjectiles(magic.getProjectileChange());
}

/**Spell cast */
function SpellCast(props: {
	magic: spell;
	caster: player;
	target: enemy;
	timing?: 0 | 1 | 2 | 3 | 4;
	battleLog: string[];
}): React.JSX.Element;
function SpellCast(props: {
	magic: spell;
	caster?: enemy;
	target: player;
	timing?: 0 | 1 | 2 | 3 | 4;
	battleLog: string[];
}): React.JSX.Element;
function SpellCast(props: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: player | enemy;
	/**The target */
	target: player | enemy;
	/**Spell timing, 0 is sorcery speed, 3 is counter attack, anything else is a response */
	timing?: 0 | 1 | 2 | 3 | 4;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	const attackerEffects: React.JSX.Element[] = [];
	let outputText: string;
	if (props.caster != undefined) {
		if (
			props.magic.getEffectType()[1] == 1 ||
			props.magic.getEffectType()[1] == 2 ||
			props.magic.getEffectType()[0] == 1 ||
			props.magic.getEffectType()[0] == 2
		) {
			outputText = "Caster effects:";
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="caster-effects">
					{outputText}
				</div>
			);
		}
		props.caster.propDamage(props.magic.getPropSelfDamage());
		if (props.magic.getPropSelfDamage() > 0) {
			outputText = `${-Math.round(
				100 * props.magic.getPropSelfDamage()
			)}% health`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else if (props.magic.getPropSelfDamage() < 0) {
			outputText = `${-Math.round(
				100 * props.magic.getPropSelfDamage()
			)}% of health recovered`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
		if (
			props.magic.getEffectType()[1] == 1 ||
			props.magic.getEffectType()[1] == 2
		) {
			let healthLoss: number = props.caster.flatDamage(
				props.magic.getFlatSelfDamage(),
				props.magic.getFlatSelfMagicDamage(),
				props.magic.getFlatSelfArmourPiercingDamage(),
				props.magic.getSelfOverHeal()
			);
			if (healthLoss > 0) {
				outputText = `${healthLoss} damage`;
			} else if (healthLoss < 0) {
				outputText = `${-healthLoss} healing`;
			} else {
				outputText = "No damage";
			}
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="flatSelfDamage">
					{outputText}
				</div>
			);
		}
		if (
			props.magic.getEffectType()[0] == 1 ||
			props.magic.getEffectType()[0] == 2
		) {
			if (
				props.magic.getSelfPoison() != 0 ||
				props.magic.getSelfBleed() != 0 ||
				props.magic.getTempRegenSelf() != 0
			) {
				outputText = "";
				if (props.magic.getSelfPoison() != 0) {
					if (
						props.caster.modifyPoison(props.magic.getSelfPoison())
					) {
						outputText +=
							props.magic.getSelfPoison() == -255
								? "Poison cured, "
								: `${
										props.magic.getSelfPoison() > 0
											? "+"
											: ""
								  }${props.magic.getSelfPoison()} poison, `;
					} else {
						outputText += "Poison resisted, ";
					}
				}
				if (props.magic.getSelfBleed() != 0) {
					if (props.caster.modifyBleed(props.magic.getSelfBleed())) {
						outputText +=
							props.magic.getSelfBleed() == -255
								? "Bleed cured, "
								: `${
										props.magic.getSelfBleed() > 0
											? "+"
											: ""
								  }${props.magic.getSelfBleed()} bleed, `;
					} else {
						outputText += "Bleed resisted, ";
					}
				}
				if (props.magic.getTempRegenSelf() != 0) {
					props.caster.modifyTempRegen(
						props.magic.getTempRegenSelf()
					);
					outputText += `${
						props.magic.getTempRegenSelf() > 0 ? "+" : ""
					}${props.magic.getTempRegenSelf()} regeneration, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div className="ion-text-center" key="dotSelf">
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getPoisonResistModifier() != 0 ||
				props.magic.getBleedResistModifier() != 0
			) {
				outputText = "";
				if (props.magic.getPoisonResistModifier() != 0) {
					console.log(props.caster);
					props.caster.modifyPoisonResist(
						props.magic.getPoisonResistModifier()
					);
					console.log(props.caster);
					outputText += `${
						props.magic.getPoisonResistModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getPoisonResistModifier()
					)}% poison resist, `;
				}
				if (props.magic.getBleedResistModifier() != 0) {
					props.caster.modifyBleedResist(
						props.magic.getBleedResistModifier()
					);
					outputText += `${
						props.magic.getBleedResistModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getBleedResistModifier()
					)}% bleed resist, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div className="ion-text-center" key="selfResistModifiers">
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getMaxHealthModifier() != 0 ||
				props.magic.getTurnRegenModifier() != 0 ||
				(props.caster instanceof player &&
					props.magic.getBattleRegenModifier() != 0)
			) {
				outputText = "";
				if (props.magic.getMaxHealthModifier() != 0) {
					props.caster.modifyMaxHealth(
						props.magic.getMaxHealthModifier()
					);
					outputText += `${
						props.magic.getMaxHealthModifier() > 0 ? "+" : ""
					}${props.magic.getMaxHealthModifier()} max health, `;
				}
				if (props.magic.getTurnRegenModifier() != 0) {
					props.caster.modifyTurnRegen(
						props.magic.getTurnRegenModifier()
					);
					outputText += `${
						props.magic.getTurnRegenModifier() > 0 ? "+" : ""
					}${props.magic.getTurnRegenModifier()} health per turn, `;
				}
				if (
					props.caster instanceof player &&
					props.magic.getBattleRegenModifier() != 0
				) {
					props.caster.modifyBattleRegen(
						props.magic.getBattleRegenModifier()
					);
					outputText += `${
						props.magic.getBattleRegenModifier() > 0 ? "+" : ""
					}${props.magic.getBattleRegenModifier()} health at end of battle, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div className="ion-text-center" key="selfHealthModifiers">
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getMaxManaModifier() != 0 ||
				props.magic.getTurnManaRegenModifier() != 0 ||
				(props.caster instanceof player &&
					props.magic.getBattleManaRegenModifier() != 0)
			) {
				outputText = "";
				if (props.magic.getMaxManaModifier() != 0) {
					props.caster.modifyMaxMana(
						props.magic.getMaxManaModifier()
					);
					outputText += `${
						props.magic.getMaxManaModifier() > 0 ? "+" : ""
					}${props.magic.getMaxManaModifier()} maximum mana, `;
				}
				if (props.magic.getTurnManaRegenModifier() != 0) {
					props.caster.modifyTurnManaRegen(
						props.magic.getTurnManaRegenModifier()
					);
					outputText += `${
						props.magic.getTurnManaRegenModifier() > 0 ? "+" : ""
					}${props.magic.getTurnManaRegenModifier()} mana per turn, `;
				}
				if (
					props.caster instanceof player &&
					props.magic.getBattleManaRegenModifier() != 0
				) {
					props.caster.modifyBattleManaRegen(
						props.magic.getBattleManaRegenModifier()
					);
					outputText += `${
						props.magic.getBattleManaRegenModifier() > 0 ? "+" : ""
					}${props.magic.getBattleManaRegenModifier()} mana at end of battle, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div className="ion-text-center" key="selfManaModifiers">
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getFlatArmourModifier() != 0 ||
				props.magic.getFlatMagicArmourModifier() != 0
			) {
				outputText = "";
				if (props.magic.getFlatArmourModifier() != 0) {
					props.caster.modifyFlatArmour(
						props.magic.getFlatArmourModifier()
					);
					outputText += `${
						props.magic.getFlatArmourModifier() > 0 ? "+" : ""
					}${props.magic.getFlatArmourModifier()} physical armour, `;
				}
				if (props.magic.getFlatMagicArmourModifier() != 0) {
					props.caster.modifyFlatMagicArmour(
						props.magic.getFlatMagicArmourModifier()
					);
					outputText += `${
						props.magic.getFlatMagicArmourModifier() > 0 ? "+" : ""
					}${props.magic.getFlatMagicArmourModifier()} magic armour, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div
						className="ion-text-center"
						key="flatSelfArmourModifiers"
					>
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getPropArmourModifier() != 0 ||
				props.magic.getPropMagicArmourModifier() != 0
			) {
				outputText = "";
				if (props.magic.getPropArmourModifier() != 0) {
					props.caster.modifyPropArmour(
						props.magic.getPropArmourModifier()
					);
					outputText += `${
						props.magic.getPropArmourModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getPropArmourModifier()
					)}% physical damage received, `;
				}
				if (props.magic.getPropMagicArmourModifier() != 0) {
					props.caster.modifyPropMagicArmour(
						props.magic.getPropMagicArmourModifier()
					);
					outputText += `${
						props.magic.getPropMagicArmourModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getPropMagicArmourModifier()
					)}% magic damage received, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div
						className="ion-text-center"
						key="propSelfArmourModifiers"
					>
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getFlatDamageModifier() != 0 ||
				props.magic.getFlatMagicDamageModifier() != 0 ||
				props.magic.getFlatArmourPiercingDamageModifier() != 0
			) {
				outputText = "";
				if (props.magic.getFlatDamageModifier() != 0) {
					props.caster.modifyFlatDamageModifier(
						props.magic.getFlatDamageModifier()
					);
					outputText += `${
						props.magic.getFlatDamageModifier() > 0 ? "+" : ""
					}${props.magic.getFlatDamageModifier()} physical damage dealt, `;
				}
				if (props.magic.getFlatMagicDamageModifier() != 0) {
					props.caster.modifyFlatMagicDamageModifier(
						props.magic.getFlatMagicDamageModifier()
					);
					outputText += `${
						props.magic.getFlatMagicDamageModifier() > 0 ? "+" : ""
					}${props.magic.getFlatMagicDamageModifier()} magic damage dealt, `;
				}
				if (props.magic.getFlatArmourPiercingDamageModifier() != 0) {
					props.caster.modifyFlatArmourPiercingDamageModifier(
						props.magic.getFlatArmourPiercingDamageModifier()
					);
					outputText += `${
						props.magic.getFlatArmourPiercingDamageModifier() > 0
							? "+"
							: ""
					}${props.magic.getFlatArmourPiercingDamageModifier()} armour piercing damage dealt, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div
						className="ion-text-center"
						key="flatSelfDamageModifiers"
					>
						{outputText}
					</div>
				);
			}
			if (
				props.magic.getPropDamageModifier() != 0 ||
				props.magic.getPropMagicDamageModifier() != 0 ||
				props.magic.getPropArmourPiercingDamageModifier() != 0
			) {
				outputText = "";
				if (props.magic.getPropDamageModifier() != 0) {
					props.caster.modifyPropDamageModifier(
						props.magic.getPropDamageModifier()
					);
					outputText += `${
						props.magic.getPropDamageModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getPropDamageModifier()
					)}% physical damage dealt, `;
				}
				if (props.magic.getPropMagicDamageModifier() != 0) {
					props.caster.modifyPropMagicDamageModifier(
						props.magic.getPropMagicDamageModifier()
					);
					outputText += `${
						props.magic.getPropMagicDamageModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * props.magic.getPropMagicDamageModifier()
					)}% magic damage dealt, `;
				}
				if (props.magic.getPropArmourPiercingDamageModifier() != 0) {
					props.caster.modifyPropArmourPiercingDamageModifier(
						props.magic.getPropArmourPiercingDamageModifier()
					);
					outputText += `${
						props.magic.getPropArmourPiercingDamageModifier() > 0
							? "+"
							: ""
					}${Math.round(
						100 * props.magic.getPropArmourPiercingDamageModifier()
					)}% armour piercing damage dealt, `;
				}
				outputText = outputText.slice(0, -2);
				props.battleLog.push(outputText);
				attackerEffects.push(
					<div
						className="ion-text-center"
						key="propSelfDamageModifiers"
					>
						{outputText}
					</div>
				);
			}
		}
		if (props.magic.getEvadeChanceModifier() != 0) {
			props.caster.modifyEvadeChance(
				props.magic.getEvadeChanceModifier()
			);
			outputText = `${
				props.magic.getEvadeChanceModifier() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getEvadeChanceModifier()
			)}% evade chance`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="selfEvadeChanceModifier">
					{outputText}
				</div>
			);
		}
		if (props.magic.getCounterAttackChanceModifier() != 0) {
			props.caster.modifyCounterAttackChance(
				props.magic.getCounterAttackChanceModifier()
			);
			outputText = `${
				props.magic.getCounterAttackChanceModifier() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getCounterAttackChanceModifier()
			)}% counter attack chance`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div
					className="ion-text-center"
					key="selfCounterAttackChanceModifier"
				>
					{outputText}
				</div>
			);
		}
		if (props.magic.getBonusActionsModifier() != 0) {
			props.caster.modifyBonusActions(
				props.magic.getBonusActionsModifier()
			);
			outputText = `${
				props.magic.getBonusActionsModifier() > 0 ? "+" : ""
			}${props.magic.getBonusActionsModifier()} bonus actions`;
			props.battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="selfBonusActionModifier">
					{outputText}
				</div>
			);
		}
	}
	if (
		props.magic.getEffectType()[0] < 2 ||
		props.magic.getEffectType()[1] < 2
	) {
		return <Fragment>{attackerEffects}</Fragment>;
	}
	const targetEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="target-effects">
			Target effects:
		</div>
	];
	let hits: number;
	switch (props.timing) {
		case undefined:
		case 0:
			hits = props.magic.getHitCount();
			break;
		case 3:
			hits = props.magic.getCounterHits();
			break;
		default:
			hits = props.magic.getResponseHits();
	}
	for (let i: number = 0; i < hits; i++) {
		targetEffects.push(
			//@ts-expect-error
			<SpellHit
				key={`${props.magic.getKey()}-${i}`}
				magic={props.magic}
				caster={props.caster}
				target={props.target}
				battleLog={props.battleLog}
			/>
		);
	}
	return (
		<Fragment>
			{attackerEffects}
			{targetEffects}
		</Fragment>
	);
}

/**Spell hit */
function SpellHit(props: {
	magic: spell;
	caster: player;
	target: enemy;
	battleLog: string[];
}): React.JSX.Element;
function SpellHit(props: {
	magic: spell;
	caster?: enemy;
	target: player;
	battleLog: string[];
}): React.JSX.Element;
function SpellHit(props: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: player | enemy;
	/**The target */
	target: player | enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	let outputText: string = "";
	const hitEffects: React.JSX.Element[] = [];
	if (
		!props.magic.getNoEvade() &&
		randomFloat(0, 1) < props.target.getEvadeChance()
	) {
		outputText = "Evade!";
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="hit">
				{outputText}
			</div>
		);
	}
	outputText = "Hit!";
	props.battleLog.push(outputText);
	hitEffects.push(
		<div className="ion-text-center" key="hit">
			{outputText}
		</div>
	);
	props.target.propDamage(props.magic.getPropDamage());
	if (props.magic.getPropDamage() > 0) {
		outputText = `${-Math.round(
			100 * props.magic.getPropDamage()
		)}% health`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	} else if (props.magic.getPropDamage() < 0) {
		outputText = `${-Math.round(
			100 * props.magic.getPropDamage()
		)}% of health recovered`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	}
	if (props.magic.getEffectType()[1] > 1) {
		let healthSteal: number = Math.max(0, props.target.getHealth());
		let p: number = props.magic.getFlatDamage(),
			m: number = props.magic.getFlatMagicDamage(),
			a: number = props.magic.getFlatArmourPiercingDamage();
		if (props.caster != undefined) {
			({p: p, m: m, a: a} = props.caster.applyDamageModifiers(p, m, m));
		}
		let healthLoss: number = props.target.flatDamage(
			p,
			m,
			a,
			props.magic.getTargetOverHeal()
		);
		if (healthLoss > 0) {
			outputText = `${healthLoss} damage`;
			if (props.caster != undefined && props.magic.getLifeLink()) {
				healthSteal = Math.min(healthSteal, healthLoss);
				if (healthSteal > 0) {
					outputText += ` (caster is healed for ${healthSteal} by lifelink)`;
					props.caster.modifyHealth(healthSteal);
				}
			}
		} else if (healthLoss < 0) {
			outputText = `${-healthLoss} healing`;
		} else {
			outputText = "No damage";
		}
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatDamage">
				{outputText}
			</div>
		);
	}
	if (props.magic.getEffectType()[0] < 2) {
		return <Fragment>{hitEffects}</Fragment>;
	}
	if (
		props.magic.getPoison() != 0 ||
		props.magic.getBleed() != 0 ||
		props.magic.getTempRegen() != 0
	) {
		outputText = "";
		if (props.magic.getPoison() != 0) {
			if (props.target.modifyPoison(props.magic.getPoison())) {
				outputText += `${
					props.magic.getPoison() > 0 ? "+" : ""
				}${props.magic.getPoison()} poison, `;
			} else {
				outputText += "Poison resisted, ";
			}
		}
		if (props.magic.getBleed() != 0) {
			if (props.target.modifyBleed(props.magic.getBleed())) {
				outputText += `${
					props.magic.getBleed() > 0 ? "+" : ""
				}${props.magic.getBleed()} bleed, `;
			} else {
				outputText += "Bleed resisted, ";
			}
		}
		if (props.magic.getTempRegen() != 0) {
			props.target.modifyTempRegen(props.magic.getTempRegen());
			outputText += `${
				props.magic.getTempRegen() > 0 ? "+" : ""
			}${props.magic.getTempRegen()} regeneration, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="dot">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getMaxHealthModifierEnemy() != 0 ||
		props.magic.getTurnRegenModifierEnemy() ||
		(props.target instanceof player &&
			props.magic.getBattleRegenModifierEnemy() != 0)
	) {
		outputText = "";
		if (props.magic.getMaxHealthModifierEnemy() != 0) {
			props.target.modifyMaxHealth(
				props.magic.getMaxHealthModifierEnemy()
			);
			outputText += `${
				props.magic.getMaxHealthModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getMaxHealthModifierEnemy()} maximum health, `;
		}
		if (props.magic.getTurnRegenModifierEnemy() != 0) {
			props.target.modifyTurnRegen(
				props.magic.getTurnRegenModifierEnemy()
			);
			outputText += `${
				props.magic.getTurnRegenModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getTurnRegenModifierEnemy()} health per turn, `;
		}
		if (
			props.target instanceof player &&
			props.magic.getBattleRegenModifierEnemy() != 0
		) {
			props.target.modifyBattleRegen(
				props.magic.getBattleRegenModifierEnemy()
			);
			outputText += `${
				props.magic.getBattleRegenModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getBattleRegenModifierEnemy()} health at end of battle, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="healthModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getMaxManaModifierEnemy() != 0 ||
		props.magic.getManaChangeEnemy() != 0 ||
		props.magic.getTurnManaRegenModifierEnemy() != 0 ||
		(props.target instanceof player &&
			props.magic.getBattleManaRegenModifierEnemy() != 0)
	) {
		outputText = "";
		if (props.magic.getMaxManaModifierEnemy() != 0) {
			props.target.modifyMaxMana(props.magic.getMaxManaModifierEnemy());
			outputText += `${
				props.magic.getMaxManaModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getMaxManaModifierEnemy()} maximum mana, `;
		}
		if (props.magic.getManaChangeEnemy() != 0) {
			props.target.modifyMana(props.magic.getManaChangeEnemy());
			outputText += `${
				props.magic.getManaChangeEnemy() > 0 ? "+" : ""
			}${props.magic.getManaChangeEnemy()} mana, `;
		}
		if (props.magic.getTurnManaRegenModifierEnemy() != 0) {
			props.target.modifyTurnManaRegen(
				props.magic.getTurnManaRegenModifierEnemy()
			);
			outputText += `${
				props.magic.getTurnManaRegenModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getTurnManaRegenModifierEnemy()} mana per turn, `;
		}
		if (
			props.target instanceof player &&
			props.magic.getBattleManaRegenModifierEnemy() != 0
		) {
			props.target.modifyBattleManaRegen(
				props.magic.getBattleManaRegenModifierEnemy()
			);
			outputText += `${
				props.magic.getBattleManaRegenModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getBattleManaRegenModifierEnemy()} mana at end of battle, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="manaModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getPoisonResistModifierEnemy() != 0 ||
		props.magic.getBleedResistModifierEnemy() != 0
	) {
		outputText = "";
		if (props.magic.getPoisonResistModifierEnemy() != 0) {
			props.target.modifyPoisonResist(
				props.magic.getPoisonResistModifierEnemy()
			);
			outputText += `${
				props.magic.getPoisonResistModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getPoisonResistModifierEnemy()
			)} poison resist, `;
		}
		if (props.magic.getBleedResistModifierEnemy() != 0) {
			props.target.modifyBleedResist(
				props.magic.getBleedResistModifierEnemy()
			);
			outputText += `${
				props.magic.getBleedResistModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getBleedResistModifierEnemy()
			)} bleed resist, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="resistModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getFlatArmourModifierEnemy() != 0 ||
		props.magic.getFlatMagicArmourModifierEnemy() != 0
	) {
		outputText = "";
		if (props.magic.getFlatArmourModifierEnemy() != 0) {
			props.target.modifyFlatArmour(
				props.magic.getFlatArmourModifierEnemy()
			);
			outputText += `${
				props.magic.getFlatArmourModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getFlatArmourModifierEnemy()} physical armour, `;
		}
		if (props.magic.getFlatMagicArmourModifierEnemy() != 0) {
			props.target.modifyFlatMagicArmour(
				props.magic.getFlatMagicArmourModifierEnemy()
			);
			outputText += `${
				props.magic.getFlatMagicArmourModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getFlatMagicArmourModifierEnemy()} magic armour, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatArmourModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getPropArmourModifierEnemy() != 0 ||
		props.magic.getPropMagicArmourModifierEnemy() != 0
	) {
		outputText = "";
		if (props.magic.getPropArmourModifierEnemy() != 0) {
			props.target.modifyPropArmour(
				props.magic.getPropArmourModifierEnemy()
			);
			outputText += `${
				props.magic.getPropArmourModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getPropArmourModifierEnemy()
			)}% physical damage received, `;
		}
		if (props.magic.getPropMagicArmourModifierEnemy() != 0) {
			props.target.modifyPropMagicArmour(
				props.magic.getPropMagicArmourModifierEnemy()
			);
			outputText += `${
				props.magic.getPropMagicArmourModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getPropMagicArmourModifierEnemy()
			)}% magic damage received, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propArmourModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getFlatDamageModifierEnemy() != 0 ||
		props.magic.getFlatMagicDamageModifierEnemy() != 0 ||
		props.magic.getFlatArmourPiercingDamageModifierEnemy() != 0
	) {
		outputText = "";
		if (props.magic.getFlatDamageModifierEnemy() != 0) {
			props.target.modifyFlatDamageModifier(
				props.magic.getFlatDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getFlatDamageModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getFlatDamageModifierEnemy()} physical damage dealt, `;
		}
		if (props.magic.getFlatMagicDamageModifierEnemy() != 0) {
			props.target.modifyFlatMagicDamageModifier(
				props.magic.getFlatMagicDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getFlatMagicDamageModifierEnemy() > 0 ? "+" : ""
			}${props.magic.getFlatMagicDamageModifierEnemy()} magic damage dealt, `;
		}
		if (props.magic.getFlatArmourPiercingDamageModifierEnemy() != 0) {
			props.target.modifyFlatArmourPiercingDamageModifier(
				props.magic.getFlatArmourPiercingDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getFlatArmourPiercingDamageModifierEnemy() > 0
					? "+"
					: ""
			}${props.magic.getFlatArmourPiercingDamageModifierEnemy()} armour piercing damage dealt, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatDamageModifiers">
				{outputText}
			</div>
		);
	}
	if (
		props.magic.getPropDamageModifierEnemy() != 0 ||
		props.magic.getPropMagicDamageModifierEnemy() != 0 ||
		props.magic.getPropArmourPiercingDamageModifierEnemy() != 0
	) {
		outputText = "";
		if (props.magic.getPropDamageModifierEnemy() != 0) {
			props.target.modifyPropDamageModifier(
				props.magic.getPropDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getPropDamageModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getPropDamageModifierEnemy()
			)}% physical damage dealt, `;
		}
		if (props.magic.getPropMagicDamageModifierEnemy() != 0) {
			props.target.modifyPropMagicDamageModifier(
				props.magic.getPropMagicDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getPropMagicDamageModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * props.magic.getPropMagicDamageModifierEnemy()
			)}% magic damage dealt, `;
		}
		if (props.magic.getPropArmourPiercingDamageModifierEnemy() != 0) {
			props.target.modifyPropArmourPiercingDamageModifier(
				props.magic.getPropArmourPiercingDamageModifierEnemy()
			);
			outputText += `${
				props.magic.getPropArmourPiercingDamageModifierEnemy() > 0
					? "+"
					: ""
			}${Math.round(
				100 * props.magic.getPropArmourPiercingDamageModifierEnemy()
			)}% armour piercing damage dealt, `;
		}
		outputText = outputText.slice(0, -2);
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="propDamageModifiers">
				{outputText}
			</div>
		);
	}

	if (props.magic.getEvadeChanceModifierEnemy() != 0) {
		props.target.modifyEvadeChance(
			props.magic.getEvadeChanceModifierEnemy()
		);
		outputText = `${
			props.magic.getEvadeChanceModifierEnemy() > 0 ? "+" : ""
		}${Math.round(
			100 * props.magic.getEvadeChanceModifierEnemy()
		)}% evade chance`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="evadeChanceModifier">
				{outputText}
			</div>
		);
	}
	if (props.magic.getCounterAttackChanceModifierEnemy() != 0) {
		props.target.modifyCounterAttackChance(
			props.magic.getCounterAttackChanceModifierEnemy()
		);
		outputText = `${
			props.magic.getCounterAttackChanceModifierEnemy() > 0 ? "+" : ""
		}${Math.round(
			100 * props.magic.getCounterAttackChanceModifierEnemy()
		)}% counter attack chance`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="counterAttackChanceModifier">
				{outputText}
			</div>
		);
	}
	if (props.magic.getBonusActionsModifierEnemy() != 0) {
		props.target.modifyBonusActions(
			props.magic.getBonusActionsModifierEnemy()
		);
		outputText = `${
			props.magic.getBonusActionsModifierEnemy() > 0 ? "+" : ""
		}${props.magic.getBonusActionsModifierEnemy()} bonus actions`;
		props.battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="bonusActionModifier">
				{outputText}
			</div>
		);
	}
	return <Fragment>{hitEffects}</Fragment>;
}

/**Handles a battle
 * @param playerCharacter - The player
 * @param opponent - The enemy
 * @param endBattle - A function to end the battle
 * @param battleLog - The battle log
 * @yields Anything that should be displayed
 * @returns Display for end of battle
 */
function* battleHandler(
	playerCharacter: player,
	opponent: enemy,
	endBattle: () => void,
	battleLog: string[]
): Generator<
	React.JSX.Element | null,
	React.JSX.Element | null,
	void | (() => void)
> {
	let playerTurn: boolean =
		playerCharacter.rollInitiative() > opponent.rollInitiative();
	let firstTurn: boolean = true;
	const advanceCombat: () => void =
		(yield <Fragment></Fragment>) ??
		(() => {
			console.log(
				"No function to advance combat provided, ending battle"
			);
			endBattle();
		});
	//Display enemy introduction and who goes first
	battleLog.push(opponent.getIntroduction());
	battleLog.push(
		`${playerTurn ? "You go first" : `${opponent.getName()} goes first`}`
	);
	yield (
		<IonContent>
			<div className="ion-text-center">{battleLog.at(-2)}</div>
			<div className="ion-text-center">{battleLog.at(-1)}</div>
			<ContinueButton />
		</IonContent>
	);
	//Check if enemy dies immediately
	if (deathCheck()) {
		return endOfCombat();
	}
	//Reset bonus actions
	playerCharacter.resetBonusActions();
	opponent.resetBonusActions();
	//Turn cycle loop
	while (true) {
		if (playerTurn) {
			playerCharacter.turnStart();
			if (deathCheck()) {
				return endOfCombat();
			}
			var playerSelection: actionChoice = {actionType: 0} as actionChoice;
			yield (
				<ChoosePlayerAction
					playerCharacter={playerCharacter}
					enemyName={opponent.getName()}
					timing={0}
					submitChoice={(choice) => {
						playerSelection = choice;
						advanceCombat();
					}}
				/>
			);
			switch (playerSelection.actionType) {
				case 0:
					battleLog.push("You do nothing");
					yield (
						<IonContent>
							<div>You do nothing</div>
							<ContinueButton />
						</IonContent>
					);
					break;
				case 1:
					var health: number = playerCharacter.getHealth();
					battleLog.push(
						`You attack with ${playerCharacter
							.getWeapon(playerSelection.slot1)
							.getName()}`
					);
					weaponDeclare(
						playerCharacter,
						playerCharacter.getWeapon(playerSelection.slot1)
					);
					yield (
						<IonContent>
							<div>{battleLog.at(-1)}</div>
							<ContinueButton />
						</IonContent>
					);
					var enemySelection: actionChoice = opponent.chooseAction(
						1,
						firstTurn,
						playerCharacter
							.getWeapon(playerSelection.slot1)
							.getName()
					);
				case 3:
				case 2:
			}
		} else {
		}
		break;
	}
	return <Fragment></Fragment>;
	/**Checks if either fighter is dead */
	function deathCheck(): boolean {
		return playerCharacter.getHealth() <= 0 || opponent.getHealth() <= 0;
	}
	/**Handles end of battle, UNFINISHED */
	function endOfCombat(): React.JSX.Element {
		if (opponent.getHealth() <= 0) {
			if (opponent.getDeathSpell()?.getReal()) {
				return (
					<IonContent>
						<div>
							{opponent.getName()} is dead. On death, it casts{" "}
							{opponent.getDeathSpell()!.getName()}
						</div>
						<SpellCast
							magic={opponent.getDeathSpell()!}
							target={playerCharacter}
							battleLog={battleLog}
						/>
						{playerCharacter.getHealth() <= 0 ? (
							<div>You are dead</div>
						) : null}
						<EndBattleButton />
					</IonContent>
				);
			}
			if (playerCharacter.getHealth() <= 0) {
				return (
					<IonContent>
						<div>You are dead</div>
						<EndBattleButton />
					</IonContent>
				);
			}
			return (
				<IonContent>
					<div>{opponent.getName()} is dead</div>
					<EndBattleButton />
				</IonContent>
			);
		}
		return (
			<IonContent>
				<div>You are dead</div>
				<EndBattleButton />
			</IonContent>
		);
	}
	function ContinueButton(): React.JSX.Element {
		return (
			<IonButton mode="ios" onClick={advanceCombat}>
				Continue
			</IonButton>
		);
	}
	function EndBattleButton(): React.JSX.Element {
		return (
			<IonButton mode="ios" onClick={endBattle}>
				End battle
			</IonButton>
		);
	}
}

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
import {Fragment, useState} from "react";
import {actionChoice} from "../functionality/data";
import {close} from "ionicons/icons";
import {
	SpellCast,
	WeaponAttack,
	spellDeclare,
	weaponDeclare
} from "../components/attacks";
import {useGenerator} from "../hooks/hooks";
import {weapon} from "../functionality/weapons";
import {spell} from "../functionality/spells";

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
export function BattlePage({
	playerCharacter,
	opponent,
	endBattle
}: {
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
	/**Holds the battle display buffer */
	const displayBuffer: React.JSX.Element | null = useGenerator(
		battleHandler(playerCharacter, opponent, endBattle, battleLog)
	);
	/**Holds the battle handler iterator */
	//const [battleHandlerIterator] = useState<
	//	Generator<
	//		React.JSX.Element | null,
	//		React.JSX.Element | null,
	//		() => void
	//	>
	//>(
	//	battleHandler(
	//		playerCharacter,
	//		opponent,
	//		endBattle,
	//		battleLog
	//	)
	//);
	///**Holds the JSX returned from the battle handler */
	//const [displayBuffer, setDisplayBuffer] =
	//	useState<React.JSX.Element | null>(null);
	//useEffect(() => {
	//	battleHandlerIterator.next();
	//	setDisplayBuffer(
	//		battleHandlerIterator.next(() => {
	//			let newDisplay: React.JSX.Element | null =
	//				battleHandlerIterator.next().value;
	//			while (newDisplay == null) {
	//				newDisplay = battleHandlerIterator.next().value;
	//			}
	//			setDisplayBuffer(newDisplay);
	//		}).value
	//	);
	//	return () => {
	//		battleHandlerIterator.return(null);
	//	};
	//}, [battleHandlerIterator, setDisplayBuffer]);
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonButton mode="ios" onClick={() => endBattle()}>
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
								playerCharacter={playerCharacter}
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
/**Handles the actual battle
 * @deprecated
 */
export function BattleHandler({
	playerCharacter,
	opponent,
	endBattle,
	battleLog
}: {
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
		playerCharacter.rollInitiative() > opponent.rollInitiative()
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
		if (opponent.getHealth() <= 0) {
			if (opponent.getDeathSpell()?.getReal()) {
				setPhaseCounter(6.5);
				return true;
			}
			if (playerCharacter.getHealth() <= 0) {
				setPhaseCounter(7);
				return true;
			}
			setPhaseCounter(6);
			return true;
		}
		if (playerCharacter.getHealth() <= 0) {
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
			playerCharacter.resetBonusActions();
			opponent.resetBonusActions();
			battleLog.push(opponent.getIntroduction());
			battleLog.push(
				playerTurn ? "You go first" : `${opponent} goes first`
			);
			return (
				<IonContent>
					<div className="ion-text-center">
						{opponent.getIntroduction()}
					</div>
					<div className="ion-text-center">
						{playerTurn ? "You go first" : `${opponent} goes first`}
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
				playerCharacter.turnStart();
				if (deathCheck()) {
					break phaseSwitch;
				}
				return (
					<ChoosePlayerAction
						playerCharacter={playerCharacter}
						enemyName={opponent.getName()}
						timing={0}
						submitChoice={(choice: actionChoice) => {
							setPlayerSelection(choice);
							setPhaseCounter(0.5);
						}}
					/>
				);
			} else {
				opponent.turnStart();
				if (deathCheck()) {
					break phaseSwitch;
				}
				setEnemySelection(opponent.chooseAction(0, firstTurn));
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
						battleLog.push(
							`You attack with ${playerCharacter.getWeapon(
								playerSelection.slot1
							)}`
						);
						weaponDeclare(
							playerCharacter,
							playerCharacter.getWeapon(playerSelection.slot1)
						);
						break;
					case 3:
						battleLog.push(
							`You attack with ${playerCharacter.getWeapon(
								playerSelection.slot1
							)} and ${playerCharacter.getWeapon(
								playerSelection.slot2
							)}`
						);
						weaponDeclare(
							playerCharacter,
							playerCharacter.getWeapon(playerSelection.slot1),
							playerCharacter.getWeapon(playerSelection.slot2)
						);
						break;
					case 2:
						battleLog.push(
							`You cast ${playerCharacter.getSpell(
								playerSelection.slot1
							)}`
						);
						spellDeclare(
							playerCharacter.getSpell(playerSelection.slot1),
							playerCharacter
						);
				}
				return (
					<IonContent>
						<div className="ion-text-center">
							{battleLog.at(-1)}
						</div>
						<IonButton
							mode="ios"
							onClick={() => {
								setPhaseCounter(1);
								setPostDeclarationHealth(
									playerCharacter.getHealth()
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
						battleLog.push(`${opponent} does nothing`);
						return (
							<IonContent>
								<div className="ion-text-center">
									{opponent.getName()} does nothing
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
						battleLog.push(
							`${opponent} attacks with ${opponent.getWeapon(
								enemySelection.slot1
							)}`
						);
						weaponDeclare(
							opponent,
							opponent.getWeapon(enemySelection.slot1)
						);
						break;
					case 3:
						battleLog.push(
							`${opponent} attacks with ${opponent.getWeapon(
								enemySelection.slot1
							)} and ${opponent.getWeapon(enemySelection.slot2)}`
						);
						weaponDeclare(
							opponent,
							opponent.getWeapon(enemySelection.slot1),
							opponent.getWeapon(enemySelection.slot2)
						);
						break;
					case 2:
						battleLog.push(
							`${opponent} casts ${opponent.getSpell(
								enemySelection.slot1
							)}`
						);
						spellDeclare(
							opponent.getSpell(enemySelection.slot1),
							opponent
						);
				}
				return (
					<IonContent>
						<div className="ion-text-center">
							{battleLog.at(-1)}
						</div>
						<IonButton
							mode="ios"
							onClick={() => {
								setPhaseCounter(1);
								setPostDeclarationHealth(opponent.getHealth());
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
							opponent.chooseAction(
								1,
								firstTurn,
								playerCharacter
									.getWeapon(playerSelection.slot1)
									.getName()
							)
						);
						break;
					case 3:
						setEnemySelection(
							opponent.chooseAction(
								4,
								firstTurn,
								playerCharacter
									.getWeapon(playerSelection.slot1)
									.getName(),
								playerCharacter
									.getWeapon(playerSelection.slot2)
									.getName()
							)
						);
						break;
					case 2:
						setEnemySelection(
							opponent.chooseAction(
								2,
								firstTurn,
								playerCharacter
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
						if (!playerCharacter.checkPlayerActions(1)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={1}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={opponent
									.getWeapon(enemySelection.slot1)
									.getName()}
							/>
						);
					case 3:
						if (!playerCharacter.checkPlayerActions(4)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={3}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={opponent
									.getWeapon(enemySelection.slot1)
									.getName()}
								itemName2={opponent
									.getWeapon(enemySelection.slot2)
									.getName()}
							/>
						);
					case 2:
						if (!playerCharacter.checkPlayerActions(2)) {
							setPhaseCounter(2);
							setPlayerSelection({actionType: 0});
							break phaseSwitch;
						}
						return (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={2}
								submitChoice={(choice) => {
									setPhaseCounter(2);
									setPlayerSelection(choice);
								}}
								itemName1={opponent
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
					battleLog.push(
						`${opponent} casts ${opponent.getSpell(
							enemySelection.slot1
						)} in response`
					);
					spellDeclare(
						opponent.getSpell(enemySelection.slot1),
						opponent
					);
					return (
						<IonContent>
							<div className="ion-text-center">
								{battleLog.at(-1)}
							</div>
							<SpellCast
								magic={opponent.getSpell(enemySelection.slot1)}
								caster={opponent}
								target={playerCharacter}
								battleLog={battleLog}
								timing={1}
							/>
							<IonButton
								mode="ios"
								onClick={() => {
									if (
										opponent
											.getSpell(enemySelection.slot1)
											.getPropDamage() > 0 ||
										playerCharacter.getHealth() <
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
					battleLog.push(
						`You cast ${playerCharacter.getSpell(
							playerSelection.slot1
						)} in response`
					);
					spellDeclare(
						playerCharacter.getSpell(playerSelection.slot1),
						playerCharacter
					);
					return (
						<IonContent>
							<div className="ion-text-center">
								{battleLog.at(-1)}
							</div>
							<SpellCast
								magic={playerCharacter.getSpell(
									playerSelection.slot1
								)}
								caster={playerCharacter}
								target={opponent}
								timing={1}
								battleLog={battleLog}
							/>
							<IonButton
								mode="ios"
								onClick={() => {
									if (
										playerCharacter
											.getSpell(playerSelection.slot1)
											.getPropDamage() > 0 ||
										opponent.getHealth() <
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
							opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								playerCharacter
									.getWeapon(playerSelection.slot1)
									.getCanCounter()
							) {
								battleLog.push(
									`The effects of ${playerCharacter.getWeapon(
										playerSelection.slot1
									)} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
								opponent.addNoCounter(
									false,
									playerCharacter
										.getWeapon(playerSelection.slot1)
										.getName()
								);
								battleLog.push(
									`${playerCharacter.getWeapon(
										playerSelection.slot1
									)} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
							opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() == 1 ||
							opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() == 3
						) {
							if (
								playerCharacter
									.getSpell(playerSelection.slot1)
									.getNoCounter()
							) {
								battleLog.push(
									`${playerCharacter.getSpell(
										playerSelection.slot1
									)} cannot be countered`
								);
								opponent.addNoCounter(
									true,
									playerCharacter
										.getSpell(playerSelection.slot1)
										.getName()
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
								battleLog.push(
									`The effects of ${playerCharacter.getSpell(
										playerSelection.slot1
									)} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
							opponent
								//@ts-expect-error
								.getSpell(enemySelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								playerCharacter
									.getWeapon(playerSelection.slot1)
									.getCanCounter()
							) {
								if (
									playerCharacter
										.getWeapon(playerSelection.slot2)
										.getCanCounter()
								) {
									battleLog.push(
										`The effects of ${playerCharacter.getWeapon(
											playerSelection.slot1
										)} and ${playerCharacter.getWeapon(
											playerSelection.slot2
										)} are countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									battleLog.push(
										`The effects of ${playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} are countered, but ${playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} cannot be countered`
									);
									opponent.addNoCounter(
										false,
										playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									playerCharacter
										.getWeapon(playerSelection.slot2)
										.getCanCounter()
								) {
									battleLog.push(
										`The effects of ${playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} are countered, but ${playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} cannot be countered`
									);
									opponent.addNoCounter(
										false,
										playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									battleLog.push(
										`${playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()} and ${playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()} cannot be countered`
									);
									opponent.addNoCounter(
										false,
										playerCharacter
											.getWeapon(playerSelection.slot1)
											.getName()
									);
									opponent.addNoCounter(
										false,
										playerCharacter
											.getWeapon(playerSelection.slot2)
											.getName()
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
							playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								opponent
									.getWeapon(enemySelection.slot1)
									.getCanCounter()
							) {
								battleLog.push(
									`The effects of ${opponent
										.getWeapon(enemySelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
								battleLog.push(
									`${opponent
										.getWeapon(enemySelection.slot1)
										.getName()} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
							playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() == 1 ||
							playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() == 3
						) {
							if (
								opponent
									.getSpell(enemySelection.slot1)
									.getNoCounter()
							) {
								battleLog.push(
									`${opponent
										.getSpell(enemySelection.slot1)
										.getName()} cannot be countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
								battleLog.push(
									`The effects of ${opponent
										.getSpell(enemySelection.slot1)
										.getName()} are countered`
								);
								return (
									<IonContent>
										<div className="ion-text-center">
											{battleLog.at(-1)}
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
							playerCharacter
								//@ts-expect-error
								.getSpell(playerSelection.slot1)
								.getCounterSpell() > 1
						) {
							if (
								opponent
									.getWeapon(enemySelection.slot1)
									.getCanCounter()
							) {
								if (
									opponent
										.getWeapon(enemySelection.slot2)
										.getCanCounter()
								) {
									battleLog.push(
										`The effects of ${opponent
											.getWeapon(enemySelection.slot1)
											.getName()} and ${opponent
											.getWeapon(enemySelection.slot2)
											.getName()} are countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									battleLog.push(
										`The effects of ${opponent
											.getWeapon(enemySelection.slot1)
											.getName()} are countered, but ${opponent
											.getWeapon(enemySelection.slot2)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									opponent
										.getWeapon(enemySelection.slot2)
										.getCanCounter()
								) {
									battleLog.push(
										`The effects of ${opponent
											.getWeapon(enemySelection.slot2)
											.getName()} are countered, but ${opponent
											.getWeapon(enemySelection.slot1)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									battleLog.push(
										`${opponent
											.getWeapon(enemySelection.slot1)
											.getName()} and ${opponent
											.getWeapon(enemySelection.slot2)
											.getName()} cannot be countered`
									);
									return (
										<IonContent>
											<div className="ion-text-center">
												{battleLog.at(-1)}
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
									weapon1={playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									attacker={playerCharacter}
									target={opponent}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												playerCharacter
													.getWeapon(
														playerSelection.slot1
													)
													.getNoCounterAttack() ||
												Math.random() >=
													opponent.getEvadeChance()
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
									weapon1={playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									weapon2={playerCharacter.getWeapon(
										playerSelection.slot2
									)}
									attacker={playerCharacter}
									target={opponent}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												(playerCharacter
													.getWeapon(
														playerSelection.slot1
													)
													.getNoCounterAttack() &&
													playerCharacter
														.getWeapon(
															playerSelection.slot2
														)
														.getNoCounterAttack()) ||
												Math.random() >=
													opponent.getEvadeChance()
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
									magic={playerCharacter.getSpell(
										playerSelection.slot1
									)}
									caster={playerCharacter}
									target={opponent}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												playerCharacter
													.getSpell(
														playerSelection.slot1
													)
													.getCanCounterAttack() &&
												Math.random() <
													opponent.getEvadeChance()
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
									weapon1={opponent.getWeapon(
										enemySelection.slot1
									)}
									attacker={opponent}
									target={playerCharacter}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												opponent
													.getWeapon(
														enemySelection.slot1
													)
													.getNoCounterAttack() ||
												Math.random() >=
													playerCharacter.getEvadeChance()
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
									weapon1={opponent.getWeapon(
										enemySelection.slot1
									)}
									weapon2={opponent.getWeapon(
										enemySelection.slot2
									)}
									attacker={opponent}
									target={playerCharacter}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												(opponent
													.getWeapon(
														enemySelection.slot1
													)
													.getNoCounterAttack() &&
													opponent
														.getWeapon(
															enemySelection.slot2
														)
														.getNoCounterAttack()) ||
												Math.random() >=
													playerCharacter.getEvadeChance()
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
									magic={opponent.getSpell(
										enemySelection.slot1
									)}
									caster={opponent}
									target={playerCharacter}
									battleLog={battleLog}
								/>
								<IonButton
									mode="ios"
									onClick={() => {
										if (!deathCheck()) {
											if (
												opponent
													.getSpell(
														enemySelection.slot1
													)
													.getCanCounterAttack() &&
												Math.random() <
													playerCharacter.getEvadeChance()
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
				setEnemySelection(opponent.chooseAction(3, firstTurn));
				if (enemySelection.actionType == 0) {
					setPhaseCounter(0);
					setPlayerTurn(false);
				} else {
					setPhaseCounter(5);
				}
				break phaseSwitch;
			} else {
				if (playerCharacter.checkPlayerActions(3)) {
					return (
						<ChoosePlayerAction
							playerCharacter={playerCharacter}
							enemyName={opponent.getName()}
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
						battleLog.push(
							`${opponent.getName()} counter attacks with ${opponent.getWeapon(
								enemySelection.slot1
							)}`
						);
						weaponDeclare(
							opponent,
							opponent.getWeapon(enemySelection.slot1)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={opponent.getWeapon(
										enemySelection.slot1
									)}
									attacker={opponent}
									target={playerCharacter}
									counter
									battleLog={battleLog}
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
						battleLog.push(
							`${opponent.getName()} counter attacks with ${opponent
								.getWeapon(enemySelection.slot1)
								.getName()} and ${opponent
								.getWeapon(enemySelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							opponent,
							opponent.getWeapon(enemySelection.slot1),
							opponent.getWeapon(enemySelection.slot2)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={opponent.getWeapon(
										enemySelection.slot1
									)}
									weapon2={opponent.getWeapon(
										enemySelection.slot2
									)}
									attacker={opponent}
									target={playerCharacter}
									counter
									battleLog={battleLog}
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
						battleLog.push(
							`${opponent.getName()} counter attacks by casting ${opponent
								.getSpell(enemySelection.slot1)
								.getName()}`
						);
						spellDeclare(
							opponent.getSpell(enemySelection.slot1),
							opponent
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={opponent.getSpell(
										enemySelection.slot1
									)}
									caster={opponent}
									target={playerCharacter}
									timing={3}
									battleLog={battleLog}
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
						battleLog.push(
							`You counter attack with ${playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()}`
						);
						weaponDeclare(
							playerCharacter,
							playerCharacter.getWeapon(playerSelection.slot1)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<WeaponAttack
									weapon1={playerCharacter.getWeapon(
										playerSelection.slot1
									)}
									attacker={playerCharacter}
									target={opponent}
									counter
									battleLog={battleLog}
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
						battleLog.push(
							`You counter attack with ${playerCharacter
								.getWeapon(playerSelection.slot1)
								.getName()} and ${playerCharacter
								.getWeapon(playerSelection.slot2)
								.getName()}`
						);
						weaponDeclare(
							playerCharacter,
							playerCharacter.getWeapon(playerSelection.slot1),
							playerCharacter.getWeapon(playerSelection.slot2)
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
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
						battleLog.push(
							`You counter attack by casting ${playerCharacter
								.getSpell(playerSelection.slot1)
								.getName()}`
						);
						spellDeclare(
							playerCharacter.getSpell(playerSelection.slot1),
							playerCharacter
						);
						return (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={playerCharacter.getSpell(
										playerSelection.slot1
									)}
									caster={playerCharacter}
									target={opponent}
									timing={3}
									battleLog={battleLog}
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
			<IonButton mode="ios" onClick={endBattle}>
				Something went wrong, click to go back
			</IonButton>
		</IonContent>
	);
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
	var playerTurn: boolean =
		playerCharacter.rollInitiative() > opponent.rollInitiative();
	var firstTurn: boolean = true;
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
	battleLog.push(`${playerTurn ? "You go first" : `${opponent} goes first`}`);
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
	for (; ; playerTurn = !playerTurn) {
		if (playerTurn) {
			playerCharacter.turnStart();
			if (deathCheck()) {
				return endOfCombat();
			}
			var playerSelection: actionChoice;
			yield (
				<ChoosePlayerAction
					playerCharacter={playerCharacter}
					enemyName={opponent.getName()}
					timing={0}
					submitChoice={submitChoice}
				/>
			);
			playerSelection ??= {actionType: 0};
			playerTurn: switch (playerSelection.actionType) {
				case 0:
					battleLog.push("You do nothing");
					yield <ContinuePage />;
					break playerTurn;
				case 1:
					var weaponBuffer1: weapon = playerCharacter.getWeapon(
						playerSelection.slot1
					);
					battleLog.push(`You attack with ${weaponBuffer1}`);
					weaponDeclare(playerCharacter, weaponBuffer1);
					var health: number = playerCharacter.getHealth();
					yield <ContinuePage />;
					var enemySelection: actionChoice = opponent.chooseAction(
						1,
						firstTurn,
						weaponBuffer1.getName()
					);
					if (enemySelection.actionType == 2) {
						var responseSpellBuffer: spell = opponent.getSpell(
							enemySelection.slot1
						);
						battleLog.push(
							`${opponent} casts ${responseSpellBuffer} in response`
						);
						spellDeclare(responseSpellBuffer, opponent);
						yield (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={responseSpellBuffer}
									caster={opponent}
									target={playerCharacter}
									timing={1}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (
							(responseSpellBuffer.getPropDamage() > 0 ||
								playerCharacter.getHealth() < health) &&
							deathCheck()
						) {
							return endOfCombat();
						}
						if (responseSpellBuffer.getCounterSpell() >= 2) {
							if (weaponBuffer1.getCanCounter()) {
								battleLog.push(
									`The effects of ${weaponBuffer1} are countered!`
								);
								if (deathCheck()) {
									return endOfCombat(battleLog.at(-1));
								}
								yield <ContinuePage />;
								break playerTurn;
							}
							opponent.addNoCounter(
								false,
								weaponBuffer1.getName()
							);
							battleLog.push(
								`${weaponBuffer1} cannot be countered!`
							);
							yield <ContinuePage />;
						}
					}
					yield (
						<IonContent>
							<WeaponAttack
								weapon1={weaponBuffer1}
								attacker={playerCharacter}
								target={opponent}
								battleLog={battleLog}
							/>
							<ContinueButton />
						</IonContent>
					);
					if (deathCheck()) {
						return endOfCombat();
					}
					if (weaponBuffer1.getNoCounterAttack()) {
						break playerTurn;
					}
					if (Math.random() < opponent.getCounterAttackChance()) {
						enemySelection = opponent.chooseAction(3, firstTurn);
						switch (enemySelection.actionType) {
							case 1:
								var weaponBuffer1: weapon = opponent.getWeapon(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(opponent, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 3:
								var weaponBuffer1: weapon = opponent.getWeapon(
										enemySelection.slot1
									),
									weaponBuffer2: weapon = opponent.getWeapon(
										enemySelection.slot2
									);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									opponent,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 2:
								var spellBuffer: spell = opponent.getSpell(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, opponent);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={opponent}
											target={playerCharacter}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break playerTurn;
				case 3:
					var weaponBuffer1: weapon = playerCharacter.getWeapon(
							playerSelection.slot1
						),
						weaponBuffer2: weapon = playerCharacter.getWeapon(
							playerSelection.slot2
						);
					battleLog.push(
						`You attack with ${weaponBuffer1} and ${weaponBuffer2}`
					);
					weaponDeclare(
						playerCharacter,
						weaponBuffer1,
						weaponBuffer2
					);
					var health: number = playerCharacter.getHealth();
					yield <ContinuePage />;
					var enemySelection: actionChoice = opponent.chooseAction(
						4,
						firstTurn,
						weaponBuffer1.getName(),
						weaponBuffer2.getName()
					);
					responseAndAttackPlayerTurn: {
						if (enemySelection.actionType == 2) {
							var responseSpellBuffer: spell = opponent.getSpell(
								enemySelection.slot1
							);
							battleLog.push(
								`${opponent} casts ${responseSpellBuffer} in response`
							);
							spellDeclare(responseSpellBuffer, opponent);
							yield (
								<IonContent>
									<div className="ion-text-center">
										{battleLog.at(-1)}
									</div>
									<SpellCast
										magic={responseSpellBuffer}
										caster={opponent}
										target={playerCharacter}
										timing={4}
										battleLog={battleLog}
									/>
									<ContinueButton />
								</IonContent>
							);
							if (
								(responseSpellBuffer.getPropDamage() > 0 ||
									playerCharacter.getHealth() < health) &&
								deathCheck()
							) {
								return endOfCombat();
							}
							if (responseSpellBuffer.getCounterSpell() >= 2) {
								if (weaponBuffer1.getCanCounter()) {
									if (weaponBuffer2.getCanCounter()) {
										battleLog.push(
											`The effects of ${weaponBuffer1} and ${weaponBuffer2} are countered!`
										);
										if (deathCheck()) {
											return endOfCombat(
												battleLog.at(-1)
											);
										}
										yield <ContinuePage />;
										break playerTurn;
									}
									opponent.addNoCounter(
										false,
										weaponBuffer2.getName()
									);
									battleLog.push(
										`The effects of ${weaponBuffer1} are countered, but ${weaponBuffer2} cannot be countered!`
									);
									yield <ContinuePage />;
									yield (
										<IonContent>
											<WeaponAttack
												weapon1={weaponBuffer2}
												attacker={playerCharacter}
												target={opponent}
												battleLog={battleLog}
											/>
											<ContinueButton />
										</IonContent>
									);
									if (deathCheck()) {
										return endOfCombat();
									}
									if (weaponBuffer2.getNoCounterAttack()) {
										break playerTurn;
									}
									break responseAndAttackPlayerTurn;
								}
								opponent.addNoCounter(
									false,
									weaponBuffer1.getName()
								);
								if (weaponBuffer2.getCanCounter()) {
									battleLog.push(
										`The effects of ${weaponBuffer2} are countered, but ${weaponBuffer1} cannot be countered!`
									);
									yield <ContinuePage />;
									yield (
										<IonContent>
											<WeaponAttack
												weapon1={weaponBuffer1}
												attacker={playerCharacter}
												target={opponent}
												battleLog={battleLog}
											/>
											<ContinueButton />
										</IonContent>
									);
									if (deathCheck()) {
										return endOfCombat();
									}
									if (weaponBuffer1.getNoCounterAttack()) {
										break playerTurn;
									}
									break responseAndAttackPlayerTurn;
								}
								opponent.addNoCounter(
									false,
									weaponBuffer2.getName()
								);
								battleLog.push(
									`${weaponBuffer1} and ${weaponBuffer2} cannot be countered!`
								);
								yield <ContinuePage />;
							}
						}
						yield (
							<IonContent>
								<WeaponAttack
									weapon1={weaponBuffer1}
									weapon2={weaponBuffer2}
									attacker={playerCharacter}
									target={opponent}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (deathCheck()) {
							return endOfCombat();
						}
						if (
							weaponBuffer1.getNoCounterAttack() &&
							weaponBuffer2.getNoCounterAttack()
						) {
							break playerTurn;
						}
					}
					if (Math.random() < opponent.getCounterAttackChance()) {
						enemySelection = opponent.chooseAction(3, firstTurn);
						switch (enemySelection.actionType) {
							case 1:
								var weaponBuffer1: weapon = opponent.getWeapon(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(opponent, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 3:
								var weaponBuffer1: weapon = opponent.getWeapon(
										enemySelection.slot1
									),
									weaponBuffer2: weapon = opponent.getWeapon(
										enemySelection.slot2
									);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									opponent,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 2:
								var spellBuffer: spell = opponent.getSpell(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, opponent);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={opponent}
											target={playerCharacter}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break playerTurn;
				case 2:
					var spellBuffer: spell = playerCharacter.getSpell(
						playerSelection.slot1
					);
					battleLog.push(`You cast ${spellBuffer}`);
					spellDeclare(spellBuffer, playerCharacter);
					var health: number = playerCharacter.getHealth();
					yield <ContinuePage />;
					var enemySelection: actionChoice = opponent.chooseAction(
						2,
						firstTurn,
						spellBuffer.getName()
					);
					if (enemySelection.actionType == 2) {
						var responseSpellBuffer: spell = opponent.getSpell(
							enemySelection.slot1
						);
						battleLog.push(
							`${opponent} casts ${responseSpellBuffer} in response`
						);
						spellDeclare(responseSpellBuffer, opponent);
						yield (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={responseSpellBuffer}
									caster={opponent}
									target={playerCharacter}
									timing={2}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (
							(responseSpellBuffer.getPropDamage() > 0 ||
								playerCharacter.getHealth() < health) &&
							deathCheck()
						) {
							return endOfCombat();
						}
						if (
							responseSpellBuffer.getCounterSpell() == 1 ||
							responseSpellBuffer.getCounterSpell() == 3
						) {
							if (spellBuffer.getNoCounter()) {
								opponent.addNoCounter(
									true,
									spellBuffer.getName()
								);
								battleLog.push(
									`${spellBuffer} cannot be countered!`
								);
								yield <ContinuePage />;
							} else {
								battleLog.push(
									`The effects of ${spellBuffer} are countered!`
								);
								if (deathCheck()) {
									return endOfCombat(battleLog.at(-1));
								}
								yield <ContinuePage />;
								break playerTurn;
							}
						}
					}
					yield (
						<IonContent>
							<SpellCast
								magic={spellBuffer}
								caster={playerCharacter}
								target={opponent}
								timing={0}
								battleLog={battleLog}
							/>
							<ContinueButton />
						</IonContent>
					);
					if (deathCheck()) {
						return endOfCombat();
					}
					if (!spellBuffer.getCanCounterAttack()) {
						break playerTurn;
					}
					if (Math.random() < opponent.getCounterAttackChance()) {
						enemySelection = opponent.chooseAction(3, firstTurn);
						switch (enemySelection.actionType) {
							case 1:
								var weaponBuffer1: weapon = opponent.getWeapon(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(opponent, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 3:
								var weaponBuffer1: weapon = opponent.getWeapon(
										enemySelection.slot1
									),
									weaponBuffer2: weapon = opponent.getWeapon(
										enemySelection.slot2
									);
								battleLog.push(
									`${opponent} counter attacks with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									opponent,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={opponent}
											target={playerCharacter}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break playerTurn;
							case 2:
								var spellBuffer: spell = opponent.getSpell(
									enemySelection.slot1
								);
								battleLog.push(
									`${opponent} counter attacks by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, opponent);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={opponent}
											target={playerCharacter}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break playerTurn;
			}
		} else {
			opponent.turnStart();
			if (deathCheck()) {
				return endOfCombat();
			}
			var enemySelection: actionChoice = opponent.chooseAction(
				0,
				firstTurn
			);
			enemyTurn: switch (enemySelection.actionType) {
				case 0:
					battleLog.push(`${opponent} does nothing`);
					yield <ContinuePage />;
					break enemyTurn;
				case 1:
					var weaponBuffer1: weapon = opponent.getWeapon(
						enemySelection.slot1
					);
					battleLog.push(`${opponent} attacks with ${weaponBuffer1}`);
					weaponDeclare(opponent, weaponBuffer1);
					var health: number = opponent.getHealth();
					yield <ContinuePage />;
					var playerSelection: actionChoice;
					if (playerCharacter.checkPlayerActions(1)) {
						yield (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={1}
								submitChoice={submitChoice}
								itemName1={weaponBuffer1.getName()}
							/>
						);
					} else {
						playerSelection = {actionType: 0};
					}
					playerSelection ??= {actionType: 0};
					if (playerSelection.actionType == 2) {
						var responseSpellBuffer: spell =
							playerCharacter.getSpell(playerSelection.slot1);
						battleLog.push(
							`You cast ${responseSpellBuffer} in response`
						);
						spellDeclare(responseSpellBuffer, playerCharacter);
						yield (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={responseSpellBuffer}
									caster={playerCharacter}
									target={opponent}
									timing={1}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (
							(responseSpellBuffer.getPropDamage() > 0 ||
								opponent.getHealth() < health) &&
							deathCheck()
						) {
							return endOfCombat();
						}
						if (responseSpellBuffer.getCounterSpell() >= 2) {
							if (weaponBuffer1.getCanCounter()) {
								battleLog.push(
									`The effects of ${weaponBuffer1} are countered!`
								);
								if (deathCheck()) {
									return endOfCombat(battleLog.at(-1));
								}
								yield <ContinuePage />;
								break enemyTurn;
							}
							battleLog.push(
								`${weaponBuffer1} cannot be countered!`
							);
							yield <ContinuePage />;
						}
					}
					yield (
						<IonContent>
							<WeaponAttack
								weapon1={weaponBuffer1}
								attacker={opponent}
								target={playerCharacter}
								battleLog={battleLog}
							/>
							<ContinueButton />
						</IonContent>
					);
					if (deathCheck()) {
						return endOfCombat();
					}
					if (weaponBuffer1.getNoCounterAttack()) {
						break enemyTurn;
					}
					if (
						Math.random() < playerCharacter.getCounterAttackChance()
					) {
						if (playerCharacter.checkPlayerActions(3)) {
							yield (
								<ChoosePlayerAction
									playerCharacter={playerCharacter}
									enemyName={opponent.getName()}
									timing={3}
									submitChoice={submitChoice}
								/>
							);
						} else {
							playerSelection = {actionType: 0};
						}
						switch (playerSelection.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(playerCharacter, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 3:
								var weaponBuffer1: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									playerCharacter,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 2:
								var spellBuffer: spell =
									playerCharacter.getSpell(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, playerCharacter);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={playerCharacter}
											target={opponent}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break enemyTurn;
				case 3:
					var weaponBuffer1: weapon = opponent.getWeapon(
							enemySelection.slot1
						),
						weaponBuffer2: weapon = opponent.getWeapon(
							enemySelection.slot2
						);
					battleLog.push(
						`${opponent} attacks with ${weaponBuffer1} and ${weaponBuffer2}`
					);
					weaponDeclare(opponent, weaponBuffer1, weaponBuffer2);
					var health: number = opponent.getHealth();
					yield <ContinuePage />;
					var playerSelection: actionChoice;
					if (playerCharacter.checkPlayerActions(4)) {
						yield (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={4}
								submitChoice={submitChoice}
								itemName1={weaponBuffer1.getName()}
								itemName2={weaponBuffer2.getName()}
							/>
						);
					} else {
						playerSelection = {actionType: 0};
					}
					playerSelection ??= {actionType: 0};
					responseAndAttackEnemyTurn: {
						if (playerSelection.actionType == 2) {
							var responseSpellBuffer: spell =
								playerCharacter.getSpell(playerSelection.slot1);
							battleLog.push(
								`You cast ${responseSpellBuffer} in response`
							);
							spellDeclare(responseSpellBuffer, playerCharacter);
							yield (
								<IonContent>
									<div className="ion-text-center">
										{battleLog.at(-1)}
									</div>
									<SpellCast
										magic={responseSpellBuffer}
										caster={playerCharacter}
										target={opponent}
										timing={4}
										battleLog={battleLog}
									/>
									<ContinueButton />
								</IonContent>
							);
							if (
								(responseSpellBuffer.getPropDamage() > 0 ||
									opponent.getHealth() < health) &&
								deathCheck()
							) {
								return endOfCombat();
							}
							if (responseSpellBuffer.getCounterSpell() >= 2) {
								if (weaponBuffer1.getCanCounter()) {
									if (weaponBuffer2.getCanCounter()) {
										battleLog.push(
											`The effects of ${weaponBuffer1} and ${weaponBuffer2} are counterd!`
										);
										if (deathCheck()) {
											return endOfCombat(
												battleLog.at(-1)
											);
										}
										yield <ContinuePage />;
										break enemyTurn;
									}
									battleLog.push(
										`The effects of ${weaponBuffer1} are countered, but ${weaponBuffer2} cannot be countered!`
									);
									yield <ContinuePage />;
									yield (
										<IonContent>
											<WeaponAttack
												weapon1={weaponBuffer2}
												attacker={opponent}
												target={playerCharacter}
												battleLog={battleLog}
											/>
											<ContinueButton />
										</IonContent>
									);
									if (deathCheck()) {
										return endOfCombat();
									}
									if (weaponBuffer2.getNoCounterAttack()) {
										break enemyTurn;
									}
									break responseAndAttackEnemyTurn;
								}
								if (weaponBuffer2.getCanCounter()) {
									battleLog.push(
										`The effects of ${weaponBuffer2} are countered, but ${weaponBuffer1} cannot be countered!`
									);
									yield <ContinuePage />;
									yield (
										<IonContent>
											<WeaponAttack
												weapon1={weaponBuffer1}
												attacker={opponent}
												target={playerCharacter}
												battleLog={battleLog}
											/>
											<ContinueButton />
										</IonContent>
									);
									if (deathCheck()) {
										return endOfCombat();
									}
									if (weaponBuffer1.getNoCounterAttack()) {
										break enemyTurn;
									}
									break responseAndAttackEnemyTurn;
								}
								battleLog.push(
									`${weaponBuffer1} and ${weaponBuffer2} cannot be countered!`
								);
								yield <ContinuePage />;
							}
						}
						yield (
							<IonContent>
								<WeaponAttack
									weapon1={weaponBuffer1}
									weapon2={weaponBuffer2}
									attacker={opponent}
									target={playerCharacter}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (deathCheck()) {
							return endOfCombat();
						}
						if (
							weaponBuffer1.getNoCounterAttack() &&
							weaponBuffer2.getNoCounterAttack()
						) {
							break enemyTurn;
						}
					}
					if (
						Math.random() < playerCharacter.getCounterAttackChance()
					) {
						if (playerCharacter.checkPlayerActions(3)) {
							yield (
								<ChoosePlayerAction
									playerCharacter={playerCharacter}
									enemyName={opponent.getName()}
									timing={3}
									submitChoice={submitChoice}
								/>
							);
						} else {
							playerSelection = {actionType: 0};
						}
						switch (playerSelection.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(playerCharacter, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 3:
								var weaponBuffer1: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									playerCharacter,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 2:
								var spellBuffer: spell =
									playerCharacter.getSpell(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, playerCharacter);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={playerCharacter}
											target={opponent}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break enemyTurn;
				case 2:
					var spellBuffer: spell = opponent.getSpell(
						enemySelection.slot1
					);
					battleLog.push(`${opponent} casts ${spellBuffer}`);
					spellDeclare(spellBuffer, opponent);
					var health: number = opponent.getHealth();
					yield <ContinuePage />;
					var playerSelection: actionChoice;
					if (playerCharacter.checkPlayerActions(2)) {
						yield (
							<ChoosePlayerAction
								playerCharacter={playerCharacter}
								enemyName={opponent.getName()}
								timing={2}
								submitChoice={submitChoice}
								itemName1={spellBuffer.getName()}
							/>
						);
					} else {
						playerSelection = {actionType: 0};
					}
					playerSelection ??= {actionType: 0};
					if (playerSelection.actionType == 2) {
						var responseSpellBuffer: spell =
							playerCharacter.getSpell(playerSelection.slot1);
						battleLog.push(
							`You cast ${responseSpellBuffer.getName()} in response`
						);
						spellDeclare(responseSpellBuffer, playerCharacter);
						yield (
							<IonContent>
								<div className="ion-text-center">
									{battleLog.at(-1)}
								</div>
								<SpellCast
									magic={responseSpellBuffer}
									caster={playerCharacter}
									target={opponent}
									timing={2}
									battleLog={battleLog}
								/>
								<ContinueButton />
							</IonContent>
						);
						if (
							responseSpellBuffer.getCounterSpell() == 1 ||
							responseSpellBuffer.getCounterSpell() == 3
						) {
							if (spellBuffer.getNoCounter()) {
								battleLog.push(
									`${spellBuffer} cannot be countered!`
								);
								yield <ContinuePage />;
							} else {
								battleLog.push(
									`The effects of ${spellBuffer} are countered!`
								);
								if (deathCheck()) {
									return endOfCombat(battleLog.at(-1));
								}
								yield <ContinuePage />;
								break enemyTurn;
							}
						}
					}
					yield (
						<IonContent>
							<SpellCast
								magic={spellBuffer}
								caster={opponent}
								target={playerCharacter}
								timing={0}
								battleLog={battleLog}
							/>
							<ContinueButton />
						</IonContent>
					);
					if (deathCheck()) {
						return endOfCombat();
					}
					if (!spellBuffer.getCanCounterAttack()) {
						break enemyTurn;
					}
					if (
						Math.random() < playerCharacter.getCounterAttackChance()
					) {
						if (playerCharacter.checkPlayerActions(3)) {
							yield (
								<ChoosePlayerAction
									playerCharacter={playerCharacter}
									enemyName={opponent.getName()}
									timing={3}
									submitChoice={submitChoice}
								/>
							);
						} else {
							playerSelection = {actionType: 0};
						}
						switch (playerSelection.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield <ContinuePage />;
								weaponDeclare(playerCharacter, weaponBuffer1);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 3:
								var weaponBuffer1: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield <ContinuePage />;
								weaponDeclare(
									playerCharacter,
									weaponBuffer1,
									weaponBuffer2
								);
								yield (
									<IonContent>
										<WeaponAttack
											weapon1={weaponBuffer1}
											weapon2={weaponBuffer2}
											attacker={playerCharacter}
											target={opponent}
											counter
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
								break enemyTurn;
							case 2:
								var spellBuffer: spell =
									playerCharacter.getSpell(
										playerSelection.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield <ContinuePage />;
								spellDeclare(spellBuffer, playerCharacter);
								yield (
									<IonContent>
										<SpellCast
											magic={spellBuffer}
											caster={playerCharacter}
											target={opponent}
											timing={3}
											battleLog={battleLog}
										/>
										<ContinueButton />
									</IonContent>
								);
								if (deathCheck()) {
									return endOfCombat();
								}
						}
					}
					break enemyTurn;
			}
			firstTurn = false;
		}
	}
	/**Function for the player to submit a choice
	 * @param choice - The choice made
	 */
	function submitChoice(choice: actionChoice): void {
		playerSelection = choice;
		advanceCombat();
	}
	/**Checks if either fighter is dead */
	function deathCheck(): boolean {
		return playerCharacter.getHealth() <= 0 || opponent.getHealth() <= 0;
	}
	/**Handles end of battle, UNFINISHED
	 * @param message - A message to be displayed along with the end of combat stuff
	 */
	function endOfCombat(message?: string): React.JSX.Element {
		if (opponent.getHealth() <= 0) {
			if (opponent.getDeathSpell()?.getReal()) {
				battleLog.push(
					`${opponent} is dead. On death, it casts ${opponent.getDeathSpell()}`
				);
				return (
					<IonContent>
						{message != undefined ? (
							<div className="ion-text-center">{message}</div>
						) : null}
						<div className="ion-text-center">
							{opponent.getName()} is dead. On death, it casts{" "}
							{opponent.getDeathSpell()!.getName()}
						</div>
						<SpellCast
							magic={opponent.getDeathSpell()!}
							target={playerCharacter}
							battleLog={battleLog}
						/>
						{playerCharacter.getHealth() <= 0 &&
						(battleLog.push("You are dead") || true) ? (
							<div className="ion-text-center">You are dead</div>
						) : null}
						<EndBattleButton />
					</IonContent>
				);
			}
			if (playerCharacter.getHealth() <= 0) {
				battleLog.push("You are dead");
				return (
					<IonContent>
						{message != undefined ? (
							<div className="ion-text-center">{message}</div>
						) : null}
						<div className="ion-text-center">You are dead</div>
						<EndBattleButton />
					</IonContent>
				);
			}
			battleLog.push(`${opponent} is dead`);
			return (
				<IonContent>
					{message != undefined ? (
						<div className="ion-text-center">{message}</div>
					) : null}
					<div className="ion-text-center">
						{opponent.getName()} is dead
					</div>
					<EndBattleButton />
				</IonContent>
			);
		}
		battleLog.push("You are dead");
		return (
			<IonContent>
				{message != undefined ? (
					<div className="ion-text-center">{message}</div>
				) : null}
				<div className="ion-text-center">You are dead</div>
				<EndBattleButton />
			</IonContent>
		);
	}
	function ContinuePage(): React.JSX.Element {
		return (
			<IonContent>
				<div className="ion-text-center">{battleLog.at(-1)}</div>
				<ContinueButton />
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

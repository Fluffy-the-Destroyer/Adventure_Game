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
export const enum BATTLE_VALUES {
	POISON_MULTIPLIER = 1,
	BLEED_MULTIPLIER = 1,
	REGEN_MULTIPLIER = 1
}

/**Displays the Battle page
 * @hook
 */
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
): Generator<React.JSX.Element, React.JSX.Element | null, void | (() => void)> {
	var playerTurn: boolean =
		playerCharacter.rollInitiative() > opponent.rollInitiative();
	var firstTurn: boolean = true;
	const advanceCombat: () => void =
		(yield <Fragment></Fragment>) ??
		((): void => {
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
			playerTurn: switch (playerSelection!.actionType) {
				case 0:
					battleLog.push("You do nothing");
					yield ContinuePage();
					break playerTurn;
				case 1:
					var weaponBuffer1: weapon = playerCharacter.getWeapon(
						playerSelection!.slot1
					);
					battleLog.push(`You attack with ${weaponBuffer1}`);
					weaponDeclare(playerCharacter, weaponBuffer1);
					var health: number = playerCharacter.getHealth();
					yield ContinuePage();
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
								yield ContinuePage();
								break playerTurn;
							}
							opponent.addNoCounter(
								false,
								weaponBuffer1.getName()
							);
							battleLog.push(
								`${weaponBuffer1} cannot be countered!`
							);
							yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
							playerSelection!.slot1
						),
						weaponBuffer2: weapon = playerCharacter.getWeapon(
							playerSelection!.slot2
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
					yield ContinuePage();
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
										yield ContinuePage();
										break playerTurn;
									}
									opponent.addNoCounter(
										false,
										weaponBuffer2.getName()
									);
									battleLog.push(
										`The effects of ${weaponBuffer1} are countered, but ${weaponBuffer2} cannot be countered!`
									);
									yield ContinuePage();
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
									yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
						playerSelection!.slot1
					);
					battleLog.push(`You cast ${spellBuffer}`);
					spellDeclare(spellBuffer, playerCharacter);
					var health: number = playerCharacter.getHealth();
					yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
								yield ContinuePage();
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
					yield ContinuePage();
					break enemyTurn;
				case 1:
					var weaponBuffer1: weapon = opponent.getWeapon(
						enemySelection.slot1
					);
					battleLog.push(`${opponent} attacks with ${weaponBuffer1}`);
					weaponDeclare(opponent, weaponBuffer1);
					var health: number = opponent.getHealth();
					yield ContinuePage();
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
					if (playerSelection!.actionType == 2) {
						var responseSpellBuffer: spell =
							playerCharacter.getSpell(playerSelection!.slot1);
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
								yield ContinuePage();
								break enemyTurn;
							}
							battleLog.push(
								`${weaponBuffer1} cannot be countered!`
							);
							yield ContinuePage();
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
						switch (playerSelection!.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield ContinuePage();
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
											playerSelection!.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection!.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield ContinuePage();
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
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield ContinuePage();
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
					yield ContinuePage();
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
					responseAndAttackEnemyTurn: {
						if (playerSelection!.actionType == 2) {
							var responseSpellBuffer: spell =
								playerCharacter.getSpell(
									playerSelection!.slot1
								);
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
										yield ContinuePage();
										break enemyTurn;
									}
									battleLog.push(
										`The effects of ${weaponBuffer1} are countered, but ${weaponBuffer2} cannot be countered!`
									);
									yield ContinuePage();
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
									yield ContinuePage();
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
								yield ContinuePage();
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
						switch (playerSelection!.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield ContinuePage();
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
											playerSelection!.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection!.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield ContinuePage();
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
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield ContinuePage();
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
					yield ContinuePage();
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
					if (playerSelection!.actionType == 2) {
						var responseSpellBuffer: spell =
							playerCharacter.getSpell(playerSelection!.slot1);
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
								yield ContinuePage();
							} else {
								battleLog.push(
									`The effects of ${spellBuffer} are countered!`
								);
								if (deathCheck()) {
									return endOfCombat(battleLog.at(-1));
								}
								yield ContinuePage();
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
						switch (playerSelection!.actionType) {
							case 1:
								var weaponBuffer1: weapon =
									playerCharacter.getWeapon(
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack with ${weaponBuffer1}`
								);
								yield ContinuePage();
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
											playerSelection!.slot1
										),
									weaponBuffer2: weapon =
										playerCharacter.getWeapon(
											playerSelection!.slot2
										);
								battleLog.push(
									`You counter attack with ${weaponBuffer1} and ${weaponBuffer2}`
								);
								yield ContinuePage();
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
										playerSelection!.slot1
									);
								battleLog.push(
									`You counter attack by casting ${spellBuffer}`
								);
								yield ContinuePage();
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

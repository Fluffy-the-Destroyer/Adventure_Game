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
import {chevronUpCircle, close} from "ionicons/icons";
import {spell} from "../functionality/spells";
import {weapon} from "../functionality/weapons";

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
}): JSX.Element {
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
}): JSX.Element {
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
	/**Stores health of active fighter before declaring main action, to test whether to run a death check after a response */
	const [preDeclarationHealth, setPreDeclarationHealth] = useState<number>(0);
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
				setPreDeclarationHealth(props.playerCharacter.getHealth());
				setPhaseCounter(1);
				break phaseSwitch;
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
										setPlayerTurn(false);
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
				setPreDeclarationHealth(props.opponent.getHealth());
				setPhaseCounter(1);
				break phaseSwitch;
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
								{props.opponent.getName()} casts{" "}
								{props.opponent
									.getSpell(enemySelection.slot1)
									.getName()}{" "}
								in response
							</div>
							<SpellCast
								magic={props.opponent.getSpell(
									enemySelection.slot1
								)}
								caster={props.opponent}
								target={props.playerCharacter}
							/>
							<IonButton
								mode="ios"
								onClick={() => {
									if (!deathCheck()) {
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
		//Main action resolution
		case 3:
		//Main action resolution effexts
		case 3.5:
		//Counter attack selection
		case 4:
		//Counter attack resolution
		//case 4.5:
		//Counter attack resolution
		case 5:
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
}): JSX.Element;
function WeaponAttack(props: {
	weapon1: weapon;
	weapon2?: weapon;
	attacker: enemy;
	target: player;
	counter?: boolean;
}): JSX.Element;
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
}): JSX.Element {
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
					/>
				);
			}
		}
	}
	const attackerEffects: string[] = [];
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
		attackerEffects.push("Attacker effects");
		if (props.weapon1.getPropSelfDamage() > 0) {
			//@ts-expect-error
			if (props.weapon2?.getPropSelfDamage() > 0) {
				damageBuffer =
					props.weapon1.getPropSelfDamage() +
					props.weapon2!.getPropSelfDamage() -
					props.weapon1.getPropSelfDamage() *
						props.weapon2!.getPropSelfDamage();
				props.attacker.propDamage(damageBuffer);
				attackerEffects.push(
					`-${Math.round(100 * damageBuffer)}% health`
				);
				//@ts-expect-error
			} else if (props.weapon2?.getPropSelfDamage() < 0) {
				props.attacker.propDamage(props.weapon1.getPropSelfDamage());
				props.attacker.propDamage(props.weapon2!.getPropSelfDamage());
				attackerEffects.push(
					`-${Math.round(
						100 * props.weapon1.getPropSelfDamage()
					)}% health, then -${Math.round(
						100 * props.weapon2!.getPropSelfDamage()
					)}% of health recovered`
				);
			} else {
				props.attacker.propDamage(props.weapon1.getPropSelfDamage());
				attackerEffects.push(
					`-${100 * props.weapon1.getPropSelfDamage()}% health`
				);
			}
		}
	}
	return <Fragment></Fragment>;
}

/**Weapon hit */
function WeaponHit(props: {
	weaponry: weapon;
	attacker: player;
	target: enemy;
}): JSX.Element;
function WeaponHit(props: {
	weaponry: weapon;
	attacker: enemy;
	target: player;
}): JSX.Element;
function WeaponHit(props: {
	/**The weapon */
	weaponry: weapon;
	/**The attacker */
	attacker: player | enemy;
	/**The target */
	target: player | enemy;
}): JSX.Element {
	return <Fragment></Fragment>;
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
	counter?: boolean;
}): JSX.Element;
function SpellCast(props: {
	magic: spell;
	caster?: enemy;
	target: player;
	counter?: boolean;
}): JSX.Element;
function SpellCast(props: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: player | enemy;
	/**The target */
	target: player | enemy;
	/**Is it a counter attack */
	counter?: boolean;
}): JSX.Element {
	if (props.counter == undefined) {
		props.counter = false;
	}
	return <Fragment></Fragment>;
}

/**Spell hit */
function SpellHit(props: {
	magic: spell;
	caster: player;
	target: enemy;
}): JSX.Element;
function SpellHit(props: {
	magic: spell;
	caster?: enemy;
	target: player;
}): JSX.Element;
function SpellHit(props: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: player | enemy;
	/**The target */
	target: player | enemy;
}): JSX.Element {
	return <Fragment></Fragment>;
}

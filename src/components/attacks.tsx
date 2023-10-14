import {Fragment} from "react";
import {enemy} from "../functionality/enemies";
import {player} from "../functionality/player";
import {weapon} from "../functionality/weapons";
import {spell} from "../functionality/spells";

/**Weapon declare
 * @param attacker - The attacker
 * @param weapon1 - The first weapon
 * @param weapon2 - The second weapon (if present)
 */
export function weaponDeclare(
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
export function WeaponAttack({
	weapon1,
	weapon2,
	attacker,
	target,
	counter,
	battleLog
}: {
	/**First weapon */
	weapon1: weapon;
	/**Second weapon (if present) */
	weapon2?: weapon;
	/**Attacker */
	attacker: player;
	/**Target */
	target: enemy;
	/**Is it a counter attack */
	counter?: boolean;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Weapon attack */
export function WeaponAttack({
	weapon1,
	weapon2,
	attacker,
	target,
	counter,
	battleLog
}: {
	/**First weapon */
	weapon1: weapon;
	/**Second weapon (if present) */
	weapon2?: weapon;
	/**Attacker */
	attacker: enemy;
	/**Target */
	target: player;
	/**Is it a counter attack */
	counter?: boolean;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Weapon attack */
export function WeaponAttack({
	weapon1,
	weapon2,
	attacker,
	target,
	counter,
	battleLog
}: {
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
	if (counter) {
		//@ts-expect-error
		if (weapon2?.getCounterHits() > weapon1.getCounterHits()) {
			return (
				//@ts-expect-error
				WeaponAttack({
					weapon1,
					weapon2,
					attacker,
					target,
					battleLog,
					counter
				})
			);
		}
	} else {
		//@ts-expect-error
		if (weapon2?.getHitCount() > weapon1.getHitCount()) {
			return (
				//@ts-expect-error
				WeaponAttack({
					weapon1,
					weapon2,
					attacker,
					target,
					battleLog
				})
			);
		}
	}
	/**An array of divs displaying effects on the attacker */
	var attackerEffects: React.JSX.Element[] = [];
	var outputText: string;
	/**For holding damage values */
	var damageBuffer: number;
	if (
		weapon1.getEffectType()[1] == 1 ||
		weapon1.getEffectType()[1] == 2 ||
		weapon1.getEffectType()[0] == 1 ||
		weapon1.getEffectType()[0] == 2 ||
		weapon2?.getEffectType()[1] == 1 ||
		weapon2?.getEffectType()[1] == 2 ||
		weapon2?.getEffectType()[0] == 1 ||
		weapon2?.getEffectType()[0] == 2
	) {
		battleLog.push((outputText = "Attacker effects:"));
		attackerEffects.push(
			<div className="ion-text-center" key="attacker-effects">
				{outputText}
			</div>
		);
	}
	//Positive and negative prop damage do not commute, so take care over the ordering
	if (weapon1.getPropSelfDamage() > 0) {
		//@ts-expect-error
		if (weapon2?.getPropSelfDamage() > 0) {
			damageBuffer =
				weapon1.getPropSelfDamage() +
				weapon2!.getPropSelfDamage() -
				weapon1.getPropSelfDamage() * weapon2!.getPropSelfDamage();
			attacker.propDamage(damageBuffer);
			battleLog.push(
				(outputText = `${-Math.round(100 * damageBuffer)}% health`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (weapon2?.getPropSelfDamage() < 0) {
			attacker.propDamage(weapon1.getPropSelfDamage());
			attacker.propDamage(weapon2!.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon1.getPropSelfDamage()
				)}% health, then ${-Math.round(
					100 * weapon2!.getPropSelfDamage()
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else {
			attacker.propDamage(weapon1.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon1.getPropSelfDamage()
				)}% health`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	} else if (weapon1.getPropSelfDamage() < 0) {
		//@ts-expect-error
		if (weapon2?.getPropSelfDamage() > 0) {
			attacker.propDamage(weapon2!.getPropSelfDamage());
			attacker.propDamage(weapon1.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon2!.getPropSelfDamage()
				)}% health, then ${-Math.round(
					100 * weapon1.getPropSelfDamage()
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (weapon2?.getPropSelfDamage() < 0) {
			damageBuffer = Math.max(
				-1,
				weapon1.getPropSelfDamage() + weapon2!.getPropSelfDamage()
			);
			attacker.propDamage(damageBuffer);
			battleLog.push(
				(outputText = `${-Math.round(
					100 * damageBuffer
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else {
			attacker.propDamage(weapon1.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon1.getPropSelfDamage()
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	} else {
		//@ts-expect-error
		if (weapon2?.getPropSelfDamage() > 0) {
			attacker.propDamage(weapon2!.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon2!.getPropSelfDamage()
				)}% health`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
			//@ts-expect-error
		} else if (weapon2?.getPropSelfDamage() < 0) {
			attacker.propDamage(weapon2!.getPropSelfDamage());
			battleLog.push(
				(outputText = `${-Math.round(
					100 * weapon2!.getPropSelfDamage()
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
	}
	selfDamage: {
		if (
			weapon1.getEffectType()[1] == 1 ||
			weapon1.getEffectType()[1] == 2
		) {
			if (
				weapon2?.getEffectType()[1] == 1 ||
				weapon2?.getEffectType()[1] == 2
			) {
				if (weapon1.getSelfOverHeal()) {
					damageBuffer =
						attacker.flatDamage(
							weapon2.getFlatSelfDamage(),
							weapon2.getFlatSelfMagicDamage(),
							weapon2.getFlatSelfArmourPiercingDamage(),
							weapon2.getSelfOverHeal()
						) +
						attacker.flatDamage(
							weapon1.getFlatSelfDamage(),
							weapon1.getFlatSelfMagicDamage(),
							weapon1.getFlatSelfArmourPiercingDamage(),
							true
						);
				} else {
					damageBuffer =
						attacker.flatDamage(
							weapon1.getFlatSelfDamage(),
							weapon1.getFlatSelfMagicDamage(),
							weapon1.getFlatSelfArmourPiercingDamage()
						) +
						attacker.flatDamage(
							weapon2.getFlatSelfDamage(),
							weapon2.getFlatSelfMagicDamage(),
							weapon2.getFlatSelfArmourPiercingDamage(),
							weapon2.getSelfOverHeal()
						);
				}
			} else {
				damageBuffer = attacker.flatDamage(
					weapon1.getFlatSelfDamage(),
					weapon1.getFlatSelfMagicDamage(),
					weapon1.getFlatSelfArmourPiercingDamage(),
					weapon1.getSelfOverHeal()
				);
			}
		} else if (
			weapon2?.getEffectType()[1] == 1 ||
			weapon2?.getEffectType()[1] == 2
		) {
			damageBuffer = attacker.flatDamage(
				weapon2.getFlatSelfDamage(),
				weapon2.getFlatSelfMagicDamage(),
				weapon2.getFlatSelfArmourPiercingDamage(),
				weapon2.getSelfOverHeal()
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
		battleLog.push(outputText);
		attackerEffects.push(
			<div className="ion-text-center" key="flatSelfDamage">
				{outputText}
			</div>
		);
	}
	{
		let selfPoison =
				weapon1.getSelfPoison() + (weapon2?.getSelfPoison() ?? 0),
			selfBleed = weapon1.getSelfBleed() + (weapon2?.getSelfBleed() ?? 0);
		if (selfPoison > 0 || selfBleed > 0) {
			let dotEffects: string = "";
			if (selfPoison > 0) {
				if (attacker.modifyPoison(selfPoison)) {
					dotEffects = `+${selfPoison} poison, `;
				} else {
					dotEffects = "Poison resisted, ";
				}
			}
			if (selfBleed > 0) {
				if (attacker.modifyBleed(selfBleed)) {
					dotEffects += `+${selfBleed} bleed, `;
				} else {
					dotEffects += "Bleed resisted, ";
				}
			}
			battleLog.push((outputText = dotEffects.slice(0, -2)));
			attackerEffects.push(
				<div className="ion-text-center" key="dotSelf">
					{outputText}
				</div>
			);
		}
	}
	if (
		weapon1.getEffectType()[1] < 2 &&
		weapon1.getEffectType()[0] < 2 &&
		(weapon2 == undefined ||
			(weapon2.getEffectType()[1] < 2 && weapon2.getEffectType()[0] < 2))
	) {
		return <Fragment>{attackerEffects}</Fragment>;
	}
	var targetEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="target-effects">
			Target effects:
		</div>
	];
	var hits1: number, hits2: number | undefined;
	if (counter) {
		hits1 = weapon1.getCounterHits();
		hits2 = weapon2?.getCounterHits();
	} else {
		hits1 = weapon1.getHitCount();
		hits2 = weapon2?.getHitCount();
	}
	for (let i: number = 0; i < hits1; i++) {
		targetEffects.push(
			//@ts-expect-error
			<WeaponHit
				key={`${weapon1.getKey()}-${i}`}
				weaponry={weapon1}
				attacker={attacker}
				target={target}
				battleLog={battleLog}
			/>
		);
		//@ts-expect-error
		if (i < hits2) {
			targetEffects.push(
				//@ts-expect-error
				<WeaponHit
					key={`${weapon2!.getKey()}-${i}`}
					weaponry={weapon2!}
					attacker={attacker}
					target={target}
					battleLog={battleLog}
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
export function WeaponHit({
	weaponry,
	attacker,
	target,
	battleLog
}: {
	/**The weapon */
	weaponry: weapon;
	/**The attacker */
	attacker: player;
	/**The target */
	target: enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Weapon hit */
export function WeaponHit({
	weaponry,
	attacker,
	target,
	battleLog
}: {
	/**The weapon */
	weaponry: weapon;
	/**The attacker */
	attacker: enemy;
	/**The target */
	target: player;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Weapon hit */
export function WeaponHit({
	weaponry,
	attacker,
	target,
	battleLog
}: {
	/**The weapon */
	weaponry: weapon;
	/**The attacker */
	attacker: player | enemy;
	/**The target */
	target: player | enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	if (!weaponry.getNoEvade() && Math.random() < target.getEvadeChance()) {
		battleLog.push("Evade!");
		return (
			<div className="ion-text-center" key="hit">
				Evade!
			</div>
		);
	}
	battleLog.push("Hit!");
	var hitEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="hit">
			Hit!
		</div>
	];
	var outputText: string;
	target.propDamage(weaponry.getPropDamage());
	if (weaponry.getPropDamage() > 0) {
		battleLog.push(
			(outputText = `${-Math.round(
				100 * weaponry.getPropDamage()
			)}% health`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	} else if (weaponry.getPropDamage() < 0) {
		battleLog.push(
			(outputText = `${-Math.round(
				100 * weaponry.getPropDamage()
			)} % of health recovered`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	}
	if (weaponry.getEffectType()[1] > 1) {
		let healthSteal: number = Math.max(0, target.getHealth());
		let {
			p: p,
			m: m,
			a: a
		} = attacker.applyDamageModifiers(
			weaponry.getFlatDamage(),
			weaponry.getFlatMagicDamage(),
			weaponry.getFlatArmourPiercingDamage()
		);
		let healthLoss: number = target.flatDamage(
			p,
			m,
			a,
			weaponry.getTargetOverHeal()
		);
		if (healthLoss > 0) {
			outputText = `${healthLoss} damage`;
			if (weaponry.getLifeLink()) {
				healthSteal = Math.min(healthSteal, healthLoss);
				if (healthSteal > 0) {
					outputText += ` (attacker is healed for ${healthSteal} by lifelink)`;
					attacker.modifyHealth(healthSteal);
				}
			}
		} else if (healthLoss < 0) {
			outputText = `${-healthLoss} healing`;
		} else {
			outputText = "No damage";
		}
		battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatDamage">
				{outputText}
			</div>
		);
	}
	if (weaponry.getPoison() > 0 || weaponry.getBleed() > 0) {
		outputText = "";
		if (weaponry.getPoison() > 0) {
			if (target.modifyPoison(weaponry.getPoison())) {
				outputText = `+${weaponry.getPoison()} poison, `;
			} else {
				outputText = "Poison resisted, ";
			}
		}
		if (weaponry.getBleed() > 0) {
			if (target.modifyBleed(weaponry.getBleed())) {
				outputText += `+${weaponry.getBleed()} bleed, `;
			} else {
				outputText += "Bleed resisted, ";
			}
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
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
export function spellDeclare(magic: spell, caster: player | enemy): void {
	magic.startCooldown();
	caster.modifyHealth(magic.getHealthChange());
	caster.modifyMana(magic.getManaChange());
	caster.modifyProjectiles(magic.getProjectileChange());
}

/**Spell cast */
export function SpellCast({
	magic,
	caster,
	target,
	timing,
	battleLog
}: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster: player;
	/**The target */
	target: enemy;
	/**Spell timing, 0 is sorcery speed, 3 is counter attack, anything else is a response */
	timing?: 0 | 1 | 2 | 3 | 4;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Spell cast */
export function SpellCast({
	magic,
	caster,
	target,
	timing,
	battleLog
}: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: enemy;
	/**The target */
	target: player;
	/**Spell timing, 0 is sorcery speed, 3 is counter attack, anything else is a response */
	timing?: 0 | 1 | 2 | 3 | 4;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Spell cast */
export function SpellCast({
	magic,
	caster,
	target,
	timing,
	battleLog
}: {
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
	var attackerEffects: React.JSX.Element[] = [];
	var outputText: string;
	if (caster != undefined) {
		if (
			magic.getEffectType()[1] == 1 ||
			magic.getEffectType()[1] == 2 ||
			magic.getEffectType()[0] == 1 ||
			magic.getEffectType()[0] == 2
		) {
			battleLog.push((outputText = "Caster effects:"));
			attackerEffects.push(
				<div className="ion-text-center" key="caster-effects">
					{outputText}
				</div>
			);
		}
		caster.propDamage(magic.getPropSelfDamage());
		if (magic.getPropSelfDamage() > 0) {
			battleLog.push(
				(outputText = `${-Math.round(
					100 * magic.getPropSelfDamage()
				)}% health`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		} else if (magic.getPropSelfDamage() < 0) {
			battleLog.push(
				(outputText = `${-Math.round(
					100 * magic.getPropSelfDamage()
				)}% of health recovered`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="propSelfDamage">
					{outputText}
				</div>
			);
		}
		if (magic.getEffectType()[1] == 1 || magic.getEffectType()[1] == 2) {
			let healthLoss: number = caster.flatDamage(
				magic.getFlatSelfDamage(),
				magic.getFlatSelfMagicDamage(),
				magic.getFlatSelfArmourPiercingDamage(),
				magic.getSelfOverHeal()
			);
			if (healthLoss > 0) {
				outputText = `${healthLoss} damage`;
			} else if (healthLoss < 0) {
				outputText = `${-healthLoss} healing`;
			} else {
				outputText = "No damage";
			}
			battleLog.push(outputText);
			attackerEffects.push(
				<div className="ion-text-center" key="flatSelfDamage">
					{outputText}
				</div>
			);
		}
		if (magic.getEffectType()[0] == 1 || magic.getEffectType()[0] == 2) {
			if (
				magic.getSelfPoison() != 0 ||
				magic.getSelfBleed() != 0 ||
				magic.getTempRegenSelf() != 0
			) {
				outputText = "";
				if (magic.getSelfPoison() != 0) {
					if (caster.modifyPoison(magic.getSelfPoison())) {
						outputText +=
							magic.getSelfPoison() == -255
								? "Poison cured, "
								: `${
										magic.getSelfPoison() > 0 ? "+" : ""
								  }${magic.getSelfPoison()} poison, `;
					} else {
						outputText += "Poison resisted, ";
					}
				}
				if (magic.getSelfBleed() != 0) {
					if (caster.modifyBleed(magic.getSelfBleed())) {
						outputText +=
							magic.getSelfBleed() == -255
								? "Bleed cured, "
								: `${
										magic.getSelfBleed() > 0 ? "+" : ""
								  }${magic.getSelfBleed()} bleed, `;
					} else {
						outputText += "Bleed resisted, ";
					}
				}
				if (magic.getTempRegenSelf() != 0) {
					caster.modifyTempRegen(magic.getTempRegenSelf());
					outputText += `${
						magic.getTempRegenSelf() > 0 ? "+" : ""
					}${magic.getTempRegenSelf()} regeneration, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
				attackerEffects.push(
					<div className="ion-text-center" key="dotSelf">
						{outputText}
					</div>
				);
			}
			if (
				magic.getPoisonResistModifier() != 0 ||
				magic.getBleedResistModifier() != 0
			) {
				outputText = "";
				if (magic.getPoisonResistModifier() != 0) {
					console.log(caster);
					caster.modifyPoisonResist(magic.getPoisonResistModifier());
					console.log(caster);
					outputText += `${
						magic.getPoisonResistModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getPoisonResistModifier()
					)}% poison resist, `;
				}
				if (magic.getBleedResistModifier() != 0) {
					caster.modifyBleedResist(magic.getBleedResistModifier());
					outputText += `${
						magic.getBleedResistModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getBleedResistModifier()
					)}% bleed resist, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
				attackerEffects.push(
					<div className="ion-text-center" key="selfResistModifiers">
						{outputText}
					</div>
				);
			}
			if (
				magic.getMaxHealthModifier() != 0 ||
				magic.getTurnRegenModifier() != 0 ||
				(caster instanceof player &&
					magic.getBattleRegenModifier() != 0)
			) {
				outputText = "";
				if (magic.getMaxHealthModifier() != 0) {
					caster.modifyMaxHealth(magic.getMaxHealthModifier());
					outputText += `${
						magic.getMaxHealthModifier() > 0 ? "+" : ""
					}${magic.getMaxHealthModifier()} max health, `;
				}
				if (magic.getTurnRegenModifier() != 0) {
					caster.modifyTurnRegen(magic.getTurnRegenModifier());
					outputText += `${
						magic.getTurnRegenModifier() > 0 ? "+" : ""
					}${magic.getTurnRegenModifier()} health per turn, `;
				}
				if (
					caster instanceof player &&
					magic.getBattleRegenModifier() != 0
				) {
					caster.modifyBattleRegen(magic.getBattleRegenModifier());
					outputText += `${
						magic.getBattleRegenModifier() > 0 ? "+" : ""
					}${magic.getBattleRegenModifier()} health at end of battle, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
				attackerEffects.push(
					<div className="ion-text-center" key="selfHealthModifiers">
						{outputText}
					</div>
				);
			}
			if (
				magic.getMaxManaModifier() != 0 ||
				magic.getTurnManaRegenModifier() != 0 ||
				(caster instanceof player &&
					magic.getBattleManaRegenModifier() != 0)
			) {
				outputText = "";
				if (magic.getMaxManaModifier() != 0) {
					caster.modifyMaxMana(magic.getMaxManaModifier());
					outputText += `${
						magic.getMaxManaModifier() > 0 ? "+" : ""
					}${magic.getMaxManaModifier()} maximum mana, `;
				}
				if (magic.getTurnManaRegenModifier() != 0) {
					caster.modifyTurnManaRegen(
						magic.getTurnManaRegenModifier()
					);
					outputText += `${
						magic.getTurnManaRegenModifier() > 0 ? "+" : ""
					}${magic.getTurnManaRegenModifier()} mana per turn, `;
				}
				if (
					caster instanceof player &&
					magic.getBattleManaRegenModifier() != 0
				) {
					caster.modifyBattleManaRegen(
						magic.getBattleManaRegenModifier()
					);
					outputText += `${
						magic.getBattleManaRegenModifier() > 0 ? "+" : ""
					}${magic.getBattleManaRegenModifier()} mana at end of battle, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
				attackerEffects.push(
					<div className="ion-text-center" key="selfManaModifiers">
						{outputText}
					</div>
				);
			}
			if (
				magic.getFlatArmourModifier() != 0 ||
				magic.getFlatMagicArmourModifier() != 0
			) {
				outputText = "";
				if (magic.getFlatArmourModifier() != 0) {
					caster.modifyFlatArmour(magic.getFlatArmourModifier());
					outputText += `${
						magic.getFlatArmourModifier() > 0 ? "+" : ""
					}${magic.getFlatArmourModifier()} physical armour, `;
				}
				if (magic.getFlatMagicArmourModifier() != 0) {
					caster.modifyFlatMagicArmour(
						magic.getFlatMagicArmourModifier()
					);
					outputText += `${
						magic.getFlatMagicArmourModifier() > 0 ? "+" : ""
					}${magic.getFlatMagicArmourModifier()} magic armour, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
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
				magic.getPropArmourModifier() != 0 ||
				magic.getPropMagicArmourModifier() != 0
			) {
				outputText = "";
				if (magic.getPropArmourModifier() != 0) {
					caster.modifyPropArmour(magic.getPropArmourModifier());
					outputText += `${
						magic.getPropArmourModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getPropArmourModifier()
					)}% physical damage received, `;
				}
				if (magic.getPropMagicArmourModifier() != 0) {
					caster.modifyPropMagicArmour(
						magic.getPropMagicArmourModifier()
					);
					outputText += `${
						magic.getPropMagicArmourModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getPropMagicArmourModifier()
					)}% magic damage received, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
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
				magic.getFlatDamageModifier() != 0 ||
				magic.getFlatMagicDamageModifier() != 0 ||
				magic.getFlatArmourPiercingDamageModifier() != 0
			) {
				outputText = "";
				if (magic.getFlatDamageModifier() != 0) {
					caster.modifyFlatDamageModifier(
						magic.getFlatDamageModifier()
					);
					outputText += `${
						magic.getFlatDamageModifier() > 0 ? "+" : ""
					}${magic.getFlatDamageModifier()} physical damage dealt, `;
				}
				if (magic.getFlatMagicDamageModifier() != 0) {
					caster.modifyFlatMagicDamageModifier(
						magic.getFlatMagicDamageModifier()
					);
					outputText += `${
						magic.getFlatMagicDamageModifier() > 0 ? "+" : ""
					}${magic.getFlatMagicDamageModifier()} magic damage dealt, `;
				}
				if (magic.getFlatArmourPiercingDamageModifier() != 0) {
					caster.modifyFlatArmourPiercingDamageModifier(
						magic.getFlatArmourPiercingDamageModifier()
					);
					outputText += `${
						magic.getFlatArmourPiercingDamageModifier() > 0
							? "+"
							: ""
					}${magic.getFlatArmourPiercingDamageModifier()} armour piercing damage dealt, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
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
				magic.getPropDamageModifier() != 0 ||
				magic.getPropMagicDamageModifier() != 0 ||
				magic.getPropArmourPiercingDamageModifier() != 0
			) {
				outputText = "";
				if (magic.getPropDamageModifier() != 0) {
					caster.modifyPropDamageModifier(
						magic.getPropDamageModifier()
					);
					outputText += `${
						magic.getPropDamageModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getPropDamageModifier()
					)}% physical damage dealt, `;
				}
				if (magic.getPropMagicDamageModifier() != 0) {
					caster.modifyPropMagicDamageModifier(
						magic.getPropMagicDamageModifier()
					);
					outputText += `${
						magic.getPropMagicDamageModifier() > 0 ? "+" : ""
					}${Math.round(
						100 * magic.getPropMagicDamageModifier()
					)}% magic damage dealt, `;
				}
				if (magic.getPropArmourPiercingDamageModifier() != 0) {
					caster.modifyPropArmourPiercingDamageModifier(
						magic.getPropArmourPiercingDamageModifier()
					);
					outputText += `${
						magic.getPropArmourPiercingDamageModifier() > 0
							? "+"
							: ""
					}${Math.round(
						100 * magic.getPropArmourPiercingDamageModifier()
					)}% armour piercing damage dealt, `;
				}
				battleLog.push((outputText = outputText.slice(0, -2)));
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
		if (magic.getEvadeChanceModifier() != 0) {
			caster.modifyEvadeChance(magic.getEvadeChanceModifier());
			battleLog.push(
				(outputText = `${
					magic.getEvadeChanceModifier() > 0 ? "+" : ""
				}${Math.round(
					100 * magic.getEvadeChanceModifier()
				)}% evade chance`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="selfEvadeChanceModifier">
					{outputText}
				</div>
			);
		}
		if (magic.getCounterAttackChanceModifier() != 0) {
			caster.modifyCounterAttackChance(
				magic.getCounterAttackChanceModifier()
			);
			battleLog.push(
				(outputText = `${
					magic.getCounterAttackChanceModifier() > 0 ? "+" : ""
				}${Math.round(
					100 * magic.getCounterAttackChanceModifier()
				)}% counter attack chance`)
			);
			attackerEffects.push(
				<div
					className="ion-text-center"
					key="selfCounterAttackChanceModifier"
				>
					{outputText}
				</div>
			);
		}
		if (magic.getBonusActionsModifier() != 0) {
			caster.modifyBonusActions(magic.getBonusActionsModifier());
			battleLog.push(
				(outputText = `${
					magic.getBonusActionsModifier() > 0 ? "+" : ""
				}${magic.getBonusActionsModifier()} bonus actions`)
			);
			attackerEffects.push(
				<div className="ion-text-center" key="selfBonusActionModifier">
					{outputText}
				</div>
			);
		}
	}
	if (magic.getEffectType()[0] < 2 || magic.getEffectType()[1] < 2) {
		return <Fragment>{attackerEffects}</Fragment>;
	}
	var targetEffects: React.JSX.Element[] = [
		<div className="ion-text-center" key="target-effects">
			Target effects:
		</div>
	];
	var hits: number;
	switch (timing) {
		case undefined:
		case 0:
			hits = magic.getHitCount();
			break;
		case 3:
			hits = magic.getCounterHits();
			break;
		default:
			hits = magic.getResponseHits();
	}
	for (let i: number = 0; i < hits; i++) {
		targetEffects.push(
			//@ts-expect-error
			<SpellHit
				key={`${magic.getKey()}-${i}`}
				magic={magic}
				caster={caster}
				target={target}
				battleLog={battleLog}
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
function SpellHit({
	magic,
	caster,
	target,
	battleLog
}: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster: player;
	/**The target */
	target: enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Spell hit */
function SpellHit({
	magic,
	caster,
	target,
	battleLog
}: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: enemy;
	/**The target */
	target: player;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element;
/**Spell hit */
function SpellHit({
	magic,
	caster,
	target,
	battleLog
}: {
	/**The spell */
	magic: spell;
	/**The caster */
	caster?: player | enemy;
	/**The target */
	target: player | enemy;
	/**The battle log */
	battleLog: string[];
}): React.JSX.Element {
	var outputText: string;
	var hitEffects: React.JSX.Element[] = [];
	if (!magic.getNoEvade() && Math.random() < target.getEvadeChance()) {
		battleLog.push((outputText = "Evade!"));
		hitEffects.push(
			<div className="ion-text-center" key="hit">
				{outputText}
			</div>
		);
	}
	battleLog.push((outputText = "Hit!"));
	hitEffects.push(
		<div className="ion-text-center" key="hit">
			{outputText}
		</div>
	);
	target.propDamage(magic.getPropDamage());
	if (magic.getPropDamage() > 0) {
		battleLog.push(
			(outputText = `${-Math.round(100 * magic.getPropDamage())}% health`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	} else if (magic.getPropDamage() < 0) {
		battleLog.push(
			(outputText = `${-Math.round(
				100 * magic.getPropDamage()
			)}% of health recovered`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="propDamage">
				{outputText}
			</div>
		);
	}
	if (magic.getEffectType()[1] > 1) {
		let healthSteal: number = Math.max(0, target.getHealth());
		let p: number = magic.getFlatDamage(),
			m: number = magic.getFlatMagicDamage(),
			a: number = magic.getFlatArmourPiercingDamage();
		if (caster != undefined) {
			({p: p, m: m, a: a} = caster.applyDamageModifiers(p, m, m));
		}
		let healthLoss: number = target.flatDamage(
			p,
			m,
			a,
			magic.getTargetOverHeal()
		);
		if (healthLoss > 0) {
			outputText = `${healthLoss} damage`;
			if (caster != undefined && magic.getLifeLink()) {
				healthSteal = Math.min(healthSteal, healthLoss);
				if (healthSteal > 0) {
					outputText += ` (caster is healed for ${healthSteal} by lifelink)`;
					caster.modifyHealth(healthSteal);
				}
			}
		} else if (healthLoss < 0) {
			outputText = `${-healthLoss} healing`;
		} else {
			outputText = "No damage";
		}
		battleLog.push(outputText);
		hitEffects.push(
			<div className="ion-text-center" key="flatDamage">
				{outputText}
			</div>
		);
	}
	if (magic.getEffectType()[0] < 2) {
		return <Fragment>{hitEffects}</Fragment>;
	}
	if (
		magic.getPoison() != 0 ||
		magic.getBleed() != 0 ||
		magic.getTempRegen() != 0
	) {
		outputText = "";
		if (magic.getPoison() != 0) {
			if (target.modifyPoison(magic.getPoison())) {
				outputText += `${
					magic.getPoison() > 0 ? "+" : ""
				}${magic.getPoison()} poison, `;
			} else {
				outputText += "Poison resisted, ";
			}
		}
		if (magic.getBleed() != 0) {
			if (target.modifyBleed(magic.getBleed())) {
				outputText += `${
					magic.getBleed() > 0 ? "+" : ""
				}${magic.getBleed()} bleed, `;
			} else {
				outputText += "Bleed resisted, ";
			}
		}
		if (magic.getTempRegen() != 0) {
			target.modifyTempRegen(magic.getTempRegen());
			outputText += `${
				magic.getTempRegen() > 0 ? "+" : ""
			}${magic.getTempRegen()} regeneration, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="dot">
				{outputText}
			</div>
		);
	}
	if (
		magic.getMaxHealthModifierEnemy() != 0 ||
		magic.getTurnRegenModifierEnemy() ||
		(target instanceof player && magic.getBattleRegenModifierEnemy() != 0)
	) {
		outputText = "";
		if (magic.getMaxHealthModifierEnemy() != 0) {
			target.modifyMaxHealth(magic.getMaxHealthModifierEnemy());
			outputText += `${
				magic.getMaxHealthModifierEnemy() > 0 ? "+" : ""
			}${magic.getMaxHealthModifierEnemy()} maximum health, `;
		}
		if (magic.getTurnRegenModifierEnemy() != 0) {
			target.modifyTurnRegen(magic.getTurnRegenModifierEnemy());
			outputText += `${
				magic.getTurnRegenModifierEnemy() > 0 ? "+" : ""
			}${magic.getTurnRegenModifierEnemy()} health per turn, `;
		}
		if (
			target instanceof player &&
			magic.getBattleRegenModifierEnemy() != 0
		) {
			target.modifyBattleRegen(magic.getBattleRegenModifierEnemy());
			outputText += `${
				magic.getBattleRegenModifierEnemy() > 0 ? "+" : ""
			}${magic.getBattleRegenModifierEnemy()} health at end of battle, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="healthModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getMaxManaModifierEnemy() != 0 ||
		magic.getManaChangeEnemy() != 0 ||
		magic.getTurnManaRegenModifierEnemy() != 0 ||
		(target instanceof player &&
			magic.getBattleManaRegenModifierEnemy() != 0)
	) {
		outputText = "";
		if (magic.getMaxManaModifierEnemy() != 0) {
			target.modifyMaxMana(magic.getMaxManaModifierEnemy());
			outputText += `${
				magic.getMaxManaModifierEnemy() > 0 ? "+" : ""
			}${magic.getMaxManaModifierEnemy()} maximum mana, `;
		}
		if (magic.getManaChangeEnemy() != 0) {
			target.modifyMana(magic.getManaChangeEnemy());
			outputText += `${
				magic.getManaChangeEnemy() > 0 ? "+" : ""
			}${magic.getManaChangeEnemy()} mana, `;
		}
		if (magic.getTurnManaRegenModifierEnemy() != 0) {
			target.modifyTurnManaRegen(magic.getTurnManaRegenModifierEnemy());
			outputText += `${
				magic.getTurnManaRegenModifierEnemy() > 0 ? "+" : ""
			}${magic.getTurnManaRegenModifierEnemy()} mana per turn, `;
		}
		if (
			target instanceof player &&
			magic.getBattleManaRegenModifierEnemy() != 0
		) {
			target.modifyBattleManaRegen(
				magic.getBattleManaRegenModifierEnemy()
			);
			outputText += `${
				magic.getBattleManaRegenModifierEnemy() > 0 ? "+" : ""
			}${magic.getBattleManaRegenModifierEnemy()} mana at end of battle, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="manaModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getPoisonResistModifierEnemy() != 0 ||
		magic.getBleedResistModifierEnemy() != 0
	) {
		outputText = "";
		if (magic.getPoisonResistModifierEnemy() != 0) {
			target.modifyPoisonResist(magic.getPoisonResistModifierEnemy());
			outputText += `${
				magic.getPoisonResistModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPoisonResistModifierEnemy()
			)} poison resist, `;
		}
		if (magic.getBleedResistModifierEnemy() != 0) {
			target.modifyBleedResist(magic.getBleedResistModifierEnemy());
			outputText += `${
				magic.getBleedResistModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getBleedResistModifierEnemy()
			)} bleed resist, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="resistModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getFlatArmourModifierEnemy() != 0 ||
		magic.getFlatMagicArmourModifierEnemy() != 0
	) {
		outputText = "";
		if (magic.getFlatArmourModifierEnemy() != 0) {
			target.modifyFlatArmour(magic.getFlatArmourModifierEnemy());
			outputText += `${
				magic.getFlatArmourModifierEnemy() > 0 ? "+" : ""
			}${magic.getFlatArmourModifierEnemy()} physical armour, `;
		}
		if (magic.getFlatMagicArmourModifierEnemy() != 0) {
			target.modifyFlatMagicArmour(
				magic.getFlatMagicArmourModifierEnemy()
			);
			outputText += `${
				magic.getFlatMagicArmourModifierEnemy() > 0 ? "+" : ""
			}${magic.getFlatMagicArmourModifierEnemy()} magic armour, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="flatArmourModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getPropArmourModifierEnemy() != 0 ||
		magic.getPropMagicArmourModifierEnemy() != 0
	) {
		outputText = "";
		if (magic.getPropArmourModifierEnemy() != 0) {
			target.modifyPropArmour(magic.getPropArmourModifierEnemy());
			outputText += `${
				magic.getPropArmourModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPropArmourModifierEnemy()
			)}% physical damage received, `;
		}
		if (magic.getPropMagicArmourModifierEnemy() != 0) {
			target.modifyPropMagicArmour(
				magic.getPropMagicArmourModifierEnemy()
			);
			outputText += `${
				magic.getPropMagicArmourModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPropMagicArmourModifierEnemy()
			)}% magic damage received, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="propArmourModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getFlatDamageModifierEnemy() != 0 ||
		magic.getFlatMagicDamageModifierEnemy() != 0 ||
		magic.getFlatArmourPiercingDamageModifierEnemy() != 0
	) {
		outputText = "";
		if (magic.getFlatDamageModifierEnemy() != 0) {
			target.modifyFlatDamageModifier(magic.getFlatDamageModifierEnemy());
			outputText += `${
				magic.getFlatDamageModifierEnemy() > 0 ? "+" : ""
			}${magic.getFlatDamageModifierEnemy()} physical damage dealt, `;
		}
		if (magic.getFlatMagicDamageModifierEnemy() != 0) {
			target.modifyFlatMagicDamageModifier(
				magic.getFlatMagicDamageModifierEnemy()
			);
			outputText += `${
				magic.getFlatMagicDamageModifierEnemy() > 0 ? "+" : ""
			}${magic.getFlatMagicDamageModifierEnemy()} magic damage dealt, `;
		}
		if (magic.getFlatArmourPiercingDamageModifierEnemy() != 0) {
			target.modifyFlatArmourPiercingDamageModifier(
				magic.getFlatArmourPiercingDamageModifierEnemy()
			);
			outputText += `${
				magic.getFlatArmourPiercingDamageModifierEnemy() > 0 ? "+" : ""
			}${magic.getFlatArmourPiercingDamageModifierEnemy()} armour piercing damage dealt, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="flatDamageModifiers">
				{outputText}
			</div>
		);
	}
	if (
		magic.getPropDamageModifierEnemy() != 0 ||
		magic.getPropMagicDamageModifierEnemy() != 0 ||
		magic.getPropArmourPiercingDamageModifierEnemy() != 0
	) {
		outputText = "";
		if (magic.getPropDamageModifierEnemy() != 0) {
			target.modifyPropDamageModifier(magic.getPropDamageModifierEnemy());
			outputText += `${
				magic.getPropDamageModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPropDamageModifierEnemy()
			)}% physical damage dealt, `;
		}
		if (magic.getPropMagicDamageModifierEnemy() != 0) {
			target.modifyPropMagicDamageModifier(
				magic.getPropMagicDamageModifierEnemy()
			);
			outputText += `${
				magic.getPropMagicDamageModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPropMagicDamageModifierEnemy()
			)}% magic damage dealt, `;
		}
		if (magic.getPropArmourPiercingDamageModifierEnemy() != 0) {
			target.modifyPropArmourPiercingDamageModifier(
				magic.getPropArmourPiercingDamageModifierEnemy()
			);
			outputText += `${
				magic.getPropArmourPiercingDamageModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getPropArmourPiercingDamageModifierEnemy()
			)}% armour piercing damage dealt, `;
		}
		battleLog.push((outputText = outputText.slice(0, -2)));
		hitEffects.push(
			<div className="ion-text-center" key="propDamageModifiers">
				{outputText}
			</div>
		);
	}

	if (magic.getEvadeChanceModifierEnemy() != 0) {
		target.modifyEvadeChance(magic.getEvadeChanceModifierEnemy());
		battleLog.push(
			(outputText = `${
				magic.getEvadeChanceModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getEvadeChanceModifierEnemy()
			)}% evade chance`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="evadeChanceModifier">
				{outputText}
			</div>
		);
	}
	if (magic.getCounterAttackChanceModifierEnemy() != 0) {
		target.modifyCounterAttackChance(
			magic.getCounterAttackChanceModifierEnemy()
		);
		battleLog.push(
			(outputText = `${
				magic.getCounterAttackChanceModifierEnemy() > 0 ? "+" : ""
			}${Math.round(
				100 * magic.getCounterAttackChanceModifierEnemy()
			)}% counter attack chance`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="counterAttackChanceModifier">
				{outputText}
			</div>
		);
	}
	if (magic.getBonusActionsModifierEnemy() != 0) {
		target.modifyBonusActions(magic.getBonusActionsModifierEnemy());
		battleLog.push(
			(outputText = `${
				magic.getBonusActionsModifierEnemy() > 0 ? "+" : ""
			}${magic.getBonusActionsModifierEnemy()} bonus actions`)
		);
		hitEffects.push(
			<div className="ion-text-center" key="bonusActionModifier">
				{outputText}
			</div>
		);
	}
	return <Fragment>{hitEffects}</Fragment>;
}

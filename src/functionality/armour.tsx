import {useState} from "react";
import {Fragment} from "react";
import {errorMessages, floatFromString, itemKey, numFromString} from "./data";
import armourData from "../data/armour.json";
import {randomInt} from "./rng";
import {
	IonButton,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonModal,
	IonRow,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import {close} from "ionicons/icons";
export class armour {
	protected key: number | undefined;
	protected real: boolean = false;
	protected maxHealthModifier: number | undefined;
	protected maxManaModifier: number | undefined;
	protected turnManaRegenModifier: number | undefined;
	protected battleManaRegenModifier: number | undefined;
	protected turnRegenModifier: number | undefined;
	protected battleRegenModifier: number | undefined;
	protected flatArmourModifier: number | undefined;
	protected propArmourModifier: number | undefined;
	protected flatMagicArmourModifier: number | undefined;
	protected propMagicArmourModifier: number | undefined;
	protected flatDamageModifier: number | undefined;
	protected propDamageModifier: number | undefined;
	protected flatMagicDamageModifier: number | undefined;
	protected propMagicDamageModifier: number | undefined;
	protected flatArmourPiercingDamageModifier: number | undefined;
	protected propArmourPiercingDamageModifier: number | undefined;
	protected evadeChanceModifier: number | undefined;
	protected poisonResistModifier: number | undefined;
	protected bleedResistModifier: number | undefined;
	protected counterAttackChanceModifier: number | undefined;
	protected bonusActionsModifier: number | undefined;
	protected initiativeModifier: number | undefined;
	protected name: string | undefined;
	protected description: string | undefined;
	protected upgrade: string | undefined;
	getKey(): number {
		if (this.key == undefined) {
			this.key = itemKey.gen();
		}
		return this.key;
	}
	getMaxHealthModifier(): number {
		return this.real && this.maxHealthModifier != undefined
			? this.maxHealthModifier
			: 0;
	}
	getMaxManaModifier(): number {
		return this.real && this.maxManaModifier != undefined
			? this.maxManaModifier
			: 0;
	}
	getTurnManaRegenModifier(): number {
		return this.real && this.turnManaRegenModifier != undefined
			? this.turnManaRegenModifier
			: 0;
	}
	getBattleManaRegenModifier(): number {
		return this.real && this.battleManaRegenModifier != undefined
			? this.battleManaRegenModifier
			: 0;
	}
	getTurnRegenModifier(): number {
		return this.real && this.turnRegenModifier != undefined
			? this.turnRegenModifier
			: 0;
	}
	getBattleRegenModifier(): number {
		return this.real && this.battleRegenModifier != undefined
			? this.battleRegenModifier
			: 0;
	}
	getFlatArmourModifier(): number {
		return this.real && this.flatArmourModifier != undefined
			? this.flatArmourModifier
			: 0;
	}
	getPropArmourModifier(): number {
		return this.real && this.propArmourModifier != undefined
			? this.propArmourModifier
			: 0;
	}
	getFlatMagicArmourModifier(): number {
		return this.real && this.flatMagicArmourModifier != undefined
			? this.flatMagicArmourModifier
			: 0;
	}
	getPropMagicArmourModifier(): number {
		return this.real && this.propMagicArmourModifier != undefined
			? this.propMagicArmourModifier
			: 0;
	}
	getFlatDamageModifier(): number {
		return this.real && this.flatDamageModifier != undefined
			? this.flatDamageModifier
			: 0;
	}
	getPropDamageModifier(): number {
		return this.real && this.propDamageModifier != undefined
			? this.propDamageModifier
			: 0;
	}
	getEvadeChanceModifier(): number {
		return this.real && this.evadeChanceModifier != undefined
			? this.evadeChanceModifier
			: 0;
	}
	getPoisonResistModifier(): number {
		return this.real && this.poisonResistModifier != undefined
			? this.poisonResistModifier
			: 0;
	}
	getBleedResistModifier(): number {
		return this.real && this.bleedResistModifier != undefined
			? this.bleedResistModifier
			: 0;
	}
	getName(): string {
		return this.real && this.name != undefined ? this.name : "None";
	}
	getDescription(): string {
		return this.description ?? "";
	}
	getFlatMagicDamageModifier(): number {
		return this.real && this.flatMagicDamageModifier != undefined
			? this.flatMagicDamageModifier
			: 0;
	}
	getPropMagicDamageModifier(): number {
		return this.real && this.propMagicDamageModifier != undefined
			? this.propMagicDamageModifier
			: 0;
	}
	getFlatArmourPiercingDamageModifier(): number {
		return this.real && this.flatArmourPiercingDamageModifier != undefined
			? this.flatArmourPiercingDamageModifier
			: 0;
	}
	getPropArmourPiercingDamageModifier(): number {
		return this.real && this.propArmourPiercingDamageModifier != undefined
			? this.propArmourPiercingDamageModifier
			: 0;
	}
	getCounterAttackChanceModifier(): number {
		return this.real && this.counterAttackChanceModifier != undefined
			? this.counterAttackChanceModifier
			: 0;
	}
	getBonusActionsModifier(): number {
		return this.real && this.bonusActionsModifier != undefined
			? this.bonusActionsModifier
			: 0;
	}
	getReal(): boolean {
		return this.real;
	}
	getInitiativeModifier(): number {
		return this.real && this.initiativeModifier != undefined
			? this.initiativeModifier
			: 0;
	}
	getUpgrade(): string {
		return this.upgrade ?? "EMPTY";
	}
	armourType(): string {
		return "none";
	}
	constructor(blueprint: string | armour = "EMPTY") {
		if (typeof blueprint == "string") {
			this.loadFromFile(blueprint);
		} else {
			this.real = blueprint.real;
			this.key = blueprint.key;
			if (this.real) {
				this.maxHealthModifier = blueprint.maxHealthModifier;
				this.maxManaModifier = blueprint.maxManaModifier;
				this.turnManaRegenModifier = blueprint.turnManaRegenModifier;
				this.battleManaRegenModifier =
					blueprint.battleManaRegenModifier;
				this.turnRegenModifier = blueprint.turnRegenModifier;
				this.battleRegenModifier = blueprint.battleRegenModifier;
				this.flatArmourModifier = blueprint.flatArmourModifier;
				this.propArmourModifier = blueprint.propArmourModifier;
				this.flatMagicArmourModifier =
					blueprint.flatMagicArmourModifier;
				this.propMagicArmourModifier =
					blueprint.propMagicArmourModifier;
				this.flatDamageModifier = blueprint.flatDamageModifier;
				this.propDamageModifier = blueprint.propDamageModifier;
				this.flatMagicDamageModifier =
					blueprint.flatMagicDamageModifier;
				this.propMagicDamageModifier =
					blueprint.propMagicDamageModifier;
				this.flatArmourPiercingDamageModifier =
					blueprint.flatArmourPiercingDamageModifier;
				this.propArmourPiercingDamageModifier =
					blueprint.propArmourPiercingDamageModifier;
				this.evadeChanceModifier = blueprint.evadeChanceModifier;
				this.poisonResistModifier = blueprint.poisonResistModifier;
				this.bleedResistModifier = blueprint.bleedResistModifier;
				this.counterAttackChanceModifier =
					blueprint.counterAttackChanceModifier;
				this.bonusActionsModifier = blueprint.bonusActionsModifier;
				this.initiativeModifier = blueprint.initiativeModifier;
				this.name = blueprint.name;
				this.description = blueprint.description;
				this.upgrade = blueprint.upgrade;
			}
		}
	}
	loadFromFile(blueprint: string = "EMPTY"): void {
		this.real = false;
		this.key =
			this.maxHealthModifier =
			this.maxManaModifier =
			this.turnManaRegenModifier =
			this.battleManaRegenModifier =
			this.turnRegenModifier =
			this.battleRegenModifier =
			this.flatArmourModifier =
			this.propArmourModifier =
			this.flatMagicArmourModifier =
			this.propMagicArmourModifier =
			this.flatDamageModifier =
			this.propDamageModifier =
			this.flatMagicDamageModifier =
			this.propMagicDamageModifier =
			this.flatArmourPiercingDamageModifier =
			this.propArmourPiercingDamageModifier =
			this.evadeChanceModifier =
			this.poisonResistModifier =
			this.bleedResistModifier =
			this.counterAttackChanceModifier =
			this.bonusActionsModifier =
			this.initiativeModifier =
			this.name =
			this.description =
			this.upgrade =
				undefined;
		if (blueprint == "EMPTY") {
			return;
		}
		const type: string = this.armourType();
		try {
			//@ts-expect-error
			let selectedArmour = armourData[type][blueprint];
			if (selectedArmour == undefined) {
				throw 2;
			}
			for (let i: number = 0; Array.isArray(selectedArmour); i++) {
				if (i == 10) {
					throw 9;
				}
				if (selectedArmour.length == 0) {
					throw 5;
				}
				blueprint = selectedArmour[randomInt(0, selectedArmour.length)];
				if (blueprint == "EMPTY") {
					return;
				} else if (typeof blueprint != "string") {
					throw 1;
				}
				//@ts-expect-error
				selectedArmour = armourData[type][blueprint];
				if (selectedArmour == undefined) {
					throw 2;
				}
			}
			this.real = true;
			switch (typeof selectedArmour.maxHealthModifier) {
				case "number":
					this.maxHealthModifier =
						Math.trunc(selectedArmour.maxHealthModifier) ||
						undefined;
					break;
				case "string":
					this.maxHealthModifier =
						numFromString(selectedArmour.maxHealthModifier).value ||
						undefined;
			}
			switch (typeof selectedArmour.maxManaModifier) {
				case "number":
					this.maxManaModifier =
						Math.trunc(selectedArmour.maxManaModifier) || undefined;
					break;
				case "string":
					this.maxManaModifier =
						numFromString(selectedArmour.maxManaModifier).value ||
						undefined;
			}
			switch (typeof selectedArmour.turnManaRegenModifier) {
				case "number":
					this.turnManaRegenModifier =
						Math.trunc(selectedArmour.turnManaRegenModifier) ||
						undefined;
					break;
				case "string":
					this.turnManaRegenModifier =
						numFromString(selectedArmour.turnManaRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.battleManaRegenModifier) {
				case "number":
					this.battleManaRegenModifier =
						Math.trunc(selectedArmour.battleManaRegenModifier) ||
						undefined;
					break;
				case "string":
					this.battleManaRegenModifier =
						numFromString(selectedArmour.battleManaRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.turnRegenModifier) {
				case "number":
					this.turnRegenModifier =
						Math.trunc(selectedArmour.turnRegenModifier) ||
						undefined;
					break;
				case "string":
					this.turnRegenModifier =
						numFromString(selectedArmour.turnRegenModifier).value ||
						undefined;
			}
			switch (typeof selectedArmour.battleRegenModifier) {
				case "number":
					this.battleRegenModifier =
						Math.trunc(selectedArmour.battleRegenModifier) ||
						undefined;
					break;
				case "string":
					this.battleRegenModifier =
						numFromString(selectedArmour.battleRegenModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.flatArmourModifier) {
				case "number":
					this.flatArmourModifier =
						Math.trunc(selectedArmour.flatArmourModifier) ||
						undefined;
					break;
				case "string":
					this.flatArmourModifier =
						numFromString(selectedArmour.flatArmourModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.propArmourModifier) {
				case "number":
					this.propArmourModifier =
						selectedArmour.propArmourModifier || undefined;
					break;
				case "string":
					this.propArmourModifier =
						floatFromString(selectedArmour.propArmourModifier)
							.value || undefined;
			}
			if (
				this.propArmourModifier != undefined &&
				this.propArmourModifier < -1
			) {
				this.propArmourModifier = -1;
			}
			switch (typeof selectedArmour.flatMagicArmourModifier) {
				case "number":
					this.flatMagicArmourModifier =
						Math.trunc(selectedArmour.flatMagicArmourModifier) ||
						undefined;
					break;
				case "string":
					this.flatMagicArmourModifier =
						numFromString(selectedArmour.flatMagicArmourModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.propMagicArmourModifier) {
				case "number":
					this.propMagicArmourModifier =
						selectedArmour.propMagicArmourModifier || undefined;
					break;
				case "string":
					this.propMagicArmourModifier =
						floatFromString(selectedArmour.propMagicArmourModifier)
							.value || undefined;
			}
			if (
				this.propMagicArmourModifier != undefined &&
				this.propMagicArmourModifier < -1
			) {
				this.propMagicArmourModifier = -1;
			}
			switch (typeof selectedArmour.flatDamageModifier) {
				case "number":
					this.flatDamageModifier =
						Math.trunc(selectedArmour.flatDamageModifier) ||
						undefined;
					break;
				case "string":
					this.flatDamageModifier =
						numFromString(selectedArmour.flatDamageModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.propDamageModifier) {
				case "number":
					this.propDamageModifier =
						selectedArmour.propDamageModifier || undefined;
					break;
				case "string":
					this.propDamageModifier =
						floatFromString(selectedArmour.propDamageModifier)
							.value || undefined;
			}
			if (
				this.propDamageModifier != undefined &&
				this.propDamageModifier < -1
			) {
				this.propDamageModifier = -1;
			}
			switch (typeof selectedArmour.flatMagicDamageModifier) {
				case "number":
					this.flatMagicDamageModifier =
						Math.trunc(selectedArmour.flatMagicDamageModifier) ||
						undefined;
					break;
				case "string":
					this.flatMagicDamageModifier =
						numFromString(selectedArmour.flatMagicDamageModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.propMagicDamageModifier) {
				case "number":
					this.propMagicDamageModifier =
						selectedArmour.propMagicDamageModifier || undefined;
					break;
				case "string":
					this.propMagicDamageModifier =
						floatFromString(selectedArmour.propMagicDamageModifier)
							.value || undefined;
			}
			if (
				this.propMagicDamageModifier != undefined &&
				this.propMagicDamageModifier < -1
			) {
				this.propMagicDamageModifier = -1;
			}
			switch (typeof selectedArmour.flatArmourPiercingDamageModifier) {
				case "number":
					this.flatArmourPiercingDamageModifier =
						Math.trunc(
							selectedArmour.flatArmourPiercingDamageModifier
						) || undefined;
					break;
				case "string":
					this.flatArmourPiercingDamageModifier =
						numFromString(
							selectedArmour.flatArmourPiercingDamageModifier
						).value || undefined;
			}
			switch (typeof selectedArmour.propArmourPiercingDamageModifier) {
				case "number":
					this.propArmourPiercingDamageModifier =
						selectedArmour.propArmourPiercingDamageModifier ||
						undefined;
					break;
				case "string":
					this.propArmourPiercingDamageModifier =
						floatFromString(
							selectedArmour.propArmourPiercingDamageModifier
						).value || undefined;
			}
			if (
				this.propArmourPiercingDamageModifier != undefined &&
				this.propArmourPiercingDamageModifier < -1
			) {
				this.propArmourPiercingDamageModifier = -1;
			}
			switch (typeof selectedArmour.evadeChanceModifier) {
				case "number":
					this.evadeChanceModifier =
						selectedArmour.evadeChanceModifier || undefined;
					break;
				case "string":
					this.evadeChanceModifier =
						floatFromString(selectedArmour.evadeChanceModifier)
							.value || undefined;
			}
			if (
				this.evadeChanceModifier != undefined &&
				this.evadeChanceModifier < -1
			) {
				this.evadeChanceModifier = -1;
			}
			switch (typeof selectedArmour.poisonResistModifier) {
				case "number":
					this.poisonResistModifier =
						selectedArmour.poisonResistModifier || undefined;
					break;
				case "string":
					this.poisonResistModifier =
						floatFromString(selectedArmour.poisonResistModifier)
							.value || undefined;
			}
			if (
				this.poisonResistModifier != undefined &&
				this.poisonResistModifier < -1
			) {
				this.poisonResistModifier = -1;
			}
			switch (typeof selectedArmour.bleedResistModifier) {
				case "number":
					this.bleedResistModifier =
						selectedArmour.bleedResistModifier || undefined;
					break;
				case "string":
					this.bleedResistModifier =
						floatFromString(selectedArmour.bleedResistModifier)
							.value || undefined;
			}
			if (
				this.bleedResistModifier != undefined &&
				this.bleedResistModifier < -1
			) {
				this.bleedResistModifier = -1;
			}
			switch (typeof selectedArmour.counterAttackChanceModifier) {
				case "number":
					this.counterAttackChanceModifier =
						selectedArmour.counterAttackChanceModifier || undefined;
					break;
				case "string":
					this.counterAttackChanceModifier =
						floatFromString(
							selectedArmour.counterAttackChanceModifier
						).value || undefined;
			}
			if (
				this.counterAttackChanceModifier != undefined &&
				this.counterAttackChanceModifier < -1
			) {
				this.counterAttackChanceModifier = -1;
			}
			switch (typeof selectedArmour.bonusActionsModifier) {
				case "number":
					this.bonusActionsModifier =
						Math.trunc(selectedArmour.bonusActionsModifier) ||
						undefined;
					break;
				case "string":
					this.bonusActionsModifier =
						numFromString(selectedArmour.bonusActionsModifier)
							.value || undefined;
			}
			switch (typeof selectedArmour.initiativeModifier) {
				case "number":
					this.initiativeModifier =
						Math.trunc(selectedArmour.initiativeModifier) ||
						undefined;
					break;
				case "string":
					this.initiativeModifier =
						numFromString(selectedArmour.initiativeModifier)
							.value || undefined;
			}
			if (typeof selectedArmour.name == "string") {
				this.name = selectedArmour.name || undefined;
			}
			if (typeof selectedArmour.description == "string") {
				this.description = selectedArmour.description || undefined;
			}
			if (typeof selectedArmour.upgrade == "string") {
				this.upgrade = selectedArmour.upgrade || undefined;
			}
			return;
		} catch (err) {
			switch (err) {
				case 1:
					errorMessages.push(
						`Unable to parse ${type.toLowerCase()} armour blueprint ${blueprint}`
					);
					break;
				case 2:
					errorMessages.push(
						`Unable to find ${type.toLowerCase()} armour blueprint ${blueprint}`
					);
					break;
				case 5:
					errorMessages.push(
						`${type.toLowerCase()} armour blueprint list ${blueprint} is empty`
					);
					break;
				case 9:
					errorMessages.push(
						`Exceeded maximum list depth loading ${type.toLowerCase()} armour blueprint ${blueprint}`
					);
					break;
				default:
					throw err;
			}
			return;
		}
	}
}
/**Displays the armour's inventory panel */
export function DisplayArmourName(props: {
	/**The piece of armour */
	armourPiece: armour;
}): JSX.Element {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	let type: string;
	switch (props.armourPiece.armourType()) {
		case "HEAD":
			type = "Head";
			break;
		case "TORSO":
			type = "Torso";
			break;
		case "LEGS":
			type = "Legs";
			break;
		case "FEET":
			type = "Feet";
			break;
		default:
			type = "";
	}
	return (
		<Fragment>
			<IonItem lines="none">
				<IonLabel>
					{type}: {props.armourPiece.getName()}
				</IonLabel>
				{props.armourPiece.getReal() ? (
					<IonButton
						mode="ios"
						slot="end"
						onClick={() => setIsOpen(true)}
					>
						Stats
					</IonButton>
				) : null}
			</IonItem>
			<IonModal isOpen={isOpen} backdropDismiss={false}>
				<IonHeader>
					<IonToolbar className="ion-text-center">
						<IonGrid className="ion-no-padding">
							<IonRow>
								<IonCol size="1">
									<IonButton
										size="small"
										onClick={() => setIsOpen(false)}
										fill="clear"
										color="dark"
									>
										<IonIcon
											slot="icon-only"
											icon={close}
										></IonIcon>
									</IonButton>
								</IonCol>
								<IonCol size="10">
									<IonTitle>
										{props.armourPiece.getName()}
									</IonTitle>
								</IonCol>
							</IonRow>
						</IonGrid>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<DisplayArmourStats armourPiece={props.armourPiece} />
				</IonContent>
			</IonModal>
		</Fragment>
	);
}
/**Displays armour's stats */
export function DisplayArmourStats(props: {
	/**The armour piece */
	armourPiece: armour;
}): JSX.Element {
	const type: string = props.armourPiece.armourType();
	return (
		<IonList className="ion-text-center">
			<IonListHeader>{props.armourPiece.getDescription()}</IonListHeader>
			{props.armourPiece.getMaxHealthModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getMaxHealthModifier() > 0 ? "+" : null}
					{props.armourPiece.getMaxHealthModifier()} maximum health
				</IonItem>
			) : null}
			{props.armourPiece.getTurnRegenModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getTurnRegenModifier() > 0 ? "+" : null}
					{props.armourPiece.getTurnRegenModifier()} health
					regeneration per turn
				</IonItem>
			) : null}
			{props.armourPiece.getBattleRegenModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getBattleRegenModifier() > 0
						? "+"
						: null}
					{props.armourPiece.getBattleRegenModifier()} health
					regeneration at end of battle
				</IonItem>
			) : null}
			{props.armourPiece.getMaxManaModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getMaxManaModifier() > 0 ? "+" : null}
					{props.armourPiece.getMaxManaModifier()} maximum mana
				</IonItem>
			) : null}
			{props.armourPiece.getTurnManaRegenModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getTurnManaRegenModifier() > 0
						? "+"
						: null}
					{props.armourPiece.getTurnManaRegenModifier()} mana
					regeneration per turn
				</IonItem>
			) : null}
			{props.armourPiece.getBattleManaRegenModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getBattleManaRegenModifier() > 0
						? "+"
						: null}
					{props.armourPiece.getBattleManaRegenModifier()} mana
					regeneration at end of battle
				</IonItem>
			) : null}
			{props.armourPiece.getFlatArmourModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getFlatArmourModifier() > 0 ? "+" : null}
					{props.armourPiece.getFlatArmourModifier()} physical armour
					rating
				</IonItem>
			) : null}
			{props.armourPiece.getPropArmourModifier() != 0 ? (
				<IonItem>
					Incoming physical damage{" "}
					{props.armourPiece.getPropArmourModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getPropArmourModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getFlatMagicArmourModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getFlatMagicArmourModifier() > 0
						? "+"
						: null}
					{props.armourPiece.getFlatMagicArmourModifier()} magic
					armour rating
				</IonItem>
			) : null}
			{props.armourPiece.getPropMagicArmourModifier() != 0 ? (
				<IonItem>
					Incoming magic damage{" "}
					{props.armourPiece.getPropMagicArmourModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getPropMagicArmourModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getFlatDamageModifier() != 0 ? (
				<IonItem>
					Deal {Math.abs(props.armourPiece.getFlatDamageModifier())}{" "}
					{props.armourPiece.getFlatDamageModifier() > 0
						? "more"
						: "less"}{" "}
					physical damage
				</IonItem>
			) : null}
			{props.armourPiece.getPropDamageModifier() != 0 ? (
				<IonItem>
					Physical damage{" "}
					{props.armourPiece.getPropDamageModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getPropDamageModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getFlatMagicDamageModifier() != 0 ? (
				<IonItem>
					Deal{" "}
					{Math.abs(props.armourPiece.getFlatMagicDamageModifier())}{" "}
					{props.armourPiece.getFlatMagicDamageModifier() > 0
						? "more"
						: "less"}{" "}
					magic damage
				</IonItem>
			) : null}
			{props.armourPiece.getPropMagicDamageModifier() != 0 ? (
				<IonItem>
					Magic damage{" "}
					{props.armourPiece.getPropMagicDamageModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getPropMagicDamageModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getFlatArmourPiercingDamageModifier() != 0 ? (
				<IonItem>
					Deal{" "}
					{Math.abs(
						props.armourPiece.getFlatArmourPiercingDamageModifier()
					)}{" "}
					{props.armourPiece.getFlatArmourPiercingDamageModifier() > 0
						? "more"
						: "less"}{" "}
					armour piercing damage
				</IonItem>
			) : null}
			{props.armourPiece.getPropArmourPiercingDamageModifier() != 0 ? (
				<IonItem>
					Armour piercing damage{" "}
					{props.armourPiece.getPropArmourPiercingDamageModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 *
								props.armourPiece.getPropArmourPiercingDamageModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getPoisonResistModifier() != 0 ? (
				<IonItem>
					Poison resistance{" "}
					{props.armourPiece.getPoisonResistModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getPoisonResistModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getBleedResistModifier() != 0 ? (
				<IonItem>
					Bleed resistance{" "}
					{props.armourPiece.getBleedResistModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getBleedResistModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getEvadeChanceModifier() != 0 ? (
				<IonItem>
					Evade chance{" "}
					{props.armourPiece.getEvadeChanceModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 * props.armourPiece.getEvadeChanceModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getCounterAttackChanceModifier() != 0 ? (
				<IonItem>
					Counter attack chance{" "}
					{props.armourPiece.getCounterAttackChanceModifier() > 0
						? "increased"
						: "reduced"}{" "}
					by{" "}
					{Math.abs(
						Math.round(
							100 *
								props.armourPiece.getCounterAttackChanceModifier()
						)
					)}
					%
				</IonItem>
			) : null}
			{props.armourPiece.getBonusActionsModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getBonusActionsModifier() > 0
						? "+"
						: null}
					{props.armourPiece.getBonusActionsModifier()} bonus action
					{props.armourPiece.getBonusActionsModifier() != 1
						? "s"
						: null}{" "}
					each turn
				</IonItem>
			) : null}
			{props.armourPiece.getInitiativeModifier() != 0 ? (
				<IonItem>
					{props.armourPiece.getInitiativeModifier() > 0 ? "+" : null}
					{props.armourPiece.getInitiativeModifier()} initiative
				</IonItem>
			) : null}
		</IonList>
	);
}
export class armourHead extends armour {
	armourType(): string {
		return "HEAD";
	}
}

export class armourTorso extends armour {
	armourType(): string {
		return "TORSO";
	}
}

export class armourLegs extends armour {
	armourType(): string {
		return "LEGS";
	}
}

export class armourFeet extends armour {
	armourType(): string {
		return "FEET";
	}
}

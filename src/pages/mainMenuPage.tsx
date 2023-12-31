import {
	IonButton,
	IonContent,
	IonFooter,
	IonHeader,
	IonPage,
	IonTitle
} from "@ionic/react";

export function MainMenuPage(): React.JSX.Element {
	return (
		<IonPage>
			<IonHeader className="main-menu-header ion-text-center">
				<IonTitle color="primary" className="main-menu-title">
					Adventure Game
				</IonTitle>
			</IonHeader>
			<IonContent>
				<IonButton size="large" mode="ios">
					Adventure Mode
				</IonButton>
				<IonButton size="large" mode="ios">
					Battle Mode
				</IonButton>
				<IonButton
					size="large"
					mode="ios"
					routerLink="/debug_mode"
					routerDirection="none"
				>
					Debug
				</IonButton>
			</IonContent>
			<IonFooter className="main-menu-footer">
				<IonTitle>Made by Fluffy the Destroyer</IonTitle>
			</IonFooter>
		</IonPage>
	);
}

import {
	IonButton,
	IonContent,
	IonFooter,
	IonHeader,
	IonPage,
	IonTitle,
} from "@ionic/react";
import React, {Fragment} from "react";

const MainMenuPage: React.FC = () => {
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
};

export default MainMenuPage;

import {IonApp, IonRouterOutlet, setupIonicReact} from "@ionic/react";
import {IonReactRouter} from "@ionic/react-router";
import MainMenuPage from "./pages/mainMenu.page";
import {Redirect, Route} from "react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/main.css";
import {DebugPage} from "./pages/debugPage";

/*Error codes:
	0: Unspecified, no further error messages should be shown
	1: Bad JSON structure
	2: Unable to find specified item
	3: Loading empty slot
	5: Empty list
	6: Accessing slot out of range
	7: Attempting to choose from empty set
	8: Variable limit reached
	9: Too many lists trying to load item
*/

setupIonicReact();
const App: React.FC = () => {
	return (
		<IonApp>
			<IonReactRouter>
				<IonRouterOutlet>
					<Route path="/main_menu">
						<MainMenuPage />
					</Route>
					<Route path="/debug_mode">
						<DebugPage />
					</Route>
					<Redirect exact from="/" to="/main_menu" />
				</IonRouterOutlet>
			</IonReactRouter>
		</IonApp>
	);
};

export default App;

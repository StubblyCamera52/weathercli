import { Button, Label, TextInput, ToggleButton, TuiApp, TuiContainer, type TuiEvent } from "../renderer/tui";
import { saveConfig } from "../utils/config";


export function onboardingUI() {
  let userLatitude = "";
  let userLongitude = "";
  let userPrefersCelcius = true;

  const root = new TuiContainer("root", "column", 2, {});
  const titleLabel = new Label("titlelabel", {label: "Update Settings"});
  const instructionsLabel = new Label("instructionsLabel", {label: "tab to focus next - shift-tab to focus previous"});
  const latInput = new TextInput("latitudeinput", {
    placeholder: "Your Latitude",
    value: '',
    focusable: true,
    onChange: v => {userLatitude = v},
    onSubmit: v => {},
  });
  const longInput = new TextInput("longitudeinput", {
    placeholder: "Your Longitude",
    value: '',
    focusable: true,
    onChange: v => {userLongitude = v},
    onSubmit: v => {},
  });
  const useCelciusButton = new ToggleButton("usecelciusbutton", {
    label: "Use celius?",
    defaultState: true,
    onToggle(state) {
      userPrefersCelcius = state;
    },
  });
  const saveButton = new Button("savebutton", {
    label: "Save Settings",
    onPress() {
      saveConfig({lat: parseFloat(userLatitude), long: parseFloat(userLongitude), uses_celcius: userPrefersCelcius});
    },
  })
  
  root.addChild(titleLabel);
  root.addChild(instructionsLabel);
  root.addChild(latInput);
  root.addChild(longInput);
  root.addChild(useCelciusButton);
  root.addChild(saveButton);

  const app = new TuiApp(root);

  app.regenerateFocusOrder();

  const originalDispatch = app.dispatch.bind(app);
  app.dispatch = (event: TuiEvent) => {
    if (event.type == "key") {
      if (event.key == "tab") {
        app.focusNext();
        app.render();
        return;
      } else if (event.key == "escape" || event.key == "ctrlc") {
        app.stop();
        return;
      } else if (event.key == "shifttab") {
        app.focusPrev();
        app.render();
        return;
      }
    }
    originalDispatch(event);
  };

  app.start();
}

onboardingUI();
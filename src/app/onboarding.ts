import {
  TuiContainer,
  Label,
  TextInput,
  ToggleButton,
  Button,
  TuiApp,
  type TuiEvent,
} from "../renderer/tui.js";
import { saveConfig } from "../utils/config.js";

export class OnboardingUI extends TuiApp {
  constructor() {
    let userLatitude = "";
    let userLongitude = "";
    let userPrefersCelcius = true;

    const root = new TuiContainer("root", "column", 2, {});
    super(root);

    let thing = this;

    const titleLabel = new Label("titlelabel", { label: "Update Settings" });
    const instructionsLabel = new Label("instructionsLabel", {
      label: "tab to focus next - shift-tab to focus previous",
    });

    const latInput = new TextInput("latitudeinput", {
      placeholder: "Your Latitude",
      value: "",
      focusable: true,
      onChange: (v) => {
        userLatitude = v;
      },
      onSubmit: (v) => {},
    });

    const longInput = new TextInput("longitudeinput", {
      placeholder: "Your Longitude",
      value: "",
      focusable: true,
      onChange: (v) => {
        userLongitude = v;
      },
      onSubmit: (v) => {},
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
        saveConfig({
          lat: parseFloat(userLatitude),
          long: parseFloat(userLongitude),
          uses_celcius: userPrefersCelcius,
        });

        thing.stop();
      },
    });

    root.addChild(titleLabel);
    root.addChild(instructionsLabel);
    root.addChild(latInput);
    root.addChild(longInput);
    root.addChild(useCelciusButton);
    root.addChild(saveButton);

    this.regenerateFocusOrder();
  }

  override dispatch(event: TuiEvent): void {
    if (event.type == "key") {
      if (event.key == "tab") {
        this.focusNext();
        this.render();
        return;
      } else if (event.key == "escape" || event.key == "ctrlc") {
        this.stop();
        return;
      } else if (event.key == "shifttab") {
        this.focusPrev();
        this.render();
        return;
      }
    }
    super.dispatch(event);
  }
}

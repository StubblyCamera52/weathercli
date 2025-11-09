export type TuiEvent =
  | { type: "key"; key: string, ctrl: boolean }
  | { type: "focus" | "blur" }
  | { type: "resize"};

export interface TuiComponentProps {
  id?: string;
  x?: number;
  y?: number;
  width?: number | "auto";
  height?: number | "auto";
  focused?: boolean;
  focusable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onEvent?: (event: TuiEvent) => void;
}

abstract class TuiComponent {
  id: string;
  props: TuiComponentProps;
  focused: boolean = false;
  parent: TuiContainer | null = null;

  constructor(id: string, props: TuiComponentProps = {}) {
    this.id = id;
    this.props = props;
  }

  setFocus(focus: boolean) {
    if (focus == this.focused) return;
    this.focused = focus;
    if (focus) this.props.onFocus?.();
    else this.props.onBlur?.();
  }

  abstract render(width: number): string[];
  abstract handleEvent(event: TuiEvent): boolean; // returns true if the event was consumed
  // pads or truncates lines to prevent ui bugs
  protected fitLine(line: string, width: number): string {
    if (width <= 0) return "";
    return line.length > width ? line.slice(0, width) : line + " ".repeat(Math.max(0, width - line.length));
  }
}

class TuiContainer extends TuiComponent {
  children: TuiComponent[] = [];
  direction: "row" | "column";
  spacing: number;

  constructor(id: string, direction: "row" | "column" = "column", spacing = 0, props: TuiComponentProps = {}) {
    super(id, props);
    this.direction = direction;
    this.spacing = spacing;
  }

  addChild(child: TuiComponent) {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(id: string) {
    // filters the array to remove the specific child
    this.children = this.children.filter((child) => {
      if (child.id == id) {
        child.parent = null;
        return false;
      }
      return true;
    });
  }

  render(width: number) {
    let lines: string[] = [];

    if (this.direction == "column") {
      this.children.forEach((child, idx) => {
        lines.push(...child.render(width));
        if (this.spacing > 0 && idx < this.children.length - 1) {
          // ill modify this to support higher spacing later
          lines.push(" ".repeat(Math.max(0, width)));
        }
      });
    } else {
      const numChildren = this.children.length || 1;
      const individualChildWidth = Math.floor(width/numChildren);
      const childRenders = this.children.map((child) => child.render(individualChildWidth));
      const maxHeight = Math.max(...childRenders.map(strArr => strArr.length)); // height of the tallest child
      
      for (let row = 0; row < maxHeight; row++) {
        let line = "";
        for (let i = 0; i < numChildren; i++) {
          const chunk = childRenders[i]![row] ?? "";
          line += this.fitLine(chunk, individualChildWidth);
        }
        lines.push(this.fitLine(line, width));
      }
    }

    return lines;
  }

  handleEvent(event: TuiEvent): boolean {
    // pass to focused child first
    const focused = this.children.find(child => child.focused);
    if (focused) {
      // if the event was consumed we want to pass that up the tree
      if (focused.handleEvent(event)) return true;
    }

    // same as before but since the focused child didnt consume we pass it down the list of children
    for (const child of this.children) {
      if (child.handleEvent(event)) return true;
    }

    return false; // none of our children consumed the event
  }
}

interface TextInputProps extends TuiComponentProps {
  value?: string;
  placeholder?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

class TextInput extends TuiComponent {
  override props: TextInputProps;
  cursor = 0;
  buffer: string;

  constructor(id: string, props: TextInputProps = {}) {
    super(id, props);
    this.props = props;
    this.buffer = props.value ?? "";
    this.cursor = this.buffer.length;
  }

  render(width: number) {
    const minW = Math.max(10, width);
    let display = this.buffer;

    // for scrolling display when the buffer is larger that the available area
    if (display.length > minW-2) {
      const start = Math.max(0, this.cursor - (minW - 3));
      display = display.slice(start, start + (minW-2));
    }

    const placeholder = this.props.placeholder ?? "";
    const content = display.length ? display : placeholder; // if length is 0, user hasnt typed aything so display the placehodler
    const cursorPos = Math.min(this.cursor, content.length);

    let line = `[${content}]`;
    line = this.fitLine(line, minW);

    if (this.focused) {
      const before = `[${content.slice(0, cursorPos)}`;
      const at = content[cursorPos] ?? " ";
      const after = content.slice(cursorPos + 1);
      const rebuiltString = before + at + after + "]";
      const caretLine = " ".repeat(before.length) + "^";
      return [this.fitLine(rebuiltString, minW), this.fitLine(caretLine, minW)];
    } else {
      return [this.fitLine(line, minW)];
    }
  }

  handleEvent(event: TuiEvent): boolean {
    // we dont care about anything but keyboard events and also only when we are in focus
    if (event.type != "key") return false;
    if (!this.focused) return false;
    const key = event.key;

    switch (key) {
      case "left":
        if (this.cursor > 0) this.cursor--;
        return true;
      case "right":
        if (this.cursor < this.buffer.length) this.cursor++;
        return true;
      case "backspace":
        if (this.cursor > 0) {
          this.buffer = this.buffer.slice(0, this.cursor-1) + this.buffer.slice(this.cursor);
          this.cursor--;
          this.props.onChange?.(this.buffer);
        }
        return true;
      case "enter":
        this.props.onSubmit?.(this.buffer);
        return true;
      default:
        if (key.length == 1 && !event.ctrl) {
          if (this.props.maxLength && this.buffer.length >= this.props.maxLength) return true;
          this.buffer = this.buffer.slice(0, this.cursor) + key + this.buffer.slice(this.cursor);
          this.cursor++;
          this.props.onChange?.(this.buffer);
          return true;
        }
        return false;
    }
  }
}

// add button and radio later

interface ButtonProps extends TuiComponentProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}

class Button extends TuiComponent {
  override props: ButtonProps;
  
  constructor(id: string, props: ButtonProps) {
    super(id, props);
    this.props = props;
    this.props.focusable = props.focusable ?? true;
  }

  render(width: number) {
    const label = ` ${this.props.label} `;
    const content = `(${label})`;
    const show = this.focused ? `> ${content}` : `  ${content}`;
    const suffix = this.props.disabled ? ' (disabled)' : '';
    return [this.fitLine(show + suffix, width)];
  }

  handleEvent(event: TuiEvent) {
    if (!this.focused) return false;
    if (event.type != "key") return false;
    if (event.key == "enter" || event.key == " ") {
      if (!this.props.disabled) this.props.onPress?.();
      return true;
    }
    return false;
  }
}

interface LabelProps extends TuiComponentProps {
  label: string;
}

class Label extends TuiComponent {
  override props: LabelProps;

  constructor(id: string, props: LabelProps) {
    super(id, props);
    this.props = props;
    this.props.focusable = false;
  }

  render(width: number) {
    const label = `${this.props.label}`;
    return [this.fitLine(label, width)];
  }

  handleEvent(event: TuiEvent) {
    return false;
  }
}

class TuiRenderer {
  width: number = process.stdout.columns || 80;
  height: number = process.stdout.rows || 25;

  clear() {
    process.stdout.write("\x1b[2J");
    process.stdout.write("\x1b[H");
  }

  draw(lines: string[]) {
    this.clear();
    const maxLines = Math.max(0, this.height-1);
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      process.stdout.write(lines[i] + "\n");
    }

    // fill the rest with newlines
    const remainingLines = maxLines-lines.length;
    for (let i = 0; i < remainingLines; i++) process.stdout.write("\n");
  }

  resize() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 25;
  }
}

class TuiApp {
  root: TuiContainer;
  renderer: TuiRenderer;
  focusOrder: TuiComponent[] = [];
  focusedIndex = -1;
  running = false;

  constructor(root: TuiContainer) {
    this.root = root;
    this.renderer = new TuiRenderer();
    this.regenerateFocusOrder();
  }

  regenerateFocusOrder() {
    this.focusOrder = [];
    // recursive walk
    const walk = (child: TuiComponent) => {
      if ((child.props.focusable ?? false) && !(child instanceof TuiContainer)) this.focusOrder.push(child);
      if (child instanceof TuiContainer) {
        for (const child2 of child.children) {
          walk(child2);
        }
      }
    };
    walk(this.root);
    // force focus on an element
    if (this.focusOrder.length > 0 && this.focusedIndex < 0) this.focusedIndex = 0;
  }

  focusNext() {
    if (this.focusOrder.length == 0) return;
    this.focusOrder[this.focusedIndex]?.setFocus(false);
    // wraparound if at end
    this.focusedIndex = (this.focusedIndex + 1) % this.focusOrder.length;
    this.focusOrder[this.focusedIndex]?.setFocus(true);
  }

  focusPrev() {
    if (this.focusOrder.length == 0) return;
    this.focusOrder[this.focusedIndex]?.setFocus(false);
    // wraparound if at end (we are adding length bc javascript has negative mod and we want positive)
    this.focusedIndex = (this.focusedIndex - 1 + this.focusOrder.length) % this.focusOrder.length;
    this.focusOrder[this.focusedIndex]?.setFocus(true);
  }

  dispatch(event: TuiEvent) {
    if (event.type == "resize") {
      this.renderer.resize();
    }

    // priority is focused comp
    const focused = this.focusOrder[this.focusedIndex];
    if (focused && focused.handleEvent(event)) return;
    // if focused doesnt want then we broadcast
    this.root.handleEvent(event);
  }

  render() {
    const lines = this.root.render(this.renderer.width);
    this.renderer.draw(lines);
  }

  start() {
    this.running = true;

    // initial focus
    if (this.focusOrder.length > 0) {
      this.focusOrder[this.focusedIndex]?.setFocus(true);
    }

    // handle stdin
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onStdinData = (chunk: string) => {
      const key = parseKey(chunk);
      this.dispatch({type: "key", key: key.key, ctrl: key.ctrl || false});
      this.render();
    }

    const onResize = () => {
      this.dispatch({type: "resize"});
      this.render();
    };

    process.stdin.on("data", onStdinData);
    process.stdout.on("resize", onResize);

    this.render();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeAllListeners("data");
    process.stdout.write("\n");
    process.exit(0);
  }
}

function parseKey(chunk: string): { key: string; ctrl?: boolean } {
  if (chunk == "\b" || chunk == "\x7f") return {key: "backspace"};
  // parse CSI
  if (chunk.startsWith("\x1b[")) {
    const char = chunk[2];
    // specifically arrow keys and backspace
    if (char == "A") return { key: "up" };
    if (char == "B") return {key: "down"};
    if (char == "C") return {key: "right"};
    if (char == "D") return {key: "left"};
  }
  if (chunk == "\r" || chunk == "\n") return {key: "enter"};
  if (chunk == "\t") return {key: "tab"};
  if (chunk == "\x1b") return {key: "escape"};
  if (chunk == "\x03") return {key: "ctrlc"};
  if (chunk == "\x1b[Z") return {key: "shifttab"};

  // printable character
  if (chunk.length == 1) return {key: chunk};
  return {key: chunk};
}

function testTui() {
  const root = new TuiContainer("root", "column", 0, {});
  const tlabel = new Label("tlabel", {label: "test label"});
  const tinput = new TextInput("testinput", {
    placeholder: "type something",
    value: '',
    focusable: true,
    onChange: v => {},
    onSubmit: v => {},
  });
  const tbutton = new Button("testbutton", {
    label: "test",
  })

  const tbuttondisabled = new Button("testbutton", {
    label: "test",
    disabled: true,
  })
  
  root.addChild(tinput);
  root.addChild(tlabel);
  root.addChild(tbutton);
  root.addChild(tbuttondisabled);

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

testTui();
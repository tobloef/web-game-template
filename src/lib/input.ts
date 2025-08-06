import type { KeyboardButton } from "./keyboard-buttons";
import {
  buttonNumberToMouseButton,
  MOUSE_BUTTONS,
  type MouseButton,
} from "./mouse-button";
import type { ReadonlyVector2, Vector2 } from "./vector2";

export type Button = KeyboardButton | MouseButton;

export class Input {
  #consumedButtons = new Set<Button>();
  #justPressedButtons = new Set<Button>();
  #justReleasedButtons = new Set<Button>();
  #currentlyPressedButtons = new Set<Button>();
  #lastMousePosition: Vector2 = { x: 0, y: 0 };
  #currentMousePosition: Vector2 = { x: 0, y: 0 };
  #mousePositionDeltaCache: Vector2 = { x: 0, y: 0 };
  #lastMouseScroll = 0;
  #currentMouseScroll = 0;
  #newPresses: Button[] = [];
  #newReleases: Button[] = [];
  #newMousePositions: Vector2[] = [];
  #newMouseScrolls: number[] = [];

  constructor() {
    this.#setupEventListeners();
  }

  isPressed(button: Button): boolean {
    if (this.#consumedButtons.has(button)) {
      return false;
    }

    return this.#currentlyPressedButtons.has(button);
  }

  wasJustPressed(button: Button): boolean {
    if (this.#consumedButtons.has(button)) {
      return false;
    }

    return this.#justPressedButtons.has(button);
  }

  wasJustReleased(button: Button): boolean {
    if (this.#consumedButtons.has(button)) {
      return false;
    }

    return this.#justReleasedButtons.has(button);
  }

  /**
   * "Consumes" a given input, meaning that it will not result in `true` being
   * returned by `isPressed`, `wasJustPressed`, or `wasJustReleased` for any
   * further checks until `update` is called again.
   */
  consume(button: Button): void {
    this.#consumedButtons.add(button);
  }

  get mousePosition(): ReadonlyVector2 {
    return this.#currentMousePosition;
  }

  get mousePositionDelta(): ReadonlyVector2 {
    const previous = this.#lastMousePosition;
    const current = this.#currentMousePosition;

    this.#mousePositionDeltaCache.x = current.x - previous.x;
    this.#mousePositionDeltaCache.y = current.y - previous.y;

    return this.#mousePositionDeltaCache;
  }

  get mouseScrollDelta(): number {
    const previous = this.#lastMouseScroll;
    const current = this.#currentMouseScroll;

    return current - previous;
  }

  /** Button presses since the last `update` call. */
  get newPresses(): readonly Button[] {
    return this.#newPresses;
  }

  /** Button releases since the last `update` call. */
  get newReleases(): readonly Button[] {
    return this.#newReleases;
  }

  /** New mouse positions since the last `update` call. */
  get newMousePositions(): readonly ReadonlyVector2[] {
    return this.#newMousePositions;
  }

  /** New mouse scrolls since the last `update` call. */
  get newMouseScrolls(): readonly number[] {
    return this.#newMouseScrolls;
  }

  /** Update the input state. Should be called once per frame. */
  update() {
    this.#consumedButtons.clear();

    this.#justPressedButtons.clear();
    this.#justReleasedButtons.clear();

    this.#lastMousePosition.x = this.#currentMousePosition.x;
    this.#lastMousePosition.y = this.#currentMousePosition.y;
    this.#lastMouseScroll = this.#currentMouseScroll;

    this.#newPresses.length = 0;
    this.#newReleases.length = 0;
    this.#newMousePositions.length = 0;
    this.#newMouseScrolls.length = 0;
  }

  #setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      const button = e.code as KeyboardButton;
      this.#currentlyPressedButtons.add(button);
      this.#justPressedButtons.add(button);
      this.#newPresses.push(button);
    });

    document.addEventListener("keyup", (e) => {
      const button = e.code as KeyboardButton;
      this.#currentlyPressedButtons.delete(button);
      this.#justReleasedButtons.add(button);
      this.#newReleases.push(button);
    });

    document.addEventListener("mousedown", (e) => {
      const button = buttonNumberToMouseButton(e.button);
      this.#currentlyPressedButtons.add(button);
      this.#justPressedButtons.add(button);
      this.#newPresses.push(button);
    });

    document.addEventListener("mouseup", (e) => {
      const button = buttonNumberToMouseButton(e.button);
      this.#currentlyPressedButtons.delete(button);
      this.#justReleasedButtons.add(button);
      this.#newReleases.push(button);
    });

    document.addEventListener("mouseleave", () => {
      for (const button of MOUSE_BUTTONS) {
        if (!this.#currentlyPressedButtons.has(button)) {
          continue;
        }

        this.#currentlyPressedButtons.delete(button);
        this.#justReleasedButtons.add(button);
        this.#newReleases.push(button);
      }
    });

    document.addEventListener("mousemove", (e) => {
      this.#currentMousePosition.x = e.clientX;
      this.#currentMousePosition.y = e.clientY;
      this.#newMousePositions.push({ ...this.#currentMousePosition });
    });

    document.addEventListener("wheel", (e) => {
      this.#currentMouseScroll += e.deltaY;
      this.#newMouseScrolls.push(this.#currentMouseScroll);
    });
  }
}

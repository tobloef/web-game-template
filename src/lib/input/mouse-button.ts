export const MOUSE_BUTTONS = [
  "Mouse0",
  "Mouse1",
  "Mouse2",
  "Mouse3",
  "Mouse4",
  "Mouse5",
] as const satisfies readonly MouseButton[];

export type MouseButton = `Mouse${number}`;

export function mouseButtonToButtonNumber(mouseButton: MouseButton): number {
  const buttonNumber = Number(mouseButton.slice(5));

  if (Number.isNaN(buttonNumber)) {
    throw new Error(
      `Could not convert "${mouseButton}" to a valid button number.`,
    );
  }

  return buttonNumber;
}

export function buttonNumberToMouseButton(buttonNumber: number): MouseButton {
  return `Mouse${buttonNumber}`;
}

export function isMouseButton(value: string): value is MouseButton {
  if (!value.startsWith("Mouse")) {
    return false;
  }

  const buttonNumber = Number(value.slice(5));
  if (Number.isNaN(buttonNumber)) {
    return false;
  }

  return true;
}

export type InputActions = {
  moveX: number;
  moveY: number;
  primary: boolean;
  secondary: boolean;
  confirm: boolean;
  cancel: boolean;
};

export const emptyInputActions: InputActions = {
  moveX: 0,
  moveY: 0,
  primary: false,
  secondary: false,
  confirm: false,
  cancel: false,
};

export function normalizeAxis(value: number): number {
  if (Math.abs(value) < 0.15) {
    return 0;
  }

  return Math.max(-1, Math.min(1, value));
}

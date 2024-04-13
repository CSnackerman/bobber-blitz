export type NullableVoidFunc = (() => void) | null;
export type VoidFunc = () => void;
export type PriorityFunc = [number, VoidFunc]; // TODO: create priority enum

import { useLogger } from "reactive-vscode";

import { displayName } from "../generated/meta";

export const logger = useLogger(displayName);

export function toTitleCase(str: string) {
  return str
    .split("-")
    .join(" ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

export function toKebabCase(str: string) {
  return str
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, "")
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, "-")
    .toLowerCase();
}

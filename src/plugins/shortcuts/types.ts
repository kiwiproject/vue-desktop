import type { DesktopInstance } from "../../core/DesktopInstance";

export interface ShortcutDefinition {
  id: string;
  keys: string; // e.g., "ctrl+shift+n", "alt+w", "f11"
  handler: (desktop: DesktopInstance) => void;
  enabled?: boolean;
  description?: string;
}

export interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

/**
 * Parse a shortcut string into its components.
 * Examples: "ctrl+shift+n", "alt+f4", "escape", "meta+w"
 */
export function parseShortcut(keys: string): ParsedShortcut {
  const parts = keys.toLowerCase().split("+").map((p) => p.trim());

  const result: ParsedShortcut = {
    key: "",
    ctrl: false,
    alt: false,
    shift: false,
    meta: false
  };

  for (const part of parts) {
    switch (part) {
      case "ctrl":
      case "control":
        result.ctrl = true;
        break;
      case "alt":
        result.alt = true;
        break;
      case "shift":
        result.shift = true;
        break;
      case "meta":
      case "cmd":
      case "command":
      case "win":
        result.meta = true;
        break;
      default:
        result.key = part;
    }
  }

  return result;
}

/**
 * Check if a keyboard event matches a parsed shortcut.
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  const eventKey = event.key.toLowerCase();

  // Handle special key names
  const keyMatches =
    eventKey === shortcut.key ||
    (shortcut.key === "escape" && eventKey === "escape") ||
    (shortcut.key === "enter" && eventKey === "enter") ||
    (shortcut.key === "space" && eventKey === " ") ||
    (shortcut.key === "tab" && eventKey === "tab") ||
    (shortcut.key === "backspace" && eventKey === "backspace") ||
    (shortcut.key === "delete" && eventKey === "delete") ||
    // Function keys
    (/^f\d+$/.test(shortcut.key) && eventKey === shortcut.key);

  return (
    keyMatches &&
    event.ctrlKey === shortcut.ctrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === shortcut.meta
  );
}

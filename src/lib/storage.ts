import type { OutputFormat } from "./format";
import type { ReducerConfiguration } from "./reducer";

export const STORAGE_KEY = "html-reducer:configuration";

export type StoredConfiguration = {
  reducer?: Partial<ReducerConfiguration>;
  controlsOpen?: boolean;
  format?: OutputFormat;
};

export function loadConfiguration(): StoredConfiguration {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (typeof parsed === "object") {
      return parsed as StoredConfiguration;
    }
  } catch {}

  return {};
}

export function saveConfiguration(next: StoredConfiguration): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

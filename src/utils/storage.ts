const PREFIX = "personal-hub";

export function storageKey(fragment: string): string {
  return `${PREFIX}.${fragment}`;
}

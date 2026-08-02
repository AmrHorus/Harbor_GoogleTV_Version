export type LockableTab =
  | "discover"
  | "movies"
  | "shows"
  | "anime"
  | "sports"
  | "calendar"
  | "library";

export type LockableTabMeta = {
  key: LockableTab;
  label: string;
  iconKey:
    | "discover"
    | "movies"
    | "shows"
    | "anime"
    | "sports"
    | "calendar"
    | "library";
};

export const LOCKABLE_TABS: LockableTabMeta[] = [
  { key: "discover", label: "Discover", iconKey: "discover" },
  { key: "movies", label: "Movies", iconKey: "movies" },
  { key: "shows", label: "Shows", iconKey: "shows" },
  { key: "anime", label: "Anime", iconKey: "anime" },
  { key: "sports", label: "Sports", iconKey: "sports" },
  { key: "calendar", label: "Calendar", iconKey: "calendar" },
  { key: "library", label: "My Library", iconKey: "library" },
];

export type HiddenTabs = Record<LockableTab, boolean>;

export const DEFAULT_HIDDEN: HiddenTabs = {
  discover: false,
  movies: false,
  shows: false,
  anime: false,
  sports: false,
  calendar: false,
  library: false,
};

export function anyTabLocked(tabs: HiddenTabs | null | undefined): boolean {
  if (!tabs) return false;
  return Object.values(tabs).some(Boolean);
}

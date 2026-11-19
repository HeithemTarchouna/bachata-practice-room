// Languages. English is the source: every visible text is written in English in the code and the page, and a
// language file maps that English text to its translation. A text with no translation is shown in English
// and recorded in `missing`, which the tests check.
import { fr } from "./fr";
import { follower } from "./follower";

export type Lang = "en" | "fr";
export const LANGS: Lang[] = ["en", "fr"];
const TABLES: Record<Lang, Record<string, string> | null> = { en: null, fr };
const STORE = "bpr-lang";

const ROLE_STORE = "bpr-role";

/** Who is reading: the leader ("l") or the follower ("f"). The follower gets her own wording of each text. */
export type Role = "l" | "f";
let role: Role = "l";
export const getRole = () => role;
export function initialRole(): Role {
  try {
    return localStorage.getItem(ROLE_STORE) === "f" ? "f" : "l";
  } catch {
    return "l";
  }
}
export function setRole(next: Role, remember = true) {
  role = next;
  if (!remember) return;
  try {
    localStorage.setItem(ROLE_STORE, next);
  } catch {
    /* private browsing */
  }
}

let lang: Lang = "en";
export const missing = new Set<string>();

export const getLang = () => lang;

/** The saved choice, else the browser's language, else English. */
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORE);
    if (saved === "en" || saved === "fr") return saved;
  } catch {
    /* private browsing */
  }
  return typeof navigator !== "undefined" && /^fr\b/i.test(navigator.language || "") ? "fr" : "en";
}

export function setLang(next: Lang, remember = true) {
  lang = next;
  if (typeof document !== "undefined") document.documentElement.lang = next;
  if (!remember) return;
  try {
    localStorage.setItem(STORE, next);
  } catch {
    /* private browsing: the choice just isn't remembered */
  }
}

/** One text for the current reader: first the follower's wording if she is reading, then the language. */
export function tr(text: string): string {
  if (role === "f") text = follower[text] ?? text;
  const table = TABLES[lang];
  if (!table || !text) return text;
  const out = table[text];
  if (out === undefined) {
    missing.add(text);
    return text;
  }
  return out;
}

/** Translate a text with {placeholders}. */
export function tf(text: string, vars: Record<string, string | number>): string {
  return tr(text).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

// ---- the fixed texts of the page: elements marked data-t, and every aria-label and title
const ATTRS = ["aria-label", "title"];
const texts = new Map<Element, string>();
const attrs = new Map<Element, Record<string, string>>();

/** Remember the English texts of the page. Call once, before anything is added to the page. */
export function captureStatic() {
  document.querySelectorAll("[data-t]").forEach((el) => texts.set(el, el.innerHTML));
  document.querySelectorAll("[aria-label],[title]").forEach((el) => {
    const o: Record<string, string> = {};
    for (const a of ATTRS) if (el.hasAttribute(a)) o[a] = el.getAttribute(a)!;
    attrs.set(el, o);
  });
}
/** Write the fixed texts in the current language. */
export function applyStatic() {
  texts.forEach((en, el) => (el.innerHTML = tr(en)));
  attrs.forEach((o, el) => {
    for (const a in o) el.setAttribute(a, tr(o[a]));
  });
}

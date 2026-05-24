export type AuthMode = "signin" | "signup";

export const AUTH_MODAL_EVENT = "vita:auth-modal";

export function openAuthModal(mode: AuthMode) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthMode>(AUTH_MODAL_EVENT, { detail: mode }));
}

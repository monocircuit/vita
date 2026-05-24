const GENERIC = "Something went wrong. Please try again.";

const CODE_MAP: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  email_not_confirmed: "Please confirm your email before signing in.",
  user_not_found: "No account found for this email.",
  user_already_exists: "An account with this email already exists.",
  email_exists: "An account with this email already exists.",
  weak_password:
    "Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.",
  over_email_send_rate_limit:
    "Too many attempts. Please wait a minute and try again.",
  over_request_rate_limit:
    "Too many attempts. Please wait a minute and try again.",
  same_password: "New password must be different from the old one.",
  session_not_found: "Your reset link has expired. Please request a new one.",
  validation_failed: "Please check the form and try again.",
};

const MESSAGE_RULES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Wrong email or password."],
  [/email not confirmed/i, "Please confirm your email before signing in."],
  [/user already registered/i, "An account with this email already exists."],
  [/password should be at least/i, CODE_MAP.weak_password],
  [
    /rate limit|too many requests/i,
    "Too many attempts. Please wait a minute and try again.",
  ],
  [
    /auth session missing|session_not_found/i,
    "Your reset link has expired. Please request a new one.",
  ],
  [
    /new password should be different/i,
    "New password must be different from the old one.",
  ],
  [/failed to fetch|network/i, "Network error. Please check your connection."],
];

export const mapAuthError = (error: unknown): string => {
  if (!error) return GENERIC;

  if (error instanceof TypeError) {
    return "Network error. Please check your connection.";
  }

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  if (code && CODE_MAP[code]) return CODE_MAP[code];

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : typeof error === "string"
        ? error
        : "";

  for (const [pattern, userMessage] of MESSAGE_RULES) {
    if (pattern.test(message)) return userMessage;
  }

  return GENERIC;
};

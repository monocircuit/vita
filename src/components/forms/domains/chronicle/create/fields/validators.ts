interface ValidationInput {
  value: unknown;
}

export function requiredTextValidator(label: string) {
  return ({ value }: ValidationInput) =>
    !String(value ?? "").trim() ? `${label} is required` : undefined;
}

export function requiredArrayValidator(label: string) {
  return ({ value }: ValidationInput) =>
    Array.isArray(value) && value.length > 0
      ? undefined
      : `${label} is required`;
}

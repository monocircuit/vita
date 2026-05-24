interface ValidationInput {
  value: unknown;
}

const REQUIRED_KNOTS_MESSAGE = "At least one knot is required";

function validateRequiredKnots({ value }: ValidationInput) {
  return Array.isArray(value) && value.length > 0
    ? undefined
    : REQUIRED_KNOTS_MESSAGE;
}

export function useKnotsFieldAdapter() {
  return {
    validators: {
      onChange: validateRequiredKnots,
      onSubmit: validateRequiredKnots,
    },
  };
}

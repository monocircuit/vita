interface ValidationInput {
  value: unknown;
}

const REQUIRED_ENTITY_MESSAGE = "Entity is required";

function validateRequiredArray({ value }: ValidationInput) {
  return Array.isArray(value) && value.length > 0
    ? undefined
    : REQUIRED_ENTITY_MESSAGE;
}

export function useEntityFieldAdapter() {
  return {
    validators: {
      onChange: validateRequiredArray,
      onSubmit: validateRequiredArray,
    },
  };
}

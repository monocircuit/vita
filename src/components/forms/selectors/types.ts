export interface TanstackFieldApi<TValue> {
  name: string;
  state: {
    value: TValue;
    meta?: {
      touchedErrors?: unknown;
      errors?: unknown[];
    };
  };
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
}

export interface EntitySelectorProps {
  field: TanstackFieldApi<string[]>;
  label?: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  triggerClassName?: string;
  anchorClassName?: string;
  disabled?: boolean;
  maxSelected?: number;
  showCounter?: boolean;
}

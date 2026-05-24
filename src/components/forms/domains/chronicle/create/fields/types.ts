export interface FormModuleProps {
  form: any;
}

export interface CategoryFieldProps extends FormModuleProps {
  chronicleCategories: string[];
}

export interface ScopeFieldProps extends FormModuleProps {
  scopes: string[];
}

export interface SubmitButtonProps extends FormModuleProps {
  submittingText?: string;
  idleText?: string;
}

export interface SubmitFeedbackProps {
  submitError: string | null;
  submitSuccess: string | null;
}

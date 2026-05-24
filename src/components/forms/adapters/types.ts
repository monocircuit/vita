export interface FormModuleProps {
  form: any;
}

export interface KnotsFieldAdapterProps extends FormModuleProps {
  formatKnots: (ms: number) => string;
}

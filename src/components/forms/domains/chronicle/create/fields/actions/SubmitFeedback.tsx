import { SubmitFeedbackProps } from "../types";

export default function SubmitFeedback({
  submitError,
  submitSuccess,
}: SubmitFeedbackProps) {
  return (
    <>
      {submitError ? (
        <div className="ml-1.25 mr-1.25 text-xs text-destructive" role="alert">
          {submitError}
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="ml-1.25 mr-1.25 text-xs text-accent" role="status">
          {submitSuccess}
        </div>
      ) : null}
    </>
  );
}

import { Button } from "@monocircuit/monolithium/components";

import { SubmitButtonProps } from "../types";

export default function SubmitButton({
  form,
  submittingText = "Submitting...",
  idleText = "Add",
}: SubmitButtonProps) {
  return (
    <form.Subscribe
      selector={(state: any) => [state.canSubmit, state.isSubmitting]}
    >
      {([_canSubmit, isSubmitting]: [boolean, boolean]) => (
        <Button
          text={isSubmitting ? submittingText : idleText}
          className="h-10 border-t-(length:--stroke) border-solid border-border mt-auto"
          formType="submit"
          isDisabled={isSubmitting}
        />
      )}
    </form.Subscribe>
  );
}

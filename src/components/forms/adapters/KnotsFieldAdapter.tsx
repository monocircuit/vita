import {
  KnotsSelector,
  useKnotsFieldAdapter,
} from "@/components/forms/selectors";

import { KnotsFieldAdapterProps } from "./types";

export default function KnotsFieldAdapter({
  form,
  formatKnots,
}: KnotsFieldAdapterProps) {
  const { validators } = useKnotsFieldAdapter();

  return (
    <form.Field name="knots" validators={validators}>
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <KnotsSelector
            field={field}
            placeholder="Knots"
            maxKnots={3}
            className="min-h-10 bg-transparent text-fg"
            format={formatKnots}
          />
        </div>
      )}
    </form.Field>
  );
}

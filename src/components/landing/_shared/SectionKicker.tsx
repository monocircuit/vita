import { FunctionComponent, ReactNode } from "react";

type Props = {
  number: string;
  children: ReactNode;
};

const SectionKicker: FunctionComponent<Props> = ({ number, children }) => {
  return (
    <div className="flex items-center gap-3 font-[Fira_Code,monospace] text-[12px] uppercase tracking-[0.25em] text-[var(--l-muted)]">
      <span className="font-bold text-highlight">{number}</span>
      <span className="h-px w-8 bg-[var(--l-divider)]" />
      <span className="font-medium">{children}</span>
    </div>
  );
};

export default SectionKicker;

"use client";

import { use } from "react";
import EditorWorkspace from "../_components/EditorWorkspace";

interface Props {
  params: Promise<{ vitaId: string }>;
}

const Page = ({ params }: Props) => {
  const { vitaId } = use(params);
  const numericVitaId = Number(vitaId);
  if (!Number.isFinite(numericVitaId)) {
    return <div className="p-4 text-xs text-red-400">Invalid vita id.</div>;
  }
  return <EditorWorkspace vitaId={numericVitaId} />;
};

export default Page;

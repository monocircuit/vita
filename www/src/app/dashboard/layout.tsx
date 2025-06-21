"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@monolithium/next/components";
import { SourceSans3 } from "@monolithium/next/fonts";

import DashboardHeader from "@/components/features/dashboard/DashboardHeader";

interface Props {
  children?: React.ReactNode;
}

const Page = (props: Props) => {
  /** ANCHOR: Router */
  const router = useRouter();

  return (
    <div
      id="dashboard"
      className="size-full grid grid-cols-[1fr] grid-rows-[50px_1fr]"
    >
      <div
        id="dashboard__header"
        className={`w-full border-secondary border-solid border-b-(length:--stroke) flex items-center justify-center`}
      >
        <DashboardHeader />
      </div>
      <div
        id="dashboard__body"
        className="grid grid-cols-[200px_1fr] grid_rows-[1fr]"
      >
        <div
          id="dashboard__sidebar"
          className="border-secondary border-solid border-r-(length:--stroke) flex flex-col"
        >
          <Button
            text="Chronicles"
            className={`h-[30px] w-full border-b-(length:--stroke) border-solid border-secondary ${SourceSans3.className}`}
            onClick={() => router.push(`/dashboard/chronicles`)}
          />
          <Button
            text="CVs"
            className={`h-[30px] w-full border-b-(length:--stroke) border-solid border-secondary ${SourceSans3.className}`}
            onClick={() => router.push(`/dashboard/vitas`)}
          />
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default Page;

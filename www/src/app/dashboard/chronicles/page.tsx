"use client";

import ChronicleForm from "@/components/common/ChronicleForm/ChronicleForm";
import Card from "@/components/common/Card";
import CardText from "@/components/common/Card/CardText";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicles/readOwnChronicles";
import { Button, Popover, Scrollable } from "@monolithium/next/components";
import React, { useState } from "react";

const Page = () => {
  /** ANCHOR: Data */
  const { ownChronicles } = useOwnChroniclesData();

  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);

  return (
    <Scrollable shouldScrollY>
      <div
        id="chronicle-tab"
        className="size-full flex flex-wrap gap-1 overflow-hidden"
      >
        {ownChronicles?.map((chronicle, key) => (
          <Card
            key={key}
            title={chronicle.title}
            className="flex-grow min-w-[200px] max-w-[250px] basis-0 h-[300px] bg-gray-200"
          >
            <CardText>{ownChronicles[key].description}</CardText>
          </Card>
        ))}

        <Popover
          content={<ChronicleForm />}
          className="w-[300px] h-[500px] border-solid border-secondary border-(length:--stroke) bg-primary"
          config={{
            isConnected: true,
            isClosableByEmptyClick: true,
            isDraggable: true,
          }}
          shouldRender={isAddPopoverActive}
        >
          <Button
            text="add"
            className="h-[30px] w-[30px] border-solid border-secondary border-(length:--stroke)"
            onClick={() => setIsAddPopoverActive(!isAddPopoverActive)}
          />
        </Popover>
      </div>
    </Scrollable>
  );
};

export default Page;

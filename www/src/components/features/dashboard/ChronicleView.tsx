import ChronicleForm from "@/components/ChronicleForm/ChronicleForm";
import Card from "@/components/common/Card";
import CardText from "@/components/common/Card/CardText";
import { Chronicle } from "@/utils/schemas/Chronicle";
import { getChronicles } from "@/utils/supabase/api/chronicle/readChronicles";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicle/readOwnChronicles";
import { Button, Popover } from "@monolithium/next/components";
import React, { useEffect, useState } from "react";

const ChronicleView = () => {
  /** ANCHOR: Data */
  const { ownChronicles } = useOwnChroniclesData();

  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);

  useEffect(() => {
    async function fetchChronicles() {
      const data = await getChronicles();

      console.log(data);
    }
  });

  return (
    <div id="chronicle-tab" className="size-full flex">
      {ownChronicles?.map((chronicle, key) => (
        <Card
          key={key}
          title={chronicle.title}
          className="w-[200px] h-[300px] bg-gray-200"
        >
          <CardText>Text</CardText>
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
  );
};

export default ChronicleView;

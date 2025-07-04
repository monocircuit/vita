import React, { useEffect, useState } from "react";
import { Chronicle, ChronicleOverhead } from "@/utils/schemas/Chronicle";
import { getChronicles } from "@/utils/supabase/api/chronicles/readOwnChronicles";
import { Button, Popover, Scrollable } from "@monolithium/next/components";
import CardText from "../common/Card/CardText";
import classNames from "classnames";

interface Props {
  submitFunction: (e: (Chronicle & ChronicleOverhead)[]) => void;
}

function ChronicleSelect({ submitFunction }: Props) {
  const [chronicles, setChronicles] = useState<
    (Chronicle & ChronicleOverhead)[] | null
  >();
  const [selectedChronicles, setSelectedChronicles] = useState<
    (Chronicle & ChronicleOverhead)[]
  >([]);

  useEffect(() => {
    getChronicles().then(data => setChronicles(data));
  }, []);

  const isIncluded = (id: number) => selectedChronicles.some(e => e.id === id);

  const handleClick = (id: number) => {
    setSelectedChronicles(prev => {
      const isSelected = prev.some(item => item.id === id);
      if (isSelected) {
        return prev.filter(item => item.id !== id);
      } else {
        const chronicleToAdd = chronicles?.find(item => item.id === id);
        return chronicleToAdd ? [...prev, chronicleToAdd] : prev;
      }
    });
  };

  return (
    <div className="monolithium-border ">
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 m-2 h-[400px] overflow-scroll
"
      >
        {!chronicles ? (
          <div>Loading...</div>
        ) : (
          chronicles.map(element => {
            const cardClasses = classNames(
              "flex-grow min-w-[100px] p-2 overflow-hidden basis-0 h-[300px]",
              {
                "border-[1px] border-green-600": isIncluded(element.id),
                "monolithium-border": !isIncluded(element.id),
              },
            );

            return (
              <div key={element.id} className={cardClasses}>
                <Button
                  onClick={() => handleClick(element.id)}
                  className="w-full h-full"
                >
                  <div className="font-bold text-md mb-2 rounded-20 bg-gray-300 text-center">
                    {element.title}
                  </div>
                  <div className="h-full flex flex-col space-y-3">
                    <div>
                      Zeitraum: <br />
                      {element.knots?.toString()}
                    </div>
                    <div>
                      Category: <br /> {element.category}
                    </div>
                    <div>
                      Description: <br />{" "}
                      {element.description.length > 60
                        ? `${element.description.substring(0, 60).trim()}...`
                        : element.description}
                    </div>
                  </div>
                </Button>
              </div>
            );
          })
        )}
      </div>

      <div className="h-[100px] flex items-center justify-center">
        <Button
          className="h-20 px-4"
          onClick={() => submitFunction(selectedChronicles)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default ChronicleSelect;

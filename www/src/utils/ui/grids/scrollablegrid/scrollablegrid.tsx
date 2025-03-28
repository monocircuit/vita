import useClassName from "@/utils/hooks/useClassName";
import Card from "@/utils/ui/card/card.component";
import { RecordModel } from "pocketbase";
import scss from "@/utils/ui/grids/scrollablegrid/scrollablegrid.module.scss";

interface ScrollableCardGridProps {
    className?: string;
    items: RecordModel[] | undefined;
}

export default function ScrollableCardGrid({ items, className }: ScrollableCardGridProps) {
    const gridClassNames = useClassName("overscroll-contain grid  gap-4   ",scss["scrollgrid"] ,className);

    return (
        <div className={gridClassNames}>
            {items?.length ? (
                items.map((item: RecordModel) => (
                    <Card
                        id={item.id}
                        title={item.title}
                        className="p-1 bg-white shadow rounded-lg h-[150px]"
                    >
                        {item.title}
                    </Card>
                ))
            ) : (
                <div className="text-center col-span-full">No items available</div>
            )}
        </div>
    );
}

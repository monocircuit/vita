import useClassName from "@/utils/hooks/useClassName";
import Card from "@/utils/ui/card/card.component";
import { RecordModel } from "pocketbase";

interface ScrollableCardGridProps {
    className?: string;
    items: RecordModel[] | undefined;
}

export default function ScrollableCardGrid({ items, className }: ScrollableCardGridProps) {
    const gridClassNames = useClassName(
        "overflow-y-scroll overscroll-contain grid  gap-4 p-2  ",
        className
    );

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

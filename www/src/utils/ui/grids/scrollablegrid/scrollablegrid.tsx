import useClassName from "@/utils/hooks/useClassName";
import Card from "@/utils/ui/card/card.component";
import { RecordModel } from "pocketbase";
import scss from "@/utils/ui/grids/scrollablegrid/scrollablegrid.module.scss";
import { Children } from "react";

interface ScrollableCardGridProps {
    className?: string;
    children: React.ReactNode;
}

export default function ScrollableCardGrid({ className, children }: ScrollableCardGridProps) {
    const gridClassNames = useClassName(scss["scrollgrid"], className);

    return <div className={gridClassNames}>{children}</div>;
}

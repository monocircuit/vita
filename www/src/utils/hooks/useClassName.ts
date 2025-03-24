import { useEffect, useState } from "react";

const useClassName = (...classNameEntities: (string | string[] | undefined)[]) => {
    const [className, setClassName] = useState<string>("");

    useEffect(() => {
        const classNames: string[] = [];
        classNameEntities.forEach((classNameEntity) => {
            if (!classNameEntity) return;
            if (typeof classNameEntity === "string") {
                classNames.push(classNameEntity);
                return;
            }
            classNames.push(...classNameEntity);
        });
        setClassName(classNames.join(" "));
    }, [classNameEntities]);

    return className;
};

export default useClassName;

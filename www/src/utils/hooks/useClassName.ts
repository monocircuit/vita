import { useState } from "react";

const useClassName = (...classNameEntities: (string | string[] | undefined)[]) => {
    const getClassName = () => {
        const classNames: string[] = [];
        classNameEntities.forEach((classNameEntity) => {
            if (!classNameEntity) return;
            if (typeof classNameEntity === "string") {
                classNames.push(classNameEntity);
                return;
            }
            classNames.push(...classNameEntity);
        });
        return classNames.join(" ");
    };

    const [className] = useState<string>(getClassName());

    return className;
};

export default useClassName;

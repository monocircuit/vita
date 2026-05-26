import { Button } from "@monocircuit/monolithium/components";
import Add from "@/assets/images/png/sharp_line/add.png";
import { useEditorFeature } from "../EditorFeatureContext";

const NewChronicleTool = () => {
  const { toggleFeature } = useEditorFeature();

  return (
    <div className="h-full w-full min-h-0 max-h-full shrink-0 overflow-hidden border-r-(length:--stroke) border-solid border-border [&_#button-wrapper]:h-full [&_#button-wrapper]:max-h-full [&_#button-wrapper]:overflow-hidden [&_#button]:h-full [&_#button]:max-h-full">
      <Button
        className="h-full w-full min-h-0 max-h-full overflow-hidden"
        onClick={() => toggleFeature("chronicle-add")}
      >
        <img
          src={Add as unknown as string}
          alt="add"
          width={100}
          height={100}
          className="h-7 w-7"
        />
      </Button>
    </div>
  );
};

export default NewChronicleTool;

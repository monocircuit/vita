import Tree from "./Tree";

interface TreeRendererOptions {
  layerWidth: number;
}

class TreeRenderer {
  constructor(tree: Tree, options?: TreeRendererOptions) {}

  public render = () => {
    return (
      <>
        <pixiGraphics
          draw={graphics => {
            graphics.clear();
            graphics.moveTo(0, 0);
            graphics.lineTo(0, -100);
            graphics.lineTo(150, 150);
            graphics.lineTo(240, 100);
            graphics.stroke({ color: "red", width: 2 });
            graphics.position.x = 320;
            graphics.position.y = 150;
          }}
        >
          <pixiGraphics
            draw={graphics => {
              graphics.clear();
              graphics.moveTo(100, 100);
              graphics.lineTo(0, -100);
              graphics.lineTo(150, 150);
              graphics.lineTo(240, 100);
              graphics.stroke({ color: "red", width: 2 });
            }}
          />
        </pixiGraphics>
      </>
    );
  };
}

export default TreeRenderer;

import { drawConnection } from "@/shared/drawing/dynamic/drawConnection";
import { normalize } from "./helpers";
import { connectionEndpointX, connectionStartpointX } from "./endpoints";
import { getGlobalConfig, subscribeGlobal } from "./styleApi";
import {
  getConnectionBaseStyle,
  getConnectionHoverStyle,
} from "./branchStyleHelpers";
import { ChronicleCell, DrawingContext } from "./helpers";
import {
  getChainId,
  registerChainMember,
  hoverChain,
  unhoverChain,
} from "./chainHoverManager";

export const drawGenericConnection = (
  context: DrawingContext,
  source: ChronicleCell,
  target: ChronicleCell,
) => {
  const { viewport, aknot, distance, worldWidth, centerY } = context;
  const cfg = getGlobalConfig();

  const nknotsSource = normalize(source.$.knots, aknot, distance);
  const startX = connectionStartpointX(
    nknotsSource[0] * worldWidth,
    nknotsSource[1] * worldWidth,
  );
  const startY = centerY - source.y * cfg.layerDistance;

  const nknotsTarget = normalize(target.$.knots, aknot, distance);
  const endX = connectionEndpointX(
    nknotsTarget[0] * worldWidth,
    nknotsTarget[1] * worldWidth,
  );
  const endY = centerY - target.y * cfg.layerDistance;

  const { graphics: gfx, restyle } = drawConnection(viewport, {
    startPoint: { x: startX, y: startY },
    endPoint: { x: endX, y: endY },
    color: cfg.connectionColor,
    thickness: cfg.connectionThickness,
  });

  // Chain hover — connections belong to the same chain as their source branch
  const chainId = getChainId(source);
  const memberId = `conn_${source.$.id}_${source.x}_${source.y}_${target.$.id}_${target.x}_${target.y}`;

  gfx.interactive = true;
  gfx.cursor = "pointer";

  gfx.on("pointerover", () => hoverChain(chainId));
  gfx.on("pointerout", () => unhoverChain(chainId));

  registerChainMember(chainId, memberId, {
    restyle,
    getBaseStyle: getConnectionBaseStyle,
    getHoverStyle: getConnectionHoverStyle,
  });

  // Re-apply base style on theme/global config change
  const unsubGlobal = subscribeGlobal(() => {
    if (gfx.destroyed) { unsubGlobal(); return; }
    const { color, thickness } = getConnectionBaseStyle();
    restyle(color, thickness);
  });
};

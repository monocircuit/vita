import { drawConnection } from "@/shared/drawing/dynamic/drawConnection";
import { normalize } from "./helpers";
import { connectionEndpointX, connectionStartpointX } from "./endpoints";
import { getGlobalConfig } from "./styleApi";
import { ChronicleCell } from "./helpers";

export const drawGenericConnection = (context: any, source: any, target: any) => {
  const { viewport, aknot, distance, screenWidth, centerY } = context;
  const cfg = getGlobalConfig();

  const nknotsSource = normalize(source.$.knots, aknot, distance);
  const startX = connectionStartpointX(nknotsSource[0] * screenWidth, nknotsSource[1] * screenWidth);
  const startY = centerY - source.y * cfg.layerDistance;

  const nknotsTarget = normalize(target.$.knots, aknot, distance);
  const endX = connectionEndpointX(nknotsTarget[0] * screenWidth, nknotsTarget[1] * screenWidth);
  const endY = centerY - target.y * cfg.layerDistance;

  drawConnection(viewport, {
    startPoint: { x: startX, y: startY },
    endPoint: { x: endX, y: endY },
    color: cfg.connectionColor,
    thickness: cfg.connectionThickness,
  });
};
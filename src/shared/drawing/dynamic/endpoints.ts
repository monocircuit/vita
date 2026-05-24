import { CONNECTION } from "./config";

/**
 * Endpoint helpers: 25% of branch length but capped at 25px (was 25 in your file).
 * Adjust cap here if you want 75px.
 */
export const connectionEndpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(
    length * CONNECTION.ENDPOINT_RATIO,
    CONNECTION.ENDPOINT_CAP_PX,
  );
  return startX < endX ? startX + offset : startX - offset;
};

export const connectionStartpointX = (startX: number, endX: number): number => {
  const length = Math.abs(endX - startX);
  const offset = Math.min(
    length * CONNECTION.ENDPOINT_RATIO,
    CONNECTION.ENDPOINT_CAP_PX,
  );
  return startX < endX ? endX - offset : endX + offset;
};

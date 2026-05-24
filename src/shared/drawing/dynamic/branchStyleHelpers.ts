import { getGlobalConfig, getBranchStyle, DESKTOP_BRANCH_THICKNESS } from "./styleApi";

interface StyleResult {
  color: number;
  thickness: number;
}

/** Scale a per-branch override thickness proportionally to the current global thickness. */
const scaleOverrideThickness = (
  overrideThickness: number,
  globalThickness: number,
): number => overrideThickness * (globalThickness / DESKTOP_BRANCH_THICKNESS);

/** Compute the base style for a branch, merging global config with per-branch overrides. */
export const getBranchBaseStyle = (
  chronicleId: string | undefined,
): StyleResult => {
  const cfg = getGlobalConfig();
  const override = chronicleId ? getBranchStyle(chronicleId) : undefined;
  return {
    color: override?.color ?? cfg.branchColor,
    thickness: override?.thickness
      ? scaleOverrideThickness(override.thickness, cfg.branchThickness)
      : cfg.branchThickness,
  };
};

/** Compute the hover style for a branch. */
export const getBranchHoverStyle = (
  chronicleId: string | undefined,
): StyleResult => {
  const cfg = getGlobalConfig();
  const override = chronicleId ? getBranchStyle(chronicleId) : undefined;
  const baseThickness = override?.thickness
    ? scaleOverrideThickness(override.thickness, cfg.branchThickness)
    : cfg.branchThickness;
  return {
    color: cfg.hoverBranchColor,
    thickness: baseThickness * cfg.hoverBranchThicknessMultiplier,
  };
};

/** Compute the base style for a connection. */
export const getConnectionBaseStyle = (): StyleResult => {
  const cfg = getGlobalConfig();
  return { color: cfg.connectionColor, thickness: cfg.connectionThickness };
};

/** Compute the hover style for a connection. */
export const getConnectionHoverStyle = (): StyleResult => {
  const cfg = getGlobalConfig();
  return {
    color: cfg.hoverConnectionColor,
    thickness: cfg.connectionThickness * cfg.hoverConnectionThicknessMultiplier,
  };
};

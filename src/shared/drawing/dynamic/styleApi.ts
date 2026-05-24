export interface CanvasThemeColors {
  /** Canvas / renderer background */
  canvasBg: number;
  /** Timeline axis line */
  timelineColor: number;
  /** Timeline year/month label text */
  timelineLabelColor: number;
  /** Timeline month sub-label text */
  timelineMonthLabelColor: number;
  /** Timeline year separator stroke */
  timelineSeparatorColor: number;
  /** Timeline today-marker accent */
  timelineTodayColor: number;
  /** Alternating band A (even) */
  timelineBandA: number;
  /** Alternating band B (odd) */
  timelineBandB: number;
  /** Draggable note background */
  noteBg: number;
  /** Draggable note border */
  noteBorder: number;
  /** Draggable note text (CSS color string for PIXI TextStyle) */
  noteText: string;
  /** Halo / selection highlight color */
  haloColor: number;
}

export interface GlobalStyleConfig {
  connectionColor: number;
  connectionThickness: number;
  branchColor: number;
  branchThickness: number;
  layerDistance: number;
  hoverBranchColor: number;
  hoverBranchThicknessMultiplier: number;
  hoverConnectionColor: number;
  hoverConnectionThicknessMultiplier: number;
  theme: CanvasThemeColors;
}

export interface BranchStyle {
  color?: number;
  thickness?: number;
}

/** Desktop default branch thickness — used as the reference for proportional scaling. */
export const DESKTOP_BRANCH_THICKNESS = 6;

export const LIGHT_THEME: CanvasThemeColors = {
  canvasBg: 0xffffff,
  timelineColor: 0x333333,
  timelineLabelColor: 0x555555,
  timelineMonthLabelColor: 0xaaaaaa,
  timelineSeparatorColor: 0xcccccc,
  timelineTodayColor: 0xe74c3c,
  timelineBandA: 0xf3f3f3,
  timelineBandB: 0xffffff,
  noteBg: 0xffffff,
  noteBorder: 0x000000,
  noteText: "#333333",
  haloColor: 0xfbbf24,
};

export const DARK_THEME: CanvasThemeColors = {
  canvasBg: 0x0a0a0a,
  timelineColor: 0xaaaaaa,
  timelineLabelColor: 0x999999,
  timelineMonthLabelColor: 0x555555,
  timelineSeparatorColor: 0x333333,
  timelineTodayColor: 0xff4d5e,
  timelineBandA: 0x111111,
  timelineBandB: 0x0a0a0a,
  noteBg: 0x1a1a1a,
  noteBorder: 0x404040,
  noteText: "#ededed",
  haloColor: 0xfbbf24,
};

const defaultConfig: GlobalStyleConfig = {
  connectionColor: 0x000000,
  connectionThickness: 6,
  branchColor: 0x000000,
  branchThickness: 6,
  layerDistance: 65,
  hoverBranchColor: 0x3b82f6,
  hoverBranchThicknessMultiplier: 1.5,
  hoverConnectionColor: 0x3b82f6,
  hoverConnectionThicknessMultiplier: 1.5,
  theme: { ...LIGHT_THEME },
};

let globalConfig: GlobalStyleConfig = { ...defaultConfig };
const branchStyles = new Map<string, BranchStyle>();

// Listeners
type GlobalListener = (cfg: GlobalStyleConfig) => void;
type BranchListener = (style: BranchStyle | undefined) => void;

const globalListeners = new Set<GlobalListener>();
const branchListeners = new Map<string, Set<BranchListener>>();

export const setGlobalConfig = (partial: Partial<GlobalStyleConfig>) => {
  globalConfig = { ...globalConfig, ...partial };
  globalListeners.forEach(l => {
    try {
      l({ ...globalConfig });
    } catch (e) {
      console.error("GlobalListener error", e);
    }
  });
};

export const getGlobalConfig = (): GlobalStyleConfig => ({ ...globalConfig });

export const setBranchStyle = (id: string, style: BranchStyle) => {
  branchStyles.set(id, { ...(branchStyles.get(id) ?? {}), ...style });
  const listeners = branchListeners.get(id);
  if (listeners) {
    listeners.forEach(l => {
      try {
        l(branchStyles.get(id));
      } catch (e) {
        console.error("BranchListener error", e);
      }
    });
  }
};

export const getBranchStyle = (id: string): BranchStyle | undefined => {
  return branchStyles.get(id);
};

export const removeBranchStyle = (id: string) => {
  branchStyles.delete(id);
  const listeners = branchListeners.get(id);
  if (listeners) {
    listeners.forEach(l => {
      try {
        l(undefined);
      } catch (e) {}
    });
  }
  branchListeners.delete(id);
};

export const resetStyles = () => {
  globalConfig = { ...defaultConfig };
  branchStyles.clear();
  // notify all global listeners
  globalListeners.forEach(l => {
    try {
      l({ ...globalConfig });
    } catch (e) {}
  });
  // notify branch listeners with undefined
  branchListeners.forEach(set => {
    set.forEach(l => {
      try {
        l(undefined);
      } catch (e) {}
    });
  });
  branchListeners.clear();
};

// Subscription helpers
export const subscribeGlobal = (listener: GlobalListener) => {
  globalListeners.add(listener);
  listener({ ...globalConfig });
  return () => {
    globalListeners.delete(listener);
  };
};

export const subscribeBranch = (id: string, listener: BranchListener) => {
  const set = branchListeners.get(id) ?? new Set<BranchListener>();
  set.add(listener);
  branchListeners.set(id, set);
  listener(branchStyles.get(id));
  return () => {
    const s = branchListeners.get(id);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) branchListeners.delete(id);
  };
};

// Das macht die API in der Browser-Konsole verügbar
// @ts-ignore
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__monoStyleApi = {
    setGlobalConfig,
    getGlobalConfig,
    setBranchStyle,
    getBranchStyle,
    removeBranchStyle,
    resetStyles,
    subscribeGlobal,
    subscribeBranch,
  };
}

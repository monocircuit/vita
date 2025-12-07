export interface GlobalStyleConfig {
  connectionColor: number;
  connectionThickness: number;
  branchColor: number;
  branchThickness: number;
  layerDistance: number;
}

export interface BranchStyle {
  color?: number;
  thickness?: number;
}

const defaultConfig: GlobalStyleConfig = {
  connectionColor: 0x000000,
  connectionThickness: 4,
  branchColor: 0x000000,
  branchThickness: 4,
  layerDistance: 30,
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

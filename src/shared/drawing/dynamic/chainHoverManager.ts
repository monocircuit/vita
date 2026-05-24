import type { ChronicleCell } from "./helpers";
import { ANIMATION } from "./config";
import { lerpColor, lerp, easeOutCubic } from "./easing";

type RestyleFn = (color: number, thickness: number) => void;

interface ChainMember {
  restyle: RestyleFn;
  getBaseStyle: () => { color: number; thickness: number };
  getHoverStyle: () => { color: number; thickness: number };
}

interface ChainAnimState {
  progress: number; // 0 = base, 1 = fully hovered
  target: number; // 0 or 1
  startProgress: number;
  startTime: number;
  rafId: number | null;
}

const chains = new Map<string, Map<string, ChainMember>>();
const hoveredChains = new Set<string>();
const animStates = new Map<string, ChainAnimState>();

// --- Apply styles at a given progress ---

const applyProgress = (chainId: string, progress: number) => {
  const chain = chains.get(chainId);
  if (!chain) return;
  chain.forEach(member => {
    const base = member.getBaseStyle();
    const hover = member.getHoverStyle();
    const color = lerpColor(base.color, hover.color, progress);
    const thickness = lerp(base.thickness, hover.thickness, progress);
    member.restyle(color, thickness);
  });
};

// --- Animation loop ---

const animateChain = (chainId: string) => {
  const state = animStates.get(chainId);
  if (!state) return;

  const elapsed = performance.now() - state.startTime;
  const rawT = Math.min(elapsed / ANIMATION.CHAIN_HOVER_MS, 1);
  const easedT = easeOutCubic(rawT);

  state.progress =
    state.startProgress + (state.target - state.startProgress) * easedT;
  applyProgress(chainId, state.progress);

  if (rawT < 1) {
    state.rafId = requestAnimationFrame(() => animateChain(chainId));
  } else {
    state.progress = state.target;
    state.rafId = null;
  }
};

const startAnimation = (chainId: string, target: number) => {
  let state = animStates.get(chainId);
  if (!state) {
    state = {
      progress: target === 1 ? 0 : 1,
      target,
      startProgress: 0,
      startTime: 0,
      rafId: null,
    };
    animStates.set(chainId, state);
  }

  // Cancel running animation
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  // Already at target
  if (state.progress === target) return;

  state.target = target;
  state.startProgress = state.progress;
  state.startTime = performance.now();
  state.rafId = requestAnimationFrame(() => animateChain(chainId));
};

// --- Public API ---

/** Walk prev pointers to find the chain head, return a stable chain ID. */
export const getChainId = (cell: ChronicleCell): string => {
  let head: ChronicleCell = cell;
  while (head.prev && head.prev.$) head = head.prev as ChronicleCell;
  return `chain_${head.$?.id}_${head.x}_${head.y}`;
};

export const registerChainMember = (
  chainId: string,
  memberId: string,
  member: ChainMember,
): (() => void) => {
  if (!chains.has(chainId)) chains.set(chainId, new Map());
  chains.get(chainId)!.set(memberId, member);
  return () => {
    const chain = chains.get(chainId);
    if (chain) {
      chain.delete(memberId);
      if (chain.size === 0) chains.delete(chainId);
    }
  };
};

export const hoverChain = (chainId: string) => {
  hoveredChains.add(chainId);
  startAnimation(chainId, 1);
};

export const unhoverChain = (chainId: string) => {
  hoveredChains.delete(chainId);
  startAnimation(chainId, 0);
};

export const isChainHovered = (chainId: string): boolean =>
  hoveredChains.has(chainId);

export const clearChains = () => {
  animStates.forEach(state => {
    if (state.rafId !== null) cancelAnimationFrame(state.rafId);
  });
  chains.clear();
  hoveredChains.clear();
  animStates.clear();
};

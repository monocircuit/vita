import ButterflyCell from "./ButterflyCell";

export interface ButterflyDepth {
  x: number;
  y: number;
}

/**
 * @author Lukas Diegelmann
 *
 * The `ButterflyLinkage` connects two cells that do not have consecutive x coordinates
 * and are in the same y coordinate. It can be used to semantically group different cells
 * depending on the use case.
 *
 * Should the `next` or `prev` connection not exist (meaning the user of `Butterfly`) did
 * not instantiate such a connection, these functions will return `null`, indicating that
 * there is no connection.
 */
export interface ButterflyLinkage<T> {
  next: ButterflyCell<T> | null;
  prev: ButterflyCell<T> | null;
}

/**
 * @author Lukas Diegelmann
 *
 * Describes a single change event that occurs inside the Engine’s underlying
 * "Butterfly stack" (the internal structure tracking document or state changes).
 *
 * Each event represents a logical operation — for example, applying a new change,
 * undoing or redoing a previous one, or resetting the stack entirely.
 *
 * These events can be emitted by the Engine whenever its internal state mutates,
 * allowing external subscribers (e.g. React components) to react to updates.
 */
export type ButterflyChange =
  /**
   * Fired when a new operation is applied to the Butterfly stack.
   * Contains optional `patches` (forward changes) and `inverse` patches
   * (for undo functionality).
   */
  | { kind: "apply"; patches?: unknown; inverse?: unknown }

  /**
   * Fired when an undo operation reverts one or more previous changes.
   * The `patches` describe the undone data, while `inverse` describes
   * how to redo it if needed.
   */
  | { kind: "undo"; patches?: unknown; inverse?: unknown }

  /**
   * Fired when a previously undone operation is re-applied.
   * Similar structure to `apply` and `undo`.
   */
  | { kind: "redo"; patches?: unknown; inverse?: unknown }

  /**
   * Fired when the Butterfly stack is cleared, rebuilt, or fully replaced.
   * Indicates a global reset rather than an incremental change.
   */
  | { kind: "reset" }

  /**
   * Generic fallback event for custom or non-standard changes.
   * Can carry an optional human-readable `note` for debugging or logging.
   */
  | { kind: "other"; note?: string };

import { DoublyLinkedList } from "../DoublyLinkedList";
import ButterflyCell from "./ButterflyCell";

/**
 * @author ChatGPT5
 *
 * A `ButterflyLevel` is a horizontal row of cells in the Butterfly structure.
 * It extends a standard {@link DoublyLinkedList}, but provides iterators
 * that expose both the X-coordinate and the associated `ButterflyCell<Value>`.
 *
 * @typeParam Value The type of content stored inside each ButterflyCell.
 */
class ButterflyLevel<T> extends DoublyLinkedList<
  ButterflyCell<T>,
  { x: number; cell: ButterflyCell<T> }
> {
  constructor() {
    super();
  }

  protected project(
    cell: ButterflyCell<T>,
    index: number,
  ): { x: number; cell: ButterflyCell<T> } {
    return { x: index, cell };
  }
}

export default ButterflyLevel;

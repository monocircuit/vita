type Listener<T> = (e: T) => void;

class EventEmitter<T> {
  private listeners = new Set<Listener<T>>();

  on = (listener: Listener<T>) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  emit = (e: T) => {
    for (const fn of this.listeners) fn(e);
  };

  /**
   * @author Lukas Diegelmann
   *
   * Clears all listeners from the emitter.
   */
  clear = () => this.listeners.clear();
}

export default EventEmitter;

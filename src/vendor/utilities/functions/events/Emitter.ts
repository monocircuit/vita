export class Emitter<EventMap extends Record<string, any>> {
  private listeners = new Map<keyof EventMap, Set<(p: any) => void>>();

  on<K extends keyof EventMap>(event: K, fn: (payload: EventMap[K]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as any);
    return () => this.off(event, fn);
  }

  once<K extends keyof EventMap>(event: K, fn: (payload: EventMap[K]) => void) {
    const off = this.on(event, p => {
      off();
      fn(p);
    });
    return off;
  }

  off<K extends keyof EventMap>(event: K, fn: (payload: EventMap[K]) => void) {
    this.listeners.get(event)?.delete(fn as any);
  }

  protected emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }
}

export default Emitter;

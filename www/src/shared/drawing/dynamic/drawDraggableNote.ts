import { Container, Graphics, Text, TextStyle, FederatedPointerEvent } from "pixi.js";
import { Viewport } from "pixi-viewport";

export interface FreeNoteData {
  id: string;
  content: string;
  x: number; // Welt-Koordinate X
  y: number; // Welt-Koordinate Y
}

/**
 * Zeichnet eine Notiz, die man mit der Maus verschieben kann.
 * @param onDragEnd - Callback, der die neue Position an React zurückgibt (optional)
 */
export function drawDraggableNote(
  viewport: Viewport,
  note: FreeNoteData,
  onDragEnd?: (id: string, newX: number, newY: number) => void
) {
  const container = new Container();
  
  // Aktivieren der Interaktivität
  container.eventMode = 'static'; 
  container.cursor = 'pointer';

  // --- Visuelles Design (wie vorher) ---
  const style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 14,
    fill: "#333333",
    wordWrap: true,
    wordWrapWidth: 180,
  });
  const textObject = new Text({ text: note.content, style });
  textObject.x = 10;
  textObject.y = 10;

  const bg = new Graphics();
  const width = textObject.width + 20;
  const height = textObject.height + 20;
  
  bg.roundRect(0, 0, width, height, 8);
  bg.fill(0xfffae3); // Post-it Gelb
  bg.stroke({ width: 1, color: 0xccbfa3 });
  
  // Kleiner Schatten für "Schwebe-Effekt"
  bg.rect(3, 3, width, height); 
  bg.fill({ color: 0x000000, alpha: 0.1 });

  container.addChild(bg);
  container.addChild(textObject);

  // Position setzen
  container.x = note.x;
  container.y = note.y;

  // --- Drag & Drop Logik ---
  let dragData: FederatedPointerEvent | null = null;
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  const onDragStart = (event: FederatedPointerEvent) => {
    // Verhindert, dass der Viewport sich bewegt, während wir die Notiz bewegen
    event.stopPropagation();
    
    dragData = event;
    dragging = true;
    container.alpha = 0.8; // Transparenz während des Ziehens
    
    // Berechne den Offset, damit die Notiz nicht zur Mausmitte springt
    const parent = container.parent ?? container;
    const localPos = parent.toLocal(event.global);
    dragOffset.x = localPos.x - container.x;
    dragOffset.y = localPos.y - container.y;

    viewport.plugins.pause('drag'); // Viewport-Drag deaktivieren
  };

  const onDragMove = () => {
    if (dragging && dragData) {
      const parent = container.parent ?? container;
      const newPosition = parent.toLocal(dragData.global);
      container.x = newPosition.x - dragOffset.x;
      container.y = newPosition.y - dragOffset.y;
    }
  };

  const onDragStop = () => {
    if (dragging) {
      dragging = false;
      container.alpha = 1;
      dragData = null;
      viewport.plugins.resume('drag'); // Viewport-Drag wieder aktivieren

      // Rückmeldung an React (neue Koordinaten speichern)
      if (onDragEnd) {
        onDragEnd(note.id, container.x, container.y);
      }
    }
  };

  container.on('pointerdown', onDragStart);
  container.on('globalpointermove', onDragMove); // 'global', falls Maus Container verlässt
  container.on('pointerup', onDragStop);
  container.on('pointerupoutside', onDragStop);

  viewport.addChild(container);
}
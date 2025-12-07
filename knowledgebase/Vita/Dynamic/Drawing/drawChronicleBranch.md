drawChronicleBranch ist in mehre Unterfunktionen aufgeteilt.

1. computeGeometry:
   Hier wird der Start und Endpunkt eines Branches berechnet und an den Momentanen Viewport auch angepasst. (Aus Knoten werden Normalized-Knoten + mit der screenwidth wird dann die Passende Position am Bildschirm berechnet)
2. drawBranch ist dann die Funktion, die dann mit den berechneten Knoten den Branch zeichnet
3. redraw() ist die Funktion die Funktion, die über einen [[Subscription|Listener]] aufgerufen werden kann. 
4. unsubBranch/unsubGlobal gibt die ID und die redraw Funktion an die API weiter. 
   dadurch lässt sich die redraw Funktion in der StyleAPI aufrufen
5. 
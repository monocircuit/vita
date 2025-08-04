A [[ChroniclePath]] defines the path a chronicles takes on the canvas of the [[Dynamic Vita]]. It consists of a [[Chronicle]] and at least one chronicle knots (see [[ChroniclePathKnot]]).

### What happens if there is only one [[ChroniclePathKnot]] in the [[ChroniclePath]]?
Should this be the case the renderer would know to render the [[ChroniclePath]] horizontally until the end of the screen, basically meaning that it drags on until the present.
# Schema
```
{
	chronicleId: number;
	chronicleKnots: { layer: number; date: Date }[];
}
```

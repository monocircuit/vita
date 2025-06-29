A [[ChroniclePath]] defines the path a chronicles takes on the canvas of the [[DynamicVita]]. It consists of a [[Chronicle]] and at least one chronicle knots (see [[ChronicleKnot]]). 
# Schema
```
{
	chronicleId: number;
	chronicleKnots: { layer: number; date: Date }[];
}
```

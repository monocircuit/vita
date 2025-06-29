A [[Chronicle]] is the smallest instance for a [[Vita]] with chronical data, meaning it contains or is supposed to contain timestamps. Chronicles can be categorized into a [[ChronicleCategory]] e.g. `experience` or `education`.
# Schemas
###### $ChronicleOverhead
```
{
	id: number;
	userId: string;

	createdAt: Date;
	updatedAt: Date;
}
```
###### $Chronicle
```
{
	entityId: number;
	
	title: string;
	description: string;

	knots: Date[];

	category: ChronicleCategory;
	scope: Scope;
}
```
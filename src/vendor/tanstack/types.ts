export interface DbShape {
  public: {
    Tables: Record<
      string,
      {
        Row: object;
        Insert: object;
        Update: object;
      }
    >;
    Enums: Record<string, string>;
  };
}

export type SchemasShape = Record<string, { Normalized: object }>;

export type DbTableName<DB extends DbShape> = Extract<
  keyof DB["public"]["Tables"],
  string
>;

export type DbEnumName<DB extends DbShape> = Extract<
  keyof DB["public"]["Enums"],
  string
>;

export type DbRow<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DB["public"]["Tables"][Table]["Row"];

export type DbInsert<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DB["public"]["Tables"][Table]["Insert"];

export type DbUpdate<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DB["public"]["Tables"][Table]["Update"];

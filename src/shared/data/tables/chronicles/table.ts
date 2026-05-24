export const chroniclesTable: {
  tableName: "chronicles";
  primaryKeyParts: "id"[];
  baseKey: () => string[];
} = {
  tableName: "chronicles",
  primaryKeyParts: ["id"],
  baseKey: () => ["chronicles"],
};

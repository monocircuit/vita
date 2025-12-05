const getPrimaryKey = <Row>(row: Row, primaryKeyParts: (keyof Row)[]) => {
  const primaryKey: Row[keyof Row][] = [];

  for (const primaryKeyPart of primaryKeyParts) {
    primaryKey.push(row[primaryKeyPart]);
  }

  return primaryKey;
};

export default getPrimaryKey;

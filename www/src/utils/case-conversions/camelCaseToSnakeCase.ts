function camelCaseToSnakeCase(str: string): string {
  return (
    str
      // userID → user_id
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      // HTTPCode → http_code
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
      .toLowerCase()
  );
}

export default camelCaseToSnakeCase;

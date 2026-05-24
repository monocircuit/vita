function isValidInteger(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && Number.isFinite(n);
}
export default isValidInteger;

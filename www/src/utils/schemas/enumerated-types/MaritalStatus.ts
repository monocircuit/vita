import zod from "zod";

/** Schemas */
const $MaritalStatus = zod
  .enum(["single", "married", "divorced", "widowed", "separated", "partnered"])
  .describe(
    "Marital status of the user, indicating their current relationship status. Options include single, married, divorced, widowed, separated, or partnered.",
  );

export default $MaritalStatus;

/** Types */
export type MaritalStatus = zod.infer<typeof $MaritalStatus>;

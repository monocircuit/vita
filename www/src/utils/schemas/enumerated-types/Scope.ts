import zod from "zod";

const Scope = zod
  .enum(["public", "private", "restricted"])
  .describe(
    "Scope of the resource, indicating its visibility and access level. Options include public (accessible to everyone), private (accessible only to the owner), or restricted (accessible to a specific group or under certain conditions).",
  );

export default Scope;

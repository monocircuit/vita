import zod from "zod";

const data_scope = zod.enum(["public", "private", "restricted"]);

export default data_scope;

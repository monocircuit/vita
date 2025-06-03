import zod from "zod";

const chronicle_category = zod.enum([
  "education",
  "internship",
  "work experience",
]);

export default chronicle_category;

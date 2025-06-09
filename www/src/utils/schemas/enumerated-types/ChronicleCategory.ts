import zod from "zod";

const ChronicleCategory = zod.enum([
  "education",
  "internship",
  "work experience",
]);

export default ChronicleCategory;

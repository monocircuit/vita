import zod from "zod";
import MaritalStatus from "./enumerated-types/MaritalStatus";

const Profile = zod.object({
  id: zod
    .string({ required_error: "ID is requiered" })
    .describe("unique identifier of the user profile"),

  firstName: zod.string().describe("first name of the user").optional(),
  lastName: zod.string().describe("last name of the user").optional(),

  dayOfBirth: zod.date().describe("date of birth of the user").optional(),
  maritalStatus: MaritalStatus.optional(),

  avatarUrl: zod
    .string()
    .describe("URL to the profile picture of the user")
    .optional(),
});

export default Profile;

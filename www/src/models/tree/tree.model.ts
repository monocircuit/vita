import { CredentialModel } from "../credential/credential.model";

export interface TreeModel {
    id: string;
    user: string;
    credentials: Omit<
        CredentialModel,
        "user" | "title" | "description" | "type" | "startDate" | "endDate"
    >[];
}

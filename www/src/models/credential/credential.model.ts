export interface CredentialModel {
    id: string;
    title: string;
    description: string;
    type: string;
    startDate: Date;
    endDate: Date;
    user: string;
    priority: number;
}

export type CredentialForTreeModel = Omit<
    CredentialModel,
    "user" | "title" | "description" | "type" | "startDate" | "endDate"
>;

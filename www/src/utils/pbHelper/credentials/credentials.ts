import { CredentialModel } from "@/models/credential/credential.model";
import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

const pb = new PocketBase(PB_URL);

export const credentialApi = () => {
    const createCredentials = async (data: CredentialModel) => {
        try {
            const record = await pb.collection("credentials").create(data);
            return record;
        } catch (error) {
            console.error("Creation failed", error);
            throw error;
        }
    };
    const getCredentials = async () => {
        try {
            const records = await pb.collection("credentials").getFullList({
                sort: "startDate",
            });
            return records;
        } catch (error) {
            console.error("Cant Fetch Data", error);
            throw error;
        }
    };
    const getCredentialById = async (id: string) => {
        try {
            const record = await pb.collection("credentials").getOne(id, {}); //Testen von Expanding Field
            return record;
        } catch (error) {
            console.error("Cant Fetch Data", error);
            throw error;
        }
    };
    const updateCredentialById = () => {};
    const deleteCredentialById = () => {};
};

export default credentialApi;

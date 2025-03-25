import { CredentialModel } from "@/models/credential/credential.model";
import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

const pb = new PocketBase(PB_URL);

export const credentialApi = {
    createCredentials: async (data: Omit<CredentialModel, "priority">) => {
        try {
            pb.authStore.record?.id ? (data.user = pb.authStore.record?.id) : (data.user = "");

            const record = await pb.collection("credentials").create(data);
            return record;
        } catch (error) {
            console.error("Cant Create Data", error);
            throw error;
        }
    },

    getCredentials: async () => {
        try {
            const records = await pb.collection("credentials").getFullList({
                sort: "startDate",
            });
            return records;
        } catch (error) {
            console.error("Cant Fetch Data", error);
            throw error;
        }
    },

    getCredentialById: async (id: string) => {
        try {
            const record = await pb.collection("credentials").getOne(id, {}); //Testen von Expanding Field
            return record;
        } catch (error) {
            console.error("Cant Fetch Data", error);
            throw error;
        }
    },

    updateCredentialById: async (data: Omit<CredentialModel, "user" | "id">) => {
        try {
            const record = await pb.collection("credentials").create(data);
            return record;
        } catch (error) {
            console.error("Cant Create Data", error);
            throw error;
        }
    },

    deleteCredentialById: async (id: string) => {
        try {
            const record = await pb.collection("credentials").delete(id); //Testen von Expanding Field
            return record;
        } catch (error) {
            console.error("Cant Delete Data", error);
            throw error;
        }
    },
};

export const fetchData = async () => {
    const test = await credentialApi.getCredentials();
    return test;
};

export default credentialApi;

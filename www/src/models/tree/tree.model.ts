import { CredentialModel } from "../credential/credential.model";

interface TreeModel {
  id: string;
  user: string;
  credentials: { credentialModelID: string; priority: number }[];
}

import { CredentialModel } from "../credential/credential.model";

interface TreeModel {
  id: string;
  user: string;
  entryNode: string;
  // credentials: { credentialModelID: string; priority: number }[];
}

interface TreeNode {
  id: string;
  orientation: boolean;
  parent: TreeNode;
  children: TreeNode[];
}

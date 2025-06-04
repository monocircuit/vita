import { RecordModel } from "pocketbase";

interface ChronicleRelation extends RecordModel {
  user: string;
  chronicle: string;

  name: string;

  parent: string;
  children: string[];

  orientation: boolean;

  created: Date;
  updated: Date;
}

export default ChronicleRelation;

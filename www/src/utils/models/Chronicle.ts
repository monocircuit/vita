import { RecordModel } from "pocketbase";

interface Chronicle extends RecordModel {
  user: string;
  entity: string;

  title: string;
  description: string;

  type: string;

  start: Date;
  end: Date;

  created: Date;
  updated: Date;
}

export default Chronicle;

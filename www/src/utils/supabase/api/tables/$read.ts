import { TTimestamps } from "./_mapping";

export const normalizeTimestamps = <T extends TTimestamps>(data: T) => {
  return {
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
};

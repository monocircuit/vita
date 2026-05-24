import { TanstackWriter } from "@/shared/data/tanstack";
import { chroniclesTable } from "./table";

/**
 * Writer hook for storing chronicles.
 *
 * Uses TanstackWriter API:
 * - Handles denormalization/normalization via runtime schemas
 * - Performs upsert writes by primary key
 * - Invalidates matching chronicles query keys
 */
const useChronicleWriter = TanstackWriter.on(chroniclesTable).build();

export default useChronicleWriter;

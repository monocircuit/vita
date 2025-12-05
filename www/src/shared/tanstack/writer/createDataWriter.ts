// "use client";

// import { useMutation } from "@tanstack/react-query";
// import { DataWriterConfig } from "../reader/types";
// import { createClient } from "../../supabase/client";

// export function createDataWriter<NormalizedTableRow extends object>(
//   config: DataWriterConfig<NormalizedTableRow>,
// ) {
//   return () => {
//     const mutation = useMutation({
//       mutationFn: async (rows: NormalizedTableRow[]) => {
//         /* denormalization */
//         const denormalizedRows = rows.map(config.denormalize);

//         /*
//          * Doing a control check via a zod schema to check if the data that
//          * is supposed to be pushed to the database is valid.
//          */
//         denormalizedRows.forEach(row => {
//           config.schema.parse(row);
//         });

//         /*
//          * Injecting a supabase clientside cient into the fetch function to
//          * save on duplicate code.
//          */
//         const client = createClient();

//         /*
//          * This is a perfect spot to check if the user is correctly
//          * authenticated. This is a part of code that needs to be checked
//          * on every fetch.
//          */
//         const {
//           data: { user },
//           error: userError,
//         } = await client.auth.getUser();

//         if (userError) throw userError;
//         if (!user) throw new Error("No user logged in");

//         /* mutate the data via the provided mutation function */
//         await config.mutate(denormalizedRows);
//       },
//     });
//   };
// }

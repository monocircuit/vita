/**
 * Namespace `RecordEntry` represents structured records for experiences or education entries,
 * typically used for managing and categorizing user data.
 */
export namespace RecordEntry {
  /**
   * Namespace `Types` contains constants representing the types of records
   * that can be created, such as `Experience` or `Education`.
   */
  export namespace Types {
    /**
     * Represents an "Experience" type record.
     */
    export const Experience = 0;

    /**
     * Represents an "Education" type record.
     */
    export const Education = 1;
  }

  /**
   * Interface `Model` defines the structure of a record entry,
   * including metadata such as type, title, description, and dates.
   */
  export interface Model {
    /**
     * A unique identifier for the record entry.
     */
    id: string;

    /**
     * The ID of the user to whom this record belongs.
     */
    user: string;

    /**
     * The type of the record, which can be one of the values defined in `RecordEntry.Types`.
     */
    type: (typeof Types)[keyof typeof Types];

    /**
     * The title of the record, summarizing its content or purpose.
     */
    title: string;

    /**
     * A detailed description of the record entry.
     */
    description: string;

    /**
     * The start date of the activity or period represented by the record.
     */
    startDate: Date;

    /**
     * The end date of the activity or period represented by the record.
     */
    endDate: Date;
  }
}

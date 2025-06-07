/**
 * Data type for log metadata.
 * Used for formatting log messages with timestamps, logging levels, and the message itself.
 */
export type TMetaDataLogs = {
  timestamp: string; // Time when the message was logged
  level: string; // Logging level (e.g., info, error, warn)
  message: string; // Content of the message
  context?: string; // Context where the log method was called
};

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "DOUBLE_BOOKING_CONFLICT"
  | "INVALID_STATUS_TRANSITION"
  | "DUPLICATE_REVIEW"
  | "MENTOR_NOT_VERIFIED"
  | "INTERNAL_SERVER_ERROR";

export class ApiError extends Error {
  code: ErrorCode;
  statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function createErrorResponse(code: ErrorCode, message: string, statusCode: number = 400) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status: statusCode }
  );
}

export function parseErrorMessage(error: unknown): string {
  let message = ''

  if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  return message
}
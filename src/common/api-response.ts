export interface ApiResponseData<T> {
  statusCode: number;
  message: string;
  content: T;
  dateTime: string;
}

export function success<T>(content: T, message = 'Thành công', statusCode = 200): ApiResponseData<T> {
  return {
    statusCode,
    message,
    content,
    dateTime: new Date().toISOString(),
  };
}

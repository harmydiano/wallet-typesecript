export interface ApiResponse {
  success: boolean;
  meta: {
    status_code: number;
    message?: string;
    token?: string;
  };
  data?: any;
}

export default class AppResponse {
  /**
   * Get success meta object
   */
  static getSuccessMeta(): { status_code: number; [key: string]: any } {
    return {
      status_code: 200
    };
  }

  /**
   * Format API response
   */
  static format(meta: any, data?: any): ApiResponse {
    const response: ApiResponse = {
      success: meta.status_code < 400,
      meta
    };
    if (data !== undefined) {
      response.data = data;
    }
    return response;
  }

  /**
   * Create error response
   */
  static formatError(message: string, statusCode: number, errors?: any): ApiResponse {
    return {
      success: false,
      meta: {
        status_code: statusCode,
        message
      },
      data: errors
    };
  }
} 
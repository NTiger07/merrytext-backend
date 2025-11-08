/**
 * Standard API response format
 */
class ApiResponse {
  static success(data, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message = "Error", errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }
}

module.exports = ApiResponse;

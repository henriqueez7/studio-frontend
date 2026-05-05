export function getErrorMessage(error, fallback = "Ocorreu um erro inesperado.") {
  const responseData = error?.response?.data;

  if (error?.code === "ERR_NETWORK") {
    return "Não foi possível conectar ao backend. Verifique se a API está rodando e se a URL configurada está correta.";
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData?.error === "string" && responseData.error.trim()) {
    return responseData.error;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  if (Array.isArray(responseData?.details) && responseData.details.length > 0) {
    const firstDetail = responseData.details[0];

    if (typeof firstDetail === "string" && firstDetail.trim()) {
      return firstDetail;
    }

    if (typeof firstDetail?.message === "string" && firstDetail.message.trim()) {
      return firstDetail.message;
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

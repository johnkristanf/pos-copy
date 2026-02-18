export const addKeyHeaders = <T>(options?: T, token?: string) => {
  const optionsWithHeaders = (options || {}) as any

  if (!optionsWithHeaders.headers) {
    optionsWithHeaders.headers = {}
  }

  if (token) {
    optionsWithHeaders.headers.Authorization = `Bearer ${token}`
  }

  return optionsWithHeaders
}

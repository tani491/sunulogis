export class InvalidJsonResponseError extends Error {
  status: number
  statusText: string
  bodyPreview: string

  constructor(response: Response, bodyPreview: string) {
    super(
      `Expected JSON response but received ${response.status} ${response.statusText}: ${bodyPreview}`
    )
    this.name = 'InvalidJsonResponseError'
    this.status = response.status
    this.statusText = response.statusText
    this.bodyPreview = bodyPreview
  }
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text()

  if (!rawText) {
    return null as T
  }

  try {
    return JSON.parse(rawText) as T
  } catch {
    const bodyPreview = rawText.replace(/\s+/g, ' ').slice(0, 180)
    throw new InvalidJsonResponseError(response, bodyPreview)
  }
}

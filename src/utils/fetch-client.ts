import { toast } from 'sonner'

export async function fetchClient<T>(url: string, options: RequestInit = {}): Promise<{
  data: T
  message: string
  code: number
}> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '请求失败')
    }

    return await response.json()
  } catch (error) {
    toast.error((error as Error).message || '请求失败')
    throw error
  }
}

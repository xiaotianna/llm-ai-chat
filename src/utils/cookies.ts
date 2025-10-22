import { cookies } from 'next/headers'

export const getCookes = async (key: string) => {
  const cookie = (await cookies()).get(key)?.value
  return cookie
}

export const setCookies = async (key: string, value: string) => {
  const cookie = await cookies()
  cookie.set(key, value)
}

export const deleteCookies = async (key: string) => {
  const cookie = await cookies()
  cookie.delete(key)
}

export const USER_TYPE = {
  GITHUB: 'github'
} as const

export const USER_TYPE_MAP = {
  [USER_TYPE.GITHUB]: 'GitHub'
} as const

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE]

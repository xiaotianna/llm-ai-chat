// ai角色类型
export type AIRoleType = 'system' | 'user' | 'assistant' | 'tool'
// 消息角色类型
export type MessageRoleType = Exclude<AIRoleType, 'system'>

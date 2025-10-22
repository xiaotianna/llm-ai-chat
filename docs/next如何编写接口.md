# server actions

使用 Server Action（Next.js App Router 推荐）

Server Action 是 Next.js 提供的一种新的服务器端操作方式，可以直接在组件中调用服务端逻辑，无需手动创建 API 路由。

示例：在客户端组件中使用 Server Action

```tsx
'use client'
import { useState } from 'react'
import { login } from './actions'

const LoginPage = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const result = await login(phone, password)
    console.log(result)
  }

  return (
    <div>
      {/* 输入框和按钮 */}
      <Button onClick={handleLogin}>登录</Button>
    </div>
  )
}
```

创建 actions.ts（Server Action）：

```ts
// app/login/actions.ts
'use server'

export async function login(phone: string, password: string) {
  // 这里可以调用数据库或其他服务
  console.log('手机号:', phone)
  console.log('密码:', password)

  // 模拟登录逻辑
  if (password === '123456') {
    return { success: true, message: '登录成功' }
  } else {
    return { success: false, message: '密码错误' }
  }
}
```

✅ Server Action 会自动在服务端运行，可以安全地访问数据库、文件系统等。

## 使用 API Route（传统方式）

如果你不想使用 Server Action，也可以使用传统的 API 路由。

创建 pages/api/login.ts（或 app/api/login/route.ts）：

```ts
// pages/api/login.ts 或 app/api/login/route.ts
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { phone, password } = req.body

  // 模拟登录逻辑
  if (password === '123456') {
    res.status(200).json({ success: true, message: '登录成功' })
  } else {
    res.status(401).json({ success: false, message: '密码错误' })
  }
}
```

在客户端组件中调用：

```ts
const handleLogin = async () => {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  })

  const data = await res.json()
  console.log(data)
}
```

## Server Action 使用规范

1. 必须使用 'use server' 指令

Server Action 必须是一个定义在服务端的函数，并且文件顶部必须有 'use server' 的指令。

```ts
// 'use server' 表示这是一个服务端代码
'use server'

export async function login(phone, password) {
  // 服务端逻辑
}
```

2. 必须写在 app 目录下的文件中

Next.js 会自动将 app/ 目录下带有 'use server' 的函数作为 Server Action 处理。

✅ 推荐路径结构：

```md
app/
 └── login/
     ├── page.tsx        <-- 客户端组件
     └── actions.ts      <-- Server Action
```

虽然没有强制要求文件名必须是某个特定名字（如 actions.ts），但建议遵循以下命名规范以提高可维护性：

3. ✅ 如何调用 Server Action

在客户端组件中导入并调用：

```tsx
'use client'
import { useState } from 'react'
import { login } from './actions' // 从 actions.ts 导出

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const result = await login(phone, password)
    console.log(result)
  }

  return (
    <div>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>登录</button>
    </div>
  )
}
```
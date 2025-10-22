- middleware.ts

- /layout.tsx 的<GlobalLoading />组件

- /components/GlobalLoading.tsx

- /login/page.tsx 的登录判断

```tsx
// 如果用户已登录，重定向到首页
useEffect(() => {
  if (isInitialized && user) {
    toast.info('您已经登录，正在跳转到首页...')
    router.replace('/')
  }
}, [isInitialized, user, router])

// 如果用户已登录，不渲染登录页面内容
if (user) {
  return null
}
```

- 全局loading状态在store中管理

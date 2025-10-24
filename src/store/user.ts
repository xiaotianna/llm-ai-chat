import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/config/supabase'
import { getUserInfoFromCookies } from '@/utils/get-userInfo-from-cookies'
import cookie from 'js-cookie'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  token: string
  joinDate: string
  type: 'github'
}

interface UserStore {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initializeUser: () => Promise<void>
  getUserFromCookies: () => User | null
  clearUser: () => void
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      
      setUser: (user) => {
        set({ user });
        // 同时保存到cookies
        if (typeof window !== 'undefined') {
          if (user) {
            const userInfoString = JSON.stringify(user);
            cookie.set('user-info', userInfoString);
            localStorage.setItem('user-storage', userInfoString);
          } else {
            cookie.remove('user-info');
            localStorage.removeItem('user-storage');
          }
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      getUserFromCookies: () => {
        return getUserInfoFromCookies();
      },
      
      initializeUser: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        
        try {
          // 首先尝试从 cookies 中获取用户信息
          const cookieUserInfo = getUserInfoFromCookies();
          if (cookieUserInfo) {
            set({ user: cookieUserInfo, isLoading: false, isInitialized: true });
            return;
          }

          // 如果 cookies 中没有信息，尝试从 Supabase 获取
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, isLoading: false, isInitialized: true });
            return;
          }

          if (!session || !session.user) {
            console.log('No session or user found');
            set({ user: null, isLoading: false, isInitialized: true });
            return;
          }

          const user = session.user;
          const userInfo: User = {
            id: user.id,
            name: (user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split('@')[0] || 'GitHub User'),
            email: user.email || '',
            avatar: (user.user_metadata?.avatar_url || '/logo.png'),
            token: session.access_token || '', // 从session中获取access token
            joinDate: new Date(user.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long'
            }),
            type:  'github'
          };
          // 确保用户信息被正确存储到 Cookie 中
          get().setUser(userInfo);
          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Error initializing user:', error);
          set({ user: null, isLoading: false, isInitialized: true });
        }
      },
      
      clearUser: async () => {
        try {
          // 调用Supabase的登出方法
          await supabase.auth.signOut();
          
          // 清除store中的用户状态
          set({ user: null, isInitialized: false });
          
          // 清除cookies
          if (typeof window !== 'undefined') {
            cookie.remove('user-info');
          }
          
          // 清除localStorage中的持久化数据
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user-storage');
          }
        } catch (error) {
          console.error('Error during logout:', error);
          // 即使Supabase登出失败，也要清除本地数据
          set({ user: null, isInitialized: false });
          if (typeof window !== 'undefined') {
            cookie.remove('user-info');
            localStorage.removeItem('user-storage');
          }
          throw error;
        }
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // 只持久化用户信息
    }
  )
);

export { useUserStore }

// 导出便捷的访问函数
export const getUserInfo = () => useUserStore.getState().user
export const setUserInfo = (user: User | null) => useUserStore.getState().setUser(user)
export const initializeUser = () => useUserStore.getState().initializeUser()
export const clearUserInfo = () => useUserStore.getState().clearUser()

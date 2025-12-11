// composables/useDirectusAuth.ts
import { useRuntimeConfig } from '#imports'

const TOKEN_KEY = 'directus_access_token'
const REFRESH_KEY = 'directus_refresh_token'
const USER_KEY = 'directus_user'

// Helper to safely access localStorage only on client
const isClient = () => import.meta.client
const storage = {
  getItem: (key: string) => isClient() ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => isClient() && localStorage.setItem(key, value),
  removeItem: (key: string) => isClient() && localStorage.removeItem(key),
}

export const useDirectusAuth = () => {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.directusBase || '').replace(/\/$/, '')

  // === LOGIN ===
  const login = async (email: string, password: string) => {
    const res = await $fetch<{ data: { access_token: string; refresh_token: string; expires: number } }>(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })

    const { access_token, refresh_token, expires } = res.data

    storage.setItem(TOKEN_KEY, access_token)
    storage.setItem(REFRESH_KEY, refresh_token || '')
    storage.setItem('token_expires_at', String(Date.now() + expires))

    await fetchUser()
    return res
  }

  // === REGISTER ===
  const register = async ({ email, password, first_name, last_name }: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => {
    const payload: any = { email, password }
    if (first_name) payload.first_name = first_name
    if (last_name) payload.last_name = last_name
    if (config.public.registerRole) payload.role = config.public.registerRole

    await $fetch(`${baseUrl}/users`, {
      method: 'POST',
      body: payload,
    })

    // Auto-login after successful registration (most common flow)
    return await login(email, password)
  }

  // === LOGOUT ===
  const logout = () => {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(REFRESH_KEY)
    storage.removeItem(USER_KEY)
    storage.removeItem('token_expires_at')
    navigateTo('/auth/login')
  }

  // === FETCH CURRENT USER ===
  const fetchUser = async () => {
    const token = getAccessToken()
    if (!token) return null

    try {
      const user = await $fetch(`${baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      storage.setItem(USER_KEY, JSON.stringify(user))
      return user
    } catch (err: any) {
      if (err.status === 401) logout()
      return null
    }
  }

  // === HELPERS ===
  const getAccessToken = () => storage.getItem(TOKEN_KEY)
  const getRefreshToken = () => storage.getItem(REFRESH_KEY)

  const getUser = () => {
    if (!import.meta.client) return null // prevent SSR issues

    const raw = storage.getItem(USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch (error) {
      console.error('Invalid user data in localStorage, clearing...', error)
      storage.removeItem(USER_KEY) // clean corrupted data
      return null
    }
  }

  const isLoggedIn = () => {
    if (!isClient()) return false
    const token = getAccessToken()
    const expiresAt = storage.getItem('token_expires_at')
    if (!token || !expiresAt) return false
    return Date.now() < Number(expiresAt)
  }

  // === TOKEN REFRESH ===
  const refreshToken = async (): Promise<string> => {
    const refresh = getRefreshToken()
    if (!refresh) throw logout()

    try {
      const res = await $fetch<{ data: { access_token: string; refresh_token: string; expires: number } }>(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: { refresh_token: refresh },
      })

      const { access_token, refresh_token, expires } = res.data
      storage.setItem(TOKEN_KEY, access_token)
      storage.setItem(REFRESH_KEY, refresh_token || refresh)
      storage.setItem('token_expires_at', String(Date.now() + expires))
      return access_token
    } catch {
      logout()
      throw new Error('Refresh failed')
    }
  }

  // === AUTHENTICATED FETCH ===
  const authenticatedFetch = async (url: string, options: any = {}) => {
    let token = getAccessToken()
    if (!token || !isLoggedIn()) throw logout()

    options.headers = options.headers || {}
    options.headers.Authorization = `Bearer ${token}`

    try {
      return await $fetch(url, options)
    } catch (err: any) {
      if (err.status === 401) {
        token = await refreshToken()
        options.headers.Authorization = `Bearer ${token}`
        return await $fetch(url, options)
      }
      throw err
    }
  }

  return {
    login,
    register,
    logout,
    fetchUser,
    isLoggedIn,
    getUser,
    getAccessToken,
    refreshToken,
    authenticatedFetch,
  }
}
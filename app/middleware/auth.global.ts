export default defineNuxtRouteMiddleware((to) => {
  // Only run on client to avoid SSR mismatches
  if (import.meta.server) return;

  const { isLoggedIn } = useDirectusAuth()

  // Allow all /auth routes
  if (to.path.startsWith('/auth')) {
    if (isLoggedIn()) {
      return navigateTo('/')
    }
    return
  }

  // Protected routes
  if (!isLoggedIn()) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
})

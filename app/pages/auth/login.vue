<!-- @format -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <BaseButton
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </BaseButton>
      </form>

      <div class="mt-4 text-center text-sm">
        <a href="/auth/register" class="text-blue-600 hover:underline">Create account</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useDirectusAuth } from "~/composables/useDirectusAuth"

definePageMeta({
  layout: "auth",
})

const router = useRouter()
const { login } = useDirectusAuth()

const email = ref("")
const password = ref("")
const loading = ref(false)
const errorMessage = ref("")

const extractError = (err) => {
  console.error("🔴 Login Error:", err)

  // Directus error structure
  if (err?.data?.errors?.length) {
    return err.data.errors[0].message
  }

  if (err?.message) return err.message

  return "An unexpected error occurred. Please try again."
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    console.log("🔵 Attempting login with:", email.value)

    await login(email.value, password.value)

    console.log("🟢 Login success — navigating home")
    router.push("/")
  } catch (err) {
    errorMessage.value = extractError(err)
  } finally {
    loading.value = false
  }
}
</script>

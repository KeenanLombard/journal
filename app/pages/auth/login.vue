<!-- @format -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
    <div
      class="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200"
    >
      <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">
        Welcome Back
      </h1>
      <p class="text-center text-gray-500 text-sm mb-6">
        Please sign in to continue
      </p>

      <!-- Error Message -->
      <transition name="fade">
        <div
          v-if="errorMessage"
          class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg"
        >
          {{ errorMessage }}
        </div>
      </transition>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1">
          <label class="block text-sm font-semibold text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <BaseButton
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Logging in...</span>
          <span v-else>Login</span>
        </BaseButton>
      </form>

      <!-- Footer -->
      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Don’t have an account?</span>
        <a href="/auth/register" class="text-blue-600 font-medium hover:underline ml-1">
          Create one
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useDirectusAuth } from "~/composables/useDirectusAuth"

definePageMeta({ layout: "auth" })

const router = useRouter()
const { login } = useDirectusAuth()

const email = ref("")
const password = ref("")
const loading = ref(false)
const errorMessage = ref("")

const extractError = (err) => {
  console.error("🔴 Login Error:", err)

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

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

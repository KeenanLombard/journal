<!-- @format -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create Account
      </h1>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg"
      >
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-lg"
      >
        {{ successMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Email -->
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          required
          placeholder="Enter your email"
          id="register_email"
        />

        <!-- Password -->
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          required
          placeholder="Create a password"
          id="register_password"
        />

        <!-- First Name (optional, but matches Directus structure) -->
        <BaseInput
          v-model="firstName"
          label="First Name"
          type="text"
          placeholder="Your name (optional)"
          id="register_firstname"
        />

        <!-- Register Button -->
        <BaseButton
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Creating account...</span>
          <span v-else>Register</span>
        </BaseButton>
      </form>

      <div class="mt-4 text-center text-sm">
        <span class="text-gray-600">Already have an account?</span>
        <a href="/auth/login" class="text-blue-600 hover:underline ml-1">
          Login
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useDirectusAuth } from "~/composables/useDirectusAuth"

definePageMeta({
  layout: "auth",
})

const router = useRouter()
const { register } = useDirectusAuth()

const email = ref("")
const password = ref("")
const firstName = ref("")

const loading = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const extractError = (err) => {
  console.error("🔴 Register Error:", err)

  if (err?.data?.errors?.length) return err.data.errors[0].message
  if (err?.message) return err.message

  return "Something went wrong while creating the account."
}

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    console.log("🔵 Attempting registration:", email.value)

    await register({
      email: email.value,
      password: password.value,
      first_name: firstName.value || null,
    })

    console.log("🟢 Registration successful")

    successMessage.value =
      "Account created successfully! Redirecting to login..."

    setTimeout(() => router.push("/auth/login"), 1200)
  } catch (err) {
    errorMessage.value = extractError(err)
  } finally {
    loading.value = false
  }
}
</script>

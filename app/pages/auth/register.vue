<!-- @format -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
    <div
      class="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200"
    >
      <h1 class="text-3xl font-extrabold text-gray-800 mb-3 text-center tracking-tight">
        Create Account
      </h1>
      <p class="text-center text-gray-500 text-sm mb-6">
        Get started by creating your account
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

      <!-- Success Message -->
      <transition name="fade">
        <div
          v-if="successMessage"
          class="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg"
        >
          {{ successMessage }}
        </div>
      </transition>

      <form @submit.prevent="handleRegister" class="space-y-5">
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

        <!-- First Name -->
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
          class="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Creating account...</span>
          <span v-else>Register</span>
        </BaseButton>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-gray-600">Already have an account?</span>
        <a href="/auth/login" class="text-blue-600 font-medium hover:underline ml-1">
          Log in
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useDirectusAuth } from "~/composables/useDirectusAuth"

definePageMeta({ layout: "auth" })

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

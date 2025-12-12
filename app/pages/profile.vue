<!-- pages/profile.vue -->
<template>
  <div class="p-4 md:p-8">
    <div class="container mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">My Profile</h1>

          <div class="flex gap-3">
            <!-- Logout -->
            <button
              @click="handleLogout"
              class="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            <!-- Edit / Save / Cancel -->
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>

            <div v-else class="flex gap-2">
              <button @click="handleSave" class="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition">
                Save
              </button>
              <button @click="handleCancel" class="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-600">Loading your profile...</p>
        </div>

        <!-- Profile Form -->
        <div v-else class="flex flex-col md:flex-row gap-8">
          <!-- Avatar -->
          <div class="flex flex-col items-center">
            <div class="relative">
              <div class="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold overflow-hidden shadow-xl">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                <span v-else>{{ profileInitial }}</span>
              </div>

              <label v-if="isEditing"
                class="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input ref="fileInput" type="file" accept="image/*" @change="handlePhotoUpload" class="hidden" />
              </label>
            </div>
          </div>

          <!-- Fields -->
          <div class="flex-1 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 font-bold text-md">Email</label>
              <!-- <input v-if="isEditing" v-model="user.email" type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" /> -->
              <p class="text-blue-600">{{ user.email }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 font-bold text-md">First Name</label>
                <input v-if="isEditing" v-model="user.first_name" type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <p v-else class="text-gray-600">{{ user.first_name || '-' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 font-bold text-md">Last Name</label>
                <input v-if="isEditing" v-model="user.last_name" type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <p v-else class="text-gray-600">{{ user.last_name || '-' }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 font-bold text-md">Bio</label>
              <textarea v-if="isEditing" v-model="user.description" rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us about yourself..."></textarea>
              <p v-else class="text-gray-600">{{ user.description || 'No description added yet.' }}</p>
            </div>
          </div>
        </div>
      </div>
      <ChartProfile :mood-counts="mood_counts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useDirectusAuth } from '~/composables/useDirectusAuth'

import { useJournalEntries } from '#imports'

const { getMoodCounts } = useJournalEntries()
const mood_counts = ref({})


const { getUser, isLoggedIn, logout: directusLogout, authenticatedFetch } = useDirectusAuth()

const loading = ref(true)
const isEditing = ref(false)

// This is our single source of truth — always defined
const user = reactive({
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  description: null as string | null,
  avatar: null as string | null,
})

// Keep a pristine copy for cancel
let original = { ...user }

const avatarUrl = computed(() => {
  if (!user.avatar) return null
  const base = useRuntimeConfig().public.directusBase.replace(/\/$/, '')
  return `${base}/assets/${user.avatar}?width=300&height=300&fit=cover&quality=80`
})

const profileInitial = computed(() => {
  return user.first_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'
})

onMounted(async () => {
  if (!isLoggedIn()) {
    return navigateTo('/auth/login')
  }

  await loadUserProfile()
  mood_counts.value = await getMoodCounts()
})

const loadUserProfile = async () => {
  loading.value = true
  try {
    const stored = getUser()
    console.log('Stored user from composable:', stored)

    // Directus returns { data: { ... } }
    const userData = stored?.data || stored

    if (userData) {
      Object.assign(user, userData)
      original = { ...userData } // fresh backup
    }
  } catch (err) {
    console.error('Failed to load user:', err)
  } finally {
    loading.value = false
  }
}

const handlePhotoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await authenticatedFetch(
      `${useRuntimeConfig().public.directusBase}/files`,
      { method: 'POST', body: formData }
    ) as { data: { id: string } }
    user.avatar = res.data.id
    console.log('Avatar uploaded:', res.data)
  } catch (err) {
    alert('Photo upload failed')
    console.error(err)
  }
}

const handleSave = async () => {
  try {
    await authenticatedFetch(`${useRuntimeConfig().public.directusBase}/users/me`, {
      method: 'PATCH',
      body: {
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        email: user.email,
        description: user.description || null,
        avatar: user.avatar,
      },
    })

    original = { ...user }
    isEditing.value = false
    alert('Profile saved!')
  } catch (err) {
    console.error('Save failed:', err)
    alert('Could not save profile')
  }
}

const handleCancel = () => {
  Object.assign(user, original)
  isEditing.value = false
}

const handleLogout = () => {
  if (confirm('Log out?')) {
    directusLogout()
  }
}
</script>
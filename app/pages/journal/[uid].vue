<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex flex-col items-center">
    <div class="w-full container bg-white shadow-lg rounded-2xl p-6">

      <!-- Header -->
      <h1 class="text-2xl font-bold text-gray-800 mb-2">
        Reflect on {{ formattedDate }} - {{ entry.data.mood }}
      </h1>
      <p class="text-gray-500 mb-6">Review your thoughts and mood for the day.</p>

      <!-- Entry Details -->
      <div class="space-y-4">

        <!-- Title -->
        <div>
          <h2 class="text-lg font-semibold text-gray-700">Title</h2>
          <p class="text-gray-800 mt-1">{{ entry.data.title }}</p>
        </div>

        <!-- Status -->
        <div>
          <h2 class="text-lg font-semibold text-gray-700">Status</h2>
          <p class="text-gray-800 mt-1 capitalize">{{ entry.data.status }}</p>
        </div>

        <!-- Created Date -->
        <div>
          <h2 class="text-lg font-semibold text-gray-700">Created On</h2>
          <p class="text-gray-800 mt-1">{{ formattedCreatedDate }}</p>
        </div>

        <!-- Content -->
        <div>
          <h2 class="text-lg font-semibold text-gray-700">Content</h2>
          <p class="text-gray-800 mt-1 whitespace-pre-line">{{ entry.data.content }}</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useJournalEntries } from '#imports'

const route = useRoute()
const { getEntry } = useJournalEntries()
const entry = ref({ data: {} })

onMounted(async () => {
  const uid = route.params.uid
  const result = await getEntry(uid)
  if (result) {
    entry.value = result
  }
})

// Format dates nicely
const formattedDate = computed(() => {
  if (!entry.value.data.date_created) return ''
  const d = new Date(entry.value.data.date_created)
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const formattedCreatedDate = computed(() => {
  if (!entry.value.data.date_created) return ''
  const d = new Date(entry.value.data.date_created)
  return d.toLocaleString()
})
</script>

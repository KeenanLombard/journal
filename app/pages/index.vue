<!-- @format -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex flex-col items-center">
    <div class="w-full bg-white container shadow-lg rounded-2xl">

      <!-- Toggle tabs -->
      <div class="flex border-b border-gray-200">
        <button
          class="flex-1 py-3 text-center font-medium"
          :class="activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
          @click="activeTab = 'form'"
        >
          Today
        </button>
        <button
          class="flex-1 py-3 text-center font-medium"
          :class="activeTab === 'entries' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
          @click="activeTab = 'entries'"
          :disabled="todayCount === 0"
        >
          Entries
        </button>
      </div>

      <!-- Tab content -->
      <div class="p-6">
        <!-- Entries tab -->
        <div v-if="activeTab === 'entries'">
          <ListJournalEntries />
        </div>

        <!-- Form tab -->
        <div v-else-if="activeTab === 'form'">
          <FormJournal @submitted="handleSubmit" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJournalEntries } from '#imports'

const { getTodayJournalCount } = useJournalEntries()
const todayCount = ref(0)
const activeTab = ref('entries') // 'entries' or 'form'

// Fetch today's entries count
onMounted(async () => {
  todayCount.value = await getTodayJournalCount()

  // If no entries, default to form tab
  if (todayCount.value === 0) activeTab.value = 'form'
})

// Handle form submission
const handleSubmit = () => {
  // Refresh count
  getTodayJournalCount().then(count => {
    todayCount.value = count
    activeTab.value = 'entries'
  })
}
</script>

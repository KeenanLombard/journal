<template>
  <div class="mx-auto p-6 container">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p class="font-medium">Error loading entries</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="loadEntries" 
        class="mt-2 text-sm text-red-600 hover:text-red-800 underline"
      >
        Try again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!entries || entries.length === 0" class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
      <p class="text-gray-500 mb-6">Start your journaling journey by creating your first entry</p>
      <a 
        href="/journal/new" 
        class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create First Entry
      </a>
    </div>

    <!-- Entries List -->
    <div v-else class="space-y-4">
      <!-- Filter/Sort Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="text-sm text-gray-600">
          Showing {{ filteredEntries.length }} {{ filteredEntries.length === 1 ? 'entry' : 'entries' }}
        </div>
        
        <div class="flex gap-2">
          <select 
            v-model="sortBy" 
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
          
          <button
            @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            :title="viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'"
          >
            <svg v-if="viewMode === 'grid'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
          @click="viewEntry(entry.id)"
        >
          <!-- Card Header -->
          <div class="p-6 pb-4">
            <div class="flex justify-between items-start mb-3">
              <h2 class="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {{ entry.title || 'Untitled Entry' }}
              </h2>
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full shrink-0 ml-2"
                :class="getMoodColor(entry.mood)"
              >
                {{ entry.mood }}
              </span>
            </div>
            
            <div class="text-sm text-gray-500 mb-4">
              <time :datetime="entry.date_created">
                {{ formatDate(entry.date_created) }}
              </time>
            </div>
            
            <p class="text-gray-600 text-sm line-clamp-3">
              {{ entry.content || 'No content available' }}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div class="text-xs text-gray-500">
              {{ getWordCount(entry.content) }} words
            </div>
            <div class="flex gap-2">
              <button
                @click.stop="editEntry(entry.id)"
                class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="confirmDelete(entry)"
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- List View -->
      <div v-else class="space-y-3">
        <article
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all p-6 cursor-pointer group"
          @click="viewEntry(entry.id)"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {{ entry.title || 'Untitled Entry' }}
                </h2>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full shrink-0"
                  :class="getMoodColor(entry.mood)"
                >
                  {{ entry.mood }}
                </span>
              </div>
              
              <p class="text-gray-600 text-sm line-clamp-2 mb-3">
                {{ entry.content || 'No content available' }}
              </p>
              
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <time :datetime="entry.date_created">
                  {{ formatDate(entry.date_created) }}
                </time>
                <span>•</span>
                <span>{{ getWordCount(entry.content) }} words</span>
              </div>
            </div>
            
            <div class="flex gap-2 shrink-0">
              <button
                @click.stop="editEntry(entry.id)"
                class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Edit"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="confirmDelete(entry)"
                class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Entry?</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete "{{ entryToDelete?.title || 'Untitled Entry' }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteEntry"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useJournalEntries } from '#imports'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getEntries, deleteEntry: apiDeleteEntry } = useJournalEntries()

const entries = ref([])
const loading = ref(true)
const error = ref(null)
const sortBy = ref('newest')
const viewMode = ref('grid')
const showDeleteModal = ref(false)
const entryToDelete = ref(null)
const deleting = ref(false)

// Computed filtered and sorted entries
const filteredEntries = computed(() => {
  let sorted = [...entries.value]
  
  // Remove entries with no title and no content
  sorted = sorted.filter(entry => entry.title || entry.content)
  
  // Sort based on selection
  switch (sortBy.value) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.date_created) - new Date(a.date_created))
      break
    case 'oldest':
      sorted.sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
      break
    case 'title':
      sorted.sort((a, b) => {
        const titleA = (a.title || 'Untitled').toLowerCase()
        const titleB = (b.title || 'Untitled').toLowerCase()
        return titleA.localeCompare(titleB)
      })
      break
  }
  
  return sorted
})

// Load entries
const loadEntries = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await getEntries()
    
    if (result.success) {
      entries.value = result.data || []
    } else {
      error.value = result.error || 'Failed to load entries'
    }
  } catch (err) {
    error.value = err.message
    console.error('Error loading entries:', err)
  } finally {
    loading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Get word count
const getWordCount = (content) => {
  if (!content) return 0
  return content.trim().split(/\s+/).length
}

// Get status color
const getMoodColor = (mood) => {
  switch (mood?.toLowerCase()) {
    case 'happy':
      return 'bg-green-100 text-green-700'
    case 'calm':
      return 'bg-blue-100 text-blue-700'
    case 'exited':
          return 'bg-purple-100 text-purple-700'
    case 'tired':
          return 'bg-yellow-100 text-yellow-700'
    case 'angry':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// View entry
const viewEntry = (id) => {
  router.push(`/journal/${id}`)
}

// Edit entry
const editEntry = (id) => {
  router.push(`/journal/${id}/edit`)
}

// Confirm delete
const confirmDelete = (entry) => {
  entryToDelete.value = entry
  showDeleteModal.value = true
}

// Delete entry
const deleteEntry = async () => {
  if (!entryToDelete.value) return
  
  deleting.value = true
  
  try {
    const result = await apiDeleteEntry(entryToDelete.value.id)
    
    if (result.success) {
      // Remove from local array
      entries.value = entries.value.filter(e => e.id !== entryToDelete.value.id)
      showDeleteModal.value = false
      entryToDelete.value = null
    } else {
      alert(`Failed to delete entry: ${result.error}`)
    }
  } catch (err) {
    console.error('Error deleting entry:', err)
    alert('Failed to delete entry. Please try again.')
  } finally {
    deleting.value = false
  }
}

// Load entries on mount
onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
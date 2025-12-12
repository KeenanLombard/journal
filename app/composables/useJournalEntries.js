// composables/useJournalEntries.js
import { ref } from 'vue'

export function useJournalEntries() {
  const loading = ref(false)
  const error = ref(null)

  // Adjust this base URL to match your backend API
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055'
  const COLLECTION_NAME = 'journal_entries' // Adjust to your collection name

  /**
   * Create a new journal entry
   * @param {Object} entryData - The journal entry data
   * @param {string} entryData.title - The entry title
   * @param {string} entryData.content - The entry content
   * @returns {Promise<Object>} The created entry
   */
  const createEntry = async (entryData) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/items/${COLLECTION_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: entryData.title,
          content: entryData.content
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result.data }
    } catch (err) {
      error.value = err.message
      console.error('Error creating journal entry:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all journal entries
   * @returns {Promise<Object>} List of entries
   */
  const getEntries = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/items/${COLLECTION_NAME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result.data }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching journal entries:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get a single journal entry by ID
   * @param {string} id - The entry ID
   * @returns {Promise<Object>} The entry
   */
  const getEntry = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/items/${COLLECTION_NAME}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result.data }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching journal entry:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a journal entry
   * @param {string} id - The entry ID
   * @param {Object} entryData - The updated data
   * @returns {Promise<Object>} The updated entry
   */
  const updateEntry = async (id, entryData) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/items/${COLLECTION_NAME}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: entryData.title,
          content: entryData.content
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result.data }
    } catch (err) {
      error.value = err.message
      console.error('Error updating journal entry:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a journal entry
   * @param {string} id - The entry ID
   * @returns {Promise<Object>} Success status
   */
  const deleteEntry = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/items/${COLLECTION_NAME}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting journal entry:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
    }
    /**
 * Get the count of journal entries created today
 * @returns {Promise<number>} Number of entries created today
 */
const getTodayJournalCount = async () => {
  loading.value = true
  error.value = null

  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Directus expects ISO strings for filtering
    const response = await fetch(
      `${API_BASE_URL}/items/${COLLECTION_NAME}?filter[date_created][_between]=${startOfDay.toISOString()},${endOfDay.toISOString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // if auth needed
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.data.length
  } catch (err) {
    error.value = err.message
    console.error('Error counting today\'s journal entries:', err)
    return 0
  } finally {
    loading.value = false
  }
}

  return {
    loading,
    error,
    createEntry,
    getEntries,
    getEntry,
    updateEntry,
    deleteEntry, 
    getTodayJournalCount
  }
}

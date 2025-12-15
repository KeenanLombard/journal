<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div class="container mx-auto p-4 md:p-6">
      <!-- Header -->
      <header>
        <ReaderToolbar
          :translations="translations"
          :selected-translation="selectedTranslation"
          :font-size="fontSize"
          :is-playing="isPlaying"
          :reading-speed="readingSpeed"
          :title="selectedTranslation"

          @update:translation="val => { selectedTranslation = val; loadChapter() }"
          @update:fontSize="val => fontSize = val"
          @update:readingSpeed="val => readingSpeed = val"
          @togglePlay="isPlaying = !isPlaying"
        />
      </header>

      <Section>
        <ReaderGlobalSearch
          :search-text="searchText"
          :search-scope="searchScope"
          :searching="searching"

          @update:searchText="val => searchText = val"
          @update:searchScope="val => searchScope = val"
          @search="doSearch"
          @clear="clearSearch"
        />
      </Section>
      <!-- Error Alert -->
      <div v-if="error" class="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
        <p class="font-medium">Warning: {{ error }}</p>
        <p class="text-sm mt-1">Using demo data. Check your API: <code class="font-mono text-xs">{{ apiBase }}</code></p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <input v-model="bookSearch" type="text" placeholder="Search books..."
              class="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500" />

            <div class="mt-4 max-h-96 overflow-y-auto space-y-1">
              <button v-for="book in filteredBooks" :key="book.id"
                @click="selectBook(book)"
                :class="[
                  'w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-indigo-50',
                  selectedBook?.id === book.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''
                ]">
                {{ book.name }}
              </button>
            </div>
          </div>

          <!-- Chapters -->
          <div v-if="selectedBook" class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold text-lg mb-4">Chapters</h3>
            <div class="grid grid-cols-5 gap-2">
              <button v-for="c in maxChapters" :key="c"
                @click="selectChapter(c)"
                :class="[
                  'w-10 h-10 rounded-lg font-medium transition',
                  chapter === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                ]">
                {{ c }}
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold">{{ selectedBook?.name || 'Select a book' }}</h2>
              <p class="text-sm text-gray-600 mt-1">
                <template v-if="searching">
                  Search results for "{{ searchText }}" ({{ searchScope === 'book' ? 'Current book' : 'Entire Bible' }})
                </template>
                <template v-else>
                  Chapter {{ chapter }}
                </template>
              </p>
            </div>

            <div v-if="!searching" class="flex gap-2">
              <button @click="prevChapter" :disabled="chapter === 1"
                class="p-3 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button @click="nextChapter"
                class="p-3 rounded-lg border border-gray-300 hover:bg-gray-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Loading / Verses -->
          <div v-if="loading" class="flex justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>

          <div v-else-if="verses.length === 0" class="text-center py-16 text-gray-500">
            <svg class="w-20 h-20 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p class="text-lg">No verses to display</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="v in verses" :key="getVerseKey(v.verse, v.book_id, v.chapter)"
              @click="toggleVerseMenu(v)"
              :class="[
                'group relative p-5 rounded-xl transition-all cursor-pointer',
                isHighlighted(v.verse, v.book_id, v.chapter) ? 'bg-yellow-100' : 'hover:bg-gray-50'
              ]">

              <div class="flex gap-4">
                <div class="text-right font-bold text-gray-600 w-12 shrink-0">
                  <div v-if="searching && v.book_name" class="text-xs text-gray-500 mb-1">
                    {{ v.book_name }} {{ v.chapter }}:
                  </div>
                  <span class="text-lg">{{ v.verse }}</span>
                </div>

                <div class="flex-1">
                  <div :style="{ fontSize: `${fontSize}px`, lineHeight: '1.8' }"
                    v-html="getVerseText(v)" class="prose max-w-none"></div>

                  <div v-if="hasNote(v.verse, v.book_id, v.chapter)"
                    class="mt-3 p-3 bg-gray-100 rounded-lg text-sm italic text-gray-700">
                    Note: {{ getNote(v.verse, v.book_id, v.chapter) }}
                  </div>
                </div>

                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <span v-if="isHighlighted(v.verse, v.book_id, v.chapter)" title="Highlighted" class="text-yellow-600">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                  </span>
                  <span v-if="hasNote(v.verse, v.book_id, v.chapter)" title="Has note" class="text-indigo-600">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
                  </span>
                </div>
              </div>

              <!-- Verse Context Menu -->
              <div v-if="showVerseMenu?.verse === v.verse && showVerseMenu?.book_id === v.book_id && showVerseMenu?.chapter === v.chapter"
                @click.stop
                class="absolute right-4 top-16 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-2 w-48">
                <button @click="toggleHighlight(v.verse, v.book_id, v.chapter)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  {{ isHighlighted(v.verse, v.book_id, v.chapter) ? 'Remove Highlight' : 'Highlight' }}
                </button>
                <button @click="openNoteModal(v)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {{ hasNote(v.verse, v.book_id, v.chapter) ? 'Edit Note' : 'Add Note' }}
                </button>
                <button @click="shareVerse(v)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                  Copy & Share
                </button>
                <button @click="shareVerse(v)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 8h10M7 12h6m-6 4h8M21 12c0 4.418-4.03 8-9 8-1.02 0-2-.12-2.93-.35L4 21l.87-3.48C3.75 16.13 3 14.14 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  View Discussions
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Note Modal -->
      <Teleport to="body">
        <div v-if="showNoteModal" @click="closeNoteModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div @click.stop class="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 class="text-xl font-bold mb-4">
              Note — {{ showNoteModal.book_name || selectedBook?.name }} {{ showNoteModal.chapter }}:{{ showNoteModal.verse }}
            </h3>
            <textarea v-model="noteText" placeholder="Write your personal note here..."
              class="w-full h-40 p-4 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500"></textarea>
            <div class="flex justify-end gap-3 mt-6">
              <button @click="closeNoteModal" class="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button @click="saveNote" class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const apiBase = 'http://localhost:8055'
const translations = ['KJV', 'BSB', 'WEB', 'ASV', 'AKJV', 'CPDV']

const selectedTranslation = ref('KJV')
const books = ref([])
const selectedBook = ref(null)
const chapter = ref(1)
const verses = ref([])
const loading = ref(false)
const error = ref(null)
const fontSize = ref(18)

const searchText = ref('')
const searching = ref(false)
const bookSearch = ref('')
const searchScope = ref('book')

const highlightedVerses = ref(new Set())
const notes = ref({})
const showNoteModal = ref(null)
const noteText = ref('')
const showVerseMenu = ref(null)
const isPlaying = ref(false)
const readingSpeed = ref(1)

// Chapter counts per book (Genesis = 50, Exodus = 40, etc.)
const chapterCounts = {
  1: 50, 2: 40, 3: 27, 4: 36, 5: 34, 6: 24, 7: 21, 8: 4, 9: 31, 10: 24,
  11: 22, 12: 25, 13: 29, 14: 36, 15: 10, 16: 13, 17: 10, 18: 42, 19: 150, 20: 31,
  21: 12, 22: 8, 23: 66, 24: 52, 25: 5, 26: 48, 27: 12, 28: 14, 29: 3, 30: 9,
  31: 1, 32: 4, 33: 7, 34: 3, 35: 3, 36: 3, 37: 2, 38: 14, 39: 4,
  40: 28, 41: 16, 42: 24, 43: 21, 44: 28, 45: 16, 46: 16, 47: 13, 48: 6, 49: 6,
  50: 4, 51: 4, 52: 5, 53: 3, 54: 6, 55: 4, 56: 3, 57: 1, 58: 13, 59: 5, 60: 5,
  61: 3, 62: 5, 63: 1, 64: 1, 65: 1, 66: 22
}

const filteredBooks = computed(() =>
  bookSearch.value
    ? books.value.filter(b => b.name.toLowerCase().includes(bookSearch.value.toLowerCase()))
    : books.value
)

const maxChapters = computed(() =>
  selectedBook.value ? Array.from({ length: chapterCounts[selectedBook.value.id] || 50 }, (_, i) => i + 1) : []
)

const fetchJSON = async (path) => {
  const res = await fetch(apiBase + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}
   
const loadBooks = async () => {
  loading.value = true
  try {
    const json = await fetchJSON('/items/books?sort=id&limit=-1')
    books.value = json.data || []
    if (books.value.length > 0) {
      selectedBook.value = books.value[0]
      await loadChapter()
    }
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load books. Using demo data.'
    books.value = [{ id: 1, name: 'Genesis' }, { id: 2, name: 'Exodus' }, { id: 40, name: 'Matthew' }]
    selectedBook.value = books.value[0]
    loadDemoVerses()
  } finally {
    loading.value = false
  }
}

const loadChapter = async () => {
  if (!selectedBook.value) return
  loading.value = true
  error.value = null
  searching.value = false

  try {
    const params = new URLSearchParams({
      'filter[verse_id][book_id][_eq]': selectedBook.value.id,
      'filter[verse_id][chapter][_eq]': chapter.value,
      'filter[translation_code][_eq]': selectedTranslation.value,
      'fields': 'text,translation_code,verse_id.verse',
      'sort': 'verse_id.verse',
      'limit': '-1'
    })

    const json = await fetchJSON(`/items/bible_texts?${params.toString()}`)

    if (!json.data || json.data.length === 0) {
      error.value = `No ${selectedTranslation.value} text available for this chapter.`
      loadDemoVerses()
      return
    }

    verses.value = json.data.map(item => ({
      verse: item.verse_id.verse,
      chapter: chapter.value,
      book_id: selectedBook.value.id,
      translations: { [selectedTranslation.value]: item.text }
    }))
  } catch (err) {
    error.value = `Load failed: ${err.message}`
    loadDemoVerses()
  } finally {
    loading.value = false
  }
}

const loadDemoVerses = () => {
  verses.value = [
    { verse: 1, chapter: 1, book_id: 1, translations: { [selectedTranslation.value]: 'In the beginning God created the heaven and the earth.' } },
    { verse: 2, translations: { [selectedTranslation.value]: 'The earth was without form and void...' } },
    { verse: 3, translations: { [selectedTranslation.value]: 'And God said, “Let there be light”...' } }
  ]
}

const doSearch = async () => {
  if (!searchText.value.trim()) return loadChapter()

  searching.value = true
  loading.value = true
  try {
    const params = new URLSearchParams({
      search: searchText.value,
      'filter[translation_code][_eq]': selectedTranslation.value,
      'fields': 'text,translation_code,verse_id.verse,verse_id.chapter,verse_id.book_id.id,verse_id.book_id.name',
      limit: '100'
    })
    if (searchScope.value === 'book' && selectedBook.value) {
      params.append('filter[verse_id][book_id][_eq]', selectedBook.value.id)
    }

    const json = await fetchJSON(`/items/bible_texts?${params.toString()}`)
    verses.value = (json.data || []).map(item => ({
      verse: item.verse_id.verse,
      chapter: item.verse_id.chapter,
      book_id: item.verse_id.book_id.id,
      book_name: item.verse_id.book_id.name,
      translations: { [item.translation_code]: item.text }
    }))
  } catch (err) {
    error.value = `Search failed: ${err.message}`
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchText.value = ''
  searching.value = false
  loadChapter()
}

const selectBook = (book) => {
  selectedBook.value = book
  chapter.value = 1
  loadChapter()
}

const selectChapter = (c) => {
  chapter.value = c
  loadChapter()
}

const prevChapter = () => { if (chapter.value > 1) { chapter.value--; loadChapter() } }
const nextChapter = () => { chapter.value++; loadChapter() }

const getVerseText = (v) => v.translations?.[selectedTranslation.value] || '<i class="text-gray-400">— not available —</i>'

const getVerseKey = (verseNum, bookId = selectedBook.value?.id, chap = chapter.value) =>
  `${bookId}-${chap}-${verseNum}`

const toggleHighlight = (verseNum, bookId = selectedBook.value?.id, chap = chapter.value) => {
  const key = getVerseKey(verseNum, bookId, chap)
  const set = new Set(highlightedVerses.value)
  set.has(key) ? set.delete(key) : set.add(key)
  highlightedVerses.value = set
  showVerseMenu.value = null
}

const isHighlighted = (verseNum, bookId, chap) => highlightedVerses.value.has(getVerseKey(verseNum, bookId, chap))
const hasNote = (verseNum, bookId, chap) => !!notes.value[getVerseKey(verseNum, bookId, chap)]
const getNote = (verseNum, bookId, chap) => notes.value[getVerseKey(verseNum, bookId, chap)] || ''

const openNoteModal = (v) => {
  noteText.value = getNote(v.verse, v.book_id, v.chapter)
  showNoteModal.value = v
  showVerseMenu.value = null
}

const closeNoteModal = () => {
  showNoteModal.value = null
  noteText.value = ''
}

const saveNote = () => {
  if (!showNoteModal.value) return
  const key = getVerseKey(showNoteModal.value.verse, showNoteModal.value.book_id, showNoteModal.value.chapter)
  if (noteText.value.trim()) {
    notes.value[key] = noteText.value.trim()
  } else {
    delete notes.value[key]
  }
  closeNoteModal()
}

const shareVerse = (v) => {
  const bookName = v.book_name || selectedBook.value?.name || 'Bible'
  const text = `${bookName} ${v.chapter}:${v.verse} — ${getVerseText(v).replace(/<[^>]*>/g, '')}`
  navigator.clipboard.writeText(text)
  alert('Verse copied!')
  showVerseMenu.value = null
}

const toggleVerseMenu = (v) => {
  showVerseMenu.value = showVerseMenu.value === v ? null : v
}

onMounted(() => loadBooks())
watch(selectedTranslation, () => loadChapter())
</script>

<style scoped>
.prose :deep(p) { margin: 0; }
</style>
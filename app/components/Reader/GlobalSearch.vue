<template>
  <div
    class="mb-6 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm"
  >
    <!-- Search Icon -->
    <svg
      class="w-5 h-5 text-gray-400 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>

    <!-- Input -->
    <input
      :value="searchText"
      @input="$emit('update:searchText', $event.target.value)"
      @keyup.enter="$emit('search')"
      type="text"
      placeholder="Search scripture..."
      class="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
    />

    <!-- Scope Toggle -->
    <div class="flex bg-gray-100 rounded-lg p-0.5 text-sm">
      <button
        @click="$emit('update:searchScope', 'book')"
        class="px-3 py-1 rounded-md transition"
        :class="
          searchScope === 'book'
            ? 'bg-white shadow text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Book
      </button>

      <button
        @click="$emit('update:searchScope', 'global')"
        class="px-3 py-1 rounded-md transition"
        :class="
          searchScope === 'global'
            ? 'bg-white shadow text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Bible
      </button>
    </div>

    <!-- Search Button -->
    <button
      @click="$emit('search')"
      class="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm
             hover:bg-indigo-700 transition"
    >
      Search
    </button>

    <!-- Clear -->
    <button
      v-if="searching"
      @click="$emit('clear')"
      class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      aria-label="Clear search"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  searchText: { type: String, default: '' },
  searchScope: { type: String, default: 'book' },
  searching: { type: Boolean, default: false }
})

defineEmits([
  'update:searchText',
  'update:searchScope',
  'search',
  'clear'
])
</script>

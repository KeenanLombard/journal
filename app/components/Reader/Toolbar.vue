<template>
  <header class="bg-white rounded-xl shadow-sm px-4 py-3 mb-6">
    <div class="flex flex-wrap items-center justify-between gap-3">

      <!-- Title -->
      <div class="flex items-center gap-3">
        <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
        </svg>
        <h1 class="text-xl font-semibold">{{ title }}</h1>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2">

        <!-- Translation -->
        <select
          :value="selectedTranslation"
          @change="$emit('update:translation', $event.target.value)"
          class="toolbar-select"
        >
          <option v-for="t in translations" :key="t" :value="t">{{ t }}</option>
        </select>

        <!-- Font Modal Trigger -->
        <button @click="showFontModal = true" class="toolbar-btn">
          Aa
        </button>

        <!-- Highlight Color -->
        <div class="relative">
          <button class="toolbar-btn flex items-center gap-2">
            <span
              class="w-4 h-4 rounded-full border"
              :style="{ backgroundColor: highlightColor }"
            />
          </button>

          <input
            type="color"
            class="absolute inset-0 opacity-0 cursor-pointer"
            :value="highlightColor"
            @input="$emit('update:highlightColor', $event.target.value)"
          />
        </div>

        <!-- Audio -->
        <div class="flex items-center gap-1">
          <button @click="$emit('togglePlay')" class="toolbar-btn">
            <svg v-if="isPlaying" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132z" />
            </svg>
          </button>

          <select
            :value="readingSpeed"
            @change="$emit('update:readingSpeed', Number($event.target.value))"
            class="toolbar-select"
          >
            <option value="0.75">0.75×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
            <option value="1.5">1.5×</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Font Modal -->
    <div v-if="showFontModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-lg font-semibold">Text Settings</h2>

        <!-- Font Size -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Font Size</span>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('update:fontSize', Math.max(minFont, fontSize - step))"
              class="toolbar-btn"
            >A−</button>

            <span class="text-sm w-12 text-center">{{ fontSize }}px</span>

            <button
              @click="$emit('update:fontSize', Math.min(maxFont, fontSize + step))"
              class="toolbar-btn"
            >A+</button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <button @click="showFontModal = false" class="toolbar-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: String,
  translations: Array,
  selectedTranslation: String,

  fontSize: Number,
  minFont: { type: Number, default: 12 },
  maxFont: { type: Number, default: 32 },
  step: { type: Number, default: 2 },

  isPlaying: Boolean,
  readingSpeed: Number,
  highlightColor: { type: String, default: '#fff59d' }
})

defineEmits([
  'update:translation',
  'update:fontSize',
  'update:readingSpeed',
  'update:highlightColor',
  'togglePlay'
])

const showFontModal = ref(false)
</script>

<style scoped>
.toolbar-btn {
  @apply h-9 min-w-[36px] px-3 rounded-lg border border-gray-300
         flex items-center justify-center
         text-sm font-medium
         hover:bg-gray-100 transition;
}

.toolbar-select {
  @apply h-9 px-3 rounded-lg border border-gray-300
         text-sm bg-white
         focus:ring-2 focus:ring-indigo-500;
}
</style>
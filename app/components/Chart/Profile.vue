<template>
  <div class="w-full p-4">
    <div class="space-y-3">
      <div v-for="(count, mood) in moodCounts" :key="mood">
        <div class="flex justify-between mb-1 text-gray-700 text-sm">
          <span class="capitalize">{{ mood }}</span>
          <span>{{ count }}</span>
        </div>

        <!-- Bar -->
        <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            class="h-full bg-blue-600 rounded-full transition-all duration-500"
            :style="{ width: (count / maxCount) * 100 + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  moodCounts: {
    type: Object,
    required: true,
  },
})

// Find the largest value for scaling
const maxCount = computed(() => Math.max(...Object.values(props.moodCounts)))
</script>

<style scoped>
</style>
<!-- @format -->

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="flex items-center gap-2">
      <button
        v-for="n in max"
        :key="n"
        type="button"
        @click="selectRating(n)"
        class="w-10 h-10 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="[
          n <= modelValue
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400',
        ]">
        {{ n }}
      </button>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Number,
  label: String,
  max: {
    type: Number,
    default: 5,
  },
  required: Boolean,
  error: String,
  hint: String,
});

const emit = defineEmits(["update:modelValue"]);

const selectRating = (value) => {
  emit("update:modelValue", value);
};
</script>

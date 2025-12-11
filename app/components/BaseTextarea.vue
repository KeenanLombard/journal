<!-- @format -->

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Textarea -->
    <textarea
      :id="id"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
             focus:ring-blue-500 focus:border-transparent transition-all duration-200
             disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
      :class="{ 'border-red-500': error }"
    ></textarea>

    <!-- Error / Hint -->
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
  hint: String,
  id: String,
  rows: {
    type: Number,
    default: 3,
  },
});

defineEmits(["update:modelValue"]);
</script>

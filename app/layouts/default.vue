<!-- @format -->

<script setup>
import { ref } from "vue";

// Define your routes here — super easy to extend
const routes = ref([
  { name: "Home", path: "/", icon: "i-heroicons-home" },
  { name: "Bible", path: "/bible", icon: "i-heroicons-book-open" },
]);

// Mobile drawer state
const isOpen = ref(false);
const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
};

const closeDrawer = () => {
  isOpen.value = false;
};

// Close drawer when route changes (optional but nice UX)
const route = useRoute();
watch(
  () => route.path,
  () => {
    closeDrawer();
  }
);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Navigation Bar -->
    <header
      class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo / Brand -->
          <NuxtLink to="/" class="flex items-center space-x-3">
            <div
              class="w-8 h-8 flex items-center justify-center">
                <img
                  src="../assets/logo.png"
                  alt="logo"
                >
            </div>
            <span class="font-semibold text-xl text-gray-900">Seekers</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink
              v-for="item in routes"
              :key="item.path"
              :to="item.path"
              class="text-gray-600 hover:text-indigo-600 font-medium transition-colors px-3 py-2 rounded-md text-sm"
              active-class="text-indigo-600 font-semibold">
              {{ item.name }}
            </NuxtLink>

            <NuxtLink
              to="/profile"
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all text-sm font-medium"
              active-class="
                border-indigo-600 
                text-indigo-600 
                font-semibold
              ">
              Profile
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <button
            @click="toggleDrawer"
            class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Open menu">
            <svg
              v-if="!isOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer (Overlay from left) -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 md:hidden"
        @click="closeDrawer">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />

        <!-- Drawer Panel -->
        <div
          class="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
          <div
            class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <NuxtLink
              to="/"
              class="flex items-center space-x-3"
              @click="closeDrawer">
              <div
                class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span class="font-semibold text-xl">Seekers</span>
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all text-sm font-medium"
              active-class="
    border-indigo-600 
    text-indigo-600 
    font-semibold
  ">

              Profile
            </NuxtLink>

            <button @click="closeDrawer" class="p-2">
              <div class="i-heroicons-x-mark w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in routes"
              :key="item.path"
              :to="item.path"
              @click="closeDrawer"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              active-class="bg-indigo-50 text-indigo-600 font-medium">
              <div :class="item.icon" class="w-5 h-5" />
              <span class="font-medium">{{ item.name }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </Teleport>

    <!-- Page Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

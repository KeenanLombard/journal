<template>
    <div>
        moodCounts: {{ moodCounts }}
    </div>
</template>

<script setup>
defineProps({
    moodCounts: {
        type: Object,
        required: true,
    },
});
</script>
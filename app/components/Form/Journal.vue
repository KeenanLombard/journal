<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="space-y-6">
      <!-- Date Input -->
      <div class="flex flex-col">
        <label for="date" class="text-sm font-medium text-gray-700">Date</label>
        <div class="mt-1 py-2 px-3 bg-gray-100 rounded-md text-gray-700">
          {{ form.date }}
        </div>
      </div>

      <!-- Title Input -->
      <BaseInput
        v-model="form.title"
        label="Entry Title"
        placeholder="Give your entry a title..."
        required
        id="title"
        hint="A brief title for today's journal entry" />

      <!-- Mood Select -->
      <BaseSelect
        v-model="form.mood"
        label="How are you feeling?"
        placeholder="Select your mood"
        :options="moodOptions"
        id="mood" />

      <!-- Mood Rating -->
      <BaseRating
        v-model="form.moodRating"
        label="Rate your overall mood"
        :max="10" />

      <!-- Energy Level Rating -->
      <BaseRating v-model="form.energyLevel" label="Energy Level" :max="10" />

      <!-- Voice Input Section -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 mb-1">
          Voice Input (Speak to Type)
        </label>
        <div class="mt-1 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
          <div class="flex flex-col gap-4">
            <!-- Control Buttons -->
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-3">
                <button
                  v-if="!isSpeechActive"
                  type="button"
                  @click="startSpeechRecognition"
                  class="flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all shadow-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Start Speaking
                </button>

                <button
                  v-if="isSpeechActive"
                  type="button"
                  @click="stopSpeechRecognition"
                  class="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z" />
                  </svg>
                  Stop
                </button>
              </div>

              <!-- Live transcription preview -->
              <div v-if="interimTranscript" class="text-sm italic text-indigo-600 flex-1 min-w-0">
                {{ interimTranscript }}
              </div>
            </div>

            <!-- Audio Visualizer Bars -->
            <div v-if="isSpeechActive" class="flex justify-center items-end gap-1 h-24 bg-white/50 rounded-lg p-4">
              <div
                v-for="(level, index) in audioLevels"
                :key="index"
                class="w-3 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-full transition-all duration-75"
                :style="{ height: `${Math.max(10, level)}%` }">
              </div>
            </div>

            <!-- Browser not supported -->
            <p v-if="!speechSupported" class="text-sm text-orange-600">
              Your browser doesn't support voice input. Try Chrome, Edge, or Safari.
            </p>
          </div>
        </div>
        <span class="text-xs text-gray-500 mt-2">
          Speak naturally — your words will appear in the journal below
        </span>
      </div>

      <!-- Journal Entry Textarea -->
      <BaseTextarea
        v-model="form.content"
        label="Today's Entry"
        placeholder="Write about your day, thoughts, feelings..."
        :rows="8"
        required
        id="content"
        hint="Express yourself freely" />

      <!-- Action Buttons -->
      <div class="flex gap-4 pt-4">
        <BaseButton @click="handleSubmit" variant="primary" :loading="isSubmitting">
          Save Entry
        </BaseButton>

        <BaseButton type="button" variant="secondary" @click="handleReset">
          Reset
        </BaseButton>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useJournalEntries } from '#imports'

const { createEntry, loading: apiLoading, error: apiError } = useJournalEntries()

// Form Data
const form = ref({
  date: new Date().toISOString().split('T')[0],
  title: '',
  mood: '',
  moodRating: null,
  energyLevel: null,
  content: ''
})

// UI state
const isSubmitting = ref(false)
const successMessage = ref('')

// Mood Options
const moodOptions = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'excited', label: '🎉 Excited' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'angry', label: '😠 Angry' },
  { value: 'tired', label: '😴 Tired' }
]

// Voice Recognition State
const speechSupported = ref(true)
const isSpeechActive = ref(false)
const interimTranscript = ref('')
const recognition = ref(null)

// Audio Visualization State
const audioLevels = ref([0, 0, 0, 0, 0, 0, 0])
const audioContext = ref(null)
const analyser = ref(null)
const micStream = ref(null)
const animationFrame = ref(null)

// Initialize Speech Recognition
const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    speechSupported.value = false
    return
  }

  speechSupported.value = true
  recognition.value = new SpeechRecognition()
  recognition.value.continuous = true
  recognition.value.interimResults = true
  recognition.value.lang = 'en-US'

  recognition.value.onresult = (event) => {
    let interim = ''
    let final = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        final += transcript + ' '
      } else {
        interim += transcript
      }
    }

    interimTranscript.value = interim

    if (final) {
      form.value.content += final
      interimTranscript.value = ''
    }
  }

  recognition.value.onerror = (event) => {
    const ignored = ['no-speech', 'aborted', 'audio-capture']
    if (ignored.includes(event.error)) {
      return
    }

    console.error('Speech error:', event.error)
    stopSpeechRecognition()
    alert('Microphone issue — please check permissions and try again.')
  }

  recognition.value.onend = () => {
    if (isSpeechActive.value) {
      setTimeout(() => {
        if (isSpeechActive.value && recognition.value) {
          try {
            recognition.value.start()
          } catch (e) {
            console.error('Failed to restart:', e)
          }
        }
      }, 100)
    }
  }
}

// Audio Visualization
const startAudioVisualization = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    micStream.value = stream

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    audioContext.value = ctx

    const analyserNode = ctx.createAnalyser()
    analyserNode.fftSize = 256
    analyser.value = analyserNode

    const source = ctx.createMediaStreamSource(stream)
    source.connect(analyserNode)

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateLevels = () => {
      if (!isSpeechActive.value) return

      analyserNode.getByteFrequencyData(dataArray)

      const samples = 7
      const sampleSize = Math.floor(bufferLength / samples)
      const levels = []

      for (let i = 0; i < samples; i++) {
        const start = i * sampleSize
        const end = start + sampleSize
        const slice = dataArray.slice(start, end)
        const average = slice.reduce((a, b) => a + b, 0) / slice.length
        levels.push(Math.min(100, (average / 255) * 100))
      }

      audioLevels.value = levels
      animationFrame.value = requestAnimationFrame(updateLevels)
    }

    updateLevels()
  } catch (err) {
    console.error('Failed to access microphone:', err)
    alert('Cannot access microphone. Please check permissions.')
    stopSpeechRecognition()
  }
}

const stopAudioVisualization = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }

  if (micStream.value) {
    micStream.value.getTracks().forEach(track => track.stop())
    micStream.value = null
  }

  if (audioContext.value) {
    audioContext.value.close()
    audioContext.value = null
  }

  audioLevels.value = [0, 0, 0, 0, 0, 0, 0]
}

const startSpeechRecognition = () => {
  if (!speechSupported.value) {
    alert('Speech recognition is not supported in your browser.')
    return
  }

  try {
    recognition.value?.start()
    isSpeechActive.value = true
    startAudioVisualization()
  } catch (err) {
    console.error('Failed to start recognition:', err)
  }
}

const stopSpeechRecognition = () => {
  if (recognition.value) {
    recognition.value.stop()
  }
  isSpeechActive.value = false
  interimTranscript.value = ''
  stopAudioVisualization()
}

const handleSubmit = async () => {
  // Validate required fields
  if (!form.value.title || !form.value.content) {
    alert('Please fill in both title and content before saving.')
    return
  }

  isSubmitting.value = true

  try {
    // Call the API to create the entry
    const result = await createEntry({
      title: form.value.title,
      content: form.value.content,
      status: 'published',
    })

    if (result.success) {
      console.log('Journal entry saved:', result.data)
      successMessage.value = 'Journal entry saved successfully! ✨'

      // Reset form after 2 seconds
      setTimeout(() => {
        handleReset()
      }, 2000)
    } else {
      throw new Error(result.error || 'Failed to save entry')
    }
  } catch (err) {
    console.error('Failed to save entry:', err)
    alert(`Failed to save entry: ${err.message}. Please try again.`)
  } finally {
    isSubmitting.value = false
  }
}

const handleReset = () => {
  form.value = {
    date: new Date().toISOString().split('T')[0],
    title: '',
    mood: '',
    moodRating: null,
    energyLevel: null,
    content: ''
  }
  successMessage.value = ''
  stopSpeechRecognition()
}

// Lifecycle
onMounted(() => {
  initSpeechRecognition()
})

onUnmounted(() => {
  stopSpeechRecognition()
})
</script>
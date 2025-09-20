<template>
  <!-- Full-screen welcome (no header/footer) -->
  <div class="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-700 via-sky-700/90 to-sky-800 text-white">
    <div class="relative h-full w-full flex items-center justify-center">
      <!-- Watermark -->
      <div
        aria-hidden="true"
        class="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-10"
        style="font-weight:800; font-size:22vw; line-height:1; letter-spacing:-0.04em;"
      >
        <span>SwimMate</span>
      </div>

      <!-- Content -->
      <div class="relative z-10 max-w-4xl w-full px-6 text-left">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          Rain &amp; Water Safety Outlook
        </h1>

        <p class="mt-4 text-lg sm:text-xl text-white/90">
          See how recent rainfall and upcoming weather may affect swimming conditions.
        </p>
        <p class="mt-2 text-white/85 leading-7 max-w-2xl">
          Real-time water quality, rainfall alerts, and historical safety trends for Port Phillip Bay — all in one place.
        </p>

        <!-- Date selector -->
        <div class="mt-8">
          <label for="date" class="block text-sm font-medium mb-2">
            Select a Date to View Conditions
          </label>
          <input
            id="date"
            type="date"
            v-model="selectedDate"
            class="rounded-lg px-4 py-2 text-slate-900"
          />
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            @click="viewConditions"
            class="inline-flex items-center rounded-xl bg-white text-sky-900 px-5 py-2.5 font-semibold shadow hover:bg-white/95 transition"
          >
            View Conditions
          </button>

          <button
            @click="goMap"
            class="inline-flex items-center rounded-xl border border-white/70 bg-transparent px-5 py-2.5 font-semibold text-white hover:bg-white/10 transition"
          >
            View Map
          </button>
        </div>
      </div>

      <!-- Bottom fade -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/10 to-transparent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedDate = ref(new Date().toISOString().slice(0, 10))

function markSeen() {
  try { localStorage.setItem('swm_seen_welcome', '1') } catch {}
}

function viewConditions() {
  markSeen()
  router.push({ path: '/rain-weather', query: { date: selectedDate.value } })
}

function goMap() {
  markSeen()
  router.push('/map')
}
</script>

<style scoped>
:host {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

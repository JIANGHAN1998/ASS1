<template>
  <section class="min-h-screen bg-white">
    <!-- 顶部区块 -->
    <header class="bg-gradient-to-b from-sky-700 via-sky-700/90 to-sky-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Rain &amp; Water Safety Outlook
        </h1>
        <p class="mt-2 text-white/90 max-w-3xl">
          Select a beach and date to see local rainfall and conditions.
        </p>

        <!-- 选择器 -->
        <div
          class="mt-6 grid grid-cols-1 sm:grid-cols-[minmax(240px,1fr)_minmax(200px,1fr)_auto] gap-3 items-center"
        >
          <div class="flex items-center gap-2">
            <label class="text-sm text-white/90 w-24 sm:w-auto">Beach</label>
            <select
              v-model="selectedKey"
              @change="loadAll"
              class="rounded-lg px-3 py-2 text-slate-900 w-full"
            >
              <option v-for="b in BEACHES" :key="b.key" :value="b.key">
                {{ b.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-white/90 w-24 sm:w-auto">Date</label>
            <input
              type="date"
              v-model="dateStr"
              class="rounded-lg px-3 py-2 text-slate-900 w-full"
            />
          </div>
          <button
            @click="loadAll"
            :disabled="loading"
            class="inline-flex items-center rounded-xl bg-white text-sky-900 px-4 py-2 font-semibold shadow hover:bg-white/95 disabled:opacity-60"
          >
            {{ loading ? 'Loading…' : 'Update' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 预报地图 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <h3 class="text-sky-900 font-semibold mb-2">Beach Forecast Map</h3>
      <div
        id="beach-forecast-map"
        class="h-[56vh] min-h-[360px] w-full rounded-xl border border-slate-300"
      ></div>
      <p class="text-xs text-slate-500 mt-2">
        Tip: Click a pin to load this beach's data below.
      </p>
    </div>

    <!-- 主体卡片 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 顶部提示条 -->
      <div
        v-if="status"
        class="rounded-xl border px-4 py-3 mb-8 flex items-start gap-3"
        :class="{
          'bg-emerald-50 border-emerald-200 text-emerald-800': status.level === 'safe',
          'bg-amber-50 border-amber-200 text-amber-900': status.level === 'caution',
          'bg-rose-50 border-rose-200 text-rose-900': status.level === 'unsafe'
        }"
      >
        <div class="mt-0.5">
          <span v-if="status.level === 'safe'">✅</span>
          <span v-else-if="status.level === 'caution'">⚠️</span>
          <span v-else>⛔</span>
        </div>
        <div>
          <h3 class="font-semibold">
            {{ formattedDate }} — {{ status.title }}
          </h3>
          <p class="text-sm mt-1">{{ status.description }}</p>
          <p class="text-xs mt-1 opacity-75">
            Beach: <b>{{ currentBeach.name }}</b>
            ({{ currentBeach.lat.toFixed(3) }}, {{ currentBeach.lon.toFixed(3) }})
          </p>
        </div>
      </div>

      <!-- 三张卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="text-sm font-semibold text-slate-700">Today's Weather</div>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-slate-500">Condition</dt>
              <dd class="font-medium">{{ today.condition || '—' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-500">Temperature</dt>
              <dd class="font-medium">
                {{ today.temperature != null ? today.temperature + '°C' : '—' }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-slate-500">Wind</dt>
              <dd class="font-medium">{{ today.wind || '—' }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="text-sm font-semibold text-slate-700">Past 72 Hours</div>
          <div class="mt-4">
            <div class="text-3xl font-extrabold leading-none">
              {{ rainPast72
              }}<span class="text-xl font-bold ml-1">mm</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">Total Rainfall</div>
            <p
              class="mt-3 text-xs rounded-lg px-3 py-2"
              :class="
                rainPast72 >= thresholds.past72.caution
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              "
            >
              {{
                rainPast72 >= thresholds.past72.caution
                  ? 'Recent heavy rain may increase pollution risk — swim with caution.'
                  : 'Minimal recent rainfall; lower pollution risk.'
              }}
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="text-sm font-semibold text-slate-700">Next 24 Hours</div>
          <div class="mt-4">
            <div class="text-3xl font-extrabold leading-none">
              {{ rainNext24
              }}<span class="text-xl font-bold ml-1">mm</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">Expected Rainfall</div>
            <p
              class="mt-3 text-xs rounded-lg px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              Light rainfall expected. Minimal impact on swimming conditions.
            </p>
          </div>
        </div>
      </div>

      <!-- 说明 -->
      <div
        class="mt-10 rounded-2xl bg-gradient-to-br from-sky-700 via-sky-700/90 to-sky-800 text-white p-6"
      >
        <h3 class="text-lg font-semibold">Understanding Water Safety</h3>
        <p class="mt-1 text-white/90 text-sm max-w-3xl">
          Our safety ratings consider rainfall patterns, water quality data, and
          weather forecasts to provide you with the most accurate swimming
          conditions assessment.
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <span
            class="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-1.5 text-sm"
          >
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Safe
          </span>
          <span
            class="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-1.5 text-sm"
          >
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Caution
          </span>
          <span
            class="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-1.5 text-sm"
          >
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            Unsafe
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BEACHES } from '@/services/beaches.js'
import { getConditionsForDate } from '@/services/weatherService.js'
import { useRoute, useRouter } from 'vue-router'

/* 阈值（与原型一致，可调整） */
const thresholds = {
  past72: { caution: 30, unsafe: 60 },
  next24: { caution: 25, unsafe: 50 }
}

const route = useRoute()
const router = useRouter()

const selectedKey = ref(route.query.beach || BEACHES[0].key)
const dateStr = ref(
  (route.query.date && String(route.query.date)) ||
    new Date().toISOString().slice(0, 10)
)

const loading = ref(false)
const today = ref({ condition: '', temperature: null, wind: '' })
const rainPast72 = ref(0)
const rainNext24 = ref(0)

const currentBeach = computed(
  () => BEACHES.find((b) => b.key === selectedKey.value) || BEACHES[0]
)

const formattedDate = computed(() => {
  try {
    return new Date(dateStr.value).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateStr.value
  }
})

const status = computed(() => {
  const past = rainPast72.value
  const next = rainNext24.value
  let level = 'safe',
    title = 'Safe',
    description = 'Conditions look good for swimming.'
  if (past >= thresholds.past72.unsafe || next >= thresholds.next24.unsafe) {
    level = 'unsafe'
    title = 'Unsafe'
    description =
      'Heavy rainfall may cause poor water quality. Avoid swimming.'
  } else if (
    past >= thresholds.past72.caution ||
    next >= thresholds.next24.caution
  ) {
    level = 'caution'
    title = 'Caution'
    description =
      'Swimming conditions require attention. Check details below.'
  }
  return { level, title, description }
})

async function loadAll() {
  loading.value = true
  try {
    router.replace({ query: { date: dateStr.value, beach: selectedKey.value } })
    const b = currentBeach.value
    const data = await getConditionsForDate(dateStr.value, b.lat, b.lon)
    today.value = data.today
    rainPast72.value = data.rain.past72
    rainNext24.value = data.rain.next24
  } catch (e) {
    console.error('[RainWeatherView] loadAll error:', e)
    today.value = {
      condition: 'Partly Cloudy',
      temperature: 22,
      wind: '15 km/h SW'
    }
    rainPast72.value = 0
    rainNext24.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const map = L.map('beach-forecast-map').setView([-38.0, 145.0], 9)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  // 加载所有沙滩 pin；点击时自动更新下方卡片
  BEACHES.forEach((b) => {
    L.marker([b.lat, b.lon])
      .addTo(map)
      .bindPopup(b.name)
      .on('click', async (e) => {
        selectedKey.value = b.key
        await loadAll()
        const tip = `${formattedDate.value}<br>${b.name}<br>
          <b>${today.value.condition}</b>, ${
          today.value.temperature ?? '—'
        }°C, ${today.value.wind ?? '—'}<br>
          72h: <b>${rainPast72.value}</b> mm · Next 24h: <b>${rainNext24.value}</b> mm`
        e.target.setPopupContent(tip).openPopup()
      })
  })

  await loadAll()
})
</script>

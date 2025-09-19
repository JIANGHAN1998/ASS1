<template>
  <div class="min-h-screen bg-white text-slate-900">
    <!-- Beach banner -->
    <section class="w-full">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
        alt="Beach banner"
        class="w-full h-40 sm:h-48 md:h-56 object-cover"
        loading="lazy"
      />
    </section>

    <!-- Page container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Map card -->
      <section class="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- Title -->
        <header class="px-4 sm:px-6 pt-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-center">
            Port Phillip Bay Safety Map
          </h2>
        </header>

        <!-- Search row -->
        <div class="px-4 sm:px-6 mt-4">
          <div class="flex items-center justify-end">
            <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 w-full sm:w-80">
              <input
                v-model="kw"
                @keyup.enter="handleSearch"
                placeholder="Suburb/postcode or beach name..."
                class="flex-1 bg-transparent outline-none text-sm"
              />
              <button class="btn-chip" @click="handleSearch">Search</button>
              <button class="btn-chip" title="Options">⋮</button>
              <button class="btn-chip" title="Fullscreen" @click="toggleFullscreen">⤢</button>
            </div>
          </div>
        </div>

        <!-- Map canvas -->
        <div class="px-4 sm:px-6">
          <div class="relative mt-4 mb-6 overflow-hidden rounded-xl border border-slate-300">
            <div ref="mapEl" class="h-[64vh] min-h-[420px] w-full"></div>

            <!-- bottom-right buttons -->
            <div class="absolute right-3 bottom-3 flex gap-2">
              <button class="btn-ui" @click="showDisclaimer = !showDisclaimer">Disclaimer</button>
              <button class="btn-ui" @click="openLegend">View pin legend</button>
            </div>

            <!-- floating disclaimer -->
            <div
              v-if="showDisclaimer"
              class="absolute right-3 bottom-16 w-72 rounded-xl border border-slate-200 bg-white/95 p-3 shadow"
            >
              <b class="text-sm">Notes</b>
              <p class="mt-1 text-xs leading-relaxed text-slate-600">
                Type a <b>beach name</b> (e.g. “Safety Beach”) or a <b>postcode</b> (e.g. 3934).<br />
                Name → focus matching pins; Postcode → geocode then show nearest beaches.
              </p>
            </div>
          </div>
        </div>

        <!-- Three-state legend strip -->
        <div class="px-4 sm:px-6 pb-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="legend-card border-green-200 bg-green-50">
              <div class="flex items-start gap-3">
                <span class="mt-1 inline-block h-3.5 w-3.5 rounded-full bg-green-500"></span>
                <div>
                  <div class="font-semibold text-green-700">Safe</div>
                  <p class="text-sm text-green-700/80">
                    Water quality is excellent. Safe for all water activities.
                  </p>
                </div>
              </div>
            </div>
            <div class="legend-card border-amber-200 bg-amber-50">
              <div class="flex items-start gap-3">
                <span class="mt-1 inline-block h-3.5 w-3.5 rounded-full bg-amber-500"></span>
                <div>
                  <div class="font-semibold text-amber-700">Caution</div>
                  <p class="text-sm text-amber-700/80">
                    Water quality is moderate. Exercise caution when swimming.
                  </p>
                </div>
              </div>
            </div>
            <div class="legend-card border-rose-200 bg-rose-50">
              <div class="flex items-start gap-3">
                <span class="mt-1 inline-block h-3.5 w-3.5 rounded-full bg-rose-500"></span>
                <div>
                  <div class="font-semibold text-rose-700">Unsafe</div>
                  <p class="text-sm text-rose-700/80">
                    Poor water quality. Swimming not recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Three feature cards -->
      <section class="mt-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="feature-card bg-indigo-600">
            <div class="feature-card-body">
              <div class="text-3xl">📈</div>
              <h3 class="mt-2 text-white text-lg font-semibold">Historical Data</h3>
              <p class="mt-1 text-white/90 text-sm">
                Check past water quality trends to build confidence.
              </p>
              <button class="feature-card-btn">View Trends</button>
            </div>
          </div>
          <div class="feature-card bg-green-600">
            <div class="feature-card-body">
              <div class="text-3xl">🛡️</div>
              <h3 class="mt-2 text-white text-lg font-semibold">Safety Guidelines</h3>
              <p class="mt-1 text-white/90 text-sm">
                Learn what to do before and after swimming.
              </p>
              <button class="feature-card-btn">Read Guide</button>
            </div>
          </div>
          <div class="feature-card bg-violet-600">
            <div class="feature-card-body">
              <div class="text-3xl">👥</div>
              <h3 class="mt-2 text-white text-lg font-semibold">Community</h3>
              <p class="mt-1 text-white/90 text-sm">
                Share experiences, thoughts, and updates.
              </p>
              <button class="feature-card-btn">Join Community</button>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA gradient -->
      <section class="mt-12 rounded-2xl bg-gradient-to-b from-sky-700 to-sky-800 text-white px-6 py-12 text-center shadow">
        <h3 class="text-2xl sm:text-3xl font-extrabold">
          Plan your next safe swim today.
        </h3>
        <p class="mt-2 text-white/90">
          Join thousands of swimmers who trust SwimMate for safe water activities.
        </p>
        <div class="mt-6 flex items-center justify-center gap-4">
          <button class="cta-btn-outline">View Beaches</button>
          <button class="cta-btn-solid">Join Community</button>
        </div>
      </section>

      <!-- Trusted by -->
      <section class="mt-10 mb-16 text-center">
        <h4 class="text-slate-900 font-semibold">Trusted By</h4>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span class="chip-trusted">EPA Victoria</span>
          <span class="chip-trusted">Bureau of Meteorology</span>
          <span class="chip-trusted">Beach Reports</span>
        </div>
        <p class="mt-4 text-xs text-slate-500">
          Proudly supporting UN SDG 06 – Clean Water & Sanitation.
        </p>
      </section>
    </div>

    <!-- Footer bar -->
    <footer class="bg-slate-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between text-sm">
          <div>© 2025 SwimMate · Built for Port Phillip Bay.</div>
          <nav class="flex gap-6">
            <a href="#" class="hover:underline">Privacy</a>
            <a href="#" class="hover:underline">Accessibility</a>
            <a href="#" class="hover:underline">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as L from 'leaflet'
import { fetchSites } from '@/services/dbApi'
import { reverseGeocodeClient, forwardGeocodeClient } from '@/services/revgeoClient'

const kw = ref('')
const showDisclaimer = ref(false)
const mapEl = ref(null)
let map, markersLayer, pinAtQuery

// Leaflet default marker icons (fix for Vite)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -28],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function statusColor(s) {
  const t = (s || 'green').toLowerCase()
  if (t === 'amber') return '#f59e0b'
  if (t === 'red') return '#ef4444'
  return '#22c55e'
}

function toggleFullscreen() {
  const el = mapEl.value
  if (!document.fullscreenElement) el?.requestFullscreen?.()
  else document.exitFullscreen?.()
}

function openLegend() {
  alert('Legend:\n● Green = Safe\n● Amber = Caution\n● Red = Unsafe')
}

function haversine(a, b, c, d) {
  const toRad = x => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(c - a)
  const dLon = toRad(d - b)
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

async function drawSites() {
  const rows = await fetchSites() // [{ site_name, water_body, latitude, longitude, status }]
  markersLayer?.clearLayers()
  const layer = L.layerGroup()
  const bounds = L.latLngBounds()

  rows.forEach(s => {
    const lat = Number(s.latitude)
    const lng = Number(s.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const color = statusColor(s.status)
    const marker = L.circleMarker([lat, lng], {
      radius: 8, color, weight: 2, fillColor: color, fillOpacity: 0.65
    })

    marker.bindPopup(`
      <div style="min-width:220px">
        <strong>${s.site_name ?? 'Unnamed beach'}</strong><br/>
        ${s.water_body ?? 'Port Phillip Bay'}<br/>
        <em style="color:#64748b">Loading address…</em>
      </div>
    `)

    let fetched = false
    marker.on('popupopen', async () => {
      if (fetched) return
      fetched = true
      try {
        const r = await reverseGeocodeClient(lat, lng)
        marker.setPopupContent(`
          <div style="min-width:220px">
            <strong>${s.site_name ?? 'Unnamed beach'}</strong><br/>
            ${s.water_body ?? 'Port Phillip Bay'}<br/>
            ${
              r?.address
                ? `<span>${r.address}</span>`
                : `<em style="color:#64748b">Address unavailable</em>`
            }
          </div>
        `)
      } catch {
        marker.setPopupContent(`
          <div style="min-width:220px">
            <strong>${s.site_name ?? 'Unnamed beach'}</strong><br/>
            ${s.water_body ?? 'Port Phillip Bay'}<br/>
            <em style="color:#64748b">Address unavailable</em>
          </div>
        `)
      }
    })

    layer.addLayer(marker)
    bounds.extend([lat, lng])

    // meta for name search
    marker._meta = { name: (s.site_name || '').toLowerCase(), ll: { lat, lng } }
  })

  layer.addTo(map)
  markersLayer = layer
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.1))
}

async function handleSearch() {
  const q = kw.value.trim()
  if (!q || !markersLayer) return

  // 1) fuzzy name match
  const lower = q.toLowerCase()
  const matched = []
  markersLayer.eachLayer(m => {
    if (m._meta?.name?.includes(lower)) matched.push(m)
  })
  if (matched.length) {
    const b = L.latLngBounds(matched.map(m => m.getLatLng()))
    map.fitBounds(b.pad(0.15))
    matched[0].openPopup()
    if (pinAtQuery) { map.removeLayer(pinAtQuery); pinAtQuery = null }
    return
  }

  // 2) postcode/place → forward geocode
  const pt = await forwardGeocodeClient(q).catch(() => null)
  if (!pt) { alert('No result for this query.'); return }

  if (pinAtQuery) map.removeLayer(pinAtQuery)
  pinAtQuery = L.circle([pt.lat, pt.lng], {
    radius: 800, color: '#0ea5e9', weight: 2, fillOpacity: 0
  }).addTo(map)

  const items = []
  markersLayer.eachLayer(m => {
    const ll = m.getLatLng()
    items.push({ m, d: haversine(ll.lat, ll.lng, pt.lat, pt.lng) })
  })
  items.sort((a, b) => a.d - b.d)
  const top = items.slice(0, 8).map(x => x.m)
  const b = L.latLngBounds(top.map(m => m.getLatLng()))
  if (b.isValid()) map.fitBounds(b.pad(0.2))
  top[0]?.openPopup()
}

onMounted(async () => {
  map = L.map(mapEl.value, { zoomControl: true }).setView([-38.05, 144.9], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(map)

  try { await drawSites() } catch (e) { console.error('fetchSites failed:', e) }
})
</script>

<style scoped>
.btn-chip{
  @apply inline-flex items-center rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-300 transition;
}
.btn-ui{
  @apply rounded-xl bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-white transition;
}
.legend-card{
  @apply rounded-xl border px-4 py-3;
}
.feature-card{
  @apply rounded-2xl shadow-md overflow-hidden;
}
.feature-card-body{
  @apply p-6 text-white;
}
.feature-card-btn{
  @apply inline-flex items-center rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition;
}
.cta-btn-outline{
  @apply inline-flex items-center rounded-xl border border-white/70 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition;
}
.cta-btn-solid{
  @apply inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-white/90 transition;
}
.chip-trusted{
  @apply inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200;
}
</style>


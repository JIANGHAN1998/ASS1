<template>
    <section class="min-h-screen bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Contact Us</h1>
        <p class="mt-2 text-slate-600">
          Share what you see at the beach today. Your report helps others choose safer spots.
        </p>
  
        <!-- username badge (anonymous alias, persisted locally) -->
        <div class="mt-4">
          <span class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-slate-700 text-sm ring-1 ring-slate-200">
            <span class="text-xs uppercase tracking-wide text-slate-500">Your alias</span>
            <strong>{{ username }}</strong>
          </span>
          <button class="ml-3 text-sm text-sky-700 hover:underline" @click="regenUsername">
            Regenerate
          </button>
        </div>
  
        <!-- form card -->
        <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Beach select -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Beach</label>
              <select v-model="form.beach" required
                      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="" disabled>Select a beach…</option>
                <option v-for="b in beaches" :key="b" :value="b">
                  {{ b }}
                </option>
              </select>
            </div>
  
            <!-- Condition -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Condition (your view)</label>
              <select v-model="form.condition" required
                      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="" disabled>Select…</option>
                <option value="Safe">Safe</option>
                <option value="Caution">Caution</option>
                <option value="Unsafe">Unsafe</option>
              </select>
            </div>
  
            <!-- Water clarity -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Water clarity</label>
              <select v-model="form.clarity" required
                      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="" disabled>Select…</option>
                <option>Clear</option>
                <option>Slightly murky</option>
                <option>Murky</option>
                <option>Discoloured / foamy</option>
              </select>
            </div>
  
            <!-- Crowd / optional -->
            <div class="col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Crowd (optional)</label>
              <select v-model="form.crowd"
                      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">—</option>
                <option>Quiet</option>
                <option>Moderate</option>
                <option>Busy</option>
              </select>
            </div>
  
            <!-- Comment -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Comment</label>
              <textarea v-model.trim="form.comment" rows="4" required
                        placeholder="Briefly describe what you observed (e.g., after rain, debris, unusual smell, etc.)"
                        class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
            </div>
  
            <!-- Submit -->
            <div class="md:col-span-2 flex items-center gap-3">
              <button type="submit"
                      class="inline-flex items-center rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700 transition">
                Submit report
              </button>
              <span v-if="justSaved" class="text-sm text-green-700">Thanks! Your report was posted.</span>
            </div>
          </form>
        </div>
  
        <!-- Recent submissions table -->
        <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Recent community reports</h2>
            <button class="text-sm text-slate-600 hover:underline" @click="clearAll">Clear all</button>
          </div>
  
          <div v-if="submissions.length === 0" class="text-slate-500 text-sm">
            No reports yet. Be the first to share what you see.
          </div>
  
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="text-slate-600">
                <tr>
                  <th class="py-2 pr-4">When</th>
                  <th class="py-2 pr-4">User</th>
                  <th class="py-2 pr-4">Beach</th>
                  <th class="py-2 pr-4">Condition</th>
                  <th class="py-2 pr-4">Clarity</th>
                  <th class="py-2 pr-4">Crowd</th>
                  <th class="py-2 pr-4">Comment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in submissions" :key="r.id" class="border-t border-slate-100 align-top">
                  <td class="py-2 pr-4 whitespace-nowrap">{{ formatTime(r.ts) }}</td>
                  <td class="py-2 pr-4 whitespace-nowrap">{{ r.user }}</td>
                  <td class="py-2 pr-4 whitespace-nowrap">{{ r.beach }}</td>
                  <td class="py-2 pr-4 whitespace-nowrap">
                    <span :class="badgeClass(r.condition)">{{ r.condition }}</span>
                  </td>
                  <td class="py-2 pr-4 whitespace-nowrap">{{ r.clarity || '—' }}</td>
                  <td class="py-2 pr-4 whitespace-nowrap">{{ r.crowd || '—' }}</td>
                  <td class="py-2 pr-4">{{ r.comment }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <!-- Live comment feed -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <article v-for="r in submissions" :key="r.id + '-card'"
                   class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold">{{ r.user }}</div>
              <div class="text-xs text-slate-500">{{ r.beach }}</div>
            </div>
            <div class="mt-2 text-xs text-slate-500">{{ formatTime(r.ts) }}</div>
            <p class="mt-2 text-slate-800 text-sm leading-6">{{ r.comment }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <span :class="badgeClass(r.condition)">{{ r.condition }}</span>
              <span class="rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">{{ r.clarity }}</span>
              <span v-if="r.crowd" class="rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-slate-200">{{ r.crowd }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  // ---------- Local DB (IndexedDB) ----------
  const DB_NAME = 'swm_local'
  const DB_VER = 1
  const STORE_REPORTS = 'reports'
  const STORE_BEACHES = 'beaches'
  
  function openDB () {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER)
      req.onupgradeneeded = (e) => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE_REPORTS)) {
          const s = db.createObjectStore(STORE_REPORTS, { keyPath: 'id' })
          s.createIndex('ts', 'ts', { unique: false })
        }
        if (!db.objectStoreNames.contains(STORE_BEACHES)) {
          db.createObjectStore(STORE_BEACHES, { keyPath: 'name' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  
  async function dbPut(storeName, value) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).put(value)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
  
  async function dbBulkPutBeaches(names) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BEACHES, 'readwrite')
      const store = tx.objectStore(STORE_BEACHES)
      names.forEach(n => store.put({ name: n }))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
  
  async function dbGetAll(storeName, indexName=null, desc=false) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly')
      const store = indexName ? store = tx.objectStore(storeName).index(indexName) : tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = () => {
        const arr = req.result || []
        if (desc && arr.length && arr[0].ts) {
          arr.sort((a,b) => b.ts - a.ts)
        }
        resolve(arr)
      }
      req.onerror = () => reject(req.error)
    })
  }
  
  async function dbClear(storeName) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
  
  // ---------- Beaches (full list from your request) ----------
  const BEACHES_SOURCE = [
    'Port Melbourne','Hampton','Half Moon Bay','Mentone','Seaford','Frankston Surf Life Saving Club',
    'Safety Beach','Blairgowrie','Sorrento','The Dell','Eastern Beach','Portsea','Rye','Dromana',
    'Canadian Bay','Frankston Coast Guard','Mordialloc','Sandringham','Elwood','St Kilda','Sandridge',
    'Williamstown','Altona','Werribee Sth','Portarlington Beach (new site)','St Leonards','Beaumaris',
    'Brighton Life Saving Club','Mornington Life Saving Club','Rosebud Life Saving Club',
    'Mt Martha Life Saving Club','Carrum Surf, Life Saving Club','Aspendale Life Saving Club',
    'South Melbourne Life Saving Club','Santa Casa','Black Rock Life Saving Club'
  ]
  
  // ---------- State ----------
  const beaches = ref([])
  const submissions = ref([])
  const justSaved = ref(false)
  const username = ref('')
  
  // ---------- Helpers ----------
  function genUsername() {
    const animals = ['Seastar','Dolphin','Pelican','Gull','Seal','Kelp','Coral','Sandpiper','Marlin','Albatross']
    const adj = ['Bright','Calm','Swift','Sunny','Brave','Lucky','Gentle','Tidy','Merry','Quiet']
    const id = Math.floor(1000 + Math.random() * 9000)
    return `${adj[Math.floor(Math.random()*adj.length)]}-${animals[Math.floor(Math.random()*animals.length)]}-${id}`
  }
  function regenUsername() {
    username.value = genUsername()
    try { localStorage.setItem('swm_user_alias', username.value) } catch {}
  }
  
  const form = ref({
    beach: '',
    condition: '',
    clarity: '',
    crowd: '',
    comment: ''
  })
  
  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleString()
  }
  
  function badgeClass(cond) {
    const base = 'rounded-md px-2 py-0.5 ring-1 text-xs'
    if (cond === 'Safe')   return `${base} bg-green-50 text-green-700 ring-green-200`
    if (cond === 'Caution')return `${base} bg-amber-50 text-amber-700 ring-amber-200`
    return `${base} bg-rose-50 text-rose-700 ring-rose-200`
  }
  
  async function clearAll() {
    await dbClear(STORE_REPORTS)
    submissions.value = []
  }
  
  async function loadBeaches() {
    // seed once
    const existing = await dbGetAll(STORE_BEACHES)
    if (!existing || existing.length === 0) {
      await dbBulkPutBeaches(BEACHES_SOURCE)
    }
    const rows = await dbGetAll(STORE_BEACHES)
    beaches.value = rows.map(r => r.name).sort((a,b) => a.localeCompare(b))
  }
  
  async function loadReports() {
    const rows = await dbGetAll(STORE_REPORTS, null, true)
    submissions.value = rows
  }
  
  // ---------- Submit ----------
  async function handleSubmit() {
    if (!form.value.beach || !form.value.condition || !form.value.clarity || !form.value.comment) return
  
    const entry = {
      id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random()),
      ts: Date.now(),
      user: username.value || genUsername(), // anonymous alias
      beach: form.value.beach,
      condition: form.value.condition,
      clarity: form.value.clarity,
      crowd: form.value.crowd || '',
      comment: form.value.comment
    }
  
    await dbPut(STORE_REPORTS, entry)
    submissions.value = [entry, ...submissions.value] // newest first
    justSaved.value = true
    setTimeout(() => (justSaved.value = false), 1800)
  
    // keep beach; reset others for quick consecutive reports
    form.value.comment = ''
    form.value.crowd = ''
  }
  
  // ---------- Init ----------
  onMounted(async () => {
    // alias
    try {
      const alias = localStorage.getItem('swm_user_alias')
      username.value = alias || genUsername()
      if (!alias) localStorage.setItem('swm_user_alias', username.value)
    } catch {
      username.value = genUsername()
    }
  
    await loadBeaches()
    await loadReports()
  })
  </script>
  
  <style scoped>
  /* make the table a bit nicer on small screens */
  table th, table td { padding-right: 0.75rem; }
  </style>
  
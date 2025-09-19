<template>
  <div class="min-h-screen">
    <div class="main-container">
      <div class="analysis-card">
        <div class="card-nav">
          <button :class="['nav-button', currentMode==='single' && 'active']"
                  @click="switchMode('single')">Beach Analysis</button>
          <button :class="['nav-button', currentMode==='comparison' && 'active']"
                  @click="switchMode('comparison')">Compare Beaches</button>
        </div>

        <!-- Single Beach Mode -->
        <div v-if="currentMode==='single'" id="single-mode" :key="'single-mode'">
          <div class="controls-panel">
            <div class="control-row">
              <div class="field-group">
                <label class="field-label">Beach Location</label>
                <select id="beach-select" class="field-input" v-model="selectedBeachId">
                  <option value="">Select a beach...</option>
                  <option v-for="b in beaches" :key="b.site_id" :value="String(b.site_id)">{{ b.site_name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Analysis Period</label>
                <select id="year-select" class="field-input" v-model="selectedYear">
                  <option value="">All available data</option>
                  <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
                </select>
              </div>
              <button id="analyze-single" class="analyze-btn" @click="analyzeBeach">Analyze</button>
            </div>
          </div>

          <div class="content-area" :class="{'one-col': false}">
            <div class="chart-section">
              <div id="chart-title" class="chart-title" :class="{ hidden: !chartTitle }">{{ chartTitle }}</div>
              <div id="chart-container" class="chart-container" ref="chartContainer">
                <div id="welcome-state" class="empty-state" v-if="showWelcome">
                  <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">🏊‍♀️ Find Your Perfect Beach</div>
                    <p style="font-size: 16px; color: #4a5568; margin-bottom: 24px; line-height: 1.6;">
                      Discover the best swimming spots in Port Phillip Bay with real water quality data.
                      Select a beach above to see detailed analysis, or compare multiple beaches to find the safest option.
                    </p>
                    <div id="loading-recommendations" style="display: none;">
                      <div style="font-size: 14px; color: #64748b;">Loading beach recommendations...</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quality Breakdown and Recommendations -->
              <div id="quality-breakdown-section" :class="{ hidden: !showBreakdown }" style="margin-top: 32px;">
                <!-- Summary -->
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a202c;">Water Quality Summary</h3>
                    <div style="display: flex; gap: 32px;">
                      <div style="text-align: center;">
                        <div id="total-tests-main" style="font-size: 28px; font-weight: 700; color: #2b6cb0;">{{ metrics.totalTests }}</div>
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Total Tests</div>
                      </div>
                      <div style="text-align: center;">
                        <div id="avg-rating-main" style="font-size: 28px; font-weight: 700; color: #2b6cb0;">{{ metrics.avgRatingDisplay }}</div>
                        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Avg Rating</div>
                      </div>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
                    <div class="kpi kpi-safe">
                      <div class="kpi-left"><div class="kpi-dot" style="background:#22c55e"></div><span>Safe</span></div>
                      <div id="safe-count-main" class="kpi-val">{{ metrics.safe }}</div>
                    </div>
                    <div class="kpi kpi-rel">
                      <div class="kpi-left"><div class="kpi-dot" style="background:#f59e0b"></div><span>Relatively Safe</span></div>
                      <div id="relatively-safe-count-main" class="kpi-val">{{ metrics.relativelySafe }}</div>
                    </div>
                    <div class="kpi kpi-caution">
                      <div class="kpi-left"><div class="kpi-dot" style="background:#f97316"></div><span>Caution</span></div>
                      <div id="caution-count-main" class="kpi-val">{{ metrics.caution }}</div>
                    </div>
                    <div class="kpi kpi-unsafe">
                      <div class="kpi-left"><div class="kpi-dot" style="background:#ef4444"></div><span>Unsafe</span></div>
                      <div id="unsafe-count-main" class="kpi-val">{{ metrics.unsafe }}</div>
                    </div>
                  </div>
                </div>

                <!-- Recommendations -->
                <div id="recommendations-main" style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #3b82f6; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="width: 6px; height: 32px; background: #2563eb; border-radius: 3px;"></div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e40af;">Swimming Recommendation</h3>
                  </div>
                  <div id="recommendation-text-main" style="font-size: 16px; line-height: 1.6; color: #1e40af; font-weight: 500;" v-html="recommendationHtml" />
                </div>
              </div>
            </div>

            <div class="insights-sidebar">
              <div id="beach-info" class="insight-box" :class="{ hidden: !beachInfoVisible }">
                <div class="insight-title">Beach Information</div>
                <div id="beach-details">
                  <div style="font-weight: 600; font-size: 18px; margin-bottom: 6px; color: #1a202c;">{{ beachInfo.name }}</div>
                  <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">📍 Port Phillip Bay, Melbourne</div>
                  <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 12px; margin-top: 12px;">
                    <div style="font-size: 12px; color: #0c4a6e; font-weight: 600; margin-bottom: 4px;">ANALYSIS PERIOD</div>
                    <div style="font-size: 14px; color: #0c4a6e; font-weight: 500;">{{ beachInfo.period }}</div>
                  </div>
                </div>
              </div>

              <!-- Top Beaches Widget -->
              <div id="top-beaches-widget" class="insight-box" :class="{ hidden: currentMode!=='single' }">
                <div class="insight-title" style="display: flex; align-items: center; gap: 8px;">
                  <span>🏆</span>
                  <span>Recommended Beaches</span>
                </div>
                <div id="top-beaches-content" style="font-size: 14px; color: #64748b;" v-html="topBeachesHtml"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Mode -->
        <div v-if="currentMode==='comparison'" id="comparison-mode" :key="'comparison-mode'">
          <div class="controls-panel">
            <div class="comparison-controls">
              <div class="field-group">
                <label class="field-label">Beach 1</label>
                <select id="beach1-select" class="field-input" v-model="cmp.beach1">
                  <option value="">Select first beach...</option>
                  <option v-for="b in beaches" :key="b.site_id + '-1'" :value="String(b.site_id)">{{ b.site_name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Beach 2</label>
                <select id="beach2-select" class="field-input" v-model="cmp.beach2">
                  <option value="">Select second beach...</option>
                  <option v-for="b in beaches" :key="b.site_id + '-2'" :value="String(b.site_id)">{{ b.site_name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Beach 3 (Optional)</label>
                <select id="beach3-select" class="field-input" v-model="cmp.beach3">
                  <option value="">Select third beach...</option>
                  <option v-for="b in beaches" :key="b.site_id + '-3'" :value="String(b.site_id)">{{ b.site_name }}</option>
                </select>
              </div>
            </div>
            <button id="compare-btn" class="analyze-btn" @click="compareBeaches">Compare</button>
          </div>

          <div class="content-area" :class="{'one-col': true}">
            <div class="chart-section">
              <div id="comparison-title" class="chart-title" :class="{ hidden: !comparisonTitle }">{{ comparisonTitle }}</div>
              <div id="comparison-container" class="chart-container" ref="comparisonContainer">
                <div class="empty-state" v-if="showComparisonEmpty">Select 2-3 beaches to compare water quality trends</div>
              </div>

              <div id="comparison-insights" class="insight-box" :class="{ hidden: !comparisonInsightsVisible }" style="margin-top: 32px;">
                <div class="insight-title">Comparison Results</div>
                <div id="comparison-details" v-html="comparisonHtml"></div>
              </div>
            </div>
            <div class="insights-sidebar"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, nextTick } from 'vue'
import * as d3 from 'd3'

const beaches = ref([])
const currentMode = ref('single')
const selectedBeachId = ref('')
const selectedYear = ref('')
const years = ref([])

const chartContainer = ref(null)
const comparisonContainer = ref(null)

const chartTitle = ref('')
const comparisonTitle = ref('')
const showWelcome = ref(true)
const showBreakdown = ref(false)
const beachInfoVisible = ref(false)
const topBeachesHtml = ref('Loading recommendations...')
const recommendationHtml = ref('Select a beach and analyze to see swimming recommendations based on water quality data.')

const cmp = reactive({ beach1: '', beach2: '', beach3: '' })
const showComparisonEmpty = ref(true)
const comparisonInsightsVisible = ref(false)
const comparisonHtml = ref('')

const beachInfo = reactive({ name: '', period: '' })
const metrics = reactive({ totalTests: '-', avgRatingDisplay: '-', safe: 0, relativelySafe: 0, caution: 0, unsafe: 0 })

const popularBeaches = [99020, 99060, 99070, 99290, 99160]
let wireTimer = null

onMounted(async () => {
  await checkConnection()
  await loadBeaches()
  populateYears()
  await loadTopBeachesRecommendations()
})

onBeforeUnmount(() => {
  if (wireTimer) { clearTimeout(wireTimer); wireTimer = null }
})

async function checkConnection () {
  try {
    await fetch('/api/ping').then(r => r.json())
  } catch (e) {
    const el = document.getElementById('status')
    if (el) {
      el.innerHTML = `<div class="status-dot" style="background:#f56565"></div><span>Connection Error</span>`
    }
  }
}

async function loadBeaches () {
  try {
    const res = await fetch('/api/beaches')
    beaches.value = await res.json()
  } catch (e) {
    console.error('Failed to load beaches:', e)
  }
}

function populateYears () {
  const currentYear = new Date().getFullYear()
  const ys = []
  for (let y = currentYear; y >= 2013; y--) ys.push(y)
  years.value = ys
}

async function loadTopBeachesRecommendations () {
  try {
    const recs = []
    if (!beaches.value.length) {
      try { await loadBeaches() } catch {}
    }

    for (const id of popularBeaches.slice(0, 3)) {
      try {
        const r = await fetch(`/api/beach-data?beachId=${id}&year=2024`)
        const data = await r.json()
        if (data.totalTests > 0) {
          const b = beaches.value.find(x => String(x.site_id) === String(id))
          const safePercent = ((data.qualityCounts.Safe || 0) / data.totalTests * 100)
          const avgRating = parseFloat(data.averageRating)
          recs.push({ name: b?.site_name || 'Unknown', safePercent: safePercent.toFixed(0), rating: avgRating.toFixed(1), id })
        }
      } catch {}
    }
    recs.sort((a, b) => parseFloat(b.safePercent) - parseFloat(a.safePercent))

    let html = ''
    if (recs.length) {
      html += '<div style="margin-bottom:16px; font-size:13px; color:#64748b;">Based on 2024 water quality data:</div>'
      recs.forEach((b, i) => {
        const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
        const ratingColor = parseFloat(b.rating) >= 3.5 ? '#22c55e' : parseFloat(b.rating) >= 3 ? '#3b82f6' : '#f59e0b'
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; margin-bottom:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-size:16px;">${emoji}</span>
                <span style="font-weight:600; color:#1a202c; font-size:14px;">${b.name}</span>
              </div>
              <div style="font-size:12px; color:#64748b;">${b.safePercent}% safe tests in 2024</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div style="font-weight:700; color:${ratingColor}; font-size:16px;">${b.rating}/4</div>
              <button style="font-size:12px; padding:6px 12px; background:#2b6cb0; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:500; min-width:60px;" onclick="">Select</button>
            </div>
          </div>`
      })
      if (!beachInfoVisible.value) {
        html += '<div style="margin-top:16px; padding:12px; background:#f0f9ff; border:1px solid #bfdbfe; border-radius:6px; font-size:13px; color:#1e40af; line-height:1.4;">💡 <strong>Tip:</strong> Compare multiple beaches to find the best option for your visit</div>'
      }
    } else {
      html = '<div style="color:#64748b;">Unable to load recommendations at this time.</div>'
    }

    topBeachesHtml.value = html
    nextTickWireSelectButtons()
  } catch (e) {
    console.error('Failed to load beach recommendations:', e)
    topBeachesHtml.value = '<div style="color:#64748b;">Unable to load recommendations.</div>'
  }
}

function nextTickWireSelectButtons () {
  if (wireTimer) { clearTimeout(wireTimer) }
  wireTimer = setTimeout(() => {
    const widget = document.getElementById('top-beaches-widget')
    if (!widget) return
    widget.querySelectorAll('button').forEach(btn => {
      if (!btn.__wired) {
        btn.__wired = true
        btn.addEventListener('click', () => {
          const nameNode = btn.closest('div')?.parentElement?.querySelector('span + span')
          const title = nameNode?.textContent?.trim()
          const beach = beaches.value.find(b => b.site_name === title)
          if (beach) {
            selectedBeachId.value = String(beach.site_id)
            selectedYear.value = '2024'
            analyzeBeach()
          }
        })
      }
    })
  }, 0)
}

async function switchMode (mode) {
  if (currentMode.value === mode) return
  currentMode.value = mode

  // 重置状态（仅状态，不操作其它容器，避免未挂载时清空）
  chartTitle.value = ''
  showWelcome.value = true
  showBreakdown.value = false
  beachInfoVisible.value = false
  recommendationHtml.value = 'Select a beach and analyze to see swimming recommendations based on water quality data.'
  comparisonTitle.value = ''
  showComparisonEmpty.value = true
  comparisonInsightsVisible.value = false
  comparisonHtml.value = ''

  await nextTick() // 等对应 DOM 确认挂载

  if (mode === 'single') {
    if (chartContainer.value) {
      chartContainer.value.innerHTML = ''
      showWelcome.value = true
    }
    loadTopBeachesRecommendations()
  } else {
    if (comparisonContainer.value) {
      comparisonContainer.value.innerHTML = ''
    }
  }
}

function showLoading (containerRef) {
  if (containerRef?.value) containerRef.value.innerHTML = '<div class="empty-state">Loading...</div>'
}

async function analyzeBeach () {
  if (!selectedBeachId.value) {
    alert('Please select a beach to analyze')
    return
  }
  const beach = beaches.value.find(b => String(b.site_id) === String(selectedBeachId.value))
  if (!beach) return
  showLoading(chartContainer)
  try {
    const url = `/api/beach-data?beachId=${selectedBeachId.value}${selectedYear.value ? `&year=${selectedYear.value}` : ''}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.totalTests === 0) {
      if (chartContainer.value) chartContainer.value.innerHTML = '<div class="empty-state">No data available for selected period</div>'
      return
    }
    renderBeachAnalysis(data, beach, selectedYear.value)
    updateBeachInsights(data, beach, selectedYear.value)
    await loadTopBeachesRecommendations()
  } catch (e) {
    console.error('Analysis failed:', e)
    if (chartContainer.value) chartContainer.value.innerHTML = '<div class="empty-state">Analysis failed. Please try again.</div>'
  }
}

async function compareBeaches () {
  if (!cmp.beach1 || !cmp.beach2) {
    alert('Please select at least 2 beaches to compare')
    return
  }
  showLoading(comparisonContainer)
  const ids = [cmp.beach1, cmp.beach2, cmp.beach3].filter(Boolean).join(',')
  try {
    const res = await fetch(`/api/beach-comparison?beachIds=${ids}`)
    const data = await res.json()
    renderBeachComparison(data)
    updateComparisonInsights(data)
  } catch (e) {
    console.error('Comparison failed:', e)
    if (comparisonContainer.value) comparisonContainer.value.innerHTML = '<div class="empty-state">Comparison failed. Please try again.</div>'
  }
}

function renderBeachAnalysis (data, beach, year) {
  if (!chartContainer.value) return
  chartContainer.value.innerHTML = ''
  chartTitle.value = `${beach.site_name} - Water Quality Analysis ${year ? `(${year})` : '(All Years)'} `
  showWelcome.value = false

  const width = 700
  const height = 400
  const margin = { top: 20, right: 120, bottom: 60, left: 70 }

  const svg = d3.select(chartContainer.value).append('svg').attr('width', width).attr('height', height)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const monthlyData = (data.monthlyData || []).map(d => ({
    ...d,
    date: new Date(d.month + '-01'),
    safeCount: Math.round(d.total * (+d.goodPercent) / 100),
    relativelySafeCount: Math.round(d.total * (+d.fairPercent) / 100),
    cautionCount: Math.round(d.total * (+d.poorPercent) / 100),
    unsafeCount: d.total - Math.round(d.total * (+d.goodPercent) / 100) - Math.round(d.total * (+d.fairPercent) / 100) - Math.round(d.total * (+d.poorPercent) / 100)
  })).sort((a, b) => a.date - b.date)

  if (!monthlyData.length) return

  const xScale = d3.scaleBand().domain(monthlyData.map(d => d3.timeFormat('%b %Y')(d.date))).range([0, innerWidth]).padding(0.2)
  const yScale = d3.scaleLinear().domain([0, Math.ceil(d3.max(monthlyData, d => d.total) * 1.1)]).range([innerHeight, 0])
  const yScalePercent = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

  const colors = { safe: '#10b981', relativelySafe: '#f59e0b', caution: '#f97316', unsafe: '#ef4444' }

  const stackedData = monthlyData.map(d => ({
    month: d3.timeFormat('%b %Y')(d.date),
    date: d.date,
    safePercent: +d.goodPercent,
    values: [
      { key: 'safe', value: d.safeCount, color: colors.safe },
      { key: 'relativelySafe', value: d.relativelySafeCount, color: colors.relativelySafe },
      { key: 'caution', value: d.cautionCount, color: colors.caution },
      { key: 'unsafe', value: d.unsafeCount, color: colors.unsafe }
    ]
  }))

  g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale))
    .selectAll('text').style('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '.15em').attr('transform', 'rotate(-35)').style('font-size', '11px')
  g.append('g').call(d3.axisLeft(yScale).tickFormat(d3.format('d'))).append('text')
    .attr('transform', 'rotate(-90)').attr('y', -50).attr('x', -innerHeight / 2).attr('dy', '1em')
    .style('text-anchor', 'middle').style('fill', '#4a5568').style('font-size', '12px').text('Test Count')

  const barGroups = g.selectAll('.bar-group').data(stackedData).enter().append('g').attr('class', 'bar-group').attr('transform', d => `translate(${xScale(d.month)},0)`)
  const barWidth = xScale.bandwidth() / 4
  const defs = svg.append('defs')

  const grad = (id, c1, c2) => {
    const lg = defs.append('linearGradient').attr('id', id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')
    lg.append('stop').attr('offset', '0%').attr('stop-color', c1)
    lg.append('stop').attr('offset', '100%').attr('stop-color', c2)
  }
  grad('safeGradient', '#34d399', '#10b981')
  grad('relativelySafeGradient', '#fbbf24', '#f59e0b')
  grad('cautionGradient', '#fb923c', '#f97316')
  grad('unsafeGradient', '#f87171', '#ef4444')

  barGroups.each(function (m) {
    const group = d3.select(this)
    const gradientMap = { safe: 'url(#safeGradient)', relativelySafe: 'url(#relativelySafeGradient)', caution: 'url(#cautionGradient)', unsafe: 'url(#unsafeGradient)' }
    m.values.forEach((q, i) => {
      if (q.value > 0) {
        group.append('rect')
          .attr('x', i * barWidth).attr('width', barWidth - 1)
          .attr('y', yScale(q.value)).attr('height', innerHeight - yScale(q.value))
          .attr('fill', gradientMap[q.key] || q.color).attr('stroke', 'white').attr('stroke-width', 0.5).attr('rx', 2).attr('ry', 2)
          .append('title').text(`${q.key}: ${q.value} tests`)
      }
    })
  })

  const lineGradient = defs.append('linearGradient').attr('id', 'lineGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%')
  lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981')
  lineGradient.append('stop').attr('offset', '50%').attr('stop-color', '#34d399')
  lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981')

  const safeLine = d3.line().x(d => xScale(d.month) + xScale.bandwidth() / 2).y(d => yScalePercent(d.safePercent)).curve(d3.curveMonotoneX)
  g.append('path').datum(stackedData).attr('fill', 'none').attr('stroke', 'url(#lineGradient)').attr('stroke-width', 4).attr('d', safeLine)

  g.selectAll('.safe-point').data(stackedData).enter().append('circle').attr('class', 'safe-point')
    .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2).attr('cy', d => yScalePercent(d.safePercent)).attr('r', 6)
    .attr('fill', '#10b981').attr('stroke', 'white').attr('stroke-width', 3)
    .on('mouseover', function () { d3.select(this).transition().duration(200).attr('r', 8).attr('stroke-width', 4) })
    .on('mouseout', function () { d3.select(this).transition().duration(200).attr('r', 6).attr('stroke-width', 3) })
    .append('title').text(d => `${d.month}: ${d.safePercent}% safe`)

  g.selectAll('.safe-label').data(stackedData).enter().append('text').attr('class', 'safe-label')
    .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2 + 15).attr('y', d => yScalePercent(d.safePercent)).attr('dy', '0.35em')
    .style('text-anchor', 'start').style('fill', '#065f46').style('font-size', '13px').style('font-weight', '700').text(d => `${d.safePercent}%`)

  const rightAxis = g.append('g').attr('class', 'right-axis-percentage').attr('transform', `translate(${innerWidth},0)`).call(d3.axisRight(yScalePercent).tickFormat(d => d + '%').tickValues([0, 20, 40, 60, 80, 100]))
  rightAxis.selectAll('text').style('fill', '#065f46').style('font-weight', 'bold').style('font-size', '14px')
  rightAxis.selectAll('line').style('stroke', '#10b981').style('stroke-width', '2').style('opacity', '0.8')
  rightAxis.select('.domain').style('stroke', '#10b981').style('stroke-width', '3').style('opacity', '0.9')
  rightAxis.append('text').attr('transform', 'rotate(-90)').attr('y', 65).attr('x', -innerHeight / 2).attr('dy', '1em').style('text-anchor', 'middle').style('fill', '#065f46').style('font-size', '14px').style('font-weight', 'bold').text('Safe Percentage (0-100%)')

  const legend = d3.select(chartContainer.value).append('div').attr('class', 'legend')
  const legendItems = [
    { color: '#10b981', label: 'Safe', type: 'bar' },
    { color: '#f59e0b', label: 'Relatively Safe', type: 'bar' },
    { color: '#f97316', label: 'Caution', type: 'bar' },
    { color: '#ef4444', label: 'Unsafe', type: 'bar' },
    { color: '#22c55e', label: 'Safe %', type: 'line' }
  ]
  legendItems.forEach(item => {
    const li = legend.append('div').attr('class', 'legend-item')
    li.append('div').attr('class', item.type === 'bar' ? 'legend-bar' : 'legend-marker').style('background-color', item.color)
    li.append('span').text(item.label)
  })
}

function renderBeachComparison (data) {
  if (!comparisonContainer.value) return
  comparisonContainer.value.innerHTML = ''
  comparisonTitle.value = 'Beach Water Quality Comparison'
  showComparisonEmpty.value = false

  const width = 700
  const height = 400
  const margin = { top: 20, right: 100, bottom: 60, left: 70 }

  const svg = d3.select(comparisonContainer.value).append('svg').attr('width', width).attr('height', height)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const allYears = [...new Set(data.flatMap(b => b.yearlyData.map(d => d.year)))].sort()
  const xScale = d3.scaleLinear().domain(d3.extent(allYears)).range([0, innerWidth])
  const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])

  g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
  g.append('g').call(d3.axisLeft(yScale)).append('text')
    .attr('transform', 'rotate(-90)').attr('y', -50).attr('x', -innerHeight / 2).attr('dy', '1em')
    .style('text-anchor', 'middle').style('fill', '#4a5568').style('font-size', '12px').text('Safe Water Quality (%)')

  const colors = ['#2b6cb0', '#48bb78', '#ed8936']

  data.forEach((beach, i) => {
    const line = d3.line().x(d => xScale(d.year)).y(d => yScale(+d.goodPercent)).curve(d3.curveMonotoneX)
    g.append('path').datum(beach.yearlyData).attr('fill', 'none').attr('stroke', colors[i]).attr('stroke-width', 3).attr('d', line)
    g.selectAll(`.point-${i}`).data(beach.yearlyData).enter().append('circle').attr('class', `point-${i}`).attr('cx', d => xScale(d.year)).attr('cy', d => yScale(+d.goodPercent)).attr('r', 4).attr('fill', colors[i])
  })

  const legend = d3.select(comparisonContainer.value).append('div').attr('class', 'legend')
  data.forEach((beach, i) => {
    const li = legend.append('div').attr('class', 'legend-item')
    li.append('div').attr('class', 'legend-marker').style('background-color', colors[i])
    li.append('span').text(beach.beachName)
  })
}

function updateBeachInsights (data, beach, year) {
  beachInfo.name = beach.site_name
  beachInfo.period = year || 'All available data'
  beachInfoVisible.value = true

  metrics.totalTests = data.totalTests
  metrics.avgRatingDisplay = `${data.averageRating}/4`
  metrics.safe = data.qualityCounts.Safe || 0
  metrics.relativelySafe = data.qualityCounts['Relatively Safe'] || 0
  metrics.caution = data.qualityCounts.Caution || 0
  metrics.unsafe = data.qualityCounts.Unsafe || 0
  showBreakdown.value = true

  const safePercent = ((data.qualityCounts.Safe || 0) / data.totalTests * 100)
  const relSafePercent = ((data.qualityCounts['Relatively Safe'] || 0) / data.totalTests * 100)
  const cautionPercent = ((data.qualityCounts.Caution || 0) / data.totalTests * 100)
  const unsafePercent = ((data.qualityCounts.Unsafe || 0) / data.totalTests * 100)
  const combinedSafePercent = safePercent + relSafePercent

  let trendIndicator = ''
  if (data.monthlyData && data.monthlyData.length >= 6) {
    const recent = data.monthlyData.slice(-3)
    const early = data.monthlyData.slice(0, 3)
    const recentAvg = recent.reduce((s, m) => s + parseFloat(m.goodPercent), 0) / 3
    const earlyAvg = early.reduce((s, m) => s + parseFloat(m.goodPercent), 0) / 3
    if (recentAvg > earlyAvg + 5) trendIndicator = ' Recent improvements noted.'
    else if (recentAvg < earlyAvg - 5) trendIndicator = ' Recent decline in quality observed.'
  }

  let icon = '🤔', status = 'Mixed conditions - check recent reports.', text = 'Water quality varies significantly at this location. Check current conditions and recent weather before swimming.'
  if (combinedSafePercent >= 85 && unsafePercent <= 5) { icon = '🏊‍♀️'; status = 'Excellent choice for swimming!'; text = `This beach consistently maintains high water quality standards with ${safePercent.toFixed(1)}% safe and ${relSafePercent.toFixed(1)}% relatively safe tests.` }
  else if (combinedSafePercent >= 70 && unsafePercent <= 10) { icon = '✅'; status = 'Good choice for swimming.'; text = `Generally reliable water quality with ${combinedSafePercent.toFixed(1)}% of tests rating safe or relatively safe. Monitor conditions during peak season.` }
  else if (combinedSafePercent >= 50 && unsafePercent <= 20) { icon = '⚠️'; status = 'Swim with caution.'; text = `Variable water quality - ${cautionPercent.toFixed(1)}% of tests show caution levels. Check recent conditions and consider swimming after dry weather.` }
  else if (unsafePercent >= 20) { icon = '🚫'; status = 'High risk - consider alternatives.'; text = `${unsafePercent.toFixed(1)}% of tests rated as unsafe. This beach shows frequent water quality issues. Consider nearby alternatives for safer swimming.` }

  recommendationHtml.value = `${icon} <strong>${status}</strong> ${text}${trendIndicator}`
}

function updateComparisonInsights (data) {
  const avgRatings = data.map(beach => {
    const ratings = beach.yearlyData.map(y => parseFloat(y.rating))
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length
    const latestYear = Math.max(...beach.yearlyData.map(d => d.year))
    const latest = beach.yearlyData.find(d => d.year === latestYear)
    return { name: beach.beachName, rating: avg, latestSafe: parseFloat(latest?.goodPercent || 0), trend: beach.yearlyData.length > 1 ? (parseFloat(beach.yearlyData[beach.yearlyData.length - 1].rating) - parseFloat(beach.yearlyData[0].rating)) : 0 }
  }).sort((a, b) => b.rating - a.rating)

  let html = '<div style="margin-bottom:20px;">'
  html += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;"><span style=\"font-size:20px;\">🏆</span><div style=\"font-weight:600; color:#2b6cb0; font-size:16px;\">Best Choice: ${avgRatings[0].name}</div></div>`
  html += '<div style="background:#f0f9ff; border:1px solid #0ea5e9; border-radius:8px; padding:16px; margin-bottom:16px;">'
  html += `<div style="font-size:14px; color:#0c4a6e; margin-bottom:8px;"><strong>Why this beach wins:</strong></div>`
  html += `<div style="font-size:13px; color:#0c4a6e; line-height:1.4;">• Highest average rating: <strong>${avgRatings[0].rating.toFixed(1)}/4.0</strong><br>• Recent safe tests: <strong>${avgRatings[0].latestSafe.toFixed(0)}%</strong><br>• Quality trend: ${avgRatings[0].trend > 0 ? '📈 Improving' : avgRatings[0].trend < -0.1 ? '📉 Declining' : '➡️ Stable'}</div></div>`

  html += '<div style="margin-bottom:16px;">'
  html += '<div style="font-weight:600; color:#1a202c; margin-bottom:8px;">Complete Ranking:</div>'
  avgRatings.forEach((b, i) => {
    const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
    const ratingColor = b.rating >= 3.5 ? '#22c55e' : b.rating >= 3 ? '#3b82f6' : '#f59e0b'
    const trendIcon = b.trend > 0.1 ? '📈' : b.trend < -0.1 ? '📉' : '➡️'
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:${i === 0 ? '#f0f9ff' : '#f8fafc'}; border-radius:6px; margin-bottom:4px; border:1px solid ${i === 0 ? '#0ea5e9' : '#e2e8f0'};">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${emoji}</span>
          <span style="font-weight:500; color:#1a202c; font-size:14px;">${b.name}</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right;">
            <div style="font-weight:600; color:${ratingColor}; font-size:13px;">${b.rating.toFixed(1)}/4</div>
            <div style="font-size:11px; color:#64748b;">${b.latestSafe.toFixed(0)}% safe</div>
          </div>
          <span style="font-size:12px;" title="Quality trend">${trendIcon}</span>
        </div>
      </div>`
  })
  html += '</div>'
  html += '<div style="background:#fffbeb; border:1px solid #f59e0b; border-radius:6px; padding:12px;">'
  html += '<div style="font-size:12px; color:#92400e; line-height:1.4;"><strong>💡 Quick Decision Guide:</strong><br>'
  html += `• <strong>Best Overall:</strong> ${avgRatings[0].name}<br>`
  const mostStable = avgRatings.find(b => Math.abs(b.trend) < 0.1)?.name || avgRatings[0].name
  html += `• <strong>Most Consistent:</strong> ${mostStable}<br>`
  html += '• Always check recent conditions before swimming</div></div>'
  comparisonHtml.value = html
  comparisonInsightsVisible.value = true
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }
/* 局部切列，不再使用 body.comparison-mode 全局类 */
.content-area.one-col { grid-template-columns: 1fr; max-width: 1200px; margin: 0 auto; }

body { font-family: 'Source Sans Pro', -apple-system, system-ui, sans-serif; background: #f7fafc; color: #2d3748; line-height: 1.6; }
.header { background: linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%); color: white; padding: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
.header-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
.logo-section { display: flex; align-items: center; gap: 16px; }
.logo { font-size: 28px; font-weight: 700; color: #63b3ed; }
.tagline { font-size: 16px; opacity: 0.9; font-weight: 300; }
.data-status { display: flex; align-items: center; gap: 8px; font-size: 14px; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #48bb78; }
.main-container { max-width: 1200px; margin: 32px auto; padding: 0 24px; }
.analysis-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); margin-bottom: 24px; overflow: hidden; }
.card-nav { background: #edf2f7; padding: 0; display: flex; border-bottom: 1px solid #e2e8f0; }
.nav-button { flex: 1; padding: 16px 24px; border: none; background: transparent; font-size: 16px; font-weight: 600; color: #4a5568; cursor: pointer; transition: all 0.2s ease; border-bottom: 3px solid transparent; }
.nav-button.active { background: white; color: #2b6cb0; border-bottom-color: #2b6cb0; }
.nav-button:hover:not(.active) { background: rgba(255,255,255,0.7); color: #2d3748; }
.controls-panel { padding: 24px; background: #f7fafc; border-bottom: 1px solid #e2e8f0; }
.control-row { display: flex; align-items: end; gap: 20px; flex-wrap: wrap; }
.field-group { display: flex; flex-direction: column; gap: 6px; min-width: 200px; }
.field-label { font-size: 14px; font-weight: 600; color: #2d3748; }
.field-input { padding: 12px 16px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 15px; background: white; transition: border-color 0.2s ease; }
.field-input:focus { outline: none; border-color: #2b6cb0; box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1); }
.analyze-btn { padding: 12px 24px; background: #2b6cb0; color: white; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s ease; height: fit-content; }
.analyze-btn:hover { background: #2c5282; }
.analyze-btn:disabled { background: #a0aec0; cursor: not-allowed; }
.content-area { display: grid; grid-template-columns: 1fr 450px; gap: 32px; padding: 32px 24px; min-height: 500px; }
.chart-section { position: relative; }
.chart-title { font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 16px; text-align: center; }
.chart-container { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; min-height: 450px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1); position: relative; overflow: visible; }
.chart-container::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6); border-radius: 14px; z-index: -1; opacity: 0.1; }
.empty-state { text-align: center; color: #718096; font-size: 16px; }
.insights-sidebar { display: flex; flex-direction: column; gap: 20px; min-width: 450px; padding-bottom: 24px; }
.insight-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; overflow: visible; word-wrap: break-word; width: 100%; box-sizing: border-box; }
.insight-title { font-size: 16px; font-weight: 600; color: #1a202c; margin-bottom: 12px; }
.metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.metric-item { text-align: center; }
.metric-value { font-size: 24px; font-weight: 700; color: #2b6cb0; display: block; }
.metric-label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
.quality-breakdown { display: flex; flex-direction: column; gap: 8px; }
.quality-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; min-height: 44px; width: 100%; }
.quality-item:last-child { border-bottom: none; }
.quality-label { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.quality-indicator { width: 12px; height: 12px; border-radius: 3px; }
.safe { background: #48bb78; }
.relatively-safe { background: #ed8936; }
.caution { background: #f97316; }
.unsafe { background: #ef4444; }
.quality-count { font-weight: 700; color: #2d3748 !important; font-size: 18px !important; min-width: 40px; text-align: right; display: block !important; visibility: visible !important; opacity: 1 !important; background: #f7fafc; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; }
.recommendation-box { background: linear-gradient(135deg, #ebf8ff, #bee3f8); border-left: 4px solid #2b6cb0; padding: 16px; border-radius: 6px; }
.recommendation-title { font-size: 14px; font-weight: 600; color: #1a365d; margin-bottom: 8px; }
.recommendation-text { font-size: 14px; color: #2c5282; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; }
.comparison-controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.legend { display: flex; justify-content: center; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4a5568; }
.legend-marker { width: 16px; height: 3px; border-radius: 2px; }
legend-bar { width: 16px; height: 12px; border-radius: 2px; opacity: 0.8; }
.axis path, .axis line { stroke: #cbd5e0; stroke-width: 1; }
.axis text { font-family: 'Source Sans Pro', sans-serif; font-size: 12px; fill: #4a5568; }
.hidden { display: none !important; }

/* 防止伪元素拦截事件（保底） */
:deep(.chart-container::before) { pointer-events: none !important; }

@media (max-width: 1200px) {
  .content-area { grid-template-columns: 1fr; padding: 24px 16px; gap: 24px; }
  .insights-sidebar { max-width: none; min-width: auto; }
}
@media (max-width: 768px) {
  .header-content { flex-direction: column; gap: 16px; text-align: center; }
  .main-container { padding: 0 16px; }
  .control-row { flex-direction: column; align-items: stretch; }
  .field-group { min-width: auto; }
  .comparison-controls { grid-template-columns: 1fr; }
}
</style>

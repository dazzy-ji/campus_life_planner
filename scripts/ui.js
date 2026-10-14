import { compileRegex, highlight } from './search.js';

export function updateUnits(settings) {
    const unitName = settings.timeUnit;
    const unitLabelStat = document.getElementById('unit-label-stat');
    const formUnitLabel = document.getElementById('form-unit-label');
    const settingsUnitLabel = document.getElementById('settings-unit-label');

    if (unitLabelStat) unitLabelStat.textContent = unitName;
    if (formUnitLabel) formUnitLabel.textContent = unitName;
    if (settingsUnitLabel) settingsUnitLabel.textContent = unitName;
}

export function populateTable(records, settings, searchQuery, caseSensitive, sortCriteria, onEdit, onDelete) {
    const tableBody = document.getElementById('table-body');
    if(!tableBody) return;
    tableBody.innerHTML = '';

    const flags = caseSensitive ? 'g' : 'gi';
    const regex = compileRegex(searchQuery, flags);

    let filtered = records.filter(rec => {
        if (!searchQuery) return true;
        if (searchQuery.startsWith('@tag:')){
            const targetTag = searchQuery.replace('@tag:', '').trim();
            return rec.tag.toLowerCase().includes(targetTag.toLowerCase());
        }
        return regex && (regex.test(rec.title) || regex.test(rec.tag) || regex.test(String(rec.duration)));
    });

    filtered.sort((a, b) => {
        switch (sortCriteria){
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'duration-desc': return b.duration - a.duration;
            case 'duration-asc': return a.duration - b.duration;
            case 'title-asc': return a.title.localeCompare(b.title);
            default: return 0;
        }
    });

    if (filtered.length === 0){
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted, #666);">No matching records found.</td></tr>`;
        return;
    }

    filtered.forEach(rec => {
        const tr = document.createElement('tr');
        const showDuration = settings.timeUnit === 'hours' ? (rec.duration / 60).toFixed(1) : rec.duration;
        const selectedTitle = highlight(rec.title, regex);
        const selectedTag = highlight(rec.tag, regex);

        tr.innerHTML = `
            <td>${selectedTitle}</td>
            <td>${showDuration} ${settings.timeUnit}</td>
            <td><span class="badge">${selectedTag}</span></td>
            <td>${rec.date}</td>
            <td>
                <button class="btn-edit" data-id="${rec.id}">Edit</button>
                <button class="btn-delete" data-id="${rec.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => onEdit(btn.dataset.id));
    });
    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => onDelete(btn.dataset.id));
    });
}

export function updateStats(records, settings){
    const statCount = document.getElementById('stat-count');
    const statDuration = document.getElementById('stat-duration');
    const statTopTag = document.getElementById('stat-top-tag');

    if (statCount) statCount.textContent = records.length;

    const totalMins = records.reduce((acc, curr) => acc + curr.duration, 0);
    const displayTotal = settings.timeUnit === 'hours' ? (totalMins/60).toFixed(1) : totalMins;
    if(statDuration) statDuration.textContent = displayTotal;

    const tagCounts = {};
    records.forEach(r => {
        if (r.tag) tagCounts[r.tag] = (tagCounts[r.tag] || 0) + 1;
    });
    let topTag = '-';
    let maxCount = 0;
    for (const [tag, count] of Object.entries(tagCounts)) {
        if (count > maxCount){
            maxCount = count;
            topTag = tag;
        }
    }
    if (statTopTag) statTopTag.textContent = topTag;

    const cap = settings.weeklyCap;
    const diff = Math.abs(cap - totalMins);
    const displayCap = settings.timeUnit === 'hours' ? (cap / 60).toFixed(1) : cap;
    const displayDiff = settings.timeUnit === 'hours' ? (diff / 60).toFixed(1) : diff;

    const alertBox = document.getElementById('alert-box');
    const announcer = document.getElementById('announcer');

    if (alertBox){
        if(totalMins <= cap){
            alertBox.className = "alert-box normal";
            alertBox.setAttribute("aria-live", "polite");
            alertBox.textContent = `On Track: ${displayDiff} ${settings.timeUnit} remaining under your weekly cap of ${displayCap} ${settings.timeUnit}.`;
        } else{
            alertBox.className = "alert-box exceeded";
            alertBox.setAttribute("aria-live", "assertive");
            alertBox.textContent = `Warning: Weekly cap exceeded by ${displayDiff} ${settings.timeUnit}!`;
        }
    }
    if (announcer && alertBox){
        announcer.textContent = alertBox.textContent;
    }

    renderTrendChart(records, settings);
}

function renderTrendChart(records, settings) {
    const chartContainer = document.getElementById('trend-chart');
    if (!chartContainer) return;
    chartContainer.innerHTML = '';

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayMins = records
            .filter(r => r.date === dateStr)
            .reduce((sum, r) => sum + r.duration, 0);

        const dayVal = settings.timeUnit === 'hours' ? (dayMins / 60) : dayMins;
        const maxExpected = settings.timeUnit === 'hours' ? 4 : 240;
        const heightPct = Math.min(100, Math.max(10, (dayVal / maxExpected) * 100));

        const col = document.createElement('div');
        col.style.cssText = "display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end;";

        const bar = document.createElement('div');
        bar.style.cssText = `width: 100%; background-color: var(--primary-color); height: ${heightPct}%; border-radius: 4px 4px 0 0; transition: height 0.3s ease;`;
        bar.title = `${dateStr}: ${dayVal.toFixed(1)} ${settings.timeUnit}`;

        const label = document.createElement('span');
        label.style.cssText = "font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;";
        label.textContent = d.toLocaleDateString('en-US', { weekday: 'narrow' });

        col.appendChild(bar);
        col.appendChild(label);
        chartContainer.appendChild(col);
    }
}
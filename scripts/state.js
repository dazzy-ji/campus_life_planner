// scripts/state.js - Application State & Controller
import { loadData, saveData, loadSettings, saveSettings, validateImportJSON } from './storage.js';
import { updateUnits, populateTable, updateStats } from './ui.js';
import { validateTitle, validateDuration, validateDate, validateTag, validateNoDuplicates } from './validators.js';

const DEFAULT_SEED = [
    { id: "rec_0001", title: "Data Structures Lab", duration: 120, tag: "Study", date: "2026-10-15", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_0002", title: "Club Meeting room 4B", duration: 60, tag: "Extracurricular", date: "2026-10-12", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_0003", title: "Database Systems Lab", duration: 90, tag: "Study", date: "2026-10-14", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "rec_0004", title: "Team Meeting", duration: 60, tag: "Meeting", date: "2026-10-16", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

class AppState {
    constructor() {
        const storedData = loadData();
        this.records = (storedData && storedData.length > 0) ? storedData : DEFAULT_SEED;
        this.settings = loadSettings() || { timeUnit: 'mins', weeklyCap: 600 };
        this.searchQuery = '';
        this.caseSensitive = false;
        this.sortCriteria = 'date-desc';
        this.editingId = null;
    }

    init() {
        const unitSelect = document.getElementById('unit-select');
        const capInput = document.getElementById('cap-input');
        if (unitSelect) unitSelect.value = this.settings.timeUnit;
        if (capInput) capInput.value = this.settings.timeUnit === 'hours' ? (this.settings.weeklyCap / 60) : this.settings.weeklyCap;

        updateUnits(this.settings);
        this.render();
        this.bindEvents();
    }

    render() {
        populateTable(
            this.records,
            this.settings,
            this.searchQuery,
            this.caseSensitive,
            this.sortCriteria,
            (id) => this.handleEdit(id),
            (id) => this.handleDelete(id)
        );
        updateStats(this.records, this.settings);
    }

    bindEvents() {
        // Form Submission
        const form = document.getElementById('record-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        }

        // Cancel Edit Button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm(form);
            });
        }

        // Search Input Filtering
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render();
            });
        }

        // Case Sensitive Checkbox
        const caseCheckbox = document.getElementById('case-sensitive-toggle');
        if (caseCheckbox) {
            caseCheckbox.addEventListener('change', (e) => {
                this.caseSensitive = e.target.checked;
                this.render();
            });
        }

        // Sort Select Dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortCriteria = e.target.value;
                this.render();
            });
        }

        // Settings Changes
        const unitSelect = document.getElementById('unit-select');
        if (unitSelect) {
            unitSelect.addEventListener('change', (e) => {
                const newUnit = e.target.value;
                const capInput = document.getElementById('cap-input');
                let capVal = parseFloat(capInput?.value) || 600;

                if (newUnit === 'hours' && this.settings.timeUnit === 'mins') {
                    capVal = capVal / 60;
                    if (capInput) capInput.value = capVal;
                } else if (newUnit === 'mins' && this.settings.timeUnit === 'hours') {
                    capVal = capVal * 60;
                    if (capInput) capInput.value = capVal;
                }

                this.settings.timeUnit = newUnit;
                this.settings.weeklyCap = newUnit === 'hours' ? capVal * 60 : capVal;
                saveSettings(this.settings);
                updateUnits(this.settings);
                this.render();
            });
        }

        const capInput = document.getElementById('cap-input');
        if (capInput) {
            capInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) {
                    this.settings.weeklyCap = this.settings.timeUnit === 'hours' ? val * 60 : val;
                    saveSettings(this.settings);
                    updateStats(this.records, this.settings);
                }
            });
        }

        // JSON Export
        const exportBtn = document.getElementById('export-json-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.records, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `campus_life_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            });
        }

        // JSON Import
        const importInput = document.getElementById('import-json-input');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = validateImportJSON(event.target.result);
                    if (result.valid) {
                        this.records = result.data;
                        saveData(this.records);
                        this.render();
                        alert('Successfully imported JSON backup records!');
                    } else {
                        alert(`Import Error: ${result.error}`);
                    }
                    importInput.value = '';
                };
                reader.readAsText(file);
            });
        }

        // Navigation Links Smooth Scrolling & Mobile Menu Auto-close
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetSec = document.querySelector(href);
                    if (targetSec) {
                        targetSec.scrollIntoView({ behavior: 'smooth' });
                    }
                }
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && window.innerWidth < 768) {
                    navMenu.classList.remove('open');
                }
            });
        });

        // Hamburger Menu Toggle
        const hamburgerBtn = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburgerBtn && navMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('open');
                hamburgerBtn.classList.toggle('active');
            });
            document.addEventListener('click', (e) => {
                if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                }
            });
        }
    }

    handleFormSubmit(form) {
        const titleInput = document.getElementById('input-title');
        const durationInput = document.getElementById('input-duration');
        const tagInput = document.getElementById('input-tag');
        const dateInput = document.getElementById('input-date');
        const errorDiv = document.getElementById('form-error-message');

        if (!titleInput || !durationInput || !dateInput || !tagInput) {
            alert('Error: Form input fields could not be found.');
            return;
        }

        const title = titleInput.value.trim();
        const durationVal = durationInput.value.trim();
        const tag = tagInput.value.trim();
        const date = dateInput.value.trim();

        // Validation Checks
        if (!validateTitle(title)) {
            if (errorDiv) errorDiv.textContent = 'Error: Title cannot have leading/trailing whitespace or double spaces.';
            return;
        }
        if (!validateNoDuplicates(title)) {
            if (errorDiv) errorDiv.textContent = 'Error: Title contains consecutive duplicate words.';
            return;
        }
        if (!validateDuration(durationVal)) {
            if (errorDiv) errorDiv.textContent = 'Error: Duration must be a positive number (up to 2 decimal places).';
            return;
        }
        if (!validateTag(tag)) {
            if (errorDiv) errorDiv.textContent = 'Error: Tag must contain only alphabetical words, spaces, or hyphens.';
            return;
        }
        if (!validateDate(date)) {
            if (errorDiv) errorDiv.textContent = 'Error: Date must follow the strict YYYY-MM-DD format.';
            return;
        }

        if (errorDiv) errorDiv.textContent = '';

        let rawDuration = parseFloat(durationVal);
        if (this.settings.timeUnit === 'hours') {
            rawDuration = rawDuration * 60;
        }

        if (this.editingId) {
            this.records = this.records.map(rec => {
                if (rec.id === this.editingId) {
                    return {
                        ...rec,
                        title,
                        duration: rawDuration,
                        tag,
                        date,
                        updatedAt: new Date().toISOString()
                    };
                }
                return rec;
            });
            this.editingId = null;
        } else {
            const newRecord = {
                id: 'rec_' + Date.now(),
                title,
                duration: rawDuration,
                tag,
                date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.records.push(newRecord);
        }

        saveData(this.records);
        this.resetForm(form);
        this.render();
    }

    handleEdit(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        const titleInput = document.getElementById('input-title');
        const durationInput = document.getElementById('input-duration');
        const dateInput = document.getElementById('input-date');
        const tagInput = document.getElementById('input-tag');
        const submitBtn = document.getElementById('submit-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');

        if (titleInput) titleInput.value = record.title;
        if (durationInput) {
            durationInput.value = this.settings.timeUnit === 'hours' ? (record.duration / 60) : record.duration;
        }
        if (dateInput) dateInput.value = record.date;
        if (tagInput) tagInput.value = record.tag;

        this.editingId = id;

        if (submitBtn) submitBtn.textContent = 'Update Record';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        const formSection = document.getElementById('task-form-section');
        if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
    }

    handleDelete(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.records = this.records.filter(r => r.id !== id);
            saveData(this.records);
            this.render();
        }
    }

    resetForm(form) {
        if (form) form.reset();
        this.editingId = null;
        const submitBtn = document.getElementById('submit-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const errorDiv = document.getElementById('form-error-message');
        if (submitBtn) submitBtn.textContent = 'Save Record';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (errorDiv) errorDiv.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appState = new AppState();
    window.appState.init();
});
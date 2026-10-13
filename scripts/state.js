// scripts/state.js - Application State & Controller
import { loadData, saveData, loadSettings, saveSettings } from './storage.js';
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
        // Form Submission (Add or Update Record)
        const form = document.querySelector('form') || document.getElementById('record-form') || document.getElementById('task-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
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
        const caseCheckbox = document.getElementById('match-case') || document.getElementById('case-sensitive');
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

        // Settings Form Submission
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const unitSelect = document.getElementById('time-unit-select') || document.getElementById('time-unit');
                const capInput = document.getElementById('weekly-cap-input') || document.getElementById('weekly-cap');
                if (unitSelect && capInput) {
                    this.settings.timeUnit = unitSelect.value;
                    this.settings.weeklyCap = parseFloat(capInput.value) || 600;
                    saveSettings(this.settings);
                    updateUnits(this.settings);
                    this.render();
                    alert('Settings updated successfully');
                }
            });
        }

        // Navigation Tab Switching & Auto-closing Mobile Menu
        const navLinks = document.querySelectorAll('nav a[data-target], .nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('data-target');
                if (targetId) {
                    e.preventDefault();
                    document.querySelectorAll('.view-section, section[id]').forEach(sec => {
                        sec.style.display = 'none';
                    });
                    const targetSec = document.getElementById(targetId);
                    if (targetSec) {
                        targetSec.style.display = 'block';
                    }
                }
                
                // Hide mobile menu on link selection
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && window.innerWidth < 768) {
                    navMenu.classList.remove('open');
                }
            });
        });

        // Aligned Hamburger Menu Toggle targeting .nav-menu and .open
        const hamburgerBtn = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburgerBtn && navMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('open');
                hamburgerBtn.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('open');
                    hamburgerBtn.classList.remove('active');
                }
            });
        }
    }

    handleFormSubmit(form) {
        const titleInput = form.querySelector('[name="title"]') || document.getElementById('title-input') || document.getElementById('input-title');
        const durationInput = form.querySelector('[name="duration"]') || document.getElementById('duration-input') || document.getElementById('input-duration');
        const tagInput = form.querySelector('[name="tag"]') || document.getElementById('tag-input') || document.getElementById('input-tag');
        const dateInput = form.querySelector('[name="date"]') || document.getElementById('date-input') || document.getElementById('input-date');

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
            alert('Error: Title cannot have leading/trailing whitespace or double spaces.');
            return;
        }
        if (!validateNoDuplicates(title)) {
            alert('Error: Title contains consecutive duplicate words.');
            return;
        }
        if (!validateDuration(durationVal)) {
            alert('Error: Duration must be a positive number (up to 2 decimal places).');
            return;
        }
        if (!validateTag(tag)) {
            alert('Error: Tag must contain only alphabetical words, spaces, or hyphens.');
            return;
        }
        if (!validateDate(date)) {
            alert('Error: Date must follow the strict YYYY-MM-DD format.');
            return;
        }

        const duration = parseFloat(durationVal);

        if (this.editingId) {
            this.records = this.records.map(rec => {
                if (rec.id === this.editingId) {
                    return {
                        ...rec,
                        title,
                        duration,
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
                duration,
                tag,
                date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.records.push(newRecord);
        }

        saveData(this.records);
        form.reset();

        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Save Record';
        }

        this.render();
    }

    handleEdit(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        const form = document.querySelector('form') || document.getElementById('record-form') || document.getElementById('task-form');
        
        const titleInput = form?.querySelector('[name="title"]') || document.getElementById('title-input') || document.getElementById('input-title');
        const durationInput = form?.querySelector('[name="duration"]') || document.getElementById('duration-input') || document.getElementById('input-duration');
        const dateInput = form?.querySelector('[name="date"]') || document.getElementById('date-input') || document.getElementById('input-date');
        const tagInput = form?.querySelector('[name="tag"]') || document.getElementById('tag-input') || document.getElementById('input-tag');

        if (titleInput) titleInput.value = record.title;
        if (durationInput) durationInput.value = record.duration;
        if (dateInput) dateInput.value = record.date;
        if (tagInput) tagInput.value = record.tag;

        this.editingId = id;

        const submitBtn = form?.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Record';
        }

        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleDelete(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.records = this.records.filter(r => r.id !== id);
            saveData(this.records);
            this.render();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appState = new AppState();
    window.appState.init();
});
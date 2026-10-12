## Campus Life Planner 

## 1. Project Overview & Chosen Theme
* **Chosen Theme:** Campus Life Planner (Theme 2)
* **Purpose:** A vanilla HTML/CSS/JavaScript single-page application (SPA) designed for university students to manage academic tasks, study blocks, club meetings, and extracurricular schedules efficiently.
* **Tech Stack:** Vanilla HTML5, CSS3 (Flexbox & Media Queries), and ES6+ JavaScript modules with `localStorage` persistence.

---

## 2. Data Model & Schema Design
Every record managed by the application follows this exact JSON structure, featuring a unique identifier, attributes, and precise ISO timestamps:

```json
{
  "id": "rec_0001",
  "title": "Algorithms Assignment 3",
  "duration": 120,
  "tag": "Study",
  "date": "2026-10-15",
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
} campus_life_planner

+-----------------------------------+
| [Skip Link]                       |
| CAMPUS LIFE PLANNER               |
| [Nav: Dashboard | Records | ... ] |
+-----------------------------------+
| STATS DASHBOARD                   |
| - Total Items: 10                 |
| - Total Duration: 840 mins        |
| - Top Tag: Study                  |
+-----------------------------------+
| SEARCH & SORT                     |
| [Search regex...        ] [Match] |
| [Sort by Date/Duration v]         |
+-----------------------------------+
| RECORDS STACK (Cards)             |
| +-------------------------------+ |
| | Algorithms Assignment 3       | |
| | 120 mins | [Study] | 2026-10-15 | |
| | [Edit] [Delete]               | |
| +-------------------------------+ |
+-----------------------------------+
| ADD / EDIT FORM                   |
| Title: [_____________________]    |
| Duration: [________] mins         |
| Tag: [___________] Date: [_____]  |
| [ Save Record Button ]            |
+-----------------------------------+
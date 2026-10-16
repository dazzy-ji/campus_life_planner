# Campus Life Planner | Summative Assignment

An accessible, responsive Single Page Application built with vanilla HTML5, CSS, and modular ES6 JavaScript designed to helpstudents organize tasks, studies, and extracurricular activities.

* **Developer:** Dazzy Indimuli
* **GitHub Repository:** https://github.com/dazzy-ji/
* **Contact Email:** d.indimuli@alustudent.com
* **Live Deployment:** https://github.com/dazzy-ji/campus_life_planner.git
* **Demo Video:** https://youtu.be/rYsLmrlTf0s

---

## Features List
- **Responsive Semantic Layout:** Mobile-first architecture featuring FlexBox, CSS Grid, and custom media queries across breakpoints(~360px, 768px, 1024px).
- **Dynamic CRUD Workflows:** Add, edit, and delete tasks/events withreal-time state updates and auto-saving to browser `localStorage`. 
- **Live Regex Search & Highlighting:** Real-time search supporting case-sensitive/insensitive matching and `@tag:` prefix queries, automatically wrapping matching terms in `<mark>` elements.
- **Stats Dashboard & Trends:** Live metrics tracking total items, total duration, top tag, and a custom CSS/JS-driven **Last 7 Days Trend Chart**.
- **Cap/Target & ARIA Live Alerts:** Configurable weekyly duration caps with dynamic `aria-live` regions.
- **Unit Conversions:** Seemless switching between Minutes and Hours for duration display and target tracking.
- **JSON Backup Management:** Full data export to JSON and secure import with schema validation.

---

## Regex

The application incorporates strict validation rules and pattern matching:

1. **Title Validation**
  - *Pattern:* `/\S(?:.*\S)?$/` and double-space check `/\s{2,}/`
  - *Purpose:* Prevents leading/trailing white spaces and multiple consecutive spaces.
2. **Advanced Word DUplication Check:**
  - *Pattern:* `/\b(\w+)\s+\1\b/i`
  - *Purpose:* Flags consecutive dupicate words in titles (e.g., catches `"Lecture prep prep"`).
3. **Numeric Duration Validation:**
  - *Pattern:* `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
  - *Purpose:* Ensures positvie numbers with up to two decimal places.
4. **Date Validation:**
  - *Pattern:* `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
5. **Tag Validation:**
  - *Pattern:* `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
  - *Purpose:* Restricts tags to alphabetical characters, spaces, and hyphens.

---

## Keyboard Navigation & Accessibility (A11y) Map

- **`Tab` / `Shift + Tab`:** Navigates sequentially through all interactive elements (skip links, header navigation, form inputs, table actions, and settings).
- **`Enter` / `Space`:** Activates buttons, toggles checkboxes, and triggers form submissions or mobile menu expansions.
- **Skip-to-Content Link:** The first focusable item on the page alloes screen reader and keyboard users to jump straight to `#main-content`.
- **ARIA Live Announcements:** Dynamic alerts update screen readers instantly using polite and assertive `aria-live` attributes.

---

## Running Unit Tests

The project includes an automated test suite verifying core validation and search logic.
1. Open the project folder in your browser or local server.
2. Navigate to **`tests.htm`** in your browser.
3. The test runner will automatically execute assertion functions for validators, regex compilation, and text highlighting, displaying a pass/fail summary badge

---

## Sketches

```
+-----------------------------------------------------------------------------------+
| [Skip Link] | CAMPUS LIFE PLANNER | [Nav: Dashboard | Records | Settings | About] |
+-----------------------------------------------------------------------------------+
| STATS DASHBOARD                                                                   |
| - Total Items: 10  |  - Total Duration: 840 mins  |  - Top Tag: Study             |
+-----------------------------------------------------------------------------------+
| SEARCH & SORT                                                                     |
| [Search regex...]  [Match Case]  [Sort by: Date (Latest) v]                       |
+-----------------------------------------------------------------------------------+
| RECORDS TABLE / CARDS                                                             |
| +-------------------------------------------------------------------------------+ |
| | Title: Algorithms Assignment 3                                                | |
| | Duration: 120 mins  |  Tag: Study  |  Date: 2026-10-15                       | |
| | Actions: [Edit]  [Delete]                                                     | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
| ADD / EDIT FORM                                                                   |
| Title: [                   ]   Duration: [    ] mins                              |
| Tag:   [                   ]   Date:     [ YYYY-MM-DD ]                           |
| [ Save Record Button ]                                                            |
+-----------------------------------------------------------------------------------+
```

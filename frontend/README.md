# FrameFlow — Production House CRM (Frontend)

A React + Vite + Tailwind CSS frontend for the Production House CRM / OTT Management System. Dark charcoal / shadow-black and cinematic orange theme inspired by the Loopstream reference, with a login screen and separate files for each module.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
1. Extract this ZIP.
2. Open the extracted `ott-crm-fixed` folder in VS Code.
3. Open Terminal **inside this folder** (the folder that contains `package.json`).
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the Local URL printed by Vite (normally `http://localhost:5173`).

If you see a blank page, stop any old dev server with `Ctrl+C`, make sure terminal is in this project folder, then run the commands above again. Do not open `index.html` directly by double-clicking it.

## Folder structure
```
ott-crm-fixed/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── app.css
    ├── layouts/
    │   └── MainLayout.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── TeamUsers.jsx
        ├── Departments.jsx
        ├── Settings.jsx
        ├── VendorsEquipment.jsx
        ├── BudgetExpenses.jsx
        └── InvoicesPayments.jsx
```

## Included modules
### Task 1 — Dashboard & System Administration
- Dashboard statistics, production progress chart, upcoming deadlines, active projects, recent activity.
- Team & User Roles: searchable members table and Add Team Member modal.
- Departments: department cards, search, create department modal.
- Settings: General, Profile, Notifications, Security and Appearance tabs; interactive preference toggles.

### Task 2 — Finance & Resource Management
- Vendors & Equipment: vendor directory, equipment list, add vendor modal.
- Budget & Expenses: budget overview, add expense, approve/reject pending expense.
- Invoices & Payments: create invoice, mark as paid, search, CSV export.

## Login demo
- On first launch, the app redirects to `/login`.
- Demo email: `admin@frameflow.com`
- Demo password: `frameflow123`
- The login form accepts any non-empty email and password for UI testing. Sign out from the left sidebar to return to login.
- This is localStorage-based demo authentication only, not secure production authentication. Connect your backend login API and enforce permissions on the server before production use.

## Notes
- This is a frontend demo and uses local sample data in React state. Refreshing the page resets new records.
- Backend API, database persistence, real authentication and server-enforced role permissions must be integrated separately. UI-only role labels are not security controls.
- Tailwind CSS v3 is configured using `tailwind.config.js` and `postcss.config.js`. `src/app.css` supplies the full custom dashboard styling so the layout is visible after Vite starts.

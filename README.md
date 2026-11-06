# Morrow — Event Discovery Website

A responsive event-discovery and registration website built with **React, Vite, HTML5, CSS3 and JavaScript**. This edition uses a different editorial art direction: a rich burgundy hero, a blush-toned discovery surface, magazine-inspired event layouts, and a refined serif/sans-serif type pairing.

## Visual system

### Colour palette

| Colour | Hex | Use |
|---|---|---|
| Burgundy | `#7C0E44` | Primary brand colour, buttons and hero |
| Mauve | `#AA5E7A` | Secondary accents, labels and links |
| Dusty rose | `#D49A9A` | Borders, subtle highlights and decorative details |
| Pale blush | `#F2DACE` | Featured surfaces and light accent panels |

### Typography

- **DM Serif Display** — editorial headlines and large display text.
- **Outfit** — navigation, body copy, controls and interface labels.

Fonts are loaded through Google Fonts in `index.html`; a system sans-serif fallback is defined in the stylesheet.

## Features

- Responsive layout for desktop, tablet and mobile screens.
- Full-width editorial hero and featured event section with a live countdown timer.
- Event cards with image, title, date, venue, category and pricing.
- Search across event titles, categories, descriptions, venues and cities.
- Category filters and an expandable advanced-discovery panel (date, price, city and sorting).
- Event detail view with date, time, venue, host, admission information and registration CTA.
- Registration form collecting name, email, phone number and selected event.
- JavaScript validation for name, email, phone number and event selection.
- Registration confirmation screen with a unique booking code and a generated digital ticket featuring a scannable QR code.
- My Passes panel with an expandable digital ticket for every saved registration; each QR image can be saved separately. The QR payload contains the ticket code, attendee name and event details (not the attendee email or phone number).
- Local Storage persistence for registrations, saved events and theme preference.
- Saved-events view, My Passes panel and dark/light theme toggle.
- Footer contact identities for email, Instagram and Facebook, displayed with compact icons (not clickable links). Replace the demo values in `src/App.jsx` with your own account names before publishing.
- Accessible labels, keyboard focus states, Escape-to-close dialogs and reduced-motion support.

> This is a front-end assignment demo. It does not process payments, send emails or validate tickets against a server. The QR code contains a readable ticket payload, so it is suitable as a demo check-in reference but is not a secure anti-fraud ticket. Sample registrations are stored only in the current browser using Local Storage.

## Tech stack

- React
- Vite
- HTML5
- CSS3
- JavaScript (ES Modules)
- lucide-react icons
- qrcode (client-side QR image generation)

## Run locally

Requires Node.js 18+ (or a current LTS release) and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The production website is generated in the `dist/` directory.

## Deploy

### Vercel
1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the build command as `npm run build` and output directory as `dist`.
4. Deploy.

### Netlify
1. Import the GitHub repository in Netlify.
2. Set build command to `npm run build` and publish directory to `dist`.
3. Deploy the site.

### GitHub version control

```bash
git init
git add .
git commit -m "Build Morrow event discovery website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repository-name>.git
git push -u origin main
```

## Project structure

```text
k-explore-react/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Main UI, filtering, modals and registration flow
│   ├── data.js        # Sample event data
│   ├── main.jsx       # React entry point
│   └── styles.css     # Responsive palette, typography and components
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Customising the events

Edit `src/data.js` to change event names, categories, dates, times, venues, prices, descriptions and image URLs. The featured event, event listings, filters and registration selector all use the shared event data.

### Primary button styling

The light-theme hero CTA uses mauve (`#AA5E7A`) with ivory text for stronger contrast. The dark-theme hero CTA retains a deep-plum (`#563344`) background with ivory text, including a separate hover state.

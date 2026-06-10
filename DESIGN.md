# CottBook Design System — Neumorphism

## Brand & Style
CottBook is a B2B cotton brokerage management platform. The design system follows a **Neumorphic** aesthetic — a soft, tactile interface where elements appear extruded from or pressed into a single, continuous surface. The overall feel is **light, professional, and eye-pleasing** — never garish or dark. Brand accent colors (Cotton Blue, Sage Green, Muted Khaki) appear sparingly on interactive highlights and status indicators, while the UI itself stays neutral and calm.

## Colors

### Surface & Background
- **Background / Surface Base:** `#f8f6f4`
- **Dividers / Borders:** `#e2dfda`
- **Light Shadow:** `#ffffff`
- **Dark Shadow:** `#d1cec7`

### Brand Accents (Used Sparingly — derived from brand palette)
- **Primary (Cotton Blue):** `#4a7fc4` *(echoes brand navy `#04294E`, lightened for UI)*
- **Secondary (Leaf Green):** `#5a8f4a` *(toned from brand `#5F9D43`)*
- **Tertiary (Muted Khaki):** `#9b7e6b`

### Text
- **Headings:** `#04294E` *(brand navy — deep, authoritative)*
- **Body:** `#3d4f5f` (medium slate)
- **Labels / Muted:** `#6b7b8d`
- **Placeholder:** `#8e9baa`

### Status Colors (Muted Tones)
- **Success:** `#5a9e6f`
- **Warning:** `#c4993a`
- **Danger:** `#c45a5a`
- **Info:** `#4a7fc4` (same as primary)

## Typography
- **Headlines:** `Playfair Display` — used for page titles and section headings
- **Body & Data Tables:** `DM Sans` — default body font, used in tables, paragraphs, form values
- **Labels:** `Quicksand` — used for form labels, section sub-headings, table headers, uppercase tracking labels

## Elevation & Depth (Shadow Configuration — Toned Down)

All neumorphic surfaces **must match the background** (`#e8ecf1`) to create the seamless molded illusion. Shadows are intentionally subtle — not the heavy defaults of classic neumorphism.

### Raised Elements (Cards, Buttons, Containers)
- **CSS:** `box-shadow: -5px -5px 10px #ffffff, 5px 5px 10px #bcc3cf;`
- **Usage:** Cards, containers, table wrappers, default button states, chips/badges

### Pressed Elements (Active Buttons, Selected States)
- **CSS:** `box-shadow: inset -3px -3px 6px #ffffff, inset 3px 3px 6px #bcc3cf;`
- **Usage:** Active/pressed button states, selected sidebar item, toggled elements

### Input Fields — Inset Depth
Input fields (text, number, textarea, date pickers) use neumorphic inset shadows to create depth, making them look pressed into the surface.
- **CSS:** `background: var(--cb-bg); box-shadow: inset 3px 3px 6px var(--cb-shadow-dark), inset -3px -3px 6px var(--cb-shadow-light);`
- **Focus State:** Primary border color with a subtle outer glow while maintaining the inner shadow.

## Shapes
- **Base Components (Buttons, Inputs):** `10px` border-radius
- **Large Containers (Cards, Panels):** `16px` border-radius
- **Chips / Badges:** `20px` border-radius (pill shape)

## Component Specifics

### Buttons
- **Default:** Raised shadow, text in heading color. No fill — same bg as surface.
- **Primary Action:** Raised shadow + subtle primary color border (`border: 1.5px solid rgba(74,127,196,0.3)`) + primary color text.
- **Active / Pressed:** Transition from raised to pressed (inset) shadow on `active:`.
- **Destructive:** Same as default but red-tinted text.

### Input Fields
- Flat background matching surface, subtle border, no inset shadow.
- Labels above inputs in `Quicksand`, uppercase, small, muted color.
- Focus: primary blue border glow.

### Cards & Containers
- Raised shadow, `16px` radius, matching surface background.
- Optional thin white/transparent border for extra definition: `border: 1px solid rgba(255,255,255,0.5);`

### Tables
- Wrapped in a raised neumorphic container.
- Table headers: `Quicksand` font, uppercase, small, muted.
- Row hover: subtle background shift to `#dde3eb`.
- Dividers between rows: `#d1d9e6`.

### Sidebar
- **Light neumorphic** — NOT dark. Same surface base as the rest of the app.
- Width: `280px`.
- Brand name: `Playfair Display`, primary color.
- Active nav item: pressed (inset) shadow + primary color text.
- Inactive items: muted text, hover with slight bg shift.
- Section titles: `Quicksand`, uppercase, very muted.

### Dropdowns
- Popup container uses raised neumorphic shadow.
- Items have hover background shift.
- Selected item shows a check icon in primary color.

### Date Picker
- Trigger input: flat style (like all inputs).
- Popup calendar: raised neumorphic card.
- Selected day: primary color fill with white text.
- Today indicator: subtle primary tint background.

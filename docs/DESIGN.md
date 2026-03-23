# Design System Specification: High-Contrast Athletic Editorial

## 1. Overview & Creative North Star: "The Kinetic Monolith"
This design system rejects the "default app" aesthetic in favor of a high-end, editorial approach to fitness tracking. Our Creative North Star is **The Kinetic Monolith**: a design language that feels as heavy and intentional as a steel plate, yet as precise as a digital stopwatch. 

By leveraging the structural power of Material Design 3 but stripping away the "softness" of standard Material You palettes, we create an environment of extreme focus. We break the template through **aggressive white space**, **asymmetric typographic weighting**, and a **"No-Line" structural philosophy**. The result is a premium, performance-oriented interface where data visualization isn't just a chart—it's the hero of the story.

---

## 2. Colors: High-Contrast Precision
Our palette is rooted in absolute clarity. We utilize a monochrome foundation to ensure that gym performance metrics (the user's progress) are the only things that "vibrate" on the screen.

### Core Palette
- **Background (`#ffffff`):** The canvas. Pure white to maximize contrast and "breathability."
- **Primary (`#000000`):** Used for high-emphasis actions (CTAs), primary icons, and heavy headlines.
- **Secondary (`#5e5e5e`):** Reserved for metadata, deactivated states, and supporting information.
- **Surface (`#f9f9f9`):** A soft off-white used to define "zones" without using borders.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts. 
*   *Instead of a boxed list:* Place list items on `surface-container-low` (`#f3f3f4`) against a `surface` (`#f9f9f9`) background.
*   *Instead of a divider:* Use a 16px (spacing token `4`) vertical gap to separate content blocks.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper. 
1.  **Level 0 (Base):** `surface-container-lowest` (`#ffffff`).
2.  **Level 1 (Sectioning):** `surface-container-low` (`#f3f3f4`).
3.  **Level 2 (Interactive Elements):** `surface-container` (`#eeeeee`).

### Signature Textures
While the system is high-contrast, use a subtle gradient for primary action buttons: transitioning from `primary` (`#000000`) to `primary_container` (`#3b3b3b`) at a 45-degree angle. This adds a "machined metal" depth to the UI.

---

## 3. Typography: Editorial Authority
We use **Inter** (as specified in the scale) to provide a modern, neutral, and highly legible experience. The hierarchy is designed to feel like a high-end sports magazine.

*   **Display (Display-LG 3.5rem / Display-MD 2.75rem):** Used for "PR" (Personal Record) numbers and big daily metrics. Letter-spacing should be set to `-2%` to feel tighter and more aggressive.
*   **Headline (Headline-LG 2rem):** Used for workout titles. Always `Font-Weight: 700`.
*   **Body (Body-LG 1rem):** Used for exercise descriptions and notes. Line height should be generous (1.5x) to prevent "cramping" against the high-contrast background.
*   **Label (Label-SM 0.6875rem):** All-caps with `+5%` letter-spacing. Used for "UNIT" markers (e.g., LBS, KG, SEC) next to large metrics.

---

## 4. Elevation & Depth: Tonal Stacking
Avoid traditional M3 shadows. We convey importance through **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by placing a "Bright" surface on a "Dim" surface. A card containing a performance graph should be `surface-container-lowest` (#FFFFFF) sitting on a `surface-dim` (#dadada) page background.
*   **Ambient Shadows:** If a floating action button (FAB) requires a shadow, it must be massive but invisible. Use a 32px blur at 4% opacity using the `on-surface` color. It should feel like a "glow of weight" rather than a drop shadow.
*   **The "Ghost Border":** If a data point requires containment (e.g., a complex table), use `outline-variant` (`#c6c6c6`) at 20% opacity. This creates a "suggestion" of a boundary that does not break the editorial flow.

---

## 5. Components: Machined Modules

### Buttons (High-Impact)
- **Primary:** Black fill (`primary`), white text (`on_primary`). Radius: `0.25rem` (sm) for a sharp, technical look.
- **Secondary:** Surface-tint fill, black text. No border.
- **Tertiary:** Purely typographic, weight 700, underlined only on hover/focus.

### Cards & Lists (The Editorial Feed)
- **Rule:** Forbid divider lines. 
- **Style:** List items should have a 12px internal padding. Use `surface-container-low` for the "Tracked" state of an exercise and `surface` for "Pending."
- **Data Visualization:** Charts must use `primary` (#000000) for the trend line and `outline_variant` (#c6c6c6) for the grid axis. No fills under the curve—keep it clinical.

### Search Bar
A monolithic block. Use `surface-container-high` (`#e8e8e8`) with no border. The icon must be `primary` (#000000).

### Custom Component: The Performance Matrix
A 2x2 grid module for gym metrics (Volume, RPE, Rest, Pace). Use `Display-MD` for the value and `Label-SM` (All-caps) for the descriptor, anchored to the bottom-right of the cell for intentional asymmetry.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical margins. For example, a 32px left margin and a 16px right margin can make a list of exercises feel more "designed" and less "templated."
- **Do** use "Optical Sizing." Large display numbers should have tighter kerning than body text.
- **Do** embrace the white. If a screen feels empty, increase the typography size of the hero metric rather than adding decorative elements.

### Don't
- **Don't** use 100% black text on 100% black backgrounds for buttons—always ensure `on_primary` contrast.
- **Don't** use rounded corners above `0.75rem` (xl). We want the system to feel architectural and "hard," not "bubbly."
- **Don't** use colored icons for different muscle groups. Use iconography weight and size to differentiate, keeping everything strictly monochrome.
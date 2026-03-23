# Design Specification: Mono Performance Tracking App

## 1. Project Overview
A high-performance, minimalist gym tracking application built with React Native. The design follows a strict "Kinetic Monolith" aesthetic: high contrast, black-and-white, and data-dense.

## 2. Design System: Mono Performance
- **Primary Color:** #000000 (Black)
- **Background Color:** #FFFFFF (White)
- **Typography:** Inter (Bold, Heavy, Tracking-tight)
- **Shape:** Round-4 (Minimalist radius)
- **Vibe:** Athletic Editorial, High-Contrast, Functional.

## 3. Core Components (Material Design 3 Inspired)

### TopAppBar
- **Style:** Sticky, white background, black text.
- **Content:** Brand logo "PERFORMANCE" (Black, 2xl, font-black), Menu icon (left), Search icon (right).

### BottomNavBar
- **Destinations:** WORKOUT, HISTORY, METRICS, PROFILE.
- **Style:** Fixed bottom, white background, black border-top for active state.
- **Typography:** 10px, bold, uppercase, tracking-widest.

### Exercise Card (FlatList Item)
- **Layout:** Horizontal row.
- **Content:** Exercise Name (Left, Bold), Current Max Weight (Right, Large Bold), Last session date (Below weight).
- **Metric:** Always in Kilograms (KG).

### Data Grid (1-Rep Max Matrix)
- **Layout:** 3-column grid.
- **Cell Content:** Percentage (e.g., 85%), Calculated Weight (e.g., 153 KG).
- **Style:** Thin black borders, center-aligned text.

## 4. Key Screens & Flows

### Screen 1: Exercise History (FlatList)
- **Route:** `/history`
- **Features:**
    - Search bar at the top for filtering exercises.
    - FlatList rendering exercise cards.
    - Floating Action Button (FAB) for adding new exercises.
    - No category headers (Upper/Lower/Olympic removed for speed).

### Screen 2: Performance Results (1-RM Matrix)
- **Route:** `/metrics/back-squat`
- **Features:**
    - **Personal Records Row:** Compact horizontal row showing Gold (01), Silver (02), and Bronze (03) lifts.
    - **1-Rep Max Matrix:** 3-column grid showing percentages from 100% down to 45% in 5% increments.
    - **Unit:** Kilograms (KG).

## 5. Development Notes (React Native)
- Use `FlatList` for the exercise list for performance.
- Use a `View` with `flexDirection: 'row', flexWrap: 'wrap'` or a specialized grid component for the 1-RM matrix.
- Ensure all text uses the `Inter` font family for brand consistency.
- Implement a global `Theme` object to switch between Light/Dark if needed, though current spec is strictly Light (Black on White).


# HabitFlow Tracker

A high-fidelity recurring task manager built with React and TypeScript.

## Core Concepts

### 1. No Backfilling Rule
When you create a new habit (Task Template), it only appears in periods from "Today" onwards. This is achieved by comparing the `task.createdAt` timestamp with the `period.endDate`.

### 2. Immutable Period Snapshots
To prevent history from changing when templates are edited or deleted:
- When a period (day, week, month) is first viewed or interacted with, the app generates a `PeriodSnapshot`.
- This snapshot captures the `dueTaskIds` active at that exact moment.
- Checking/unchecking tasks updates the `completionMap` inside that specific snapshot.
- Subsequent changes to templates do not retroactively affect historical snapshots.

### 3. Period Computation
- **Daily**: Keys follow `YYYY-MM-DD`.
- **Weekly**: Periods start on **Monday**. Keys follow `YYYY-Www`.
- **Monthly**: Periods start on the **1st**. Keys follow `YYYY-MM`.

## Tech Stack
- **React 18** & **TypeScript**
- **Tailwind CSS** (Utility-first styling)
- **date-fns** (Robust date math)
- **Recharts** (Visual analytics)
- **Local Storage** (Persistence)

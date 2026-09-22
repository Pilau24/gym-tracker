# Implementation Plan: Activity Progress and History

## Overview

Build Activity as a review surface for long-term progress across workouts, weigh-ins, goals, and diet. The page should combine consistent persisted data into summary stats, a date heatmap, recent history, progress widgets, trend visualizations, and date-level detail. Logging remains in dedicated workout-session and meal flows.

The first implementation priority is data-source mapping and a reliable read model. Do not create automatic workout grouping or duplicate domain models. Prefer existing models, queries, route handlers, and UI primitives.

## Product decisions

### Activity purpose

- Activity is a review page, not the primary data-entry page.
- Long-term progress is the primary content.
- Recent activity history appears beside long-term progress.
- Logging actions link to dedicated flows.

### Workout sessions

- Users explicitly create sessions.
- Automatic grouping of nearby exercises is out of scope for the first version.
- Users can create multiple sessions on one day.
- A session stores a start time.
- A session can contain strength exercises, cardio exercises, or both.
- Users search an exercise library and can create reusable custom exercises.
- Strength defaults to weight, reps, and sets.
- Cardio defaults to duration, distance, and activity-specific metrics.
- Advanced entry can record how long each exercise took and other optional measurements.

### Weigh-ins

- Required fields: weight and timestamp.
- Advanced optional fields: body-fat percentage, notes, and measurement conditions.
- Advanced fields remain hidden until the user opens them.

### Goals

- Supported goal categories:
  - Weight
  - Body-fat percentage
  - Diet target
  - Workout frequency
  - Strength milestone per exercise
  - Cardio distance target per exercise, such as 5 km or 10 km
- Target-based goals have a start date, target date, and target value.
- Only one goal can be active per metric or exercise.
- Completed goals remain in Activity history.
- Users can create a new goal for the same metric or exercise after completion.

### Diet

- Users log meals from reusable components in a personal macro library.
- A component, such as an egg with its macro values, can be reused in meals.
- Users can save complete meals for reuse.
- Reused meals support additions and removals before logging.
- Diet progress updates continuously after every meal.
- The current day remains provisional until day end.
- Daily history includes total calories and macros, meal count, target variance, and target status.
- Example history entries include `3 meals logged` and `Diet goal missed`.
- Daily target status can be missed, reached, or exceeded, with approximately `100 kcal` variance shown where relevant.
- Diet goal progress uses the existing Progress widget.

## Architecture decisions

- Reuse existing domain models and query helpers before adding schema.
- Define a shared read-oriented Activity view model rather than making UI components understand every domain table.
- Keep source records separate in storage; compose them into daily summaries and timeline events at the query or service boundary.
- Treat a workout session as the source of truth for workout activity. Do not infer sessions by timestamp proximity.
- Keep advanced fields nullable and hidden in entry UI until requested.
- Represent current-day diet progress separately from finalized daily history so unfinished days are not marked missed.
- Keep goal history immutable after completion where possible; create new goal records for later targets.
- Use URL state for Activity date range and filters when this fits existing routing patterns.
- Use existing `Progress` widget, chart primitives, design tokens, and accessibility patterns.

## Dependency graph

```text
Existing domain models and entry flows
    |
    v
Activity source mapping and shared read types
    |
    +--> Summary queries and active-goal progress
    |
    +--> Daily heatmap aggregation
    |
    +--> Timeline event composition
    |
    +--> Date-detail read model
    |        |
    |        +--> Filters
    |        +--> Quick links to dedicated logging flows
    |
    +--> Trend and progress widgets
    |
    v
Responsive and accessibility polish
```

## Task list

### Phase 1: Data foundation

#### Task 1: Map activity data sources

**Description:** Inspect the existing schema, route handlers, query helpers, and entry components for workout sessions, exercises, sets, cardio, weigh-ins, meals, macro components, saved meals, goals, and personal records. Document ownership, relationships, required fields, advanced fields, derived values, and historical records. Define shared read types only where existing types are insufficient.

**Acceptance criteria:**

- [ ] Existing models and APIs for all four Activity domains are identified.
- [ ] Workout sessions support or clearly constrain multiple sessions per day and mixed strength/cardio content.
- [ ] Exercise records expose modality-specific fields and optional per-exercise duration.
- [ ] Custom exercises and reusable macro components have explicit user ownership.
- [ ] Required and advanced weigh-in fields are identified.
- [ ] Goal uniqueness, lifecycle, completion, and history rules are represented.
- [ ] Diet component, saved-meal, daily-total, and target-status sources are identified.
- [ ] Shared Activity read types do not duplicate persisted domain models.

**Verification:**

- [ ] Data-source map is reviewed against the current repository.
- [ ] `pnpm typecheck` passes after any type additions.

**Dependencies:** None

**Likely files:** Prisma schema, `lib/` query helpers, relevant `app/api/` routes, workout and meal entry components, Activity components.

**Estimated scope:** Medium

#### Task 2: Define Activity read model and date semantics

**Description:** Create the shared read-oriented types and date-range semantics needed by summary, heatmap, timeline, and date-detail views. Define how completed sessions, weigh-ins, meals, goals, and personal records become daily activity without changing domain ownership.

**Acceptance criteria:**

- [ ] Date range uses inclusive local calendar dates consistently.
- [ ] Multiple sessions on one day remain separate events but aggregate correctly for daily summaries.
- [ ] Planned or scheduled workouts do not count as completed activity unless existing product rules explicitly say otherwise.
- [ ] Current-day diet status is provisional; finalized status applies after day end.
- [ ] Completed goals and personal records can be represented as historical events.

**Verification:**

- [ ] Unit-level date and aggregation cases cover timezone boundaries, multiple sessions, empty days, and current-day diet status.
- [ ] No duplicate activity event appears for one source record.

**Dependencies:** Task 1

**Likely files:** `lib/`, shared types, focused tests.

**Estimated scope:** Medium

#### Task 3: Build activity summary queries

**Description:** Query and aggregate completed workouts, personal records, weigh-ins, active goals, and diet totals for the selected range. Feed the existing `HeroStats` and Progress widget with real values and explicit empty states.

**Acceptance criteria:**

- [ ] Workouts, personal records, and current streak reflect completed sessions.
- [ ] Weigh-in summaries use weight and body-fat data where present.
- [ ] Active-goal progress is calculated for supported goal categories.
- [ ] Diet totals update after each meal and do not mark an unfinished day missed.
- [ ] Empty accounts show meaningful empty-state content instead of misleading zeros.
- [ ] Changing the selected range recalculates summaries.

**Verification:**

- [ ] Query tests cover populated, empty, multiple-session, active-goal, and current-day diet cases.
- [ ] Activity page renders real values in Firefox without console errors.

**Dependencies:** Task 2

**Likely files:** Activity page, summary query/service, `HeroStats`, Progress widget integration, tests.

**Estimated scope:** Medium

### Checkpoint: Data foundation

- [ ] Activity source map is complete.
- [ ] Shared date and read-model semantics are documented.
- [ ] Summary data renders from persisted sources.
- [ ] Empty and populated states work.
- [ ] `pnpm typecheck` and focused tests pass.

### Phase 2: Activity history and detail

#### Task 4: Build daily aggregation for heatmap and timeline

**Description:** Replace static Activity timeline data and empty heatmap levels with persisted workout sessions, weigh-ins, diet events, goal milestones, and personal records. Compose daily summaries without losing separate workout sessions.

**Acceptance criteria:**

- [ ] Timeline contains persisted activity events.
- [ ] Heatmap intensity uses a documented frequency, volume, or combined activity metric.
- [ ] Daily summaries include workout-session count, meal count, diet totals/status, weigh-ins, and relevant milestones.
- [ ] Multiple same-day sessions do not create incorrect streaks or duplicate daily cards.
- [ ] Completed goals remain visible in historical timeline data.
- [ ] Existing date-range navigation and scroll position behavior remains intact.

**Verification:**

- [ ] Aggregation tests cover no activity, one session, multiple sessions, mixed modalities, meals, weigh-ins, and goal completion.
- [ ] Heatmap and timeline agree on source data.

**Dependencies:** Task 3

**Likely files:** Activity widget, timeline widget, aggregation service, tests.

**Estimated scope:** Large; split if implementation exceeds five files.

#### Task 5: Build date-detail activity view

**Description:** Expand `/activity/[ymdate]` into a date-level review page. Show each workout session separately, exercise details, weigh-ins, meals, macro totals, diet status, goals, and personal records. Keep unsupported edit/delete actions out of scope.

**Acceptance criteria:**

- [ ] Each session shows start time and mixed strength/cardio content.
- [ ] Strength details include sets, reps, and weight.
- [ ] Cardio details include duration, distance, and recorded activity metrics.
- [ ] Optional advanced exercise and weigh-in fields appear only when present.
- [ ] Meals show reusable components, macro totals, and diet target status.
- [ ] Goals and personal records achieved on the date are visible.
- [ ] Invalid dates, empty dates, loading, and error states are clear.

**Verification:**

- [ ] Heatmap and timeline links open the correct date.
- [ ] Date detail works at mobile and desktop widths in Firefox.
- [ ] Interactive controls have accessible names and keyboard support.

**Dependencies:** Task 4

**Likely files:** `app/activity/[ymdate]/page.tsx`, detail components, read queries, tests.

**Estimated scope:** Large; split into read model and UI if needed.

#### Task 6: Add Activity filters and URL state

**Description:** Add filters for all activity, workouts, strength, cardio, weigh-ins, diet, goals, and personal records. Keep filter state shareable where practical and update timeline, summaries, and empty states consistently.

**Acceptance criteria:**

- [ ] Filtered results contain only the selected activity type.
- [ ] Date range and filter state survive refresh and shareable navigation where supported.
- [ ] Filtered empty states explain what is missing and link to a relevant logging flow.
- [ ] Summary values clearly indicate whether they reflect filtered or full-range data.

**Verification:**

- [ ] Filter tests cover each activity category and empty filtered results.
- [ ] Keyboard and mobile interaction work in Firefox.

**Dependencies:** Task 4

**Likely files:** Activity page, filter components, URL/query helpers, tests.

**Estimated scope:** Medium

### Checkpoint: Activity history

- [ ] User can review real activity on heatmap and timeline.
- [ ] User can open any valid date and inspect details.
- [ ] Multiple daily sessions remain distinct.
- [ ] Filters preserve context and do not corrupt summaries.

### Phase 3: Logging links, insights, and polish

#### Task 7: Add Activity quick actions

**Description:** Add links from Activity to dedicated logging flows without moving data entry into the overview. Include workout session logging, weigh-ins, meals, exercise-library/custom-exercise creation where supported, and goal creation.

**Acceptance criteria:**

- [ ] `Log workout` opens the explicit session flow.
- [ ] `Add weigh-in` opens the weigh-in flow.
- [ ] Meal action opens the meal/component flow.
- [ ] Exercise-library and custom-exercise links appear only when supported.
- [ ] `Set goal` opens the goal flow when available.
- [ ] Actions do not compete visually with date-range controls.

**Verification:**

- [ ] Every action reaches an existing form or shows an explicit unavailable state.
- [ ] Actions are keyboard accessible and usable at mobile widths.
- [ ] Returning from successful entry refreshes Activity data.

**Dependencies:** Task 5

**Likely files:** Activity page, action menu/button components, routing helpers.

**Estimated scope:** Small to Medium

#### Task 8: Add progress summaries and trend visualizations

**Description:** Add focused progress views for workout frequency and volume, weight and body fat, diet calories/macros, and active goal progress. Use the existing Progress widget for goal progress and avoid charts for insufficient data.

**Acceptance criteria:**

- [ ] Total training time, volume, average workouts per week, and best streak show where data supports them.
- [ ] Weight and body-fat trends use weigh-in history.
- [ ] Diet trends use meal-component totals.
- [ ] Goal progress covers weight, body fat, diet, frequency, strength milestones, and cardio distance where applicable.
- [ ] Charts and widgets follow selected date range and filter semantics.
- [ ] Sparse and empty data show meaningful alternatives.
- [ ] Charts expose accessible labels or equivalent summaries.

**Verification:**

- [ ] Trend calculations have focused tests.
- [ ] Visual review confirms readable charts and Progress widgets in Firefox.

**Dependencies:** Tasks 3 and 6

**Likely files:** Activity page, chart components, Progress widget integration, aggregation queries, tests.

**Estimated scope:** Large; split by metric family if needed.

#### Task 9: Improve heatmap interaction and accessibility

**Description:** Make the heatmap communicate daily activity clearly across pointer, touch, keyboard, and assistive technology input.

**Acceptance criteria:**

- [ ] Tooltips show date, workout-session count, meal count, diet status, weigh-ins, and relevant volume.
- [ ] Legend uses semantic labels and distinguishes no activity from outside-range dates.
- [ ] Tiles have keyboard focus, selected-date styling, and accessible status text.
- [ ] Touch interaction remains usable on small screens.

**Verification:**

- [ ] Keyboard navigation and focus states work in Firefox.
- [ ] Accessibility tree exposes meaningful date and activity information.
- [ ] No console errors or accessibility warnings appear during interaction.

**Dependencies:** Task 4

**Likely files:** Activity widget, tooltip/accessibility primitives, focused tests.

**Estimated scope:** Medium

#### Task 10: Responsive and visual finish

**Description:** Review the complete Activity experience at 320px, 768px, 1024px, and 1440px. Preserve existing design tokens and keep date controls, cards, charts, timeline, and detail content readable without horizontal page overflow.

**Acceptance criteria:**

- [ ] Header controls remain usable at all target widths.
- [ ] Long-term progress remains visually primary.
- [ ] Recent history remains visible beside or below progress without loss of hierarchy.
- [ ] Loading, empty, error, provisional, finalized, and populated states are legible.
- [ ] Existing spacing, color, typography, and radius tokens are reused.

**Verification:**

- [ ] Firefox visual review passes at 320px, 768px, 1024px, and 1440px.
- [ ] No horizontal page overflow occurs.
- [ ] `pnpm lint` and `pnpm typecheck` pass.

**Dependencies:** Tasks 5, 7, 8, and 9

**Likely files:** Activity page, Activity widgets, responsive UI components, tests.

**Estimated scope:** Medium

### Final checkpoint

- [ ] Activity data is consistent across stats, Progress widgets, heatmap, timeline, filters, trends, and date detail.
- [ ] Workout, weigh-in, goal, and diet behaviors match confirmed product decisions.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] Focused tests pass.
- [ ] Firefox review passes with no console errors or accessibility regressions.
- [ ] Final diff contains only Activity page work and directly related data/query support.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Existing schema lacks one or more confirmed domains | High | Complete Task 1 before UI expansion; identify missing foundations and split schema work into explicit tasks. |
| Static demo timeline conflicts with persisted data | High | Remove placeholder records as soon as real aggregation is available; use explicit empty states. |
| Multiple sessions per day inflate streaks or heatmap intensity | High | Define daily aggregation separately from session-level events and test repeated same-day sessions. |
| Current-day diet appears missed too early | High | Store provisional status separately from finalized end-of-day status. |
| Goal progress becomes ambiguous with multiple active targets | Medium | Enforce one active goal per metric or exercise and preserve completed history. |
| Advanced fields overcomplicate first-use entry | Medium | Keep advanced fields nullable and hidden behind progressive disclosure. |
| Activity page becomes a second logging flow | Medium | Keep quick actions as links to dedicated flows; do not duplicate full data-entry forms in Activity. |
| Trend charts imply precision with sparse data | Medium | Render minimum-data states and use textual summaries when chart data is insufficient. |

## Open questions to resolve during Task 1

- Which workout, meal, weigh-in, goal, and personal-record models already exist?
- Which dedicated logging flows already exist, and which need separate implementation plans?
- What nutrition fields are available in the macro library: calories, protein, carbohydrates, fat, or other values?
- What unit and direction rules apply to weight, body-fat, frequency, strength, and cardio goals?
- What defines a completed workout session in existing data?
- What exact end-of-day boundary and timezone should finalize diet status?
- Which existing chart and Progress widget APIs should Activity use?

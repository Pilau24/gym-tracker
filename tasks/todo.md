# Activity Page Implementation Tasks

## Confirmed product context

- Activity is a review page. Long-term progress is primary; recent history appears beside it.
- Logging happens in dedicated workout-session and meal flows, not directly in the Activity overview.
- Activity domains are workouts, weigh-ins, goals, and diet.
- Users explicitly create workout sessions. Automatic grouping of nearby exercise entries is out of scope for now.
- Users can log multiple sessions on the same day.
- A session stores a start time and can contain strength exercises, cardio exercises, or a mix.
- Users select exercises from a searchable library and can add custom exercises. Custom exercises should be reusable.
- Exercise fields are modality-specific:
  - Strength defaults to weight, reps, and sets.
  - Cardio defaults to duration, distance, and activity-specific metrics.
  - Advanced fields can include duration for each exercise and other optional measurements.
- Weigh-ins require weight and timestamp. Advanced optional fields include body-fat percentage, notes, and measurement conditions.
- Goals include weight, body-fat percentage, diet targets, workout frequency, strength milestones per exercise, and cardio distance targets per exercise, such as 5 km or 10 km.
- Target-based goals have a start date, target date, and target value.
- Only one goal can be active per metric or exercise. Completed goals remain in history, and users can create a new goal for the same metric or exercise after completion.
- Diet uses reusable meal components from a personal macro library. A component such as an egg can store macros and be reused in meals.
- Users can save complete meals for reuse, then add or remove components before logging.
- Diet progress updates continuously after each meal. The current day remains in progress until day end.
- Daily diet history shows total intake, such as `560 kcal`, target status, variance, and entries such as `3 meals logged` or `Diet goal missed`.
- Diet progress uses the existing Progress widget.

## Phase 1: Data foundation

### Task 1: Map activity data sources

- [ ] Inspect existing workout-session, exercise, set, cardio, weigh-in, meal, macro-library, saved-meal, goal, and personal-record models.
- [ ] Confirm whether sessions support multiple entries per day and mixed strength/cardio content.
- [ ] Confirm whether exercise records support modality-specific fields and per-exercise duration.
- [ ] Confirm reusable custom exercises and reusable meal components are persisted per user.
- [ ] Define shared activity and date-range types for workouts, weigh-ins, goals, meals, and daily diet summaries.
- [ ] Identify queries or API routes needed by the Activity page.
- [ ] Record which fields are required, advanced, derived, or historical.

**Verification**

- [ ] Data sources, ownership, and relationships are documented in code-level types or existing query helpers.
- [ ] Required versus advanced fields are explicit.
- [ ] No duplicate activity model is introduced.

**Dependencies:** None

### Task 2: Connect activity summary data

- [ ] Calculate completed workout sessions, personal records, and current streak for the selected range.
- [ ] Keep multiple sessions on one day separate for history while avoiding incorrect streak inflation.
- [ ] Calculate weigh-in summaries and active-goal progress where supported.
- [ ] Calculate current diet totals and provisional target status during the day.
- [ ] Feed calculated values into `HeroStats`.
- [ ] Return an explicit empty state when no activity exists.

**Verification**

- [ ] Changing the date range recalculates all summary values.
- [ ] Planned or scheduled workouts do not affect completed-activity stats unless explicitly supported.
- [ ] In-progress diet days are not marked missed before day end.
- [ ] Empty accounts do not show misleading placeholder activity.
- [ ] Typecheck passes.

**Dependencies:** Task 1

### Task 3: Connect heatmap and timeline data

- [ ] Replace static timeline records with persisted workout sessions, weigh-ins, diet events, and goal milestones.
- [ ] Keep multiple sessions on one day represented without duplicate or misleading daily summaries.
- [ ] Set heatmap intensity from activity frequency, workout volume, or another documented metric.
- [ ] Add daily diet summaries such as total calories, meal count, and final target status.
- [ ] Add goal events for milestones, completions, and target changes.
- [ ] Preserve date navigation and selected-range behavior.

**Verification**

- [ ] Heatmap and timeline represent the same underlying activity.
- [ ] Diet entries show provisional status during the day and final status after day end.
- [ ] Completed goals remain visible in historical activity.
- [ ] Dates with no activity remain visually distinct from dates outside the selected range.
- [ ] No duplicate timeline records appear.

**Dependencies:** Task 1

## Checkpoint: Data foundation

- [ ] Activity page loads with real data.
- [ ] Empty and populated states work.
- [ ] Typecheck and focused tests pass.

## Phase 2: Activity workflows

### Task 4: Build date-detail activity view

- [ ] Show each workout session separately, including start time and mixed strength/cardio content.
- [ ] Show exercises with modality-specific details: sets, reps, weight, duration, distance, and other recorded metrics.
- [ ] Show weigh-ins with required data and any recorded advanced fields.
- [ ] Show meals, reusable meal components, macro totals, and diet-goal status.
- [ ] Show goals and personal records achieved on that date.
- [ ] Provide clear empty, loading, and error states.
- [ ] Add edit and delete actions only where existing workflows support them.

**Verification**

- [ ] Selecting a heatmap date opens the matching detail page.
- [ ] Detail page handles invalid dates and dates without activity.
- [ ] Interactive controls have accessible names and keyboard support.

**Dependencies:** Task 3

### Task 5: Add activity filters

- [ ] Add filters for all activity, workouts, strength, cardio, weigh-ins, diet, goals, and personal records.
- [ ] Keep filter state in the URL when practical.
- [ ] Update timeline and summaries consistently.

**Verification**

- [ ] Filtered results contain only the selected activity type.
- [ ] Refreshing or sharing the URL preserves filter state.
- [ ] Empty filtered results have a useful message and next action.

**Dependencies:** Task 3

### Task 6: Add quick activity actions

- [ ] Link to the dedicated `Log workout` flow.
- [ ] Link to the dedicated `Add weigh-in` flow.
- [ ] Link to the dedicated meal logging flow.
- [ ] Link to exercise-library and custom-exercise creation when supported.
- [ ] Add `Set goal` when a goal workflow exists.
- [ ] Place actions near the page header without competing with date navigation.

**Verification**

- [ ] Each action routes to an existing form or has an explicit blocked state.
- [ ] Actions are usable by keyboard and at mobile widths.
- [ ] Successful creation returns users to refreshed activity data.

**Dependencies:** Task 4

## Checkpoint: Activity workflows

- [ ] User can move from overview to a date and inspect activity.
- [ ] User can filter activity without losing context.
- [ ] User can start supported logging workflows.

## Phase 3: Progress insights and polish

### Task 7: Add training summaries and trends

- [ ] Add total training time, total volume, average workouts per week, and best streak where data supports them.
- [ ] Add weight and body-fat trends from weigh-ins.
- [ ] Add diet calorie and macro trends from meal components.
- [ ] Add workout-frequency and volume trends.
- [ ] Add goal progress for weight, body fat, diet, frequency, strength milestones, and cardio distance.
- [ ] Avoid charts that show insufficient or misleading data.

**Verification**

- [ ] Charts update with the selected date range and filters.
- [ ] Charts include accessible labels or equivalent data summaries.
- [ ] Sparse and empty datasets render meaningful states.

**Dependencies:** Task 2, Task 5

### Task 8: Improve heatmap interaction and accessibility

- [ ] Add tooltips with date, workout-session count, meal count, diet status, weigh-ins, and relevant volume.
- [ ] Add semantic legend labels.
- [ ] Provide keyboard focus and selected-date styling.
- [ ] Keep touch interaction usable on mobile.

**Verification**

- [ ] Heatmap can be navigated without a mouse.
- [ ] Screen readers receive date and activity status.
- [ ] Focus indicators meet the existing design system.

**Dependencies:** Task 3

### Task 9: Refine responsive layout and visual hierarchy

- [ ] Review layout at 320px, 768px, 1024px, and 1440px.
- [ ] Keep header controls usable without overflow.
- [ ] Ensure cards, charts, timeline, and detail content remain readable.
- [ ] Preserve existing spacing, color, and radius tokens.

**Verification**

- [ ] Firefox visual review passes at all target widths.
- [ ] No horizontal page overflow occurs.
- [ ] Loading, empty, error, and populated states remain legible.

**Dependencies:** Tasks 4, 6, 7, 8

## Final checkpoint

- [ ] Activity data is consistent across stats, heatmap, timeline, filters, and detail pages.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm lint` passes.
- [ ] Focused tests pass.
- [ ] Firefox browser review passes with no console errors or accessibility regressions.
- [ ] Final diff contains only Activity page work.

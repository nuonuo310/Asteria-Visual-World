# Our little wishes · v0.1

Home: the existing small panel below chat is a link to `wishes.html`. It displays only the most recently updated active wish title (if any), otherwise a neutral empty state. No extra Home cards or changed locked art.

List: filters for all / active / not started / planning / completed / paused, lightweight cards, add wish. Detail: original wish, first-proposed date (optional; never fabricated), plan, HTTP(S) references, append-only progress entries, editable title/plan/status. Created-at and original proposal are retained. Completed wishes remain in the list. Data is stored only in this browser's `localStorage` under `asteria.visual.wishes.v1`, separate from the Home/Mind view-store. No cross-device sync, Memory integration, independent Shen task system, or automatic status transitions are claimed. A future Shen-room task may link to a wish ID but is not implemented here.

The page starts with an empty collection rather than fabricated dates or guessed project states. The user can add the previously discussed wishes with their verified dates and status. This is a functional layout baseline, not final artwork.
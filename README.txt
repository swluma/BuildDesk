Block Blast Duel
================

Files:
- index.html
- style.css
- script.js
- multiplayer/
- server.js
- package.json
- game.json

Local testing
-------------
1. Run `npm start`
2. Open `http://127.0.0.1:3000/` for normal local mode
3. Open `http://127.0.0.1:3000/?hub=1&mode=host&name=Yuki&room=ABCD12` in one tab/window
4. Open `http://127.0.0.1:3000/?hub=1&mode=join&name=Mika&room=ABCD12` in another tab/window
5. The room flow uses a browser-local dev transport, so no remote WebSocket server is required yet

Notes
-----
- Invalid room/session params fall back to local mode with a visible warning.
- The room architecture now prepares session parsing, room status, transport abstraction, and serializable gameplay actions.
- Full authoritative gameplay synchronization is still a follow-up step.

Implemented assumptions
-----------------------
1. Board size is 8x8 (not explicitly specified in the prompt).
2. Base score = number of cleared blocks.
   - Every successful piece placement grants 1 point
   - Every cleared block = 1 point toward base score
   - If any cleared block was sitting on an orange special tile, the clear score is doubled
   Final gained score = base score x (cleared rows + cleared columns), then x2 if a special tile was consumed
3. When a jam/stuck happens, the game pauses, the triggering player's score is reduced by 25%,
   then the board is cleared, both players receive 3 new normal pieces, all special tiles are removed,
   and the game resumes after a visible countdown.
4. After a line clear, there is a 5% chance that orange special tiles appear on the board.
   Clearing lines through blocks on those tiles doubles the gained clear score, and the used tiles revert to normal.
5. Skill tiles are separate from orange special tiles.
   - Every 10 seconds during active gameplay, 2 skill tiles spawn on random different board cells
   - The 2 spawned skill tiles use different skill colors each time: red, blue, and green are the 3 prepared skill types
   - Skill tiles do not currently grant or consume player skills yet; this update only adds the board spawn system and visuals

Mobile UX notes
---------------
- No page scroll / no pull-to-refresh.
- Multi-touch friendly pointer-event controls.
- All core UI elements stay on one screen in portrait mode.

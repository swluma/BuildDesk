Block Blast Duel
================

Files:
- index.html
- style.css
- script.js

Implemented assumptions
-----------------------
1. Board size is 8x8 (not explicitly specified in the prompt).
2. Base score = number of cleared blocks.
   - Every successful piece placement grants 1 point
   - Every cleared block = 1 point toward base score
   - If any cleared block was sitting on an orange special tile, the clear score is doubled
   Final gained score = base score x (cleared rows + cleared columns), then x2 if a special tile was consumed
3. When a jam/stuck happens, the game pauses, the triggering player's score is halved,
   then the board is cleared, both players receive 3 new normal pieces, all special tiles are removed,
   and the game resumes after a visible countdown.
4. After a line clear, there is a 5% chance that orange special tiles appear on the board.
   Clearing lines through blocks on those tiles doubles the gained clear score, and the used tiles revert to normal.

Mobile UX notes
---------------
- No page scroll / no pull-to-refresh.
- Multi-touch friendly pointer-event controls.
- All core UI elements stay on one screen in portrait mode.

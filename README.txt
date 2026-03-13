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
   - Normal cleared block = 1 point toward base score
   - Special/orange cleared block = 2 points toward base score
   Final gained score = base score × (cleared rows + cleared columns)
3. When a jam/stuck happens, the game pauses, the triggering player's score is halved,
   then the board is cleared, both players receive 3 new normal pieces, the special piece is removed,
   and the game resumes after a visible countdown.
4. A side special piece can be taken by whichever player drags it first.

Mobile UX notes
---------------
- No page scroll / no pull-to-refresh.
- Multi-touch friendly pointer-event controls.
- All core UI elements stay on one screen in portrait mode.

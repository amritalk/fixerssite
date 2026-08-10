/* Moka Origins crossword — ported from the Podpage custom page.
 *
 * Two changes from the original, both mechanical:
 *  - The original relocated #moka-crossword into the page body at runtime,
 *    because Podpage's editor rendered it in the wrong place. Our template
 *    puts it where it belongs, so that hack is gone.
 *  - Buttons bind via data-cw attributes instead of inline onclick. The
 *    original's onclick="clear()" resolved to document.clear() rather than the
 *    intended global, so the Clear button did nothing.
 *
 * Puzzle content (answers, clue numbering) is unchanged — see the note in
 * MIGRATION_PLAN.md about the pre-existing errors in it.
 */
(function () {
  const words = {
    1: { r: 0, c: 0, d: 'a', ans: 'CAMEROON', cells: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]] },
    2: { r: 0, c: 2, d: 'd', ans: 'TANZANIA', cells: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2]] },
    3: { r: 3, c: 3, d: 'd', ans: 'FOUR', cells: [[3,3],[4,3],[5,3],[6,3]] },
    4: { r: 5, c: 4, d: 'a', ans: 'PODS', cells: [[5,4],[5,5],[5,6],[5,7]] },
    5: { r: 7, c: 3, d: 'a', ans: 'MOKA', cells: [[7,3],[7,4],[7,5],[7,6]] },
  };

  const grid = [
    ['C','A','M','E','R','O','O','N'],
    ['O','■','A','■','■','■','■','■'],
    ['C','■','N','■','■','■','■','■'],
    ['O','■','Z','F','O','U','R','■'],
    ['A','■','A','■','■','■','■','■'],
    ['■','■','N','■','P','O','D','S'],
    ['■','■','I','■','■','■','■','■'],
    ['■','■','A','M','O','K','A','■'],
  ];

  const cellAt = (r, c) => document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  const message = () => document.getElementById('msg');

  function clearMarks(classes) {
    document.querySelectorAll('.cw-cell').forEach((c) => c.classList.remove(...classes));
  }

  function check() {
    let correct = 0;
    let total = 0;
    clearMarks(['correct', 'incorrect', 'revealed']);
    for (const word of Object.values(words)) {
      word.cells.forEach(([r, c], i) => {
        const cell = cellAt(r, c);
        const input = cell && cell.querySelector('input');
        if (!input) return;
        total++;
        const value = input.value.toUpperCase();
        if (value === word.ans[i]) {
          correct++;
          cell.classList.add('correct');
        } else if (value) {
          cell.classList.add('incorrect');
        }
      });
    }
    if (total > 0 && correct === total) {
      const msg = message();
      if (msg) {
        msg.style.display = 'block';
        msg.textContent = '🎉 Completed! 🎉';
      }
    }
    setTimeout(() => clearMarks(['correct', 'incorrect']), 3000);
  }

  function reveal() {
    for (const word of Object.values(words)) {
      word.cells.forEach(([r, c], i) => {
        const cell = cellAt(r, c);
        const input = cell && cell.querySelector('input');
        if (!input) return;
        input.value = word.ans[i];
        cell.classList.add('revealed');
      });
    }
    const msg = message();
    if (msg) {
      msg.style.display = 'block';
      msg.textContent = '🎉 Answers Revealed! 🎉';
    }
  }

  function clearGrid() {
    document.querySelectorAll('.cw-cell input').forEach((i) => { i.value = ''; });
    clearMarks(['correct', 'incorrect', 'revealed']);
    document.querySelectorAll('.cw-clues div').forEach((d) => d.classList.remove('active'));
    const msg = message();
    if (msg) msg.style.display = 'none';
  }

  function numberAt(r, c) {
    for (const [n, word] of Object.entries(words)) {
      if (word.r === r && word.c === c) return n;
    }
    return null;
  }

  function wordAt(r, c) {
    for (const [n, word] of Object.entries(words)) {
      if (word.cells.some(([cr, cc]) => cr === r && cc === c)) return n;
    }
    return null;
  }

  function highlightClue(r, c) {
    const n = wordAt(r, c);
    if (!n) return;
    document.querySelectorAll('.cw-clues div').forEach((d) => d.classList.remove('active'));
    const clue = document.querySelector(`.cw-clues [data-w="${n}"]`);
    if (clue) clue.classList.add('active');
  }

  function init() {
    const container = document.getElementById('grid');
    if (!container) return;
    container.innerHTML = '';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = document.createElement('div');
        cell.className = 'cw-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        if (grid[r][c] === '■') {
          cell.classList.add('black');
        } else {
          const input = document.createElement('input');
          input.maxLength = 1;
          input.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}`);
          input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
          });
          input.addEventListener('focus', () => highlightClue(r, c));
          cell.appendChild(input);
          const n = numberAt(r, c);
          if (n) {
            const span = document.createElement('span');
            span.className = 'cw-num';
            span.textContent = n;
            cell.appendChild(span);
          }
        }
        container.appendChild(cell);
      }
    }

    document.querySelectorAll('.cw-clues div[data-w]').forEach((clue) => {
      clue.addEventListener('click', () => {
        const word = words[clue.dataset.w];
        if (!word) return;
        const cell = cellAt(word.r, word.c);
        const input = cell && cell.querySelector('input');
        if (input) input.focus();
      });
    });

    const actions = { check, reveal, clear: clearGrid };
    document.querySelectorAll('[data-cw]').forEach((button) => {
      const action = actions[button.dataset.cw];
      if (action) button.addEventListener('click', action);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

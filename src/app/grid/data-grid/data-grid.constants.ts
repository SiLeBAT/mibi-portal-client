// Row-header columns hold nothing but the row number, so they get a fixed track
// instead of the content-sized `auto` of every other column (tickets #827/#841).
// 2rem covers a three-digit number at the grid's 0.75rem font plus the cell
// padding; `max-content` lets a four-digit number grow the column while stopping
// free space from stretching it (the results view's full-data mode has no 1fr
// track to absorb that space). Used by the grid engine and by the results view's
// own track template, so both grids stay identical in width.
export const dataGridRowHeaderTrack = 'minmax(2rem, max-content)';
export const dataGridDefaultTrack = 'auto';

/////////// Параметры игры /////////
export const CELL_SIZE_PX = 30;
export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 15;
export const SNAKE_START_LENGTH = 3;
export const SNAKE_WIN_LENGTH = 30;
export const GAME_STEP_DELAY = 100;
export const WALLS_COUNT = 3; //Careful with that! May lead to impassable levels
////////////////////////////////////

// состояние игры
export const GAME_STATE = {
    PLAY: 0,
    WIN: 2,
    LOSE: 3,
}

export const KEY = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown'
}

export const DIRECTION_MAP = {
    0: {x: 1, y: 0},    // right
    90: {x: 0, y: 1},   // bottom
    180: {x: -1, y: 0}, // left
    270: {x: 0, y: -1}, // top
};
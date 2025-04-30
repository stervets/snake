/////////// Параметры игры /////////
export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 15;
const BOMBS_COUNT = 30;
////////////////////////////////////

// общее количество клеток
export const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT;

// бомб не может быть больше, чем клеток на поле
export const VALIDATED_BOMBS_COUNT = Math.min(BOMBS_COUNT, BOARD_SIZE);

// состояние игры
export const GAME_STATE = {
    PLAY: 0,
    WIN: 1,
    LOSE: 2
}

// состояние клетки
export const CELL_STATE = {
    CLOSED: 0, // клетка закрыта
    FLAGGED: 1, // на клетке стоит флаг
    OPENED: 2 // клетка открыта
}

export const MINED_CELL = 10; // признак заминированной клетки
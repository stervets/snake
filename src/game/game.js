import {ref} from "vue";
import {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    VALIDATED_BOMBS_COUNT,
    BOARD_SIZE,
    CELL_STATE,
    GAME_STATE,
    MINED_CELL
} from "./const";
import {random} from "../utils";

export default {
    setup() {
        return {
            gameState: ref(GAME_STATE.PLAY), // ref - реактивная переменная
            board: ref([]),

            openedCellsCount: 0, // счетчик открытых клеток (нужно для определения победы)

            // нужно, чтобы константы были доступны в html
            CELL_STATE,
            GAME_STATE,
            MINED_CELL
        };
    },

    // сработает как только приложение будет готово к исполнению
    created() {
        this.resetGame();
    },

    methods: {
        resetGame() {
            this.gameState = GAME_STATE.PLAY;
            this.openedCellsCount = 0;

            this.board = [];
            // первым делом формируем массив с клетками
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                // создаём строку
                this.board.push([]);
                const row = this.board.at(-1);
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    // создаём клетку
                    row.push({
                        x, y, // координаты клетки
                        value: 0, // число окружающих бомб. 10 (MINED_CELL) означает, что в клетке бомба
                        state: CELL_STATE.CLOSED // состояние клетки
                    });
                }
            }

            // расставляем бомбы
            let bombsToPlace = VALIDATED_BOMBS_COUNT;
            while (bombsToPlace > 0) {
                const x = random(0, BOARD_WIDTH - 1);
                const y = random(0, BOARD_HEIGHT - 1);
                if (!this.board[y][x].value) {
                    this.board[y][x].value = MINED_CELL;
                    bombsToPlace--;
                }
            }

            // ставим числа в клетки по количеству окружающих бомб
            this.board.forEach((row) => {
                row.forEach((cell) => {
                    if (cell.value === MINED_CELL) return;
                    for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                        for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                            this.board[y]?.[x]?.value === MINED_CELL && cell.value++;
                        }
                    }
                });
            });
        },

        openCell(cell) {
            cell.state = CELL_STATE.OPENED;
            this.openedCellsCount++;
        },

        // Обработчик клика по клетке
        onCellClick(cell) {
            // Если в клетке бомба, то завершаем игру (проигрыш)
            if (cell.value === MINED_CELL) {
                this.gameState = GAME_STATE.LOSE;
                return;
            }

            this.openCell(cell); // открываем клетку

            //если клетка пустая, то надо открыть окружающие клетки
            if (!cell.value) {
                for (let x = cell.x - 1; x <= cell.x + 1; x++) {
                    for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                        const nextCell = this.board[y]?.[x];
                        if (nextCell && nextCell.state < CELL_STATE.OPENED) {
                            // Если клетка в окружении не пустая, то открываем её
                            // Если клетка в окружении пустая, то надо открыть и её окружающие клетки
                            nextCell.value ? this.openCell(nextCell) : this.onCellClick(nextCell);
                        }
                    }
                }
            }

            // Если открыты все клетки, кроме бомб, то завершаем игру (победа)
            this.openedCellsCount >= BOARD_SIZE - VALIDATED_BOMBS_COUNT && (this.gameState = GAME_STATE.WIN);
        },

        toggleFlag(cell) {
            cell.state = !cell.state * 1;
        }
    }
}
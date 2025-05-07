import {ref, shallowRef} from "vue";
import {
    BOARD_HEIGHT,
    BOARD_WIDTH,
    CELL_SIZE_PX, DIRECTION_MAP,
    GAME_STATE,
    GAME_STEP_DELAY,
    KEY,
    SNAKE_START_LENGTH, SNAKE_WIN_LENGTH, WALLS_COUNT
} from "./const";
import {random, timeout} from "../utils";

export default {
    setup() {
        return {
            gameState: ref(null),
            snake: ref([]),
            apple: ref(null),
            walls: ref([]),
            currentDirection: ref(null),

            bannedWall: [],
            preventEndlessResetCount: 0,

            GAME_STATE,
            BOARD_WIDTH,
            BOARD_HEIGHT,
            SNAKE_WIN_LENGTH,

            getNextDirection: {
                [KEY.LEFT]: () => ({x: -1, y: 0}),
                [KEY.RIGHT]: () => ({x: 1, y: 0}),
                [KEY.UP]: () => ({x: 0, y: -1}),
                [KEY.DOWN]: () => ({x: 0, y: 1}),
            },

            path: shallowRef([]),
            foundPathToApple: true
        };
    },

    watch: {
        gameState() {
            this.gameState === GAME_STATE.PLAY && this.gameStep();
        }
    },

    created() {
        this.resetGame();
    },

    mounted() {
        document.documentElement.style.setProperty('--cell-size', `${CELL_SIZE_PX}px`);
        document.body.addEventListener('keydown', this.onKeyDown)
    },

    beforeUnmount() {
        document.body.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
        coordsToStyle(xy) {
            return {
                left: `${xy.x * CELL_SIZE_PX}px`,
                top: `${xy.y * CELL_SIZE_PX}px`,
                rotate: `${xy.angle}deg`
            }
        },

        isCollided(colliders, ...targets) {
            !Array.isArray(colliders) && (colliders = [colliders]);
            return !!targets.flat().find((target) =>
                colliders.find((collider) => collider.x === target.x && collider.y === target.y)
            );
        },

        getNextCoords(current, nextDirection) {
            const angle = ((current.angle % 360) + 360) % 360;
            const direction = DIRECTION_MAP[angle];
            //vector 2d cross
            let cross = direction.x * nextDirection.y - direction.y * nextDirection.x;
            return {
                x: current.x + nextDirection.x,
                y: current.y + nextDirection.y,
                angle: current.angle + cross * 90
            }
        },

        createNewApple() {
            while (true) {
                const apple = {
                    x: random(1, BOARD_WIDTH - 2),
                    y: random(1, BOARD_HEIGHT - 2)
                };
                if (!this.isCollided(apple, this.snake, this.walls)) {
                    this.apple = apple;
                    break;
                }
            }
        },

        createWall() {
            let x = 0;
            while (this.preventEndlessResetCount++ < 100000 && (!x || this.bannedWall.includes(x))) {
                x = random(4, BOARD_WIDTH - 4);
            }
            this.bannedWall.push(x, x + 1, x - 1, x + 2, x - 2);
            const holeLength = random(2, BOARD_HEIGHT - 4);
            const holeStart = random(1, BOARD_HEIGHT - holeLength - 1);
            const holeEnd = holeStart + holeLength - 1;
            for (let y = 1; y < BOARD_HEIGHT - 1; y++) {
                !(y >= holeStart && y <= holeEnd) && this.walls.push({x, y});
            }
        },

        resetGame() {
            const snakeY = random(1, BOARD_HEIGHT - 2);
            this.snake = Array.from({length: SNAKE_START_LENGTH}, (_, index) => ({
                x: index + 1,
                y: snakeY,
                angle: 0
            }));

            this.walls = [];
            this.bannedWall = [];

            for (let i = 0; i < WALLS_COUNT; i++) {
                this.createWall(i % 2);
            }

            if (this.preventEndlessResetCount++ < 100000 &&
                this.isCollided(this.snake.concat({x: this.snake.length + 1, y: snakeY}), this.walls)) {
                this.resetGame();
                return;
            }
            this.preventEndlessResetCount = 0;

            for (let x = 0; x < BOARD_WIDTH; x++) {
                this.walls.push({x, y: 0}, {x, y: BOARD_HEIGHT - 1});
            }

            for (let y = 1; y < BOARD_HEIGHT - 1; y++) {
                this.walls.push({x: 0, y}, {x: BOARD_WIDTH - 1, y});
            }

            this.apple = null;

            this.currentDirection = this.getNextDirection[KEY.RIGHT]();
            this.gameState = GAME_STATE.PLAY;
            //this.createNewApple();

        },

        findPath(targetCell) {
            const snakeHead = this.snake.at(-1);

            const closed = [...this.walls, ...this.snake];
            const open = [];

            const isOpen = (cell) => !closed.some(c => cell.x === c.x && cell.y === c.y);
            const distance = (a, b) => Math.floor(((a.x - b.x) ** 2 + (a.y - b.y) ** 2) / 1);

            const appendOpenCellsAround = (cell) => {
                const cells = [];
                let nextCell;
                Object.values(KEY).forEach(key =>
                        isOpen(nextCell = this.getNextCoords(cell, this.getNextDirection[key]())) && cells.push({
                            ...nextCell,
                            distance: distance(nextCell, targetCell),
                            headDistance: distance(nextCell, snakeHead),
                            parent: cell
                        })
                );
                cells.sort((a, b) => b.distance - a.distance);
                open.push.apply(open, cells);
            }

            appendOpenCellsAround(snakeHead);
            if (!open.slice().pop()) return [];
            while (open.length) {
                let cell = open.pop();
                if (cell.x === targetCell.x && cell.y === targetCell.y) {
                    const path = [];
                    while (cell) {
                        path.push(cell);
                        cell = cell.parent;
                    }
                    path.pop();
                    return path;
                }
                closed.push(cell);
                appendOpenCellsAround(cell);
            }

            const emptyCell = closed.slice(this.walls.length + this.snake.length).reduce((res, cell) => {
                return cell.headDistance > res.headDistance ? cell : res;
            }, {headDistance: 0});
            return this.findPath(emptyCell);
        },

        setNextSnakeMove(cell) {
            const snakeHead = this.snake.at(-1);
            let nextCoords = cell;
            const nextDirection = {
                x: nextCoords.x - snakeHead.x,
                y: nextCoords.y - snakeHead.y
            };

            nextCoords = this.getNextCoords(snakeHead, nextDirection);
            this.currentDirection = nextDirection;
            snakeHead.angle = nextCoords.angle;
        },

        async gameStep() {
            await timeout(GAME_STEP_DELAY);
            if (!this.apple) {
                this.createNewApple();
                this.path = [];
            }

            const tail = {...this.snake[0]};
            this.snake.slice(0, -1).forEach((item, index) =>
                Object.assign(item, this.snake[index + 1])
            );
            const snakeHead = this.snake.at(-1);
            Object.assign(snakeHead, this.getNextCoords(snakeHead, this.currentDirection));

            // check snake collision with walls and itself
            if (this.isCollided(snakeHead, this.snake.slice(0, -1), this.walls)) {
                this.gameState = GAME_STATE.LOSE;
                return;
            }

            //const path = this.findPath(this.apple);
            if (!this.path.length) {
                //this.path = path.slice(-10);
                this.path = this.findPath(this.apple);
            }
            const nextCell = this.path.pop();
            nextCell && this.setNextSnakeMove(nextCell);

            // check collision between snake head and apple
            if (this.isCollided(snakeHead, this.apple)) {
                this.apple = null;
                this.snake.unshift(tail);
                if (this.snake.length >= SNAKE_WIN_LENGTH) {
                    this.gameState = GAME_STATE.WIN;
                    return;
                }
            }


            this.gameState === GAME_STATE.PLAY && this.gameStep();
        },

        onKeyDown(e) {
            if (this.gameState !== GAME_STATE.PLAY) return;
            const nextDirection = this.getNextDirection[e.code]?.();
            if (!nextDirection) return;
            const snakeHead = this.snake.at(-1);

            // check collision between snake head and prev snake segment
            if (!this.isCollided(this.getNextCoords(snakeHead, nextDirection), this.snake.at(-2))) {
                this.currentDirection = nextDirection;
                snakeHead.angle = this.getNextCoords(snakeHead, nextDirection).angle;
            }
        }
    }
}
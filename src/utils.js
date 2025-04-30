export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const timeout = (delay = 0) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

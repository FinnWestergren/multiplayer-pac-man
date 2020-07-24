enum Directions {
    "NONE" = 0,
    "UP" = 1,
    "RIGHT" = 2,
    "DOWN" = 4,
    "LEFT" = 8
}

export default Directions;

export const isUp: (dir: Directions) => boolean = dir =>
    Directions.UP === (Directions.UP & dir);
export const isDown: (dir: Directions) => boolean = dir =>
    Directions.DOWN === (Directions.DOWN & dir);
export const isLeft: (dir: Directions) => boolean = dir =>
    Directions.LEFT === (Directions.LEFT & dir);
export const isRight: (dir: Directions) => boolean = dir =>
    Directions.RIGHT === (Directions.RIGHT & dir);

export const getString: (dir: Directions) => string = dir => {
    let out = "";
    if (dir === Directions.NONE) {
        return "NONE";
    }
    if (isUp(dir)) {
        out += "UP ";
    }
    if (isDown(dir)) {
        out += "DOWN ";
    }
    if (isLeft(dir)) {
        out += "LEFT ";
    }
    if (isRight(dir)) {
        out += "RIGHT ";
    }
    return out.trim();
};

export const randomSingleDir = () => {
    const randomNum = Math.random() * 4;
    switch (Math.floor(randomNum)) {
        case 0:
            return Directions.DOWN;
        case 1:
            return Directions.UP;
        case 2:
            return Directions.LEFT;
        case 3:
            return Directions.RIGHT;
        default:
            return Directions.NONE;
    }
};
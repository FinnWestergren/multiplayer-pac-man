import { IDEAL_FRAME_LENGTH } from ".";

/*
    Because javascript runs in an event loop and there is no garauntee on the length of a single frame,
    I made this to track and "smoothen out" the user framerate experience. The "framerate" calculated here takes the average
    length over the last 16 frames. This information is then used to effectively speed up or slow down the rate at which the actors
    move. I believe this technique was used in DK 64, but I don't know what the name for this technique is. "Lag Compensation"?
*/ 

const trackerLength = 16;
const divisor = 1 / trackerLength;

let frameTracker: number[];

const getTime = () => (new Date()).getTime();
let lastFrame: number;
let frameCounter = 0;

export const updateFrameManager = () => {
    if (frameCounter === 0) {
        frameTracker = new Array(trackerLength).fill(IDEAL_FRAME_LENGTH);
        lastFrame = getTime();
        frameCounter++;
        return;
    }
    const currentTime = getTime();
    const frameLength = currentTime - lastFrame;
    frameTracker[frameCounter % trackerLength] = frameLength;
    lastFrame = currentTime;
    frameCounter++;
};

export const getAverageFrameLength = () => frameTracker ? frameTracker.reduce((p, c) => p + c) * divisor : IDEAL_FRAME_LENGTH;
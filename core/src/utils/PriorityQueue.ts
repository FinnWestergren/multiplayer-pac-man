const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

export default class PriorityQueue<T> {
    private heap: { value: T, insertTime: number } [];
    private comparator: (a: T, b: T) => boolean; // a > b for maxheap, a < b for minheap
    private counter: number = 0;

    public constructor(comparator: (a: T, b: T) => boolean) {
        this.comparator = comparator;
        this.heap = [];
    }

    public size = () => this.heap.length;

    public peek = () => this.heap[0];

    public pop = () => {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this.swap(bottom, 0);
        }
        this.heap.pop();
        this.siftDown();
        return poppedValue.value;
    };

    public push = (...values: T[]) => {
        values.forEach((value) => {
            this.heap.push({ value, insertTime: this.counter });
            this.siftUp();
            this.counter++;
        });
    };

    private swap = (a: number, b: number) => {
        [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
    }

    private compare = (a: number, b: number, up: boolean) =>
        this.comparator(this.heap[a].value, this.heap[b].value) || 
        (up ? this.heap[a].insertTime < this.heap[b].insertTime
        : this.heap[a].insertTime > this.heap[b].insertTime)

    private siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this.compare(node, parent(node), true)) {
            this.swap(node, parent(node));
            node = parent(node);
        }
    }

    siftDown() {
        let node = 0;
        while (
            (left(node) < this.size() && this.compare(left(node), node, false)) ||
            (right(node) < this.size() && this.compare(right(node), node, false))
        ) {
            let swapChild =
                right(node) < this.size() &&
                this.compare(right(node), left(node), false)
                    ? right(node)
                    : left(node);
            this.swap(node, swapChild);
            node = swapChild;
        }
    }
}

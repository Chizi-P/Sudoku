class Sudoku {
    constructor({size = 3, chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9'], unknowChar = '.'} = {}) {
        this.size;
        this.length = size ** 2;
        this.chars = chars
        this.unknowChar = unknowChar;
        this.done = false;
        this.multipleSolutions = false;
        this._ans = [];
    }
    set(i, board) {
        const set = board.filter((_, j) => {
            return parseInt(i / this.length) == parseInt(j / this.length) 
            || (i - j) % this.length == 0
            || parseInt(i / this.length * this.size) == parseInt(j / this.length * this.size)
            && parseInt(i % this.length / this.size) == parseInt(j % this.length / this.size);
        });
        return new Set(set);
    }
    solution(board) {
        let ans = [];
        if (this.done && !this.multipleSolutions) {
            return [];
        }
        let i = board.indexOf(this.unknowChar);
        if (i == -1) {
            this.done = true
            return [board];
        }
        let set = this.set(i, board);
        let f = this.chars.filter(e => !set.has(e));
        for (const e of f) {
            ans.push(...this.solution(board.slice(0, i).concat(e).concat(board.slice(i + 1))));
        }
        return ans;
    }
    ans(qu, multipleSolutions = false) {
        this.multipleSolutions = multipleSolutions;
        this._ans = this.solution(qu).flat(multipleSolutions ? 0 : 1);
        this.done = false;
        return this._ans;
    }
    static resize(list, l) {
        let result = [];
        for (let i = 0; i < list.length; i++) {
            result.push(list.splice(0, l));
        }
        return result;
    }
    show() {
        if (this.multipleSolutions) {
            for (let i = 0; i < this._ans.length; i++) {
                console.log('Answer', i, ':');
                console.table(Sudoku.resize(this._ans, this.length));
            }
        } else {
            console.log('Answer:');
            console.table(Sudoku.resize(this._ans, this.length));
        }
    }
}

var list = ["5","3","4",".","7",".",".",".",".",
            "6",".",".","1","9","5",".",".",".",
            ".","9","8",".",".",".",".","6",".",
            "8",".",".",".","6",".",".",".","3",
            "4",".",".","8",".","3",".",".","1",
            "7",".",".",".","2",".",".",".","6",
            ".","6",".",".",".",".","2","8",".",
            ".",".",".","4","1","9",".",".","5",
            ".",".",".",".","8",".",".","7","9"];

var s = new Sudoku();
let result = s.ans(list, true);
// console.table(resize(result[0], 9));
console.log(result);
s.show();
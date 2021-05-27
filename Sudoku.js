class Sudoku {
    constructor(row = 3, column = 3) {
        this.row = row
        this.column = column;
        this.length = row * column;
        this.unknowChar = '.';
        this.chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.qu;
        this.ans = [];
    }
    list(qu) {
        this.qu = qu;
    }
    set(i, board) {
        const set = board.filter((_, j) => {
            return parseInt(i / this.length) == parseInt(j / this.length) 
            || (i - j) % this.length == 0
            || parseInt(i / this.length * this.column) == parseInt(j / this.length * this.row)
            && parseInt(i % this.length / this.column) == parseInt(j % this.length / this.row);
        });
        return new Set(set);
    }
    solution(board) {
        let ans = [];
        let i = board.indexOf(this.unknowChar);
        if (i == -1) {
            return [board];
        }
        let set = this.set(i, board);
        let f = this.chars.filter(e => !set.has(e));
        for (const e of f) {
            ans.push(...this.solution(board.slice(0, i).concat(e).concat(board.slice(i + 1))));
        }
        return ans;
    }
    show() {}
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

var list2 = ['5', '3', '.', '.', '7', '.', '.', '.', '.',
             '6', '.', '.', '1', '9', '5', '.', '4', '.',
             '.', '.', '8', '.', '.', '.', '5', '.', '7',
             '8', '.', '.', '.', '6', '.', '4', '2', '3',
             '4', '.', '.', '8', '5', '3', '7', '9', '1',
             '7', '1', '.', '.', '2', '.', '.', '.', '6',
             '.', '6', '.', '.', '.', '7', '2', '8', '.',
             '.', '.', '.', '4', '1', '9', '.', '.', '5',
             '.', '.', '.', '2', '8', '.', '.', '7', '9'];
var s = new Sudoku();
s.list(list2);
let row = [];
console.table(resize(s.solution(list2)[0], 9));

function resize(list, l) {
    let result = [];
    for (let i = 0; i < list.length; i+=l) {
        result.push(list.splice(i, l));
    }
    return result;
}

// console.log(s.ans);
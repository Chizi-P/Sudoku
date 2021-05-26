class Sudoku {
    constructor(row = 3, column = 3) {
        this.row = row
        this.column = column;
        this.length = row * column;
        this.matrix = this.createMatrix(this.length, this.length);
        this.unknowChar = '.';
        this.characters = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
        this.chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.ans = this.createMatrix(this.length, this.length).map(r => r.map(_ => new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])));
    }
    copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    copy2(array) {
        return array.map(arr => arr.slice());
    }
    createMatrix(row, column, init = 0) {
        return new Array(row).fill(null).map(() => new Array(column).fill(init));
    }
    createBylist(list) {
        if (list.length != this.length ** 2) {
            throw "";
        }
        this.matrix = this.matrix.map((r, i) => r.map((_, j) => list[i * this.length + j]));
        return this;
    }
    checkRow() {
        this.matrix.forEach((r, i) => {
            r.forEach(e => {
                for (let k = 0; k < this.length; k++) {
                    this.ans[i][k].delete(e)
                }
            });
        });
        return this;
    }
    checkColumn() {
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                let e = this.matrix[j][i]
                for (let k = 0; k < this.length; k++) {
                    this.ans[k][i].delete(e);
                }
            }
        }
        return this;
    }
    checkBlock() {
        for (let i = 0; i < this.row; i += this.row) {
            for (let j = 0; j < this.column; j += this.column) {
                for (let k = 0; k < this.row; k++) {
                    for (let l = 0; l < this.column; l++) {
                        let e = this.matrix[i + k][j + l];
                        for (let m = 0; m < this.row; m++) {
                            for (let n = 0; n < this.column; n++) {
                                this.ans[i + m][j + n].delete(e);
                            }
                        }
                    }
                }
            }
        }
        return this;
    }
    checkOnly() {
        let only = [];
        this.ans.forEach((r, i) => r.forEach((e, j) => {
            if (e.size == 1) {
                only.push({ val : String(...e.values()), i, j });
            }
        }));
        only.forEach(e => {
            this.matrix[e.i][e.j] = e.val;
        });
        return only;
    }
    set(i, j) {
        let column = new Set();
        for (let k = 0; k < this.length; k++) {
            column.add(this.matrix[k][j]);
        }
        let block = new Set();
        for (let rowStart = (i - i % this.row), l = rowStart; l < rowStart + this.row; l++) {
            for (let columnStart = (j - j % this.column), m = columnStart; m < columnStart + this.column; m++) {
                block.add(this.matrix[l][m]);
            }
        }
        return new Set([...this.matrix[i], ...column, ...block]);
    }
    // subtracting(set) {
    //     let subtracting = new Set(this.characters);
    //     for (const e of set) {
    //         subtracting.delete(e);
    //     }
    //     return subtracting;
    // }
    solution(board, i = 0) {
        let j = 0;
        for (let l = i; l < this.length; l++) {
            j = board[l].indexOf(this.unknowChar);
            if (j) {
                i = l;
                break;
            } else {
                return board;
            }
        }
        let set = this.set(i, j);
        let p = this.chars.filter(c => !set.has(c));
        if (!p.length) return 0;
        for (const e of p) {
            let newBoard = this.copy2(board);
            newBoard[i][j] = e;
            return this.solution(newBoard, i);
        }

        // board.forEach((r, i) => {
        //     let j = r.indexOf(this.unknow);
        //     if (i == this.length - 1 && j == -1) {
        //         return board;
        //     }
        //     let set = this.set(i, j);
        //     this.chars.filter(c => !set.has(c)).forEach(e => {
        //         let newBoard = this.copy(board);
        //         newBoard[i][j] = e;
        //         return this.solution(newBoard);
        //     });
        // });
    }
    show() {}
}

var list = ["5","3",".",".","7",".",".",".",".",
            "6",".",".","1","9","5",".",".",".",
            ".","9","8",".",".",".",".","6",".",
            "8",".",".",".","6",".",".",".","3",
            "4",".",".","8",".","3",".",".","1",
            "7",".",".",".","2",".",".",".","6",
            ".","6",".",".",".",".","2","8",".",
            ".",".",".","4","1","9",".",".","5",
            ".",".",".",".","8",".",".","7","9"];

var list2 = ['5', '3', '4', '6', '7', '8', '9', '1', '2',
             '6', '7', '2', '1', '9', '5', '.', '4', '8',
             '1', '9', '8', '3', '4', '.', '5', '6', '7',
             '8', '5', '9', '7', '6', '.', '4', '2', '3',
             '4', '2', '6', '8', '5', '3', '7', '9', '1',
             '7', '1', '3', '9', '2', '.', '8', '5', '6',
             '9', '6', '1', '.', '3', '7', '2', '8', '4',
             '2', '8', '7', '4', '1', '9', '6', '3', '5',
             '3', '4', '5', '2', '8', '6', '1', '7', '9'];
var s = new Sudoku();
s.createBylist(list2);
console.table(s.matrix);
// s.solution(s.matrix);
console.table(s.solution(s.matrix));
// console.table(s.ans);
// s.checkBlock();
// console.table(s.ans);
// s.checkOnly();
// console.table(s.matrix);
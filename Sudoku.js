class Sudoku {
    constructor(row = 3, column = 3) {
        this.row = row
        this.column = column;
        this.length = row * column;
        this.matrix = this.createMatrix(this.length, this.length);
        this.unknow = '.';
        this.characters = new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
        this.ans = this.createMatrix(this.length, this.length).map(r => r.map(_ => new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9'])));
    }
    copy(obj) {
        return JSON.parse(JSON.stringify(obj));
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
        let column = [];
        for (let k = 0; k < this.length; k++) {
            column.push(this.matrix[k][j]);
        }
        let block = [];
        for (let rowStart = (i - i % this.row), l = rowStart; l < rowStart + this.row; l++) {
            for (let columnStart = (j - j % this.column), m = columnStart; m < columnStart + this.column; m++) {
                block.push(this.matrix[l][m]);
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
    solution(board) {
        board.forEach((r, i) => {
            let j = r.indexOf(this.unknow);
            if (i == this.length - 1 && j == -1) {
                return board;
            }
            let set = this.set(i, j);
            this.characters.filter(c => !set.has(c)).forEach(e => {
                newBoard = this.copy(board);
                newBoard[i][j] = e;
                return this.solution(newBoard);
            });
        });
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
var s = new Sudoku();
s.createBylist(list);
console.table(s.matrix);
s.solution();
console.table(s.ans);
s.checkBlock();
console.table(s.ans);
s.checkOnly();
console.table(s.matrix);
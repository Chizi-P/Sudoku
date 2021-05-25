class Sudoku {
    constructor(row = 3, column = 3) {
        this.row = row
        this.column = column;
        this.length = row * column;
        this.matrix = this.createMatrix(this.length, this.length);
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
                let set = new Set(...this.characters);
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
    solution() {
        return this.checkRow().checkColumn();
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
 ".",".",".",".","8",".",".","7","9"]
var s = new Sudoku();
s.createBylist(list);
console.table(s.matrix);
s.solution();
console.table(s.ans);
console.table(s.ans);
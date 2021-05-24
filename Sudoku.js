class Sudoku {
    constructor(row = 3, column = 3) {
        this.row = row
        this.column = column;
        this.length = row * column;
        this.matrix = this.createMatrix(this.length, this.length);
        this.characters = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        this.ans = this.createMatrix(this.length, this.length, copy(this.characters));
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
    someRow() {
        this.matrix.forEach((r, i) => {
            r.forEach(e => {
                this.ans[i] = this.ans[i].map(p => {
                    p.delete(e);
                });
            });
        });
    }
    someColumn() {
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                this.matrix
            }
        }
    }
    solution() {
        
    }
    show() {}
}

var data = ["5","3",".",".","7",".",".",".",".",
 "6",".",".","1","9","5",".",".",".",
 ".","9","8",".",".",".",".","6",".",
 "8",".",".",".","6",".",".",".","3",
 "4",".",".","8",".","3",".",".","1",
 "7",".",".",".","2",".",".",".","6",
 ".","6",".",".",".",".","2","8",".",
 ".",".",".","4","1","9",".",".","5",
 ".",".",".",".","8",".",".","7","9"]
var s = new Sudoku().createBylist(data);
console.table(s.matrix)

 
const { Size, KMEANS_PP_CENTERS, Point2, Vec3, Contour, Point, imwrite } = require('opencv4nodejs');
const cv = require('opencv4nodejs');

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
        if (this.done && !this.multipleSolutions) {
            return [];
        }
        let ans = [];
        const i = board.indexOf(this.unknowChar);
        if (i == -1) {
            this.done = true;
            return [board];
        }
        const set = this.set(i, board);
        const f = this.chars.filter(e => !set.has(e));
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
    ansFromImg(imagePath) {
        let result = cv.imread(imagePath);
        let image = cv.imread(imagePath);
        image = image.cvtColor(cv.COLOR_BGR2GRAY);
        image = image.gaussianBlur(new Size(5, 5), 0)
        image = image.dilate(cv.getStructuringElement(cv.MORPH_RECT, new Size(3, 3)));
        image = image.canny(30, 120, 3);

        cv.imwrite('1.png', image);

        let cnts = image.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let docCnt;
        if (cnts.length > 0) {
            cnts = cnts.sort((a, b) => b.area - a.area);
            for (const c of cnts) {
                let peri = c.arcLength(true);
                let approx = c.approxPolyDP(0.02 * peri, true);
                if (approx.length == 4) {
                    docCnt = approx;
                    break;
                }
            }
        }
        for (let peak of docCnt) {
            result.drawCircle(peak, 10, new Vec3(0, 0, 255));
        }

        cv.imwrite('2.png', result);


        // src = np.float32([[207, 151], [517, 285], [17, 601], [343, 731]])
        // dst = np.float32([[0, 0], [337, 0], [0, 488], [337, 488]])
        const dst = [
            new Point2(0, 0), 
            new Point2(300, 0), 
            new Point2(0, 300), 
            new Point2(300, 300)
        ];
        const m = cv.getPerspectiveTransform(docCnt, dst);
        result = result.warpPerspective(m, new Size(300, 300));

        imwrite('result.png', result);
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
                console.table(Sudoku.resize(this._ans[i], this.length));
            }
        } else {
            console.log('Answer:');
            console.table(Sudoku.resize(this._ans, this.length));
        }
    }
}

var list = ["5","3","4",".","7",".",".",".",".",
            "6",".",".","1","9","5",".",".","8",
            ".","9","8",".",".",".",".","6",".",
            "8",".",".",".","6",".",".",".","3",
            "4",".",".","8",".","3",".",".","1",
            "7",".",".",".","2",".",".",".","6",
            ".","6",".",".",".",".","2","8",".",
            ".",".",".","4","1","9",".",".","5",
            ".",".",".",".","8",".",".","7","9"];

// let s = new Sudoku();
// let result = s.ans(list);
// console.log(result);
// s.show();

let s = new Sudoku();
s.ansFromImg('image.png');
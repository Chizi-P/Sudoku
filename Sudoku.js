const cv = require('opencv4nodejs');
const Tesseract = require('tesseract.js')

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
        image = image.gaussianBlur(new cv.Size(5, 5), 0)
        image = image.dilate(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3)));
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

        // for (let peak of docCnt) {
        //     result.drawCircle(peak, 5, new Vec3(0, 0, 255));
        // }
        // result.drawLine(docCnt[0], docCnt[1], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[1], docCnt[2], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[2], docCnt[3], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[3], docCnt[0], new Vec3(0, 255, 0));
        // cv.imwrite('2.png', result);

        const size = 300;
        const dst = [
            new cv.Point2(size, 0), 
            new cv.Point2(0, 0), 
            new cv.Point2(0, size), 
            new cv.Point2(size, size)
        ];
        const m = cv.getPerspectiveTransform(docCnt, dst);
        result = result.warpPerspective(m, new cv.Size(size, size));

        const bigGrid = size / this.size;
        const smallGrid = size / this.length;

        // result.drawCircle(new cv.Point2(0, smallGrid * 8), 3, new cv.Vec3(0, 0, 255))

        cv.imwrite('3.png', result);

        const edgeSize = smallGrid / 3;
        const deteSmallGridSize = edgeSize * 2;
        (async () => {
            const worker = Tesseract.createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789',
            });
            let list = [];
            for (let i = 0; i < this.length; i++) {
                for (let j = 0; j < this.length; j++) {
                    const { data: { text } } = await worker.recognize('3.png', {
                        rectangle: { top: edgeSize + deteSmallGridSize * i, left: edgeSize + deteSmallGridSize * j, width: deteSmallGridSize, height: deteSmallGridSize },
                    });
                    list.push(text == '' ? '.' : text);
                }
            }
            console.log(list);
            await worker.terminate();
        })();

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
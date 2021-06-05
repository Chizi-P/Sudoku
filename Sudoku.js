const cv = require('opencv4nodejs');
const Tesseract = require('tesseract.js')
const fs = require('fs');
const { callbackify } = require('util');

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
        let image = cv.imread(imagePath);
        image = image.cvtColor(cv.COLOR_BGR2GRAY);
        let result = image.copy();
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

        let image2 = result.copy();
        for (let peak of docCnt) {
            image2.drawCircle(peak, 5, new cv.Vec3(0, 0, 255));
        }
        image2.drawLine(docCnt[0], docCnt[1], new cv.Vec3(0, 255, 0));
        image2.drawLine(docCnt[1], docCnt[2], new cv.Vec3(0, 255, 0));
        image2.drawLine(docCnt[2], docCnt[3], new cv.Vec3(0, 255, 0));
        image2.drawLine(docCnt[3], docCnt[0], new cv.Vec3(0, 255, 0));
        cv.imwrite('2.png', image2);


        const size = 450;
        const edge = 0;
        const dst = [
            new cv.Point2(size + edge, -edge), 
            new cv.Point2(-edge, -edge), 
            new cv.Point2(-edge, size + edge), 
            new cv.Point2(size + edge, size + edge)
        ];

        const m = cv.getPerspectiveTransform(docCnt, dst);
        result = result.warpPerspective(m, new cv.Size(size, size));

        // 不知道為什麼改圖片後會被轉了90度，所以轉回來
        // result = result.rotate(cv.ROTATE_90_COUNTERCLOCKWISE);

        const bigGrid = size / this.size;
        const smallGrid = size / this.length;

        cv.imwrite('3.png', result);

        let img_Blur = result.medianBlur(3);
        img_Blur = img_Blur.gaussianBlur(new cv.Size(3, 3), 0);

        const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(11, 11));
        const close = img_Blur.morphologyEx(kernel, cv.MORPH_CLOSE);
        const div = img_Blur.hDiv(close);
        result = div.normalize(0, 255, cv.NORM_MINMAX);

        cv.imwrite('4.png', result);

        const edgeSize = smallGrid / 8;
        const deteSmallGridSize = smallGrid - edgeSize * 2;
        const smallGridArea = smallGrid ** 2;


        // test 找數字
        let testImg = result.copy();
        const testImgCnt = testImg.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        // 先全部contour做boundingRect並儲存
        let testImgRects = testImgCnt.map(e => {
            return e.boundingRect();
        });

        // 從點集合中計算矩形
        let rectInGrid = new Array(this.length ** 2);
        for (const i in testImgRects) {
            const rect = testImgRects[i];
            const { x, y, width, height } = rect;
            const area = width * height;
            // 最小的面積是一個魔法數字
            if (area <= smallGridArea && area >= smallGridArea / 12 && width < smallGrid && height < smallGrid) {
                testImg.drawRectangle(
                    new cv.Point2(x, y),
                    new cv.Point2(x + width, y + height)
                );
                
                // 計算每一格與矩形的重疊面積
                let areas = [];
                for (let y = 0; y < size; y += smallGrid) {
                    for (let x = 0; x < size; x += smallGrid) {
                        const { width, height } = rect.and(new cv.Rect(x + edgeSize, y + edgeSize, smallGrid - 2 * edgeSize, smallGrid - 2 * edgeSize));
                        areas.push(width * height);
                    }
                }
                const indexOfMaxArea = areas.indexOf(Math.max(...areas));
                rectInGrid[indexOfMaxArea] = rect;
            }
        }
        
        // 標記數字所在的格子位置
        rectInGrid.forEach((e, i) => {
            testImg.putText(`${i + 1}`, new cv.Point2(e.x, e.y), 1, 1);
        });

        // 把roi數字寫入到文件
        const folderName = 'cropNumImg';
        try {
            const files = fs.readdirSync(folderName);
            for (const file of files) {
                fs.unlink(`${folderName}/${file}`, err => {
                    if (err) throw err;
                });
            }
        } catch(e) {
            if (e.code == 'ENOENT') {
                fs.mkdirSync(folderName);
            }
            throw e;
        }
        rectInGrid.forEach((e, i) => {
            cv.imwrite(`${__dirname}/${folderName}/${i + 1}.png`, result.getRegion(e));
        });

        // 畫每個格子的矩形
        // for (let i = 0; i < this.length; i++) {
        //     for (let j = 0; j < this.length; j++) {
        //         testImg.drawRectangle(
        //             new cv.Point2(edgeSize + smallGrid * i, edgeSize + smallGrid * j), 
        //             new cv.Point2(edgeSize + smallGrid * i + deteSmallGridSize, edgeSize + smallGrid * j + deteSmallGridSize), 
        //             new cv.Vec3(0, 0, 255),
        //         );
        //     }
        // }

        cv.imwrite('5.png', testImg);

        (async () => {
            const worker = Tesseract.createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '123456789',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR
            });
            let list = new Array(this.length ** 2).fill(this.unknowChar);
            for (const i in rectInGrid) {
                const { x, y, width ,height } = rectInGrid[i];
                const { data: { text } } = await worker.recognize(`4.png`, {
                    rectangle: { top: y, left: x, width: width, height: height }
                });
                list[i] = text.trim();
                list[i] = list[i] === '' ? this.unknowChar : list[i];
            }
            await worker.terminate();
            return list;
        })().then(list => {
            console.log('Question:');
            console.table(Sudoku.resize(list, 9));
            this.ans(list);
            this.show();
        });
    }
    static resize(list, l) {
        let result = [];
        let copy = [...list];
        for (let i = 0; i < copy.length; i++) {
            result.push(copy.splice(0, l));
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

let sudoku = new Sudoku();
sudoku.ansFromImg('image.png');

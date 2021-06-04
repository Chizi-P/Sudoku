const cv = require('opencv4nodejs');
const Tesseract = require('tesseract.js')
const fs = require('fs');

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

        // for (let peak of docCnt) {
        //     result.drawCircle(peak, 5, new Vec3(0, 0, 255));
        // }
        // result.drawLine(docCnt[0], docCnt[1], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[1], docCnt[2], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[2], docCnt[3], new Vec3(0, 255, 0));
        // result.drawLine(docCnt[3], docCnt[0], new Vec3(0, 255, 0));
        // cv.imwrite('2.png', result);

        const size = 450;
        const edge = 5;
        const dst = [
            new cv.Point2(size + edge, -edge), 
            new cv.Point2(-edge, -edge), 
            new cv.Point2(-edge, size + edge), 
            new cv.Point2(size + edge, size + edge)
        ];
        const m = cv.getPerspectiveTransform(docCnt, dst);
        result = result.warpPerspective(m, new cv.Size(size, size));

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
        // testImg.drawContours(testImgCnt, new cv.Vec3(0, 0, 255));

        // 先全部contour做boundingRect並儲存
        let testImgRects = testImgCnt.map(e => {
            return e.boundingRect();
        });

        // 從點集合中計算矩形
        let rectInGrid = [];
        for (const i in testImgRects) {
            const rect = testImgRects[i];
            const { x, y, width, height } = rect;
            const area = width * height;
            // 最小的面積是一個魔法數字
            if (area <= smallGridArea && area >= smallGridArea / 12) {
                testImg.drawRectangle(
                    new cv.Point2(x, y),
                    new cv.Point2(x + width, y + height)
                );
                
                // 計算每一格與矩形的重疊面積
                let areas = [];
                for (let y = 0; y < size; y += smallGrid) {
                    for (let x = 0; x < size; x += smallGrid) {
                        const { width, height } = rect.and(new cv.Rect(x, y, smallGrid, smallGrid));
                        areas.push(width * height);
                    }
                }
                const indexOfMaxArea = areas.indexOf(Math.max(...areas));
                rectInGrid[indexOfMaxArea] = rect;
            } else {
                // 刪除太大太小的矩形(沒必要)
                delete testImgRects[i];
            }
        }
        console.log('g', rectInGrid)
        // testImg.crop(rectInGrid[0]);
        
        // 標記數字所在的格子位置
        rectInGrid.forEach((e, i) => {
            testImg.putText(`${i + 1}`, new cv.Point2(e.x, e.y), 1, 1);
        });

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
        }
        // 把roi數字寫入到文件
        rectInGrid.forEach((e, i) => {
            cv.imwrite(`${__dirname}/${folderName}/${i}.png`, result.getRegion(e));
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
                tessedit_char_whitelist: '0123456789',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_CHAR
            });
            let list = [];
            rectInGrid.forEach((e, i) => {
                const { data: { text }} = await worker.recognize(`4.png`, {
                    rectangle: { top: e.y, left: e.x, width: e.width, height: e.height }
                });
                list[i] = text.trim();
            });

            // for (let i = 0; i < this.length; i++) {
            //     for (let j = 0; j < this.length; j++) {
            //         const { data: { text } } = await worker.recognize('.png', {
            //             rectangle: { top: edgeSize + smallGrid * i, left: edgeSize + smallGrid * j, width: deteSmallGridSize, height: deteSmallGridSize },
            //         });
            //         list.push(text == '' ? '.' : text.trim());
            //     }
            // }
            console.log(list);
            console.table(Sudoku.resize(list, 9));
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
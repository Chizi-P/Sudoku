# Sudoku

``` Javascript
let sudoku = new Sudoku();
sudoku.ansFromImg('image.png');
```

#### image.png:

![image](https://raw.githubusercontent.com/Chizi-P/Sudoku/main/image.png)

#### 矯正:

![image](https://raw.githubusercontent.com/Chizi-P/Sudoku/main/3.png)

#### 提取對應位置數字:

![image](https://raw.githubusercontent.com/Chizi-P/Sudoku/main/5.png)

#### 輸出:
``` 
Question:
┌─────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ (index) │  0  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │
├─────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│    0    │ '.' │ '.' │ '.' │ '6' │ '.' │ '4' │ '7' │ '.' │ '.' │
│    1    │ '7' │ '.' │ '6' │ '.' │ '.' │ '.' │ '.' │ '.' │ '9' │
│    2    │ '.' │ '.' │ '.' │ '.' │ '.' │ '5' │ '.' │ '8' │ '.' │
│    3    │ '.' │ '7' │ '.' │ '.' │ '2' │ '.' │ '.' │ '9' │ '3' │
│    4    │ '8' │ '.' │ '.' │ '.' │ '.' │ '.' │ '.' │ '.' │ '5' │
│    5    │ '4' │ '3' │ '.' │ '.' │ '1' │ '.' │ '.' │ '7' │ '.' │
│    6    │ '.' │ '5' │ '.' │ '2' │ '.' │ '.' │ '.' │ '.' │ '.' │
│    7    │ '3' │ '.' │ '.' │ '.' │ '.' │ '.' │ '2' │ '.' │ '8' │
│    8    │ '.' │ '.' │ '2' │ '3' │ '.' │ '1' │ '.' │ '.' │ '.' │
└─────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
Answer:
┌─────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ (index) │  0  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │
├─────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│    0    │ '1' │ '8' │ '3' │ '6' │ '9' │ '4' │ '7' │ '5' │ '2' │
│    1    │ '7' │ '1' │ '6' │ '4' │ '3' │ '8' │ '5' │ '2' │ '9' │
│    2    │ '2' │ '4' │ '7' │ '9' │ '6' │ '5' │ '3' │ '8' │ '1' │
│    3    │ '5' │ '7' │ '4' │ '8' │ '2' │ '6' │ '1' │ '9' │ '3' │
│    4    │ '8' │ '2' │ '9' │ '1' │ '7' │ '3' │ '4' │ '6' │ '5' │
│    5    │ '4' │ '3' │ '8' │ '5' │ '1' │ '2' │ '9' │ '7' │ '6' │
│    6    │ '9' │ '5' │ '1' │ '2' │ '8' │ '7' │ '6' │ '3' │ '4' │
│    7    │ '3' │ '6' │ '5' │ '7' │ '4' │ '9' │ '2' │ '1' │ '8' │
│    8    │ '6' │ '9' │ '2' │ '3' │ '5' │ '1' │ '8' │ '4' │ '7' │
└─────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

let canvas = document.getElementById("canvas");
canvas.width = 560;
canvas.height = 480;
let ctx = canvas.getContext("2d");

/*Monte Carlo Tree Search*/
function value(self) {
  return self.valueSum / self.visitCount;
}

function node(prior, newState) {
  let self = {};
  self.prior = prior; // prior probability of selecting state from parent

  self.children = []; // legal children
  self.visitCount = 0;
  self.valueSum = 0; // total val from all visits
  self.state = newState; // state
  self.value = -1;
  return self;
}

function expandNode(self, getLegalMoves) {
  //find all legal actions
  let opts = getLegalMoves(self.state);
  let cnt = opts.length;

  for(let i = 0; i < opts.length; i++) {
    self.children.push(node(1 / cnt, opts[i]));
  }
}

function ucbMCTS(parent, child) {
  let prior = child.prior * Math.sqrt(parent.visitCount) / (child.visitCount + 1);
  let valueScore = 0;
  if(child.visitCount > 0) {
    valueScore = value(child);
  }

  return valueScore + prior;
}

function selectChild(self, ucb) {
  //selects child w/ best ucb score (or first)
  let best = 0;
  let bestScore = -Infinity;
  for(let i = self.children.length - 1; i >= 0; i--) {
    if(self.children[i].visitCount === 0) {
      return self.children[i];
    }
    let score = ucb(self, self.children[i]);
    if(score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return self.children[best];
}

function backup(searchPath, value) {
  let v = value;
  //for(let i = searchPath.length - 1; i >= 0; i--) {
  for(let i = 0; i < searchPath.length; i++) {
    searchPath[i].valueSum += v;
    v = 1 - v;
    searchPath[i].visitCount++;
  }
}

/**
 * perform a mcts search
 * @param  {number}   numSimulations          states to visit
 * @param  {object}   state                   starting state
 * @param  {function} evaluationFunction      function to score state (0-1)
 * @param  {function} getLegalMoves           function to getLegalMoves
 * @param  {function} ucb                     ucb function
 * @return {number}                           best state
 */
function mcts(numSimulations, state, evaluationFunction, getLegalMoves, ucb = ucbMCTS) {
  let sc = 0;
  let root = node(1);

  root.state = state;

  for(let i = numSimulations; i > 0; i--) {
    sc++;
    let currentNode = root;
    let searchPath = [currentNode];
    while(currentNode && currentNode.visitCount) {
      currentNode = selectChild(currentNode, ucb);
      if(currentNode) {
        searchPath.unshift(currentNode);
      }
    }
    if(currentNode) {
      let value = evaluationFunction(currentNode.state);

      currentNode.value = value;

      expandNode(currentNode, getLegalMoves);
      backup(searchPath, value);
    } else {
      let val = searchPath[0].value;
      searchPath[0].valueSum += val;
      searchPath[0].visitCount++;
      searchPath.shift();

      backup(searchPath, 1 - val);
    }
  }

  let best = 0;
  let choice = 0;

  for(let i = 0; i < root.children.length; i++) {
    if(root.children[i].visitCount > best) {
      best = root.children[i].visitCount;
      choice = i;
    }
  }

  return root.children[choice].state;
}

/*Connect 4*/
let game = {
  width: 7,
  height: 6
};
/*events*/
let mouseIsPressed = false;
let mouse = {
  x: -1,
  y: 0
};
/*useable functions*/
ctx.textAlign = "center";
ctx.lineCap = "round";
ctx.lineWidth = 20;
let turn = 1,
  board = [];
//returns how many points player 1 or 2 has
function win(Board, draw) {
  let max = 0;
  let on = 0;
  for(let i = 0; i < game.width; i++) {
    max = 0;
    on = 0;
    for(let j = 0; j < game.height; j++) {
      if(Board[i][j]) {
        if(on === Board[i][j]) {
          max++;
          if(max >= 4 && on !== 0) {
            if(draw) {
              ctx.moveTo(40 + i * 80, 40 + j * 80);
              ctx.lineTo(40 + i * 80, 40 + (j - 3) * 80);
              ctx.stroke();
            }
            return Board[i][j];
          }
        } else {
          max = 1;
          on = Board[i][j];
        }
      }
    }
  }
  for(let j = 0; j < game.height; j++) {
    max = 0;
    on = 0;
    for(let i = 0; i < game.width; i++) {
      if(Board[i][j]) {
        if(on === Board[i][j]) {
          max++;
          if(max >= 4 && on !== 0) {
            if(draw) {
              ctx.moveTo(40 + i * 80, 40 + j * 80);
              ctx.lineTo(40 + (i - 3) * 80, 40 + j * 80);
              ctx.stroke();
            }
            return Board[i][j];
          }
        } else {
          max = 1;
          on = Board[i][j];
        }
      } else {
        on = 0;
        max = 0;
      }
    }
  }
  for(let i = 0; i < game.width - 3; i++) {
    for(let j = 0; j < game.height - 3; j++) {
      if(
        Board[i][j] !== 0 &&
        Board[i][j] === Board[i + 1][j + 1] &&
        Board[i][j] === Board[i + 2][j + 2] &&
        Board[i][j] === Board[i + 3][j + 3]
      ) {
        if(draw) {
          ctx.moveTo(40 + i * 80, 40 + j * 80);
          ctx.lineTo(40 + (i + 3) * 80, 40 + (j + 3) * 80);
          ctx.stroke();
        }
        return Board[i][j];
      }
      if(
        Board[i + 3][j] !== 0 &&
        Board[i + 3][j] === Board[i + 2][j + 1] &&
        Board[i + 3][j] === Board[i + 1][j + 2] &&
        Board[i + 3][j] === Board[i][j + 3]
      ) {
        if(draw) {
          ctx.moveTo(40 + (i + 3) * 80, 40 + j * 80);
          ctx.lineTo(40 + i * 80, 40 + (j + 3) * 80);
          ctx.stroke();
        }
        return Board[i + 3][j];
      }
    }
  }
  let dead = 0;
  for(let i = 0; i < game.width; i++) {
    if(Board[i][0] !== 0) {
      dead++;
    }
  }
  if(dead === game.width) {
    return 3;
  }
  return 0;
}
//checks if a cordinate is a legal move and returns board or false
function lookAtNextMove(Board, move, player) {
  let Move = function(Board, a, player) {
    if(a !== 0 && !a) {
      return;
    }
    if(Board[a][0] === 0 && a === Math.floor(a)) {
      let at = game.height - 1;
      while(Board[a][at] !== 0) {
        at--;
      }
      Board[a][at] = player;
    }
  };
  let newBoard = [];
  for(let i = 0; i < game.width; i++) {
    newBoard.push([]);
    for(let j = 0; j < game.height; j++) {
      newBoard[i].push(Board[i][j]);
    }
  }
  Move(newBoard, move, player);
  return newBoard;
}
//returns a new board after a given move on a provided board
/*AI*/
let level = [5, 5, 5];
let memory = [-1, -1, -1];

function AI(board, player) {
  if(memory[player] === -1) {
    memory[player] = [
      function(board, player) {
        let p = 0;
        let o = 0;
        let max = 0;
        let on = 0;
        let sav = 0;
        for(let i = 0; i < game.width; i++) {
          max = 0;
          on = 0;
          let j = 0;
          for(; j < game.height; j++) {
            if(board[i][j]) {
              j += game.height;
            }
          }
          j -= game.height;
          if(j) {
            j--;
            let scr = 0;
            let cur = board[i][j];
            while(board[i][j] === cur) {
              j++;
              scr++;
            }
            if(cur === player) {
              p += scr;
            } else {
              o += scr;
            }
          }
        }
        for(let j = 0; j < game.height; j++) {
          max = 0;
          on = 0;
          sav = 0;
          for(let i = 0; i < game.width; i++) {
            if(board[i][j]) {
              if(on === board[i][j]) {
                max++;
                if(max >= 4 && on !== 0) {
                  if(on === player) {
                    p += 2 + sav;
                  } else {
                    o += 2 + sav;
                  }
                  sav = 0;
                }
                sav++;
              } else {
                if(on === 0) {
                  on = board[i][j];
                  max++;
                } else {
                  max = 1;
                  on = board[i][j];
                }
              }
            } else {
              max++;
              if(on === 0) {
                sav++;
              } else {
                if(max >= 4) {
                  if(on === player) {
                    p += 2 + sav;
                  } else {
                    o += 2 + sav;
                  }
                  sav = 0;
                }
              }
            }
          }
        }
        for(let i = 0; i < game.width - 3; i++) {
          for(let j = 0; j < game.height - 3; j++) {
            sav = 0;
            on = 0;
            max = true;
            for(let k = 0; k < 4; k++) {
              if(board[i + k][j + k]) {
                sav++;
                if(on === 0) {
                  on = board[i + k][j + k];
                } else if(on !== board[i + k][j + k]) {
                  max = false;
                }
              }
            }
            if(max) {
              if(on === player) {
                p += sav;
              } else {
                o += sav;
              }
            }
            sav = 0;
            on = 0;
            max = true;
            for(let k = 0; k < 4; k++) {
              if(board[i + 3 - k][j + k]) {
                sav++;
                if(on === 0) {
                  on = board[i + 3 - k][j + k];
                } else if(on !== board[i + 3 - k][j + k]) {
                  max = false;
                }
              }
            }
            if(max) {
              if(on === player) {
                p += sav;
              } else {
                o += sav;
              }
            }
          }
        }
        return p - o;
      },
      function(on) {
        if(!Array.isArray(on) || on.length !== 5) {
          while(
            !Array.isArray(memory[player][2][memory[player][3]]) ||
            memory[player][2][memory[player][3]].length !== 5
          ) {
            if(memory[player][3] <= 0) {
              return "DONE";
            }
            memory[player][3]--;
          }
          return;
        }
        if(on[4] === -1) {
          let W = win(on[0]);
          if(W) {
            if(W === player) {
              if(on[1] !== player && on[2] > 1) {
                memory[player][2][memory[player][3]] = 100;
                while(
                  !Array.isArray(
                    memory[player][2][memory[player][2].length - 1]
                  )
                ) {
                  memory[player][2].pop();
                }
                memory[player][3] = memory[player][2].length - 1;
              }
              memory[player][2][memory[player][3]] = 100 + 1 / on[2];
              memory[player][3]--;
              return;
            }
            if(on[1] === player && on[2] > 1) {
              memory[player][2][memory[player][3]] = -100;
              while(
                !Array.isArray(memory[player][2][memory[player][2].length - 1])
              ) {
                memory[player][2].pop();
              }
              memory[player][3] = memory[player][2].length - 1;
            }
            memory[player][2][memory[player][3]] = -100 - 1 / on[2];
            memory[player][3]--;
            return;
          }
          if(on[2] >= on[3]) {
            memory[player][2][memory[player][3]] = memory[player][0](
              on[0],
              player
            );
            memory[player][3]--;
            return;
          }
        }
        if(on[4] < 0) {
          if(on[0][-on[4] - 1][0] === 0) {
            memory[player][2].push([
              lookAtNextMove(on[0], -on[4] - 1, on[1]),
              -(on[1] - 3),
              on[2] + 1,
              on[3],
              -1
            ]);
          } else {
            memory[player][2].push("N/A");
            memory[player][2][memory[player][3]][4]--;
            if(memory[player][2][memory[player][3]][4] <= -game.width - 1) {
              memory[player][2][memory[player][3]][4] = 0;
            }
            return;
          }
          memory[player][2][memory[player][3]][4]--;
          if(memory[player][2][memory[player][3]][4] <= -game.width - 1) {
            memory[player][2][memory[player][3]][4] = 0;
          }
          memory[player][3] = memory[player][2].length - 1;
          return;
        } else {
          let best = [-Infinity, game.width - 1];
          if(on[1] === player) {
            for(let i = game.width; i > 0; i--) {
              if(on[0][i - 1][0] === 0) {
                let score = memory[player][2][memory[player][3] + i];
                if(score > best[0]) {
                  best = [score, i];
                }
              }
              memory[player][2].pop();
            }
          } else {
            best = [Infinity, game.width - 1];
            for(let i = game.width; i > 0; i--) {
              if(on[0][i - 1][0] === 0) {
                let score = memory[player][2][memory[player][3] + i];
                if(score < best[0]) {
                  best = [score, i];
                }
              }
              memory[player][2].pop();
            }
          }
          if(on[2] === 0) {
            memory[player][2][memory[player][3]] = best[1] - 1;
            return "DONE";
          }
          if(best[0] === 100 && on[1] !== player && on[2] > 1) {
            memory[player][2][memory[player][3]] = 100;
            while(
              !Array.isArray(memory[player][2][memory[player][2].length - 1])
            ) {
              memory[player][2].pop();
            }
            memory[player][3] = memory[player][2].length - 1;
          } else if(best[0] === -100 && on[1] === player && on[2] > 1) {
            memory[player][2][memory[player][3]] = -100;
            while(
              !Array.isArray(memory[player][2][memory[player][2].length - 1])
            ) {
              memory[player][2].pop();
            }
            memory[player][3] = memory[player][2].length - 1;
          }
          memory[player][2][memory[player][3]] = best[0];
          memory[player][3]--;
          return;
        }
      },
      -1,
      0
    ];
  }
  if(memory[player][2] === -1) {
    memory[player][2] = [
      [board, player, 0, level[player], -1]
    ];
    memory[player][3] = 0;
  }
  for(let i = 100000; i > 0; i--) {
    if(memory[player][1](memory[player][2][memory[player][3]]) === "DONE") {
      i = 0;
    }
  }
  if(memory[player][2].length === 1) {
    if(!Array.isArray(memory[player][2][0])) {
      let ans = memory[player][2][0];
      memory[player][2] = -1;
      return ans;
    }
  }
}

/*mcts ai*/
function getLegalMoves(state) {
  if(win(state[0])) {
    return [];
  }
  let moves = [];
  for(let i = 0; i < board.length; i++) {
    let newBoard = lookAtNextMove(state[0], i, state[1]);
    if(newBoard && state[0][i][0] === 0) {
      moves.push([newBoard, Math.abs(state[1] - 3), i]);
    }
  }
  return moves;
}

function evaluationFunction(state) {
  let board = state[0];
  let player = state[1];
  let won = win(board, false);
  if(won) {
    return won === state[1] ? 0 : 1;
  }

  let p = 0;
  let o = 0;
  let max = 0;
  let on = 0;
  let sav = 0;
  for(let i = 0; i < game.width; i++) {
    max = 0;
    on = 0;
    let j = 0;
    for(; j < game.height; j++) {
      if(board[i][j]) {
        j += game.height;
      }
    }
    j -= game.height;
    if(j) {
      j--;
      let scr = 0;
      let cur = board[i][j];
      while(board[i][j] === cur) {
        j++;
        scr++;
      }
      if(cur === player) {
        p += scr;
      } else {
        o += scr;
      }
    }
  }
  for(let j = 0; j < game.height; j++) {
    max = 0;
    on = 0;
    sav = 0;
    for(let i = 0; i < game.width; i++) {
      if(board[i][j]) {
        if(on === board[i][j]) {
          max++;
          if(max >= 4 && on !== 0) {
            if(on === player) {
              p += 2 + sav;
            } else {
              o += 2 + sav;
            }
            sav = 0;
          }
          sav++;
        } else {
          if(on === 0) {
            on = board[i][j];
            max++;
          } else {
            max = 1;
            on = board[i][j];
          }
        }
      } else {
        max++;
        if(on === 0) {
          sav++;
        } else {
          if(max >= 4) {
            if(on === player) {
              p += 2 + sav;
            } else {
              o += 2 + sav;
            }
            sav = 0;
          }
        }
      }
    }
  }
  for(let i = 0; i < game.width - 3; i++) {
    for(let j = 0; j < game.height - 3; j++) {
      sav = 0;
      on = 0;
      max = true;
      for(let k = 0; k < 4; k++) {
        if(board[i + k][j + k]) {
          sav++;
          if(on === 0) {
            on = board[i + k][j + k];
          } else if(on !== board[i + k][j + k]) {
            max = false;
          }
        }
      }
      if(max) {
        if(on === player) {
          p += sav;
        } else {
          o += sav;
        }
      }
      sav = 0;
      on = 0;
      max = true;
      for(let k = 0; k < 4; k++) {
        if(board[i + 3 - k][j + k]) {
          sav++;
          if(on === 0) {
            on = board[i + 3 - k][j + k];
          } else if(on !== board[i + 3 - k][j + k]) {
            max = false;
          }
        }
      }
      if(max) {
        if(on === player) {
          p += sav;
        } else {
          o += sav;
        }
      }
    }
  }
  return (o - p) / 100 + 0.5;
}

function mctsAI(board, player) {
  let mv = mcts(10000, [board, player], evaluationFunction, getLegalMoves);
  return mv[2];
}

function mctsAI2(board, player) {
  let mv = mcts(100000, [board, player], evaluationFunction, getLegalMoves);
  return mv[2];
}
let okay = true;

function human(board, player) {
  ctx.fillStyle = "rgba(220,220,0,0.5)";
  if(player === 1) {
    ctx.fillStyle = "rgba(255,0,0,0.5)";
  }
  canvas.style.cursor = "pointer";
  let at = game.height - 1;
  while(Math.floor(mouse.x / 80) >= 0 && board[Math.floor(mouse.x / 80)][at] !== 0 && at >= 0) {
    at--;
  }
  ctx.beginPath();
  ctx.arc(Math.floor(mouse.x / 80) * 80 + 40, at * 80 + 40, 35, 0, Math.PI * 2);
  ctx.fill();
  if(mouseIsPressed && okay) {
    okay = false;
    return Math.floor(mouse.x / 80);
  }
}
/*players*/
let Red = [human, "You"]; //AI,name
let Yellow = [human, "You"]; //AI,name
/*letriables*/
for(let i = 0; i < game.width; i++) {
  board.push([]);
  for(let j = 0; j < game.height; j++) {
    board[i].push(0);
  }
}
/*functions*/
function move(a) {
  if(a !== 0 && !a) {
    return;
  }
  if(a >= 0 && board[a][0] === 0 && a === Math.floor(a)) {
    let at = game.height - 1;
    while(board[a][at] !== 0) {
      at--;
    }
    board[a][at] = turn;
    turn++;
    if(turn > 2) {
      turn = 1;
    }
  }
}

function clear() {
  memory = [-1, -1, -1];
  board = [];
  for(let i = 0; i < game.width; i++) {
    board.push([]);
    for(let j = 0; j < game.height; j++) {
      board[i].push(0);
    }
  }
  turn = 1;
  ctx.textAlign = "center";
  ctx.lineCap = "round";
  ctx.lineWidth = 20;
}
/*draw*/
function draw() {
  canvas.style.cursor = "wait";
  /*board*/
  ctx.noStroke = true;
  ctx.textSize = 35;
  ctx.fillStyle = "rgb(0,122,255)";
  ctx.fillRect(0, 0, game.width * 80, game.height * 80);
  for(let i = 0; i < game.width; i++) {
    for(let j = 0; j < game.height; j++) {
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.beginPath();
      ctx.arc(40 + i * 80, 40 + j * 80, 35, 0, Math.PI * 2);
      if(board[i][j] === 1) {
        ctx.fillStyle = "rgb(255,0,0)";
      }
      if(board[i][j] === 2) {
        ctx.fillStyle = "rgb(220,220,0)";
      }
      ctx.fill();
    }
  }
  /*play*/
  ctx.strokeStyle = "rgb(0,200,50)";
  ctx.beginPath();
  if(win(board, true)) {
    canvas.style.cursor = "pointer";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, game.height * 40 - 30, game.width * 80, 60);
    let winner = Red[1];
    ctx.fillStyle = "rgb(255,0,0)";
    if(win(board) === 2) {
      ctx.fillStyle = "rgb(220,220,0)";
      winner = Yellow[1];
    } else if(win(board) === 3) {
      ctx.fillStyle = "rgb(50,180,200)";
      winner = "Nobody";
    }
    ctx.font = "40px Arial";
    ctx.fillText(winner + " won!", game.width * 40, game.height * 40 + 10);
  } else {
    let temp = [];
    for(let i = 0; i < board.length; i++) {
      temp.push([]);
      for(let j = 0; j < board[i].length; j++) {
        temp[i].push(board[i][j]);
      }
    }
    if(turn === 1) {
      move(Red[0](temp, 1));
    } else {
      move(Yellow[0](temp, 2));
    }
  }
}
/*events*/
function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}
canvas.addEventListener(
  "mousemove",
  function(evt) {
    mouse = getMousePos(canvas, evt);
  },
  false
);
canvas.addEventListener(
  "mousedown",
  function() {
    mouseIsPressed = true;
    okay = true;
    if(win(board)) {
      okay = false;
      clear();
    }
  },
  false
);
canvas.addEventListener(
  "mouseup",
  function() {
    mouseIsPressed = false;
  },
  false
);
canvas.addEventListener(
  "mouseout",
  function() {
    mouse = {
      x: -1,
      y: 0
    };
  },
  false
);
let P1 = document.getElementById("p1");
let P2 = document.getElementById("p2");
let maxai = document.getElementById("max ai");

function p1() {
  clear();
  let v = P1.value;
  if(v === "Human") {
    Red = [human, "You"];
  } else if(v === "MCTS") {
    Red = [mctsAI, "The AI"];
  } else if(v === "MCTS2") {
    Red = [mctsAI2, "The AI"];
  } else {
    Red = [AI, "The AI"];
    level[1] = eval(v) + 2;
  }
}

function p2() {
  clear();
  let v = P2.value;
  if(v === "Human") {
    Yellow = [human, "You"];
  } else if(v === "MCTS") {
    Yellow = [mctsAI, "The AI"];
  } else if(v === "MCTS2") {
    Yellow = [mctsAI2, "The AI"];
  } else {
    Yellow = [AI, "The AI"];
    level[2] = eval(v) + 2;
  }
}
P2.value = "MCTS";
p2();
let Wth = document.getElementById("width");
let Hht = document.getElementById("height");

function changeWidth() {
  if(Wth.value < 4) {
    Wth.value = 4;
  }
  canvas.width = Math.floor(Wth.value) * 80;
  game.width = Math.floor(Wth.value);
  clear();
}

function changeHeight() {
  if(Hht.value < 2) {
    Hht.value = 2;
  }
  canvas.height = Math.floor(Hht.value) * 80;
  game.height = Math.floor(Hht.value);
  clear();
}

function maxAI() {
  if(maxai.value > 8) {
    //try{
    if(!confirm("AI greater than 8 could take an hour or longer to calculate.")) {
      maxai.value = 8;
      return;
    }
    //}catch(e){};
  }
  let temp = "<option value=\"Human\">Human</option><option value=\"MCTS\">MCTS</option><option value=\"MCTS2\">MCTS2</option>";
  for(let i = 1; i <= maxai.value; i++) {
    temp += "<option value=\"" + i + "\">AI " + i + "</option>";
  }
  let temp2 = ["Human", "Human"];
  if(P1.value !== "Human" && eval(P1.value) <= maxai.value) {
    temp2[0] = P1.value;
  }
  if(P2.value !== "Human" && eval(P2.value) <= maxai.value) {
    temp2[1] = P2.value;
  }
  P1.innerHTML = temp;
  P2.innerHTML = temp;
  P1.value = temp2[0];
  P2.value = temp2[1];
  p1();
  p2();
};
setInterval(draw, 0);

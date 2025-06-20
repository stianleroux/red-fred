/* eslint-disable no-undef */
class MarsGrid {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    //business logic
    this.maxSize = 50;
    this.cellSize = 0;
    
    this.offsetX = 0;
    this.offsetY = 0;

    this.gridWidth = 0;
    this.gridHeight = 0;
  }

  initialize(width, height) {
    if (width > this.maxSize || height > this.maxSize) {
      throw new Error(`Grid size cannot exceed ${this.maxSize}x${this.maxSize}.`);
    }

    this.gridWidth = width;
    this.gridHeight = height;

    // Calculate cell size and offset to center the grid
    this.cellSize = Math.min(
      (this.canvas.width - 40) / (width + 1),
      (this.canvas.height - 40) / (height + 1)
    );
    this.offsetX = (this.canvas.width - this.cellSize * (width + 1)) / 2;
    this.offsetY = (this.canvas.height - this.cellSize * (height + 1)) / 2;

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    for (let x = 0; x <= this.gridWidth + 1; x++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX + x * this.cellSize, this.offsetY);
      ctx.lineTo(this.offsetX + x * this.cellSize, this.offsetY + (this.gridHeight + 1) * this.cellSize);
      ctx.stroke();
    }

    for (let y = 0; y <= this.gridHeight + 1; y++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.offsetY + y * this.cellSize);
      ctx.lineTo(this.offsetX + (this.gridWidth + 1) * this.cellSize, this.offsetY + y * this.cellSize);
      ctx.stroke();
    }

    // Draw coordinates
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    for (let x = 0; x <= this.gridWidth; x++) {
      for (let y = 0; y <= this.gridHeight; y++) {
        ctx.fillText(
          `${x},${y}`,
          this.offsetX + x * this.cellSize + 5,
          this.offsetY + (this.gridHeight - y + 1) * this.cellSize - 5
        );
      }
    }
  }

  drawRobot(x, y, direction, isLost = false) {
    const ctx = this.ctx;
    const centerX = this.offsetX + x * this.cellSize + this.cellSize / 2;
    const centerY = this.offsetY + (this.gridHeight - y) * this.cellSize + this.cellSize / 2;
    const size = this.cellSize * 0.4;

    // Draw robot body
    ctx.fillStyle = isLost ? 'rgba(255, 0, 0, 0.5)' : '#4CAF50';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw direction indicator
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    let angle = {
      'N': -Math.PI/2,
      'E': 0,
      'S': Math.PI/2,
      'W': Math.PI
    }[direction];
    ctx.lineTo(
      centerX + Math.cos(angle) * size,
      centerY + Math.sin(angle) * size
    );
    ctx.stroke();

    ///part of the requirements 
    if (isLost) {
      // Draw X for lost robots
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      const xSize = size * 0.7;
      ctx.beginPath();
      ctx.moveTo(centerX - xSize, centerY - xSize);
      ctx.lineTo(centerX + xSize, centerY + xSize);
      ctx.moveTo(centerX + xSize, centerY - xSize);
      ctx.lineTo(centerX - xSize, centerY + xSize);
      ctx.stroke();
    }
  }

  drawScent(x, y) {
    const ctx = this.ctx;
    const centerX = this.offsetX + x * this.cellSize + this.cellSize / 2;
    const centerY = this.offsetY + (this.gridHeight - y) * this.cellSize + this.cellSize / 2;
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.cellSize * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize the simulation
let grid = null;
let currentSimulation = null;

if (typeof document !== 'undefined') {
  document.getElementById('initBtn')?.addEventListener('click', () => {
    const inputEl = document.getElementById('inputArea');
    const errorEl = document.getElementById('inputError');
    const input = document.getElementById('inputArea')?.value || '';

    //call validate for issues
    try {
      validateInput(input);
    } catch (err) {
      console.error(err);
      errorEl.textContent = `${err.message}${err.line !== undefined ? ` (Line ${err.line + 1})` : ''}`;
      errorEl.classList.remove('hidden');

      // Optional: highlight the line in the textarea
      highlightLine(inputEl, err.line);
    }
    const canvas = document.getElementById('marsGrid');
    const outputEl = document.getElementById('outputArea');

    try {
      // Parse first line for grid size
      const lines = input.trim().split('\n');
      const [width, height] = lines[0].split(' ').map(Number);
      
      // Initialize grid
      grid = new MarsGrid(canvas);
      grid.initialize(width, height);
      
      // Enable simulation controls
      document.getElementById('simulateBtn').disabled = false;
      document.getElementById('stepBtn').disabled = false;
      document.getElementById('resetBtn').disabled = false;
      
      // Store simulation data
      currentSimulation = {
        width,
        height,
        commands: [],
        currentRobot: 0,
        scents: new Set(),
        results: []
      };

      // Parse robot commands
      for (let i = 1; i < lines.length; i += 2) {
        const [x, y, dir] = lines[i].split(' ');
        const instructions = lines[i + 1];
        currentSimulation.commands.push({
          x: parseInt(x),
          y: parseInt(y),
          direction: dir,
          instructions,
          currentStep: 0
        });
      }

      outputEl.textContent = 'Grid initialized. Click "Start Simulation" or "Step" to begin.';
    } catch (e) {
      outputEl.textContent = 'Error initializing grid: ' + e.message;
      console.error(e);
    }
  });
}

// Simulate one step
function simulateStep() {
  if (!currentSimulation || !grid) return false;

  const robot = currentSimulation.commands[currentSimulation.currentRobot];
  if (!robot) return false;

  // Clear previous state
  grid.draw();
  
  // Draw all scents
  currentSimulation.scents.forEach(scent => {
    const [x, y] = scent.split(',').map(Number);
    grid.drawScent(x, y);
  });
  
  // Draw all previous results
  currentSimulation.results.forEach(result => {
    const [x, y, dir, lost] = result.split(' ');
    grid.drawRobot(parseInt(x), parseInt(y), dir, lost === 'LOST');
  });

  // Process current instruction
  if (robot.currentStep < robot.instructions.length) {
    const instruction = robot.instructions[robot.currentStep];
    processInstruction(robot, instruction, currentSimulation);
    robot.currentStep++;
    
    // Draw current robot
    grid.drawRobot(robot.x, robot.y, robot.direction);
    return true;
  } else {
    // Robot finished its instructions
    const result = `${robot.x} ${robot.y} ${robot.direction}${robot.lost ? ' LOST' : ''}`;
    currentSimulation.results.push(result);
    currentSimulation.currentRobot++;
    
    // Update output
    document.getElementById('outputArea').textContent = 
      currentSimulation.results.join('\n');
    
    // Return true if there are more robots to process
    return currentSimulation.currentRobot < currentSimulation.commands.length;
  }
}

function processInstruction(robot, instruction, simulation) {
  if (robot.lost) return;

  const directions = ['N', 'E', 'S', 'W'];
  let dirIndex = directions.indexOf(robot.direction);

  if (instruction === 'L') {
    dirIndex = (dirIndex + 3) % 4;
    robot.direction = directions[dirIndex];
  } else if (instruction === 'R') {
    dirIndex = (dirIndex + 1) % 4;
    robot.direction = directions[dirIndex];
  } else if (instruction === 'F') {
    const [newX, newY] = getNextPosition(robot);
    
    // Check if moving would cause robot to be lost
    if (isOffGrid(newX, newY, simulation.width, simulation.height)) {
      const scentKey = `${robot.x},${robot.y}`;
      if (!simulation.scents.has(scentKey)) {
        simulation.scents.add(scentKey);
        robot.lost = true;
      }
    } else {
      robot.x = newX;
      robot.y = newY;
    }
  }
}

function getNextPosition(robot) {
  const moves = {
    'N': [0, 1],
    'E': [1, 0],
    'S': [0, -1],
    'W': [-1, 0]
  };
  const [dx, dy] = moves[robot.direction];
  return [robot.x + dx, robot.y + dy];
}

function isOffGrid(x, y, width, height) {
  return x < 0 || y < 0 || x > width || y > height;
}

function validateInput(input) {
  const lines = input.trim().split('\n').map(line => line.trim());

  if (lines.length < 3 || (lines.length - 1) % 2 !== 0) {
    throw { message: 'Input must start with grid size and then pairs of lines per robot.', line: 0 };
  }

  const gridMatch = lines[0].match(/^(\d+)\s+(\d+)$/);
  if (!gridMatch) throw { message: 'Invalid grid size line.', line: 0 };

  const gridX = parseInt(gridMatch[1], 10);
  const gridY = parseInt(gridMatch[2], 10);
  if (gridX > 50 || gridY > 50) throw { message: 'Grid size cannot exceed 50x50.', line: 0 };

  for (let i = 1; i < lines.length; i += 2) {
    const robotLine = lines[i];
    const commandLine = lines[i + 1];

    if (!robotLine.match(/^\d+\s+\d+\s+[NESW]$/)) {
      throw { message: 'Invalid robot position.', line: i };
    }

    if (!commandLine.match(/^[LRF]{1,100}$/)) {
      throw { message: 'Invalid instruction string. Only L, R, F allowed.', line: i + 1 };
    }
  }

  return true;
}

function highlightLine(textarea, lineNumber) {
  if (typeof lineNumber !== 'number') return;

  const lines = textarea.value.split('\n');
  let start = 0;

  for (let i = 0; i < lineNumber; i++) {
    start += lines[i].length + 1; // +1 for newline
  }

  const end = start + lines[lineNumber].length;

  textarea.focus();
  textarea.setSelectionRange(start, end);
}

// Add event listeners for simulation controls
document.getElementById('simulateBtn')?.addEventListener('click', async () => {
  const button = document.getElementById('simulateBtn');
  const stepButton = document.getElementById('stepBtn');
  
  if (button.textContent === 'Start Simulation') {
    button.textContent = 'Pause';
    stepButton.disabled = true;
    
    while (button.textContent === 'Pause') {
      const hasMore = simulateStep();
      if (!hasMore) {
        button.textContent = 'Start Simulation';
        button.disabled = true;
        stepButton.disabled = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    button.textContent = 'Start Simulation';
    stepButton.disabled = false;
  }
});

document.getElementById('stepBtn')?.addEventListener('click', () => {
  const hasMore = simulateStep();
  if (!hasMore) {
    document.getElementById('simulateBtn').disabled = true;
    document.getElementById('stepBtn').disabled = true;
  }
});

document.getElementById('resetBtn')?.addEventListener('click', async () => {
  location.reload();
});

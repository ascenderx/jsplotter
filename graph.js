'use strict';

const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const txtInput = document.getElementById('txtInput');
const btEval   = document.getElementById('btEval');

const X_MIN       = 0;
const X_MAX       = canvas.width;
const Y_MIN       = 0;
const Y_MAX       = canvas.height;
const X_AXIS      = 200;
const Y_AXIS      = 200;
const X_TICK      = 20;
const Y_TICK      = 20;
const CLEAR_COLOR = '#000000';
const FPS         = 100;
const GRAPH_COLOR = '#007fff';
const AXIS_COLOR  = '#ffffff';
const TICK_COLOR  = '#afafaf';

const PHI         = (1 + Math.sqrt(5)) / 2;

var   x_values    = [];
var   y_values    = [];

function clearCanvas()
{
   ctx.fillStyle = CLEAR_COLOR;
   ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearPlot()
{
   x_values = [];
   y_values = [];
}

function drawAxes()
{
   ctx.strokeStyle = AXIS_COLOR;

   ctx.beginPath();
   ctx.moveTo(0,     X_AXIS);
   ctx.lineTo(X_MAX, X_AXIS);
   ctx.stroke();

   ctx.beginPath();
   ctx.moveTo(Y_AXIS, 0);
   ctx.lineTo(Y_AXIS, Y_MAX);
   ctx.stroke();
}

function drawTicks()
{
   ctx.strokeStyle = TICK_COLOR;

   for (var x = 0; x < X_MAX; x += X_TICK)
   {
      ctx.beginPath();
      ctx.moveTo(x, X_AXIS - 5);
      ctx.lineTo(x, X_AXIS + 5);
      ctx.stroke();
   }

   for (var y = 0; y < Y_MAX; y += Y_TICK)
   {
      ctx.beginPath();
      ctx.moveTo(Y_AXIS - 5, y);
      ctx.lineTo(Y_AXIS + 5, y);
      ctx.stroke();
   }
}

function plotXY(func, xMin, xMax, dx)
{  
   for (var x = xMin; x <= xMax; x += dx)
   {
      var y = func(x);

      x_values.push(x * X_TICK);
      y_values.push(y * Y_TICK);
   }
}

function plotYX(func, yMin, yMax, dy)
{  
   for (var y = yMin; y <= yMax; y += dy)
   {
      var x = func(y);

      x_values.push(x * X_TICK);
      y_values.push(y * Y_TICK);
   }
}

function plotParam(func, tMin, tMax, dt)
{
   for (var t = tMin; t <= tMax; t += dt)
   {
      var T = func(t);
      var x = T['x'];
      var y = T['y'];

      x_values.push(x * X_TICK);
      y_values.push(y * Y_TICK);
   }
}

function drawGraph()
{
   ctx.fillStyle = GRAPH_COLOR;
   for (var i = 0; i < x_values.length; i++)
      ctx.fillRect(Y_AXIS + x_values[i], X_AXIS - y_values[i], 2, 2);
}

function radToDeg(rad)
{
   return rad * 180 / Math.PI;
}

function degToRad(deg)
{
   return deg * Math.PI / 180;
}

function randomFloat(minimum, maximum)
{
   return Math.random() * (maximum - minimum) + minimum;
}

function randomInt(minimum, maximum)
{
   return parseInt(Math.random() * (maximum - minimum) + minimum);
}

function randomize()
{
   var a = parseInt(Math.random() * 2);
   var b;
   
   if (a == 0) b = 1;
   else b = -1;
   
   return Math.random() * 20 * b;
}

function run()
{
   clearCanvas();
   drawAxes();
   drawTicks();
   drawGraph();
}

var func_x = null;
var func_y = null;
var func_t = null;

window.onload = function()
{
   clearPlot();

   txtInput.value = txtInput.value.trim();
   if (txtInput.value == '')
      txtInput.value = 'func_x = null;\n' +
                       'func_y = null;\n' + 
                       'func_t = null;';
   
   setInterval(run, 1000 / FPS)
};

btEval.onclick = function()
{
   clearPlot();
   
   if (txtInput.value != '')
   {
      eval(txtInput.value);
      if (func_x != null)
         plotXY(func_x, -10, 10, 0.01);
      if (func_y != null)
         plotYX(func_y, -10, 10, 0.01);
      if (func_t != null)
         plotParam(func_t, -10, 10, 0.01);

      if (func_x == null && func_y == null && func_t == null)
         clearPlot();
   }
   else
   {
      func_x = null;
      func_y = null;
      func_t = null;
   }
};

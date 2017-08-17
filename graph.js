/*********************************************************
 * USE STRICT SYNTAX
 *********************************************************/
'use strict';

/*********************************************************
 * HTML ELEMENTS
 *********************************************************/
const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const txtInput = document.getElementById('txtInput');
const btEval   = document.getElementById('btEval');
const btClear  = document.getElementById('btClear');

/*********************************************************
 * GRID TYPE CONSTANTS
 *********************************************************/
const GRID_NONE   = 0;
const GRID_CART   = 1;
const GRID_POLAR  = 2;

/*********************************************************
 * GRAPH VARIABLES
 *********************************************************/
var graphColorXY = '#ff0000';
var graphColorYX = '#00ff00';
var graphColorPR = '#ff7f00';
var graphColorPL = '#007fff';
var numTicksX    = 20;
var numTicksY    = 20;
var deltaX       = 0.01;
var deltaY       = 0.01;
var deltaT       = 0.01;
var deltaTh      = 0.01;
var tLowerBound  = -10;
var tUpperBound  = +10;
var thLowerBound = 0;
var thUpperBound = +8 * Math.PI;
var gridType     = GRID_CART;

/*********************************************************
 * GRAPH CONTANTS
 *********************************************************/
const X_MIN       = 0;
const X_MAX       = canvas.width;
const Y_MIN       = 0;
const Y_MAX       = canvas.height;
const X_AXIS      = (X_MAX - X_MIN) / 2;
const Y_AXIS      = (Y_MAX - Y_MIN) / 2;
const X_TICK      = (X_MAX - X_MIN) / numTicksX;
const Y_TICK      = (X_MAX - X_MIN) / numTicksY;
const FPS         = 100;
const CLEAR_COLOR = '#000000';
const AXIS_COLOR  = '#7f7f7f';
const TICK_COLOR  = '#5f5f5f';
const GRID_COLOR  = '#3f3f3f';

/*********************************************************
 * EXTRA MATH CONSTANTS
 *********************************************************/
const PHI = (1 + Math.sqrt(5)) / 2;

/*********************************************************
 * X & Y ARRAYS FOR PLOTTING & DRAWING ONTO CANVAS
 *********************************************************/
var xy_x_values = [];
var xy_y_values = [];
var yx_x_values = [];
var yx_y_values = [];
var pr_x_values = [];
var pr_y_values = [];
var pl_x_values = [];
var pl_y_values = [];

/*********************************************************
 * FUNCTIONS USED FOR PLOTTING
 *********************************************************/
var func_x  = null;
var func_y  = null;
var func_t  = null;
var func_th = null;

/*********************************************************
 * KEYBOARD KEY CODE
 *********************************************************/
var key = 0;

/*********************************************************
 * CLEAR CANVAS
 *********************************************************/
function clearCanvas()
{
   ctx.fillStyle = CLEAR_COLOR;
   ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/*********************************************************
 * CLEAR X->Y PLOT ARRAY
 *********************************************************/
function clearPlotXY()
{
   xy_x_values = [];
   xy_y_values = [];
}

/*********************************************************
 * CLEAR Y->X PLOT ARRAY
 *********************************************************/
function clearPlotYX()
{
   yx_x_values = [];
   yx_y_values = [];
}

/*********************************************************
 * CLEAR T->XY (PARAMETRIC CARTESIAN) PLOT ARRAY
 *********************************************************/
function clearPlotParam()
{
   pr_x_values = [];
   pr_y_values = [];
}

/*********************************************************
 * CLEAR THETA->R (POLAR) PLOT ARRAY
 *********************************************************/
function clearPlotPolar()
{
   pl_x_values = [];
   pl_y_values = [];
}

/*********************************************************
 * DRAW THE AXES
 *********************************************************/
function drawAxes()
{
   // set the color
   ctx.strokeStyle = AXIS_COLOR;

   // draw x-axis
   ctx.beginPath();
   ctx.moveTo(0,     X_AXIS);
   ctx.lineTo(X_MAX, X_AXIS);
   ctx.stroke();

   // draw y-axis
   ctx.beginPath();
   ctx.moveTo(Y_AXIS, 0);
   ctx.lineTo(Y_AXIS, Y_MAX);
   ctx.stroke();
}

/*********************************************************
 * DRAW AXIS TICKS
 *********************************************************/
function drawTicks()
{
   // set the color
   ctx.strokeStyle = TICK_COLOR;
   
   // draw the x-axis ticks
   for (var x = 0; x < X_MAX; x += X_TICK)
   {
      ctx.beginPath();
      ctx.moveTo(x, X_AXIS - 5);
      ctx.lineTo(x, X_AXIS + 5);
      ctx.stroke();
   }

   // draw the y-axis ticks
   for (var y = 0; y < Y_MAX; y += Y_TICK)
   {
      ctx.beginPath();
      ctx.moveTo(Y_AXIS - 5, y);
      ctx.lineTo(Y_AXIS + 5, y);
      ctx.stroke();
   }
}

/*********************************************************
 * DRAW CARTESIAN GRID
 *********************************************************/
function drawGridCartesian()
{
   // set the color
   ctx.strokeStyle = GRID_COLOR;

   // draw the vertical lines
   for (var i = 0; i < numTicksX; i++)
   {
      var x = i * X_TICK;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
   }

   // draw the horizontal lines
   for (var i = 0; i < numTicksY; i++)
   {
      var y = i * Y_TICK;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
   }
}

/*********************************************************
 * DRAW POLAR GRID
 *********************************************************/
function drawGridPolar()
{
   // set the color
   ctx.strokeStyle = GRID_COLOR;
   
   for (var i = 0; i < numTicksX; i++)
   {
      ctx.beginPath();
      ctx.arc(X_AXIS, Y_AXIS, i * X_TICK, 0, 2 * Math.PI);
      ctx.stroke();
   }
}

/*********************************************************
 * FILL X->Y PLOT ARRAY
 *********************************************************/
function plotXY(func, xMin, xMax, dx)
{  
   for (var x = xMin; x <= xMax; x += dx)
   {
      // get output variable
      var y = func(x);
      
      // add x & y to plot arrays
      xy_x_values.push(x * X_TICK);
      xy_y_values.push(y * Y_TICK);
   }
}

/*********************************************************
 * FILL Y->X PLOT ARRAY
 *********************************************************/
function plotYX(func, yMin, yMax, dy)
{  
   for (var y = yMin; y <= yMax; y += dy)
   {
      // get output variable
      var x = func(y);
      
      // add x & y to plot arrays
      yx_x_values.push(x * X_TICK);
      yx_y_values.push(y * Y_TICK);
   }
}

/*********************************************************
 * FILL T->XY (PARAMETRIC CARTESIAN) PLOT ARRAY
 *********************************************************/
function plotParam(func, tMin, tMax, dt)
{
   for (var t = tMin; t <= tMax; t += dt)
   {
      // get output variables
      var T = func(t);
      var x = T['x'];
      var y = T['y'];
      
      // add x & y to plot arrays
      pr_x_values.push(x * X_TICK);
      pr_y_values.push(y * Y_TICK);
   }
}

/*********************************************************
 * FILL TH->R (POLAR) PLOT ARRAY
 *********************************************************/
function plotPolar(func, thMin, thMax, dth)
{
   for (var th = thMin; th <= thMax; th += dth)
   {
      // get output variables
      var R = func(th);
      var x = R * Math.cos(th);
      var y = R * Math.sin(th);
      
      // add x & y to plot arrays
      pl_x_values.push(x * X_TICK);
      pl_y_values.push(y * Y_TICK);
   }
}

/*********************************************************
 * DRAW A GRAPH
 *********************************************************/
function graph(xValues, yValues, color)
{
   // set the color
   ctx.fillStyle = color;
   
   // plot each X->Y point
   for (var i = 0; i < xValues.length; i++)
   {
      var x = xValues[i];
      var y = yValues[i];
      ctx.fillRect(Y_AXIS + x, X_AXIS - y, 2, 2);
   }
};

/*********************************************************
 * DRAW ALL GRAPHS
 *********************************************************/
function drawGraphs()
{
   graph(xy_x_values, xy_y_values, graphColorXY);
   graph(yx_x_values, yx_y_values, graphColorYX);
   graph(pr_x_values, pr_y_values, graphColorPR);
   graph(pl_x_values, pl_y_values, graphColorPL);
}

/*********************************************************
 * CONVERT RADIANS TO DEGREES
 *********************************************************/
function radToDeg(rad)
{
   return rad * 180 / Math.PI;
}

/*********************************************************
 * CONVERT DEGREES TO RADIANS
 *********************************************************/
function degToRad(deg)
{
   return deg * Math.PI / 180;
}

/*********************************************************
 * GENERATE RANDOM FLOATING-POINT NUMBER
 *********************************************************/
function randomFloat(minimum, maximum)
{
   return Math.random() * (maximum - minimum) + minimum;
}

/*********************************************************
 * GENERATE RANDOM INTEGER
 *********************************************************/
function randomInt(minimum, maximum)
{
   return parseInt(Math.random() * (maximum - minimum) + minimum);
}

/*********************************************************
 * GENERATE RANDOM NUMBER (RELATIVE TO PLOT AXIS)
 *********************************************************/
function randomize()
{
   // generate an flag integer between 0 and 1
   var a = parseInt(Math.random() * 2);
   var b;
   
   // determine the sign of the final number
   if (a == 0) b = 1;
   else b = -1;
   
   // generate the final number
   return Math.random() * 20 * b;
}

/*********************************************************
 * RUN
 *********************************************************/
function run()
{
   // clear the canvas
   clearCanvas();

   // determine what grid to draw
   switch (gridType)
   {
      case GRID_CART:
         drawGridCartesian();
         break;

      case GRID_POLAR:
         drawGridPolar();
         break;

      case GRID_NONE:
      default:
         break;
   }
   
   // draw the axes and ticks
   drawAxes();
   if (gridType != GRID_POLAR)
      drawTicks();

   // finally, draw the graphs
   drawGraphs();
}

/*********************************************************
 * WINDOW : ON LOAD
 *********************************************************/
window.onload = function()
{  
   // clear the plot arrays
   clearPlotXY();
   clearPlotYX();
   clearPlotParam();
   clearPlotPolar();

   // get the text for the text area from memory
   var text = localStorage.getItem('text');
   
   // if something was there, then use it
   if (text != null && text != undefined && text.trim() != '')
      txtInput.value = text;
   // otherwise, use a default
   else
      txtInput.value = 'func_x  = null;\n' +
                       'func_y  = null;\n' + 
                       'func_t  = null;\n' +
                       'func_th = null;';
   
   // run
   /* setInterval(run, 1000 / FPS) */
   run();
};

/*********************************************************
 * WINDOW : ON BEFORE UNLOAD
 *********************************************************/
window.onbeforeunload = function()
{
   // save the text in the text area
   localStorage.setItem('text', txtInput.value);
};

/*********************************************************
 * CLEAR BUTTON : ON CLICK
 *********************************************************/
btClear.onclick = function()
{
   // clear all plots
   clearPlotXY();
   clearPlotYX();
   clearPlotParam();
   clearPlotPolar();

   // redraw
   run();
};

/*********************************************************
 * EVALUATE BUTTON : ON CLICK
 *********************************************************/
btEval.onclick = function()
{
   if (txtInput.value != '')
   {
      // evaluate the JavaScript in the text area
      eval(txtInput.value);
      
      // clear all plots
      clearPlotXY();
      clearPlotYX();
      clearPlotParam();
      clearPlotPolar();
      
      // plot X->Y if defined
      if (func_x != null)
         plotXY(func_x, -numTicksX / 2, numTicksX / 2, deltaX);
      
      // plot Y->X if defined
      if (func_y != null)
         plotYX(func_y, -numTicksY / 2, numTicksY / 2, deltaY);
      
      // plot T->XY if defined
      if (func_t != null)
         plotParam(func_t, tLowerBound, tUpperBound, deltaT);

      // plot TH->R if defined
      if (func_th != null)
         plotPolar(func_th, thLowerBound, thUpperBound, deltaTh);
      
      // redraw
      run();
   }
   else
   {
      func_x  = null;
      func_y  = null;
      func_t  = null;
      func_th = null;
   }
};

/*********************************************************
 * WINDOW : ON KEY DOWN
 *********************************************************/
window.onkeydown = function(event)
{
   // get key pressed
   key = event.keyCode;
   
   // if currently focused on the text area
   // and the TAB key was pressed
   if (document.activeElement == txtInput)
      if (event.keyCode == 9)
      {
         // initialize blank text
         var text = '';
         
         // get text up to cursor
         for (var i = 0;
                  i < txtInput.selectionStart;
                  i++)
            text += txtInput.value.charAt(i);
            
         // insert 3 spaces as a tab
         text += '   ';
         
         // get the rest of the text
         for (var i = txtInput.selectionStart; 
                  i < txtInput.value.length;
                  i++)
            text += txtInput.value.charAt(i);
         
         // save the cursor position
         var cursor = txtInput.selectionStart;
         
         // update the text
         txtInput.value = text;
         
         // reset the cursor to right after the newly
         // inserted tab/sapces
         txtInput.selectionStart = cursor + 3;
         txtInput.selectionEnd   = cursor + 3;
      }
      // if ESC was pressed, then focus on the clear button
      else if (event.keyCode == 27)
         btClear.focus();
};

/*********************************************************
 * WINDOW : ON KEY UP
 *********************************************************/
window.onkeyup = function()
{
   key = 0;
};

/*********************************************************
 * INPUT TEXT AREA : ON BLUR
 *********************************************************/
txtInput.onblur = function()
{
   // if TAB was pressed, then keep focus on the text area
   if (key == 9)
      this.focus();
};

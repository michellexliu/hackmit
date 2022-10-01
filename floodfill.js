// modified from this algorithm:
//    http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/

import { flood_fill } from "./wasm_flood_fill.js";

// note - can be slow for large areas

flood_fill();
/*
 * floodFill - fills the area starting from the seed point that has the same color as the seed point with a specified color
 * canvas is the canvas area to draw on.
 * event is the event that contains the clientX and clientY of * where to start the fill from.
 * floodColor is the color to fill with, of the form: "rgb(191, 191, 191)" which is what is
 *      returned by xxx.style.backgroundColor;
 */
function floodFill(event, canvas, floodColor) {
  // make a promise so that we can enforce synchronous order to events
  let startPromise = new Promise((resolve, reject) => {
    document.body.style.cursor = "progress"; // change cursor to loading

    setTimeout(() => resolve(), 100); // setTimeout forces the CSS batch of changes to update (usually it would wait til the end)
  });
  startPromise
    .then(() => {
      // once the promise is done (changing cursor), do floodfill
      let canvasPos = canvas.getBoundingClientRect();
      let startX = event.clientX - canvasPos.left;
      let startY = event.clientY - canvasPos.top;

      let context = canvas.getContext("2d");
      let clickedColor = context.getImageData(startX, startY, 1, 1).data;

      let pixelStack = [[startX, startY]];

      let matchStartColor = (x, y) => {
        let thisColor = context.getImageData(x, y, 1, 1).data;
        return thisColor.every((e, i) => e === clickedColor[i]);
      };

      let colorPixel = (x, y) => {
        let valStr = floodColor
          .substring(floodColor.indexOf("(") + 1, floodColor.length - 1)
          .split(", ");
        let vals = valStr.map((e) => parseInt(e, 10));
        vals.push(255);
        context.putImageData(
          new ImageData(new Uint8ClampedArray(vals), 1, 1),
          x,
          y
        );
      };

      while (pixelStack.length) {
        let newPos = pixelStack.pop();
        let x = newPos[0];
        let y = newPos[1];

        while (y >= 0 && matchStartColor(x, y)) {
          y--;
        }

        y++;
        let reachLeft = false;
        let reachRight = false;
        while (y < canvas.height - 2 && matchStartColor(x, y)) {
          colorPixel(x, y);

          if (x > 0) {
            if (matchStartColor(x - 1, y)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }

          if (x < canvas.width - 2) {
            if (matchStartColor(x + 1, y)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }

          y++;
        }
      }
    })
    .finally(() => {
      document.body.style.cursor = "default";
    }); // when floodfill finally ends, change the cursor back
}

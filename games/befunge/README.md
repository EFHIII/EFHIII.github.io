[Link to editor](http://efhiii.github.io/games/befunge)
# Javascript Befunge Interpreter and Editor
## Editor
![editor image](https://i.imgur.com/ms81Bms.png)
### buttons at the top from left to right:
1. **Edit** : toggle back to the text editor
2. **Run** : execute the befunge code in real time
3. **Delay** : toggles slow execution when running the code
    1. **Delay time** : determines how many miliseconds delay between each step
4. **Step** : execute one step of the code
5. **Reset** : resets the pointer back to the orgin and undos anything that execution may have changed
6. **Hide/Show Console** : toggles the console tab (dragable)
7. **Hide/Show Canvas** : toggles the canvas
8. **Hide/Show Code** : toggles the code display (dragable and zoomable)
## Syntax
A syntax reference is available by clicking **Reference** under the code editor.
## Fingerprints
Fingerprints are like extensions to the language of Befunge. they can be loaded in like this:
```
"WARD"4(
```
Where `"DRAW"` is the name of the fingerprint (WARD is DRAW backwards), `4` is the length of the name, and `(` is the fingerprint loader character. Fingerprints can be unloaded with `)`, the fingerprint unload character. More information is available in the [specification](https://github.com/catseye/Funge-98/blob/master/doc/funge98.markdown).
## DRAW Fingerprint
The DRAW fingerprint is unique to this interpreter, and will (most likely) not work in any other interpreter. Once loaded, it loads several of the Fingerprint characters (A-Z) with canvas relevent functions. 

| Character | Name | Description |
| --------- | ---- | ----------- |
| D | Draw Everything | Updates the canvas. This should go at the end of a drawing loop. Without it, the canvas update at seemingly random spots and the framerate will be atrocious. |
| A | Arc | Draws an arc. |
| C | Circle | Draws a circle. |
| E | Ellipse | Draws an ellipse. |
| R | Rectangle | Draws a rectangle. |
| P | Point | Draws a point. |
| O | Shape | Draws a shape described by the stack. |
| T | Transform | Applies a transformation to the transformation matrix. |
| M | Matrix | Push/Pops the Matrix stack. |
| B | Background | Fills the canvas with the fill color. |
| F | Fill | Changes the shape fill color. |
| S | Stroke | Changes the shape stroke color. |
| W | Width | Pushes the canvas width. |
| H | Height | Pushes the canvas height. |
| U | Mouse | Pushes mouse info. |
| L | LMouse | Pushes mouse info from the last frame. |
| K | Keyboard | Pushes keyboard info. |

### External Links
[esolangs.org/wiki/Funge-98](https://esolangs.org/wiki/Funge-98)

[Befunge-98 Specification](https://github.com/catseye/Funge-98/blob/master/doc/funge98.markdown)

[Link to editor](http://efhiii.github.io/games/befunge)

[Link to fullscreen runner (only for graphical programs)](https://efhiii.github.io/games/befunge/befungerunner)

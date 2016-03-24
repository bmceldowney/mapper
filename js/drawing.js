Mapper.Drawing = (function () {
    var painting = false,
        erasing = false,
        canvas = document.getElementById('drawing');

    function init() {
        var currentTool,
            element,
            buttonnode,
            buttonlabel,
            image;

        for (toolName in this.tools) {
            element = $('.drawingTools').get(0);
            buttonnode = document.createElement('input');
            currentTool = this.tools[toolName];

            buttonnode.setAttribute('id', currentTool.id);
            buttonnode.setAttribute('type', 'radio');
            buttonnode.setAttribute('name', 'radio1');
            buttonnode.setAttribute('value', currentTool.name);
            buttonnode.setAttribute('title', currentTool.name);
            buttonnode.setAttribute('data-img', currentTool.src);
            buttonnode.setAttribute('data-drawer', 'Drawing');
            buttonnode.setAttribute('data-tool', toolName);

            image = new Image();
            image.src = currentTool.src;
            buttonlabel = document.createElement('label');
            buttonlabel.setAttribute('for', buttonnode.id);
            buttonlabel.setAttribute('data-title', currentTool.name)
            buttonlabel.className += "toolButton";

            var p = document.createElement('div');

            p.className += 'buttonContainer';
            p.appendChild(buttonnode);
            p.appendChild(buttonnode);
            buttonlabel.appendChild(image);
            p.appendChild(buttonlabel);
            element.appendChild(p);
        }

        $('#key > div > input').first().prop('checked', 'true');
        $('.drawingTools > div > input').first().prop('checked', 'true');
    };

    function erase(x, y) {
        var ctx = canvas.getContext("2d"),
            mapCoords = Mapper.screenToMapCoords(x, y),
            x = 0,
            y = 0;

        Mapper.squares[mapCoords.x][mapCoords.y] = null;
        ctx.clearRect((mapCoords.x * Mapper.SPRITESIZE) - mapCoords.x, (mapCoords.y * Mapper.SPRITESIZE) - mapCoords.y, Mapper.SPRITESIZE, Mapper.SPRITESIZE);

        for (x = mapCoords.x - 1; x < mapCoords.x + 2; x++)
            for (y = mapCoords.y - 1; y < mapCoords.y + 2; y++)
                redrawTile(x, y);
    };

    function rotate(x, y) {
        var ctx = canvas.getContext("2d"),
            mapCoords = Mapper.screenToMapCoords(x, y),
            clickedItem = Mapper.squares[mapCoords.x][mapCoords.y];

        if (clickedItem === undefined) return;

        clickedItem.rotation++;
        ctx.translate((mapCoords.x * Mapper.SPRITESIZE), (mapCoords.y * Mapper.SPRITESIZE));
        ctx.translate((Mapper.SPRITESIZE / 2) - mapCoords.x, (Mapper.SPRITESIZE / 2) - mapCoords.y);
        ctx.rotate(clickedItem.rotation * (90 * (Math.PI / 180)));

        ctx.clearRect(-(Mapper.SPRITESIZE / 2), -(Mapper.SPRITESIZE / 2), Mapper.SPRITESIZE, Mapper.SPRITESIZE);
        ctx.drawImage(Mapper.tileImages[clickedItem.tileImageIndex], 0, 0, Mapper.SPRITESIZE, Mapper.SPRITESIZE, -(Mapper.SPRITESIZE / 2), -(Mapper.SPRITESIZE / 2), Mapper.SPRITESIZE, Mapper.SPRITESIZE);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    function draw(x, y) {
        var ctx = canvas.getContext("2d"),
            mapCoords = Mapper.screenToMapCoords(x, y),
            selectedTile = $('#key input:checked').get(0).imageObject;

        if (!selectedTile) return;

        Mapper.squares[mapCoords.x][mapCoords.y] = new Tile(selectedTile);
        ctx.clearRect((mapCoords.x * Mapper.SPRITESIZE) - mapCoords.x, (mapCoords.y * Mapper.SPRITESIZE) - mapCoords.y, Mapper.SPRITESIZE, Mapper.SPRITESIZE);
        ctx.drawImage(Mapper.tileImages[selectedTile.tileImageIndex], 0, 0, Mapper.SPRITESIZE, Mapper.SPRITESIZE, (mapCoords.x * Mapper.SPRITESIZE) - mapCoords.x, (mapCoords.y * Mapper.SPRITESIZE) - mapCoords.y, Mapper.SPRITESIZE, Mapper.SPRITESIZE);
    };

    function redraw() {
        var ctx = canvas.getContext("2d"),
            x = 0,
            y = 0;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (x = 0; x < Mapper.GRIDWIDTH; x++) {
            for (y = 0; y < Mapper.GRIDHEIGHT; y++) {
                redrawTile(x, y);
            }
        }
    };

    function redrawTile(x, y) {
        var ctx = canvas.getContext("2d"),
            item = Mapper.squares[x][y];

        if (item) {
            ctx.translate((x * Mapper.SPRITESIZE), (y * Mapper.SPRITESIZE));
            ctx.translate((Mapper.SPRITESIZE / 2) - x, (Mapper.SPRITESIZE / 2) - y);
            ctx.rotate(item.rotation * (90 * (Math.PI / 180)));

            ctx.drawImage(Mapper.tileImages[item.tileImageIndex], 0, 0, Mapper.SPRITESIZE, Mapper.SPRITESIZE, -(Mapper.SPRITESIZE / 2), -(Mapper.SPRITESIZE / 2), Mapper.SPRITESIZE, Mapper.SPRITESIZE);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    };

    function isTileEqual(tile1, tile2) {
        if (!tile1) {
            if (!tile2) return true;
            else return false;
        }

        if (!tile2) return false;

        return _.isEqual(_.pick(tile1, 'tileImageIndex'), _.pick(tile2, 'tileImageIndex'));
    };

    function fill(x, y) {
        var mapCoords = Mapper.screenToMapCoords(x, y),
            currentSquare,
            currentTile,
            reachLeft = false,
            reachRight = false,
            leftTile,
            rightTile,
            squareStack = [],
            selectedTile = $('#key input:checked').get(0).imageObject;

        var oldTool = Mapper.squares[mapCoords.x][mapCoords.y];
        selectedTile.rotation = 0;

        if (isTileEqual(selectedTile, oldTool)) return;

        squareStack.push({
            x: mapCoords.x,
            y: mapCoords.y
        });

        while (squareStack.length) {
            currentSquare = squareStack.pop();

            currentTile = Mapper.squares[currentSquare.x][currentSquare.y];
            if (!isTileEqual(currentTile, oldTool)) continue;

            while (currentSquare.y >= 0 && isTileEqual(currentTile, oldTool)) {
                currentSquare = { x: currentSquare.x, y: currentSquare.y - 1 };
                currentTile = Mapper.squares[currentSquare.x][currentSquare.y];
            }

            currentSquare = { x: currentSquare.x, y: currentSquare.y + 1 };
            currentTile = Mapper.squares[currentSquare.x][currentSquare.y];

            reachLeft = false;
            reachRight = false;

            while (currentSquare.y < Mapper.GRIDHEIGHT && isTileEqual(currentTile, oldTool)) {
                Mapper.squares[currentSquare.x][currentSquare.y] = selectedTile;

                if (currentSquare.x > 0) {
                    leftTile = Mapper.squares[currentSquare.x - 1][currentSquare.y];
                    if (isTileEqual(leftTile, oldTool)) {
                        if (!reachLeft) {
                            squareStack.push({ x: currentSquare.x - 1, y: currentSquare.y });
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (currentSquare.x < Mapper.GRIDWIDTH - 1) {
                    rightTile = Mapper.squares[currentSquare.x + 1][currentSquare.y];
                    if (isTileEqual(rightTile, oldTool)) {
                        if (!reachRight) {
                            squareStack.push({ x: currentSquare.x + 1, y: currentSquare.y });
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                currentSquare = { x: currentSquare.x, y: currentSquare.y + 1 };
                currentTile = Mapper.squares[currentSquare.x][currentSquare.y];
            }
        }

        redraw();
    };

    function mousemove(e) {
        e.preventDefault();
        var mousePos = Mapper.getMousePos(canvas, e.clientX, e.clientY);

        if (painting) {
            draw(mousePos.x, mousePos.y);
        }

        if (erasing) {
            erase(mousePos.x, mousePos.y);
        }
    }

    function mouseleave(e) {
        e.preventDefault();
        painting = false;
        erasing = false;
    }

    function mouseup(e) {
        e.preventDefault();
        painting = false;
        erasing = false;
    }

    function mousedown(e) {
        e.preventDefault();
        console.log('in drawing: ' + e.result);
        var mousePos = Mapper.getMousePos(canvas, e.clientX, e.clientY);
        var selectedTool = $('.drawingTools input:checked').data('tool');

        switch (selectedTool) {
            case 'ROTATETOOL':
                erasing = false;
                painting = false;
                rotate(mousePos.x, mousePos.y);
                break;
            case 'ERASETOOL':
                painting = false;
                erasing = true;
                erase(mousePos.x, mousePos.y);
                break;
            case 'PAINTBUCKETTOOL':
                erasing = false;
                painting = false;
                fill(mousePos.x, mousePos.y);
                break;
            default:
                erasing = false;
                painting = true;
                draw(mousePos.x, mousePos.y);
                break;
        }

        e.result = 'annotation' + count++;
    }
    var count = 0;

    return {
        name: 'Drawing',
        init: init,
        redraw: redraw,
        mousedown: mousedown,
        mouseup: mouseup,
        mouseleave: mouseleave,
        mousemove: mousemove,
        tools: {
            DRAWTOOL: { name: "Draw", src: 'tiles/pencil.png', id: 'drawId' },
            PAINTBUCKETTOOL: { name: "Paint Bucket", src: 'tiles/paintBucket.png', id: 'paintBucketId' },
            ERASETOOL: { name: "Erase", src: 'tiles/erase.jpg', id: 'eraseId' },
            ROTATETOOL: { name: "Rotate", src: 'tiles/rotate.png', id: 'rotateId' }
        }
    };
})();
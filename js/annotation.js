Mapper.Annotation = (function () {
    var canvas = document.getElementById('annotation'),
    lines = [],
    text = [],
    textInput,
    currentLine = {},
    hoveredText = -1,
    selectedElement = -1,
    editingElement = -1,
    draggingElement = -1,
    dragX = 0,
    dragY = 0;

    function init() {
        var currentTool,
        element,
        buttonnode,
        buttonlabel,
        buttonContainer,
        context,
        position,
        textSize,
        image;

        for (toolName in this.tools) {
            element = $('.annotationTools').get(0);
            buttonnode = document.createElement('input');
            currentTool = this.tools[toolName];

            buttonnode.setAttribute('id', currentTool.id);
            buttonnode.setAttribute('type', 'radio');
            buttonnode.setAttribute('name', 'radio1');
            buttonnode.setAttribute('value', currentTool.name);
            buttonnode.setAttribute('title', currentTool.name);
            buttonnode.setAttribute('data-img', currentTool.src);
            buttonnode.setAttribute('data-drawer', 'Annotation');
            buttonnode.setAttribute('data-tool', toolName);

            image = new Image();
            image.src = currentTool.src;
            buttonlabel = document.createElement('label');
            buttonlabel.setAttribute('for', buttonnode.id);
            buttonlabel.setAttribute('data-title', currentTool.name)
            buttonlabel.className += "toolButton";

            buttonContainer = document.createElement('div');

            buttonContainer.className += 'buttonContainer';
            buttonContainer.appendChild(buttonnode);
            buttonContainer.appendChild(buttonnode);
            buttonlabel.appendChild(image);
            buttonContainer.appendChild(buttonlabel);
            element.appendChild(buttonContainer);
        }

        textInput = document.createElement('input');
        textInput.setAttribute('id', 'textInput');
        textInput.setAttribute('type', 'text');

        $('.main').append(textInput);
        $('#textInput').css('font-size', '18px')
                       .css('font-family', 'Nunito')
                       .css('color', '#f00')
                       .css('position', 'absolute')
                       .css('z-index', '7750');
        $('#textInput').hide();

        $('#textInput').keyup(function (e) {
            var index = text.length;
            if (editingElement >= 0) index = editingElement;

            context = canvas.getContext('2d');
            if (e.keyCode == 13 && $('#textInput').val()) {
                position = $(this).position();
                position = Mapper.getMousePos(canvas, position.left, position.top)
                drawText($('#textInput').val(), position.x, position.y + 2);
                textSize = context.measureText($('#textInput').val());
                text[index] = {
                    text: $('#textInput').val(),
                    top: position.y + 2,
                    left: position.x,
                    width: textSize.width,
                    height: 25
                };

                editingElement = -1;
                $('#textInput').blur().hide();
                redraw();
            }
        });

        $('input[name=radio1]').change(function (e) {
            var id = $(this).attr('id');
            if (!_.isEqual(id, 'textId')) {
                $('#textInput').hide();
            }
        });
    };

    function textMove() {
        if (hoveredText >= 0) {
            $(canvas).css('cursor', 'text');
        } else {
            $(canvas).css('cursor', 'default');
        }
    };

    function selectDown(e) {
        if (hoveredText >= 0) selectedElement = hoveredText;
        dragX = e.clientX;
        dragY = e.clientY;
        draggingElement = hoveredText;
        redraw();

        console.log('text element ' + hoveredText + ' selected')
    };

    function drawTextSelectionBox(element) {
        var top = element.top,
            left = element.left,
            width = element.width,
            height = element.height,
            context = canvas.getContext('2d');

        context.lineWidth = 1;
        context.strokeStyle = 'red';

        context.strokeRect(left, top, width, height);
    };

    function selectMove(x, y, e) {
        var position,
            i = 0,
            selectedTool = $('.annotationTools input:checked').data('tool');

        if (hoveredText >= 0) {
            $(canvas).css('cursor', 'pointer');
            drawTextSelectionBox(text[hoveredText]);
        } else {
            $(canvas).css('cursor', 'default');
            redraw();
        }

        // Highlight endpoints
        for (i = 0; i < lines.length; i++) {
            var lineRects = [{
                left: lines[i].x1 - 3,
                top: lines[i].y1 - 3,
                width: 7,
                height: 7
            }, {
                left: lines[i].x2 - 3,
                top: lines[i].y2 - 3,
                width: 7,
                height: 7
            }];
            for (var j = 0; j < lineRects.length; j++) {
                if (containsPoint(x, y, lineRects[j])) {
                    drawTextSelectionBox(lineRects[0]);
                    drawTextSelectionBox(lineRects[1]);
                }
            }
        }

        if (draggingElement >= 0) {
            var topMove = dragY - e.clientY,
                leftMove = dragX - e.clientX;

            if (text[draggingElement].top) {
                text[draggingElement].top -= topMove;
                text[draggingElement].left -= leftMove;
            }

            dragY = e.clientY;
            dragX = e.clientX;
            redraw();
        }
    };

    function selectUp(e) {
        draggingElement = -1;
    };

    function containsPoint(x, y, rect) {
        var top = rect.top,
            left = rect.left,
            bottom = top + rect.height,
            right = left + rect.width;

        return (x > left && x < right) && (y > top && y < bottom);
    };

    function textDown(x, y, e) {
        var value = '',
            hoveredPosition,
            top = e.pageY - 25,
            left = e.pageX;

        if (hoveredText >= 0) {
            value = text[hoveredText].text;
            top = text[hoveredText].top - 2 - canvas.parentElement.scrollTop;
            left = text[hoveredText].left - canvas.parentElement.scrollLeft;
            editingElement = hoveredText;
        }

        $('#textInput').val(value);
        $('#textInput').show();

        $('#textInput').css('top', top);
        $('#textInput').css('left', left);
        $('#textInput').focus();
    }

    function startLine(x, y) {
        currentLine.x1 = x;
        currentLine.y1 = y;
    };

    function endLine(x, y) {
        currentLine.x2 = x;
        currentLine.y2 = y;
        lines[lines.length] = currentLine;
        currentLine = {};
    };

    function drawLine(x, y) {
        if (!currentLine.x1) return;

        var context = canvas.getContext('2d'),
            drawingline;

        redraw();
        context.strokeStyle = '#d11';
        context.lineWidth = 1;

        context.beginPath();

        context.moveTo(currentLine.x1, currentLine.y1);
        context.lineTo(x, y);

        context.stroke();
    };

    function redraw() {
        var context = canvas.getContext('2d'),
            drawingline,
            i = 0,
            j = 0;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (i = lines.length - 1; i >= 0; i--) {
            drawingline = lines[i];
            context.moveTo(drawingline.x1, drawingline.y1);
            context.lineTo(drawingline.x2, drawingline.y2);
        };

        context.stroke();

        for (j = text.length - 1; j >= 0; j--) {
            drawText(text[j].text, text[j].left, text[j].top);
        };

        if (selectedElement >= 0) drawTextSelectionBox(text[selectedElement]);
    };

    function drawText(text, x, y) {
        var context = canvas.getContext('2d');

        //context.strokeStyle = "#000";
        context.fillStyle = '#f00';
        //context.lineWidth = .5;
        context.font = 'bold 18px Nunito';
        context.textBaseline = 'top';
        context.fillText(text, x, y);
        //context.strokeText(text, x, y);
    };

    function mousemove(e) {
        e.preventDefault();
        var mousePos = Mapper.getMousePos(canvas, e.clientX, e.clientY),
            selectedTool = $('.annotationTools input:checked').data('tool');

        hoveredText = -1;

        for (i = text.length - 1; i >= 0; i--) {
            if (containsPoint(mousePos.x, mousePos.y, text[i])) {
                hoveredText = i;
            }
        };

        switch (selectedTool) {
            case 'SELECTTOOL':
                selectMove(mousePos.x, mousePos.y, e);
                break;
            case 'TEXTTOOL':
                textMove(mousePos.x, mousePos.y);
                break;
            default:
                drawLine(mousePos.x, mousePos.y);
                break;
        }
    }

    function mouseleave(e) {
        e.preventDefault();
    }

    function mouseup(e) {
        e.preventDefault();
        var selectedTool = $('.annotationTools input:checked').data('tool');

        switch (selectedTool) {
            case 'SELECTTOOL':
                selectUp(e);
                break;
        }
    }

    function mousedown(e) {
        e.preventDefault();
        var mousePos = Mapper.getMousePos(canvas, e.clientX, e.clientY),
            selectedTool = $('.annotationTools input:checked').data('tool');

        selectedElement = -1;
        redraw();
        switch (selectedTool) {
            case 'LINETOOL':
                if (currentLine.x1) {
                    endLine(mousePos.x, mousePos.y);
                } else {
                    startLine(mousePos.x, mousePos.y);
                };
                break;
            case 'TEXTTOOL':
                textDown(mousePos.x, mousePos.y, e);
                break;
            case 'SELECTTOOL':
                selectDown(e);
                break;
        };

        e.result = 'annotation' + count++;

    }
    var count = 0;

    return {
        name: 'Annotation',
        init: init,
        mousedown: mousedown,
        mouseup: mouseup,
        mouseleave: mouseleave,
        mousemove: mousemove,
        tools: {
            LINETOOL: { name: "Line", src: 'tiles/line.png', id: 'lineId' },
            TEXTTOOL: { name: "Text", src: 'tiles/text.png', id: 'textId' },
            SELECTTOOL: { name: "Select", src: 'tiles/select.png', id: 'selectId' }
        }
        //ERASETOOL: { name: "Erase", src: 'tiles/erase.jpg', id: 'eraseAnnotationId' }
    };
})();
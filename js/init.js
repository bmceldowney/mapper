(function ($) {
    var canvas = document.getElementById("drawing");
    var ctx = canvas.getContext("2d");
    var grdcanvas = document.getElementById("grid");
    var grdctx = grdcanvas.getContext("2d");
    var annotation = document.getElementById("annotation");
    var annotationctx = grdcanvas.getContext("2d");

    canvas.width = grdcanvas.width = annotation.width = Mapper.GRIDWIDTH * Mapper.SPRITESIZE - Mapper.GRIDWIDTH + 1;
    canvas.height = grdcanvas.height = annotation.height = Mapper.GRIDHEIGHT * Mapper.SPRITESIZE - Mapper.GRIDHEIGHT + 1;

    //initialize opacity slider
    $("#slider").slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: 100,
        slide: function (event, ui) {
            $("#amount").html(ui.value);
            var canvas = document.getElementById("drawing");
            var ctx = canvas.getContext("2d");
            ctx.globalAlpha = ui.value / 100;
            Mapper.Drawing.redraw();
        }
    });
    $("#amount").html($("#slider").slider("value"));

    //initialize download button
    $("#downloadify").downloadify({
        filename: "map.mapper",
        downloadImage: "tiles/download.png",
        swf: "media/downloadify.swf",
        width: 16,
        height: 16,
        data: function () { return JSON.stringify(Mapper.squares, null, 2) }
    });

    $('.downloadButton').on('click', function (e) {
        $("#downloadify").click();
    });

    //initialize upload button
    $("#upload").change(function (evt) {
        var files = evt.target.files;
        var file = files[0];
        var reader = new FileReader();

        reader.onload = (function (file) {
            return function (e) {
                var canvas = document.getElementById("drawing");
                Mapper.squares = JSON.parse(e.target.result);
                Mapper.Drawing.redraw();
            }
        })(file);

        reader.readAsText(file);
    });

    $("#convertToPng").click(function () {
        var grid = document.getElementById("grid");
        var drawing = document.getElementById("drawing");
        var annotation = document.getElementById("annotation");
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = grid.width;
        canvas.height = grid.height;
        context.drawImage(grid, 0, 0);
        context.drawImage(drawing, 0, 0);
        context.drawImage(annotation, 0, 0);

        var img = canvas.toDataURL("image/png");

        w = window.open('save.html');
        w.onload = function () {
            var placeholder = w.document.getElementById("placeholder");
            placeholder.src = img;
        };
    });

    $("#fillWithBlack").click(function () {
        var wall = new Tile(images[0]);

        for (var i = 0; i < Mapper.GRIDWIDTH; i++) {
            for (var j = 0; j < Mapper.GRIDHEIGHT; j++) {
                Mapper.squares[i][j] = wall;
            }
        }
        var canvas = document.getElementById("drawing");
        Mapper.Drawing.redraw();
    });

    grdctx.fillStyle = '#fff';
    grdctx.fillRect(0, 0, (Mapper.GRIDWIDTH * Mapper.SPRITESIZE) - Mapper.GRIDWIDTH, (Mapper.GRIDHEIGHT * Mapper.SPRITESIZE) - Mapper.GRIDHEIGHT);

    for (i = 0; i < Mapper.GRIDWIDTH; i++) {
        Mapper.squares[i] = [];
    }

    for (j = 0; j < images.length; j++) {
        var col = document.getElementById("key");
        var buttonnode = document.createElement('input');

        buttonnode.setAttribute('id', 'radioButton' + j);
        buttonnode.setAttribute('type', 'radio');
        buttonnode.setAttribute('name', 'radio');
        buttonnode.setAttribute('value', images[j].name);
        buttonnode.setAttribute('title', images[j].name);
        buttonnode.setAttribute('data-img', images[j].src);
        buttonnode.imageObject = images[j];
        Mapper.tileImages[j] = new Image();
        Mapper.tileImages[j].src = images[j].src;

        var buttonlabel = document.createElement('label');
        buttonlabel.setAttribute('for', buttonnode.id);
        buttonlabel.setAttribute('id', 'radioButton' + j + 'label')
        buttonlabel.setAttribute('data-title', images[j].name)
        buttonlabel.setAttribute('data-hoverlabelid', 'hoveredItem')
        buttonlabel.className += "toolButton";

        images[j].tileImageIndex = j;
        var p = document.createElement('div');

        p.className += 'buttonContainer';
        p.appendChild(buttonnode);
        buttonlabel.appendChild(Mapper.tileImages[j]);
        p.appendChild(buttonlabel);
        col.appendChild(p);

        buttonnode.onclick = function (e) {
            $('.drawingTools input').first().click();
            Mapper.selectedItem = this.imageObject;
            Mapper.Mouse.wireUpMouseEvents(Mapper.Drawing);
        };
    }

    Mapper.Drawing.init();
    Mapper.Annotation.init();

    $('div.toolbar').buttonset();
    $('.uploadButton').button();
    $('.downloadButton').button();

    $(".toolbar > div > div > input").click(function (e) {
        var drawer = $(this).data('drawer');
        Mapper.Mouse.wireUpMouseEvents(Mapper[drawer]);
    });

    $('.drawingTools input').first().click();

    $('#annotation').on('mousemove', function (e) {
        var mousePos, screenCoords;
        mousePos = Mapper.getMousePos($('#annotation').get(0), e.clientX, e.clientY);
        screenCoords = Mapper.screenToMapCoords(mousePos.x, mousePos.y);
        $('.status').html('x: ' + screenCoords.x + ', y: ' + screenCoords.y);
    });

    $('.options').position({
        of: $('.optionsToggle'),
        my: 'left top',
        at: 'left top',
        collision: 'fit'
    }).hide();

    $('.optionsToggle').on('click', function (e) {
        //awkward hack to get around the fact that we can't position hidden elements
        if ($('.options').is(':visible')) {
            $('.options').toggle('drop', { direction: 'left' }, 150);
        } else {
            $('.options').show();
            $('.options').position({
                of: $('.optionsToggle'),
                my: 'left top',
                at: 'left top',
                collision: 'fit'
            });
            $('.options').hide();
            $('.options').toggle('drop', { direction: 'left' }, 150);
        };
    });

    $('.toolButton').on('mouseover', function (e) {
        $('.tooltip').show();
        $('.tooltip').position({
            my: "left top",
            of: e,
            offset: "12 8",
            collision: "fit"
        });
        var text = $(this).data('title');
        $('.tooltip').html(text);
    });

    $('.toolButton').on('mousemove', function (e) {
        $('.tooltip').position({
            my: "left top",
            of: e,
            offset: "12 8",
            collision: "fit"
        });
    });

    $('.toolButton').on('mouseout', function (e) {
        $('.tooltip').hide();
    });

    $('.toolButton').on('mouseover', function () {
        var hoveredLabelId = $(this).data('hoverlabelid');
        $('#' + hoveredLabelId).html($(this).data('title'));
    });

    $('.toolButton').on('mouseout', function () {
        var hoveredLabelId = $(this).data('hoverlabelid');
        $('#' + hoveredLabelId).html('&nbsp;');
    });

    drawGrid("#000", grdctx); //"#BEF4FA"

    $('#key').draggable({ handle: '.titleBar', containment: ".main", scroll: false });
    $('#tools').draggable({ handle: '.drawingTools > .titleBar', containment: ".main", scroll: false });

    function drawGrid(color, context) {
        context.strokeStyle = color;
        context.lineWidth = 1;

        context.beginPath();
        for (i = 0; i <= Mapper.GRIDWIDTH; i++) {
            context.moveTo(Mapper.SPRITESIZE * i + .5 - i, 0);
            context.lineTo(Mapper.SPRITESIZE * i + .5 - i, Mapper.GRIDHEIGHT * Mapper.SPRITESIZE - Mapper.GRIDHEIGHT + 1);
        }

        for (i = 0; i <= Mapper.GRIDHEIGHT; i++) {
            context.moveTo(0, Mapper.SPRITESIZE * i + .5 - i);
            context.lineTo(Mapper.GRIDWIDTH * Mapper.SPRITESIZE - Mapper.GRIDWIDTH + 1, Mapper.SPRITESIZE * i + .5 - i);
        }

        context.stroke();
    }

})(jQuery);
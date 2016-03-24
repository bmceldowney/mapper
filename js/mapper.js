var Mapper = {
    SPRITESIZE: 16,
    GRIDWIDTH: 100,
    GRIDHEIGHT: 100,
    squares: [],
    tileImages: []
};

Mapper.screenToMapCoords = function (x, y) {
    var mapX = Math.floor(x / Mapper.SPRITESIZE) + (Math.floor(x / (Mapper.SPRITESIZE - 1)) - Math.floor(x / Mapper.SPRITESIZE));
    var mapY = Math.floor(y / Mapper.SPRITESIZE) + (Math.floor(y / (Mapper.SPRITESIZE - 1)) - Math.floor(y / Mapper.SPRITESIZE));

    return { x: mapX, y: mapY };
};

Mapper.getMousePos = function (canvas, clientX, clientY) {
    // get canvas position
    var x;
    var y;

    x = clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = clientY + document.body.scrollTop + document.documentElement.scrollTop;

    x += canvas.parentElement.scrollLeft - canvas.parentElement.offsetLeft;
    y += canvas.parentElement.scrollTop - canvas.parentElement.offsetTop;

    return {
        x: x,
        y: y
    };
};
       
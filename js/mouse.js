Mapper.Mouse = (function () {
    var drawer;

    function wireUpMouseEvents(drawClass) {
        if (drawer) {
            $("#annotation").off('.' + drawer.name);
            console.log(drawer.name + ' off');

         }

        drawer = drawClass;
        console.log(drawer.name + ' on');

        $("#annotation").on('mousedown.' + drawer.name, drawer.mousedown);
        $("#annotation").on('mouseup.' + drawer.name, drawer.mouseup);
        $("#annotation").on('mouseleave.' + drawer.name, drawer.mouseleave);
        $("#annotation").on('mousemove.' + drawer.name, drawer.mousemove);
    };

    return {
        wireUpMouseEvents: wireUpMouseEvents
    };
})();
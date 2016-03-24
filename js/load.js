(function () {

    Modernizr.load([
        {
            load: "js/libs/LAB.min.js"
        },
        {
            load: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
            complete: function () {
                if (!window.jQuery) {
                    Modernizr.load('js/jquery/1.7.2/jquery.min.js');
                }
                $(document).ready(function () {
                    $LAB
                        .script("js/libs/swfobject.js")
                        .script("js/libs/download-data-uri.js")
                        .script("js/libs/underscore-min.js")
                        .script("js/libs/downloadify.min.js")
                        .script("js/libs/jquery.miniColors.min.js")
                        .script("js/libs/jquery-ui-1.8.19.custom.min.js")
                        .script("js/mapper.js").wait()
                        .script("js/drawing.js")
                        .script("js/annotation.js")
                        .script("js/images.js")
                        .script("js/mouse.js")
                        .script("js/init.js").wait(function () {
                            $('.main').fadeIn('fast');
                        });
                });
            }
        }, {
            // Logical list of things we would normally need
            test: Modernizr.canvas,
            // Modernizr.load loads css and javascript by default
            nope: ['js/libs/excanvas.compiled.js']
        }
    ]);
})();
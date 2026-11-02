/**
 * Pin It
 */
(function($) {

    $.fn.msPinIt = function() {

        this.not('.pinterest-ready, .wp-block-cover__image-background').each(function() {
            const $this = $(this);

            if ($this.closest('figure.tiled-gallery__item').length) {
                return;
            }

            const width = $this.attr('width') || $this.width();
            const height = $this.attr('height') || $this.height();

            if (!(parseInt(width) > 120 && parseInt(height) > 120)) {
                $this.addClass('pinterest-ready');
                return;
            }

            let container = $this.parent(),
                postURL = $(location).attr('href'),
                pinURL;

            if (container.is('a')) {
                const imagehref = container.attr('href');

                if (typeof imagehref !== 'undefined' && imagehref.match(/\.(gif|jpeg|jpg|png)/)) {
                    pinURL = imagehref;
                }

                if (!(container.closest('figure').length)) {
                    //container.wrap('<figure class="wrap-pin"></figure>');
                }

                container = container.parent();
            } else {
                if (!($this.closest('figure').length)) {
                   // $this.wrap('<figure class="wrap-pin"></figure>');
                }

                container = $this.parent();
            }

            if (!$this.closest('figure').hasClass('wrap-pin')) {
                $this.closest('figure').addClass('wrap-pin');
            }

            if (!pinURL) {
                pinURL = $this.is('img') ? ($this.hasClass('lazyload') ? $this.data('src') : $this.attr('src')) : (typeof container.find('img').data('src') !== 'undefined' ? container.find('img').data('src') : container.find('img').attr('src'));
            }

            pinURL = encodeURIComponent(pinURL);
            postURL = encodeURIComponent(postURL);

            const figure = container.is('figure') ? container : container.closest('figure');

            // Get caption text.
            let imgDescription = figure.find('img').data('pin-description') || figure.find('.wp-caption-text').text() || figure.find('figcaption').text() || figure.find('img').attr('alt');

            if (imgDescription) {
                // Add attribute to share URL.
                imgDescription = '&amp;description=' + encodeURIComponent(imgDescription);
            }

            // Img classes.
            const imgClasses = ['alignnone', 'aligncenter', 'alignleft', 'alignright'];

            imgClasses.forEach(function(el) {
                const img = container.find('img');

                if (img.hasClass(el)) {
                    img.removeClass(el);
                    const fig = img.closest('figure').addClass(el);

                    // Add width to figure.
                    const imgWidth = img.attr('width');

                    if (parseInt(imgWidth) !== 'NaN') {
                        fig.width(imgWidth);
                    }
                }
            });

            // Add func PintIt.
            if (!container.find('.pinterest-share-icon').length) {
                $('<a class="pinterest-share-icon ' + ms_pinit_localize.iconclass + '" href="https://www.pinterest.com/pin/create/bookmarklet/?url=' + postURL + '&amp;media=' + pinURL + imgDescription + '&is_video=false" target="_blank">' + ms_pinit_localize.icon + '</a>')
                    .appendTo(container);
            }

            $this.addClass('pinterest-ready');
        });

        return this;
    };

    function initMauveStudioPinIt() {
        const exclude = ms_pinit_localize.exclude_selectors;
        const filterMauveStudioPinIt = function() {
            if (exclude && $(this).closest(exclude).length > 0) {
                return false;
            }
            return true;
        }
$( ms_pinit_localize.image_selectors ).imagesLoaded( function() {
        $(ms_pinit_localize.image_selectors).filter(filterMauveStudioPinIt).msPinIt();
		} );
    }

    $(document).ready(function() {
        initMauveStudioPinIt();
        $(document).on('lazybeforeunveil lazyloaded', function(e) {
            if (e.type == 'lazyloaded') {
                initMauveStudioPinIt();
            }
        });
    });
})(jQuery);
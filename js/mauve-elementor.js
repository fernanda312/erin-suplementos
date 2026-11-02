/* global ELMAUVE */

( function( $ ) {
	"use strict";

	// Ensure ELMAUVE is truly global (Elementor can load scripts in different contexts).
	var ELMAUVE = window.ELMAUVE || {};
	window.ELMAUVE = ELMAUVE;

	// Bridge to the on-demand jarallax loader, which is defined in a LATER IIFE (a separate
	// closure) and exposed as window.msEnsureJarallax. Widgets in THIS closure (Posts Slideshow,
	// Parallax Image/Video) can't see that scope directly, so route through this helper. Fail-safe:
	// if the loader is somehow absent, only run the callback when jarallax is already present.
	function ensureJarallax( cb ) {
		if ( typeof window.msEnsureJarallax === 'function' ) { window.msEnsureJarallax( cb ); return; }
		if ( typeof cb !== 'function' ) return;
		if ( ( $.fn && typeof $.fn.jarallax === 'function' ) || typeof window.jarallax === 'function' ) { cb(); }
	}

	/**
	 * Elementor widget initializer
	 * - Prevents double initialization when Elementor re-renders widgets (editor/AJAX/responsive).
	 * - Supports optional destroy() before re-init.
	 *
	 * @param {jQuery} $scope Elementor widget scope
	 * @param {string} key   Unique dataset key per widget (e.g. "msBlogPosts")
	 * @param {{init:Function, destroy?:Function}} handler
	 */
	ELMAUVE.initWidget = function( $scope, key, handler ) {
		if ( !$scope || !$scope.length || !handler ) return;
		// Allow shorthand: handler can be a function (init only)
		if (typeof handler === "function") {
			handler = { init: handler };
		}
		if ( typeof handler.init !== "function" ) return;
		var el = $scope[0];
		var dsKey = String(key || "").trim();
		if (!dsKey) return;

		// If already initialized, destroy first (if supported).
		if ( el.dataset && el.dataset[dsKey] === "1" ) {
			if ( typeof handler.destroy === "function" ) {
				try { handler.destroy( $scope ); } catch (e) {}
			}
		}

		if ( el.dataset ) el.dataset[dsKey] = "1";

		try { handler.init( $scope ); } catch (e) {
			// Fail gracefully — do not break the entire page.
			if ( window.console && console.warn ) console.warn("ELMAUVE widget init failed:", dsKey, e);
		}
	};

	
	ELMAUVE.windowWidth = $(window).width();

ELMAUVE.is_touch_device = function () {
  return 'ontouchstart' in window // works on most browsers 
      || 'onmsgesturechange' in window; // works on ie10
}

ELMAUVE.isMobileDevice = function () {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

ELMAUVE.general = function () {
// jquery.lazy is an orphan (assets/js/jquery.lazy.js is never enqueued), so
// $.fn.Lazy never exists. The selector normally matches nothing - but W3 Total
// Cache's Lazy Load rewrites every <img> to class="lazy", which made this call
// throw and abort the whole document-ready chain (audio players, magnific
// popup and the CF7 handler all died silently). Bail unless the lib exists.
if ( !$.fn || typeof $.fn.Lazy !== 'function' ) { return; }
$("img.lazy").each(function() {
			var currentImg = $(this);
			
			$(this).Lazy({
				onFinishedAll: function() {
					currentImg.parent("div.post_img_hover").removeClass("lazy");
		        }
			});
		});
}


//audioPlayerInit
ELMAUVE.audioPlayerInit = function () {
        // Same guard as magnificPopupLoad: $.fn.audioPlayer comes from the theme bundle.
        if ( typeof $.fn.audioPlayer !== 'function' ) { return; }

        $('.audio-wraper').each(function() {
	
	if($(this).hasClass('active')) {
	$(this).find('audio').audioPlayer();
	}
	$(this).removeClass("active");
	
	});
	
	}

ELMAUVE.parallaxInit = function () {
// Image headers: the theme moves them without scroll-time JavaScript where the browser
// can (msNativeParallax in its jquery.custom.js); jarallax is fetched only for the rest.
if ( typeof window.msNativeParallax === 'function' ) {
$(".parallax-enabled.parallax-image:not(.parallax-video)").each(function () {
         if ( window.msNativeParallax(this, 0.8, -100) ) { $(this).css('opacity', 1); }
      });
}
if ( ! $(".parallax-enabled.parallax-image:not(.parallax-video):not([data-ms-parallax-engine]), .parallax-videof").length ) return;
// jarallax is loaded on-demand (theme split jquery.plugins.js) — ensure before use.
ensureJarallax(function () {
$(".parallax-enabled.parallax-image:not(.parallax-video):not([data-ms-parallax-engine])").each(function () {
         $(this).jarallax({
            speed: 0.8,
            type: 'scroll',
            imgPosition: '50% 50%',
			onCoverImage: function() {
			var $element = $(this.$item);
            $element.css('opacity', 1);
        }
         })
      });

      var parallaxVideo = $('.parallax-videof'),
         speed = 0.8;

      $(parallaxVideo).each(function () {
	  
	  var individualSpeed = $(this).hasClass('parallax-disabledf') ? 1 : 0.8;

         $(this).jarallax({
            speed: individualSpeed,
            videoSrc: $(this).attr('data-video'),
            videoStartTime: $(this).data('start'),
            videoEndTime: $(this).data('end'),
            autoplay: 1,
            videoLoop: 1,
            videoPlayOnlyVisible: true,
            noIos: false
         });

      });
	}); // msEnsureJarallax
	  }

//magnific popup
ELMAUVE.magnificPopupLoad = function () {
        // magnificPopup ships in the THEME's jquery.plugins bundle. When that file hasn't
        // executed yet or was mangled (stale WP Rocket/SGO combine after an update, logged-in
        // vs guest asset sets), calling it would throw INSIDE $(document).ready and kill every
        // init after it — same failure class as the $.fn.Lazy/W3TC bug fixed in 4.36.
        if ( typeof $.fn.magnificPopup !== 'function' ) { return; }

				$('.lightbox-gallery-link').each(function() {
					var _this = $(this),
						items = [],
						target = $( _this.attr('href') );
						
					target.find('.post-gallery-content').each(function() {
						items.push({
							src: $(this),
type: 'inline'							
						});
					});
					
					_this.on('click', function() {
						$.magnificPopup.open({
							midClick: true,
							mainClass: 'mfp-zoom-in',
							removalDelay: 300,
							closeBtnInside: true,
							items: items,
							overflowY: 'hidden',
							verticalFit: true,
							gallery: {
								enabled: true,
								arrowMarkup: '<i class="mfp-arrow mfp-arrow-%dir%"></i>',
							},
                  callbacks: {
            open: function() {
			var self = this;

					self.wrap.find('.mfp-container').addClass('mfp-image-holder');
					setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 300);
					
                $.magnificPopup.instance.next = function() {
				
                    var self = this;
					 self.wrap.removeClass('mfp-image-loaded');
				$.magnificPopup.proto.next.call(	
setTimeout(function() {
        self.wrap.addClass('mfp-image-loaded');
      }, 400));

                   
                }
                $.magnificPopup.instance.prev = function() {
				
                    var self = this;
					self.wrap.removeClass('mfp-image-loaded');
                  				$.magnificPopup.proto.prev.call(	
setTimeout(function() {
        self.wrap.addClass('mfp-image-loaded');
      }, 400));
                    
                }
            }
	
        }
						});
						return false;
					});
					
				});
	

	

        $('.popup-youtube, .popup-vimeo, .popup-gmaps').each(function() { // the containers for all your galleries
            $(this).magnificPopup({
                disableOn: 320,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 300,
                preloader: false,
                fixedContentPos: false,
            });
        });

        $('.newsletter-ajax-popup').magnificPopup({
            type: 'inline',
            tClose: '',
            fixedContentPos: true,
            fixedBgPos: true,

            overflowY: 'auto',

            closeBtnInside: true,
            preloader: false,

            midClick: true,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in newsletter-ajax'
        });
		
		    $('.magnificpopup-enabled').find('.post__holder .isopad a:not(.nolightbox)').each(function(i, el){
      var href_value = el.href;
      if (/\.(jpg|jpeg|png|gif)$/.test(href_value)){
        $(this).magnificPopup({
            tClose: '',
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: false,
            fixedContentPos: true,
			removalDelay: 300,
            mainClass: 'mfp-zoom-in',  
                    image: {
markup: 
            '<div class="mfp-wrapper"><div class="mfp-contain"><div class="mfp-bottom-bar">'+
              '<div class="mfp-title"></div>'+
              '<div class="mfp-counter"></div>'+
            '</div>'+
'<div class="mfp-figure">'+
            '<div class="mfp-img"></div>'+
          '</div></div></div>',
                        verticalFit: true,
                        titleSrc: function(item) {
                            var caption = item.el.find('img').attr('alt');
							return caption;
                        }
                    },
                  callbacks: {
            open: function() {
                //overwrite default prev + next function. Add timeout for css3 crossfade animation
                $.magnificPopup.instance.next = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.next.call(self); }, 120);
                }
                $.magnificPopup.instance.prev = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.prev.call(self); }, 120);
                }
            },
            imageLoadComplete: function() { 
                var self = this;
                setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
            }
        }
        });
      }
    });
	
        $('.image-popup-no-margins').magnificPopup({
            tClose: '',
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: false,
            fixedContentPos: true,
            removalDelay: 300,
            mainClass: 'mfp-zoom-in',
            image: {
			markup: 
            '<div class="mfp-wrapper"><div class="mfp-contain"><div class="mfp-bottom-bar">'+
              '<div class="mfp-title"></div>'+
            '</div>'+
'<div class="mfp-figure">'+
            '<div class="mfp-img"></div>'+
          '</div></div></div>',
                verticalFit: true,
				                        titleSrc: function(item) {
                            var caption = item.el.find('img').attr('alt');
							return caption;
                        }
            },
            callbacks: {
                imageLoadComplete: function() { 
                var self = this;
                setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
            }
            }
        });
        $('.zoom-gallery').each(function() { // the containers for all your galleries
            $(this).magnificPopup({
                tClose: '',
                delegate: 'a.zoomer',
                type: 'image',
                closeOnContentClick: false,
                closeBtnInside: true,
                mainClass: 'mfp-zoom-in',
				removalDelay: 300,
				closeMarkup: '<span title="%title%" class="mfp-close">x</span>',
                image: {
				markup: 
            '<div class="mfp-wrapper"><div class="mfp-counter"></div><div class="mfp-contain"><div class="mfp-bottom-bar">'+
              '<div class="mfp-title"></div>'+
            '</div>'+
'<div class="mfp-figure">'+
            '<div class="mfp-close"></div>'+
            '<div class="mfp-img"></div>'+
          '</div></div></div>',
                    verticalFit: true,
                    titleSrc: function(item) {
                        var caption = item.el.attr('title');
                        return caption;
                        
                    }
                },
                gallery: {
                    enabled:true,
			tCounter: '%curr%/%total%',
			arrowMarkup: '<i class="mfp-arrow mfp-arrow-%dir%"></i>',
                },
                  callbacks: {
            open: function() {
                //overwrite default prev + next function. Add timeout for css3 crossfade animation
                $.magnificPopup.instance.next = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.next.call(self); }, 120);
                }
                $.magnificPopup.instance.prev = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.prev.call(self); }, 120);
                }
            },
            imageLoadComplete: function() { 
                var self = this;
                setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
            }
        }
            });
        });
        $('.popup-with-zoom-anim').magnificPopup({
            tClose: '',
            type: 'inline',

            fixedContentPos: false,
            fixedBgPos: true,

            overflowY: 'auto',

            closeBtnInside: true,
            preloader: false,

            midClick: true,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in',
            focus: '.sb-search-input',

            // When elemened is focused, some mobile browsers in some cases zoom in
            // It looks not nice, so we disable it:
            callbacks: {
                beforeOpen: function() {
                    if ($(window).width() < 700) {
                        this.st.focus = false;
                    } else {
                        this.st.focus = '.sb-search-input';
                    }
                },
                afterClose: function() {

                }
            }
        });
    }
//justified gallery
ELMAUVE.justifiedgalleryInit = function () {


        $('div[id^="justifiedgall_"]').each(function() {
            var captions_data = $(this).attr('data-captions') == 'true' ? true : false,
                margins_data = $(this).attr('data-margins'),
				selector = $(this).attr('data-selector'),
				lastrow = $(this).attr('data-lastrow') ? $(this).attr('data-lastrow') : 'justify',
				rtl_data = $(this).attr('data-rtl') == 'true' ? true : false,
				pinit = $(this).attr('data-pinit') != 'false' ? true : false,
                randomize_data = $(this).attr('data-randomize') == 'true' ? true : false,
                rowheight_data = $(this).attr('data-rowheight'),
				closetext = $(this).attr('data-backtostory') ? $(this).attr('data-backtostory') : 'back to story';
				
            $(this).justifiedGallery({
                rowHeight: rowheight_data,
                maxRowHeight: null,
                margins: margins_data,
                selector: "div:not(.spinner)",
                border: 0,
                lastRow: lastrow,
                captions: captions_data,
				rtl: rtl_data,
                randomize: randomize_data,
            }).on('jg.complete', function() {
			if(pinit == true) {
                $(this).find($("div", this)).pinIt();
				}
                if ($('.grid')[0]) {
                    $(".grid").masonry();
                }
                $(this).magnificPopup({
                    delegate: '.jg-entry a:not(.pinterest-share-icon)',
                    type: 'image',
                    closeOnContentClick: false,
                    closeBtnInside: true,
                    mainClass: 'mfp-zoom-in',
					removalDelay: 300,
					closeMarkup: '<span title="%title%" class="mfp-close">'+ closetext +'</span>',
                    image: {
markup: 
            '<div class="mfp-wrapper"><div class="mfp-counter"></div><div class="mfp-contain"><div class="mfp-bottom-bar">'+
              '<div class="mfp-title"></div>'+

            '</div>'+
'<div class="mfp-figure">'+
            '<div class="mfp-close"></div>'+
            '<div class="mfp-img"></div>'+
          '</div></div></div>',
                        verticalFit: true,
                        titleSrc: function(item) {
                            var caption = '',
							title = item.el.find('img').attr('data-title'),
							excerpt = item.el.find('img').attr('data-excerpt'),
							content = item.el.find('img').attr('data-content');
							
							if(title) {
							caption += '<h6>' + title + '</h6>';
							}
							if(title) {
							caption += '<p>' + excerpt + '</p>';
							}
							if(content) {
							caption += '<small>' + content + '</small>';
							}

							return caption;
                        }
                    },
                    gallery:{
            enabled:true,
			tCounter: '%curr%/%total%',
			arrowMarkup: '<i class="mfp-arrow mfp-arrow-%dir%"></i>',
			
        },

                  callbacks: {
            open: function() {
                //overwrite default prev + next function. Add timeout for css3 crossfade animation
                $.magnificPopup.instance.next = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.next.call(self); }, 120);
                }
                $.magnificPopup.instance.prev = function() {
                    var self = this;
                    self.wrap.removeClass('mfp-image-loaded');
                    setTimeout(function() { $.magnificPopup.proto.prev.call(self); }, 120);
                }
            },
            imageLoadComplete: function() { 
                var self = this;
                setTimeout(function() { self.wrap.addClass('mfp-image-loaded'); }, 16);
            }
        }
                });
								$('.'+selector).on('click', function () {
    $('#'+selector).magnificPopup('open');
});
            });
        });
    }
	


//swiperCarousel
function swiperJarallaxResize() {
    const parallaxElements = document.querySelectorAll('.swiper-slide .cover-wrapper[data-parallax="parallax-enabled"]');
    if (!parallaxElements.length) return;
    // jarallax is loaded on-demand (theme split jquery.plugins.js) — ensure before use.
    ensureJarallax(function () {
        parallaxElements.forEach(element => {
            jarallax(element, 'onScroll');
        });
    });
}


function swiperJarallaxInit(slides) {
    if (!slides || !slides.length) return;

    // Only pull in jarallax when a slide actually needs it (parallax cover or video slide) —
    // a plain image slideshow must not trigger the on-demand load.
    var needsJarallax = slides.some(function (slide) {
        return slide.querySelector('.cover-wrapper:not(.slide-video)[data-parallax="parallax-enabled"]') ||
               slide.querySelector('.cover-wrapper.slide-video');
    });
    if (!needsJarallax) return;

    ensureJarallax(function () {
        slides.forEach(slide => {
            // Query all cover wrappers except video ones
            const coverWrappers = slide.querySelectorAll('.cover-wrapper:not(.slide-video)');
            coverWrappers.forEach(coverWrapper => {
                if (coverWrapper.dataset.parallax === 'parallax-enabled') {
                    jarallax(coverWrapper, {
                        noIos: false,
                        imgPosition: '50% 50%',
                        speed: 0.73 // Apply specific speed for non-video
                    });
                }
            });

            // Handle video cover wrappers
            const coverVideos = slide.querySelectorAll('.cover-wrapper.slide-video');
            coverVideos.forEach(coverVideo => {
                // Create a fresh properties object for each video cover wrapper
                let videoProperties = {
                    noIos: false,
                    imgPosition: '50% 50%',
                    speed: coverVideo.dataset.parallax === 'parallax-enabled' ? 0.83 : 1
                };

                if (coverVideo.dataset.videoplayback === 'video-playback-on') {
                    jarallax(coverVideo, {
                        ...videoProperties,
                        videoSrc: coverVideo.dataset.video,
                        videoStartTime: coverVideo.dataset.videostart,
                        videoEndTime: coverVideo.dataset.videoend,
                        videoPlayOnlyVisible: true
                    });
                } else {
                    jarallax(coverVideo, videoProperties);
                }
            });
        });
    });
}
ELMAUVE.swiperCarousel = function( $scope ) {

  // Guard: Swiper is optional.
  if (typeof window.Swiper === "undefined") return;

  // Scope to this widget if provided; otherwise fallback to document.
  var rootEl = ($scope && $scope.length) ? $scope[0] : document;

  var swipers = rootEl.querySelectorAll('.swiper-container-elementor');
  if (!swipers || !swipers.length) return;

  // Swiper 11 is now global on this page, which breaks Elementor's lightbox.
  ELMAUVE.lightboxLazyFix();

  swipers.forEach(function (swiperContainer) {

    // Destroy previous instance (Elementor re-render safety)
    if (swiperContainer.swiper) {
      try { swiperContainer.swiper.destroy(true, true); } catch (e) {}
      swiperContainer.swiper = null;
    }

    var d = swiperContainer.dataset || {};

    var autoplayConfig = (d.autoPlay === 'true') ? {
      delay: parseInt(d.autoPlayTimeout, 10) || 5000,
      pauseOnMouseEnter: true
    } : false;

    // IMPORTANT: scope navigation/pagination to this widget instance
    var widgetRoot = swiperContainer.closest(".elementor-widget") || rootEl;

    var nextBtn = widgetRoot.querySelector('.mainslideshow-next');
    var prevBtn = widgetRoot.querySelector('.mainslideshow-prev');
    var paginationEl = widgetRoot.querySelector('.mainslideshow-pagination');

    var navigationConfig = (d.nav === 'true' && nextBtn && prevBtn) ? {
      nextEl: nextBtn,
      prevEl: prevBtn
    } : false;

    // Determine effect and adjust slidesPerView accordingly
    var effect = (d.effect === 'true') ? "fade" : "";
    var items  = parseInt(d.items, 10) || 1;
    var tablet = parseInt(d.tablet, 10) || Math.min(items, 2);
    var mobile = parseInt(d.mobile, 10) || 1;
    var margin = parseInt(d.margin, 10) || 0;

    var slidesPerView = (effect === "fade") ? 1 : items;

    swiperContainer.swiper = new Swiper(swiperContainer, {
      loop: true,
      speed: 800,
      parallax: true,
      autoplay: autoplayConfig,
      pagination: (d.pagination === 'true' && paginationEl) ? {
        el: paginationEl,
        dynamicBullets: false,
        clickable: true
      } : false,
      navigation: navigationConfig,
      effect: effect,
      centeredSlides: (d.center === 'true'),
      slidesPerView: slidesPerView,
      spaceBetween: margin,
      // Swiper breakpoints are min-width based. The old map was shifted one
      // slot (768+ used the MOBILE count, the tablet count only kicked in at
      // 1201-1440) — tablets and small desktops never showed what the widget's
      // Tablet/Desktop controls said. Standard mapping: <768 mobile,
      // 768-1024 tablet, 1025+ desktop.
      breakpoints: {
        0:    { slidesPerView: (effect === "fade") ? 1 : mobile, spaceBetween: margin },
        480:  { slidesPerView: (effect === "fade") ? 1 : mobile, spaceBetween: margin },
        768:  { slidesPerView: (effect === "fade") ? 1 : tablet },
        1025: { slidesPerView: (effect === "fade") ? 1 : items }
      },
      on: {
        init: function () { swiperJarallaxInit(this.slides); },
        resize: swiperJarallaxResize,
        slideChange: swiperJarallaxResize
      }
    });

  });

};

//ajax load more
ELMAUVE.ajaxloadmore = function () {
		if ( 'undefined' === typeof window.load_more_query ) {
			window.load_more_query = [];
		}

		function ms_set_load_more_label( object, text ) {
			var $button = $( object );
			$button.text( text );
			if ( $button.hasClass( 'style1' ) ) {
				$button.append( '<span aria-hidden="true"></span>' );
			}
		}

		/**
		 * Get next posts
		 */
		function ms_ajax_get_posts( object ) {
			// Every trigger shares the same lock, including rapid manual clicks.
			if ( $( object ).data( 'loading' ) || !$( object ).data( 'settings' ) ) { return; }
			var container = $( object ).closest( '.post-archive' );

			var settings = $( object ).data( 'settings' );
			var page = $( object ).data( 'page' );

			$( object ).data( 'loading', true );
			$( object ).data( 'load-error', false );

			function onError() {
				// Stop automatic retries; leave a visible button for a manual retry.
				$( object ).data( 'loading', false ).data( 'load-error', true )
					.closest( '.pagination-below' ).removeClass( 'd-none' );
				ms_set_load_more_label( object, settings.translation.load_more );
			}

			// Set button text to Load More.
			ms_set_load_more_label( object, settings.translation.loading );

			var data = {
				action: 'ms_ajax_load_more',
				page: page,
				posts_per_page: settings.posts_per_page,
				query_data: settings.query_data,
				attributes: settings.attributes,
				options: settings.options,
				nonce: settings.nonce,
			};

			// Request Url.
			var ms_pagination_url;

			if ( 'ajax_restapi' === settings.type ) {
				ms_pagination_url = settings.rest_url;
			} else {
				ms_pagination_url = settings.url;
			}

			// Send Request.
			$.post( ms_pagination_url, data, function( res ) {
				if ( res && res.success && res.data && typeof res.data.content === 'string' ) {

					// Get the posts.
					var data = $( res.data.content ).filter( function() { return this.nodeType === 1; } );

					// Check if there're any posts.
					if ( data.length ) {

						// Append IMMEDIATELY — the old code parked the whole batch inside
						// imagesLoaded(), so the new posts only showed up after EVERY image
						// in the batch finished downloading (seconds of dead time on slow
						// connections). Posts appear instantly now; the masonry grid
						// re-layouts progressively as each image arrives.
						$( container ).find( '.layout_wrapper' ).append( data );

						animateOnView(".block:not(.shown)");

						var $grid = $( container ).find('.grid-layout');
						if ( $grid.length ) {
							try { $grid.masonry('appended', data, true); } catch (e) {}
							data.imagesLoaded().progress( function() {
								try { $grid.masonry('layout'); } catch (e) {}
							});
						}

						ELMAUVE.justifiedgalleryInit();
						ELMAUVE.swiperCarousel();
						ELMAUVE.audioPlayerInit();
						ELMAUVE.magnificPopupLoad();
						ELMAUVE.parallaxInit();

							// WP Post Load trigger.
							$( document.body ).trigger( 'post-load' );

							// Reinit Facebook widgets. #fb-root often exists while the FB
							// global is undefined (adblock/consent blocker/slow SDK) — the
							// bare call threw a ReferenceError and killed the success path.
							if ( $( '#fb-root' ).length && window.FB && window.FB.XFBML ) {
								window.FB.XFBML.parse();
							}

							// Set button text to Load More.
							ms_set_load_more_label( object, settings.translation.load_more );
							
							

							// Increment a page.
							page = page + 1;

							$( object ).data( 'page', page );

							// Set the loading state.
							$( object ).data( 'loading', false );

					}

					// Remove Button on Posts End.
					if ( res.data.posts_end || !data.length ) {

						// Remove Load More button.
						$( object ).remove();
					}
					var scrollHandling = $( object ).data( 'scrollHandling' );
					if ( scrollHandling && scrollHandling.allow ) {
						$( object ).closest( '.pagination-below' ).addClass( 'd-none' );
					}
					ms_queue_load_more_check();

				} else {
					onError();
				}
			} ).fail( onError );
		}

		/**
		 * Initialization Load More
		 */
		function ms_load_more_init( infinite ) {
			$( '.post-archive' ).each( function() {

				if ( $( this ).data( 'init' ) ) {
					return;
				}

				var ms_ajax_settings;

				if ( typeof ms_ajax_pagination !== 'undefined' ) {
					ms_ajax_settings = ms_ajax_pagination;
					
				}

				var archive_data = $( this ).data( 'archive-data' );

				if ( archive_data ) {
				
					ms_ajax_settings = JSON.parse( window.atob( archive_data ) );

				}

				  if (ms_ajax_settings) {

                if (!infinite && ms_ajax_settings.infinite_load) {
                    return;
                }

                $(this).find('.ajax-pagination').append('<a href="#" class="' + ms_ajax_settings.buttontype + '">' + ms_ajax_settings.translation.load_more + '<span></span></a>');

                // Set load more settings.
                $(this).find('.load-more').data('settings', ms_ajax_settings);
                $(this).find('.load-more').data('page', 2);
                $(this).find('.load-more').data('loading', false);
                $(this).find('.load-more').data('scrollHandling', {
                    allow: ms_ajax_settings.infinite_load === true || ms_ajax_settings.infinite_load === 'true'
                });
            }

				$( this ).data( 'init', true );
			} );
		}

		ms_load_more_init( true );


		// Check without waiting for a scroll: the first batch may fit on screen.
		// Measure the visible grid, never the pagination hidden with display:none.
		var msLmTicking = false;
		function ms_queue_load_more_check() {
			if ( msLmTicking ) { return; }
			msLmTicking = true;
			window.requestAnimationFrame( function() {
				msLmTicking = false;
				var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
				$( '.post-archive .load-more' ).each( function() {
					var scrollHandling = $( this ).data( 'scrollHandling' );
					if ( !scrollHandling || !scrollHandling.allow || $( this ).data( 'loading' ) || $( this ).data( 'load-error' ) ) { return; }
					var grid = $( this ).closest( '.post-archive' ).find( '.layout_wrapper' )[0];
					if ( !grid || !grid.getClientRects().length ) { return; }
					var rect = grid.getBoundingClientRect();
					if ( rect.bottom >= 0 && rect.bottom <= viewportHeight + 300 ) {
						ms_ajax_get_posts( this );
					}
				} );
			} );
		}
		$( window ).off( '.msLoadMore' ).on( 'scroll.msLoadMore resize.msLoadMore orientationchange.msLoadMore load.msLoadMore pageshow.msLoadMore', ms_queue_load_more_check );

		// Images, masonry and previously hidden widgets can change height later.
		// Replace the observer when Elementor initializes another widget.
		if ( ELMAUVE.msLoadMoreObserver ) { ELMAUVE.msLoadMoreObserver.disconnect(); }
		if ( 'ResizeObserver' in window ) {
			ELMAUVE.msLoadMoreObserver = new ResizeObserver( ms_queue_load_more_check );
			$( '.post-archive .layout_wrapper' ).each( function() {
				ELMAUVE.msLoadMoreObserver.observe( this );
			} );
		}
		ms_queue_load_more_check();

		// On Click Event — namespaced + off first (same stacking issue as scroll).
		$( 'body' ).off( 'click.msLoadMore', '.load-more' ).on( 'click.msLoadMore', '.load-more', function( e ) {
			e.preventDefault();
			var loading = $( this ).data( 'loading' );

			if ( !loading ) {
				ms_ajax_get_posts( this );
			}
		} );
	};

	// Numbered Blog Posts pagination. Uses the same compact controls as the
	// Products widget, but keeps the Blog Posts query/templates intact.
	// The page items are real links to /page/N/ (crawlable); a click loads the page
	// by AJAX and puts its URL in the address bar, Back/Forward switch pages again.
	ELMAUVE.blogNumberPagination = function( $scope ) {
		$scope.find( '.blog_post_content_wrapper[data-blog-pagination="linksnumber"]' ).each( function() {
			var root = this;
			if ( root._mauveBlogPager ) { return; }
			root._mauveBlogPager = true;

			// data-blog-url = ".../page/%#%/"; no URLs are pushed in the Elementor editor preview.
			var editMode = !!( window.elementorFrontend && elementorFrontend.isEditMode && elementorFrontend.isEditMode() );
			var pageUrl = function( n ) {
				var tpl = root.getAttribute( 'data-blog-url' );
				var first = root.getAttribute( 'data-blog-url-first' );
				if ( !tpl || editMode ) { return ''; }
				return ( n <= 1 && first ) ? first : tpl.replace( '%#%', n );
			};
			// Items rendered in an AJAX response have no href yet.
			var linkNav = function() {
				root.querySelectorAll( '.mauve-blog-pagination a.mauve-blog-page[data-page]' ).forEach( function( a ) {
					var url = pageUrl( parseInt( a.getAttribute( 'data-page' ), 10 ) );
					if ( url ) { a.setAttribute( 'href', url ); }
				} );
			};
			var current = parseInt( root.getAttribute( 'data-blog-page' ), 10 ) || 1;
			if ( pageUrl( current ) && window.history && history.replaceState ) {
				history.replaceState( $.extend( {}, history.state, { mauveBlogPage: current } ), '' );
			}

			root._mauveBlogLoad = function( page, push ) {
				var pages = parseInt( root.getAttribute( 'data-blog-pages' ), 10 ) || 1;
				var encoded = root.getAttribute( 'data-archive-data' );
				if ( !encoded || !page || page < 1 || page > pages || root.classList.contains( 'is-page-loading' ) ) { return; }

				var settings;
				try { settings = JSON.parse( window.atob( encoded ) ); } catch ( error ) { return; }
				var endpoint = settings.type === 'ajax_restapi' ? settings.rest_url : settings.url;
				if ( !endpoint ) { return; }

				root.classList.add( 'is-page-loading' );
				root.setAttribute( 'aria-busy', 'true' );
				var nav = root.querySelector( '.mauve-blog-pagination' );
				if ( nav ) { nav.setAttribute( 'aria-busy', 'true' ); }

				$.post( endpoint, {
					action: 'ms_ajax_load_more',
					page: page,
					posts_per_page: settings.posts_per_page,
					query_data: settings.query_data,
					attributes: settings.attributes,
					options: settings.options,
					nonce: settings.nonce
				}, function( response ) {
					if ( !response || !response.success || !response.data || typeof response.data.content !== 'string' ) { return; }

					var $layout = $( root ).find( '.layout_wrapper' ).first();
					var $items = $( response.data.content ).filter( function() { return this.nodeType === 1; } );
					if ( !$layout.length || !$items.length ) { return; }

					$layout.empty().append( $items );
					root.setAttribute( 'data-blog-page', response.data.page || page );
					root.setAttribute( 'data-blog-pages', response.data.pages || pages );

					if ( response.data.pagination ) {
						var oldNav = root.querySelector( '.mauve-blog-pagination' );
						if ( oldNav ) { oldNav.outerHTML = response.data.pagination; }
					}
					linkNav();
					if ( push && pageUrl( page ) && window.history && history.pushState ) {
						history.pushState( { mauveBlogPage: page }, '', pageUrl( page ) );
					}

					animateOnView( '.block:not(.shown)' );
					if ( $layout.hasClass( 'grid-layout' ) || $layout.hasClass( 'layout_metro_masonrys' ) ) {
						try { $layout.masonry( 'reloadItems' ).masonry( 'layout' ); } catch ( error ) {}
						$layout.imagesLoaded().progress( function() {
							try { $layout.masonry( 'layout' ); } catch ( error ) {}
						} );
					}

					ELMAUVE.justifiedgalleryInit();
					ELMAUVE.swiperCarousel();
					ELMAUVE.audioPlayerInit();
					ELMAUVE.magnificPopupLoad();
					ELMAUVE.parallaxInit();
					ELMAUVE.blogFloatingInit( $( root ).closest( '.elementor-element' ) );
					$( document.body ).trigger( 'post-load' );

					var top = root.getBoundingClientRect().top + ( window.pageYOffset || document.documentElement.scrollTop ) - 40;
					if ( ( window.pageYOffset || document.documentElement.scrollTop ) > top ) {
						window.scrollTo( { top: Math.max( 0, top ), behavior: window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ? 'auto' : 'smooth' } );
					}
				} ).always( function() {
					root.classList.remove( 'is-page-loading' );
					root.removeAttribute( 'aria-busy' );
					var currentNav = root.querySelector( '.mauve-blog-pagination' );
					if ( currentNav ) { currentNav.removeAttribute( 'aria-busy' ); }
				} );
			};

			root.addEventListener( 'click', function( event ) {
				var button = event.target.closest ? event.target.closest( '.mauve-blog-page' ) : null;
				if ( !button || !root.contains( button ) || button.disabled || button.classList.contains( 'is-current' ) || button.classList.contains( 'is-disabled' ) ) { return; }
				// Ctrl/Cmd/Shift/middle click: let the browser open /page/N/ itself.
				if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0 ) { return; }
				event.preventDefault();
				root._mauveBlogLoad( parseInt( button.getAttribute( 'data-page' ), 10 ), true );
			} );
		} );

		// Back/Forward: page from the history entry, else from the URL (/page/N/).
		if ( !ELMAUVE._blogPopstate ) {
			ELMAUVE._blogPopstate = true;
			window.addEventListener( 'popstate', function( event ) {
				var page = event.state && event.state.mauveBlogPage;
				if ( !page ) {
					var match = window.location.pathname.match( /\/page\/(\d+)\/?$/ );
					page = match ? parseInt( match[1], 10 ) : 1;
				}
				document.querySelectorAll( '.blog_post_content_wrapper[data-blog-pagination="linksnumber"][data-blog-url]' ).forEach( function( root ) {
					if ( root._mauveBlogLoad && parseInt( root.getAttribute( 'data-blog-page' ), 10 ) !== page ) {
						root._mauveBlogLoad( page, false );
					}
				} );
			} );
		}
	};
//
function animateOnView(selector) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    $(".layout_wrapper:not(.noeffect)").each(function() { 
        let scopedSelector = $(this).find(selector);

        ScrollTrigger.batch(scopedSelector, {
            onEnter: (batch) => {
                batch.forEach((el, i) => {
                    let animationSettings = {
                        autoAlpha: 1, 
                        y: 0,
                        duration: 0.7, 
                        delay: i * 0.18,
                        ease: "power1.out",
                        onStart: () => $(el).addClass("shown")
                    };

                    let initialSettings = el.closest('.effect-1') ? { autoAlpha: 0 } : { autoAlpha: 0, y: 120 };

                    gsap.fromTo(el, initialSettings, animationSettings);
                });
            },
            once: true,
        });
    });
}


ELMAUVE.blogposts = function( $scope ) {

  var $gridLayouts = $scope.find(".grid-layout");
  var $metroLayouts = $scope.find(".layout_metro_masonrys");

  $gridLayouts.each(function() {
    var grid = $(this);

    grid.imagesLoaded().progress(function() {
      grid.masonry({
        itemSelector: ".block",
        columnWidth: ".block:not(.specialpost)",
        transitionDuration: 0
      });
    });
  });

  $metroLayouts.each(function() {
    var grid = $(this);

    grid.imagesLoaded().progress(function() {
      grid.masonry({
        itemSelector: ".blog-posts-metro",
        columnWidth: ".blog-posts-metro",
        gutter: 0
      });

      grid.find(".blog-posts-metro").each(function(i, el) {
        setTimeout(function() {
          $(el).addClass("shown");
        }, i * 150);
      });
    });

    if ( $.fn && typeof $.fn.Lazy === 'function' ) {
    grid.find("img.lazy_masonry").each(function() {
      var currentImg = $(this);
      currentImg.parent("div.post_img_hover").removeClass("lazy");

      $(this).Lazy({
        onFinishedAll: function() {
          grid.masonry('layout');
        }
      });
    });
    }
  });

  animateOnView( $scope.find(".block:not(.shown)") );
  ELMAUVE.ajaxloadmore();
	ELMAUVE.blogNumberPagination( $scope );
  ELMAUVE.parallaxInit();
  ELMAUVE.blogFloatingInit( $scope );
};

ELMAUVE.blogFloatingDestroy = function( $scope ) {
  $scope.find('.blog_post_content_wrapper').each(function() {
    if (this._mauveBlogFloating) {
      this._mauveBlogFloating.destroy();
      this._mauveBlogFloating = null;
    }
  });
};

ELMAUVE.blogFloatingInit = function( $scope ) {
  $scope.find('.blog_post_content_wrapper[data-blog-float="1"]').each(function() {
    var root = this;
    if (root._mauveBlogFloating) { root._mauveBlogFloating.destroy(); }

    var strength = Math.max(0, Math.min(60, parseFloat(root.dataset.blogFloatStrength) || 0));
    if (!strength || !window.IntersectionObserver) { return; }

    var inertia = Math.max(0, Math.min(600, parseFloat(root.dataset.blogFloatInertia) || 120));
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobile = window.matchMedia('(max-width: 767px)');
    var allowMobile = root.dataset.blogFloatMobile !== '0';
    var states = new Map(), visible = new Set(), frame = 0, last = 0;

    function disabled() { return reduced.matches || (!allowMobile && mobile.matches); }
    function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
    function schedule() {
      if (!frame && visible.size && !disabled() && !document.hidden) { frame = requestAnimationFrame(tick); }
    }
    function tick(time) {
      frame = 0;
      var ease = inertia ? 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / inertia) : 1;
      var moving = false, updates = [];
      last = time;
      visible.forEach(function(item) {
        var state = states.get(item), rect = item.getBoundingClientRect();
        if (!state || !state.el) { return; }
        var progress = Math.max(-1, Math.min(1, (innerHeight - 2 * rect.top - rect.height) / (innerHeight + rect.height)));
        var target = progress * strength * state.direction;
        state.y += (target - state.y) * ease;
        if (Math.abs(target - state.y) > .05) { moving = true; } else { state.y = target; }
        updates.push(state);
      });
      updates.forEach(function(state) { state.el.style.setProperty('--mbp-float-y', state.y.toFixed(3) + 'px'); });
      if (moving) { schedule(); } else { last = 0; }
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { visible.add(entry.target); } else { visible.delete(entry.target); }
      });
      if (!visible.size) { stop(); } else { schedule(); }
    }, { rootMargin: '80px' });

    function refresh() {
      states.forEach(function(state, item) {
        if (!root.contains(item)) { observer.unobserve(item); visible.delete(item); states.delete(item); }
      });
      root.querySelectorAll('.layout_wrapper > .block').forEach(function(item, index) {
        if (states.has(item)) { return; }
        var inner = item.querySelector('.main-post-container');
        if (!inner) { return; }
        states.set(item, { el: inner, y: 0, direction: index % 2 ? -1 : 1 });
        observer.observe(item);
      });
      schedule();
    }
    function preference() {
      stop();
      if (disabled()) {
        states.forEach(function(state) { state.y = 0; state.el.style.removeProperty('--mbp-float-y'); });
      } else { schedule(); }
    }
    function visibility() { if (document.hidden) { stop(); } else { schedule(); } }
    var list = root.querySelector('.layout_wrapper');
    var mutation = list && window.MutationObserver ? new MutationObserver(refresh) : null;
    if (mutation) { mutation.observe(list, { childList: true }); }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);
    if (!allowMobile) { mobile.addEventListener('change', preference); }
    refresh();

    root._mauveBlogFloating = {
      destroy: function() {
        stop();
        observer.disconnect();
        if (mutation) { mutation.disconnect(); }
        states.forEach(function(state) { state.el.style.removeProperty('--mbp-float-y'); });
        states.clear(); visible.clear();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        document.removeEventListener('visibilitychange', visibility);
        reduced.removeEventListener('change', preference);
        if (!allowMobile) { mobile.removeEventListener('change', preference); }
      }
    };
  });
};


		
//Mainmenu
ELMAUVE.MainMenu = function () {
		if ( $( '.ms_navigation_wrapper' ).length ) {
		
		$(".ms_navigation_wrapper").each(function() {
		var parentDiv = $(this);
		
		parentDiv.closest( '.e-child' ).addClass('fullmenu');
				});
		}
}
		
ELMAUVE.BackgroundListDestroy = function( $scope ) {
  if ( !$scope || !$scope.length ) { return; }
  $scope.find( ".mauve_background_list_column" ).off( ".mauveBackgroundList" );
  $scope.find( ".msbl-scroll-expand-stage" ).each( function() {
	if ( typeof this._mauveStickyExpandDestroy === "function" ) { this._mauveStickyExpandDestroy(); }
  } );
};

// Same helper as in mauve-motion-effects.js (either file can be on a page without the
// other): moves the page by whole pixels so nothing on screen moves after content above
// the viewport was taken out, keeping Lenis smooth scrolling in step.
if ( !window.msStickyExpandShiftScroll ) {
  window.msStickyExpandShiftScroll = function( delta ) {
	delta = Math.round( delta );
	if ( !delta ) { return; }
	var lenis = window.MS_Lenis;
	if ( lenis && typeof lenis.animatedScroll === "number" ) {
	  lenis.animatedScroll += delta;
	  lenis.targetScroll += delta;
	  var animation = lenis.animate;
	  if ( animation && animation.isRunning ) {
		animation.value += delta;
		animation.to += delta;
		animation.from += delta;
	  }
	}
	window.scrollBy( 0, delta );
	// Same task: ScrollTrigger must not see the new scroll position with the old layout.
	window.msStickyExpandRefreshTriggers( "now" );
  };
  // GSAP ScrollTrigger (Sticky Sections) keeps the page positions it measured; after the
  // page has changed length they are recalculated - once things are quiet, or with `soon`
  // on the next frame.
  window.msStickyExpandRefreshTriggers = function( soon ) {
	if ( !window.ScrollTrigger || typeof window.ScrollTrigger.refresh !== "function" ) { return; }
	window.clearTimeout( window.msStickyExpandRefreshTimer );
	window.cancelAnimationFrame( window.msStickyExpandRefreshFrame || 0 );
	var run = function() { window.ScrollTrigger.refresh(); };
	if ( soon === "now" ) { run(); }
	else if ( soon ) { window.msStickyExpandRefreshFrame = window.requestAnimationFrame( run ); }
	else { window.msStickyExpandRefreshTimer = window.setTimeout( run, 300 ); }
  };
  window.msStickyExpandLastTouch = 0;
  var msStickyExpandTouched = function() { window.msStickyExpandLastTouch = Date.now(); };
  window.addEventListener( "touchstart", msStickyExpandTouched, { passive: true } );
  window.addEventListener( "touchmove", msStickyExpandTouched, { passive: true } );
  window.addEventListener( "touchend", msStickyExpandTouched, { passive: true } );
}

ELMAUVE.BackgroundList = function( $scope ) {

  // Find background list wrappers only inside this widget
  $scope.find(".mauve_background_list_wrapper").each(function() {

    var $parent = $(this);

    // Select only the columns belonging to this wrapper
    var $columns = $parent.children(".mauve_background_list_column");
    $columns.off("mouseenter.mauveBackgroundList");

    /**
     * On hover:
     * - remove the active state from all background images
     * - activate the image related to the hovered column
     */
    $columns.on("mouseenter.mauveBackgroundList", function() {
      $parent.find(".mauve_background_img").removeClass("hover");
      $(this).next(".mauve_background_img").addClass("hover");
    });

  });

  $scope.find( ".msbl-scroll-expand-stage" ).each( function() {
	var stage = this;
	var panel = stage.firstElementChild;
	if ( !panel || !panel.classList.contains( "mauve_background_list_wrapper" ) ) { return; }
	if ( typeof stage._mauveStickyExpandDestroy === "function" ) { stage._mauveStickyExpandDestroy(); }

	var expandDistance = Math.max( 100, Math.min( 3000, parseInt( stage.dataset.expandDistance, 10 ) || 500 ) );
	var holdDistance = Math.max( 0, Math.min( 4000, parseInt( stage.dataset.holdDistance, 10 ) || 0 ) );
	var topOffset = Math.max( 0, Math.min( 300, parseInt( stage.dataset.topOffset, 10 ) || 0 ) );
	var disableMobile = stage.dataset.disableMobile === "true";
	// Default: once grown the panel stays grown and on the way back up scrolls past like
	// any section - no pinning, no shrinking - until it has left the screen at the bottom.
	var stayExpanded = stage.dataset.return !== "reverse";
	var reduced = window.matchMedia( "(prefers-reduced-motion: reduce)" );
	var mobile = window.matchMedia( "(max-width: 767px)" );
	var raf = 0;
	var resizeTimer = 0;
	var idleTimer = 0;
	var initialHeight = 0;
	var targetHeight = 0;
	var runway = 0;
	var locked = false;
	var collapsed = 0;
	var lastScrollTop = -1;
	var appliedHeight = "";
	var destroyed = false;

	var reset = function() {
	  stage.classList.remove( "is-ready" );
	  stage.style.removeProperty( "height" );
	  stage.style.removeProperty( "--msbl-sticky-top" );
	  panel.style.removeProperty( "height" );
	  appliedHeight = "";
	};

	// The stretch of the stage the panel has already travelled through lies above it:
	// scrolling back up would show it as an empty band and pin the panel again. It is
	// taken out and the page moved by the same amount, so nothing on screen moves and the
	// panel starts right where it is. What is left still pins it when scrolling on down.
	var collapseTravelled = function() {
	  if ( !locked || destroyed ) { return; }
	  var rect = stage.getBoundingClientRect();
	  var travelled = Math.floor( Math.min( runway, Math.max( 0, topOffset - rect.top ) ) );
	  if ( travelled < 1 ) { return; }
	  var root = document.documentElement;
	  var anchoring = root.style.getPropertyValue( "overflow-anchor" );
	  root.style.setProperty( "overflow-anchor", "none" );
	  runway -= travelled;
	  collapsed += travelled;
	  stage.style.height = ( targetHeight + runway ) + "px";
	  window.msStickyExpandShiftScroll( stage.getBoundingClientRect().bottom - rect.bottom );
	  if ( anchoring ) { root.style.setProperty( "overflow-anchor", anchoring ); }
	  else { root.style.removeProperty( "overflow-anchor" ); }
	  lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
	};

	var idle = function() {
	  idleTimer = 0;
	  collapseTravelled();
	};

	var update = function() {
	  raf = 0;
	  if ( destroyed || !stage.classList.contains( "is-ready" ) ) { return; }
	  var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
	  var stageRect = stage.getBoundingClientRect();
	  var progress = Math.max( 0, Math.min( 1, ( topOffset - stageRect.top ) / expandDistance ) );
	  if ( stayExpanded && locked && stageRect.top >= window.innerHeight - 1 ) {
		// Gone below the bottom of the screen: back to the start, out of sight.
		measure( true );
		window.msStickyExpandRefreshTriggers();
		return;
	  }
	  if ( stayExpanded && !locked && progress >= 1 ) { locked = true; }
	  var movingUp = lastScrollTop >= 0 && scrollTop < lastScrollTop - 0.5;
	  lastScrollTop = scrollTop;
	  var eased = locked ? 1 : progress * progress * ( 3 - 2 * progress );
	  // The height is the only thing that changes. (A progress custom property used to be
	  // written here as well: nothing read it, and as an inherited property it made the
	  // browser restyle the whole widget on every frame - three times the work.)
	  var height = ( initialHeight + ( targetHeight - initialHeight ) * eased ).toFixed( 2 ) + "px";
	  if ( height !== appliedHeight ) {
		panel.style.height = height;
		appliedHeight = height;
	  }
	  if ( locked ) {
		// The travelled stretch goes once the scrolling rests - or at once when the page
		// turns back up, except on touch screens where that would cut a fling short.
		window.clearTimeout( idleTimer );
		idleTimer = window.setTimeout( idle, 150 );
		if ( movingUp && Date.now() - ( window.msStickyExpandLastTouch || 0 ) >= 2500 ) { collapseTravelled(); }
	  }
	};

	var schedule = function() {
	  if ( !raf ) { raf = window.requestAnimationFrame( update ); }
	};

	// The whole setup again - unless part of the stage has been taken out above the screen:
	// putting it back would push the page down under the reader (a phone's toolbar resizes
	// the window while scrolling). Then only the full height follows the new window.
	var measure = function( restart ) {
	  if ( destroyed ) { return; }
	  if ( restart !== true && locked && collapsed > 0 && !( reduced.matches || ( disableMobile && mobile.matches ) ) ) {
		targetHeight = Math.max( initialHeight, window.innerHeight - topOffset );
		stage.style.height = ( targetHeight + runway ) + "px";
		appliedHeight = "";
		schedule();
		return;
	  }
	  if ( raf ) { window.cancelAnimationFrame( raf ); raf = 0; }
	  window.clearTimeout( idleTimer );
	  locked = false;
	  collapsed = 0;
	  lastScrollTop = -1;
	  runway = expandDistance + holdDistance;
	  reset();
	  if ( reduced.matches || ( disableMobile && mobile.matches ) ) { return; }
	  initialHeight = Math.max( 1, Math.ceil( panel.getBoundingClientRect().height ) );
	  targetHeight = Math.max( initialHeight, window.innerHeight - topOffset );
	  stage.style.setProperty( "--msbl-sticky-top", topOffset + "px" );
	  stage.style.height = ( targetHeight + runway ) + "px";
	  panel.style.height = initialHeight + "px";
	  appliedHeight = initialHeight + "px";
	  stage.classList.add( "is-ready" );
	  update();
	};

	var resize = function() {
	  window.clearTimeout( resizeTimer );
	  resizeTimer = window.setTimeout( measure, 120 );
	};
	var mediaChange = function() { measure(); };
	var addMediaListener = function( query ) {
	  if ( query.addEventListener ) { query.addEventListener( "change", mediaChange ); }
	  else if ( query.addListener ) { query.addListener( mediaChange ); }
	};
	var removeMediaListener = function( query ) {
	  if ( query.removeEventListener ) { query.removeEventListener( "change", mediaChange ); }
	  else if ( query.removeListener ) { query.removeListener( mediaChange ); }
	};

	window.addEventListener( "scroll", schedule, { passive: true } );
	window.addEventListener( "resize", resize );
	addMediaListener( reduced );
	addMediaListener( mobile );
	stage._mauveStickyExpandDestroy = function() {
	  destroyed = true;
	  if ( raf ) { window.cancelAnimationFrame( raf ); }
	  window.clearTimeout( resizeTimer );
	  window.clearTimeout( idleTimer );
	  window.removeEventListener( "scroll", schedule );
	  window.removeEventListener( "resize", resize );
	  removeMediaListener( reduced );
	  removeMediaListener( mobile );
	  reset();
	  stage._mauveStickyExpandDestroy = null;
	};

	measure();
	if ( document.fonts && document.fonts.ready ) {
	  document.fonts.ready.then( function() { if ( !destroyed ) { measure(); } } );
	}
  } );

};

ELMAUVE.JustifiedGallery = {

  init: function( $scope ) {

    if (typeof $.fn.justifiedGallery === "undefined") return;

    $scope.find(".gallery_justified_content_wrapper.do_justified").each(function() {

      var $grid = $(this);

      if ($grid.data("jg")) {
        $grid.justifiedGallery("destroy");
      }

      $grid.imagesLoaded().always(function() {
        $grid.justifiedGallery({
          rowHeight: parseInt($grid.data("row_height")) || 200,
          margins: parseInt($grid.data("margin")) || 10,
          captions: false,
          lastRow: $grid.data("justify_last_row") === "yes" ? "justify" : "nojustify"
        });
      });
    });
  }
};



ELMAUVE.TestimonialCarousel = function( $scope ) {

  // Guard: Swiper is optional.
  if (typeof window.Swiper === "undefined") return;

  // Scope to this widget if provided; otherwise fallback to document.
  var rootEl = ($scope && $scope.length) ? $scope[0] : document;

  var containers = rootEl.querySelectorAll(".testimonials-container");
  if (!containers || !containers.length) return;

  // Swiper 11 is now global on this page, which breaks Elementor's lightbox.
  ELMAUVE.lightboxLazyFix();

  containers.forEach(function(swiperContainer) {

    // Destroy previous instance (Elementor re-render safety)
    if (swiperContainer.swiper) {
      try { swiperContainer.swiper.destroy(true, true); } catch (e) {}
      swiperContainer.swiper = null;
    }

    var d = swiperContainer.dataset || {};

    var isAutoplay   = d.autoPlay === "true";
    var isNav        = d.nav === "true";
    var isPagination = d.pagination === "true";
    var isAutoHeight = d.autoHeight === "true";
    var isCentered   = d.center === "true";

    var effect = (d.effect === "true") ? "fade" : "";

    var items  = parseInt(d.items, 10);
    items = Number.isFinite(items) ? items : 1;

    var tablet = parseInt(d.tablet, 10);
    tablet = Number.isFinite(tablet) ? tablet : Math.min(items, 2);

    var mobile = parseInt(d.mobile, 10);
    mobile = Number.isFinite(mobile) ? mobile : 1;

    var margin = parseInt(d.margin, 10);
    margin = Number.isFinite(margin) ? margin : 0;

    var slidesPerView = (effect === "fade") ? 1 : items;

    var autoplayConfig = false;
    if (isAutoplay) {
      var timeout = parseInt(d.autoPlayTimeout, 10);
      timeout = Number.isFinite(timeout) ? timeout : 5000;
      autoplayConfig = { delay: timeout, pauseOnMouseEnter: true };
    }

    // IMPORTANT: scope navigation/pagination to this widget instance
    var widgetRoot = swiperContainer.closest(".elementor-widget") || rootEl;

    var nextBtn = widgetRoot.querySelector(".ms-swiper-button-next");
    var prevBtn = widgetRoot.querySelector(".ms-swiper-button-prev");
    var paginationEl = widgetRoot.querySelector(".testi-pagination");

    var navigationConfig = false;
    if (isNav && nextBtn && prevBtn) {
      navigationConfig = { nextEl: nextBtn, prevEl: prevBtn };
    }

    // Swiper 11 loops only with ceil(slidesPerView) slides (one more when centred on an even
    // number) plus the slides it moves at once: 4 for two centred testimonials stepping one by one.
    // With fewer it drops the loop half-way (console warning, dots that jump), so the testimonials
    // are repeated until there are enough. The dots stay one per testimonial and are the widget's
    // own (testimonialDots below); they move up to half the testimonials at once.
    var wrapperEl = swiperContainer.querySelector(".swiper-wrapper");
    if (wrapperEl) {
      wrapperEl.querySelectorAll(".ms-testi-copy").forEach(function(copy) { copy.remove(); });
    }
    var originals = wrapperEl ? Array.prototype.filter.call(wrapperEl.children, function(slide) {
      return slide.classList.contains("swiper-slide");
    }) : [];
    var count = originals.length;
    var widest = (effect === "fade") ? 1 : Math.max(items, tablet, mobile);
    var loopView = Math.ceil(widest);
    if (isCentered && loopView % 2 === 0) loopView += 1;
    var useLoop = count > 1;
    var ownPagination = useLoop && isPagination && paginationEl;
    var room = ownPagination ? Math.max(1, Math.floor(count / 2)) : 1;
    var copies = (useLoop && count < loopView + room) ? Math.ceil((loopView + room) / count) - 1 : 0;
    for (var copyRound = 0; copyRound < copies; copyRound++) {
      originals.forEach(function(slide) {
        var copy = slide.cloneNode(true);
        copy.classList.add("ms-testi-copy");
        wrapperEl.appendChild(copy);
      });
    }

    var paginationConfig = false;
    if (isPagination && paginationEl && !ownPagination) {
      paginationConfig = { el: paginationEl, dynamicBullets: false, clickable: true };
    }

    swiperContainer.swiper = new Swiper(swiperContainer, {
      loop: useLoop,
      speed: 1200,
      autoHeight: isAutoHeight,
      parallax: false,
      autoplay: autoplayConfig,
      pagination: paginationConfig,
      navigation: navigationConfig,
      effect: effect,
      centeredSlides: isCentered,
      slidesPerView: slidesPerView,
      spaceBetween: margin,
      breakpoints: {
        0:   { slidesPerView: (effect === "fade") ? 1 : mobile,  spaceBetween: margin },
        480: { slidesPerView: (effect === "fade") ? 1 : mobile,  spaceBetween: margin },
        767: { slidesPerView: (effect === "fade") ? 1 : mobile },
        992: { slidesPerView: (effect === "fade") ? 1 : tablet },
        1200:{ slidesPerView: (effect === "fade") ? 1 : items }
      }
    });

    if (ownPagination) {
      testimonialDots(swiperContainer.swiper, paginationEl, count, copies + 1);
    }

  });

  // One dot per testimonial (the slides may be repeated): a dot goes to the nearest copy of its
  // testimonial, the shorter way round, and lights up for every copy.
  // Not Swiper's slideToLoop: in 11.0.7 it re-arranges the loop around the target, and going
  // backwards that first jumps without animation; its loopFix also makes room for one step only.
  // Here slides are carried round the loop one at a time, each move compensated so the view
  // does not change, until everything the step will show exists; then the carousel glides.
  function testimonialDots(swiper, el, count, sets) {
    var total = count * sets;
    var bullets = [];
    var pending = null;
    el.innerHTML = "";
    el.classList.add("swiper-pagination-bullets", "swiper-pagination-horizontal");

    // Slides shown left and right of the active one at the current breakpoint.
    function reach() {
      var view = Math.ceil(parseFloat(swiper.params.slidesPerView) || 1);
      return swiper.params.centeredSlides
        ? { before: Math.ceil((view - 1) / 2), after: Math.ceil((view - 1) / 2) }
        : { before: 0, after: view - 1 };
    }

    function shown(index, sides) {
      return index - sides.before >= 0 && index + sides.after <= swiper.slides.length - 1;
    }

    // Carries the first slide to the end (forward) or the last one to the start, without a visible
    // change; refuses when that slide is on screen.
    function carry(forward, sides) {
      var slides = swiper.slides;
      var active = swiper.activeIndex;
      if (forward ? active - sides.before <= 0 : active + sides.after >= slides.length - 1) return false;
      var slide = forward ? slides[0] : slides[slides.length - 1];
      slide.swiperLoopMoveDOM = true;
      if (forward) swiper.slidesEl.append(slide);
      else swiper.slidesEl.prepend(slide);
      slide.swiperLoopMoveDOM = false;
      swiper.recalcSlides();
      swiper.slideTo(forward ? active - 1 : active + 1, 0, false, true);
      return true;
    }

    function goTo(target) {
      if (swiper.destroyed) return;
      if (swiper.animating) {
        pending = target;
        return;
      }
      var step = Infinity;
      for (var set = 0; set < sets; set++) {
        var distance = (((target + set * count - swiper.realIndex) % total) + total) % total;
        if (distance > total / 2) distance -= total;
        if (Math.abs(distance) < Math.abs(step)) step = distance;
      }
      if (!step || !Number.isFinite(step)) return;
      var sides = reach();
      for (var guard = 0; guard < total && !shown(swiper.activeIndex + step, sides); guard++) {
        if (!carry(step > 0, sides)) break;
      }
      swiper._clientLeft = swiper.wrapperEl.clientLeft;
      swiper.slideTo(swiper.activeIndex + step);
    }

    // A dot clicked while the carousel is moving is taken as soon as it stops.
    swiper.on("transitionEnd", function() {
      if (pending === null) return;
      var target = pending;
      pending = null;
      goTo(target);
    });

    function mark() {
      var active = swiper.realIndex % count;
      bullets.forEach(function(bullet, index) {
        bullet.classList.toggle("swiper-pagination-bullet-active", index === active);
      });
    }

    for (var index = 0; index < count; index++) {
      var bullet = document.createElement("span");
      bullet.className = "swiper-pagination-bullet";
      bullet.setAttribute("role", "button");
      bullet.setAttribute("tabindex", "0");
      bullet.setAttribute("aria-label", "Go to slide " + (index + 1));
      bullet.addEventListener("click", goTo.bind(null, index));
      bullet.addEventListener("keydown", function(target, event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        goTo(target);
      }.bind(null, index));
      el.appendChild(bullet);
      bullets.push(bullet);
    }
    swiper.on("slideChange realIndexChange", mark);
    mark();
  }

};


/* global gsap, SplitText */

ELMAUVE.SliderParallax = function( $scope ) {
	
// Register SplitText once (safe to call multiple times)
  if (window.gsap && window.SplitText) {
    gsap.registerPlugin(SplitText);
  }
  
  var $slideshows = ($scope && $scope.length) ? $scope.find('.slider_parallax_wrapper') : $('.slider_parallax_wrapper');
  if (!$slideshows.length) return;

  // Zoe Booking popup bridge: caption buttons with .ms-zoe-popup-btn open the
  // first Zoe popup-mode instance on the page. Preferred path clicks Zoe's own
  // launcher (its handler portals + caches the modal); the fallback opens the
  // modal directly when only the modal markup is present. Requires a Zoe
  // Booking widget / [ms_booking popup="yes"] shortcode somewhere on the page —
  // with neither, the click is left alone (dead # link).
  $(document).off('click.msZoePopup').on('click.msZoePopup', '.ms-zoe-popup-btn', function (e) {
    var $zoeLauncher = $('.ms-booking-popup-btn').first();
    if ($zoeLauncher.length) {
      e.preventDefault();
      $zoeLauncher.trigger('click');
      return;
    }
    var $modal = $('.ms-booking-modal').first();
    if (!$modal.length) return;
    e.preventDefault();
    if (!$modal.parent().is('body')) $modal.appendTo(document.body);
    $modal.removeAttr('hidden');
    requestAnimationFrame(function () { $modal.addClass('is-open'); });
    $('body').addClass('ms-booking-modal-open');
  });
  
  function msGetAutoplayDuration($slideshow) {
  var timer = parseInt($slideshow.attr('data-autoplay'), 10) || 0;
  return timer > 0 ? timer : 0;
}

function msHasAutoplay($slideshow) {
  return msGetAutoplayDuration($slideshow) > 0;
}
function msIsElementorEditor() {
  return !!(
    window.elementorFrontend &&
    window.elementorFrontend.isEditMode &&
    window.elementorFrontend.isEditMode()
  );
}

// Autoplay scheduler — single source of truth (transitions + the initial kick).
// Viewport-gated: offscreen sliders stop switching (the old chain ran GSAP
// tweens + full SplitText re-splits forever, even scrolled far away).
function msScheduleNext(slideshow) {
  if (msIsElementorEditor()) return;
  var dur = msGetAutoplayDuration(slideshow);
  if (!dur) return;
  clearTimeout(slideshow.data('timeout'));
  if (slideshow.data('msInView') === false) {
    slideshow.data('msAutoResume', true);
    return;
  }
  var t = setTimeout(function () {
    slideshowNext(slideshow, false, true);
  }, dur);
  slideshow.data('timeout', t);
}

function msSetupAutoplayIO($slider) {
  if (!msHasAutoplay($slider)) return;
  if (!('IntersectionObserver' in window)) { $slider.data('msInView', true); return; }
  $slider.data('msInView', true);
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var vis = entries[i].isIntersecting;
      $slider.data('msInView', vis);
      if (!vis) {
        clearTimeout($slider.data('timeout'));
        $slider.data('msAutoResume', true);
      } else if ($slider.data('msAutoResume')) {
        $slider.removeData('msAutoResume');
        msScheduleNext($slider);
      }
    }
  }, { threshold: 0.15 });
  io.observe($slider.get(0));
}

// The slider has a fixed height and absolutely positioned slides, so a caption taller
// than that (a phone turned sideways, a large Content padding) was simply cut off. Give
// the slider the height its tallest caption plus the content padding needs.
function msFitHeight($slider) {
  var wrapper = $slider[0];
  if (!wrapper || wrapper.getAttribute('data-layout') !== 'classic') return;
  wrapper.style.minHeight = '';
  var needed = 0;
  $slider.find('.slide').each(function () {
    var content = this.querySelector('.slide-content'), caption = this.querySelector('.caption');
    if (!content || !caption) return;
    // An inactive slide is display:none: lay it out unseen for the measurement.
    var hidden = window.getComputedStyle(this).display === 'none';
    var display = this.style.display, visibility = this.style.visibility;
    if (hidden) { this.style.display = 'block'; this.style.visibility = 'hidden'; }
    var box = window.getComputedStyle(content), cap = window.getComputedStyle(caption);
    needed = Math.max(needed, caption.offsetHeight + (parseFloat(cap.marginTop) || 0) + (parseFloat(cap.marginBottom) || 0) + (parseFloat(box.paddingTop) || 0) + (parseFloat(box.paddingBottom) || 0));
    if (hidden) { this.style.display = display; this.style.visibility = visibility; }
  });
  if (needed > wrapper.clientHeight + 1) wrapper.style.minHeight = Math.ceil(needed) + 'px';
}

function msSetupFitHeight($slider) {
  msFitHeight($slider);
  if ($slider.data('msFitInit')) return;
  $slider.data('msFitInit', true);
  // Captions wrap differently per width, and web fonts change their height once loaded.
  if (typeof ResizeObserver === 'function') {
    var observer = new ResizeObserver(function () { msFitHeight($slider); });
    $slider.find('.slide-content, .caption').each(function () { observer.observe(this); });
  }
  if (!ELMAUVE._mspFitBound) {
    ELMAUVE._mspFitBound = true;
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        $('.slider_parallax_wrapper').each(function () { msFitHeight($(this)); });
      }, 150);
    });
  }
}

// "Enable parallax": the engine of the container Background Parallax, with jarallax
// (the theme's on-demand loader) for the images it turns down.
// A GSAP ScrollTrigger scrub was tried here and rejected: the pre-scale caused
// a visible zoom jump at init and the drift felt weaker/heavier than jarallax.
// The option was dead only because nothing ever CALLED the loader for this
// widget after the theme split jquery.plugins.js.
function msSetupParallax($slider) {
  if ($slider.attr('data-parallax') !== '1') return;
  // FRONT ONLY: jarallax binds scroll/resize work per instance — in the editor
  // it just burns CPU while editing (user report). The effect previews on the
  // live front; the editor shows the plain image.
  if (msIsElementorEditor()) return;
  if ($slider.data('msParallaxInit')) return;
  // "Parallax on mobile" off: the image stays as rendered, a plain cover of the slide.
  if ($slider.attr('data-parallax-mobile') === '0') {
    var mobileMax = 767;
    try { mobileMax = elementorFrontend.config.responsive.activeBreakpoints.mobile.value || mobileMax; } catch (e) {}
    // A phone turned sideways is wider than the breakpoint; its shorter side is not.
    // (Touch only: a laptop at 150% scaling reports a 720px tall screen as well.)
    var shortSide = window.screen ? Math.min(window.screen.width, window.screen.height) : 0;
    var phone = shortSide > 0 && shortSide <= mobileMax && window.matchMedia('(pointer: coarse)').matches;
    if (phone || window.matchMedia('(max-width: ' + mobileMax + 'px)').matches) return;
  }

  var $containers = $slider.find('.slide .image-container.jarallax');
  if (!$containers.length) return;
  $slider.data('msParallaxInit', true);

  // The image goes to the browser-driven engine where it is available (see
  // msTryNativeParallaxImage): jarallax moves it from a script, which shakes on phones.
  // jarallax is fetched only for the images that engine turns down.
  $containers.each(function () {
    var el = this, $el = $(this);
    if ($el.data('msJarallaxDone')) return;
    $el.data('msJarallaxDone', true);
    function viaJarallax() {
      ensureJarallax(function () {
        try {
          $el.jarallax({
            speed: 0.8,
            type: 'scroll',
            imgPosition: '50% 50%'
          });
        } catch (e) {}
      });
    }
    var img = $el.children('img.jarallax-img')[0];
    if (img && typeof window.msTryNativeParallaxImage === 'function' &&
        window.msTryNativeParallaxImage(el, img, 0.8, { size: 'cover', position: '50% 50%' }, viaJarallax)) return;
    viaJarallax();
  });
}
  // ---------------------------------------------------------------------------
  // GSAP + SplitText requirement (no fallbacks)
  // ---------------------------------------------------------------------------
  if (!window.gsap || !window.SplitText) {
    if (window.console && console.warn) console.warn("ELMAUVE.SliderParallax skipped (requires GSAP + SplitText).");
    return;
  }
  gsap.registerPlugin(SplitText);

  // ---------------------------------------------------------------------------
  // Split caption animation helpers (enabled only if data-caption-mode="split")
  //
  // Supported data attributes on .slider_parallax_wrapper:
  // - data-caption-mode="split" | "legacy"
  // - data-caption-anim="fade_up_short" | "fade_down_short" | "fade_left_short" | "fade_right_short"
  // - data-caption-stagger-subtitle="60"  (ms between items)
  // - data-caption-stagger-title="40"     (ms between items)
  //
  // Split granularity switches (user can change these in Elementor attributes):
  // - data-caption-split-subtitle="words" | "chars"
  // - data-caption-split-title="words" | "chars"
  // - data-caption-split-text="none" | "words" | "chars"   (optional; default: none)
  // ---------------------------------------------------------------------------

  /**
   * Store original HTML so we can restore the element exactly as it was.
   * SplitText wraps content in spans, so we must revert/restore before re-splitting.
   */
  function msStoreOriginal($el) {
    if (!$el || !$el.length) return;
    if (!$el.attr("data-ms-original")) {
      $el.attr("data-ms-original", $el.html());
    }
  }

  /**
   * Revert a previous SplitText instance if it exists, otherwise restore original HTML.
   * This keeps the DOM clean when switching slides repeatedly.
   */
  function msRevertSplit($el) {
    if (!$el || !$el.length) return;

    var inst = $el.data("msSplitInst");
    if (inst && typeof inst.revert === "function") {
      inst.revert();
      $el.removeData("msSplitInst");
    }

    var original = $el.attr("data-ms-original");
    if (original != null) {
      $el.html(original);
    }
  }

  /**
   * Split element into "words" or "chars" using SplitText and return a jQuery collection of parts.
   * Always reverts previous split first to avoid nested wrappers.
   */
function msSplitText($el, mode, mask) {
  if (!$el || !$el.length) return $();

  msStoreOriginal($el);
  msRevertSplit($el);

  // Normalize values
  mode = String(mode || "words").toLowerCase();
  mask = mask ? String(mask).toLowerCase() : null;

  // Allow only supported modes
  if (mode !== "words" && mode !== "chars" && mode !== "lines") {
    mode = "words";
  }

  // Allow only supported masks
  if (mask && mask !== "lines" && mask !== "words" && mask !== "chars") {
    mask = null;
  }

  // For "lines" we use "lines,words" (more reliable line wrapping)
  var type = mode;
if (mode === "lines") type = "lines,words";
if (mode === "chars") type = "words,chars"; 


  var config = {
    type: type,
    wordsClass: "ms-animated-word ms-animated-text-block",
    charsClass: "ms-animated-char ms-animated-text-block",
    linesClass: "ms-animated-line"
  };

  // Enable mask only when provided
  if (mask) {
    config.mask = mask; // "lines" | "words" | "chars"
  }

  var inst = SplitText.create($el.get(0), config);
  $el.data("msSplitInst", inst);

  // Return the requested parts
  if (mode === "lines") return $(inst.lines);
  if (mode === "chars") return $(inst.chars);
  return $(inst.words);
}

  /**
   * Convert a slider attribute value to a safe split mode.
   */
  function msNormalizeSplitMode(value, defaultMode) {
    var v = String(value || defaultMode || "words").toLowerCase();
    if (v === "chars") return "chars";
    if (v === "words") return "words";
    if (v === "none") return "none";
    return defaultMode || "words";
  }

  /**
   * Map your existing "anim" option to GSAP fromVars.
   */
  function msCaptionFromVars(anim) {
    if (anim === "fade_down_short") return { opacity: 0, y: -20 };
    if (anim === "fade_left_short") return { opacity: 0, x: 20 };
    if (anim === "fade_right_short") return { opacity: 0, x: -20 };
	
	if (anim === "fade_up_long") return { opacity: 0, y: 50 };
	if (anim === "fade_down_long") return { opacity: 0, y: -50 };
    if (anim === "fade_left_long") return { opacity: 0, x: 50 };
    if (anim === "fade_right_long") return { opacity: 0, x: -50 };
	
	
    return { opacity: 0, y: 20 }; // fade_up_short default
  }

  /**
   * Animate a list of items with GSAP using a stagger delay in milliseconds.
   */
  function msGsapAnimate($items, anim, staggerMs) {
    if (!$items || !$items.length) return;

    var fromVars = msCaptionFromVars(anim || "fade_up_short");
    var stagger = Math.max(0, parseInt(staggerMs || 45, 10)) / 1000;

    gsap.killTweensOf($items.toArray());

    gsap.fromTo(
      $items.toArray(),
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: stagger,
        clearProps: "will-change"
      }
    );
  }

  /**
   * Cleanup hook:
   * Revert SplitText wrappers inside the caption of a slide.
   * Call this when leaving a slide to keep the DOM clean and avoid stacking wrappers.
   */
  function msCleanupSlideCaption($slide) {
    if (!$slide || !$slide.length) return;

    var $caption = $slide.find(".caption");
    if (!$caption.length) return;

    // Only revert on elements we may have split:
    var $subtitle = $caption.find(".subtitle").first();
    var $title = $caption.find(".title").first();
    var $text = $caption.find(".text").first();

    if ($subtitle.length) msRevertSplit($subtitle);
    if ($title.length) msRevertSplit($title);
    if ($text.length) msRevertSplit($text);
  }

  /**
   * Animate caption for the given slide if split mode is enabled.
   * - Subtitle and Title can be split into words or chars (user-configurable via data attributes).
   * - Body text can optionally be split too (default: none).
   * - Button is animated as a block.
   */
function msAnimateSlideCaption($slideshow, $slide) {
  if (!$slideshow || !$slideshow.length || !$slide || !$slide.length) return;

  var mode = $slideshow.attr("data-caption-mode") || "legacy";
  if (mode !== "split") return;

  // Drop the first-paint CSS guard in the SAME tick the split fragments get
  // their hidden initial state — no repaint happens in between, so the full
  // caption never flashes before the animation.
  $slideshow.removeClass("ms-split-boot");

  var anim = $slideshow.attr("data-caption-anim") || "fade_up_short";
  var staggerSubtitle = $slideshow.attr("data-caption-stagger-subtitle") || "60";
  var staggerTitle = $slideshow.attr("data-caption-stagger-title") || "80";

  // User settings
  var subtitleSplit = msNormalizeSplitMode($slideshow.attr("data-caption-split-subtitle"), "words"); // words|chars|none
  var titleSplit = String($slideshow.attr("data-caption-split-title") || "words").toLowerCase();     // words|chars|lines|none

  var $caption = $slide.find(".caption");
  if (!$caption.length) return;

  var $subtitle = $caption.find(".subtitle").first();
  var $titleWrap = $caption.find(".title").first();
  var $text = $caption.find(".text").first();
  var $btn = $caption.find("a.elementor-button, a.button, .elementor-button").first();

  // IMPORTANT: Your .title contains <h2>...</h2>. SplitText works best on the inner heading node.
  var $titleTarget = $titleWrap.find("h1,h2,h3,h4,h5,h6").first();
  if (!$titleTarget.length) $titleTarget = $titleWrap;

  // Always revert before splitting (in case this slide is re-activated)
  if ($subtitle.length) msRevertSplit($subtitle);
  if ($titleTarget.length) msRevertSplit($titleTarget);
  if ($text.length) msRevertSplit($text);

  // Ensure the title container isn't still hidden from earlier gsap.set(newSlideElements,{alpha:0})
  if ($titleWrap.length) gsap.set($titleWrap.get(0), { autoAlpha: 1 });

  // --------------------
  // SUBTITLE
  // --------------------
  if ($subtitle.length && subtitleSplit !== "none") {
    var $subParts = msSplitText($subtitle, subtitleSplit, null);
    msGsapAnimate($subParts, anim, staggerSubtitle);
  }

  // --------------------
  // TITLE
  // --------------------
  if ($titleTarget.length && titleSplit !== "none") {

    // LINE-BY-LINE reveal
    if (titleSplit === "lines") {

      var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

      // fonts.ready is ASYNC — hide the unsplit heading now, or the full title
      // flashes visible until the promise resolves and the line reveal starts.
      gsap.set($titleTarget.get(0), { autoAlpha: 0 });

      fontsReady.then(function () {
        // Revert again after fonts are ready (prevents wrong line measurement)
        msRevertSplit($titleTarget);

        // Split into words+lines with mask on lines
        var inst = SplitText.create($titleTarget.get(0), {
          type: "words,lines",
          linesClass: "ms-line",
          autoSplit: true,
          mask: "lines"
        });

        $titleTarget.data("msSplitInst", inst);

        gsap.killTweensOf(inst.lines);

        // Lines start masked/offset below — the heading itself can show again.
        gsap.set($titleTarget.get(0), { autoAlpha: 1 });

        gsap.from(inst.lines, {
          duration: 1.2,
          yPercent: 100,
          opacity: 0.7,
          stagger: Math.max(0, parseInt(staggerTitle || 80, 10)) / 1000,
          ease: "expo.out"
        });
      });

    } else {
      // words or chars
      var safeMode = (titleSplit === "chars") ? "chars" : "words";
      var $titleParts = msSplitText($titleTarget, safeMode, null);
      msGsapAnimate($titleParts, anim, staggerTitle);
    }
  }

  // --------------------
  // BODY + BUTTON (keep as before)
  // --------------------
  if (typeof window.gsap !== "undefined") {
    var blocks = [];
    if ($text.length) blocks.push($text.get(0));
    // ALL caption buttons (a slide can have two) join the cascade.
    $caption.find("a.elementor-button, a.button, .elementor-button").each(function () {
      if (blocks.indexOf(this) === -1) blocks.push(this);
    });

    if (blocks.length) {
      gsap.killTweensOf(blocks);
      gsap.fromTo(blocks, { opacity: 0, y: 60 }, {
        opacity: 1,
        y: 0,
        ease: "power3.out",
        duration: 1,
        delay: 0.30,
        stagger: 0.25,
        clearProps: "transform"
      });
    }
  }
}

  function msGetSlideImage($slide) {
    if (!$slide || !$slide.length) return $();

    // działa dla zwykłego <img> i dla jarallax
    var $img = $slide.find('.image-container img.jarallax-img').first();

    if (!$img.length) {
      $img = $slide.find('.image-container img.image').first();
    }

    if (!$img.length) {
      $img = $slide.find('.image-container img').first();
    }

    return $img;
  }

  function msIsImageLoaded($img) {
    if (!$img || !$img.length) return true;

    var img = $img.get(0);
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  function msMarkSlideLoaded($slide) {
    if (!$slide || !$slide.length) return;
    $slide.addClass('is-loaded').attr('data-image-loaded', '1');
  }

  function msWaitForSlideImage($slide, callback) {
    if (!$slide || !$slide.length) {
      if (typeof callback === 'function') callback();
      return;
    }

    // już oznaczony jako loaded
    if ($slide.attr('data-image-loaded') === '1' || $slide.hasClass('is-loaded')) {
      if (typeof callback === 'function') callback();
      return;
    }

    var $img = msGetSlideImage($slide);

    // brak obrazka = nie blokujemy slidera
    if (!$img.length) {
      msMarkSlideLoaded($slide);
      if (typeof callback === 'function') callback();
      return;
    }

    // obraz już jest gotowy
    if (msIsImageLoaded($img)) {
      msMarkSlideLoaded($slide);
      if (typeof callback === 'function') callback();
      return;
    }

    var img = $img.get(0);
    var finished = false;

   function done() {
  if (finished) return;
  finished = true;

  clearTimeout(failSafe);
  $img.off('.msSliderLoad');
  msMarkSlideLoaded($slide);

  if (typeof callback === 'function') callback();
}

    $img.one('load.msSliderLoad error.msSliderLoad', done);

    // decode() + the load event cover every completion path — the old extra
    // 100ms polling interval was redundant work on every slide switch.
    var failSafe = setTimeout(done, 1000);

    if (img && typeof img.decode === 'function') {
      img.decode().then(done).catch(function () {});
    }
  }

 function msPreloadSlideImage($slide) {
  if (!$slide || !$slide.length) return;

  // Dual-split slides carry TWO images — warm all of them, not just the first.
  var $imgs = $slide.find('.image-container img');
  if (!$imgs.length) return;

  $imgs.each(function () {
    var img = this;
    if (!img || img.complete) return;

    // A lazy image inside a hidden slide never starts fetching — force it
    // so the reveal doesn't expose an empty half.
    try { img.loading = 'eager'; } catch (e) {}

    if (typeof img.decode === 'function') {
      img.decode().catch(function () {});
    }
  });
}

  function msPreloadNextSlide($slideshow) {
    if (!$slideshow || !$slideshow.length) return;

    var $slides = $slideshow.find('.slide');
    var $active = $slides.filter('.is-active').first();
    if (!$active.length) return;

    var $next = $active.next('.slide');
    if (!$next.length) $next = $slides.first();

    msPreloadSlideImage($next);
  }
  // ---------------------------------------------------------------------------
  // Slider logic
  // ---------------------------------------------------------------------------
  function slideshowSwitch(slideshow, index, auto) {
    if (slideshow.data('wait')) return;
var slideshowDuration = msGetAutoplayDuration(slideshow);
var autoplayEnabled = msHasAutoplay(slideshow);
    var slides = slideshow.find('.slide');
    var pages = slideshow.find('.pagination');
    var activeSlide = slides.filter('.is-active');
    var activeSlideImage = activeSlide.find('.image-container');
    var activeSlideElements = activeSlide.find('.caption > *');

    var newSlide = slides.eq(index);
    var newSlideImage = newSlide.find('.image-container');
    var newSlideContent = newSlide.find('.slide-content');
    var newSlideElements = newSlide.find('.caption > *');

    if (newSlide.is(activeSlide)) return;

    var timeout = slideshow.data('timeout');
    clearTimeout(timeout);

    // blokujemy kolejne kliknięcia / autoplay dopóki nowy obraz nie będzie gotowy
    slideshow.data('wait', true);

    msWaitForSlideImage(newSlide, function () {

      // gdyby w międzyczasie coś się zmieniło
      if (newSlide.is(activeSlide)) {
        slideshow.data('wait', false);
        return;
      }

      newSlide.addClass('is-new');

      var transition = slideshow.attr('data-transition');
      var isSplit = ((slideshow.attr("data-caption-mode") || "legacy") === "split");

      // The Split layout owns its transition (opposite-motion halves) —
      // the classic width/left transitions would fight the CSS split geometry.
      if ((slideshow.attr('data-layout') || 'classic') === 'split') {
        transition = 'split-layout';
      }

function scheduleNext() {
  msScheduleNext(slideshow);
}

      // In split mode, hide caption blocks immediately to prevent "double animation flash"
      if (isSplit) {
        gsap.set(newSlideElements, { alpha: 0, y: 0, x: 0, clearProps: "transform" });
      }

   // ------------------ SPLIT LAYOUT (opposite-motion halves) ------------------
if (transition == 'split-layout') {
  var durS = 1.1;

  newSlide.css({ display: 'block', zIndex: 2 });

  // Media half reveals upward (clip travels from the bottom), content drops in
  // from above — two opposite motions. clip-path + transforms only: zero
  // per-frame layout, unlike the width/height-based classic transitions.
  // Image reveal direction: 'up' = mask travels bottom→top (default),
  // 'down' = top→bottom — configurable per widget.
  var splitReveal = slideshow.attr('data-split-reveal') || 'up';
  var clipFromTop = 'inset(0% 0% 100% 0%)';    // mask travels top→bottom
  var clipFromBottom = 'inset(100% 0% 0% 0%)'; // mask travels bottom→top
  var clipA = (splitReveal === 'down') ? clipFromTop : clipFromBottom;
  var yA = (splitReveal === 'down') ? -6 : 6;
  // Dual-image split: the second (right) half reveals in the OPPOSITE
  // direction to the first, so the two photos scissor past the caption.
  var $mediaB = newSlideImage.filter('.msp-media-b');
  var $mediaA = $mediaB.length ? newSlideImage.not('.msp-media-b') : newSlideImage;
  gsap.set($mediaA, { clipPath: clipA, yPercent: yA });
  if ($mediaB.length) {
    gsap.set($mediaB, { clipPath: (splitReveal === 'down') ? clipFromBottom : clipFromTop, yPercent: -yA });
  }
  // The incoming slide's content panel has an OPAQUE background — at z-index 2
  // it covered the outgoing caption instantly, so its fade-out was invisible
  // ("text just disappears"). Start the new panel transparent and fade it in
  // once the old caption has visibly faded away.
  gsap.set(newSlideContent, { autoAlpha: 0 });
  // alpha (opacity only), NOT autoAlpha — autoAlpha leaves visibility:hidden
  // on departing captions; the cleanup below only cleared opacity/transform,
  // so on the SECOND visit to a slide everything but the title stayed hidden.
  if (!isSplit) gsap.set(newSlideElements, { alpha: 0, y: -24 });

  var tlS = gsap.timeline({
    onComplete: function () {
      newSlide.addClass('is-active').removeClass('is-new');
      activeSlide.removeClass('is-active');
      if (isSplit) msCleanupSlideCaption(activeSlide);

      newSlide.css({ display: '', zIndex: '' });
      gsap.set(newSlideImage, { clearProps: 'all' });
      gsap.set(newSlideContent, { clearProps: 'all' });
      gsap.set(activeSlideImage, { clearProps: 'all' });
      gsap.set(newSlideElements, { clearProps: 'all' });
      activeSlideElements.css({ opacity: '', transform: '', visibility: '' });

      slideshow.find('.pagination').trigger('check');
      slideshow.data('wait', false);

      msAnimateSlideCaption(slideshow, newSlide);
      if (!msIsElementorEditor()) msPreloadNextSlide(slideshow);
      scheduleNext();
    }
  });

  tlS.to(activeSlideElements, { alpha: 0, y: 16, duration: 0.45, ease: 'power2.in' }, 0)
     .to(activeSlideImage, { yPercent: -5, duration: durS, ease: 'power3.inOut' }, 0)
     .to($mediaA, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: durS, ease: 'power3.inOut' }, 0.05)
     .to(newSlideContent, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0.35);

  if ($mediaB.length) {
    tlS.to($mediaB, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: durS, ease: 'power3.inOut' }, 0.05);
  }

  if (!isSplit) {
    tlS.to(newSlideElements, { alpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15 }, 0.5);
  }
}

   // ------------------ CLIP REVEAL ------------------
else if (transition == 'clip-reveal') {
  var durC = 1.15;

  newSlide.css({ display: 'block', zIndex: 2 });

  // Incoming slide wipes in from the right; its image counter-moves so the
  // photo appears to stand still while the mask travels. Compositor-friendly
  // (clip-path + transforms), no reflow per frame.
  gsap.set(newSlide, { clipPath: 'inset(0% 0% 0% 100%)' });
  gsap.set(newSlideImage, { xPercent: 10, scale: 1.06, transformOrigin: '50% 50%' });
  // alpha only — see the visibility note in the split-layout branch above.
  if (!isSplit) gsap.set(newSlideElements, { alpha: 0, y: 30 });

  var tlC = gsap.timeline({
    onComplete: function () {
      newSlide.addClass('is-active').removeClass('is-new');
      activeSlide.removeClass('is-active');
      if (isSplit) msCleanupSlideCaption(activeSlide);

      newSlide.css({ display: '', zIndex: '' });
      gsap.set(newSlide, { clearProps: 'clipPath' });
      gsap.set(newSlideImage, { clearProps: 'all' });
      gsap.set(activeSlideImage, { clearProps: 'all' });
      gsap.set(newSlideElements, { clearProps: 'all' });
      activeSlideElements.css({ opacity: '', transform: '', visibility: '' });

      slideshow.find('.pagination').trigger('check');
      slideshow.data('wait', false);

      msAnimateSlideCaption(slideshow, newSlide);
      if (!msIsElementorEditor()) msPreloadNextSlide(slideshow);
      scheduleNext();
    }
  });

  tlC.to(newSlide, { clipPath: 'inset(0% 0% 0% 0%)', duration: durC, ease: 'power4.inOut' }, 0)
     .to(newSlideImage, { xPercent: 0, scale: 1, duration: durC, ease: 'power4.inOut' }, 0)
     .to(activeSlideImage, { xPercent: -6, duration: durC, ease: 'power4.inOut' }, 0)
     .to(activeSlideElements, { alpha: 0, duration: 0.5, ease: 'power2.in' }, 0);

  if (!isSplit) {
    tlC.to(newSlideElements, { alpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15 }, 0.55);
  }
}

   // ------------------ FADE ------------------
else if (transition == 'fade') {
  newSlide.css({ display: 'block', zIndex: 2 });

  // Start hidden + slight offset for cinematic fade
  // (We animate the image container, captions are handled separately)
  gsap.set(newSlideImage, { autoAlpha: 0, y: 20 });

  // Legacy caption prep (only when not in split mode)
  if (!isSplit) {
    gsap.set(newSlideElements, { y: 20, alpha: 0, force3D: true });
  }


// Fade + cinematic camera drift. Zoom direction is configurable so it can
// match Ken Burns instead of fighting it. 'in' starts at EXACTLY full-bleed
// (scale 1) and grows to 1.05 with no end snap-back — starting below 1
// exposed the image edges mid-fade.
var fadeZoom  = slideshow.attr('data-fade-zoom') || 'out';
var zoomIn    = fadeZoom === 'in';
var fromScale = zoomIn ? 1 : (fadeZoom === 'none' ? 1 : 1.04);
var toScale   = zoomIn ? 1.05 : 1;

gsap.fromTo(
  newSlideImage,
  {
    autoAlpha: 0,
    x: 0,     // horizontal drift (subtle)
    y: 0,      // vertical drift (subtle)
    scale: fromScale
  },
  {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: toScale,
    duration: 1.35,
    ease: "power3.out",
    clearProps: zoomIn ? "x,y" : "transform",
    onStart: function () {
      gsap.to(activeSlideElements, {
        alpha: 0,
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: function () {
          if (isSplit) msCleanupSlideCaption(activeSlide);
        }
      });
    },
    onComplete: function () {
      newSlide.addClass('is-active').removeClass('is-new');
      activeSlide.removeClass('is-active');

      newSlide.css({ display: '', zIndex: '' });
      // zoom-in settles at 1.05 — resetting transform here would snap it back.
      if (zoomIn) { newSlideImage.css({ opacity: '' }); }
      else { newSlideImage.css({ opacity: '', transform: '' }); }

      slideshow.find('.pagination').trigger('check');
      slideshow.data('wait', false);

      if (isSplit) {
        gsap.set(newSlideElements, { alpha: 1, x: 0, y: 0, clearProps: "transform" });
      }

      msAnimateSlideCaption(slideshow, newSlide);
	  if (!msIsElementorEditor()) {
  msPreloadNextSlide(slideshow);
}
      scheduleNext();
    }
  }
);


  // Legacy caption entrance ONLY when not split
  if (!isSplit) {
    gsap.fromTo(
      newSlideElements,
      { y: 60, alpha: 0 },
      {
        y: 0,
        alpha: 1,
        ease: "power3.out",
        force3D: true,
        delay: 1.1,
        duration: 1,
        stagger: 0.2
      }
    );
  }
}


    // ------------------ BOTTOM TO TOP ------------------
    else if (transition == 'bottom-to-top') {
      var dur = 1.0;

      var newSlideRight = 0;
      var newSlideLeft = 'unset';
      var newSlideImageRight = -slideshow.height() / 8;
      var newSlideImageLeft = 'unset';
      var newSlideImageToRight = 0;
      var newSlideImageToLeft = 'unset';
      var newSlideContentLeft = 'unset';
      var newSlideContentRight = 0;
      var activeSlideImageLeft = -slideshow.height() / 4;

      newSlide.css({ display: 'block', height: 0, bottom: newSlideRight, top: newSlideLeft, zIndex: 2 });
      newSlideImage.css({ height: slideshow.height(), bottom: newSlideImageRight, top: newSlideImageLeft });
      newSlideContent.css({ height: slideshow.height(), top: newSlideContentLeft, bottom: newSlideContentRight });
      activeSlideImage.css({ top: 0 });

      if (!isSplit) gsap.set(newSlideElements, { y: 20, force3D: true });

      gsap.to(activeSlideImage, { duration: dur, top: activeSlideImageLeft, ease: "power3.inOut" });
      gsap.to(newSlide, { duration: dur, height: slideshow.height(), ease: "power3.inOut" });
      gsap.to(newSlideImage, { duration: dur, bottom: newSlideImageToRight, top: newSlideImageToLeft, ease: "power3.inOut" });

      function finalize() {
        newSlide.addClass('is-active').removeClass('is-new');
        activeSlide.removeClass('is-active');
		if (isSplit) msCleanupSlideCaption(activeSlide);

        newSlide.css({ display: '', height: '', top: '', bottom: '', zIndex: '' });
        newSlideImage.css({ height: '', bottom: '', top: '' });
        newSlideContent.css({ height: '', top: '', bottom: '' });
        newSlideElements.css({ opacity: '', transform: '' });
        activeSlideImage.css({ top: '' });

        slideshow.find('.pagination').trigger('check');
        slideshow.data('wait', false);

        msAnimateSlideCaption(slideshow, newSlide);
		if (!msIsElementorEditor()) {
  msPreloadNextSlide(slideshow);
}
        scheduleNext();
      }

      if (!isSplit) {
        gsap.fromTo(
          newSlideElements,
          { alpha: 0, y: 60 },
          {
            alpha: 1,
            y: 0,
            ease: "power3.out",
            force3D: true,
            delay: 1.2,
            duration: 1,
            stagger: 0.2,
            onComplete: finalize
          }
        );
      } else {
        gsap.delayedCall(dur + 0.05, finalize);
      }
    }

    // ------------------ BOTTOM TO TOP STILL ------------------
    else if (transition == 'bottom-to-top-still') {
      var dur2 = 1.2;

      var newSlideRight2 = 0;
      var newSlideLeft2 = 'unset';
      var newSlideImageRight2 = 0;
      var newSlideImageLeft2 = 'unset';
      var newSlideImageToRight2 = 0;
      var newSlideImageToLeft2 = 'unset';
      var newSlideContentLeft2 = 'unset';
      var newSlideContentRight2 = 0;
      var activeSlideImageLeft2 = 0;

      newSlide.css({ display: 'block', height: 0, bottom: newSlideRight2, top: newSlideLeft2, zIndex: 2 });
      newSlideImage.css({ height: slideshow.height(), bottom: newSlideImageRight2, top: newSlideImageLeft2 });
      newSlideContent.css({ height: slideshow.height(), top: newSlideContentLeft2, bottom: newSlideContentRight2 });
      activeSlideImage.css({ top: 0 });

      if (!isSplit) gsap.set(newSlideElements, { y: 20, force3D: true });

      gsap.to(activeSlideImage, { duration: 0, top: activeSlideImageLeft2, ease: "power3.inOut" });
      gsap.to(newSlide, { duration: dur2, height: slideshow.height() + 1, ease: "power3.inOut" });
      gsap.to(newSlideImage, { duration: 0, bottom: newSlideImageToRight2, top: newSlideImageToLeft2, ease: "power3.inOut" });

      function finalize2() {
        newSlide.addClass('is-active').removeClass('is-new');
        activeSlide.removeClass('is-active');
		if (isSplit) msCleanupSlideCaption(activeSlide);

        newSlide.css({ display: '', height: '', top: '', bottom: '', zIndex: '' });
        newSlideImage.css({ height: '', bottom: '', top: '' });
        newSlideContent.css({ height: '', top: '', bottom: '' });
        newSlideElements.css({ opacity: '', transform: '' });
        activeSlideImage.css({ top: '' });

        slideshow.find('.pagination').trigger('check');
        slideshow.data('wait', false);

        msAnimateSlideCaption(slideshow, newSlide);
		if (!msIsElementorEditor()) {
  msPreloadNextSlide(slideshow);
}
        scheduleNext();
      }

      if (!isSplit) {
        gsap.fromTo(
          newSlideElements,
          { alpha: 0, y: 60 },
          {
            alpha: 1,
            y: 0,
            ease: "power3.out",
            force3D: true,
            delay: 1.2,
            duration: 1,
            stagger: 0.2,
            onComplete: finalize2
          }
        );
      } else {
        gsap.delayedCall(dur2 + 0.05, finalize2);
      }
    }

    // ------------------ RIGHT TO LEFT STILL ------------------
    else if (transition == 'right-to-left-still') {
      var dur3 = 1.2;

      var newSlideRight3 = 0;
      var newSlideLeft3 = 'unset';
      var newSlideImageRight3 = 0;
      var newSlideImageLeft3 = 'unset';
      var newSlideImageToRight3 = 0;
      var newSlideImageToLeft3 = 'unset';
      var newSlideContentLeft3 = 'unset';
      var newSlideContentRight3 = 0;
      var activeSlideImageLeft3 = 0;

      newSlide.css({ display: 'block', width: 0, right: newSlideRight3, left: newSlideLeft3, zIndex: 2 });
      newSlideImage.css({ width: slideshow.width(), right: newSlideImageRight3, left: newSlideImageLeft3 });
      newSlideContent.css({ width: slideshow.width(), left: newSlideContentLeft3, right: newSlideContentRight3 });
      activeSlideImage.css({ left: 0 });

      if (!isSplit) gsap.set(newSlideElements, { y: 20, force3D: true });

      gsap.to(activeSlideImage, { duration: 0, left: activeSlideImageLeft3, ease: "power3.inOut" });
      gsap.to(newSlide, { duration: dur3, width: slideshow.width() + 1, ease: "power3.inOut" });
      gsap.to(newSlideImage, { duration: 0, right: newSlideImageToRight3, left: newSlideImageToLeft3, ease: "power3.inOut" });

      function finalize3() {
        newSlide.addClass('is-active').removeClass('is-new');
        activeSlide.removeClass('is-active');
		if (isSplit) msCleanupSlideCaption(activeSlide);

        newSlide.css({ display: '', width: '', left: '', right: '', zIndex: '' });
        newSlideImage.css({ width: '', right: '', left: '' });
        newSlideContent.css({ width: '', left: '', right: '' });
        newSlideElements.css({ opacity: '', transform: '' });
        activeSlideImage.css({ left: '' });

        slideshow.find('.pagination').trigger('check');
        slideshow.data('wait', false);

        msAnimateSlideCaption(slideshow, newSlide);
		if (!msIsElementorEditor()) {
  msPreloadNextSlide(slideshow);
}
        scheduleNext();
      }

      if (!isSplit) {
        gsap.fromTo(
          newSlideElements,
          { alpha: 0, y: 60 },
          {
            alpha: 1,
            y: 0,
            ease: "power3.out",
            force3D: true,
            delay: 1.2,
            duration: 1,
            stagger: 0.2,
            onComplete: finalize3
          }
        );
      } else {
        gsap.delayedCall(dur3 + 0.05, finalize3);
      }
    }

    // ------------------ DEFAULT (RIGHT TO LEFT) ------------------
    else {
      var dur4 = 1.0;

      var newSlideRight4 = 0;
      var newSlideLeft4 = 'unset';
      var newSlideImageRight4 = -slideshow.width() / 8;
      var newSlideImageLeft4 = 'unset';
      var newSlideImageToRight4 = 0;
      var newSlideImageToLeft4 = 'unset';
      var newSlideContentLeft4 = 'unset';
      var newSlideContentRight4 = 0;
      var activeSlideImageLeft4 = -slideshow.width() / 4;

      newSlide.css({ display: 'block', width: 0, right: newSlideRight4, left: newSlideLeft4, zIndex: 2 });
      newSlideImage.css({ width: slideshow.width(), right: newSlideImageRight4, left: newSlideImageLeft4 });
      newSlideContent.css({ width: slideshow.width(), left: newSlideContentLeft4, right: newSlideContentRight4 });
      activeSlideImage.css({ left: 0 });

      if (!isSplit) gsap.set(newSlideElements, { y: 20, force3D: true });

      gsap.to(activeSlideImage, { duration: dur4, left: activeSlideImageLeft4, ease: "power3.inOut" });
      gsap.to(newSlide, { duration: dur4, width: slideshow.width(), ease: "power3.inOut" });
      gsap.to(newSlideImage, { duration: dur4, right: newSlideImageToRight4, left: newSlideImageToLeft4, ease: "power3.inOut" });

      function finalize4() {
        newSlide.addClass('is-active').removeClass('is-new');
        activeSlide.removeClass('is-active');
		if (isSplit) msCleanupSlideCaption(activeSlide);

        newSlide.css({ display: '', width: '', left: '', right: '', zIndex: '' });
        newSlideImage.css({ width: '', right: '', left: '' });
        newSlideContent.css({ width: '', left: '', right: '' });
        newSlideElements.css({ opacity: '', transform: '' });
        activeSlideImage.css({ left: '' });

        slideshow.find('.pagination').trigger('check');
        slideshow.data('wait', false);

        msAnimateSlideCaption(slideshow, newSlide);
		if (!msIsElementorEditor()) {
  msPreloadNextSlide(slideshow);
}
        scheduleNext();
      }

      if (!isSplit) {
        gsap.fromTo(
          newSlideElements,
          { alpha: 0, y: 60 },
          {
            alpha: 1,
            y: 0,
            ease: "power3.out",
            force3D: true,
            delay: 1.2,
            duration: 1,
            stagger: 0.2,
            onComplete: finalize4
          }
        );
      } else {
        gsap.delayedCall(dur4 + 0.05, finalize4);
      }
    }
    }); 
  }

  function slideshowNext(slideshow, previous, auto) {
    var slides = slideshow.find('.slide');
    var activeSlide = slides.filter('.is-active');
    var newSlide = null;

    if (previous) {
      newSlide = activeSlide.prev('.slide');
      if (newSlide.length === 0) newSlide = slides.last();
    } else {
      newSlide = activeSlide.next('.slide');
      if (newSlide.length == 0) newSlide = slides.filter('.slide').first();
    }

    slideshowSwitch(slideshow, newSlide.index(), auto);
  }

  $(document).ready(function () {

    $slideshows.each(function () {
      var $slider = $(this);
      var $activeSlide = $slider.find('.slide.is-active').first();

      // preload
      msPreloadSlideImage($activeSlide);

if (!msIsElementorEditor()) {
  msPreloadNextSlide($slider);
}

      // dopiero gdy pierwszy slide ma gotowy obraz, oznacz go i odpal caption
      msWaitForSlideImage($activeSlide, function () {
        msAnimateSlideCaption($slider, $activeSlide);

      msScheduleNext($slider);
      });

      msSetupAutoplayIO($slider);
      msSetupFitHeight($slider);
      msSetupParallax($slider);
    });

    $slideshows.find('.arrows .arrow').off('click.msSliderParallax').on('click.msSliderParallax', function () {
      slideshowNext($(this).closest('.slider_parallax_wrapper'), $(this).hasClass('prev'), false);
    });

    $slideshows.find('.pagination .item').off('click.msSliderParallax').on('click.msSliderParallax', function () {
      slideshowSwitch($(this).closest('.slider_parallax_wrapper'), $(this).index(), false);
    });

    $slideshows.find('.pagination').off('check.msSliderParallax').on('check.msSliderParallax', function () {
      var slideshow = $(this).closest('.slider_parallax_wrapper');
      var pages = $(this).find('.item');
      var index = slideshow.find('.slider_parallax_slides .is-active').index();
      pages.removeClass('is-active');
      pages.eq(index).addClass('is-active');
    });

    // Swipe/drag support — native listeners: touch is PASSIVE (the old jQuery
    // touchmove blocked scroll compositing on a full-viewport hero), guarded
    // against double-init (re-runs used to stack duplicate handlers), and one
    // gesture advances exactly one slide (consumed flag resets on touchend).
    $slideshows.each(function () {
      var el = this;
      if (el.dataset.msSwipeInit === '1') return;
      el.dataset.msSwipeInit = '1';

      var $slider = $(el);
      var startX = 0, tracking = false, consumed = false, mouse = false;

      function begin(x, isMouse) { startX = x; tracking = true; consumed = false; mouse = isMouse; }
      function move(x) {
        if (!tracking || consumed) return;
        var diff = startX - x;
        if (Math.abs(diff) > 50) {
          consumed = true;
          slideshowNext($slider, diff < 0, false);
        }
      }
      function end() { tracking = false; consumed = false; mouse = false; }

      el.addEventListener('touchstart', function (e) { begin(e.touches[0].pageX, false); }, { passive: true });
      el.addEventListener('touchmove', function (e) { move(e.touches[0].pageX); }, { passive: true });
      el.addEventListener('touchend', end, { passive: true });
      el.addEventListener('touchcancel', end, { passive: true });

      el.addEventListener('mousedown', function (e) {
        if ($(e.target).is('button, a, input')) return;
        e.preventDefault();
        begin(e.pageX, true);
      });
      el.addEventListener('mousemove', function (e) { if (mouse) move(e.pageX); });
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
    });
  });
};

// Custom function to hide Contact Form 7 response messages after 3 seconds
// Custom function to hide Contact Form 7 response messages after 3 seconds
// Premium++: bind once, and toggle only the submitted form (no global rebind duplicates)
ELMAUVE.hideContactForm7Response = function( $scope ) {

  // Bind the CF7 event only once per page.
  if (ELMAUVE._cf7Bound) {
    return;
  }
  ELMAUVE._cf7Bound = true;

  document.addEventListener('wpcf7submit', function(event) {
    // event.target is the form element
    var $form = $(event.target);
    if (!$form.length) return;

    $form.removeClass('init');
    setTimeout(function() {
      $form.addClass('init');
    }, 3000);
  }, false);
};


ELMAUVE.verticalNavigation = function( $scope ) {

  var $root = ($scope && $scope.length) ? $scope : $(document);

  // Init navAccordion only within the widget scope
  $root.find('.menu-mobile').each(function() {
    var $menu = $(this);

    // Prevent double init
    if ($menu.data('msNavAccordionInit')) return;
    $menu.data('msNavAccordionInit', true);

    $menu.navAccordion({
      expandButtonText: '<i class="ms ms-f-arrow-right"></i>',
      collapseButtonText: '<i class="ms ms-f-arrow-down"></i>'
    });
  });

};

/**
 * Theme Vertical Menu — "Slide-in panels" (submenu style = drill).
 * Every nested list becomes its own panel: an item with a submenu gets an arrow, the submenu slides in
 * from the right with a Back button (and optionally the parent as a link) on top, the panel it came from
 * moves a little to the left and fades. The height follows the panel. Works whether or not the theme's
 * navAccordion already ran on the same .menu-mobile (its buttons and inline styles are removed).
 */
ELMAUVE.verticalDrill = function( $scope ) {
  var root = ( $scope && $scope.length ) ? $scope[0] : document;
  var CHEVRON_R = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_L = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var reduced = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

  var containers = root.classList && root.classList.contains( 'ms-vnav-drill' ) ? [ root ] : root.querySelectorAll( '.ms-vnav-drill' );
  Array.prototype.forEach.call( containers, function( box ) {
    if ( box.dataset.drillReady === '1' ) { return; }
    var host = box.querySelector( '.menu-mobile' );
    var rootUl = host && host.querySelector( 'ul' );
    if ( !rootUl ) { return; }
    box.dataset.drillReady = '1';

    // Leftovers of the accordion, if it got here first.
    Array.prototype.forEach.call( host.querySelectorAll( '.accordion-btn-wrap' ), function( n ) { n.remove(); } );
    Array.prototype.forEach.call( host.querySelectorAll( '.has-subnav' ), function( li ) {
      li.classList.remove( 'has-subnav', 'accordion-header-only' );
      li.style.position = '';
      var a = li.querySelector( ':scope > a' );
      if ( a ) { a.style.marginRight = ''; a.style.marginLeft = ''; }
    } );
    Array.prototype.forEach.call( host.querySelectorAll( 'ul' ), function( u ) { u.style.display = ''; u.style.height = ''; } );

    var backText = box.dataset.back || 'Back';
    var withTitle = box.dataset.parentTitle === '1';
    var parentOpens = box.dataset.parentClick !== 'link';
    var uid = 'msd' + Math.random().toString( 36 ).slice( 2, 8 );
    var view = document.createElement( 'div' );
    view.className = 'ms-drill';
    rootUl.parentNode.insertBefore( view, rootUl );
    var panels = [];
    var timer = 0;

    var dur = function() {
      var v = parseFloat( getComputedStyle( box ).getPropertyValue( '--ms-drill-dur' ) );
      return reduced ? 0 : ( isNaN( v ) ? 450 : v );
    };

    var show = function( target, focusEl ) {
      var from = view.offsetHeight;
      var path = [];
      for ( var p = target.msParent; p; p = p.msParent ) { path.push( p ); }
      panels.forEach( function( panel ) {
        var active = panel === target;
        panel.classList.toggle( 'is-active', active );
        panel.classList.toggle( 'is-behind', path.indexOf( panel ) > -1 );
        panel.inert = !active;
        panel.setAttribute( 'aria-hidden', active ? 'false' : 'true' );
      } );
      panels.forEach( function( panel ) {
        if ( panel.msOpener ) { panel.msOpener.setAttribute( 'aria-expanded', panel === target || path.indexOf( panel ) > -1 ? 'true' : 'false' ); }
      } );
      var to = target.offsetHeight;
      window.clearTimeout( timer );
      if ( dur() > 0 && from !== to ) {
        view.style.height = from + 'px';
        void view.offsetHeight;
        view.style.height = to + 'px';
        timer = window.setTimeout( function() { view.style.height = ''; }, dur() + 60 );
      } else {
        view.style.height = '';
      }
      if ( focusEl ) { focusEl.focus( { preventScroll: true } ); }
    };

    var build = function( ul, parentLi, parentPanel ) {
      var panel = document.createElement( 'div' );
      panel.className = 'ms-drill__panel' + ( parentLi ? ' ms-drill__panel--sub' : '' );
      panel.id = uid + '-' + panels.length;
      panel.msParent = parentPanel;
      panels.push( panel );
      if ( parentLi ) {
        var head = document.createElement( 'div' );
        head.className = 'ms-drill__head';
        var back = document.createElement( 'button' );
        back.type = 'button';
        back.className = 'ms-drill__back';
        back.innerHTML = CHEVRON_L + '<span></span>';
        back.lastChild.textContent = backText;
        back.addEventListener( 'click', function() { show( parentPanel, panel.msOpener ); } );
        head.appendChild( back );
        panel.msBack = back;
        var link = parentLi.querySelector( ':scope > a' );
        if ( withTitle && link ) {
          var href = link.getAttribute( 'href' );
          var title = document.createElement( href && href !== '#' ? 'a' : 'span' );
          title.className = 'ms-drill__title';
          if ( title.tagName === 'A' ) {
            title.href = href;
            if ( link.target ) { title.target = link.target; }
          }
          title.textContent = link.textContent.trim();
          head.appendChild( title );
        }
        panel.appendChild( head );
      }
      panel.appendChild( ul );
      view.appendChild( panel );

      Array.prototype.forEach.call( ul.children, function( li ) {
        var sub = li.querySelector( ':scope > ul' );
        if ( !sub ) { return; }
        var child = build( sub, li, panel );
        var a = li.querySelector( ':scope > a' );
        var next = document.createElement( 'button' );
        next.type = 'button';
        next.className = 'ms-drill__next';
        next.innerHTML = CHEVRON_R;
        next.setAttribute( 'aria-label', a ? a.textContent.trim() : backText );
        next.setAttribute( 'aria-expanded', 'false' );
        next.setAttribute( 'aria-controls', child.id );
        li.classList.add( 'ms-drill__has-sub' );
        li.appendChild( next );
        child.msOpener = next;
        next.addEventListener( 'click', function( e ) { e.preventDefault(); show( child, child.msBack ); } );
        if ( a && parentOpens ) {
          a.addEventListener( 'click', function( e ) { e.preventDefault(); show( child, child.msBack ); } );
        }
      } );
      return panel;
    };

    var first = build( rootUl, null, null );
    show( first );

    // Esc goes one level back.
    view.addEventListener( 'keydown', function( e ) {
      if ( e.key !== 'Escape' ) { return; }
      var active = panels.filter( function( p ) { return p.classList.contains( 'is-active' ); } )[0];
      if ( active && active.msParent ) {
        e.preventDefault();
        e.stopPropagation();
        show( active.msParent, active.msOpener );
      }
    } );
  } );
};

// Front end: also pick up menus printed outside the Elementor document flow (e.g. inside an off-canvas
// panel) in case their element_ready hook does not run.
$( function() { ELMAUVE.verticalDrill( $( document ) ); } );

// Theme side panel (#st-menu): a link to a section of the page that is already open only scrolls the
// page, so the panel stayed over it. Close it first, the same way the theme's own close button does.
$( document ).on( 'click', '#st-menu a[href*="#"]', function() {
  var a = this;
  var panel = document.getElementById( 'st-menu' );
  if ( !a.hash || a.target === '_blank' || a.host !== location.host || a.pathname !== location.pathname || a.search !== location.search ) { return; }
  if ( !panel || !panel.classList.contains( 'st-menu-open' ) ) { return; }
  panel.classList.remove( 'st-menu-open' );
  Array.prototype.forEach.call( document.querySelectorAll( '.st-trigger-effects a.nav-icon4, .icon-menu a.nav-icon4' ), function( el ) {
    el.classList.remove( 'open' );
  } );
} );



ELMAUVE.Counter = function ($scope) {
	const counterElem = $scope.find('.ms-counter').eq(0);
	if (!counterElem.length) return;

		// Guard: Odometer is an optional dependency.
		// If it's not loaded on the page, do nothing (avoid console errors).
		if (typeof window.Odometer === 'undefined') {
			return;
		}

	const target = counterElem.data('target');
	const separator = $scope.find('.ms-counter-number').data('separator');
	const separatorChar = $scope.find('.ms-counter-number').data('separator-char');
	const format = (separatorChar !== '') ? '(' + separatorChar + 'ddd).dd' : '(,ddd).dd';

	const counter = function () {
		$(target).each(function () {
			const to = $(this).data('to');
			const from = parseFloat($(this).data('from')) || 0;
			const speed = $(this).data('speed');
				const od = new window.Odometer({
				el: this,
				value: from,
				duration: speed,
				format: (separator === 'yes') ? format : ''
			});
			od.render();
			// Use setTimeout instead of setInterval if you only want to update once
			setTimeout(function () {
				od.update(to);
			}, 20);
		});
	};

	// Check for IntersectionObserver support
	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(function (entries, obs) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (!counterElem.hasClass('ms-count-complete')) {
						counterElem.addClass('ms-count-complete');
						counter();
					}
					obs.unobserve(entry.target); // run once
				}
			});
		}, {
			root: null,
			rootMargin: '0px',
			threshold: 0.3
		});

		observer.observe(counterElem.get(0));
	} else {
		// Fallback if no IntersectionObserver (very rare today)
		counter();
	}
};
(function () {
  function patchElementorBgVideoSettings() {
    document.querySelectorAll('[data-settings]').forEach(function (el) {
      try {
        const raw = el.getAttribute('data-settings');
        if (!raw) return;

        const settings = JSON.parse(raw);

        // Only when OUR parallax is ON:
        if (settings.mauve_ext_is_background_parallax === 'true') {
          // If Elementor bg is video, force it to classic to stop Elementor video init
          if (settings.background_background === 'video') {
            settings.__mauve_original_bg = 'video'; // remember
            settings.__mauve_bg_was_video = 'true';     // <- dla nas
settings.background_background = 'classic'; // <- dla Elementora

            el.setAttribute('data-settings', JSON.stringify(settings));
          }
        }
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchElementorBgVideoSettings);
  } else {
    patchElementorBgVideoSettings();
  }
})();


$(document).ready(function() {

  // Global init (safe)
  ELMAUVE.general();

  // CF7 handler (should be bind-once inside the function)
  ELMAUVE.hideContactForm7Response();

  ELMAUVE.audioPlayerInit();
  ELMAUVE.magnificPopupLoad();

  // Avoid forcing resize immediately; do it slightly later (more stable)
  setTimeout(function() {
    window.dispatchEvent(new Event("resize"));
  }, 150);

  // Example disabled:
  // ELMAUVE.justifiedgalleryInit();
});
$(window).on('load', function() {

});
// Make sure you run this code under Elementor..
$( window ).on( 'elementor/frontend/init', function() {

//var delay = 100; setTimeout(function() {
//$('.elementor-tab-title').removeClass('elementor-active');
//$('.elementor-tab-content').css('display', 'none'); }, delay);

// =======================
// Mauve – helpers
// =======================
function msIsOn(val) {
  return val === 'yes' || val === 'true' || val === true || val === 1 || val === '1';
}

function msNum(val, fallback = 0) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function msClamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// On-demand jarallax loader. After the theme split its jquery.plugins.js,
// jarallax is no longer present on pure Elementor pages, so the container
// "Background Parallax" must load it itself — once, and only when actually
// used. Falls back gracefully (no error, no freeze) if the URL is missing.
var msJarallaxLoader = { ready: false, loading: false, queue: [] };

function msJarallaxAvailable() {
  return (typeof jQuery.fn.jarallax === 'function') || (typeof window.jarallax === 'function');
}

function msEnsureJarallax(cb) {
  if (typeof cb !== 'function') return;

  if (msJarallaxAvailable()) { cb(); return; }

  msJarallaxLoader.queue.push(cb);
  if (msJarallaxLoader.loading) return;

  var url = (window.msMauveJarallax && window.msMauveJarallax.url) ? window.msMauveJarallax.url : '';
  if (!url) { msJarallaxLoader.queue.length = 0; return; } // nothing to load — fail safe

  msJarallaxLoader.loading = true;

  var s = document.createElement('script');
  s.src = url;
  s.async = false;
  s.onload = function () {
    msJarallaxLoader.ready = true;
    msJarallaxLoader.loading = false;
    var q = msJarallaxLoader.queue.slice();
    msJarallaxLoader.queue.length = 0;
    q.forEach(function (fn) { try { fn(); } catch (e) {} });
  };
  s.onerror = function () { msJarallaxLoader.loading = false; msJarallaxLoader.queue.length = 0; };
  document.head.appendChild(s);
}

// Expose the loader so widgets defined in the earlier IIFE (Posts Slideshow, Parallax
// Image/Video) can reach it — they live in a different closure and can't see this scope.
window.msEnsureJarallax = msEnsureJarallax;

// Background Parallax for classic image backgrounds without scroll-time JavaScript.
// A phone scrolls on the compositor, so a script that repositions an image travelling
// with the page (jarallax on touch devices) lands a frame or more behind it and the
// background shakes. Here the image is taken out of the page's movement instead:
//   pinned (speed below 0.5): the image is position:sticky in a track that reaches one
//     viewport above and below the element, so the browser itself holds it still on
//     screen; the track then drifts by `speed` of the scroll.
//   flow (speed 0.5 and up, or sticky unavailable, e.g. a container set to Overflow:
//     Hidden): the image scrolls with the element and is pushed back by `1 - speed`.
// The movement is a transform animation bound to a plain ViewTimeline of the element.
// Two things were settled on an iPhone with Safari 27, do not undo them:
//   - no `inset` (and no exit-crossing range) on the timeline: Safari then resolves the
//     animation late and the image shakes again;
//   - whenever a scroll stops, restarts or turns, Safari misplaces the animated part of
//     the movement for a moment, so the mode that animates the smaller part is chosen.
// Browsers without ViewTimeline (iOS before 26), speeds above 1 and video backgrounds
// keep jarallax.

// ?ms-parallax=pinned|flow|jarallax forces that mode and &ms-parallax-speed=0.3 that
// speed, to compare them on a real device; any ms-parallax value shows a badge naming
// what runs.
var msParallaxDebug = (function () {
  try {
    var query = new URLSearchParams(window.location.search);
    return query.has('ms-parallax') ? { mode: query.get('ms-parallax'), speed: parseFloat(query.get('ms-parallax-speed')) } : null;
  } catch (e) { return null; }
})();

function msParallaxReport(el, text) {
  if (!msParallaxDebug) return;
  var badge = document.getElementById('ms-parallax-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'ms-parallax-badge';
    badge.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;max-width:80vw;padding:6px 8px;font:11px/1.4 monospace;color:#fff;background:rgba(0,0,0,.8);pointer-events:none;';
    badge.textContent = 'ViewTimeline: ' + (typeof window.ViewTimeline === 'function' ? 'yes' : 'no');
    document.body.appendChild(badge);
  }
  var line = document.createElement('div');
  line.textContent = (el.getAttribute('data-id') || '?') + ': ' + text;
  badge.appendChild(line);
}

// position:sticky pins against the nearest scroll container, and every ancestor with
// an overflow other than visible/clip is one, even when it never scrolls (a wrapper
// with overflow-x:hidden, a container set to Overflow: Hidden).
function msStickyBlocked(el) {
  var root = document.documentElement, scrolls = /auto|scroll|hidden|overlay/;
  for (var node = el; node && node !== root; node = node.parentElement) {
    var cs = window.getComputedStyle(node);
    if (!scrolls.test(cs.overflowX + ' ' + cs.overflowY)) continue;
    // <body> hands its overflow to the viewport unless <html> sets its own.
    if (node !== document.body) return true;
    var rs = window.getComputedStyle(root);
    if (scrolls.test(rs.overflowX + ' ' + rs.overflowY)) return true;
  }
  return false;
}

// The viewport a view timeline measures against moves between the small one (a phone's
// toolbars shown) and the large one (toolbars hidden); on a desktop the two are equal.
function msViewportHeights() {
  var probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:100vh;height:100lvh;';
  document.body.appendChild(probe);
  var large = probe.offsetHeight || window.innerHeight;
  probe.style.height = '100svh'; // ignored where unsupported, the large height then stays
  var small = Math.min(probe.offsetHeight || large, large);
  probe.remove();
  return { large: large, small: small };
}

// Image height and travel for an element `extent` tall, with the image top at
// `speed x element top` on screen: jarallax's crop and travel. The timeline starts when
// the element's top reaches the bottom of whatever viewport is current (`low` to `vp`),
// and neither state of the toolbar may expose the element's own background.
//   pinned: the entry keyframe is computed for the low viewport and the image is taller
//     by `speed` of the difference (nothing on a desktop).
//   flow: the entry keyframe is computed for the large viewport; in a smaller one the
//     image merely sits a little higher, so jarallax's exact height is enough. The image
//     may sit `offset` below the top of the box the timeline is measured on, which is
//     `span` tall (the element itself: 0 and `extent`).
function msParallaxGeometry(speed, extent, vp, low, pin, offset, span) {
  if (pin) return { height: vp + speed * (extent - low), from: speed * low, to: -speed * extent };
  return { height: speed * extent + (1 - speed) * vp, from: (speed - 1) * (vp + offset), to: (1 - speed) * (span - offset) };
}

// A view timeline follows the nearest ancestor that is a scroll container, and a box
// with overflow hidden is one even though it never scrolls (a slider frame, a container
// set to Overflow: Hidden): measured on the element itself the timeline would stand
// still. Measure it on the outermost such box instead, whose own scroller is the page.
function msParallaxSubject(el) {
  var subject = el, scrolls = /auto|scroll|hidden|overlay/;
  for (var node = el.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    var cs = window.getComputedStyle(node);
    if (!scrolls.test(cs.overflowX + ' ' + cs.overflowY)) continue;
    if (cs.overflowY !== 'hidden' && node.scrollHeight - node.clientHeight >= 2) break; // really scrolls: the timeline's source
    subject = node;
  }
  return subject;
}

// Distance from `ancestor`'s top border edge down to `node`'s, from layout offsets, so a
// transform in between (a slide transition in progress) does not skew it.
function msOffsetWithin(node, ancestor) {
  var y = 0;
  for (var cur = node; cur !== ancestor; cur = cur.offsetParent) {
    var parent = cur.offsetParent;
    if (!parent || !ancestor.contains(parent)) return node.getBoundingClientRect().top - ancestor.getBoundingClientRect().top;
    y += cur.offsetTop + parent.clientTop;
  }
  return y;
}

// Returns false when this element has to stay with jarallax. `onUnusable` is called if
// that only turns out later (a breakpoint changes an ancestor's overflow).
function msTryNativeParallaxImage(el, img, speed, fit, onUnusable) {
  var forced = msParallaxDebug ? msParallaxDebug.mode : '';
  if (!img || speed > 1 || forced === 'jarallax' || typeof window.ViewTimeline !== 'function' || typeof img.animate !== 'function' || typeof ResizeObserver !== 'function') return false;

  var layer = document.createElement('div'), track = document.createElement('div');
  layer.className = 'ms-native-parallax-layer';
  track.className = 'ms-native-parallax-track';
  // clip, not hidden: a hidden layer would be a scroll container and capture the sticky image.
  layer.style.cssText = 'position:absolute;inset:0;overflow:clip;border-radius:inherit;pointer-events:none;z-index:-100;';
  var original = {}, applied = {}, animation = null, observer = null, watcher = null, destroyed = false;
  var currentFit = fit, pinned = false, stickyFailed = false, lastLayout = '', viewport = 0, pinTravel = 0;
  function setHostStyle(name, value) {
    original[name] = { value: el.style.getPropertyValue(name), priority: el.style.getPropertyPriority(name) };
    applied[name] = value;
    el.style.setProperty(name, value);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (observer) observer.disconnect();
    if (watcher) watcher.disconnect();
    window.removeEventListener('resize', refresh);
    if (animation) animation.cancel();
    if (layer.parentNode) {
      layer.parentNode.insertBefore(img, layer);
      layer.remove();
    }
    img.removeAttribute('style');
    Object.keys(original).forEach(function (name) {
      if (el.style.getPropertyValue(name) !== applied[name]) return;
      var saved = original[name];
      if (saved.value) el.style.setProperty(name, saved.value, saved.priority);
      else el.style.removeProperty(name);
    });
    el.removeAttribute('data-ms-parallax-engine');
    el.removeAttribute('data-ms-parallax-base');
    delete el.msNativeParallax;
  }
  function syncFit(nextFit) {
    currentFit = nextFit;
    img.style.objectFit = nextFit.size;
    img.style.objectPosition = nextFit.position;
  }
  // Is the sticky image as far down its track as a viewport-pinned one must be? A scroll
  // container the overflow walk cannot foresee pins it against that box instead, or not
  // at all, and the image then misses part of the element.
  function stickyHolds() {
    var expected = Math.min(Math.max(viewport - layer.getBoundingClientRect().top, 0), pinTravel);
    if (expected < 4) return true; // not engaged at this scroll position, nothing to judge
    return Math.abs(img.getBoundingClientRect().top - track.getBoundingClientRect().top - expected) < 4;
  }
  // Returns false only when no view timeline can drive this element.
  function layout() {
    if (destroyed) return true;
    var width = layer.clientWidth, height = layer.clientHeight;
    if (!width || !height) return true; // hidden for now; the ResizeObserver calls back
    var subject = msParallaxSubject(el);
    var scroller = new window.ViewTimeline({ subject: subject, axis: 'y' }).source;
    var rootScroller = !scroller || scroller === document.scrollingElement || scroller === document.documentElement || scroller === document.body;
    // A wrapper that clips but never scrolls gives the timeline nothing to follow.
    if (!rootScroller && scroller.scrollHeight - scroller.clientHeight < 2) return false;
    var heights = rootScroller ? msViewportHeights() : { large: scroller.clientHeight, small: scroller.clientHeight };
    var vp = heights.large;
    if (!vp) return true;
    var pin = (forced === 'pinned' || (forced !== 'flow' && speed < 0.5)) && speed < 1 && rootScroller && !stickyFailed && !msStickyBlocked(el);
    var extent = el.offsetHeight, lead = el.clientTop, span = subject.offsetHeight;
    var offset = subject === el ? 0 : msOffsetWithin(el, subject);
    var key = [width, height, vp, heights.small, extent, lead, pin, offset, span].join('|');
    if (key === lastLayout) return true;

    var shape = msParallaxGeometry(speed, extent, vp, heights.small, pin, offset, span);
    if (pin) {
      // The negative bottom margin keeps an image taller than the viewport pinned until
      // the element has left, instead of releasing it one viewport early.
      var release = Math.min(0, vp - shape.height);
      track.style.cssText = 'position:absolute;left:0;top:' + (-vp) + 'px;width:100%;height:' + (height + 2 * vp) + 'px;';
      img.style.cssText = 'display:block;position:sticky;top:0;left:auto;width:100%;max-width:none;height:' + shape.height + 'px;margin:0 0 ' + release + 'px;';
      pinTravel = height + 2 * vp - shape.height - release;
    } else {
      // The travel is counted from the element's top edge; the layer starts below its border.
      track.style.cssText = 'position:absolute;left:0;top:' + (-lead) + 'px;width:100%;height:' + shape.height + 'px;';
      img.style.cssText = 'display:block;position:static;width:100%;max-width:none;height:100%;';
    }
    syncFit(currentFit);

    var next = track.animate([
      { transform: 'translate3d(0,' + shape.from + 'px,0)' },
      { transform: 'translate3d(0,' + shape.to + 'px,0)' }
    ], { duration: 'auto', fill: 'both', easing: 'linear', timeline: new window.ViewTimeline({ subject: subject, axis: 'y' }) });
    if (animation) animation.cancel();
    animation = next;
    // The timeline has no reading until the next frame and the animation idles until
    // then; stand in with the same position so a slide shown mid-page does not flash.
    var port = rootScroller ? { top: 0, height: document.documentElement.clientHeight } : { top: scroller.getBoundingClientRect().top + scroller.clientTop, height: scroller.clientHeight };
    var progress = Math.min(1, Math.max(0, (port.top + port.height - subject.getBoundingClientRect().top) / (port.height + span)));
    track.style.transform = 'translate3d(0,' + (shape.from + progress * (shape.to - shape.from)) + 'px,0)';
    pinned = pin; viewport = vp; lastLayout = key;
    el.setAttribute('data-ms-parallax-base', pin ? 'pinned' : 'flow');
    if (pin && !stickyHolds()) { stickyFailed = true; return layout(); }
    return true;
  }
  function refresh() {
    if (layout() || destroyed) return;
    destroy();
    if (typeof onUnusable === 'function') onUnusable();
  }

  try {
    var hostStyle = window.getComputedStyle(el);
    if (hostStyle.position === 'static') setHostStyle('position', 'relative');
    if (hostStyle.zIndex === 'auto') setHostStyle('z-index', '0');
    setHostStyle('background-image', 'none');
    el.appendChild(layer);
    layer.appendChild(track);
    track.appendChild(img);
    if (!layout()) { destroy(); return false; }
    observer = new ResizeObserver(refresh);
    observer.observe(el, { box: 'border-box' });
    window.addEventListener('resize', refresh, { passive: true });
    if (typeof IntersectionObserver === 'function') {
      watcher = new IntersectionObserver(function () {
        if (pinned && !stickyHolds()) { stickyFailed = true; refresh(); }
      }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
      watcher.observe(layer);
    }
    el.msNativeParallax = { destroy: destroy, syncFit: syncFit };
    el.setAttribute('data-ms-parallax-engine', 'native');
    return true;
  } catch (error) {
    // Unsupported/partial ViewTimeline implementations retain Jarallax.
    destroy();
    return false;
  }
}

// The Parallax Slider lives in an earlier closure and reaches the engine through this.
window.msTryNativeParallaxImage = msTryNativeParallaxImage;


function msDestroyJarallax($el) {
  if ($el[0] && $el[0].msNativeParallax) $el[0].msNativeParallax.destroy();
  try {
    if ($el.hasClass('jarallax') && typeof $el.jarallax === 'function') $el.jarallax('destroy');
  } catch (e) {}

  // Jarallax can leave containers/iframes – remove them
  $el.find('> .jarallax-container').remove();
  $el.find('img.jarallax-img').remove();

  $el.removeClass('jarallax');
}


// =======================
// Mauve – video parallax
// =======================
function msGetFallbackUrl(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.url) return val.url;
  return '';
}


function msApplyParallaxVideo(widgetExt, $target) {
  if (!widgetExt || !widgetExt.background_video_link) return;

  const playOnMobile = msIsOn(widgetExt.background_play_on_mobile);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile && !playOnMobile) return;

  // ✅ NOWE: autoplay (Twoja kontrolka switcher)
  // default ON jeśli nie ustawione
  const autoplay = (widgetExt.mauve_ext_bgvideo_autoplay !== 'false');

  // speed
  let speed = 0.5;
  if (widgetExt.mauve_ext_is_background_parallax_speed?.size !== undefined) {
    speed = msNum(widgetExt.mauve_ext_is_background_parallax_speed.size, 0.5);
  }
  speed = msClamp(speed, 0.05, 1.5);

  const start = msNum(widgetExt.background_video_start, 0);
  const end   = msNum(widgetExt.background_video_end, 0);

  // ✅ fallback z Elementora
  const fallback = msGetFallbackUrl(widgetExt.background_fallback_image);

  // (opcjonalnie) ustaw fallback jako CSS background dla hosta – zanim Jarallax się odpali
  if (fallback) {
    $target.css({
      backgroundImage: `url("${fallback}")`,
      backgroundSize: 'cover',
      backgroundPosition: '50% 50%',
      backgroundRepeat: 'no-repeat'
    });
  }

  // Usuń/ukryj Elementorowe BG video (żeby nie było 2x)
  const $elVideo = $target.find('> .e-con-inner > .elementor-background-video-container');
  if ($elVideo.length) {
    const $iframe = $elVideo.find('iframe');
    if ($iframe.length) $iframe.attr('src', 'about:blank').removeAttr('id');
    $elVideo.css({ display: 'none' });
  }

  msDestroyJarallax($target);
  $target.addClass('jarallax');

  const opts = {
    type: 'scroll',
    speed,
    noIos: false,
    imgPosition: '50% 50%',
    videoSrc: widgetExt.background_video_link,

    // ✅ KLUCZ: Jarallax-video rozumie autoplay jako 1/0
    autoplay: autoplay ? 1 : 0,
    videoLoop: 1,
    videoPlayOnlyVisible: false,
  };

  if (fallback) opts.imgSrc = fallback;
  if (start > 0) opts.videoStartTime = start;
  if (end > 0)   opts.videoEndTime = end;

  // wrap below: jarallax is loaded on demand

  // ✅ EKSPORT: podaj VideoWorkera MS_BGVC
  opts.onInit = function () {
    // `this` to instancja Jarallax
    // `this.video` to VideoWorker (YT/Vimeo/HTML5)
    try {
      const $item = $(this.$item);
      $item.data('msJarallaxVideoWorker', this.video || null);

      // jeśli autoplay OFF -> startuj w pauzie (czasem jarallax i tak zrobi init)
      if (!autoplay && this.video && this.video.pause) {
        this.video.pause();
      }
    } catch (e) {}
  };

  msEnsureJarallax(function () {
    $target.jarallax(opts);
  });
}


 
elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
  // --- Zbierz settings (Twoja logika) ---
  let widgetExt;

  if (elementorFrontend.isEditMode()) {
    // Zignoruj kontenery i sekcje
    var elType = $scope.data('element_type');
    if (elType === 'container' || elType === 'section' || elType === 'column') return;

    var elementSettings = {};
    var modelCID = $scope.data('model-cid');
    var settings = elementorFrontend.config.elements.data[modelCID];

    if (typeof settings !== 'undefined') {
      var type = settings.attributes.widgetType || settings.attributes.elType,
        settingsKeys = elementorFrontend.config.elements.keys[type];

      if (!settingsKeys) {
        settingsKeys = elementorFrontend.config.elements.keys[type] = [];
        $.each(settings.controls, function (name, control) {
          if (control.frontend_available) settingsKeys.push(name);
        });
      }

      $.each(settings.getActiveControls(), function (controlKey) {
        if (-1 !== settingsKeys.indexOf(controlKey)) {
          elementSettings[controlKey] = settings.attributes[controlKey];
        }
      });

      widgetExt = elementSettings;
    }
  } else {
    var widgetExtObj = $scope.attr('data-settings');
    if (typeof widgetExtObj !== 'undefined') {
      try {
        widgetExt = JSON.parse(widgetExtObj);
      } catch (e) {}
    }
  }

  // --- Guard ---
  if (
    typeof widgetExt === 'undefined' ||
    widgetExt.mauve_ext_is_background_parallax !== 'true'
  ) {
    return;
  }

  // Sticky Scroll Expand "grow the background" takes this background over and runs the
  // parallax inside its growing card (mauve-motion-effects.js) - unless that effect is
  // off on this device, in which case the regular parallax runs.
  var msGrowHost = $scope[0];
  if (msGrowHost && msGrowHost.getAttribute('data-mauve-sticky-expand-mode') === 'background' && msGrowHost.hasAttribute('data-mauve-sticky-expand-parallax')) {
    var msGrowOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (msGrowHost.getAttribute('data-mauve-sticky-expand-mobile') === '0' && window.matchMedia('(max-width: 767px)').matches);
    if (!msGrowOff) { return; }
  }


  /* Elementor's own Background Position / Size / Repeat of the container, as jarallax
     options. Read from computed style, so the per-device values (Elementor emits them in
     media queries) and a custom X/Y position are honoured. jarallax paints its <img> with
     object-position / object-fit, so only cover / contain survive as sizes. */
  function msParallaxFit(el) {
    var cs = window.getComputedStyle(el);
    var position = String(cs.backgroundPosition || '').split(',')[0].trim();
    var size = String(cs.backgroundSize || '').split(',')[0].trim();
    var repeat = String(cs.backgroundRepeat || '').split(',')[0].trim();
    if (!position || position === 'initial') { position = '50% 50%'; }
    if (size !== 'cover' && size !== 'contain') { size = 'cover'; }
    if (!repeat) { repeat = 'no-repeat'; }
    return { position: position, size: size, repeat: repeat };
  }

  /* Breakpoint changed (rotation, resize): mirror the now-current Elementor values onto the
     live jarallax image — no destroy/re-init, so nothing flickers. */
  function msSyncParallaxFit(el) {
    if (el && el.msNativeParallax) { el.msNativeParallax.syncFit(msParallaxFit(el)); return; }
    var inst = el && el.jarallax;
    if (!inst || !inst.options || !inst.image || !inst.image.$item) { return; }
    var fit = msParallaxFit(el);
    if (inst.options.imgPosition === fit.position && inst.options.imgSize === fit.size && inst.options.imgRepeat === fit.repeat) { return; }
    inst.options.imgPosition = fit.position;
    inst.options.imgSize = fit.size;
    inst.options.imgRepeat = fit.repeat;
    var img = inst.image.$item;
    if (inst.image.useImgTag) {
      img.style.objectPosition = fit.position;
      img.style.objectFit = fit.size;
    } else {
      img.style.backgroundPosition = fit.position;
      img.style.backgroundSize = fit.size;
      img.style.backgroundRepeat = fit.repeat;
    }
    if (typeof inst.coverImage === 'function') { inst.coverImage(); }
    if (typeof inst.onScroll === 'function') { inst.onScroll(true); }
  }

  function msWatchParallaxFit(el) {
    ELMAUVE._parallaxFitEls = ELMAUVE._parallaxFitEls || [];
    if (ELMAUVE._parallaxFitEls.indexOf(el) === -1) { ELMAUVE._parallaxFitEls.push(el); }
    if (ELMAUVE._parallaxFitBound) { return; }
    ELMAUVE._parallaxFitBound = true;
    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        ELMAUVE._parallaxFitEls = ELMAUVE._parallaxFitEls.filter(function (item) { return item && item.isConnected !== false; });
        ELMAUVE._parallaxFitEls.forEach(msSyncParallaxFit);
      }, 150);
    });
  }

  function applyParallaxImage(bgUrl, $target) {
    if (!bgUrl) return;

    msDestroyJarallax($target);

    // Read Elementor's background placement BEFORE jarallax neutralises the element background.
    var fit = msParallaxFit($target[0]);

    $target.append('<img class="jarallax-img" src="' + bgUrl + '" alt="" aria-hidden="true" decoding="async" />');

    /* Graceful reveal. On elements flagged .ms-bg-parallax (plugin.php) the static CSS
       background is never painted, so this <img> is the only thing ever shown — and it is
       shown only once the file has loaded AND jarallax has sized/positioned it (revealing
       earlier would flash the plain cover crop, then jump to the taller parallax crop).
       Should jarallax never arrive (blocked script), the plain image is shown after a
       grace period. Unflagged elements (old cached HTML) keep the previous behaviour. */
    var pxImg = $target.children('img.jarallax-img').last()[0];
    var pxLoaded = false, pxReady = false, pxShown = false;
    function pxReveal() {
      if (pxShown || !pxLoaded || !pxReady || !pxImg) { return; }
      pxShown = true;
      void pxImg.offsetWidth; // flush styles so the opacity transition actually runs
      pxImg.classList.add('ms-px-in');
    }
    function pxOnLoad() { pxLoaded = true; pxReveal(); }
    if (pxImg) {
      if (pxImg.complete && pxImg.naturalWidth) { pxLoaded = true; }
      else {
        pxImg.addEventListener('load', pxOnLoad, { once: true });
        pxImg.addEventListener('error', pxOnLoad, { once: true });
      }
    }
    setTimeout(function () { pxReady = true; pxReveal(); }, 3000);

    var speed = msClamp(msNum(widgetExt?.mauve_ext_is_background_parallax_speed?.size, 0.5), 0.05, 1.5);
    if (msParallaxDebug && msParallaxDebug.speed > 0) { speed = msClamp(msParallaxDebug.speed, 0.05, 1.5); }

    function startJarallax() {
      msParallaxReport($target[0], 'jarallax, speed ' + speed);
      $target.addClass('jarallax');
      msEnsureJarallax(function () {
        $target.jarallax({
          speed: speed,

          type: 'scroll',
          noIos: false,
          imgSize: fit.size,
          imgPosition: fit.position,
          imgRepeat: fit.repeat,
        });
        msWatchParallaxFit($target[0]);
        pxReady = true;
        pxReveal();
      });
    }

    if (msTryNativeParallaxImage($target[0], pxImg, speed, fit, startJarallax)) {
      msParallaxReport($target[0], $target[0].getAttribute('data-ms-parallax-engine') + ' ' + $target[0].getAttribute('data-ms-parallax-base') + ', speed ' + speed);
      msWatchParallaxFit($target[0]);
      pxReady = true;
      pxReveal();
      return;
    }
    startJarallax();
  }


  // --- tylko frontend (tak jak u Ciebie) ---
  if (elementorFrontend.isEditMode()) return;

  // --- target (Twoja logika lazyload) ---
  var widgetId = $scope.attr('data-id');
  var elementorSelector = `.elementor-element-${widgetId}`;
  var $lazyElement = $scope.closest(elementorSelector);

  // --- CASE 1: CLASSIC BG (image) ---
  if (
    widgetExt.background_background === 'classic'
  ) {
    // jeśli lazyload -> czekamy aż e-lazyloaded
    function extractBgFrom($el) {
      // .ms-bg-parallax (set server-side in plugin.php) hides the static background with
      // !important from the first paint — lift it for this synchronous read only.
      var hidEl = $el[0], hid = !!(hidEl && hidEl.classList.contains('ms-bg-parallax'));
      if (hid) { hidEl.classList.remove('ms-bg-parallax'); }
      try {
        let bg = $el.css('background-image');
        if (!bg || bg === 'none') bg = getComputedStyle($el[0]).getPropertyValue('background-image');
        if (!bg || bg === 'none') bg = getComputedStyle($el[0]).getPropertyValue('--e-bg-lazyload').trim();
        if (!bg || bg === 'none') return '';
        return bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      } finally {
        if (hid) { hidEl.classList.add('ms-bg-parallax'); }
      }
    }

    /* Elementor's "Lazy Load Background Images" prints on every page
         .e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload),
         .e-con.e-parent:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) * { background-image: none !important }
       (n+3 / n+2 on short screens) plus an IntersectionObserver that adds `e-lazyloaded` to a
       TOP-LEVEL container once it scrolls within 200px of the viewport — to the top-level
       container only. So a nested container's background is hidden by its top-level ancestor's
       state and the class never lands on the nested element itself: watch the gate (closest
       .e-con.e-parent — the element itself when it is top-level) and re-read the background once
       it opens. Until 4.52 this waited for `e-lazyloaded` on the element itself, which for a
       nested container never came — with .ms-bg-parallax hiding the static background, the
       container stayed blank on the live page. */
    function msLazyGate(el) {
      var gate = null;
      try { gate = (el && el.closest) ? el.closest('.e-con.e-parent') : null; } catch (e) {}
      return gate || el;
    }
    function msLazyGateOpen(gate) {
      var c = gate.classList;
      return !c.contains('e-con') || c.contains('e-lazyloaded') || c.contains('e-no-lazyload');
    }

    function observeLazyLoadAndApply() {
      var el = $lazyElement[0];
      var gate = msLazyGate(el);
      var settled = false;

      /* The gate is open (or there is none) and there is still no image: Elementor's lazyload
         is not going to deliver one. A single late re-read covers stylesheets that arrive after
         DOM ready (async-CSS optimisers); after that, restore the static background (pre-4.50
         behaviour) rather than leave the element blank. */
      function giveUp() {
        if (settled) { return; }
        settled = true;
        setTimeout(function () {
          var late = extractBgFrom($lazyElement);
          if (late) { applyParallaxImage(late, $lazyElement); }
          else { el.classList.remove('ms-bg-parallax'); }
        }, 1500);
      }

      function released() {
        return msLazyGateOpen(gate) || el.classList.contains('e-lazyloaded');
      }

      if (typeof MutationObserver !== 'function' || released()) { giveUp(); return; }

      var observer = new MutationObserver(function () {
        if (settled) { return; }
        // Still gated: do NOT read here — extractBgFrom toggles our own class, which would
        // re-trigger this observer in a loop.
        if (!released()) { return; }
        var bgUrl = extractBgFrom($lazyElement);
        observer.disconnect();
        if (bgUrl) {
          settled = true;
          applyParallaxImage(bgUrl, $lazyElement);
        } else {
          giveUp();
        }
      });
      observer.observe(gate, { attributes: true, attributeFilter: ['class'] });
      if (gate !== el) { observer.observe(el, { attributes: true, attributeFilter: ['class'] }); }
    }

    if ($lazyElement.length) {
  // ✅ FIX: najpierw próbujemy OD RAZU (Lazy OFF lub już załadowane)
  const bgUrlNow = extractBgFrom($lazyElement);

  if (bgUrlNow) {
    applyParallaxImage(bgUrlNow, $lazyElement);
  } else {
    // ⏳ fallback tylko gdy bg jeszcze nie istnieje (Lazy ON)
    observeLazyLoadAndApply();
  }
} else {
  const bgUrl = extractBgFrom($scope);
  if (bgUrl) applyParallaxImage(bgUrl, $scope);
}

  }

 // --- CASE 2: VIDEO BG ---

const isVideoBg =
  widgetExt.background_background === 'video' ||
  widgetExt.__mauve_bg_was_video === 'true';

if (isVideoBg) {
  const $target = ($lazyElement && $lazyElement.length) ? $lazyElement : $scope;
  msApplyParallaxVideo(widgetExt, $target);
}


});





if ( window.elementorFrontend ) {
//Start execute javascript for mega menu
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-navigation-menu.default', function( $scope ) {
			$(function( $ ) {
if (ELMAUVE._megaMenuBound) { return; }
ELMAUVE._megaMenuBound = true;
ELMAUVE.MainMenu();
$.fn.MauveproMegaMenu = function( custom ) {

		var options = $.extend({
				events: 'mouseenter'
			}, custom),
			cacheMenu = {};


		return this.each(function() {
			var $thisMega = $(this),
				$megaMenuPosts = $('.mega-menu-posts', $thisMega);

			$thisMega.on(options.events+' touchend', '.mega-link', function(event) {
				event.preventDefault();

				var $self = $(this),
					termid = $self.data('termid'),
					itemid = $self.data('itemid'),
					tax = $self.data('tax'),
					parents = $self.parent().children( 'li' ),
					nosubmenu = $self.parents('.has-mega-sub-menu').attr('data-nosubmenu') ? $self.parents('.has-mega-sub-menu').attr('data-nosubmenu') : '3';
				if ( !$self.hasClass( 'active-link' ) ) {
				if( 'string' == typeof cacheMenu[itemid] ) {
					$megaMenuPosts.html( cacheMenu[itemid] );
				} else {
					if( $self.closest( ".mega-container" ).hasClass( 'loading' ) ) {
					
						return;
					}
					$self.closest( ".mega-container" ).addClass( 'loading' );
					
					$.ajax({
					 url: msScript.ajax_url,
		             type: 'POST',
					 async: true,
		             data: {
			                action: 'ms_theme_mega_posts',
							termid: termid,
							itemid: itemid,
							tax: tax,
							nosubmenu: nosubmenu
                           },
						complete: function () {
							$self.closest( ".mega-container" ).removeClass( 'loading' );
						}, 
						success: function( data ) {
							$megaMenuPosts.html( data );
							cacheMenu[itemid] = data;
						}
					});
				 }
				 parents.removeClass( 'active-link' );
				$self.addClass( 'active-link' );
				 }
			});

						// when hovering over top-level mega menu items, show the first one automatically
			$thisMega.on( 'mouseenter', '> a', function(){
			
			if($( this ).closest( 'li' ).find( '.mega-sub-menu li' ).hasClass('current-menu-item')){
				$( this ).closest( 'li' ).find( '.mega-sub-menu .current-menu-item.mega-link' ).trigger( options.events );
				}else{
				$( this ).closest( 'li' ).find( '.mega-sub-menu .mega-link:first' ).trigger( options.events );
				}

			} );
			
			
		});
	
	};
		if( 'undefined' !== typeof $.fn.MauveproMegaMenu ) {
			/* add required wrappers for mega menu items */
			$( '.has-sub-menu.has-mega-sub-menu' ).each(function(){
				var $this = $( this );

				$this.find( '> ul' ).removeAttr( 'class' )
					.wrap( '<div class="mega-sub-menu sub-menu" />' )
					.wrap( '<div class="mega-container" />' )
					.after( '<div class="mega-menu-posts" />' )
					.find( 'li.menu-item-type-taxonomy' ) // only taxonomy terms can display mega posts
						.addClass( 'mega-link' );
				
			});
			$('.has-sub-menu.has-mega-sub-menu').MauveproMegaMenu({
				events: msScript.events
			});
			
			
		}
			});
		} );


/* Slideshow parallax.
   Swiper's built-in per-slide parallax clamps each slide's progress to [-1,1]
   (parallax module: Math.min(Math.max(l,-1),1)). At slidesPerView > 1 that
   freezes every slide beyond the first two at the clamp, so only the nearest
   photos appear to move. We drive the image ourselves from progress normalised
   by (slidesPerView - 1) so ALL visible photos pan together.
   Geometry: CSS gives the image width:130% / left:-15%, i.e. 15% of the tile of
   headroom each side. A shift of SS_PARALLAX% of the image's own width is
   10 * 1.30 = 13% of the tile - inside the headroom, so an edge never shows.
   Changing SS_PARALLAX above 11 WILL expose edges unless the CSS grows too. */
ELMAUVE.SS_PARALLAX = 10;

ELMAUVE.ssParallaxApply = function ( sw ) {
  if ( !sw || !sw.slides ) { return; }
  var spv = ( sw.params && sw.params.slidesPerView );
  if ( typeof spv !== 'number' || !isFinite( spv ) || spv < 1 ) {
    // slidesPerView:'auto' - ask Swiper how many are actually on screen, or the
    // divisor stays 1 and every slide past the first freezes at the clamp again.
    spv = ( typeof sw.slidesPerViewDynamic === 'function' ) ? sw.slidesPerViewDynamic() : 1;
  }
  if ( typeof spv !== 'number' || !isFinite( spv ) || spv < 1 ) { spv = 1; }
  var div = Math.max( 1, spv - 1 );
  var P = ELMAUVE.SS_PARALLAX;
  Array.prototype.forEach.call( sw.slides, function ( slide ) {
    var img = slide.querySelector( '.blog-slideshow-img' );
    if ( !img ) { return; }
    var t = slide.progress / div;
    if ( t > 1 ) { t = 1; } else if ( t < -1 ) { t = -1; }
    img.style.transform = 'translate3d(' + ( -P * t ).toFixed( 3 ) + '%, 0, 0)';
  } );
};

ELMAUVE.ssParallaxBind = function ( sw ) {
  if ( !sw || sw._mauveSsBound ) { return; }
  sw._mauveSsBound = true;
  sw.on( 'setTranslate progress resize breakpoint', function () {
    ELMAUVE.ssParallaxApply( sw );
  } );
  // Mirror Swiper's transition onto the image, or it jumps instead of gliding.
  sw.on( 'setTransition', function ( s, duration ) {
    Array.prototype.forEach.call( s.slides, function ( slide ) {
      var img = slide.querySelector( '.blog-slideshow-img' );
      if ( img ) {
		img.style.removeProperty( 'transition-duration' );
		img.style.setProperty( '--ss-parallax-duration', duration + 'ms' );
	  }
    } );
  } );
  ELMAUVE.ssParallaxApply( sw );
};

/* Enlarge Active Slide (Image Gallery slideshow). Every slide gets --mg-focus:
   1 at the active position, falling to 0 one slide away. It follows Swiper's
   translate, so the size and dimming track a drag and glide with the slide
   transition instead of jumping when the active class moves. The position is
   read against the stops Swiper snaps to (slidesGrid), which keeps it exact for
   Natural Width images of different widths. A Swiper grid has no single active
   image, so it stays at full size. */
ELMAUVE.ssFocusApply = function ( sw ) {
  if ( !sw || sw.destroyed || !sw.slides ) { return; }
  var grid = sw.params.grid && sw.params.grid.rows > 1;
  var stops = sw.slidesGrid || [];
  var last = stops.length - 1;
  var pos = sw.rtlTranslate ? sw.translate : -sw.translate;
  var at = 0;
  if ( last > 0 ) {
    if ( pos <= stops[0] ) {
      at = ( pos - stops[0] ) / ( ( stops[1] - stops[0] ) || 1 );
    } else if ( pos >= stops[ last ] ) {
      at = last + ( pos - stops[ last ] ) / ( ( stops[ last ] - stops[ last - 1 ] ) || 1 );
    } else {
      for ( var i = 0; i < last; i++ ) {
        if ( pos < stops[ i + 1 ] ) { at = i + ( pos - stops[i] ) / ( ( stops[ i + 1 ] - stops[i] ) || 1 ); break; }
      }
    }
  }
  Array.prototype.forEach.call( sw.slides, function ( slide, index ) {
    var focus = grid ? 1 : Math.max( 0, 1 - Math.abs( index - at ) );
    slide.style.setProperty( '--mg-focus', focus.toFixed( 4 ) );
  } );
};

ELMAUVE.ssFocusBind = function ( sw ) {
  if ( !sw || sw._mauveFocusBound ) { return; }
  sw._mauveFocusBound = true;
  var el = sw.el;
  el.classList.add( 'ss-focus' );
  sw.on( 'setTranslate resize breakpoint slidesUpdated slidesGridLengthChange', function () {
    ELMAUVE.ssFocusApply( sw );
  } );
  // Same duration as the slide movement: 0 while dragging, the speed afterwards.
  sw.on( 'setTransition', function ( s, duration ) {
    el.style.setProperty( '--ss-focus-duration', duration + 'ms' );
  } );
  // A smaller side image is brought to the middle on click instead of opening
  // the lightbox. "Follow Cursor" arrows already move the slideshow on click.
  if ( el.dataset.arrowMode !== 'sides' ) {
    var pressed = null;
    var down = function ( event ) {
      var slide = event.target.closest ? event.target.closest( '.swiper-slide' ) : null;
      pressed = slide && !slide.classList.contains( 'swiper-slide-active' ) ? slide : null;
    };
    var click = function ( event ) {
      var slide = event.target.closest ? event.target.closest( '.swiper-slide' ) : null;
      // detail 0 = keyboard: Enter on a focused image still opens the lightbox.
      if ( !slide || slide !== pressed || event.detail === 0 || event.target.closest( '.mauve-gallery-slideshow__lightbox' ) ) { return; }
      pressed = null;
      event.preventDefault();
      event.stopPropagation();
      if ( sw.destroyed || sw.allowClick === false ) { return; }
      sw.clickedSlide = slide;
      sw.clickedIndex = sw.slides.indexOf( slide );
      sw.slideToClickedSlide();
    };
    el.addEventListener( 'pointerdown', down, true );
    el.addEventListener( 'click', click, true );
    sw.on( 'destroy', function () {
      el.removeEventListener( 'pointerdown', down, true );
      el.removeEventListener( 'click', click, true );
    } );
  }
  sw.on( 'destroy', function () {
    el.classList.remove( 'ss-focus' );
    el.style.removeProperty( '--ss-focus-duration' );
    Array.prototype.forEach.call( sw.slides || [], function ( slide ) { slide.style.removeProperty( '--mg-focus' ); } );
  } );
  ELMAUVE.ssFocusApply( sw );
};

/* Elementor lightbox rescue.
   Elementor builds its lightbox slides as <img class="swiper-lazy" data-src="...">
   with NO src, relying on Swiper's lazy module to promote data-src -> src. That
   module was removed in Swiper 9. This plugin puts Swiper 11 on window, and
   Elementor reuses window.Swiper when it exists instead of loading its own v8,
   so nothing promotes the images and the overlay opens blank. Promote them here.
   Idempotent and version-agnostic: bails the moment src is already set, so it
   is a no-op on pages where Elementor used its own Swiper. */
ELMAUVE.lightboxLazyFix = function () {
  if ( window._mauveLbLazyFix || !window.MutationObserver || !document.body ) { return; }
  window._mauveLbLazyFix = true;

  // Match what Elementor asked Swiper for (lazy: {loadPrevNext:true}): the
  // active slide and its two neighbours - NOT the whole gallery. The lightbox
  // href is the full-size original, so promoting every slide on open would
  // download the entire gallery at full resolution on the first click.
  var NEAR = '.swiper-slide-active,.swiper-slide-next,.swiper-slide-prev';

  var promote = function ( img ) {
    if ( img.getAttribute( 'src' ) || !img.getAttribute( 'data-src' ) ) { return; }
    var slide = img.closest ? img.closest( '.swiper-slide' ) : null;
    if ( slide && slide.matches && !slide.matches( NEAR ) ) { return; }
    img.setAttribute( 'src', img.getAttribute( 'data-src' ) );
    img.classList.add( 'swiper-lazy-loaded' );
    if ( slide ) {
      var pre = slide.querySelector( '.swiper-lazy-preloader' );
      if ( pre && pre.parentNode ) { pre.parentNode.removeChild( pre ); }
    }
  };

  var sweep = function () {
    Array.prototype.forEach.call(
      document.querySelectorAll( 'img.swiper-lazy[data-src]' ),
      promote
    );
  };

  // Swiper retags active/next/prev on every slide change; coalesce to one sweep
  // per frame so the class churn on the page's own carousels stays cheap.
  var pending = false;
  var schedule = function () {
    if ( pending ) { return; }
    pending = true;
    var run = function () { pending = false; sweep(); };
    if ( window.requestAnimationFrame ) { window.requestAnimationFrame( run ); }
    else { window.setTimeout( run, 16 ); }
  };

  new MutationObserver( function ( muts ) {
    for ( var i = 0; i < muts.length; i++ ) {
      var m = muts[ i ];
      if ( ( 'childList' === m.type && m.addedNodes && m.addedNodes.length ) ||
           'attributes' === m.type ) {
        schedule();
        return;
      }
    }
  } ).observe( document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ 'class', 'data-src' ]
  } );

  sweep();
};

ELMAUVE.blogSlideshow = function ( $scope ) {
  if ( !$scope || !$scope.length ) { return; }
  var containers = $scope[0].querySelectorAll('.blog-slideshow-swiper');
  if ( !containers.length ) { return; }

  // Swiper 11 is now global on this page, which breaks Elementor's lightbox.
  ELMAUVE.lightboxLazyFix();

  Array.prototype.forEach.call(containers, function ( container ) {
    // Tear down any previous instance (editor re-render safety).
	if ( container._mauveArrowZones ) {
	  container._mauveArrowZones();
	  container._mauveArrowZones = null;
	}
    if ( container.swiper ) {
      try { container.swiper.destroy(true, true); } catch (e) {}
      container.swiper = null;
    }

    var d = container.dataset || {};
    var itemsD = parseFloat(d.items)  || 3;
    var itemsT = parseFloat(d.tablet) || 2;
    var itemsM = parseFloat(d.mobile) || 1;
	var rowsD = Math.max( 1, parseInt( d.rows, 10 ) || 1 );
	var rowsT = Math.max( 1, parseInt( d.rowsTablet, 10 ) || 1 );
	var rowsM = Math.max( 1, parseInt( d.rowsMobile, 10 ) || 1 );
    var space  = parseInt(d.space, 10); if ( isNaN(space) ) { space = 16; }

    var nextEl = container.querySelector('.swiper-button-next');
    var prevEl = container.querySelector('.swiper-button-prev');
    var pagEl  = container.querySelector('.swiper-pagination');

	// Cursor navigation: the appropriate previous/next control follows the
	// pointer inside the image row. elementsFromPoint also keeps the gallery's
	// image hover effect active while the button itself sits beneath the cursor.
	if ( d.arrowMode === 'sides' && nextEl && prevEl ) {
	  var pointerSlide = null;
	  var arrowMove = function ( event ) {
		if ( event.target.closest && event.target.closest( '.mauve-gallery-slideshow__lightbox' ) ) { arrowLeave(); return; }
		var rect = container.getBoundingClientRect();
		var wrapper = container.querySelector( '.swiper-wrapper' );
		var row = wrapper ? wrapper.getBoundingClientRect() : rect;
		if ( event.clientY < row.top || event.clientY > row.bottom ) { arrowLeave(); return; }
		var previous = event.clientX < rect.left + rect.width / 2;
		var button = previous ? prevEl : nextEl;
		button.style.left = ( event.clientX - rect.left ) + 'px';
		button.style.top = ( event.clientY - rect.top ) + 'px';
		button.style.right = 'auto';
		container.classList.toggle( 'is-hover-prev', previous );
		container.classList.toggle( 'is-hover-next', !previous );
		if ( pointerSlide ) { pointerSlide.classList.remove( 'is-pointer-slide' ); }
		pointerSlide = null;
		if ( document.elementsFromPoint ) {
		  var below = document.elementsFromPoint( event.clientX, event.clientY );
		  for ( var i = 0; i < below.length; i++ ) {
			if ( below[i].classList && below[i].classList.contains( 'swiper-slide' ) && container.contains( below[i] ) ) {
			  pointerSlide = below[i];
			  pointerSlide.classList.add( 'is-pointer-slide' );
			  break;
			}
		  }
		}
	  };
	  var arrowLeave = function () {
		container.classList.remove( 'is-hover-prev', 'is-hover-next' );
		if ( pointerSlide ) { pointerSlide.classList.remove( 'is-pointer-slide' ); pointerSlide = null; }
		[ prevEl, nextEl ].forEach( function ( button ) {
		  button.style.removeProperty( 'left' );
		  button.style.removeProperty( 'top' );
		  button.style.removeProperty( 'right' );
		} );
	  };
	  var arrowClick = function ( event ) {
		if ( event.defaultPrevented || event.button !== 0 || !window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches ) { return; }
		var target = event.target && event.target.closest ? event.target : null;
		if ( target && target.closest( '.mauve-gallery-slideshow__lightbox, a, button, input, select, textarea, label, .swiper-pagination' ) ) { return; }
		var wrapper = container.querySelector( '.swiper-wrapper' );
		var row = wrapper ? wrapper.getBoundingClientRect() : container.getBoundingClientRect();
		if ( event.clientY < row.top || event.clientY > row.bottom || !container.swiper ) { return; }
		if ( event.clientX < container.getBoundingClientRect().left + container.clientWidth / 2 ) {
		  container.swiper.slidePrev();
		} else {
		  container.swiper.slideNext();
		}
	  };
	  container.addEventListener( 'pointermove', arrowMove );
	  container.addEventListener( 'pointerleave', arrowLeave );
	  container.addEventListener( 'click', arrowClick );
	  container._mauveArrowZones = function () {
		container.removeEventListener( 'pointermove', arrowMove );
		container.removeEventListener( 'pointerleave', arrowLeave );
		container.removeEventListener( 'click', arrowClick );
		arrowLeave();
	  };
	}

    var autoplay = ( d.autoplay === 'true' )
      ? { delay: parseInt(d.autoplayDelay, 10) || 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
      : false;

    var speed = parseInt(d.speed, 10); if ( isNaN(speed) || speed <= 0 ) { speed = 700; }
    // The "active" caption waits for the slide to land before sliding in.
    // Swiper flips the -active class at transition START, so the delay tracks
    // the transition duration. Hover mode is untouched (user-triggered).
    container.style.setProperty( '--ss-cap-delay', Math.round( speed * 0.8 ) + 'ms' );

    // 'natural' = slidesPerView:'auto'. Each slide is only as wide as its photo
    // at the shared slide height, so landscapes stay wide and portraits narrow
    // and nothing is cropped. Fixed per-view counts are meaningless there, so
    // the breakpoint map is dropped too.
    var natural = ( d.sizing === 'natural' );
	if ( natural ) { rowsD = rowsT = rowsM = 1; }
	var hasGrid = !natural && Math.max( rowsD, rowsT, rowsM ) > 1;

    var opts = {
      slidesPerView: natural ? 'auto' : itemsM,
      centeredSlides: d.centered === 'true',
      spaceBetween: space,
      speed: speed,
	  loop: d.loop === 'true',
      // Image parallax is driven by ssParallaxBind() below. Keeping Swiper's
      // native module enabled lets data attributes write inline transforms to
      // captions, which can push their text outside the current tile.
      parallax: false,
      watchSlidesProgress: true,
      grabCursor: true,
      autoHeight: false,
      autoplay: autoplay,
      navigation: ( d.arrows === 'true' && nextEl && prevEl ) ? { nextEl: nextEl, prevEl: prevEl } : false,
      pagination: ( d.dots === 'true' && pagEl ) ? { el: pagEl, clickable: true } : false,
      breakpoints: natural ? {} : {
		768:  { slidesPerView: itemsT, spaceBetween: space },
		1025: { slidesPerView: itemsD, spaceBetween: space }
      }
    };
	if ( hasGrid ) {
	  opts.grid = { rows: rowsM, fill: 'row' };
	  opts.breakpoints[768].grid = { rows: rowsT, fill: 'row' };
	  opts.breakpoints[1025].grid = { rows: rowsD, fill: 'row' };
	}

    var attach = function ( inst ) {
      container.swiper = inst;
      if ( d.parallax === 'true' && !natural ) { ELMAUVE.ssParallaxBind( inst ); }
      if ( d.focus === 'true' ) { ELMAUVE.ssFocusBind( inst ); }
      if ( pagEl ) {
        // With many images the strip overflows and scrolls; keep the active
        // bullet centred so it can never sit hidden past the fade mask.
        var centerActive = function () {
          var b = pagEl.querySelector( '.swiper-pagination-bullet-active' );
          if ( !b || pagEl.scrollWidth <= pagEl.clientWidth ) { return; }
          pagEl.scrollLeft = b.offsetLeft - ( pagEl.clientWidth - b.offsetWidth ) / 2;
        };
        inst.on( 'paginationUpdate slideChange resize', centerActive );
        centerActive();
      }
    };

    if ( typeof Swiper === 'undefined' ) {
      // Editor preview iframe may not have the global build yet â€” fall back to
      // Elementor's own async Swiper so the layout still previews.
      if ( window.elementorFrontend && elementorFrontend.utils && elementorFrontend.utils.swiper ) {
        new elementorFrontend.utils.swiper( container, opts ).then( attach );
      }
    } else {
      attach( new Swiper( container, opts ) );
    }
  });
};

		//Start execute javascript for blog posts
elementorFrontend.hooks.addAction(
  'frontend/element_ready/mauve-blog-posts.default',
  function( $scope ) {
    ELMAUVE.initWidget($scope, "msBlogPosts", {
      init: function($scope){ ELMAUVE.blogposts($scope); },
      destroy: function($scope){ ELMAUVE.blogFloatingDestroy($scope); }
    });
    ELMAUVE.initWidget($scope, "msBlogSlideshow", {
      init: function($scope){ ELMAUVE.blogSlideshow($scope); },
      destroy: function($scope){
        $scope.find('.blog-slideshow-swiper').each(function(){
          if (this.swiper) { try { this.swiper.destroy(true, true); } catch(e) {} this.swiper = null; }
		  if (this._mauveArrowZones) { this._mauveArrowZones(); this._mauveArrowZones = null; }
        });
      }
    });
  }
);

		//End execute javascript for blog posts
		
		//Start execute javascript for background list
		elementorFrontend.hooks.addAction(
  "frontend/element_ready/mauve-background-list.default",
  function( $scope ) {
    ELMAUVE.initWidget($scope, "msBackgroundList", {
	  init: function($scope){ ELMAUVE.BackgroundList($scope); },
	  destroy: function($scope){ ELMAUVE.BackgroundListDestroy($scope); }
	});
  }
);
		//End execute javascript for background list

		//Start execute javascript for slider parallax
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-slider-parallax.default', function( $scope ) {
			ELMAUVE.initWidget($scope, "msSliderParallax", {
				init: function($scope){ ELMAUVE.SliderParallax($scope); }
			});

		} );
		//End execute javascript for slider parallax
		//Start execute javascript for gallery justified
elementorFrontend.hooks.addAction(
  "frontend/element_ready/mauve-gallery-justified.default",
  function( $scope ) {
    ELMAUVE.initWidget($scope, "msJustified", ELMAUVE.JustifiedGallery);
  }
);
		//End execute javascript for gallery justified
				//Start execute javascript for testimonials carousel
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-testimonial-carousel.default', function( $scope ) {
ELMAUVE.initWidget($scope, "msTestimonialCarousel", {
				init: function($scope){ ELMAUVE.TestimonialCarousel($scope); },
				destroy: function($scope){
					// Swiper instances are destroyed inside init (safety), but we keep this for completeness.
					$scope.find('.testimonials-container').each(function(){
						if (this.swiper) { try { this.swiper.destroy(true,true); } catch(e) {} this.swiper=null; }
					});
					$scope.find('.testimonials-container .ms-testi-copy').remove();
				}
			});
		});
		//End execute javascript for testimonials carousel
		
		//Start execute javascript for mainslideshow
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-mainslideshow.default', function( $scope ) {
ELMAUVE.initWidget($scope, "msMainSlideshow", {
				init: function($scope){ ELMAUVE.swiperCarousel($scope); },
				destroy: function($scope){
					$scope.find('.swiper-container-elementor').each(function(){
						if (this.swiper) { try { this.swiper.destroy(true,true); } catch(e) {} this.swiper=null; }
					});
				}
			});
		});
		//End execute javascript for mainslideshow
//Start execute javascript for contact form 7
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-contact-form-7.default', function( $scope ) {
ELMAUVE.hideContactForm7Response($scope);
		});
		//End execute javascript for contact form 7
		
//Start execute javascript for vertical navigation
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-vertical-navigation-menu.default', function( $scope ) {
 if ( $scope.find( '.ms-vnav-drill' ).length ) {
 ELMAUVE.verticalDrill( $scope );
 return;
 }
 if (elementorFrontend.isEditMode()) {
 ELMAUVE.initWidget($scope, "msVerticalNav", function($scope){ ELMAUVE.verticalNavigation($scope); });
	 }
		});
		//End execute javascript for vertical navigation
//Start execute javascript for counter
		elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-counter.default', function( $scope ) {
ELMAUVE.Counter($scope);
		});
		//End execute javascript for counter
//End
}
	
	} );
	
} )( jQuery );

/* -------------------------------------------------------------------------
 * Background Video Controls (Mauve Studio) 
 * - Works with Elementor "Background Video" for Section/Container
 * ---------------------------------------------------------------------- */
(function ($, window) {
  'use strict';

  var MS_BGVC = {
	  uid: 0,
    init: function ($scope) {
  var ext = MS_BGVC.getSettings($scope);
  if (!ext) return;

  if (ext.mauve_ext_bgvideo_controls !== 'true') return;
  if (ext.background_background !== 'video') return;

  var $host = $scope;
  var hostId = $host.data('msBgvcUid');

  if (!hostId) {
    hostId = (++MS_BGVC.uid);
    $host.data('msBgvcUid', hostId);
  }

  $host.addClass('ms-bgvideo-host');

  if ($host.data('msBgvcInit')) return;

  // State flags
  var isInsideHost = false;
  var isOverInteractive = false;
  var state = { userInteracted: false };

  // Detect player
  var player = MS_BGVC.detectPlayer($host, ext, state);

  if (!player) {
    MS_BGVC.observePlayer($host, ext);
    return;
  }

  $host.data('msBgvcInit', true);
  $host.removeData('msBgvcTry').removeData('msBgvcPending');

      // Ensure positioning context for absolute overlay
      if ($host.css('position') === 'static') {
        $host.css('position', 'relative');
      }

      // Capabilities
      var hasHover = window.matchMedia && window.matchMedia('(any-hover:hover)').matches;
var hasFinePointer = window.matchMedia && window.matchMedia('(pointer:fine)').matches;

      var followCursor = true;
      var gsap = window.gsap || null;

      var onMouseMove = null;
      var tickFn = null;

      // Autoplay
      var wantsAutoplay = ext.mauve_ext_bgvideo_autoplay === 'true';
var dimOnPlay = String(ext.mauve_ext_bgvideo_dim_on_play || '') === 'true';
$host.toggleClass('ms-bgvc-dim-enabled', dimOnPlay);

      // UI mode (skin)
      // - ext.mauve_ext_bgvideo_ui_mode can be: 'cursor' | 'center'
      var uiMode = (ext.mauve_ext_bgvideo_ui_mode || 'cursor').toLowerCase();
var isCenterMode = uiMode === 'center';
var isNoneMode   = uiMode === 'none';
	  
	  // Force center mode on touch devices (no cursor)
if (!hasFinePointer) {
  isCenterMode = true;
  uiMode = 'center';
}

      // Add mode classes for CSS hooks
     $host
  .toggleClass('ms-bgvc-mode-center', isCenterMode)
  .toggleClass('ms-bgvc-mode-cursor', uiMode === 'cursor')
  .toggleClass('ms-bgvc-mode-none', isNoneMode)
  .toggleClass('ms-bgvc-autoplay-off', !wantsAutoplay);

      // Build controls
var $controls = $(
  '<div class="ms-bgvideo-controls" aria-label="Video controls">' +
    '<div class="ms-bgvideo-overlay" aria-label="Toggle Play/Pause"></div>' +

    // Desktop/cursor indicator (we can hide on mobile)
    '<div class="ms-play-indicator" aria-hidden="true">' +
      '<svg class="ms-icon ms-icon-play" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
        '<polygon points="7,5 19,12 7,19"></polygon>' +
      '</svg>' +
      '<svg class="ms-icon ms-icon-pause" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
        '<rect x="7" y="5" width="4" height="14"></rect>' +
        '<rect x="13" y="5" width="4" height="14"></rect>' +
      '</svg>' +
    '</div>' +

    // Center UI block
    '<div class="ms-bgvc-ui">' +
      '<div class="ms-bgvc-actions">' +
        '<a href="#" role="button" class="ms-vbtn ms-restart" aria-label="Restart video">' +
          '<svg class="ms-icon ms-icon-restart" fill="#ffffff" viewBox="-7.5 0 32 32" aria-hidden="true" focusable="false" stroke="#ffffff" stroke-width="0.5">' +
            '<path d="M15.88 13.84c-1.68-3.48-5.44-5.24-9.040-4.6l0.96-1.8c0.24-0.4 0.080-0.92-0.32-1.12-0.4-0.24-0.92-0.080-1.12 0.32l-1.96 3.64c0 0-0.44 0.72 0.24 1.040l3.64 1.96c0.12 0.080 0.28 0.12 0.4 0.12 0.28 0 0.6-0.16 0.72-0.44 0.24-0.4 0.080-0.92-0.32-1.12l-1.88-1.040c2.84-0.48 5.8 0.96 7.12 3.68 1.6 3.32 0.2 7.32-3.12 8.88-1.6 0.76-3.4 0.88-5.080 0.28s-3.040-1.8-3.8-3.4c-0.76-1.6-0.88-3.4-0.28-5.080 0.16-0.44-0.080-0.92-0.52-1.080-0.4-0.080-0.88 0.16-1.040 0.6-0.72 2.12-0.6 4.36 0.36 6.36s2.64 3.52 4.76 4.28c0.92 0.32 1.84 0.48 2.76 0.48 1.24 0 2.48-0.28 3.6-0.84 4.16-2 5.92-7 3.92-11.12z"></path>' +
          '</svg>' +
        '</a>' +
        '<a href="#" role="button" class="ms-vbtn ms-playbtn" aria-label="Play/Pause" aria-pressed="false">' +
          '<svg class="ms-icon ms-icon-play" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
            '<polygon points="7,5 19,12 7,19"></polygon>' +
          '</svg>' +
          '<svg class="ms-icon ms-icon-pause" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
            '<rect x="7" y="5" width="4" height="14"></rect>' +
            '<rect x="13" y="5" width="4" height="14"></rect>' +
          '</svg>' +
        '</a>' +
        '<a href="#" role="button" class="ms-vbtn ms-mute" aria-label="Mute/Unmute" aria-pressed="true">' +
          '<svg class="ms-icon ms-icon-sound-on" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path d="M11 5L6 9H2v6h4l5 4V5z"></path>' +
            '<path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" fill="none"></path>' +
            '<path d="M18 6a8 8 0 0 1 0 12" fill="none"></path>' +
          '</svg>' +
          '<svg class="ms-icon ms-icon-sound-off" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<path d="M11 5L6 9H2v6h4l5 4V5z"></path>' +
            '<path d="M16 9l6 6" fill="none"></path>' +
            '<path d="M22 9l-6 6" fill="none"></path>' +
          '</svg>' +
        '</a>' +
'<a href="#" role="button" class="ms-vbtn ms-fullscreen" aria-label="Open video">' +
  '<svg class="ms-icon ms-icon-open" viewBox="0 0 24 24" aria-hidden="true" focusable="false" stroke="#fff" stroke-width="2">' +
    '<path d="M9 3H3v6" fill="none"></path>' +
    '<path d="M3 3l7 7" fill="none"></path>' +
    '<path d="M15 21h6v-6" fill="none"></path>' +
    '<path d="M21 21l-7-7" fill="none"></path>' +
  '</svg>' +
'</a>' +
      '</div>' +
      '<div class="ms-progress" aria-label="Video progress">' +
        '<input class="ms-progress-range" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek" />' +
      '</div>' +
    '</div>' +
  '</div>'
);

      $host.append($controls);

      // Cache elements
      var $overlay = $controls.find('.ms-bgvideo-overlay');
      var $indicator = $controls.find('.ms-play-indicator');
	  if (isNoneMode) {
  $indicator.remove(); 
  $indicator = null;
}
var hasIndicator = !!($indicator && $indicator.length);
      var $mute = $controls.find('.ms-mute');
var $restart = $controls.find('.ms-restart');
var $playBtn = $controls.find('.ms-playbtn');
var $range = $controls.find('.ms-progress-range');
var $progressWrap = $controls.find('.ms-progress');
var $fs = $controls.find('.ms-fullscreen');

function normalizeVideoUrl(url) {
  if (!url) return url;

  // YouTube embed -> watch
  if (/youtube\.com\/embed\//.test(url)) {
    try {
      var u = new URL(url, window.location.href);
      var id = (u.pathname.split('/embed/')[1] || '').split('/')[0];
      if (id) return 'https://www.youtube.com/watch?v=' + id;
    } catch(e) {}
  }

  // youtu.be -> watch
  if (/youtu\.be\//.test(url)) {
    try {
      var u2 = new URL(url, window.location.href);
      var id2 = u2.pathname.replace('/', '');
      if (id2) return 'https://www.youtube.com/watch?v=' + id2;
    } catch(e) {}
  }

  // Vimeo player -> vimeo.com/{id}
  if (/player\.vimeo\.com\/video\//.test(url)) {
    try {
      var v = new URL(url, window.location.href);
      var idv = (v.pathname.split('/video/')[1] || '').split('/')[0];
      var hv = v.searchParams.get('h'); // unlisted video: keep its privacy code
      if (idv) return 'https://vimeo.com/' + idv + (hv ? '/' + hv : '');
    } catch(e) {}
  }

  return url;
}

function getVideoInfo() {
  var type = $host.attr('data-ms-bgvc-type') || '';

  if (type === 'mp4') {
    var v = $host.find('.elementor-background-video-container video').get(0);
    return v && v.currentSrc ? { type: 'mp4', url: v.currentSrc } : null;
  }

  var iframe = $host.find('.elementor-background-video-container iframe').get(0);
  if (!iframe) return null;

  var src = iframe.getAttribute('src') || iframe.src || '';
  if (!src) return null;

  return { type: 'iframe', url: src };
}

$fs.on('click.msBgvc', function(e){
  e.preventDefault();
  e.stopPropagation();


  if (!$.magnificPopup) {
    var infoFallback = getVideoInfo();
    if (infoFallback && infoFallback.url) window.open(infoFallback.url, '_blank', 'noopener,noreferrer');
    return;
  }

  var info = getVideoInfo();
 
  if (!info) return;

  // YouTube/Vimeo iframe
  if (info.type === 'iframe') {
    var cleanUrl = normalizeVideoUrl(info.url);

$.magnificPopup.open({
  items: { src: cleanUrl },
  type: 'iframe',
  mainClass: 'mfp-fade',
  removalDelay: 160,
  preloader: false,
  fixedContentPos: false
});
    return;
  }

  // MP4 inline video popup
  if (info.type === 'mp4') {
    var inlineId = 'ms-bgvc-inline-video-' + hostId;

    $('#' + inlineId).remove();

    $('body').append(
      '<div id="'+inlineId+'" class="mfp-hide ms-bgvc-inline-video">' +
        '<video controls autoplay playsinline style="width:100%;height:auto;max-height:80vh;" src="'+info.url+'"></video>' +
      '</div>'
    );

    $.magnificPopup.open({
      items: { src: '#' + inlineId },
      type: 'inline',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      fixedContentPos: false,
      callbacks: {
        close: function() {
          setTimeout(function(){ $('#' + inlineId).remove(); }, 50);
        }
      }
    });
  }
});

 // In cursor mode: move indicator to <body> so position:fixed is truly viewport-fixed.
 // In center mode: keep it inside controls and center it with CSS (position:absolute).
     if ($indicator && $indicator.length) {

  if (!isCenterMode) {
    $('body').append($indicator);
    $host.data('msBgvcIndicator', $indicator);

    // Cursor-follow indicator must never block clicks
    $indicator.css('pointer-events', 'none');
  } else {
    // Center mode indicator is a clickable button
    $indicator.css('pointer-events', 'auto');
  }
}

      // Hide indicator when hovering interactive elements (CTA, links, buttons, mute)
      var interactiveSel =
        'a,button,input,textarea,select,label,[role="button"],' +
        '.elementor-button,.elementor-button-link,.elementor-button-wrapper a,' +
        '.ms-mute';

      // Use mouseover/mouseout for delegated events (reliable bubbling)
      $host.on('mouseover.msBgvc', interactiveSel, function () {
        isOverInteractive = true;
        hardHideIndicator();
      });

      $host.on('mouseout.msBgvc', interactiveSel, function () {
        isOverInteractive = false;
        if (!isInsideHost) return;
        if ($controls.hasClass('is-visible')) hardShowIndicator();
      });

      // Start muted (browser policy friendly)
      player.setMuted(true);

$(document).on('msBgvc:activate.msBgvc' + hostId, function (e, fromId) {
  if (fromId === hostId) return;
  resetToInitialState();
});

      // -------------------------
      // Auto-hide after idle
      // -------------------------
      var IDLE_DELAY = 1500;
      var idleTimer = null;

      function resetIdle() {
        if (!hasHover || !isInsideHost) return;

        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () {
          if (isInsideHost) hide();
        }, IDLE_DELAY);
      }
function updateDim() {
  if (!dimOnPlay) return;
  $host.toggleClass('ms-bgvc-content-dimmed', !!player.isPlaying());
}
function updateHiddenOnPause() {
  if (wantsAutoplay) return; 
 // if ($host.attr('data-ms-bgvc-type') !== 'mp4') return; // tylko MP4

  var $c = $host.find('.elementor-background-video-container');
  if (!player.isPlaying()) $c.addClass('ms-bgvideo-hidden');
  else $c.removeClass('ms-bgvideo-hidden');
}


      // -------------------------
      // Sync UI state
      // -------------------------
      function sync() {
		 
        var isPlaying = player.isPlaying();
        $controls.toggleClass('is-playing', isPlaying);
         if ($indicator && $indicator.length) {
  $indicator.toggleClass('is-playing', isPlaying);
}

        var isUnmuted = !player.isMuted();
        $controls.toggleClass('is-unmuted', isUnmuted);
        $mute.attr('aria-pressed', player.isMuted() ? 'true' : 'false');
		if ($range && player.getProgress) {
  // Don't fight the user: the 600ms sync used to overwrite the seek slider
  // WHILE it was being dragged (visible jumping). Skip writes when focused.
  if (document.activeElement !== $range.get(0)) {
    var p = player.getProgress(); // 0..1
    $range.val(Math.round(p * 1000));
  }
}
$playBtn.toggleClass('is-playing', player.isPlaying());
$playBtn.attr('aria-pressed', player.isPlaying() ? 'true' : 'false');
updateDim();
updateHiddenOnPause();
      }
	  
function resetToInitialState() {
  try {
    if (player.resetToInitialState) {
      player.resetToInitialState();
    } else {
      try { player.pause(); } catch (e) {}
      try { player.setMuted(true); } catch (e) {}
    }
  } catch (e) {}

  state.userInteracted = false;

  if (!wantsAutoplay) {
    $host.find('.elementor-background-video-container').addClass('ms-bgvideo-hidden');
  } else {
    $host.find('.elementor-background-video-container').removeClass('ms-bgvideo-hidden');
  }

  sync();
}
	  
	  function activateThisVideo() {
  state.userInteracted = true;

  $(document).trigger('msBgvc:activate', [hostId]);

  $host.find('.elementor-background-video-container').removeClass('ms-bgvideo-hidden');

  try { player.setMuted(false); } catch (e) {}
  try { player.play(); } catch (e) {}

  sync();
  show();
}

	  if ($range && player.seekToRatio) {
  $range.on('input.msBgvc change.msBgvc', function(){
    state.userInteracted = true;
    var v = parseInt(this.value || '0', 10) / 1000;
    player.seekToRatio(v);
    sync();
  });
}

      // -------------------------
      // Indicator helpers (HARD show / hide)
      // Notes:
      // - In cursor mode: GSAP autoAlpha is used (inline styles), so we hard-set it.
      // - In center mode: rely mostly on CSS opacity via .is-visible (no GSAP required).
      // - In center mode + autoplay OFF: keep the Play button visible (do not hide).
      // -------------------------
      function hardShowIndicator() {
  if (!hasIndicator) return;
  if (isOverInteractive) return;

  $indicator.addClass('is-visible');

  if (gsap && !isCenterMode) {
    gsap.killTweensOf($indicator[0]);
    gsap.set($indicator[0], { autoAlpha: 1 });
  }
}

function hardHideIndicator() {
  if (!hasIndicator) return;

  // Center mode + autoplay OFF -> never hide play
  if (isCenterMode && !wantsAutoplay) return;

  $indicator.removeClass('is-visible');

  if (gsap && !isCenterMode) {
    gsap.killTweensOf($indicator[0]);
    gsap.set($indicator[0], { autoAlpha: 0 });
  }
}

      // -------------------------
      // Show / Hide UI
      // -------------------------
      function show() {
        $controls.addClass('is-visible');

        if (!isOverInteractive) {
          hardShowIndicator();
        } else {
          hardHideIndicator();
        }

        resetIdle();

        // Cursor mode pop animation only (center mode usually stays clean)
       if (gsap && !isOverInteractive && !isCenterMode && hasIndicator) {
  gsap.fromTo(
    $indicator[0],
    { scale: 0.92 },
    { scale: 1, duration: 0.4, ease: 'power3.out' }
  );
}
      }

      function hide() {
        if (!hasHover) return;

        window.clearTimeout(idleTimer);

        $controls.removeClass('is-visible');

       if (hasIndicator && !(isCenterMode && !wantsAutoplay)) {
  $indicator.removeClass('is-visible');
}

if (gsap && !isCenterMode && hasIndicator) {
  gsap.killTweensOf($indicator[0]);
  gsap.set($indicator[0], { autoAlpha: 0 });
}
      }

      // -------------------------
      // Overlay click => toggle play/pause
      // (CTA is above overlay due to CSS z-index, so no hijacking needed)
      // -------------------------
      $overlay.on('click.msBgvc', function (e) {
  e.preventDefault();
  e.stopPropagation();

  if (player.isPlaying()) {
    player.pause();
    sync();
    show();
    return;
  }

  activateThisVideo();
});
      // -------------------------
      // Center mode: clicking the centered indicator toggles play/pause
      // (in cursor mode, indicator is not clickable)
      // -------------------------
     if (isCenterMode && !isNoneMode && $indicator) {
      $indicator.on('click.msBgvc', function (e) {
  e.preventDefault();
  e.stopPropagation();

  if (player.isPlaying()) {
    player.pause();
    sync();
    show();
    return;
  }

  activateThisVideo();
});
      }
$playBtn.on('click.msBgvc', function(e){
  e.preventDefault();
  e.stopPropagation();

  if (player.isPlaying()) {
    player.pause();
    sync();
    show();
    return;
  }

  activateThisVideo();
});

      // -------------------------
      // Mute button
      // -------------------------
$mute.on('click.msBgvc', function (e) {
  e.preventDefault();
  e.stopPropagation();

  state.userInteracted = true;
  $host.find('.elementor-background-video-container').removeClass('ms-bgvideo-hidden');

  player.setMuted(!player.isMuted());
  sync();
  show();
});

// -------------------------
// Restart button
// -------------------------
$restart.on('click.msBgvc', function(e){
  e.preventDefault();
  e.stopPropagation();

  state.userInteracted = true;
  $host.find('.elementor-background-video-container')
       .removeClass('ms-bgvideo-hidden');

  if (player.restart) {
    player.restart();
  } else {
    // fallback (YT/Vimeo safety)
    try { player.pause(); } catch(e){}
    try { player.play(); } catch(e){}
  }

  sync();
  show();
});

      // -------------------------
      // Cursor-follow indicator (GSAP) - cursor mode only
      // -------------------------
     if (!isCenterMode && !isNoneMode && followCursor && hasFinePointer && gsap) {


        gsap.set($indicator[0], { xPercent: -50, yPercent: -50 });

        var setX = gsap.quickSetter($indicator[0], 'x', 'px');
        var setY = gsap.quickSetter($indicator[0], 'y', 'px');

        var targetX = 0, targetY = 0;
        var currentX = 0, currentY = 0;
        var ease = 0.25;

        onMouseMove = function (e) {
          if (!isInsideHost) return;

          // If UI was hidden by idle, show it again on mouse move
          if (!$controls.hasClass('is-visible')) show();

          targetX = e.clientX;
          targetY = e.clientY;

          if (!isOverInteractive) {
            hardShowIndicator();
          } else {
            hardHideIndicator();
          }

          resetIdle();
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });

        tickFn = function () {
          if (!isInsideHost) return;
          currentX += (targetX - currentX) * ease;
          currentY += (targetY - currentY) * ease;
          setX(currentX);
          setY(currentY);
        };

        gsap.ticker.add(tickFn);
      }

      // -------------------------
      // Hover gate
      // -------------------------
      if (hasHover) {
        $host.on('mouseenter.msBgvc', function () {
          isInsideHost = true;
          sync();

          // Center mode + autoplay OFF: show Play immediately (even before hover)
          if (isCenterMode && !wantsAutoplay) {
            $controls.addClass('is-visible');
           if (hasIndicator) {
  $indicator.addClass('is-visible');
}
          } else {
            show();
          }
        });

        $host.on('mouseleave.msBgvc', function () {
          hide();
          isInsideHost = false;
          isOverInteractive = false;
        });
	  } else {
		   // Mobile: keep visible (cursor mode doesn't follow on mobile)
  $controls.addClass('is-visible');
  if (hasIndicator) $indicator.addClass('is-visible');
  sync();
}

      // -------------------------
      // Periodic sync (helps iframe players)
      // -------------------------
      var syncTimer = window.setInterval(sync, 600);

      // Cleanup when Elementor re-renders
      $host.on('remove.msBgvc', function () {
  window.clearInterval(syncTimer);
  window.clearTimeout(idleTimer);

  try { if (pauseTimer) window.clearInterval(pauseTimer); } catch(e){}
  pauseTimer = null;

 try { $overlay.off('.msBgvc'); } catch(e){}
try { $mute.off('.msBgvc'); } catch(e){}
try { $playBtn.off('.msBgvc'); } catch(e){}
try { $restart.off('.msBgvc'); } catch(e){}
try { $fs.off('.msBgvc'); } catch(e){}
if ($range) {
  try { $range.off('.msBgvc'); } catch(e){}
}

  if ($indicator && $indicator.length) {
    try { $indicator.off('.msBgvc'); } catch(e){}
    try { $indicator.remove(); } catch(e){}
  }

  try { $host.off('.msBgvc'); } catch(e){}

  if (onMouseMove) window.removeEventListener('mousemove', onMouseMove);
  if (tickFn && gsap) gsap.ticker.remove(tickFn);
		
		// Cleanup observer + fallback timers
try {
  var obs = $host.data('msBgvcObserver');
  if (obs) obs.disconnect();
} catch (e) {}

try {
  var st = $host.data('msBgvcObserverStopTimer');
  if (st) window.clearTimeout(st);
} catch (e) {}

try {
  var ft = $host.data('msBgvcObserverFallbackTimer');
  if (ft) window.clearInterval(ft);
} catch (e) {}

$host.removeData('msBgvcObserver')
     .removeData('msBgvcObserverStopTimer')
     .removeData('msBgvcObserverFallbackTimer')
     .removeData('msBgvcObserverAttached');
$host.find('.elementor-background-video-container').removeClass('ms-bgvideo-hidden');
$(document).off('msBgvc:activate.msBgvc' + hostId);

      });

      // Initial sync
      sync();
     
 // Respect Autoplay toggle: if OFF, enforce pause with retries (Elementor may start it later on mobile/breakpoints)
// Respect Autoplay toggle: if OFF, enforce pause until user interacts.
// (Important for YouTube/Vimeo iframes where "isPlaying" is not reliable.)
var pauseTimer = null;

if (!wantsAutoplay && $host.attr('data-ms-bgvc-type') === 'mp4') {
  var triesPause = 0;

  // tiny delay helps when Elementor starts player slightly later
  setTimeout(function () {
    pauseTimer = window.setInterval(function () {
      // stop if user clicked anything
      if (state.userInteracted)  {
        window.clearInterval(pauseTimer);
        pauseTimer = null;
        return;
      }

      triesPause++;

      try { player.pause(); } catch (e) {}

      // run longer for slow connections / iframe players
      if (triesPause >= 80) { // 80 * 250ms = 20s
        window.clearInterval(pauseTimer);
        pauseTimer = null;
        sync();
      }
    }, 250);
  }, 300);
}

      // Center mode + autoplay OFF: show Play immediately even before hover
    if (isCenterMode && !wantsAutoplay) {
  $controls.addClass('is-visible');
  if (hasIndicator) $indicator.addClass('is-visible');
} else if (!hasHover) {
  show();
}
    },
observePlayer: function ($host, ext) {
  // Don't attach multiple observers
  if ($host.data('msBgvcObserverAttached')) return;
  $host.data('msBgvcObserverAttached', true);

  // Try to observe the exact container Elementor uses (more efficient),
  // but fall back to observing the host subtree.
  var target =
    $host.find('.elementor-background-video-container').get(0) || $host.get(0);

  // Safety: if MutationObserver not available, fall back to a light interval
  if (!window.MutationObserver) {
    var fallbackTries = 0;
    var fallbackTimer = window.setInterval(function () {
      fallbackTries++;
      if (MS_BGVC.hasPlayerDom($host) || fallbackTries > 80) { // ~20s
        window.clearInterval(fallbackTimer);
        $host.removeData('msBgvcObserverAttached');
        MS_BGVC.init($host);
      }
    }, 250);
    $host.data('msBgvcObserverFallbackTimer', fallbackTimer);
    return;
  }

  var obs = new MutationObserver(function () {
    // As soon as player exists, stop observing and init
    if (MS_BGVC.hasPlayerDom($host)) {
      try { obs.disconnect(); } catch (e) {}
      $host.removeData('msBgvcObserver');
      $host.removeData('msBgvcObserverAttached');

      // Re-run init now that player exists
      MS_BGVC.init($host);
    }
  });

  // Start observing
  try {
    obs.observe(target, { childList: true, subtree: true, attributes: true });
  } catch (e) {
    // If something goes weird, just allow init retries via fallback
    $host.removeData('msBgvcObserverAttached');
    return;
  }

  $host.data('msBgvcObserver', obs);

  // Hard safety stop: if Elementor never injects player, don't leak observers forever
  var stopTimer = window.setTimeout(function () {
    try { obs.disconnect(); } catch (e) {}
    $host.removeData('msBgvcObserver');
    $host.removeData('msBgvcObserverAttached');
  }, 30000);

  $host.data('msBgvcObserverStopTimer', stopTimer);

  // Bonus: in case player is already injected right after we attach observer
  // (race within same tick), schedule a micro-check.
  window.setTimeout(function () {
    if (MS_BGVC.hasPlayerDom($host)) {
      try { obs.disconnect(); } catch (e) {}
      $host.removeData('msBgvcObserver');
      $host.removeData('msBgvcObserverAttached');
      window.clearTimeout(stopTimer);
      $host.removeData('msBgvcObserverStopTimer');
      MS_BGVC.init($host);
    }
  }, 0);
},

    // Pure existence probe — NO side effects. detectPlayer() used to double as
    // this boolean check, but every call constructed a fresh stateful player
    // (extra one-shot load handlers, pause-retry chains, iframe src rewrites) —
    // throwaway instances raced the one init() kept, which is exactly the
    // intermittent "commands do nothing" YouTube behaviour.
    hasPlayerDom: function ($host) {
      return !!$host.find('.elementor-background-video-container video, .elementor-background-video-container iframe').get(0);
    },

    getSettings: function ($scope) {
      try {
        var ds = $scope.attr('data-settings');
        if (ds) return JSON.parse(ds);
      } catch (e) {}
      return null;
    },

detectPlayer: function ($host, ext, state) {

  var wantsAutoplay = ext && String(ext.mauve_ext_bgvideo_autoplay) === 'true';

  // MP4
  var videoEl = $host.find('.elementor-background-video-container video').get(0);
  if (videoEl) {
    $host.attr('data-ms-bgvc-type', 'mp4');
    return MS_BGVC.html5Player(videoEl, $host, ext);
  }

  // IFRAME (YT / Vimeo)
  var $container = $host.find('.elementor-background-video-container');
  var iframe = $container.find('iframe').get(0);
  if (!iframe) return null;

  if (!wantsAutoplay && $container.length) {
    $container.addClass('ms-bgvideo-hidden');
  }

  var src = iframe.getAttribute('src') || '';
  if (/youtube\.com|youtu\.be|youtube-nocookie\.com/.test(src)) {
    $host.attr('data-ms-bgvc-type', 'youtube');
   return MS_BGVC.youtubePlayer(iframe, ext, state);

  }
  if (/vimeo\.com/.test(src)) {
  $host.attr('data-ms-bgvc-type', 'vimeo');
  return MS_BGVC.vimeoPlayer(iframe, ext);
}

  return null;
},

html5Player: function (video, $host, ext) {
  try { video.playsInline = true; } catch (e) {}

  var wantsAutoplay = ext && String(ext.mauve_ext_bgvideo_autoplay) === 'true';
  var $container = jQuery(video).closest('.elementor-background-video-container');

  if ($container.length && !wantsAutoplay) {
    $container.addClass('ms-bgvideo-hidden');
  }

  return {
    play: function () {
      if ($container && $container.length) $container.removeClass('ms-bgvideo-hidden');
      var p = video.play();
      if (p && p.catch) p.catch(function(){});
    },
    pause: function () {
      video.pause();
    },
    restart: function () {
  if ($container && $container.length) $container.removeClass('ms-bgvideo-hidden');
  try { video.currentTime = 0; } catch (e) {}
  var p = video.play();
  if (p && p.catch) p.catch(function(){});
},
    resetToInitialState: function () {
      try { video.pause(); } catch (e) {}
      try { video.currentTime = 0; } catch (e) {}
      try { video.muted = true; } catch (e) {}

      if ($container && $container.length) {
        if (!wantsAutoplay) $container.addClass('ms-bgvideo-hidden');
        else $container.removeClass('ms-bgvideo-hidden');
      }
    },
    getProgress: function () {
      var d = video.duration || 0;
      if (!d) return 0;
      return Math.min(1, Math.max(0, (video.currentTime || 0) / d));
    },
    seekToRatio: function (ratio) {
      var d = video.duration || 0;
      if (!d) return;
      var t = d * Math.min(1, Math.max(0, ratio));
      try { video.currentTime = t; } catch (e) {}
    },
    isPlaying: function () {
      return !video.paused && !video.ended;
    },
    isMuted: function () {
      return !!video.muted;
    },
    setMuted: function (muted) {
      video.muted = !!muted;
      if (!video.muted && video.volume === 0) video.volume = 1;
    }
  };
},

   youtubePlayer: function (iframe, ext, stateRef) {

  /**
   * Lightweight control via postMessage (no YT.Player wrapper).
   */
  var wantsAutoplay = ext && ext.mauve_ext_bgvideo_autoplay === 'true';
  var state = { playing: !!wantsAutoplay, muted: true };
    var isLoaded = false;
  var queue = [];

  function _flushQueue() {
    if (isLoaded) return;
    isLoaded = true;
    while (queue.length) {
      var item = queue.shift();
      _sendNow(item[0], item[1]);
    }
  }

  // mark iframe loaded
  $(iframe).one('load.msBgvc', _flushQueue);

  // DEADLOCK GUARD: if the iframe's load event fired BEFORE the handler above
  // was attached (this player can be constructed after the reload finished —
  // pure network-timing luck), isLoaded stayed false forever and every queued
  // play/pause/mute silently no-op'd: the "buttons do nothing on some loads"
  // bug. Flush anyway after a grace period; commands to a still-loading iframe
  // are harmless (postMessage is fire-and-forget).
  window.setTimeout(_flushQueue, 1500);

function ensureYouTubeJsApi() {
  try {
    var src = iframe.getAttribute('src') || '';
    if (!src) return;

    // Only once per iframe element
    if (iframe.getAttribute('data-ms-yt-fixed') === '1') return;

    var u = new URL(src, window.location.href);

    // Always enforce required params for JS API + Safari stability
    u.searchParams.set('enablejsapi', '1');
    u.searchParams.set('origin', window.location.origin);
    u.searchParams.set('playsinline', '1');

    // Always keep muted for background use (Safari + autoplay policies)
    u.searchParams.set('mute', '1');

    // Respect your switch deterministically
    var allowAutoplay = (ext && String(ext.mauve_ext_bgvideo_autoplay) === 'true');
    u.searchParams.set('autoplay', allowAutoplay ? '1' : '0');

    // Background-friendly defaults (safe)
    u.searchParams.set('rel', '0');
    u.searchParams.set('controls', '0');
    u.searchParams.set('modestbranding', '1');
    u.searchParams.set('fs', '0');

    var newSrc = u.toString();

    // Update only if necessary (prevents unnecessary reload)
    if (newSrc !== src) {
      iframe.setAttribute('data-ms-yt-src-updated', '1');
      iframe.setAttribute('src', newSrc);
    }

    // Mark fixed at the very end (after successful src normalization)
    iframe.setAttribute('data-ms-yt-fixed', '1');
  } catch (e) {}
}


ensureYouTubeJsApi();
pauseWithRetries();

  function _sendNow(func, args) {
    try {
      var targetOrigin = '*';
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: func, args: args || [] }),
        targetOrigin
      );
    } catch (e) {}
  }

  function send(func, args) {
    // this can update src and trigger a reload
 

    // if iframe not loaded yet -> queue
    if (!isLoaded || !iframe.contentWindow) {
      queue.push([func, args]);
      return;
    }

    _sendNow(func, args);
  }
function pauseWithRetries() {
  // only needed when autoplay is OFF
  if (wantsAutoplay) return;

  var attempts = 0;
  var maxAttempts = 6; // zamiast 80
  var t = null;

  function tryPause() {
  if (stateRef && stateRef.userInteracted) { // user clicked play/mute etc.
      if (t) window.clearTimeout(t);
      return;
    }

    attempts++;
    send('pauseVideo');
    state.playing = false;

    if (attempts < maxAttempts) {
      t = window.setTimeout(tryPause, 350); // mały odstęp, nie spam
    }
  }

  // start after iframe is actually loaded
  if (isLoaded) tryPause();
  else $(iframe).one('load.msBgvcPause', function(){ tryPause(); });
}

return {
  play: function () {
    send('playVideo');
    state.playing = true;
  },
  pause: function () {
    send('pauseVideo');
    state.playing = false;
  },
  isPlaying: function () {
    return !!state.playing;
  },
  isMuted: function () {
    return !!state.muted;
  },
  setMuted: function (muted) {
    state.muted = !!muted;
    send(state.muted ? 'mute' : 'unMute');
  },
  restart: function () {
    send('seekTo', [0, true]);
    send('playVideo');
    state.playing = true;
  },
  resetToInitialState: function () {
    send('pauseVideo');
    send('seekTo', [0, true]);
    send('mute');
    state.playing = false;
    state.muted = true;
  }
};
},

vimeoPlayer: function (iframe, ext) {
  var ready = MS_BGVC.loadScriptOnce('msVimeoApi', 'https://player.vimeo.com/api/player.js');
  var player = null;
  var wantsAutoplay = ext && String(ext.mauve_ext_bgvideo_autoplay) === 'true';
  var state = { playing: !!wantsAutoplay, muted: true };

  function ensurePlayer(cb) {
    ready.then(function () {
      if (!player && window.Vimeo && window.Vimeo.Player) {
        player = new window.Vimeo.Player(iframe);
      }
      // Null-guard: if the Vimeo API never loaded (adblock/GDPR blocker),
      // callbacks below would throw "player is null" on every click.
      if (player) { cb && cb(); }
    });
  }

  return {
    play: function () {
      state.playing = true;
      if (player) player.play();
      else ensurePlayer(function(){ player.play(); });
    },
    pause: function () {
      state.playing = false;
      if (player) player.pause();
      else ensurePlayer(function(){ player.pause(); });
    },
    isPlaying: function () {
      return !!state.playing;
    },
    isMuted: function () {
      return !!state.muted;
    },
    setMuted: function (muted) {
      state.muted = !!muted;
      var vol = state.muted ? 0 : 1;
      if (!player) {
        return ensurePlayer(function(){ player.setVolume(vol); });
      }
      player.setVolume(vol);
    },
    restart: function () {
      state.playing = true;
      ensurePlayer(function(){
        try { player.setCurrentTime(0); } catch (e) {}
        try { player.play(); } catch (e) {}
      });
    },
    resetToInitialState: function () {
      state.playing = false;
      state.muted = true;
      ensurePlayer(function(){
        try { player.pause(); } catch (e) {}
        try { player.setCurrentTime(0); } catch (e) {}
        try { player.setVolume(0); } catch (e) {}
      });
    }
  };
},

    loadScriptOnce: function (key, src) {
      // Cache the PROMISE, not a boolean: the old flag was set BEFORE the
      // script finished loading, so a second bg-video host on the same page
      // got an instantly-resolved promise while window.Vimeo was still
      // undefined — its controls were dead. Also settle on error so a blocked
      // CDN (adblock/GDPR) doesn't leave every control hanging forever.
      var store = (MS_BGVC._scriptPromises = MS_BGVC._scriptPromises || {});
      if (store[key]) return store[key];
      store[key] = new Promise(function (resolve) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = function () { window[key] = true; resolve(); };
        s.onerror = function () { resolve(); }; // callers null-check the player
        document.head.appendChild(s);
      });
      return store[key];
    }
  };

  // Elementor hook — containers AND legacy sections (the controls are
  // registered for both element types; only containers ever initialized).
  $(window).on('elementor/frontend/init', function () {
    var bgvcReady = function ($scope) { MS_BGVC.init($scope); };
    elementorFrontend.hooks.addAction('frontend/element_ready/container', bgvcReady);
    elementorFrontend.hooks.addAction('frontend/element_ready/section', bgvcReady);
  });

  /* =======================================================================
     Mauve – Fancy Heading scroll reveal (break bars + draw-rule underline)
     The PHP markup ships with .mauve-fh-reveal and data-mauve-anim-* flags;
     JS opts the element into the animated start state, then adds .mauve-in
     when it scrolls into view. Without JS the heading is simply shown.
     ======================================================================= */
  ELMAUVE.mauveRevealInit = function (context) {
    var root = document;
    if (context) { root = context.jquery ? context[0] : context; }
    if (!root || !root.querySelectorAll) { return; }

    var nodes = root.querySelectorAll('.mauve-fh-reveal');
    // The Elementor scope can itself be (or wrap) the reveal element.
    if (root.classList && root.classList.contains('mauve-fh-reveal')) {
      nodes = [root];
    }
    if (!nodes.length) { return; }

    var inEditor = !!(window.elementorFrontend &&
      elementorFrontend.isEditMode && elementorFrontend.isEditMode());

    Array.prototype.forEach.call(nodes, function (el) {
      if (!el || el.dataset.mauveRevealInit === '1') { return; }
      el.dataset.mauveRevealInit = '1';

      // Enable the per-effect animated start states.
      if (el.dataset.mauveAnimBars === '1') { el.classList.add('mauve-fh-anim-bars'); }
      if (el.dataset.mauveAnimRule === '1') { el.classList.add('mauve-fh-anim-rule'); }

      if (inEditor) {
        el.classList.add('mauve-in'); // show final state immediately
      } else {
        // Scroll-based (robust with smooth-scroll engines that break IO).
        ELMAUVE._revealQueue(el, 'mauve-in');
      }
    });
    if (!inEditor && ELMAUVE._revealCheck) { ELMAUVE._revealCheck(); }
  };

  /* =======================================================================
     Mauve – lightweight video lightbox for <a class="play-youtube"> links
     ======================================================================= */
  ELMAUVE.parseVideoEmbed = function (url) {
    if (!url) { return null; }
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    if (yt) {
      return { type: 'iframe', src: 'https://www.youtube.com/embed/' + yt[1] + '?autoplay=1&rel=0&modestbranding=1' };
    }
    // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID, channel / showcase / manage links - and
    // unlisted videos, whose share link carries a privacy code (vimeo.com/ID/CODE or ?h=CODE).
    // Without that code as `h` the player refuses them ("Sorry, we're having a little trouble").
    var vimeo = url.match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/|showcase\/\d+\/video\/|manage\/videos\/)?(\d+)(?:\/([\da-f]{6,}))?/i);
    if (vimeo) {
      var vimeoHash = vimeo[2] || (url.match(/[?&]h=([\da-f]+)/i) || [])[1] || '';
      return { type: 'iframe', src: 'https://player.vimeo.com/video/' + vimeo[1] + '?' + (vimeoHash ? 'h=' + vimeoHash + '&' : '') + 'autoplay=1' };
    }
    if (/\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url)) {
      return { type: 'video', src: url };
    }
    // Fallback: load the given URL itself inside an iframe.
    return { type: 'iframe', src: url };
  };

  ELMAUVE.closeVideoModal = function () {
    var modal = document.querySelector('.mauve-video-modal');
    if (!modal) { return; }
    modal.classList.remove('mauve-open');
    document.body.classList.remove('mauve-modal-open');
    // Clear media after the fade so playback actually stops.
    setTimeout(function () {
      if (!modal.classList.contains('mauve-open')) {
        var body = modal.querySelector('.mauve-video-modal__body');
        if (body) { body.innerHTML = ''; }
      }
    }, 350);
  };

  ELMAUVE.openVideoModal = function (url, trigger) {
    var media = ELMAUVE.parseVideoEmbed(url);
    if (!media) { return; }

    var modal = document.querySelector('.mauve-video-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'mauve-video-modal';
      modal.innerHTML =
        '<div class="mauve-video-modal__frame">' +
          '<button type="button" class="mauve-video-modal__close" aria-label="Close"></button>' +
          '<div class="mauve-video-modal__body"></div>' +
        '</div>';
      document.body.appendChild(modal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal ||
            (e.target.classList && e.target.classList.contains('mauve-video-modal__close'))) {
          ELMAUVE.closeVideoModal();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) { ELMAUVE.closeVideoModal(); }
      });
    }

    var body = modal.querySelector('.mauve-video-modal__body');
    body.innerHTML = '';

    var player;
    if (media.type === 'video') {
      player = document.createElement('video');
      player.src = media.src;            // property assignment — no HTML injection
      player.controls = true;
      player.autoplay = true;
      player.setAttribute('playsinline', '');
    } else {
      player = document.createElement('iframe');
      player.src = media.src;
      player.setAttribute('frameborder', '0');
      player.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
      player.setAttribute('allowfullscreen', '');
    }
    body.appendChild(player);

    // Force reflow so the open transition runs.
    /* eslint-disable no-unused-expressions */
    modal.offsetHeight;
    /* eslint-enable no-unused-expressions */
    // Per-instance colours from the clicked play link (data-attrs -> CSS vars).
    var msVmMap = {
      'data-modal-bg':             '--mauve-vm-bg',
      'data-modal-close':          '--mauve-vm-close',
      'data-modal-close-hover':    '--mauve-vm-close-hover',
      'data-modal-close-bg':       '--mauve-vm-close-bg',
      'data-modal-close-bg-hover': '--mauve-vm-close-bg-hover'
    };
    // Widgets set the variables on the play link through Elementor selectors (which is
    // the only path that resolves Global Colors); older markup carries literal data-attrs.
    var msVmCs = (trigger && window.getComputedStyle) ? window.getComputedStyle(trigger) : null;
    Object.keys(msVmMap).forEach(function (attr) {
      var prop = msVmMap[attr];
      var val = msVmCs ? (msVmCs.getPropertyValue(prop) || '').trim() : '';
      if (!val && trigger && trigger.getAttribute) { val = trigger.getAttribute(attr) || ''; }
      if (val) { modal.style.setProperty(prop, val); } else { modal.style.removeProperty(prop); }
    });

    modal.classList.add('mauve-open');
    document.body.classList.add('mauve-modal-open');
  };

  ELMAUVE.playYoutubeInit = function () {
    if (ELMAUVE._playYoutubeBound) { return; }
    ELMAUVE._playYoutubeBound = true;
    // Delegated, so it also covers buttons added later (editor / AJAX).
    $(document).on('click.mauvePlay', '.play-youtube', function (e) {
      var href = this.getAttribute('href') ||
                 this.getAttribute('data-video') ||
                 this.getAttribute('data-url');
      if (!href || href === '#') { return; }
      e.preventDefault();
      ELMAUVE.openVideoModal(href, this);
    });
  };

  /* =======================================================================
     Mauve – generic scroll reveal. Any element with class .mauve-reveal gets
     .mauve-inview once it enters the viewport (used by Plate Card, Annotation
     and other widgets). In the editor it reveals immediately.

     Scroll-based on purpose: IntersectionObserver is broken by transform-based
     smooth-scroll engines (GSAP ScrollSmoother) which would leave elements
     stuck at opacity:0. A plain getBoundingClientRect check works everywhere.
     ======================================================================= */
  ELMAUVE._revealPending = ELMAUVE._revealPending || []; // items: { el, cls }
  ELMAUVE._revealCheck = function () {
    var list = ELMAUVE._revealPending;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = list.length - 1; i >= 0; i--) {
      var it = list[i];
      if (!it || !it.el || !it.el.getBoundingClientRect) { list.splice(i, 1); continue; }
      var r = it.el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        it.el.classList.add(it.cls);
        if (it.cb) { it.cb(it.el); }
        list.splice(i, 1);
      }
    }
    return list.length > 0;
  };
  // A requestAnimationFrame ticker drives the reveal, independent of scroll
  // events — so it works with Lenis / any smooth-scroll engine that may not
  // emit a window 'scroll'. It self-stops once everything is revealed.
  ELMAUVE._revealFrame = 0;
  ELMAUVE._revealTick = function () {
    ELMAUVE._revealFrame++;
    var more = (ELMAUVE._revealFrame % 4 === 0)
      ? ELMAUVE._revealCheck()
      : (ELMAUVE._revealPending.length > 0);
    if (more) { window.requestAnimationFrame(ELMAUVE._revealTick); }
    else { ELMAUVE._revealTicking = false; }
  };
  ELMAUVE._revealQueue = function (el, cls, cb) {
    ELMAUVE._revealPending.push({ el: el, cls: cls, cb: cb });
    if (!ELMAUVE._revealTicking) {
      ELMAUVE._revealTicking = true;
      window.requestAnimationFrame(ELMAUVE._revealTick);
    }
  };
  ELMAUVE.revealObserve = function (context) {
    var root = document;
    if (context) { root = context.jquery ? context[0] : context; }
    if (!root || !root.querySelectorAll) { return; }

    var nodes = root.querySelectorAll('.mauve-reveal');
    if (root.classList && root.classList.contains('mauve-reveal')) { nodes = [root]; }
    if (!nodes.length) { return; }

    var inEditor = !!(window.elementorFrontend &&
      elementorFrontend.isEditMode && elementorFrontend.isEditMode());

    Array.prototype.forEach.call(nodes, function (el) {
      if (!el || el.dataset.mauveRevealDone === '1') { return; }
      el.dataset.mauveRevealDone = '1';
      if (inEditor) { el.classList.add('mauve-inview'); return; }
      ELMAUVE._revealQueue(el, 'mauve-inview');
    });
    ELMAUVE._revealCheck();
  };

  /* Fancy Heading: split only text nodes into clipped words, then give all
     words on the same visual line one delay. This keeps links and accent spans
     intact and recalculates the lines when responsive wrapping changes. */
  ELMAUVE.fancyHeadingClipInit = function (context) {
    var root = document;
    if (context) { root = context.jquery ? context[0] : context; }
    if (!root || !root.querySelectorAll) { return; }

    var nodes = root.querySelectorAll('.mauve-fh-clip');
    if (root.classList && root.classList.contains('mauve-fh-clip')) { nodes = [root]; }

    Array.prototype.forEach.call(nodes, function (wrap) {
      if (!wrap || wrap.dataset.mauveClipInit === '1') { return; }
      var title = wrap.querySelector('.mauve-heading-title');
      if (!title) { return; }

      // If boot was delayed beyond the safety reveal, keep readable text visible
      // instead of hiding it again to replay an entrance the visitor has missed.
      var initialStyle = window.getComputedStyle(title);
      if (initialStyle.animationName === 'mauve-fh-clip-fallback' && initialStyle.visibility === 'visible') {
        wrap.dataset.mauveClipInit = '1';
        wrap.classList.add('mauve-fh-clip-ready', 'mauve-inview');
        return;
      }

      var walker = document.createTreeWalker(title, window.NodeFilter.SHOW_TEXT);
      var textNodes = [];
      var current;
      while ((current = walker.nextNode())) {
        if (current.nodeValue && /\S/.test(current.nodeValue)) { textNodes.push(current); }
      }

      textNodes.forEach(function (textNode) {
        var parts = textNode.nodeValue.split(/(\s+)/);
        var fragment = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) { return; }
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
            return;
          }
          var clip = document.createElement('span');
          var inner = document.createElement('span');
          clip.className = 'mauve-fh-clip-word';
          inner.className = 'mauve-fh-clip-word-inner';
          inner.textContent = part;
          clip.appendChild(inner);
          fragment.appendChild(clip);
        });
        textNode.parentNode.replaceChild(fragment, textNode);
      });

      var measureLines = function () {
        var words = title.querySelectorAll('.mauve-fh-clip-word');
        var lineTops = [];
        var styles = window.getComputedStyle(wrap);
        var baseDelay = parseFloat(styles.getPropertyValue('--mauve-fh-clip-delay')) || 0;
        var stagger = parseFloat(styles.getPropertyValue('--mauve-fh-clip-stagger')) || 0;
        Array.prototype.forEach.call(words, function (word) {
          var top = word.getBoundingClientRect().top;
          var line = -1;
          for (var i = 0; i < lineTops.length; i++) {
            if (Math.abs(lineTops[i] - top) < 3) { line = i; break; }
          }
          if (line === -1) { line = lineTops.push(top) - 1; }
          word.style.setProperty('--mauve-fh-line', line);
          word.style.setProperty('--mauve-fh-word-delay', (baseDelay + (line * stagger)) + 'ms');
        });
      };

      wrap.dataset.mauveClipInit = '1';
      wrap.classList.add('mauve-fh-clip-ready');
      // Measure the actual inline-block layout, not unsplit inline text boxes.
      measureLines();
      void title.offsetWidth;

      if ('ResizeObserver' in window) {
        var resizeObserver = new ResizeObserver(measureLines);
        resizeObserver.observe(title);
        wrap._mauveClipResizeObserver = resizeObserver;
      } else {
        window.addEventListener('resize', measureLines);
      }
    });
  };

  /* Fancy Heading: Color Text on Scroll. The chosen parts are split into letters
     (or words) - text nodes only, so links, accent spans and the clip-reveal words
     stay as they are - and they take the final colour one after another while the
     part travels from the Start line of the screen to the End line. Scrubbed with the
     scroll, so scrolling back takes the colour away again. The colours themselves are
     CSS (--mfh-sc-from / --mfh-sc-to); the script only moves the "lit" boundary. */
  ELMAUVE.fancyHeadingScrollColor = function (context) {
    var root = document;
    if (context) { root = context.jquery ? context[0] : context; }
    if (!root || !root.querySelectorAll) { return; }
    // Fancy Heading (parts: subtitle/title/description) and Advanced Title ("self").
    var selector = '.mauve-fancy-heading[data-mfh-scroll-color], .ms-advanced-title[data-mfh-scroll-color]';
    var wraps = root.querySelectorAll(selector);
    if (root.matches && root.matches(selector)) { wraps = [root]; }
    var parts = { title: '.mauve-heading-title', subtitle: '.mauve-heading-subtitle', description: '.mauve-heading-content' };

    function split(el, byWord) {
      var units = [];
      var walker = document.createTreeWalker(el, window.NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var parent = node.parentNode;
          if (!/\S/.test(node.nodeValue) || (parent && /^(SCRIPT|STYLE|svg|SVG)$/.test(parent.nodeName))) { return window.NodeFilter.FILTER_REJECT; }
          return window.NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [], node;
      while ((node = walker.nextNode())) { nodes.push(node); }
      nodes.forEach(function (textNode) {
        var fragment = document.createDocumentFragment();
        textNode.nodeValue.split(/(\s+)/).forEach(function (piece) {
          if (!piece) { return; }
          if (/^\s+$/.test(piece)) { fragment.appendChild(document.createTextNode(piece)); return; }
          if (byWord) {
            var word = document.createElement('span');
            word.className = 'mfh-sc';
            word.textContent = piece;
            units.push(word);
            fragment.appendChild(word);
            return;
          }
          // Letters of one word stay in one inline box, so lines still break between words only.
          var holder = document.createElement('span');
          holder.className = 'mfh-sc-word';
          Array.from(piece).forEach(function (character) {
            var letter = document.createElement('span');
            letter.className = 'mfh-sc';
            letter.textContent = character;
            units.push(letter);
            holder.appendChild(letter);
          });
          fragment.appendChild(holder);
        });
        textNode.parentNode.replaceChild(fragment, textNode);
      });
      return units;
    }

    Array.prototype.forEach.call(wraps, function (wrap) {
      if (typeof wrap._mfhScrollColorDestroy === 'function') { wrap._mfhScrollColorDestroy(); }
      var byWord = wrap.getAttribute('data-mfh-scroll-color-unit') === 'words';
      var startAt = parseFloat(wrap.getAttribute('data-mfh-scroll-color-start'));
      var endAt = parseFloat(wrap.getAttribute('data-mfh-scroll-color-end'));
      startAt = (isFinite(startAt) ? startAt : 70) / 100;
      endAt = (isFinite(endAt) ? endAt : 25) / 100;
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      var groups = [];
      (wrap.getAttribute('data-mfh-scroll-color') || 'title').split(',').forEach(function (name) {
        name = name.trim();
        var el = name === 'self' ? wrap : (parts[name] ? wrap.querySelector(parts[name]) : null);
        if (!el) { return; }
        var units;
        if (el.getAttribute('data-mfh-sc-split') === '1') {
          units = Array.prototype.slice.call(el.querySelectorAll('.mfh-sc'));
          units.forEach(function (unit) { unit.classList.remove('is-lit'); });
        } else {
          el.setAttribute('data-mfh-sc-split', '1');
          units = split(el, byWord);
        }
        if (units.length) { groups.push({ el: el, units: units, lit: 0 }); }
      });
      if (!groups.length) { return; }
      wrap.classList.add('mfh-sc-ready');

      var frame = 0, visible = false;
      function update() {
        frame = 0;
        var height = window.innerHeight || document.documentElement.clientHeight;
        var from = height * startAt, to = height * endAt;
        groups.forEach(function (group) {
          var progress;
          // Inside a section pinned by Sticky Scroll Expand the text does not move while it
          // is pinned - colour it along the pinned stretch instead of by screen position.
          if (group.host === undefined) { group.host = group.el.closest('[data-mauve-sticky-expand]'); }
          var pinned = group.host && typeof group.host.mauveStickyExpandProgress === 'function' ? group.host.mauveStickyExpandProgress() : null;
          if (reduced.matches) { progress = 1; }
          else if (pinned !== null) { progress = pinned; }
          else if (Math.abs(from - to) < 1) { progress = group.el.getBoundingClientRect().top <= to ? 1 : 0; }
          else { progress = (from - group.el.getBoundingClientRect().top) / (from - to); }
          var count = Math.round(Math.max(0, Math.min(1, progress)) * group.units.length);
          if (count === group.lit) { return; }
          var low = Math.min(count, group.lit), high = Math.max(count, group.lit), on = count > group.lit;
          for (var i = low; i < high; i++) { group.units[i].classList.toggle('is-lit', on); }
          group.lit = count;
        });
      }
      function schedule() { if (visible && !frame) { frame = window.requestAnimationFrame(update); } }

      var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function () {
        var margin = window.innerHeight * 0.1;
        visible = groups.some(function (group) {
          var rect = group.el.getBoundingClientRect();
          return rect.bottom > -margin && rect.top < window.innerHeight + margin;
        });
        // Leaving the screen: settle on the final state for where it went.
        if (!visible) { update(); } else { schedule(); }
      }, { rootMargin: '10% 0px 10% 0px' }) : null;
      if (observer) { groups.forEach(function (group) { observer.observe(group.el); }); } else { visible = true; }

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      update();

      wrap._mfhScrollColorDestroy = function () {
        if (frame) { window.cancelAnimationFrame(frame); }
        if (observer) { observer.disconnect(); }
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        wrap._mfhScrollColorDestroy = null;
      };
    });
  };

  /* =======================================================================
     Mauve – Hero. The markup ships hidden (.mauve-hero-armed, added in PHP) so
     there is NO flash on first paint. A rAF ticker toggles .mauve-hero-in based
     on whether the hero sits in the viewport band — the reveal plays when it
     scrolls in and reverses when it scrolls out, repeating (like Info List).
     Honors data-mh-delay on entry. rAF (not IntersectionObserver) survives the
     Lenis transform-scroll. Self-stops if there are no heroes.
     ======================================================================= */
  ELMAUVE._heroes = ELMAUVE._heroes || [];
  ELMAUVE._heroFrame = 0;
  ELMAUVE._heroTick = function () {
    ELMAUVE._heroFrame++;
    if (ELMAUVE._heroFrame % 3 === 0) {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = 0; i < ELMAUVE._heroes.length; i++) {
        var el = ELMAUVE._heroes[i];
        if (!el || !el.getBoundingClientRect || el.__mhDone) { continue; }
        var r = el.getBoundingClientRect();
        var inView = (r.top < vh * 0.85 && r.bottom > vh * 0.15);
        if (inView && !el.__mhIn) {
          el.__mhIn = true;
          if (el.__mhTimer) { clearTimeout(el.__mhTimer); el.__mhTimer = null; }
          if (el.classList.contains('mauve-hero-reset')) {
            el.classList.remove('mauve-hero-reset'); // re-enable transitions
            void el.offsetWidth;                     // reflow so the reveal animates in (not snaps)
          }
          var delay = parseInt(el.getAttribute('data-mh-delay'), 10) || 0;
          if (delay > 0) {
            el.__mhTimer = window.setTimeout((function (node) {
              return function () { node.classList.add('mauve-hero-in'); };
            })(el), delay);
          } else {
            el.classList.add('mauve-hero-in');
          }
          if (el.__mhReplay === false) { el.__mhDone = true; } // one-shot: reveal once, then stop
        } else if (!inView && el.__mhIn) {
          el.__mhIn = false;
          if (el.__mhTimer) { clearTimeout(el.__mhTimer); el.__mhTimer = null; }
          el.classList.add('mauve-hero-reset');   // instant hide (no reverse animation), armed to replay
          el.classList.remove('mauve-hero-in');
        }
      }
    }
    if (ELMAUVE._heroes.length) { window.requestAnimationFrame(ELMAUVE._heroTick); }
    else { ELMAUVE._heroTicking = false; }
  };
  /* Parallax Slider: police the Video Start/End window across LOOPS. The URL params
     only govern the FIRST playthrough — YouTube's playlist-loop restarts from 0,
     media fragments (#t=) don't re-apply when a <video loop> wraps, and Vimeo has no
     end parameter at all. Native videos are corrected on timeupdate; YT/Vimeo via
     their iframes' postMessage protocols (no player libraries loaded). */
  ELMAUVE.slideVideoLoop = function () {
    // Native <video>: snap back into [start, end] whenever playback leaves it.
    document.querySelectorAll('.slider_parallax_wrapper video.ms-slide-video[data-ms-start], .slider_parallax_wrapper video.ms-slide-video[data-ms-end]').forEach(function (v) {
      if (v.msLoopBound) { return; }
      v.msLoopBound = true;
      var s = parseFloat(v.getAttribute('data-ms-start')) || 0;
      var e = parseFloat(v.getAttribute('data-ms-end')) || 0;
      v.addEventListener('timeupdate', function () {
        if ((e && v.currentTime >= e) || v.currentTime < s - 0.75) {
          v.currentTime = s;
          if (v.paused) { v.play(); }
        }
      });
    });

    var frames = Array.prototype.slice.call(
      document.querySelectorAll('.slider_parallax_wrapper iframe.ms-slide-embed[data-ms-embed]')
    ).filter(function (f) {
      return (parseFloat(f.getAttribute('data-ms-start')) || 0) > 0
        || (parseFloat(f.getAttribute('data-ms-end')) || 0) > 0;
    });
    if (!frames.length || window.msSlideEmbedBound) { return; }
    window.msSlideEmbedBound = true;

    var seek = function (f, seconds) {
      var msg = f.getAttribute('data-ms-embed') === 'yt'
        ? JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] })
        : JSON.stringify({ method: 'setCurrentTime', value: seconds });
      try { f.contentWindow.postMessage(msg, '*'); } catch (err) {}
    };

    window.addEventListener('message', function (ev) {
      var d = ev.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
      if (!d) { return; }
      frames.forEach(function (f) {
        if (!f.contentWindow || f.contentWindow !== ev.source) { return; }
        var s = parseFloat(f.getAttribute('data-ms-start')) || 0;
        var e = parseFloat(f.getAttribute('data-ms-end')) || 0;
        var t = null;
        if (d.event === 'infoDelivery' && d.info && typeof d.info.currentTime === 'number') {
          t = d.info.currentTime; // YouTube
        } else if ((d.event === 'timeupdate' || d.event === 'playProgress') && d.data && typeof d.data.seconds === 'number') {
          t = d.data.seconds; // Vimeo
        }
        if (null === t) { return; }
        if ((e && t >= e) || t < s - 0.75) { seek(f, s); }
      });
    });

    // Handshakes: YT streams time only after a 'listening' hello, Vimeo after an event
    // subscription. Repeated a few times — the player boots inside the iframe at its
    // own pace and messages sent too early vanish.
    var hail = function () {
      frames.forEach(function (f) {
        if (!f.contentWindow) { return; }
        try {
          if (f.getAttribute('data-ms-embed') === 'yt') {
            f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'ms-slide', channel: 'widget' }), '*');
          } else {
            f.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }), '*');
            f.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'playProgress' }), '*');
          }
        } catch (err) {}
      });
    };
    var msHailTries = 0;
    var msHailTimer = setInterval(function () {
      hail();
      if (++msHailTries >= 6) { clearInterval(msHailTimer); }
    }, 1500);
    hail();
  };

  ELMAUVE.heroInit = function (context) {
    var root = document;
    if (context) { root = context.jquery ? context[0] : context; }
    if (!root || !root.querySelectorAll) { return; }

    var nodes = root.querySelectorAll('.mauve-hero');
    if (root.classList && root.classList.contains('mauve-hero')) { nodes = [root]; }
    if (!nodes.length) { return; }

    var inEditor = !!(window.elementorFrontend &&
      elementorFrontend.isEditMode && elementorFrontend.isEditMode());

    Array.prototype.forEach.call(nodes, function (el) {
      if (!el || el.dataset.mauveHeroInit === '1') { return; }
      el.dataset.mauveHeroInit = '1';

      if (inEditor) {
        el.classList.add('mauve-hero-armed', 'mauve-hero-in'); // show composed result
        return;
      }
      el.classList.add('mauve-hero-armed'); // hidden start (PHP already adds this)
      el.__mhReplay = el.getAttribute('data-mh-replay') !== '0';
      ELMAUVE._heroes.push(el);
    });

    if (!inEditor && ELMAUVE._heroes.length && !ELMAUVE._heroTicking) {
      ELMAUVE._heroTicking = true;
      window.requestAnimationFrame(ELMAUVE._heroTick);
    }
  };

  /* =======================================================================
     Mauve – Info List scroll progress. Fills the timeline or draws the main
     layout connector and reveals its markers as the list enters the viewport.
     ======================================================================= */
  ELMAUVE.infoListRibbon = function ($scope) {
    var root = $scope && $scope.length ? $scope[0] : ($scope || document);
    if (!root.querySelectorAll) { return; }
    var conts = root.querySelectorAll('.ms-info-list-zigzag.ms-il-animate, .ms-info-list-centerline.ms-il-animate, .ms-info-list-mainline.ms-il-animate');
    if (root.classList && root.classList.contains('ms-il-animate') &&
        (root.classList.contains('ms-info-list-zigzag') || root.classList.contains('ms-info-list-centerline') || root.classList.contains('ms-info-list-mainline'))) {
      conts = [root];
    }
    if (!conts.length) { return; }

    Array.prototype.forEach.call(conts, function (cont) {
      var ul = cont.querySelector('.ms-list-items');
      if (!ul || ul.dataset.mauveIlInit === '1') { return; }
      ul.dataset.mauveIlInit = '1';
      var items = cont.querySelectorAll('.ms-info-list-item');

      function update() {
        var rect = ul.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var center = vh * 0.55;
        var prog = rect.height ? (center - rect.top) / rect.height : 0;
        prog = Math.max(0, Math.min(1, prog));
        ul.style.setProperty('--mauve-il-progress', prog.toFixed(4));
        for (var i = 0; i < items.length; i++) {
          var ir = items[i].getBoundingClientRect();
          items[i].classList.toggle('mauve-il-active', (ir.top + 20) <= center);
        }
      }
      update();
      // rAF loop instead of window 'scroll' events, so the progress line keeps
      // updating under Lenis / any smooth-scroll engine — but GATED by an
      // IntersectionObserver: the old loop ran forever (getBoundingClientRect
      // on the UL + every item, every single frame, even far offscreen, on any
      // page containing an Info List). Now it ticks only near the viewport.
      var running = false;
      function loop() {
        if (!running) { return; }
        update();
        window.requestAnimationFrame(loop);
      }
      function start() { if (!running) { running = true; window.requestAnimationFrame(loop); } }
      function stop() { running = false; }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            entries[i].isIntersecting ? start() : stop();
          }
        }, { rootMargin: '160px 0px' });
        io.observe(cont);
      } else {
        start();
      }
    });
  };

  // Frontend boot.
  $(function () {
	ELMAUVE.fancyHeadingClipInit();
    ELMAUVE.mauveRevealInit();
    ELMAUVE.revealObserve();
    ELMAUVE.heroInit();
    ELMAUVE.infoListRibbon();
    ELMAUVE.playYoutubeInit();
    ELMAUVE.slideVideoLoop();
  });

  // Editor / live-preview boot.
  $(window).on('elementor/frontend/init', function () {
    ELMAUVE.playYoutubeInit();
    elementorFrontend.hooks.addAction('frontend/element_ready/mauve-fancy_heading.default', function ($scope) {
	  ELMAUVE.fancyHeadingClipInit($scope);
	  ELMAUVE.fancyHeadingScrollColor($scope);
      ELMAUVE.mauveRevealInit($scope);
      ELMAUVE.revealObserve($scope);
    });
    elementorFrontend.hooks.addAction('frontend/element_ready/advanced-title.default', function ($scope) {
      ELMAUVE.fancyHeadingScrollColor($scope);
    });
    var revealWidgets = ['mauve-plate-card', 'mauve-annotation', 'mauve-polaroid-stack'];
    revealWidgets.forEach(function (name) {
      elementorFrontend.hooks.addAction('frontend/element_ready/' + name + '.default', function ($scope) {
        ELMAUVE.revealObserve($scope);
      });
    });
    elementorFrontend.hooks.addAction('frontend/element_ready/mauve-info-list.default', function ($scope) {
      ELMAUVE.infoListRibbon($scope);
      ELMAUVE.revealObserve($scope);
    });
    elementorFrontend.hooks.addAction('frontend/element_ready/mauve-hero.default', function ($scope) {
      ELMAUVE.heroInit($scope);
    });
    elementorFrontend.hooks.addAction('frontend/element_ready/mauve-slider-parallax.default', function () {
      ELMAUVE.slideVideoLoop();
    });
  });

})(jQuery, window);

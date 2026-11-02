/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  'use strict';

  // Function to initialize theme based on preference
  const initializeTheme = () => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    showActiveTheme(preferredTheme);
  };

  // Simplified theme setting function
  const setTheme = theme => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    // Correct logic to ensure attribute is removed when theme is 'light' or empty
    if (theme === 'light' || theme === '') {
      // Only remove the attribute if it currently exists to avoid unnecessary DOM operations
      if (currentTheme) {
        document.documentElement.removeAttribute('data-bs-theme');
      }
      // Decide whether to store 'light' theme in localStorage based on your requirements
      localStorage.setItem('theme', theme);
    } else if (currentTheme !== theme) {
      document.documentElement.setAttribute('data-bs-theme', theme);
      localStorage.setItem('theme', theme); // Store the chosen theme
    }
  };

  // Function to get the preferred theme
  // Modify to not default to 'light' explicitly if there's no stored preference
  const getPreferredTheme = () => localStorage.getItem('theme');

  // Function to visually indicate the active theme on UI elements
  const showActiveTheme = theme => {
    document.querySelectorAll('.theme-toggle').forEach(checkbox => {
      checkbox.checked = theme === 'dark';
    });
  };

  // Setup theme toggles and initialize theme on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    document.addEventListener('change', e => {
      if (e.target.matches('.theme-toggle')) {
        // Explicitly handle 'light' theme as an empty string for consistency
        const theme = e.target.checked ? 'dark' : 'light'; // Update to handle 'light' explicitly
        setTheme(theme);
        showActiveTheme(theme);
      }
    });
  });
})();

var isMobile = {
      Android: function () {
         return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
         return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
         return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function () {
         return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
         return navigator.userAgent.match(/IEMobile/i);
      },
      any: function () {
         return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
   };

/**
 * Tooltips
 */
document.addEventListener('DOMContentLoaded', function () {
   initializeTooltipsAndCopyLink();
});

function initializeTooltipsAndCopyLink() {
   const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
   const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

   document.body.addEventListener('click', function (event) {
      const copyLinkBtn = event.target.closest('.copyLinkBtnClass');
      if (!copyLinkBtn) return;

      event.preventDefault(); // Prevents the link from navigating

      let tooltip = bootstrap.Tooltip.getInstance(copyLinkBtn);
      if (!tooltip) {
         tooltip = new bootstrap.Tooltip(copyLinkBtn, {
            trigger: 'hover'
         });
      }

      const originalTitle = copyLinkBtn.getAttribute('data-bs-title');

      // Copy link to clipboard
      const textArea = document.createElement("textarea");
      textArea.value = copyLinkBtn.getAttribute('data-link');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      // Update tooltip content and show
      tooltip._config.title = copyLinkBtn.getAttribute('data-copied-text');
      tooltip.show();

      // Reset tooltip content after delay
      setTimeout(function () {
         tooltip._config.title = originalTitle;
         tooltip.hide();
      }, 3000); // 3 seconds delay
   });
}

/**
 * sidebarEffects.js
 */
var SidebarMenuEffects = (function () {

   function hasParentClass(e, classname) {
      if (e === document) return false;
      if (classie.has(e, classname)) {
         return true;
      }
      return e.parentNode && hasParentClass(e.parentNode, classname);
   }

   function mobilecheck() {
      var check = false;
      (function (a) {
         if (/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
   }

 function init() {

   var container = document.getElementById('st-menu'),
      buttons = Array.prototype.slice.call(document.querySelectorAll('.st-trigger-effects > a.nav-icon4, .ms-socials > a.iconhamburger')), // Added .hamburger selector
      butclose = document.querySelector('.icon-menu a.nav-icon4'),
      sidebutclose = document.querySelector('.side-icons a.nav-icon4'),
      eventtype = mobilecheck() ? 'touchstart' : 'click',
      resetMenu = function () {
         classie.remove(container, 'st-menu-open');
         if (butclose) {
            classie.remove(butclose, 'open');
         }
         // Select all elements with the butclosee class and remove the open class
         var butclosees = document.querySelectorAll('.st-trigger-effects a.nav-icon4');
         butclosees.forEach(function(el) {
            classie.remove(el, 'open');
         });
      },

      bodyClickFn = function (evt) {
         if (!hasParentClass(evt.target, 'st-menu')) {
            resetMenu();
            document.removeEventListener(eventtype, bodyClickFn);
         }
      };

   burclick = function (evt) {
      resetMenu();
   };

   if (sidebutclose) {
      sidebutclose.addEventListener(eventtype, function(evt) {
         burclick(evt);
         evt.preventDefault();
      }, { passive: false });
   }

   buttons.forEach(function (el, i) {
      var effect = 'st-effect-4';

      el.addEventListener(eventtype, function (ev) {
         el.classList.toggle('open');
         ev.stopPropagation();
         ev.preventDefault();
         classie.add(container, effect);
         container.classList.toggle('st-menu-open');

         document.addEventListener(eventtype, bodyClickFn, { passive: false });

      }, { passive: false });
   });
}

   init();

})();

(function ($) {
   'use strict';
   $.fn.pinIt = function () {
      this.each(function () {
         $(this).width() > 120 && $(this).height() > 120 && $(this).hover(function () {
            var b = $(location).attr("href");
            b = encodeURIComponent(b);
            var c = $(this).find("img").attr("src"),
               a = $(this).find("img").attr("alt");
            if ($("> a", this).length > 0) {
               var d = $("> a", this).attr("href");
               d.match(/\.(gif|jpeg|jpg|png)/) && (c = d)
            }
            c = encodeURIComponent(c), $('<a class="ms ms-pinterest pinterest-share-icon" href="//www.pinterest.com/pin/create/bookmarklet/?url=' + b + "&media=" + c + '&description=' + a + '&is_video=false" target="_blank"></a>').appendTo(this).addClass("pin-it-visible")
         }, function () {
            $(this).children(".pinterest-share-icon").remove()
         })
      })
   }


   function audioPlayerInit() {

      $('.audio-wraper').each(function () {

         if ($(this).hasClass('active')) {
            $(this).find('audio').audioPlayer();
         }
         $(this).removeClass("active");

      });

   }
         
function parallaxInit() {
$(".parallax-enabled.parallax-image:not(.parallax-video)").each(function () {
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

      var parallaxVideo = $('.parallax-video'),
         speed = 0.8;

      $(parallaxVideo).each(function () {
	  
	  var individualSpeed = $(this).hasClass('parallax-disabled') ? 1 : 0.8;

         $(this).jarallax({
            speed: individualSpeed,
            videoSrc: $(this).attr('data-video'),
            videoStartTime: $(this).data('start'),
            videoEndTime: $(this).data('end'),
            autoplay: 1,
            videoLoop: 1,
            videoPlayOnlyVisible: true,
            noIos: false
			/*!
			onInit: function () {
        var self = this;
        var video = self.video;
        if (video) {
            // Create controls container
            var $controlsDiv = $('<div class="controls"></div>');

            // Create control buttons
            var $muteBtn = $('<button class="jarallax-video-control"><i class="ms ms-sound-off"></i></button>');
            var $playPauseBtn = $('<button class="jarallax-video-control"><i class="ms ms-pause"></i></button>');  // Assume video is playing

            // Append buttons to the controls container
            $controlsDiv.append($muteBtn, $playPauseBtn);

            // Append controls container to the item
            video.on('ready', function() {
                $(self.$item).append($controlsDiv);
                video.play();  // Ensure video is playing when ready, if not already
            });

            // Mute and unmute handling
            let muted = true;
            $muteBtn.on('click', function () {
                if (muted) {
                    muted = false;
                    video.unmute();
                    $muteBtn.html('<i class="ms ms-sound-on"></i>');
                } else {
                    muted = true;
                    video.mute();
                    $muteBtn.html('<i class="ms ms-sound-off"></i>');
                }
            });

            // Play and Pause toggle handling
            let playing = true;  // Assume the video starts playing
            $playPauseBtn.on('click', function () {
                if (playing) {
                    video.pause();
                    $playPauseBtn.html('<i class="ms ms-play-1"></i>');
                    playing = false;
                } else {
                    video.play();
                    $playPauseBtn.html('<i class="ms ms-pause"></i>');
                    playing = true;
                }
            });
        }
    }
	 */
         });

      });
	  }
   function justifiedgalleryInit() {
      //justified gallery
      $('div[id^="justifiedgall_"]').imagesLoaded(function (instance) {
         $(instance.elements).each(function () {
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
            }).on('jg.complete', function () {
               if (pinit == true) {
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
                  closeMarkup: '<span title="%title%" class="mfp-close">' + closetext + '</span>',
                  image: {
                     markup: '<div class="mfp-wrapper"><div class="mfp-counter"></div><div class="mfp-contain"><div class="mfp-bottom-bar">' +
                        '<div class="mfp-title"></div>' +

                        '</div>' +
                        '<div class="mfp-figure">' +
                        '<div class="mfp-close"></div>' +
                        '<div class="mfp-img"></div>' +
                        '</div></div></div>',
                     verticalFit: true,
                     titleSrc: function (item) {
                        var caption = '',
                           title = item.el.find('img').attr('data-title'),
                           excerpt = item.el.find('img').attr('data-excerpt'),
                           content = item.el.find('img').attr('data-content');

                        if (title) {
                           caption += '<h6>' + title + '</h6>';
                        }
                        if (excerpt) {
                           caption += '<p>' + excerpt + '</p>';
                        }
                        if (content) {
                           caption += '<small>' + content + '</small>';
                        }

                        return caption;
                     }
                  },
                  gallery: {
                     enabled: true,
                     tCounter: '%curr%/%total%',
                     arrowMarkup: '<i class="mfp-arrow mfp-arrow-%dir%"></i>',

                  },

                  callbacks: {
                     open: function () {
                        //overwrite default prev + next function. Add timeout for css3 crossfade animation
                        $.magnificPopup.instance.next = function () {
                           var self = this;
                           self.wrap.removeClass('mfp-image-loaded');
                           setTimeout(function () {
                              $.magnificPopup.proto.next.call(self);
                           }, 120);
                        }
                        $.magnificPopup.instance.prev = function () {
                           var self = this;
                           self.wrap.removeClass('mfp-image-loaded');
                           setTimeout(function () {
                              $.magnificPopup.proto.prev.call(self);
                           }, 120);
                        }
                     },
                     imageLoadComplete: function () {
                        var self = this;
                        setTimeout(function () {
                           self.wrap.addClass('mfp-image-loaded');
                        }, 16);
                     }
                  }
               });
               $('.' + selector).on('click', function () {
                  $('#' + selector).magnificPopup('open');
               });
            });
         });
      });
   }
   //  Set the Cookie
   function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
   }

   // Get the Cookie
   function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) == ' ') {
            c = c.substring(1);
         }
         if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
         }
      }
      return "";
   }

   // Check if Cookie exists
   function checkCookie() {

      // Get the cookie called "visited"
      var visited = getCookie("visited");

      // If it exists, print the Cookie to the Console
      if (visited == "true") {
         //console.log(document.cookie);
      } else {
         $.magnificPopup.open({
            items: {
               src: '#ms_signup'
            },
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
         setCookie("visited", "true", 1);
      }
   }

   function masonryStart() {
      $('.grid').each(function () {
         var $container = $(this);
         $container.imagesLoaded(function () {
            $container.masonry({
               columnWidth: $container.find('.grid-item:not(.special-post)')[0],
               itemSelector: '.grid-item',
               percentPosition: true,
               horizontalOrder: true,
               isAnimated: false,
               transitionDuration: 0
            });

            var update = function () {
               $container.masonry('layout');
            };
            document.addEventListener('load', update, true);
         });
      });
   }


function initializeSwipers() {
    var swipers = document.querySelectorAll('.swiper-container');
    if (swipers.length > 0) {
        swipers.forEach(function (swiperContainer) {
		
            var autoplayConfig = swiperContainer.dataset.autoPlay === 'true' ? {
                delay: parseInt(swiperContainer.dataset.autoPlayTimeout) || 5000, // Provide a default delay
                pauseOnMouseEnter: true,
            } : false;
			
			var navigationConfig = swiperContainer.dataset.nav === 'true' ? {
                nextEl: '.ms-swiper-button-next',
                prevEl: '.ms-swiper-button-prev'
            } : false;

            // Determine effect and adjust slidesPerView accordingly
            var effect = swiperContainer.dataset.effect === 'true' ? "fade" : "";
            var slidesPerView = effect === "fade" ? 1 : parseInt(swiperContainer.dataset.items);

            var swiper = new Swiper(swiperContainer, {
                loop: true,
				speed: 800,
				parallax: true,
                autoplay: autoplayConfig,
                pagination: swiperContainer.dataset.pagination === 'true' ? {
                    el: '.swiper-pagination',
					dynamicBullets: true,
                    clickable: true
                } : false,
                navigation: navigationConfig,
				effect: effect,
				
				centeredSlides: swiperContainer.dataset.center === 'true' ? true : false,
				
                slidesPerView: slidesPerView,
                spaceBetween: parseInt(swiperContainer.dataset.margin),
				breakpoints: {
                    0: {
                        slidesPerView: effect === "fade" ? 1 : parseInt(swiperContainer.dataset.mobile),
                        spaceBetween: parseInt(swiperContainer.dataset.margin),
                    },
                    480: {
                        slidesPerView: effect === "fade" ? 1 : parseInt(swiperContainer.dataset.mobile),
						spaceBetween: parseInt(swiperContainer.dataset.margin),
                    },
					767: {
                        slidesPerView: effect === "fade" ? 1 : parseInt(swiperContainer.dataset.mobile),
						
                    },
                    992: {
                        slidesPerView: effect === "fade" ? 1 : parseInt(swiperContainer.dataset.tablet),
						
                    },
                    1200: {
                        slidesPerView: effect === "fade" ? 1 : parseInt(swiperContainer.dataset.items),
						
                    }
                },
                on: {
                    init: function () {
                         swiperJarallaxInit(this.slides);
                    },
					 resize: swiperJarallaxResize,
					 slideChange: swiperJarallaxResize,
                },
				
            });
        });
    }
}
document.addEventListener('DOMContentLoaded', initializeSwipers);

function swiperJarallaxResize() {
    const parallaxElements = document.querySelectorAll('.swiper-slide .cover-wrapper[data-parallax="parallax-enabled"]');
    parallaxElements.forEach(element => {
        jarallax(element, 'onScroll');
    });
}


function swiperJarallaxInit(slides) {
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
}

   function singlenextpost() {
      if ($('body').hasClass('single-post')) {

         var $entry_content = $('.post-inner'),
            $entry_looks = $('.single-next-trigger'),
            $next_post = $('.single-next-post');


         if ($entry_looks.length) {

            var $entry_content_from_top = $entry_content.offset().top,
               $entry_looks_from_top = $entry_looks.offset().top;

            if ($(window).scrollTop() > $entry_content_from_top) {


               if ($(window).scrollTop() > $entry_looks_from_top - $(window).height()) {

                  if (!$next_post.hasClass('shows')) {
                     $next_post.addClass('shows');
                  }
               } else {

                  if ($next_post.hasClass('shows')) {
                     $next_post.removeClass('shows');
                  }
               }

            }

         }

      }
   }


   $(document).ready(function () {

 // Cache jQuery selectors
    var $window = $(window);
    var $stickyNav = $('#elementor_sticky_header');
    var $header = $('#elementor_header');
    var $body = $('body');
    var lastScrollTop = 0;

    // Check if #elementor_sticky_header exists
    if ($stickyNav.length) {
        // Handle the scroll event
        $window.scroll(function () {
            var scrollTop = $window.scrollTop();
            var isScrollingUp = scrollTop < lastScrollTop;

            if (scrollTop >= 100 && isScrollingUp) {
                $header.removeClass('visible');
                $stickyNav.addClass('visible');
                $body.addClass('navbar-fixed');
            } else {
                $header.addClass('visible');
                $stickyNav.removeClass('visible');
                $body.removeClass('navbar-fixed');
            }

            lastScrollTop = scrollTop;
        });
    }



      if ($('.alignwide').length) {
         $('body').addClass("alignwide-iso");
      }

      $(".search-icon, .closeit").click(function () {
         $(".top-panel22").slideToggle("600", "easeInOutCirc", function () {
            if ($(this).is(':visible')) {
               $(".sb-search-input").focus();
            }
         });
      });


      $('.parallax-enabled:not(.parallax-video).headerstyler').each(function () {
         $(this).jarallax({
            speed: 0.8,
            type: 'scroll',
			imgPosition: '50% 50%',
            zIndex: 0,
			onCoverImage: function() {
			var $element = $(this.$item);
            $element.css('opacity', 1);
        }
         })
      });
      
		parallaxInit();
      justifiedgalleryInit();
	 
      audioPlayerInit();

      if (inf_var.pagination_type === "loadmore" && inf_var.issingle === "false" || inf_var.pagination_type === "infinite" && inf_var.issingle === "false" || inf_var.single_pagination_type === "infinite" && inf_var.issingle === "true") {
         ajaxLoadMoreButton();
      }
      magnificPopupLoad();

      var newsletter = $('#ms_signup'),
         newsletterload = newsletter.attr('data-showonload');
      if (newsletterload == 'true') {
         setTimeout(checkCookie, 5000);
      }

      if ($().doubleTouchToGo) {
         $('#primary-menu li.menu-item-has-children, #primary-menu li.has-mega-sub-menu, #top-menu li.menu-item-has-children').doubleTouchToGo();
      } // doubleTouchToGo


      if ($('.menu-mobile').length) {
         $('.menu-mobile').navAccordion({
            expandButtonText: '<i class="ms ms-f-arrow-right"></i>',
            collapseButtonText: '<i class="ms ms-f-arrow-down"></i>'
         });
      }


      /**
        if ($('.widget_nav_menu').length) {
            $(".widget_nav_menu").each(function() {
                $(this).navAccordion({
                    expandButtonText: '<i class="fa fa-angle-right"></i>',
                    collapseButtonText: '<i class="fa fa-angle-up"></i>'
                })
            });
        }
     */

      //Zoom fix
      // IPad/IPhone
      var viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]'),
         ua = navigator.userAgent,

         gestureStart = function () {
            viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
         },

         scaleFix = function () {
            if (viewportmeta && /iPhone|iPad/.test(ua) && !/Opera Mini/.test(ua)) {
               viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
               document.addEventListener("gesturestart", gestureStart, false);
            }
         };
      scaleFix();

      // ---------------------------------------------------------
      // Tooltip
      // ---------------------------------------------------------
      $("[data-rel='tooltip']").tooltip();
      // ---------------------------------------------------------
      // Back to Top
      // ---------------------------------------------------------
      $(window).scroll(function () {

         singlenextpost();
         if ($(this).scrollTop() > 300) {
            $('#back-top').fadeIn();
         } else {
            $('#back-top').fadeOut();
         }
      });
      $('#back-top a').click(function () {
         $('body,html').stop(false, false).animate({
            scrollTop: 0
         }, 800);
         return false;
      });
      $('.skills').appear(function () {
         $(".chart").each(function () {
            var size = $(this).attr('data-size');
            var fgcolor = $(this).attr('data-fgcolor');
            var bgcolor = $(this).attr('data-bgcolor');
            var donutwidth = $(this).attr('data-donutwidth');
            $(this).easyPieChart({
               easing: 'easeInOutQuad',
               barColor: fgcolor,
               animate: 2000,
               trackColor: bgcolor,
               lineWidth: donutwidth,
               lineCap: 'square',
               size: size,
               scaleColor: false,
               onStep: function (from, to, percent) {
                  $(this.el).find('.percent').text(Math.round(percent));
               }
            });
         });
      });

      $('.bars').appear(function () {
         $('.progress').each(function () {
            var percentage = $(this).find('.bar').attr('data-progress');
            $(this).find('.bar').css('width', '0%');
            $(this).find('.bar').animate({
               width: percentage + '%'
            }, {
               duration: 2000,
               easing: 'easeInOutQuart'
            });
         });
      });

      masonryStart();

   });

   document.addEventListener('lazybeforeunveil', function (e) {
      var bg = e.target.getAttribute('data-bg');
      if (bg) {
         e.target.style.backgroundImage = 'url(' + bg + ')';
      }
   });


   function magnificPopupLoad() {


      $('.lightbox-gallery-link').each(function () {
         var _this = $(this),
            items = [],
            target = $(_this.attr('href'));

         target.find('.post-gallery-content').each(function () {
            items.push({
               src: $(this),
               type: 'inline'
            });
         });

         _this.on('click', function () {
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
                  open: function () {
                     var self = this;

                     self.wrap.find('.mfp-container').addClass('mfp-image-holder');
                     setTimeout(function () {
                        self.wrap.addClass('mfp-image-loaded');
                     }, 300);

                     $.magnificPopup.instance.next = function () {

                        var self = this;
                        self.wrap.removeClass('mfp-image-loaded');
                        $.magnificPopup.proto.next.call(
                           setTimeout(function () {
                              self.wrap.addClass('mfp-image-loaded');
                           }, 400));


                     }
                     $.magnificPopup.instance.prev = function () {

                        var self = this;
                        self.wrap.removeClass('mfp-image-loaded');
                        $.magnificPopup.proto.prev.call(
                           setTimeout(function () {
                              self.wrap.addClass('mfp-image-loaded');
                           }, 400));

                     }
                  }

               }
            });
            return false;
         });

      });


      $('.popup-youtube, .popup-vimeo, .popup-gmaps').each(function () { // the containers for all your galleries
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

      $('.image-popup-no-margins').magnificPopup({
         tClose: '',
         type: 'image',
         closeOnContentClick: true,
         closeBtnInside: false,
         fixedContentPos: true,
         removalDelay: 300,
         mainClass: 'mfp-zoom-in',
         image: {
            markup: '<div class="mfp-wrapper"><div class="mfp-contain"><div class="mfp-bottom-bar">' +
               '<div class="mfp-title"></div>' +
               '</div>' +
               '<div class="mfp-figure">' +
               '<div class="mfp-img"></div>' +
               '</div></div></div>',
            verticalFit: true,
            titleSrc: function (item) {
               var caption = item.el.find('img').attr('alt');
               return caption;
            }
         },
         callbacks: {
            imageLoadComplete: function () {
               var self = this;
               setTimeout(function () {
                  self.wrap.addClass('mfp-image-loaded');
               }, 16);
            }
         }
      });
      $('.zoom-gallery').each(function () { // the containers for all your galleries
         $(this).magnificPopup({
            tClose: '',
            delegate: 'a.zoomer',
            type: 'image',
            closeOnContentClick: false,
            closeBtnInside: true,
            mainClass: 'mfp-zoom-in',
            removalDelay: 300,
            closeMarkup: '<span title="%title%" class="mfp-close close-x"><span class="ms ms-f-close"></span></span>',
            image: {
               markup: '<div class="mfp-wrapper"><div class="mfp-counter"></div><div class="mfp-contain"><div class="mfp-bottom-bar">' +
                  '<div class="mfp-title"></div>' +
                  '</div>' +
                  '<div class="mfp-figure">' +
                  '<div class="mfp-close"></div>' +
                  '<div class="mfp-img"></div>' +
                  '</div></div></div>',
               verticalFit: true,
               titleSrc: function (item) {
                  var caption = item.el.attr('title');
                  return caption;

               }
            },
            gallery: {
               enabled: true,
               tCounter: '%curr%/%total%',
               arrowMarkup: '<i class="mfp-arrow mfp-arrow-%dir%"></i>',
            },
            callbacks: {
               open: function () {
                  //overwrite default prev + next function. Add timeout for css3 crossfade animation
                  $.magnificPopup.instance.next = function () {
                     var self = this;
                     self.wrap.removeClass('mfp-image-loaded');
                     setTimeout(function () {
                        $.magnificPopup.proto.next.call(self);
                     }, 120);
                  }
                  $.magnificPopup.instance.prev = function () {
                     var self = this;
                     self.wrap.removeClass('mfp-image-loaded');
                     setTimeout(function () {
                        $.magnificPopup.proto.prev.call(self);
                     }, 120);
                  }
               },
               imageLoadComplete: function () {
                  var self = this;
                  setTimeout(function () {
                     self.wrap.addClass('mfp-image-loaded');
                  }, 16);
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
            beforeOpen: function () {
               if ($(window).width() < 700) {
                  this.st.focus = false;
               } else {
                  this.st.focus = '.sb-search-input';
               }
            },
            afterClose: function () {

            }
         }
      });
   }

   function ajaxLoadMoreButton() {

      var hrs = $.hrs({
         container: ".ajax-container",
         item: ".ajax-post-wrapper",
         pagination: ".ajax-pagination-container",
         next: "#ajax-load-more-posts-button",
      });

      if ($('.grid:not(.widget-loop)')[0]) {
         hrs.on('render', function (items) {
            $(items).css({
               opacity: 0
            });

         });
      }
      if ($('.metro-post')[0]) {
         hrs.on('render', function (items) {
            $(items).addClass('masonryhide');
         });
      }
      hrs.on('rendered', function (items) {
         magnificPopupLoad();
         justifiedgalleryInit();
         audioPlayerInit();
         initializeTooltipsAndCopyLink();
		parallaxInit();
initializeSwipers();
        

         if ($('.grid:not(.widget-loop)')[0]) {
            $('.grid:not(.widget-loop)').masonry('appended', items, true);
         }

         if ($('.metro-post')[0]) {

            var $grid = $('.metro-post');
            $grid.append(items).imagesLoaded(function () {
               $grid.masonry('appended', items, true);
               $(items).removeClass('masonryhide').addClass('masonryshow');
            });


         }
      });

      hrs.extension(new HRSNoneLeftExtension({
         text: inf_var.you_reached_the_end,
      }));

      if (inf_var.issingle != "true") {
         if (inf_var.pagination_type === "loadmore") {

            hrs.extension(new HRSTriggerExtension({
               text: inf_var.load_more,
               offset: inf_var.offset,
               html: '<div class="ajax-pagination"><a id="ajax-load-more-posts" class="btn btn-default btn-normal">{text}</a></div>'
            }));
         }
      }
      hrs.extension(new HRSSpinnerExtension({
         html: '<div class="ajax-pagination"><div class="ajax-loader"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_b2T7{animation:spinner_xe7Q .8s linear infinite}.spinner_YRVV{animation-delay:-.65s}.spinner_c9oY{animation-delay:-.5s}@keyframes spinner_xe7Q{93.75%,100%{r:3px}46.875%{r:.2px}}</style><circle class="spinner_b2T7" cx="4" cy="12" r="3"/><circle class="spinner_b2T7 spinner_YRVV" cx="12" cy="12" r="3"/><circle class="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3"/></svg></div></div>'
      }));
   }
}(jQuery));
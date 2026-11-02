(function($){
	"use strict";

	// ---------------------------------------------------------------------
	// Tiny helpers
	// ---------------------------------------------------------------------
	function msIsIconTag(token){
		if (!token) return '';
		if (token.slice(0,3) === '<i ' || token.slice(0,3) === '<i>') return 'i';
		if (token.slice(0,4) === '<svg') return 'svg';
		if (token.slice(0,6) === '<video') return 'video';
		return '';
	}
	function msIsImageTag(token){
		return token && token.slice(0,4) === '<img' ? 'img' : '';
	}
	function msGetNextToken(str,pos){
		var token='', tag='';
		if (pos < str.length){
			if (str[pos] === '<'){
				while (pos < str.length && str[pos] !== '>') token += str[pos++];
				token += str[pos++] || '';
				tag = msIsIconTag(token);
				if (tag){
					while (pos < str.length && token.indexOf('</'+tag+'>') === -1) token += str[pos++];
				}
			} else {
				token = str[pos++];
			}
		}
		return token;
	}
	function msWrapWords(txt,before,after){
		var rez='', token='', inWord=false, cnt=0, isIcon=false, isSpace=false;
		for (var i=0;i<txt.length;i++){
			token = msGetNextToken(txt,i);
			isIcon = !!(msIsIconTag(token) || msIsImageTag(token));
			isSpace = token === ' ' || /^[\s]*$/.test(token);
			if (inWord){
				if (token.slice(0,1) === '<' || isSpace){
					rez += after;
					inWord = false;
				}
			} else {
				if (!isSpace && (token.slice(0,1) !== '<' || isIcon)){
					rez += before.replace('>',' data-animation-index="'+cnt+'">');
					inWord = true;
					cnt++;
				}
			}
			rez += token;
			i += token.length - 1;
			if (isIcon || (inWord && i === txt.length - 1)){
				rez += after;
				inWord = false;
			}
		}
		return rez;
	}
	function msWrapChars(txt,before,after,beforeWord,afterWord){
		var rez='', token='', inWord=false, cnt=0, isIcon=false, isSpace=false;
		beforeWord = beforeWord || '';
		afterWord  = afterWord || '';
		for (var i=0;i<txt.length;i++){
			token = msGetNextToken(txt,i);
			isIcon = !!(msIsIconTag(token) || msIsImageTag(token));
			isSpace = token === ' ' || /^[\s]*$/.test(token);
			if (inWord){
				if (token.slice(0,1) === '<' || isSpace){
					rez += afterWord;
					inWord = false;
				}
			} else {
				if (!isSpace && (token.slice(0,1) !== '<' || isIcon)){
					rez += beforeWord;
					inWord = true;
				}
			}
			rez += (token.slice(0,1) === '<' && !isIcon)
				? token
				: (isSpace
					? token
					: before.replace('>',' data-animation-index="'+cnt+'">') + token + after);
			i += token.length - 1;
			if (isIcon || (inWord && i === txt.length - 1)){
				rez += afterWord;
				inWord = false;
			}
			if (token.slice(0,1) !== '<' || isIcon){
				cnt++;
			}
		}
		return rez;
	}

	function msGetSettings($el){
		var s = $el.data('settings');
		if (!s){
			var raw = $el.attr('data-settings');
			if (raw){
				try { s = JSON.parse(raw); } catch(e){ s = {}; }
			}
		}
		return s || {};
	}

	function msExtractAnimationSettings(settings){
		var anim = {
			_animation: settings._animation || settings.animation || '',
			_animation_delay: settings._animation_delay || settings.animation_delay || 0,
			_animation_duration: settings._animation_duration || settings.animation_duration || ''
		};
		// Clean keys to prevent Elementor from animating the whole block
		delete settings._animation;
		delete settings.animation;
		delete settings._animation_delay;
		delete settings.animation_delay;
		delete settings._animation_duration;
		delete settings.animation_duration;
		return anim;
	}

	function msFindItems($el){
		// Sections / columns / containers
		if ($el.hasClass('e-con')){
			var $items = $el.find('> .e-con-inner > .e-con, > .e-con-inner > .elementor-element, > .e-con');
			if ($items.length > 1) return $items;
		}
		if ($el.hasClass('elementor-section')){
			var $cols = $el.find('> .elementor-container > .elementor-row > .elementor-column, > .elementor-container > .elementor-column');
			if ($cols.length > 1) return $cols;
		}
		// Common widget patterns
		var $posts = $el.find('.post_item');
		if ($posts.length > 1) return $posts;
		var $slides = $el.find('> .swiper-wrapper > .swiper-slide');
		if ($slides.length > 1) return $slides;
		var $wc = $el.find('> .elementor-widget-container');
		if ($wc.length){
			var $kids = $wc.children().filter(function(){
				return this.nodeType === 1 && !this.classList.contains('elementor-element');
			});
			if ($kids.length > 1) return $kids;
		}
		// Fallback: any direct children
		var $direct = $el.children().filter(function(){ return this.nodeType === 1; });
		return $direct;
	}

	function msPrepare($root){
		var isEditMode = !!(window.elementorFrontend && window.elementorFrontend.isEditMode && window.elementorFrontend.isEditMode());
		var $targets = $root.find('[data-animation-type]').addBack('[data-animation-type]');
		$targets.each(function(){
			var $el = $(this);
			var type = ($el.attr('data-animation-type') || 'block');
			if (type === 'block') return;
			if ($el.hasClass('ms-animated-separate')) return;

			var settings = msGetSettings($el);
			// In the Elementor editor we avoid mutating settings to prevent side effects.
			var working = isEditMode ? $.extend(true, {}, settings) : settings;
			var anim = msExtractAnimationSettings(working);
			if (!anim._animation) return;

			// Persist cleaned settings back (frontend only) to prevent Elementor from animating the whole block.
			if (!isEditMode){
				try {
					$el.attr('data-settings', JSON.stringify(working)).data('settings', working);
				} catch(e){}
			}

			$el.data('ms-animation-settings', anim);
			$el.addClass('ms-animated-separate');
			$el.removeClass('animated elementor-invisible');

			var $items = msFindItems($el);
			if (!$items || !$items.length) return;

			// Text animation (word/char) for headings/text widgets
			if (type === 'word' || type === 'char' || type === 'line'){
				// Try to animate the actual text container (common: heading widgets)
				var $text = $el.find('h1,h2,h3,h4,h5,h6,p,.elementor-heading-title,.elementor-text-editor');
				$text = $text.first();
				if ($text.length && $text.data('ms-animation-prepared') === undefined){
					var html = $text.html();
					if (type === 'word' || type === 'line'){
						html = msWrapWords(html,
							'<span class="ms-animated-text-block elementor-invisible ms-animated-item">',
							'</span>'
						);
					} else {
						html = msWrapChars(html,
							'<span class="ms-animated-text-block elementor-invisible ms-animated-item">',
							'</span>',
							'<span class="ms-animated-word">',
							'</span>'
						);
					}
					$text.html(html).data('ms-animation-prepared', true);
					$items = $text.find('.ms-animated-item');
				}
			}

			$items.each(function(idx){
				var $it = $(this);
				if (!$it.hasClass('ms-animated-item')) $it.addClass('ms-animated-item');
				$it.addClass('elementor-invisible');
				$it.attr('data-animation-index', idx);
			});
		});
	}

	function msInViewport($el){
		var rect = $el[0].getBoundingClientRect();
		return rect.top < (window.innerHeight || document.documentElement.clientHeight) + 50 && rect.bottom > 0;
	}

	// Cached item list — refreshed by msInit() (document ready + Elementor element_ready)
	// instead of re-querying the DOM on every scroll tick.
	var $msItems = $();
	var msScrollBound = false;
	var msRafPending = false;

	function msRefreshItems(){
		$msItems = $('.ms-animated-item');
	}

	function msOnScrollResize(){
		if (msRafPending) return;
		msRafPending = true;
		window.requestAnimationFrame(function(){
			msRafPending = false;
			msAnimateVisible();
		});
	}

	function msBindScroll(){
		if (msScrollBound) return;
		msScrollBound = true;
		$(window).on('scroll.msMotionEffects resize.msMotionEffects', msOnScrollResize);
	}

	function msUnbindScroll(){
		if (!msScrollBound) return;
		msScrollBound = false;
		$(window).off('scroll.msMotionEffects resize.msMotionEffects', msOnScrollResize);
	}

	function msAnimateVisible(){
		var pending = 0;
		$msItems.each(function(){
			var $item = $(this);
			if ($item.hasClass('animated') || $item.hasClass('ms-wait')) return;
			if (!msInViewport($item)){ pending++; return; }

			var $sc = $item.closest('.ms-animated-separate');
			var anim = $sc.data('ms-animation-settings') || {};
			var type = ($sc.attr('data-animation-type') || 'sequental');
			var stagger = parseInt($sc.attr('data-animation-stagger') || '', 10);
			var baseDelay = parseInt(anim._animation_delay || 0, 10);
			if (isNaN(stagger)) stagger = baseDelay;
			if (isNaN(stagger) || stagger === 0) stagger = 150;
			if (isNaN(baseDelay)) baseDelay = 0;

			var idx = parseInt($item.attr('data-animation-index') || 0, 10);
			var delay = baseDelay;
			if (type === 'random'){
				delay += Math.floor(Math.random() * stagger);
			} else {
				delay += stagger * idx;
			}

			$item.addClass('ms-wait');
			setTimeout(function(){
				$item
					.removeClass('ms-wait elementor-invisible')
					.addClass('animated')
					.addClass(anim._animation || '');
				// duration (optional)
				if (anim._animation_duration){
					$item.addClass('animated-' + anim._animation_duration);
				}
			}, delay);
		});
		// Only listen to scroll/resize while there are items left to animate.
		if (pending > 0){
			msBindScroll();
		} else {
			msUnbindScroll();
		}
	}

	// ---------------------------------------------------------------------
	// Per-element Scroll Floating
	// Uses the individual CSS translate property, so Elementor's own
	// transform/entrance effects can run without being overwritten.
	// ---------------------------------------------------------------------
	var msFloatInstances = new Map();

	function msMediaListener(query, action, callback){
		if (query[action + 'EventListener']) query[action + 'EventListener']('change', callback);
		else if (query[action + 'Listener']) query[action + 'Listener'](callback);
	}

	function msDestroyFloat(element){
		var cleanup = msFloatInstances.get(element);
		if (cleanup) cleanup();
	}

	function msCreateFloat(element){
		if (!window.IntersectionObserver) return;
		var strength = Math.max(0, Math.min(80, parseFloat(element.getAttribute('data-mauve-scroll-float-strength')) || 0));
		if (!strength) return;

		var position = window.getComputedStyle(element).position;
		var moveTarget = element;
		if (position === 'absolute' || position === 'fixed'){
			var inner = element.querySelector(':scope > .elementor-widget-container, :scope > .e-con-inner');
			if (inner){
				moveTarget = inner;
				element.classList.add('mauve-scroll-floating--inner');
			}
		}
		var geometryTarget = element;
		var initialRect = element.getBoundingClientRect();
		if (moveTarget !== element && (initialRect.width < 1 || initialRect.height < 1)){
			geometryTarget = moveTarget;
		}

		var inertia = Math.max(0, Math.min(600, parseFloat(element.getAttribute('data-mauve-scroll-float-inertia')) || 120));
		var direction = parseInt(element.getAttribute('data-mauve-scroll-float-direction'), 10) === -1 ? -1 : 1;
		var allowMobile = parseInt(element.getAttribute('data-mauve-scroll-float-mobile'), 10) !== 0;
		var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		var mobile = window.matchMedia('(max-width: 767px)');
		var visible = false, frame = 0, last = 0, y = 0;

		function disabled(){ return reduced.matches || (!allowMobile && mobile.matches); }
		function stop(){ cancelAnimationFrame(frame); frame = 0; last = 0; }
		function reset(){ y = 0; moveTarget.style.removeProperty('--mauve-scroll-float-y'); }
		function schedule(){
			if (!frame && visible && !disabled() && !document.hidden) frame = requestAnimationFrame(tick);
		}
		function tick(time){
			frame = 0;
			var rect = geometryTarget.getBoundingClientRect();
			// getBoundingClientRect includes the current CSS translate. Remove it
			// from the measurement so the movement never feeds back into itself.
			var stableTop = rect.top - (geometryTarget === moveTarget ? y : 0);
			var viewport = window.innerHeight || document.documentElement.clientHeight;
			var progress = Math.max(-1, Math.min(1, (viewport - 2 * stableTop - rect.height) / (viewport + rect.height)));
			var target = progress * strength * direction;
			var ease = inertia ? 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / inertia) : 1;
			last = time;
			y += (target - y) * ease;
			if (Math.abs(target - y) <= .05) { y = target; last = 0; }
			moveTarget.style.setProperty('--mauve-scroll-float-y', y.toFixed(3) + 'px');
			if (last) schedule();
		}
		function preference(){
			stop();
			if (disabled()) reset();
			else schedule();
		}
		function visibility(){ if (document.hidden) stop(); else schedule(); }

		var observer = new IntersectionObserver(function(entries){
			visible = entries.some(function(entry){ return entry.isIntersecting; });
			if (visible) schedule(); else stop();
		}, { rootMargin: '80px' });

		observer.observe(geometryTarget);
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		document.addEventListener('visibilitychange', visibility);
		msMediaListener(reduced, 'add', preference);
		if (!allowMobile) msMediaListener(mobile, 'add', preference);

		msFloatInstances.set(element, function(){
			stop(); reset(); observer.disconnect();
			element.classList.remove('mauve-scroll-floating--inner');
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			document.removeEventListener('visibilitychange', visibility);
			msMediaListener(reduced, 'remove', preference);
			if (!allowMobile) msMediaListener(mobile, 'remove', preference);
			msFloatInstances.delete(element);
		});
	}

	function msInitFloating($scope){
		var scope = $scope && $scope.length ? $scope[0] : document;
		msFloatInstances.forEach(function(cleanup, element){
			if (!element.isConnected || element === scope || (scope.contains && scope.contains(element))) cleanup();
		});
		$(scope).find('[data-mauve-scroll-float]').addBack('[data-mauve-scroll-float]').each(function(){
			msCreateFloat(this);
		});
	}

	// ---------------------------------------------------------------------
	// Per-element Sticky Scroll Expand
	// A separate flow spacer creates the scroll runway, keeping the sticky
	// element free of the large margins that make browsers push it off-screen.
	// ---------------------------------------------------------------------
	var msStickyExpandInstances = new Map();
	var msStickyExpandOverflowCounts = new WeakMap();

	// Moves the page by a whole number of pixels without anything on screen moving: used
	// right after part of the page above the viewport was taken out of the flow. Lenis
	// (desktop smooth scrolling) keeps its own scroll position and would put the old one
	// back on its next frame, so its position, target and running animation move too -
	// a smooth scroll in progress simply carries on. Browser scroll anchoring is switched
	// off by the caller for the change, or it would compensate a second time.
	if (!window.msStickyExpandShiftScroll){
		window.msStickyExpandShiftScroll = function(delta){
			delta = Math.round(delta);
			if (!delta) return;
			var lenis = window.MS_Lenis;
			if (lenis && typeof lenis.animatedScroll === 'number'){
				lenis.animatedScroll += delta;
				lenis.targetScroll += delta;
				var animation = lenis.animate;
				if (animation && animation.isRunning){
					animation.value += delta;
					animation.to += delta;
					animation.from += delta;
				}
			}
			window.scrollBy(0, delta);
			// Same task: ScrollTrigger must not see the new scroll position with the old layout.
			window.msStickyExpandRefreshTriggers('now');
		};
		// GSAP ScrollTrigger (Sticky Sections) keeps the page positions it measured; after
		// the page has changed length they are recalculated - once things are quiet, or with
		// `soon` on the next frame (the reader may be about to scroll into them).
		window.msStickyExpandRefreshTriggers = function(soon){
			if (!window.ScrollTrigger || typeof window.ScrollTrigger.refresh !== 'function') return;
			window.clearTimeout(window.msStickyExpandRefreshTimer);
			window.cancelAnimationFrame(window.msStickyExpandRefreshFrame || 0);
			var run = function(){ window.ScrollTrigger.refresh(); };
			if (soon === 'now') run();
			else if (soon) window.msStickyExpandRefreshFrame = window.requestAnimationFrame(run);
			else window.msStickyExpandRefreshTimer = window.setTimeout(run, 300);
		};
		// The page is only moved while nothing drives the scroll natively: a fling on a
		// touch screen would be cut short by it. Touch input therefore waits for the scroll
		// to come to rest.
		window.msStickyExpandLastTouch = 0;
		var msTouched = function(){ window.msStickyExpandLastTouch = Date.now(); };
		window.addEventListener('touchstart', msTouched, { passive: true });
		window.addEventListener('touchmove', msTouched, { passive: true });
		window.addEventListener('touchend', msTouched, { passive: true });
	}
	function msStickyExpandTouchScrolling(){
		return Date.now() - (window.msStickyExpandLastTouch || 0) < 2500;
	}

	function msCreateStickyExpand(element){
		if (element.querySelector('.msbl-scroll-expand-stage')) return;

		var expandDistance = Math.max(100, Math.min(3000, parseInt(element.getAttribute('data-mauve-sticky-expand-distance'), 10) || 500));
		var holdDistance = Math.max(0, Math.min(4000, parseInt(element.getAttribute('data-mauve-sticky-expand-hold'), 10) || 0));
		var topOffset = Math.max(0, Math.min(300, parseInt(element.getAttribute('data-mauve-sticky-expand-top'), 10) || 0));
		var startHeightSetting = element.getAttribute('data-mauve-sticky-expand-start-height') || '';
		var allowMobile = parseInt(element.getAttribute('data-mauve-sticky-expand-mobile'), 10) !== 0;
		// Default: once the panel has grown it stays grown, and on the way back up it
		// scrolls past like any section - no pinning, no shrinking. It returns to its
		// starting height only after it has left the screen at the bottom.
		var stayExpanded = element.getAttribute('data-mauve-sticky-expand-return') !== 'reverse';
		var locked = false, collapsed = 0, lastScrollTop = -1, idleTimer = 0;
		// "Grow the background": the element keeps its height; its background starts as a
		// centred card of the given size and is scaled up until it covers the element.
		var backgroundMode = element.getAttribute('data-mauve-sticky-expand-mode') === 'background';
		function percent(name, fallback){
			var value = parseFloat(element.getAttribute(name));
			return Math.max(10, Math.min(100, isFinite(value) ? value : fallback));
		}
		var bgWidth = percent('data-mauve-sticky-expand-bg-width', 75);
		var bgHeight = percent('data-mauve-sticky-expand-bg-height', 67);
		var bgRadius = Math.max(0, Math.min(200, parseFloat(element.getAttribute('data-mauve-sticky-expand-bg-radius')) || 0));
		var bgLayers = [], bgOwnLayers = [], bgScaleMax = 1, appliedBackground = '', lazyObserver = null;
		// Background Parallax on the same element: the image moves inside the card, which
		// then behaves like a parallax box of its own (jarallax's crop and travel).
		var parallaxSpeed = parseFloat(element.getAttribute('data-mauve-sticky-expand-parallax'));
		parallaxSpeed = backgroundMode && isFinite(parallaxSpeed) ? Math.max(0.05, Math.min(1, parallaxSpeed)) : 0;
		var bgImage = null, parallaxShape = null, cardInset = 0, cardHeight = 0, appliedParallax = '';
		var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		var mobile = window.matchMedia('(max-width: 767px)');
		var properties = ['position', 'top', 'height', 'overflow', 'margin-bottom'];
		var original = {};
		var frame = 0, resizeTimer = 0, initTimer = 0, destroyed = false;
		var initialHeight = 0, targetHeight = 0, startTop = 0, runway = expandDistance + holdDistance;
		var overflowAncestors = [];
		var runwaySpacer = null;
		var runwayAnchorOffset = 0;
		var horizontalRunway = false;
		var flowRunway = false; // the runway sits in a vertical flow (block or column flex)
		var gapPull = 0, ownMargin = 0;
		var tailRunway = false, parentMargin = null, parentOwnMargin = 0;
		var held = false, holdObserver = null;
		var appliedHeight = '', appliedRemaining = '';

		properties.forEach(function(property){
			original[property] = {
				value: element.style.getPropertyValue(property),
				priority: element.style.getPropertyPriority(property)
			};
		});

		function restoreProperty(property){
			var saved = original[property];
			if (saved.value) element.style.setProperty(property, saved.value, saved.priority);
			else element.style.removeProperty(property);
		}

		function clearRunway(){
			if (runwaySpacer && runwaySpacer.parentNode){
				runwaySpacer.parentNode.removeChild(runwaySpacer);
			}
			runwaySpacer = null;
			runwayAnchorOffset = 0;
			horizontalRunway = false;
			flowRunway = false;
			gapPull = 0;
			if (parentMargin){
				if (parentMargin.value) parentMargin.node.style.setProperty('margin-bottom', parentMargin.value, parentMargin.priority);
				else parentMargin.node.style.removeProperty('margin-bottom');
				parentMargin = null;
			}
			tailRunway = false;
		}

		function hasFollowingFlow(){
			for (var node = runwaySpacer.nextElementSibling; node; node = node.nextElementSibling){
				var style = window.getComputedStyle(node);
				if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') continue;
				if (node.offsetHeight > 0) return true;
			}
			return false;
		}

		// The unused part of the runway is taken back out of the flow, so what follows the
		// panel stays flush with it. With content after the panel in the same parent that
		// is a negative margin on the spacer. When the panel is the last thing in its
		// parent, the same margin would also shorten the parent to exactly "panel + the
		// distance scrolled" - the very end of the sticky range, so a frame in which this
		// script is behind the scroll shoves the panel itself up by the difference. There
		// the spacer keeps its full height (the panel then has the whole runway to stay
		// pinned in) and the margin goes on the parent instead.
		function applyRemaining(remaining){
			var value = (0 - remaining).toFixed(2) + 'px';
			if (value === appliedRemaining) return;
			appliedRemaining = value;
			if (tailRunway) parentMargin.node.style.setProperty('margin-bottom', (parentOwnMargin - remaining).toFixed(2) + 'px', 'important');
			else runwaySpacer.style.setProperty('margin-bottom', value);
		}

		function syncFollowingContent(elapsed){
			if (!runwaySpacer || horizontalRunway) return;
			var remaining = runway - Math.max(0, Math.min(runway, elapsed));
			// Collapse the unused runway in normal document flow. The next
			// section then stays flush with the sticky panel without relative
			// offsets, phantom space or conflicts with animated widgets.
			applyRemaining(remaining);
		}

		// Once the panel has reached its full height nothing below it is on screen, so the
		// flow can take its final shape at once: the whole runway in place, and the panel's
		// sticky travel ended by the browser itself at the runway's end. That end is set by
		// a bottom margin reaching to the end of the parent, cancelled by the same negative
		// margin on the spacer, so nothing in the flow moves.
		// Before, a script switched the panel to position:relative at the release point -
		// a frame late wherever scrolling runs off the main thread, which showed as a
		// bounce when scrolling back up into the panel - and the page was laid out again
		// on every frame of the hold although nothing visible changed.
		function limitTravel(){
			var parent = element.parentElement;
			if (!held || !parent || !runwaySpacer) return;
			var parentStyle = window.getComputedStyle(parent);
			var parentEnd = parent.getBoundingClientRect().bottom - (parseFloat(parentStyle.borderBottomWidth) || 0) - (parseFloat(parentStyle.paddingBottom) || 0);
			var limiter = Math.max(0, parentEnd - runwaySpacer.getBoundingClientRect().bottom);
			element.style.setProperty('margin-bottom', (ownMargin + limiter).toFixed(2) + 'px', 'important');
			runwaySpacer.style.setProperty('margin-top', (0 - gapPull - limiter).toFixed(2) + 'px');
		}

		function setHeld(on){
			held = on;
			// The runway now sits in the flow in full (or starts folding away again): everything
			// below moved by up to its length. Sticky Sections further down must measure again
			// before the reader gets there, or their animations start that much too early.
			window.msStickyExpandRefreshTriggers(true);
			if (on){
				applyRemaining(0);
				limitTravel();
				if (!holdObserver && typeof ResizeObserver === 'function'){
					// Content further down the parent changing height moves the parent's end.
					holdObserver = new ResizeObserver(limitTravel);
					holdObserver.observe(element.parentElement);
				}
			} else {
				restoreProperty('margin-bottom');
				runwaySpacer.style.setProperty('margin-top', (0 - gapPull).toFixed(2) + 'px');
			}
		}

		// The part of the runway the panel has already travelled through lies above it, so
		// scrolling back up would show it as an empty band and pin the panel again. Take it
		// out of the flow and move the page by the same amount: nothing on screen moves,
		// the panel now starts right where it is, and above it is the content before it.
		// What is left of the runway still pins the panel when scrolling on down.
		function collapseTravelled(){
			if (!locked || !flowRunway || !runwaySpacer || horizontalRunway) return;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var elapsed = scrollTop - currentStartTop(scrollTop) + topOffset;
			var travelled = Math.floor(Math.min(runway, Math.max(0, elapsed)));
			if (travelled < 1) return;
			var root = document.documentElement;
			var anchoring = root.style.getPropertyValue('overflow-anchor');
			root.style.setProperty('overflow-anchor', 'none');
			var before = runwaySpacer.getBoundingClientRect().bottom;
			runway -= travelled;
			collapsed += travelled;
			runwaySpacer.style.setProperty('flex', '0 0 ' + runway + 'px');
			runwaySpacer.style.setProperty('height', runway + 'px');
			limitTravel();
			window.msStickyExpandShiftScroll(runwaySpacer.getBoundingClientRect().bottom - before);
			if (anchoring) root.style.setProperty('overflow-anchor', anchoring);
			else root.style.removeProperty('overflow-anchor');
			lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
		}

		function idle(){
			idleTimer = 0;
			if (!destroyed && locked) collapseTravelled();
		}

		// The element's own background and Elementor's overlay (::before) are copied into
		// two layers of its own; Elementor's video / slideshow layers are used as they are.
		var backgroundProperties = ['backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'backgroundRepeat', 'backgroundOrigin', 'backgroundClip', 'backgroundBlendMode'];
		function copyBackground(){
			if (!bgOwnLayers.length) return;
			// No transition while the background is switched back on for the read (Elementor's
			// .e-con has `transition: background .3s` - the colour would be read as transparent).
			element.classList.add('mauve-sticky-expand-bg-still');
			element.classList.remove('mauve-sticky-expand-bg-ready');
			// With Background Parallax on, plugin.php hides the static background from the first
			// paint (.ms-bg-parallax); lift that for this one read.
			var parallaxFlag = element.classList.contains('ms-bg-parallax');
			if (parallaxFlag) element.classList.remove('ms-bg-parallax');
			var own = window.getComputedStyle(element);
			var overlay = window.getComputedStyle(element, '::before');
			var imageTarget = bgImage || bgOwnLayers[0];
			backgroundProperties.forEach(function(property){ imageTarget.style[property] = own[property]; });
			if (parallaxFlag) element.classList.add('ms-bg-parallax');
			if (bgOwnLayers[1]){
				backgroundProperties.concat(['opacity', 'mixBlendMode', 'filter']).forEach(function(property){ bgOwnLayers[1].style[property] = overlay[property]; });
			}
			element.classList.add('mauve-sticky-expand-bg-ready');
			void own.backgroundColor; // style the final state before transitions are allowed again
			element.classList.remove('mauve-sticky-expand-bg-still');
		}
		function setupBackground(){
			var layer = document.createElement('div');
			layer.className = 'mauve-sticky-expand-bg-layer';
			layer.setAttribute('aria-hidden', 'true');
			element.insertBefore(layer, element.firstChild);
			bgOwnLayers.push(layer);
			if (parallaxSpeed){
				bgImage = document.createElement('div');
				bgImage.className = 'mauve-sticky-expand-bg-image';
				layer.appendChild(bgImage);
				// The card as a parallax box: msParallaxGeometry() "flow" in mauve-elementor.js.
				var viewport = window.innerHeight || document.documentElement.clientHeight;
				cardHeight = initialHeight * bgHeight / 100;
				cardInset = (initialHeight - cardHeight) / 2;
				parallaxShape = {
					height: Math.max(cardHeight, parallaxSpeed * cardHeight + (1 - parallaxSpeed) * viewport),
					from: (parallaxSpeed - 1) * viewport,
					to: (1 - parallaxSpeed) * cardHeight,
					viewport: viewport
				};
				bgImage.style.height = parallaxShape.height.toFixed(1) + 'px';
				appliedParallax = '';
			}
			var overlayStyle = window.getComputedStyle(element, '::before');
			if (overlayStyle.content && overlayStyle.content !== 'none' && overlayStyle.display !== 'none'){
				var overlay = document.createElement('div');
				overlay.className = 'mauve-sticky-expand-bg-layer mauve-sticky-expand-bg-overlay';
				overlay.setAttribute('aria-hidden', 'true');
				layer.insertAdjacentElement('afterend', overlay);
				bgOwnLayers.push(overlay);
			}
			bgLayers = bgOwnLayers.slice();
			Array.prototype.forEach.call(element.children, function(child){
				if (child.classList.contains('elementor-background-video-container') || child.classList.contains('elementor-background-slideshow')) bgLayers.push(child);
			});
			element.style.setProperty('--mse-bg-w', bgWidth + '%');
			element.style.setProperty('--mse-bg-h', bgHeight + '%');
			copyBackground();
			bgScaleMax = Math.max(100 / bgWidth, 100 / bgHeight);
			appliedBackground = '';
			// Elementor's lazy-loaded backgrounds arrive later, as a class on the top container.
			var lazyHost = element.closest('.e-con.e-parent') || element;
			if (typeof MutationObserver === 'function' && !lazyHost.classList.contains('e-lazyloaded')){
				lazyObserver = new MutationObserver(function(){
					if (lazyHost.classList.contains('e-lazyloaded')){ copyBackground(); lazyObserver.disconnect(); lazyObserver = null; }
				});
				lazyObserver.observe(lazyHost, { attributes: true, attributeFilter: ['class'] });
			}
		}
		function applyBackground(eased){
			var scale = 1 + (bgScaleMax - 1) * eased;
			var value = scale.toFixed(4) + '|' + (bgRadius * (1 - eased) / scale).toFixed(2);
			if (value === appliedBackground) return;
			appliedBackground = value;
			var parts = value.split('|');
			bgLayers.forEach(function(layer){
				layer.style.transform = 'scale(' + parts[0] + ')';
				layer.style.borderRadius = parts[1] + 'px';
			});
		}
		// The card's top on screen (its unscaled place) decides where the image sits in it.
		function applyParallax(){
			if (!bgImage || !parallaxShape) return;
			var cardTop = element.getBoundingClientRect().top + cardInset;
			var progress = Math.max(0, Math.min(1, (parallaxShape.viewport - cardTop) / (parallaxShape.viewport + cardHeight)));
			var value = (parallaxShape.from + (parallaxShape.to - parallaxShape.from) * progress).toFixed(1);
			if (value === appliedParallax) return;
			appliedParallax = value;
			bgImage.style.transform = 'translate3d(0,' + value + 'px,0)';
		}
		function clearBackground(){
			if (lazyObserver){ lazyObserver.disconnect(); lazyObserver = null; }
			bgImage = null;
			parallaxShape = null;
			bgOwnLayers.forEach(function(layer){ if (layer.parentNode) layer.parentNode.removeChild(layer); });
			bgLayers.forEach(function(layer){ layer.style.removeProperty('transform'); layer.style.removeProperty('border-radius'); });
			bgOwnLayers = [];
			bgLayers = [];
			appliedBackground = '';
			if (element.classList.contains('mauve-sticky-expand-bg-ready')){
				// Hand the background back at once, not as a .3s fade.
				element.classList.add('mauve-sticky-expand-bg-still');
				element.classList.remove('mauve-sticky-expand-bg-ready');
				void window.getComputedStyle(element).backgroundColor;
				element.classList.remove('mauve-sticky-expand-bg-still');
			}
			element.style.removeProperty('--mse-bg-w');
			element.style.removeProperty('--mse-bg-h');
		}

		function reserveRunway(){
			var parent = element.parentElement;
			if (!parent || !runway) return;

			var parentStyle = window.getComputedStyle(parent);
			horizontalRunway =
				(parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') &&
				parentStyle.flexDirection.indexOf('row') === 0;
			// Grid tracks size themselves by their items' margins, so the margin pair of
			// limitTravel() would not cancel out there.
			flowRunway = !horizontalRunway && parentStyle.display.indexOf('grid') === -1;

			runwaySpacer = document.createElement('div');
			runwaySpacer.className = 'mauve-sticky-expand-runway';
			runwaySpacer.setAttribute('aria-hidden', 'true');
			runwaySpacer.style.setProperty('pointer-events', 'none');
			runwaySpacer.style.setProperty('visibility', 'hidden');
			runwaySpacer.style.setProperty('margin', '0');

			if (horizontalRunway){
				runwaySpacer.style.setProperty('flex', '0 0 0px');
				runwaySpacer.style.setProperty('width', '0px');
				runwaySpacer.style.setProperty('height', (targetHeight + runway) + 'px');
			} else {
				runwaySpacer.style.setProperty('flex', '0 0 ' + runway + 'px');
				runwaySpacer.style.setProperty('width', '100%');
				runwaySpacer.style.setProperty('height', runway + 'px');
				runwaySpacer.style.setProperty('grid-column', '1 / -1');
			}

			element.insertAdjacentElement('afterend', runwaySpacer);
			if (!horizontalRunway){
				var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
				runwayAnchorOffset = runwaySpacer.getBoundingClientRect().top + scrollTop - element.offsetHeight - startTop;
				// Elementor flex/grid containers add their row gap between the
				// animated element and our technical spacer. Cancel that gap only;
				// preserve any intentional margin on the animated element.
				var verticalLayout =
					((parentStyle.display === 'flex' || parentStyle.display === 'inline-flex') &&
						parentStyle.flexDirection.indexOf('row') !== 0) ||
					parentStyle.display === 'grid' || parentStyle.display === 'inline-grid';
				var rowGap = verticalLayout ? parseFloat(parentStyle.rowGap) : 0;
				var removableGap = Number.isFinite(rowGap) ? Math.min(Math.max(0, runwayAnchorOffset), rowGap) : 0;
				if (removableGap > 0.01){
					gapPull = removableGap;
					runwaySpacer.style.setProperty('margin-top', (0 - removableGap).toFixed(2) + 'px');
					runwayAnchorOffset = runwaySpacer.getBoundingClientRect().top + scrollTop - element.offsetHeight - startTop;
				}
				if (flowRunway && !hasFollowingFlow()){
					tailRunway = true;
					parentMargin = { node: parent, value: parent.style.getPropertyValue('margin-bottom'), priority: parent.style.getPropertyPriority('margin-bottom') };
					parentOwnMargin = parseFloat(parentStyle.marginBottom) || 0;
				}
			}
		}

		function reset(){
			frame = 0;
			held = false;
			if (holdObserver){ holdObserver.disconnect(); holdObserver = null; }
			appliedHeight = '';
			appliedRemaining = '';
			clearRunway();
			clearBackground();
			element.classList.remove('mauve-sticky-expand-ready', 'mauve-sticky-expand-complete', 'mauve-sticky-expand-custom-start');
			properties.forEach(restoreProperty);
		}

		function releaseOverflowAncestors(){
			overflowAncestors.forEach(function(ancestor){
				var count = msStickyExpandOverflowCounts.get(ancestor) || 0;
				if (count <= 1){
					msStickyExpandOverflowCounts.delete(ancestor);
					ancestor.classList.remove('mauve-sticky-expand-overflow-guard');
				} else {
					msStickyExpandOverflowCounts.set(ancestor, count - 1);
				}
			});
			overflowAncestors = [];
		}

		function prepareOverflowAncestors(){
			var ancestor = element.parentElement;
			while (ancestor && ancestor !== document.body && ancestor !== document.documentElement){
				var count = msStickyExpandOverflowCounts.get(ancestor) || 0;
				var style = window.getComputedStyle(ancestor);
				var blocksSticky = count > 0 ||
					(style.overflowY !== 'visible' && style.overflowY !== 'clip') ||
					(style.overflowX !== 'visible' && style.overflowX !== 'clip');

				if (blocksSticky){
					msStickyExpandOverflowCounts.set(ancestor, count + 1);
					ancestor.classList.add('mauve-sticky-expand-overflow-guard');
					overflowAncestors.push(ancestor);
				}
				ancestor = ancestor.parentElement;
			}
		}

		function disabled(){ return reduced.matches || (!allowMobile && mobile.matches); }
		function requestedStartHeight(){
			var match = startHeightSetting.match(/^([0-9]+(?:\.[0-9]+)?)(vh|svh|px)$/);
			if (!match) return 0;
			var size = parseFloat(match[1]);
			var unit = match[2];
			if (unit === 'px') return size;
			if (unit === 'vh') return window.innerHeight * size / 100;

			// Let the browser resolve the small viewport unit. Browsers without
			// svh support return no measurable height, so retain the vh fallback.
			var probe = document.createElement('div');
			probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none;';
			(document.body || document.documentElement).appendChild(probe);
			var smallViewportHeight = probe.getBoundingClientRect().height;
			if (probe.parentNode) probe.parentNode.removeChild(probe);
			return (smallViewportHeight || window.innerHeight) * size / 100;
		}

		function currentStartTop(scrollTop){
			if (!horizontalRunway && runwaySpacer && runwaySpacer.isConnected){
				return runwaySpacer.getBoundingClientRect().top + scrollTop - element.offsetHeight - runwayAnchorOffset;
			}
			return startTop;
		}

		function update(){
			frame = 0;
			if (destroyed || !element.classList.contains('mauve-sticky-expand-ready')) return;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			// Content above can change height after this element was measured.
			// Anchor progress to the runway's live flow position to prevent a
			// delayed pin and a visible gap when multiple instances are present.
			var flowTop = currentStartTop(scrollTop);
			var elapsed = scrollTop - flowTop + topOffset;
			var progress = Math.max(0, Math.min(1, elapsed / expandDistance));

			if (stayExpanded && locked && flowTop - scrollTop >= window.innerHeight - 1){
				// Gone below the bottom of the screen: back to the start, out of sight.
				measure(true);
				window.msStickyExpandRefreshTriggers();
				return;
			}
			if (stayExpanded && !locked && progress >= 1) locked = true;
			var movingUp = lastScrollTop >= 0 && scrollTop < lastScrollTop - 0.5;
			lastScrollTop = scrollTop;
			if (locked){
				// Whatever the input, the travelled runway goes once the scrolling rests.
				window.clearTimeout(idleTimer);
				idleTimer = window.setTimeout(idle, 150);
			}

			var eased = locked ? 1 : progress * progress * (3 - 2 * progress);
			var height = (initialHeight + (targetHeight - initialHeight) * eased).toFixed(2) + 'px';

			if (height !== appliedHeight){
				element.style.setProperty('height', height, 'important');
				appliedHeight = height;
			}
			if (backgroundMode){ applyBackground(eased); applyParallax(); }
			var hold = flowRunway && !!runwaySpacer && (locked || elapsed >= expandDistance);
			if (hold !== held) setHeld(hold);
			if (locked && movingUp && flowRunway && !msStickyExpandTouchScrolling()){
				collapseTravelled();
				return;
			}
			if (!held) syncFollowingContent(elapsed);
			if (flowRunway){
				// The panel stays sticky throughout; see limitTravel().
				element.classList.toggle('mauve-sticky-expand-complete', elapsed >= runway);
				return;
			}
			if (elapsed >= runway){
				element.style.setProperty('position', 'relative', 'important');
				element.style.setProperty('top', runway + 'px', 'important');
				element.classList.add('mauve-sticky-expand-complete');
			} else {
				element.style.setProperty('position', 'sticky', 'important');
				element.style.setProperty('top', topOffset + 'px', 'important');
				element.classList.remove('mauve-sticky-expand-complete');
			}
		}

		function schedule(){
			if (!frame && !document.hidden) frame = window.requestAnimationFrame(update);
		}

		// The whole setup again - unless part of the runway has been taken out above the
		// screen: putting it back would push the page down under the reader (a phone's
		// toolbar resizes the window while scrolling). Then only the full height follows
		// the new window; the rest waits until the panel is below the screen.
		function measure(restart){
			if (destroyed) return;
			if (!restart && locked && collapsed > 0 && !disabled()){
				if (!backgroundMode) targetHeight = Math.max(initialHeight, Math.max(1, window.innerHeight - topOffset));
				appliedHeight = '';
				schedule();
				return;
			}
			if (frame) window.cancelAnimationFrame(frame);
			window.clearTimeout(idleTimer);
			locked = false;
			collapsed = 0;
			lastScrollTop = -1;
			runway = expandDistance + holdDistance;
			reset();
			releaseOverflowAncestors();
			if (disabled()){
				// The regular parallax stood down for this element; show its plain background.
				if (parallaxSpeed) element.classList.remove('ms-bg-parallax');
				return;
			}

			var position = window.getComputedStyle(element).position;
			if (position === 'absolute' || position === 'fixed') return;

			prepareOverflowAncestors();
			var rect = element.getBoundingClientRect();
			if (rect.height < 1){
				releaseOverflowAncestors();
				return;
			}
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			startTop = rect.top + scrollTop;
			if (Math.abs(startTop) < 2) startTop = 0;
			ownMargin = parseFloat(window.getComputedStyle(element).marginBottom) || 0;

			var customStartHeight = backgroundMode ? 0 : requestedStartHeight();
			var viewportHeight = Math.max(1, window.innerHeight - topOffset);
			var startsAtPageTop = startTop <= Math.max(80, topOffset + 2);
			if (!backgroundMode && !customStartHeight && startsAtPageTop && rect.height >= viewportHeight * 0.9){
				customStartHeight = viewportHeight * 0.78;
			}
			initialHeight = Math.max(1, Math.ceil(customStartHeight || rect.height));
			targetHeight = backgroundMode ? initialHeight : Math.max(initialHeight, viewportHeight);
			element.style.setProperty('height', initialHeight + 'px', 'important');
			reserveRunway();
			element.style.setProperty('position', 'sticky', 'important');
			element.style.setProperty('top', topOffset + 'px', 'important');
			if (customStartHeight){
				element.style.setProperty('overflow', 'hidden', 'important');
				element.classList.add('mauve-sticky-expand-custom-start');
			}
			if (backgroundMode) setupBackground();
			element.classList.add('mauve-sticky-expand-ready');
			update();
		}

		function resize(){
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(measure, 120);
		}
		function preference(){ measure(); }
		function visibility(){ if (!document.hidden) schedule(); }
		function loaded(){
			window.clearTimeout(initTimer);
			initTimer = window.setTimeout(measure, 80);
		}

		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', resize);
		window.addEventListener('load', loaded);
		document.addEventListener('visibilitychange', visibility);
		msMediaListener(reduced, 'add', preference);
		if (!allowMobile) msMediaListener(mobile, 'add', preference);

		// How far through the pinned stretch (expansion + hold) the element is, 0..1 - read by
		// Fancy Heading's Color Text on Scroll, which then colours while the section is pinned.
		// The part of the runway already taken out above (collapsed) still counts as travelled.
		element.mauveStickyExpandProgress = function(){
			if (destroyed || !element.classList.contains('mauve-sticky-expand-ready')) return null;
			var full = expandDistance + holdDistance;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var elapsed = scrollTop - currentStartTop(scrollTop) + topOffset;
			return Math.max(0, Math.min(1, (collapsed + elapsed) / full));
		};

		msStickyExpandInstances.set(element, function(){
			destroyed = true;
			delete element.mauveStickyExpandProgress;
			if (frame) window.cancelAnimationFrame(frame);
			window.clearTimeout(resizeTimer);
			window.clearTimeout(initTimer);
			window.clearTimeout(idleTimer);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', resize);
			window.removeEventListener('load', loaded);
			document.removeEventListener('visibilitychange', visibility);
			msMediaListener(reduced, 'remove', preference);
			if (!allowMobile) msMediaListener(mobile, 'remove', preference);
			reset();
			releaseOverflowAncestors();
			msStickyExpandInstances.delete(element);
		});

		measure();
		if (document.readyState === 'complete') loaded();
		if (document.fonts && document.fonts.ready){
			document.fonts.ready.then(function(){ if (!destroyed) measure(); });
		}
	}

	function msInitStickyExpand($scope){
		var scope = $scope && $scope.length ? $scope[0] : document;
		msStickyExpandInstances.forEach(function(cleanup, element){
			if (!element.isConnected || element === scope || (scope.contains && scope.contains(element))) cleanup();
		});
		$(scope).find('[data-mauve-sticky-expand]').addBack('[data-mauve-sticky-expand]').each(function(){
			msCreateStickyExpand(this);
		});
	}

	// ---------------------------------------------------------------------
	// Init
	// ---------------------------------------------------------------------
	function msInit($scope){
		msPrepare($scope || $(document));
		msInitStickyExpand($scope || $(document));
		msInitFloating($scope || $(document));
		// Refresh the cached list AFTER prepare (it marks the items) — without
		// this call $msItems stays empty and nothing ever animates.
		msRefreshItems();
		msAnimateVisible();
	}

	$(function(){
		msInit($(document));
		if (window.MutationObserver && document.body){
			new MutationObserver(function(records){
				if (!records.some(function(record){ return record.removedNodes.length; })) return;
				msFloatInstances.forEach(function(cleanup, element){ if (!element.isConnected) cleanup(); });
				msStickyExpandInstances.forEach(function(cleanup, element){ if (!element.isConnected) cleanup(); });
			}).observe(document.body, { childList: true, subtree: true });
		}
	});

	// Elementor frontend hooks
	if (window.elementorFrontend && window.elementorFrontend.hooks){
		window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope){
			msInit($scope);
		});
		window.elementorFrontend.hooks.addAction('frontend/element_ready/section', function($scope){
			msInit($scope);
		});
		window.elementorFrontend.hooks.addAction('frontend/element_ready/container', function($scope){
			msInit($scope);
		});
	}

})(jQuery);

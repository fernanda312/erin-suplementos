/**
 * Marquee Text — offscreen pause.
 *
 * The strip animates with pure CSS; this only toggles .ms-mt-paused
 * (animation-play-state: paused) while the widget is out of the viewport,
 * so a below-the-fold marquee costs nothing until it scrolls in.
 */
( function () {
	'use strict';

	var io = null;

	function getIO() {
		if ( io || ! ( 'IntersectionObserver' in window ) ) {
			return io;
		}
		io = new IntersectionObserver( function ( entries ) {
			for ( var i = 0; i < entries.length; i++ ) {
				entries[ i ].target.classList.toggle( 'ms-mt-paused', ! entries[ i ].isIntersecting );
			}
		}, { rootMargin: '80px' } );
		return io;
	}

	function boot() {
		var obs = getIO();
		if ( ! obs ) {
			return;
		}
		var els = document.querySelectorAll( '.mauve-marquee-text-container' );
		for ( var i = 0; i < els.length; i++ ) {
			if ( ! els[ i ].msMtObserved ) {
				els[ i ].msMtObserved = true;
				obs.observe( els[ i ] );
			}
		}
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}

	if ( window.jQuery ) { window.jQuery( window ).on( 'elementor/frontend/init', function () {
		if ( window.elementorFrontend && window.elementorFrontend.hooks ) {
			window.elementorFrontend.hooks.addAction( 'frontend/element_ready/mauve-marquee-text.default', boot );
		}
	} ); }
} )();

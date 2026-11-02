/*
 * MauveStudio Mega Menu Plugin
 */
(function ($) {
	$.fn.MauveStudioMegaMenu = function (custom) {
        const options = $.extend({
            events: 'mouseenter'
        }, custom);

        const cacheMenu = {};

        return this.each(function () {
            const $thisMega = $(this);
            const $megaMenuPosts = $('.mega-menu-posts', $thisMega);

            $thisMega.on(options.events + ' touchend', '.mega-link', function (event) {
                event.preventDefault();

                const $self = $(this);
                const termid = $self.data('termid');
                const itemid = $self.data('itemid');
                const tax = $self.data('tax');
                const parents = $self.parent().children('li');
                const nosubmenu = $self.parents('.has-mega-sub-menu').data('nosubmenu') || '3';

                if (!$self.hasClass('active-link')) {
                    if (typeof cacheMenu[itemid] === 'string') {
                        $megaMenuPosts.html(cacheMenu[itemid]);
                    } else {
                        const $megaContainer = $self.closest(".mega-container");
                        if ($megaContainer.hasClass('loading')) {
                            return;
                        }
                        $megaContainer.addClass('loading');

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
                                $megaContainer.removeClass('loading');
                            },
                            success: function (data) {
                                $megaMenuPosts.html(data);
                                cacheMenu[itemid] = data;
                            }
                        });
                    }
                    parents.removeClass('active-link');
                    $self.addClass('active-link');
                }
            });

            $thisMega.on('mouseenter', '> a', function () {
                const $this = $(this);
                const $closestLi = $this.closest('li');
                const $megaSubMenu = $closestLi.find('.mega-sub-menu');
                const currentMenuItem = $megaSubMenu.find('.current-menu-item.mega-link');
                const firstMegaLink = $megaSubMenu.find('.mega-link:first');

                if ($megaSubMenu.find('li').hasClass('current-menu-item')) {
                    currentMenuItem.trigger(options.events);
                } else {
                    firstMegaLink.trigger(options.events);
                }
            });
        });
    };

	$(document).ready(function() {

	
	/////////////////////////////////////////////
        // Search Form							
        /////////////////////////////////////////////
const $search = $('#search-lightbox-wrap');
    if ($search.length > 0) {
        let cache = [],
            xhr,
            $input = $search.find('#searchform input'),
            $resultWrapper = $search.find('.search-results-wrap');
        $resultWrapper.hide();

        $('.search-icon, .closeit').click(function (e) {
            e.preventDefault();
            if ($(this).hasClass('search-icon')) {
                $resultWrapper.html('');
                $input.val("");
                $resultWrapper.hide();
            } else {
                if (xhr) {
                    xhr.abort();
                }
                $input.val("");
                $resultWrapper.html('');
                $resultWrapper.hide();
            }
        });

        $resultWrapper.on('click', '.search-option-tab a', function (e) {
            e.preventDefault();
            let href = $(this).attr('href').replace('#', '');
            href = href === 'all' ? 'item' : href;
            $resultWrapper.find('.result-item').stop().fadeOut();
            if ($('#result-link-' + href).length > 0) {
                $('.view-all-button').hide();
                $('#result-link-' + href).show();
            }
            $resultWrapper.find('.result-' + href).stop().fadeIn();
            $(this).closest('ul').children('li.active').removeClass('active');
            $(this).closest('li').addClass('active');
        });

        $input.prop('autocomplete', 'off').on('keyup', function (e) {
            const set_active_tab = (index) => {
                if (index < 0) {
                    index = 0;
                }
                $resultWrapper.find('.search-option-tab li').eq(index).children('a').trigger('click');
                $resultWrapper.show();
            }

            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 8) {
                let inputValue = $.trim($(this).val());
                if (inputValue) {
                    if (cache[inputValue]) {
                        const tabIndex = $resultWrapper.find('.search-option-tab li.active').index();
                        $resultWrapper.hide();
                        set_active_tab(tabIndex);
                        return;
                    }
                    setTimeout(function () {
                        inputValue = $.trim($input.val());
                        if (xhr) {
                            xhr.abort();
                        }
                        if (!inputValue) {
                            $resultWrapper.html('');
                            return;
                        }

                        xhr = $.ajax({
                            url: msScript.ajax_url,
                            type: 'POST',
                            data: { action: 'ms_search_autocomplete', term: inputValue, security: msScript.ajax_nonce }, 
                            beforeSend: function () {
                                $search.addClass('search-loading');
                                $resultWrapper.show();
                                $resultWrapper.html('<span class="loading"></span>');
                            },
                            complete: function () {
                                $search.removeClass('search-loading');
                            },
                            success: function (resp) {
                                if (!inputValue) {
                                    $resultWrapper.html('');
                                } else if (resp) {
                                    const tabIndex = $resultWrapper.find('.search-option-tab li.active').index();
                                    $resultWrapper.hide().html(resp);
                                    set_active_tab(tabIndex);
                                    cache[inputValue] = resp;
                                }
                            }
                        });
                    }, 100);
                } else {
                    $resultWrapper.html('');
                    $resultWrapper.hide();
                }
            }
        });
    }
	
	if (typeof $.fn.MauveStudioMegaMenu !== 'undefined') {
        $('.has-sub-menu.has-mega-sub-menu').each(function () {
            const $this = $(this);
            $this.find('> ul').removeAttr('class')
                .wrap('<div class="mega-sub-menu sub-menu" />')
                .wrap('<div class="mega-container" />')
                .after('<div class="mega-menu-posts" />')
                .find('li.menu-item-type-taxonomy') // only taxonomy terms can display mega posts
                .addClass('mega-link');
        });
        $('.has-sub-menu.has-mega-sub-menu').MauveStudioMegaMenu({
            events: msScript.events
        });
    }
	
	});

})(jQuery);
; //defensive semicolon
document.addEventListener('DOMContentLoaded', (event) => {
    var variationSelects = document.querySelectorAll('.variations select');
    variationSelects.forEach(function(select) {
        select.classList.add('form-select');
    });
});
// Begin jQuery functions
jQuery(function($) {

    // Quantity buttons
    $( 'div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)' ).addClass( 'buttons_added' ).append( '<input type="button" value="+" class="plus" />' ).prepend( '<input type="button" value="-" class="minus" />' );
	
	$(document.body).on('updated_wc_div', function() {
 $( 'div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)' ).addClass( 'buttons_added' ).append( '<input type="button" value="+" class="plus" />' ).prepend( '<input type="button" value="-" class="minus" />' );
         });

$(document).on('click', '.plus, .minus', function() {
    // Find the closest .cart_item or .quantity div
    var $container = $(this).closest('.cart_item');
    if ($container.length === 0) {
        $container = $(this).closest('.quantity');
    }

    // Get the .qty input within the same container
    var $qty = $container.find('.qty'),
        currentVal = parseFloat($qty.val()),
        max = parseFloat($qty.attr('max')),
        min = parseFloat($qty.attr('min')),
        step = $qty.attr('step');

    // Format values
    if (!currentVal || currentVal === '' || currentVal === 'NaN') currentVal = 0;
    if (max === '' || max === 'NaN') max = '';
    if (min === '' || min === 'NaN') min = 0;
    if (step === 'any' || step === '' || step === undefined || parseFloat(step) === 'NaN') step = 1;

    // Change the value
    if ($(this).is('.plus')) {
        if (max && (max == currentVal || currentVal > max)) {
            $qty.val(max);
        } else {
            $qty.val(currentVal + parseFloat(step));
        }
    } else {
        if (min && (min == currentVal || currentVal < min)) {
            $qty.val(min);
        } else if (currentVal > 0) {
            $qty.val(currentVal - parseFloat(step));
        }
    }

    // Trigger change event
    $qty.trigger('change');
});





});
(function ($) {

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    
    $(document).ready(function () {

        $('body').on('wc_fragments_refreshed', function () {
            $('.is_mobile #cart-wrap').show();
        });

        /////////////////////////////////////////////
        // Add to cart ajax
        /////////////////////////////////////////////

            // Ajax add to cart
            var $loadingIcon;
            $('body').on('adding_to_cart', function (e, $button, data) {
                //add_to_cart_spark($button);
                var cart = $('#cart-wrap');
                // hide cart wrap
                cart.hide();
                // This loading icon
                $loadingIcon = $('.loading-product', $button.closest('.product')).first();
                $loadingIcon.show();
            }).on('added_to_cart removed_from_cart', function (e, fragments, cart_hash) {
                $('#cart-wrap').show();

                if (typeof $loadingIcon !== 'undefined') {
                    // Hides loading animation
                    $loadingIcon.hide(300, function () {
                        $(this).addClass('loading-done');
                    });
                    $loadingIcon
                            .fadeIn()
                            .delay(500)
                            .fadeOut(300, function () {
                                $(this).removeClass('loading-done');
                            });
                }

          
                $('form.cart').find(':submit').removeAttr('disabled');
            });

            // remove item ajax
			
            $(document).on('click', '.remove-item-js', function (e) {

                e.preventDefault();
                // AJAX add to cart request
                var $thisbutton = $(this),
                        data = {
                            action: 'theme_delete_cart',
                            remove_item: $thisbutton.attr('data-product-key')
                        };
                $thisbutton.addClass('ms_spinner');
                // Ajax action
                $.post(woocommerce_params.ajax_url, data, function (response) {

                    var this_page = window.location.toString();
                    this_page = this_page.replace('add-to-cart', 'added-to-cart');

                    fragments = response.fragments;
                    cart_hash = response.cart_hash;

                    // Block fragments class
                    if (fragments) {
                        $.each(fragments, function (key, value) {
                            $(key).addClass('updating');
                        });
                    }

                    // Block widgets and fragments
                    $('.shop_table.cart, .updating, .cart_totals, .widget_shopping_cart').fadeTo('400', '0.6').block({message: null, overlayCSS: {background: 'transparent url(' + woocommerce_params.ajax_loader_url + ') no-repeat center', backgroundSize: '16px 16px', opacity: 0.6}});

                    // Changes button classes
                    if ($thisbutton.parent().find('.added_to_cart').size() == 0)                    
					   $thisbutton.addClass('added');

                    // Replace fragments
                    if (fragments) {
                        $.each(fragments, function (key, value) {
                            $(key).replaceWith(value);
                        });
                    }

                    // Unblock
                    $('.widget_shopping_cart, .updating').stop(true).css('opacity', '1').unblock();

                    // Cart page elements
                    $('.shop_table.cart').load(this_page + ' .shop_table.cart:eq(0) > *', function () {

                        $('div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)').addClass('buttons_added').append('<input type="button" value="+" id="add1" class="plus" />').prepend('<input type="button" value="-" id="minus1" class="minus" />');

                        $('.shop_table.cart').stop(true).css('opacity', '1').unblock();

                        $('body').trigger('cart_page_refreshed');
                    });

                    $('.cart_totals').load(this_page + ' .cart_totals:eq(0) > *', function () {
                        $('.cart_totals').stop(true).css('opacity', '1').unblock();
                    });

                    // Trigger event so themes can refresh other areas
                    $('body').trigger('removed_from_cart', [fragments, cart_hash]);
                    $thisbutton.removeClass('ms_spinner');
                    if($('body.woocommerce-cart #cart-wrap').hasClass('empty-cart')){
                            $body.addClass('wc-cart-empty');
					window.location.reload();
                    }
					$('body').trigger('update_checkout');
                });
            });

        var $body = $('body');

$body.on('added_to_cart', function (e) {
    setTimeout(function() {
        $('.added_to_cart:not(.button)').addClass('button');
        $('#cart-icon-count').addClass('show_cart');
        setTimeout(function () {
            $('#cart-icon-count').removeClass('show_cart');
        }, 2000);
    }, 0); // delay in milliseconds, adjust as needed

    $body.removeClass('wc-cart-empty');
});

    });

}(jQuery));


(function ($) {
    if (msShop.ajaxenable == true) {
        $(document).on('click', '.single_add_to_cart_button', function (e) {
            var $thisbutton = $(this),
                $form = $thisbutton.closest('form.cart'),
                actionUrl = $form.attr('action');

            // Check if it's an External/Affiliate product by examining the form's action URL
            if (actionUrl && actionUrl !== window.location.href) { // Make sure the action URL is different from the current page URL
                e.preventDefault(); // Prevent the form from submitting traditionally

                // Open the product's external/affiliate URL in a new tab/window
                window.open(actionUrl, '_blank');

                return false; // Stop further execution for External/Affiliate products
            }

            // Below this point, your existing logic for AJAX add to cart continues
            e.preventDefault();
	
            var id = $thisbutton.val(),
                product_qty = $form.find('input[name=quantity]').val() || 1,
                product_id = $form.find('input[name=product_id]').val() || id,
                variation_id = $form.find('input[name=variation_id]').val() || 0;

            var attributes = {};
            $form.find('.variations select').each(function() {
                var attribute_name = $(this).data('attribute_name') || $(this).attr('name');
                attributes[attribute_name] = $(this).val();
            });

            var data = {
                action: 'theme_add_to_cart',
                product_id: product_id,
                product_sku: '',
                quantity: product_qty,
                variation_id: variation_id,
                attributes: attributes,
            };

            $(document.body).trigger('adding_to_cart', [$thisbutton, data]);

            if ($form.find('input[name=variation_id]').length > 0 && variation_id == 0) {
                return false; // If it's a variation product but no variation selected, stop execution
            }

            $.ajax({
                type: 'post',
                url: wc_add_to_cart_params.ajax_url,
                data: data,
                beforeSend: function (response) {
                    $thisbutton.removeClass('added').addClass('loading');
                },
                complete: function (response) {
                    $thisbutton.addClass('added').removeClass('loading');
                },
                success: function (response) {
                    if (response.error & response.product_url) {
                        window.location = response.product_url;
                        return;
                    } else { 
                        $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, $thisbutton]);
                    }
                    if (msShop.redirect) {
                        window.location.href = msShop.redirect;
                    }
                },
            });

            return false;
        });
    }
})(jQuery);

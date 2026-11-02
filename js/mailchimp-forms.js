"use strict";

(function($) {

    /*
     * AJAX subscription
     */
    $(document).on('submit', '.mailchimp-container form', function(e) {

        e.preventDefault();

        const form = $(this);
        const mailchimpContainer = form.closest('.mailchimp-container');
        const privacy = mailchimpContainer.find('input[name="ms-mc-consent"]');
        const loadingIcon = mailchimpContainer.find('.ajax-loader');

        // Each form carries its own redirect and consent text; mc_var holds only the
        // last form printed on the page (older cached markup has no attributes).
        const redirectAttr = mailchimpContainer.attr('data-redirect');
        const redirectUrl = redirectAttr !== undefined ? redirectAttr : (window.mc_var && mc_var.url) || '';
        const warningAttr = mailchimpContainer.attr('data-consent-warning');
        const consentWarning = warningAttr !== undefined ? warningAttr : (window.mc_var && mc_var.warning_privacy) || '';

        function hideMessage(alertMessage, callback, delay) {
            setTimeout(() => {
                alertMessage.slideUp();
                if (typeof callback === "function") {
                    callback();
                }
            }, delay || 4000);
        }

        function showAlertMessage(message, callback, delay) {
            // Text node, not HTML concatenation — the message may echo user-typed input.
            const alertMessage = $('<span class="mailchimp-alert"></span>').text(message);
            alertMessage.insertAfter(form);
            hideMessage(alertMessage, callback, delay);
        }

        // Remove messages.
        mailchimpContainer.find('.mailchimp-alert').remove();

        // Policies.
        if (privacy.length > 0 && !privacy.prop('checked')) {
            showAlertMessage(consentWarning);
            return;
        }

        if (!form.hasClass('mailchimp-loading')) {
            $.ajax({
                type: 'POST',
                url: mc_var.ajax_url,
                data: form.serialize() + '&action=ms-mailchimp&ms_mailchimp_nonce=' + mc_var.nonce,
                beforeSend: () => {
                    form.addClass('mailchimp-loading');
                    loadingIcon.fadeIn('fast');
                },
                success: (data) => {
                    form.removeClass('mailchimp-loading');
                    loadingIcon.fadeOut('fast');
                    if (data.success) {
                        // Empty the fields, so the form reads as done instead of
                        // still waiting to be sent (hidden inputs keep their values).
                        form[0].reset();
                        mailchimpContainer.find('input[name="ms-mc-consent"]').prop('checked', false);
                        if (document.activeElement && form[0].contains(document.activeElement)) {
                            document.activeElement.blur();
                        }
                        mailchimpContainer.addClass('is-subscribed');
                        // Let other parts of the page (the newsletter pop-up) know.
                        try { window.localStorage.setItem('ms_nl_subscribed', '1'); } catch (err) {}
                        form.trigger('ms-newsletter:subscribed', [data]);
                        try { document.dispatchEvent(new CustomEvent('ms-newsletter-subscribed', { detail: { form: form[0] } })); } catch (err) {}
                        if (redirectUrl) {
                            showAlertMessage(data.data, function() {
                                setTimeout(() => { window.location.href = redirectUrl; }, 80);
                            }, 1500);
                        } else {
                            showAlertMessage(data.data, null, 6000);
                        }
                    } else {
                        showAlertMessage(data.data);
                    }
                },
                error: () => {
                    showAlertMessage('Error server!');
                    loadingIcon.fadeOut('fast');
                    form.removeClass('mailchimp-loading');
                }
            });
        }
    });

})(jQuery);
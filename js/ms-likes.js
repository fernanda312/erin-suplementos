jQuery(document).ready(function ($) {
  // Cache body and ms-likes elements
  var $body = $('body');
  var $msLikes = $('.ms-likes');

  // Event delegation for click event
  $body.on('click', '.ms-likes', function () {
    var $link = $(this);
    if ($link.hasClass('active')) return false;

    var id = $link.attr('id');
    var postfix = $link.find('.ms-likes-postfix').text();

    $.post(ms_likes.ajaxurl, { action: 'ms-likes', likes_id: id, postfix: postfix }, function (data) {
      $link.html(data).addClass('active').attr('title', 'You already like this');
    });

    return false;
  });

  if ($body.hasClass('ajax-ms-likes')) {
    $msLikes.each(function () {
      var $this = $(this);
      var id = $this.attr('id');
      $this.load(ms_likes.ajaxurl, { action: 'ms-likes', post_id: id });
    });
  }
});

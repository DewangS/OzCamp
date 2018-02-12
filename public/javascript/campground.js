if (typeof jQuery !== 'undefined') {
  (function($) {

  $(document).on("click", "#groundDeleteYes", function(event){
    $('#campgoundDeleteConfirmation').modal('toggle');
    $('#delete-campground-form').submit();
  });

  $(document).on("click", "#groundDeleteNo", function(event){
    event.preventDefault();
  });

  $(document).on("click", "#commentDeleteYes", function(event){
    $('#commentDeleteConfirmation').modal('toggle');
    $('#delete-comment-form').submit();
  });

  $(document).on("click", "#commentDeleteNo", function(event){
    event.preventDefault();
  });


})(jQuery);
}

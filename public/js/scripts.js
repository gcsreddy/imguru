$(function(){
  //hide post comment
  $('#post-comment').hide();

  $('#btn-comment').on('click',function(event){
    event.preventDefault();
    $('#post-comment').show();
  });

  $('#btn-like').on('click', function(event){
    event.preventDefault();
    var imageId = $(this).data('id');
    $.post('/images/'+imageId+'/like').done(function(data){
      $('.likes-count').text(data.likes);
    });
  });

  $('#btn-delete').on('click', function(event){
    event.preventDefault();
    var $this = $(this);
    var imageId = $this.data('id');
    $.ajax({
      url:'/images/'+imageId,
      type:'DELETE'
    }).done(function (results){
      if(results){
        $this.removeClass('btn-danger').addClass('btn-success');
        $this.find('i').removeClass('fa-times').addClass('fa-check');
        $this.append('<span>Deleted!</span>');
        $this.unbind('click');
      }
    });

  });
});

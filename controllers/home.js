var sidebar = require('../helpers/sidebar');
var ImageModel = require('../models').Image;
module.exports = {
  index: function(req,res){
    // the signature is required for every route using express

    var viewModel = {
    images: []
    };

    ImageModel.find({},{},{sort :{timestamp : -1}}, function(err, images){
      if(err){
        throw err;
      }
      viewModel.images= images;
      sidebar(viewModel, function(viewModel){
        res.render('index', viewModel);
      });
    });

  }
};

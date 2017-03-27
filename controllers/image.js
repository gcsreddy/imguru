var fs  = require('fs'),
  path = require('path'),
  mime = require('mime-types'),
  md5 = require('md5');
var sidebar = require('../helpers/sidebar');
var Models = require('../models');//by convention, it goes to index.js

module.exports = {
  index :function(req, res){
    var viewModel = {
      image:{

      },
      comments :[

      ]

    };
    console.log("req.params.image_id = "+req.params.image_id);
    Models.Image.findOne({filename: {$regex:req.params.image_id}},
      function(err, image){
        if(err){
          throw err;
        }
        console.log('image = '+image);
        if(image){
          image.views = image.views + 1;
          viewModel.image = image;
          image.save();//save the incremented views count to database
          console.log('inside image');
          Models.Comment.find(
            {image_id:image._id},
            {},
            {sort :{timestamp : 1}},
            function(err, comments){
              if(err){
                console.log('there is error finding comments');
                throw err;
              }
              console.log('no error finding comments');
              viewModel.comments = comments;
              sidebar(viewModel, function(viewModel){

                res.render('image', viewModel);
              });
            }
          );
        }else{
          res.redirect('/');
        }
    });


  },
  create : function(req, res){
    var saveImage = function(){
      var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        imgUrl = '';
      for(var i=0; i < 6; i+=1) {
        imgUrl += possible.charAt(Math.floor(Math.random() *
        possible.length));
      }

      //search for an image with same url
      //if found, start over to get a new (different) url to save image
      Models.Image.find(
        {filename : imgUrl}, function(err, images){
          if(images.length >0){
            saveImage();
          }else{
            console.log(req.file);
            var tempPath = req.file.path;
            console.log("temp Path ="+tempPath);
            var ext = mime.extension(req.file.mimetype);
            console.log('ext='+ext);
            var targetPath = path.resolve('./public/upload/'+imgUrl);

            //move image from temp upload to final destination
            if(ext === 'png' ||ext === 'jpg' || ext === 'jpeg'||ext === 'gif'){
              fs.rename(tempPath,targetPath,function(err){
                if(err){
                  throw err;
                }
                var newImage = new Models.Image({
                  title:req.body.title,
                  description:req.body.description,
                  filename:imgUrl
                });

                newImage.save(function(err,image){
                  console.log('Successfully inserted image : '+image.filename);
                  res.redirect('/images/'+image.uniqueId);
                });
              });
            }else {
              //remove the file from temp dir
              fs.unlink(tempPath,function(err){
                if(err){
                  throw err;
                }
                res.status(500).json({error: 'Only image files are allowed'});
              });
            }
          }
        }
      );
    };

    saveImage();
  },
  like : function(req, res){

    Models.Image.findOne({filename: {$regex:req.params.image_id}},
      function(err, image){
        if(err){
          throw err;
        }
        console.log('image = '+image);
        if(image){
          image.likes++;
          image.save(function(err){
            if(err){
              res.json(err);
            }else{
              res.json({
                likes: image.likes
              });
            }
          });
        }
      });
  },
  comment : function(req, res){
    Models.Image.findOne({filename: {$regex:req.params.image_id}},
      function(err, image){
        if(!err && image){
          var newComment = new Models.Comment(req.body);
          newComment.gravatar = md5(newComment.email);
          newComment.image_id = image._id;
          newComment.save(function(err, comment){
            if(err){
              throw err;
            }
            res.redirect('/images/'+image.uniqueId+'#'+comment._id);
          });
        }else{
          res.redirect('/');
        }
      });
  },

  remove : function(req, res){
    Models.Image.findOne({filename:{$regex:req.params.image_id}},
    function(err, image){
      if(err){
        throw err;
      }
      fs.unlink(path.resolve('./public/upload/'+image.filename),
        function(err){
            if(err){
              throw err;
            }
            Models.Comment.remove({image_id : image._id},
              function(err){
                if(err){
                  throw err;
                }
                image.remove(function(err){
                  if(!err){
                    res.json(true);
                  }else{
                    res.json(false);
                  }
                });
              }
            );
        }
      );
    });
  }
};

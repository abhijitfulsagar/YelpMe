var express=require("express");
var router=express.Router();
var Campground=require("../models/campgrounds");
var Comment=require("../models/comments");

router.get("/index/:id/comments/new",isLoggedIn,function(req, res) {
    Campground.findById(req.params.id,function(err,foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground:foundCampground,username:req.user.username});        
        }
    });
});

router.post("/index/:id/comments",isLoggedIn,function(req,res){
    //find the correct campground
   Campground.findById(req.params.id,function(err, foundCampground) {
       if(err){
           console.log(err);
           res.redirect("/index");
       }else{
           //create a comment
           Comment.create(req.body.comment,function(err,comment){
               if(err){
                   console.log(err);
               }else{
                    //add username and id to comment
                   comment.author.id = req.user._id;
                  
                   comment.author.username = req.user.username;
                   //save comment
                    comment.save();
                   //adding the comment to comments array of that particular campground
                   foundCampground.comments.push(comment);
                   foundCampground.save();
                   //final step is to redirect
                   res.redirect("/index/"+foundCampground._id);
               }
           });
       }
   });
});

//EDIT COMMENT ROUTE
router.get("/index/:id/comments/:commentId/edit",checkCommentOwnership,function(req,res){
    Comment.findById(req.params.commentId,function(err, foundComment) {
        if(err){
          res.redirect("back");  
        }else{
            res.render("comments/edit",{campgroundId:req.params.id,comment:foundComment});        
        }
    });
    
});

//UPDATE COMMENT
router.put("/index/:id/comments/:commentId",checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.commentId,req.body.comment,function(err,foundComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/index/"+req.params.id);
        }
    });
});

//DELETE ROUTE
router.delete("/index/:id/comments/:commentId",checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.commentId,function(err){
        if(err){
            console.log(err);
            res.redirect("/index/"+req.params.id);
        }else{
            res.redirect("/index/"+req.params.id);
        }
    });
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

function checkCommentOwnership(req,res,next){
    //is user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentId,function(err,foundComment){
           if(err){
               res.redirect("/index");
            } else{
                 //does the user own the authorization to edit comment
                 if(foundComment.author.id.equals(req.user._id)){
                     next();
                 }else{
                     res.send("YOU DO NOT HAVE PERMISSION TO EDIT THE COMMENT");
                 }
            }    
        });    
    }else{
        res.redirect("back");
    }
}

module.exports=router;
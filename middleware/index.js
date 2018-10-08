var Wild = require("../model/wild");
var middlewareObj = {};

middlewareObj.checkWildOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Wild.findById(req.params.id, function(err, foundWild){
            if(err || !foundWild){
                req.flash("error", "Not found");
                res.redirect("back");
            } else {
                if(foundWild.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }

}

module.exports = middlewareObj;
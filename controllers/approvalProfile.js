var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Subsidy = require('../models/scheme');




router.get('/:id', async function (req, res) {

    try{
        var id = req.params.id;
        var user = await User.findOne({user_email: id});
        var total_subsidies_applied = user.user_applied_schemes.length;
        var total_subsidies_approved = user.user_applied_schemes.filter(scheme => scheme.status === 'Approved').length;
        var total_subsidies_rejected = user.user_applied_schemes.filter(scheme => scheme.status === 'Rejected').length;
        var total_subsidies_pending = user.user_applied_schemes.filter(scheme => scheme.status === 'Under Review').length;
        if(user){

            res.render('approvalProfile',{user: user, total_subsidies_applied: total_subsidies_applied, total_subsidies_approved: total_subsidies_approved, total_subsidies_rejected: total_subsidies_rejected, total_subsidies_pending: total_subsidies_pending});
        }
        else{
            res.status(404).json({message: "User not found"});
        }
    

    }
    catch(e){
        res.status(500).json({message: e.message});
        console.log(e);
    }
   
});

router.post('/approve', async function (req, res) {
    try{
        var id = req.body.id;
        var scheme_id = req.body.scheme_id;
        var comment = req.body.comment;
        var user = await User.findOne({user_email: id});
        var subsidy = await Subsidy.findOne({scheme_id: scheme_id});
        var scheme = user.user_applied_schemes.find(scheme => scheme.scheme_id === scheme_id);
        var subsidy_user = subsidy.applied_users.find(user => user.user_email === id);
        if(scheme){
            scheme.status = 'Approved';
            scheme.comment = comment;
        }
        else{
           return res.status(404).json({message: "Scheme not found"});
        }
        if(subsidy_user){
            subsidy_user.status = 'Approved';
            subsidy_user.comment = comment;
        }
        else{
            return res.status(404).json({message: "User not found"});
        }
        await subsidy.save();
        await user.save();
        return res.status(200).json({message: "Scheme Approved Successfully"});
    }
    catch(e){
        res.status(500).json({message: e.message});
        console.log(e);
    }
   
});

router.post('/reject', async function (req, res) {
    try{
        var id = req.body.id;
        var scheme_id = req.body.scheme_id;
        var comment = req.body.comment;
        var user = await User.findOne({user_email: id});
        var subsidy = await Subsidy.findOne({scheme_id: scheme_id});
        var scheme = user.user_applied_schemes.find(scheme => scheme.scheme_id === scheme_id);
        var subsidy_user = subsidy.applied_users.find(user => user.user_email === id);
        if(scheme){
            scheme.status = 'Rejected';
            scheme.comment = comment;
        }
        else{
           return res.status(404).json({message: "Scheme not found"});
        }
        if(subsidy_user){
            subsidy_user.status = 'Rejected';
            subsidy_user.comment = comment;
        }
        else{
            return res.status(404).json({message: "User not found"});
        }
        await subsidy.save();
        await user.save();
        return res.status(200).json({message: "Scheme Rejected Successfully"});
    }
    catch(e){
        res.status(500).json({message: e.message});
        console.log(e);
    }
   
});

router.post('/comment', async function (req, res) {
    try{
        var id = req.body.id;
        var scheme_id = req.body.scheme_id;
        var comment = req.body.comment;
        var user = await User.findOne({user_email: id});
        var subsidy = await Subsidy.findOne({scheme_id: scheme_id});
        var scheme = user.user_applied_schemes.find(scheme => scheme.scheme_id === scheme_id);
        var subsidy_user = subsidy.applied_users.find(user => user.user_email === id);
        if(scheme){
            scheme.comment = comment;
        }
        else{
           return res.status(404).json({message: "Scheme not found"});
        }
        if(subsidy_user){
            subsidy_user.comment = comment;
        }
        else{
            return res.status(404).json({message: "User not found"});
        }
        await subsidy.save();
        await user.save();
        return res.status(200).json({message: "Scheme Rejected Successfully"});
    }
    catch(e){
        res.status(500).json({message: e.message});
        console.log(e);
    }
   
});



module.exports = router;
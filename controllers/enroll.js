var express = require('express');
var router = express.Router();
var Subsidy = require('../models/scheme');




router.get('/:id', async function (req, res) {
    try{
        var id = req.params.id;
        var subsidy = await Subsidy.findOne({_id: id});
        if(subsidy){
            console.log(subsidy);
           res.render('enroll', {subsidy: subsidy});
        }
        else{
            res.status(404).json({message: "Subsidy not found"});
        }

    }
    catch(e){
        res.status(500).json({message: e.message});
        console.log(e);
    }

   
});




module.exports = router;
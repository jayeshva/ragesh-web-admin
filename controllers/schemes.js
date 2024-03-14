var express = require('express');
var router = express.Router();
var Subsidy = require('../models/scheme');



router.get('/', function (req, res) {
    var data = {};
    res.render('schemes');
});

// Function to add a new scheme
router.post('/addScheme', async (req, res) => {
    try {
        const newSchemeData = {
            scheme_id: req.body.scheme_id,
            scheme_name: req.body.scheme_name,
            scheme_category: req.body.scheme_category,
            scheme_description: req.body.scheme_description,
            last_date: req.body.last_date,
        };
        const newScheme = new Subsidy(newSchemeData);
        const savedScheme = await newScheme.save();
       res.status(200).json({ message: "Scheme added successfully", data: savedScheme});
    } catch (error) {
        res.status(500).json({ message:"Error Occured While Adding Scheme",error: error.message });
    }
});

// Function to delete a scheme by scheme_id
router.delete('/deleteScheme/:schemeId', async (req, res) => {
    try {
        const schemeId = req.params.schemeId;
        const deletedScheme = await Subsidy.findOneAndDelete({ scheme_id: schemeId });
        if (!deletedScheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        res.status(200).json({ message: "Scheme deleted successfully", data: deletedScheme });
    } catch (error) {
        res.status(500).json({message:"Error Occured While Deleting Scheme", error: error.message});
    }
});

// Function to edit a scheme by scheme_id
router.put('/editScheme/:schemeId', async (req, res) => {
    try {
        const schemeId = req.params.schemeId;
        const editedScheme = await Subsidy.findOne({ scheme_id: schemeId });
        if (!editedScheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        editedScheme.scheme_name = req.body.scheme_name;
        editedScheme.scheme_category = req.body.scheme_category;
        editedScheme.scheme_description = req.body.scheme_description;
        editedScheme.last_date = req.body.last_date;
        await editedScheme.save();
        res.status(200).json({ message: "Scheme edited successfully", data: editedScheme });
    } catch (error) {
        res.status(500).json({message:"Error Occurred in Editing Scheme",error: error.message });
    }
});



module.exports = router;
var express = require('express');
var router = express.Router();
var Subsidy = require('../models/scheme');
const { DateTime } = require('luxon');



router.get('/', async (req, res) => {
    var schemeData = await Subsidy.find({}).sort({ created_at: -1 });
    schemeData.forEach(scheme => {
        scheme.approved_count = scheme.applied_users.filter(user => user.status === 'Approved').length;
        scheme.rejected_count = scheme.applied_users.filter(user => user.status === 'Rejected').length;
        scheme.pending_count = scheme.applied_users.filter(user => user.status === 'Under Review').length;
        scheme.total_count = scheme.applied_users.length;
        var last_date = new Date(scheme.last_date).toLocaleDateString('en-GB',{ day: '2-digit', month: '2-digit', year: 'numeric' }).toString();
        var created_at = new Date(scheme.created_at).toLocaleDateString('en-GB',{ day: '2-digit', month: '2-digit', year: 'numeric' }).toString();
        scheme.slast_date = last_date ;
        scheme.screated_at = created_at;


        
    });
    
    res.render('schemes', { schemes: schemeData });
});


router.get('/getScheme', async function (req, res) {
    // Fetch all schemes from the database from latest to oldest
    try {
        var schemeData = await Subsidy.find({}).sort({ created_at: -1 });
        schemeData.forEach(scheme => {
            scheme.approved_count = scheme.applied_users.filter(user => user.status === 'Approved').length;
            scheme.rejected_count = scheme.applied_users.filter(user => user.status === 'Rejected').length;
            scheme.pending_count = scheme.applied_users.filter(user => user.status === 'Under Review').length;
            scheme.total_count = scheme.applied_users.length;
            var last_date = new Date(scheme.last_date).toLocaleDateString('en-GB',{ day: '2-digit', month: '2-digit', year: 'numeric' }).toString();
            var created_at = new Date(scheme.created_at).toLocaleDateString('en-GB',{ day: '2-digit', month: '2-digit', year: 'numeric' }).toString();
            scheme.slast_date = last_date ;
            scheme.screated_at = created_at;
   
        });

       
        res.status(200).json({ message: "Schemes fetched successfully", data: schemeData });
    }
    catch (error) {
        res.status(500).json({ message: "Error Occured While Fetching Schemes", error: error.message });
    }


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
        res.status(200).json({ message: "Scheme added successfully", data: savedScheme });
    } catch (error) {
        res.status(500).json({ message: "Error Occured While Adding Scheme", error: error.message });
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
        res.status(500).json({ message: "Error Occured While Deleting Scheme", error: error.message });
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
        res.status(500).json({ message: "Error Occurred in Editing Scheme", error: error.message });
    }
});



module.exports = router;
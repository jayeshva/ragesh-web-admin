var express = require('express');
var router = express.Router();  
const Feed = require('../models/feeds');


router.get('/', function (req, res) {
    res.render('feeds');
});

router.post('/addFeed', async (req, res) => {
    try {
        const { feed_img, feed_name, feed_description, feed_source_url } = req.body;
        
        // Create a new feed object
        const newFeed = new Feed({
            feed_img,
            feed_name,
            feed_description,
            feed_source_url
        });

        // Save the new feed to the database
        const savedFeed = await newFeed.save();

        // Send response
        res.status(200).json({ message: "Feed added successfully", data: savedFeed });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while adding feed", error: error.message });
    }
});

router.delete('/deleteFeed/:feedId', async (req, res) => {
    try {
        const feedId = req.params.feedId;
        // Find the feed by ID and delete it
        const deletedFeed = await Feed.findByIdAndDelete(feedId);
        if (!deletedFeed) {
            return res.status(404).json({ message: "Feed not found" });
        }
        res.status(200).json({ message: "Feed deleted successfully", data: deletedFeed });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while deleting feed", error: error.message });
    }
});

// Route to edit a feed by ID
router.put('/editFeed/:feedId', async (req, res) => {
    try {
        const feedId = req.params.feedId;
        // Find the feed by ID and update it with the new data
        const updatedFeed = await Feed.findOne({ _id: feedId });
        if (!updatedFeed) {
            return res.status(404).json({ message: "Feed not found" });
        }
        updatedFeed.feed_img = req.body.feed_img;
        updatedFeed.feed_name = req.body.feed_name;
        updatedFeed.feed_description = req.body.feed_description;
        updatedFeed.feed_source_url = req.body.feed_source_url;
        await updatedFeed.save();

        res.status(200).json({ message: "Feed updated successfully", data: updatedFeed });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while updating feed", error: error.message });
    }
});



module.exports = router;
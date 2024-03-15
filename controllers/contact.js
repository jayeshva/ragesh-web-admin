var express = require('express');
var router = express.Router();
const Contact = require('../models/contact');



router.get('/', function (req, res) {
    res.render('contacts');
});

// Function to get all contacts
router.get('/getContacts', async (req, res) => {
    try {
        const contacts = await Contact.find({});
        res.status(200).json({ message: "Contacts fetched successfully", data: contacts });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while fetching contacts", error: error.message });
    }
});



// Function to add a new contact
router.post('/addContact', async (req, res) => {
    try {
        const newContactData = {
            contact_img: req.body.contact_img,
            contact_name: req.body.contact_name,
            contact_email: req.body.contact_email,
            contact_mobile: req.body.contact_mobile,
            contact_organisation: req.body.contact_organisation,
            contact_locality: req.body.contact_locality
        };
        const newContact = new Contact(newContactData);
        const savedContact = await newContact.save();
        res.status(200).json({ message: "Contact added successfully", data: savedContact });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while adding contact", error: error.message });
    }
});

// Function to delete a contact by contact_id
router.delete('/deleteContact/:contactId', async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const deletedContact = await Contact.findOneAndDelete({ _id: contactId });
        if (!deletedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.status(200).json({ message: "Contact deleted successfully", data: deletedContact });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while deleting contact", error: error.message });
    }
});

// Function to edit a contact by contact_id
router.put('/editContact/:contactId', async (req, res) => {
    try {
        const contactId = req.params.contactId;
        const updatedData = req.body;
        const editedContact = await Contact.findOne({ _id: contactId });
        if (!editedContact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        editedContact.contact_img = updatedData.contact_img;
        editedContact.contact_name = updatedData.contact_name;
        editedContact.contact_email = updatedData.contact_email;
        editedContact.contact_mobile = updatedData.contact_mobile;
        editedContact.contact_organisation = updatedData.contact_organisation;
        editedContact.contact_locality = updatedData.contact_locality;
        const savedContact = await editedContact.save();

        res.status(200).json({ message: "Contact edited successfully", data: savedContact });
    } catch (error) {
        res.status(500).json({ message: "Error occurred while editing contact", error: error.message });
    }
});


module.exports = router;
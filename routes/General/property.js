const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Property = require("../../models/general/Property");
const fetchUser = require("../../middleware/fetchUser");
const router = express.Router();

// ROUTE 0: Get a single property by ID [/api/property/fetchproperty/:id]
router.get("/fetchproperty/:id", fetchUser, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });  // Use return
      }
  
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found." });  // Use return
      }
  
      return res.json(property);  // Return response
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal server error.");  // Ensure return on error
    }
  });
  

// ROUTE 1: Get all properties [/api/property/fetchallproperties]
router.get(
  "/fetchallproperties",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const properties = await Property.find();
      res.json(properties);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2.1: Add a new property [/api/property/addproperty]
router.post(
  "/addproperty",
  fetchUser,
  [
    query("userId", "User ID is required").exists(),
    body("customerName", "Customer Name is required").exists(),
    body("customerNumber", "Customer Number is required").exists(),
    body("state", "State is required").exists(),
    body("city", "City is required").exists(),
    body("builder", "Builder is required").exists(),
    body("project", "Project is required").exists(),
    body("houseNumber", "House number is required").exists(),
    body("floorNumber", "Floor number is required").exists(),
    body("tower", "Tower is required").exists(),
    body("unit", "Unit is required").exists(),
    body("size", "Size is required").exists(),
    body("nature", "Nature is required").exists(),
    body("status", "Status is required").exists(),
    body("documents.type", "Document type is required").exists(),
    body("documents.files", "Document name is required").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        state, city, builder, project, customerName, customerNumber, houseNumber,
        floorNumber, tower, isDeleted, unit, size, nature, status, documents, applicationStatus, addedBy
      } = req.body;

      const property = new Property({
        customerName, customerNumber, state, city, builder, project,
        houseNumber, floorNumber, tower, unit, size, nature, status,
        documents, isDeleted: isDeleted || "no",
        applicationStatus: applicationStatus || "under-review",
        addedBy: addedBy || "Unknown",
      });

      const savedProperty = await property.save();
      res.json(savedProperty);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2.2 aDD NEW PROPERTY for guest user! with 7 fields
// ROUTE 2: Add a new property [/api/property/addpropertyForGuest]
router.post(
  "/addpropertyForGuest",
  fetchUser,
  [
    query("userId", "User ID is required").exists(),
    body("state", "State is required").exists(),
    body("city", "City is required").exists(),
    body("builder", "Builder is required").exists(),
    body("project", "Project is required").exists(),
    body("houseNumber", "House number is required").exists(),
    body("floorNumber", "Floor number is required").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) { 
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        state, city, builder, project, houseNumber,
        floorNumber
      } = req.body;

      const property = new Property({
        customerName : "", customerNumber : "", state, city, builder, project,
        houseNumber, floorNumber, tower : "", unit : "", size : "", nature : "", status : "",
        documents : {type : "", files : []}, isDeleted:"no",
        applicationStatus: "more-info-required",
        addedBy: req.query.userId ,
      });

      const savedProperty = await property.save();
      res.json(savedProperty);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 3: Update an existing property by ID [/api/property/updateproperty/:id]
router.put(
    "/updateproperty/:id",
    fetchUser,
    [query("userId", "User ID is required").exists()],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });  // Ensure return here
        }
  
        const {
          customerName, customerNumber, state, city, builder, project, houseNumber,
          floorNumber, tower, isDeleted, unit, size, nature, status, documents,
          applicationStatus, addedBy, moreInfoReason
        } = req.body;
  
        const updatedProperty = {};
        if (state) updatedProperty.state = state;
        if (city) updatedProperty.city = city;
        if (builder) updatedProperty.builder = builder;
        if (project) updatedProperty.project = project;
        if (tower) updatedProperty.tower = tower;
        if (unit) updatedProperty.unit = unit;
        if (size) updatedProperty.size = size;
        if (nature) updatedProperty.nature = nature;
        if (status) updatedProperty.status = status;
        if (customerName) updatedProperty.customerName = customerName;
        if (customerNumber) updatedProperty.customerNumber = customerNumber;
        if (isDeleted) updatedProperty.isDeleted = isDeleted;
        if (houseNumber) updatedProperty.houseNumber = houseNumber;
        if (floorNumber) updatedProperty.floorNumber = floorNumber;
        if (documents) updatedProperty.documents = documents;
        if (applicationStatus) updatedProperty.applicationStatus = applicationStatus;
        if (moreInfoReason) updatedProperty.moreInfoReason = moreInfoReason;
        if (addedBy) updatedProperty.addedBy = addedBy;
  
        const property = await Property.findById(req.params.id);
        if (!property) {
          return res.status(404).json({ error: "Property not found." });  // Ensure return here
        }
  
        const propertyUpdate = await Property.findByIdAndUpdate(
          req.params.id, { $set: updatedProperty }, { new: true }
        );
        
        return res.json(propertyUpdate);  // Make sure to use return here too
  
      } catch (error) {
        console.error(error.message);
        return res.status(500).send("Internal server error.");  // Return on error
      }
    }
  );
  

// ROUTE 4: Delete an existing property by ID [/api/property/deleteproperty/:id]
router.delete(
  "/deleteproperty/:id",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found." });
      }

      const deletedProperty = await Property.findByIdAndDelete(req.params.id);
      res.json({ Success: "Property has been deleted.", deletedProperty });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
); 

// ROUTE 5: Get all properties for a user [/api/property/fetchallproperties]
router.get(
  "/fetchallpropertiesForUser",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const properties = await Property.find({addedBy : req.query.userId});
      if(properties){
        res.json(properties);
      }else{
        res.status(200).json({success : false, message : "No properties found."});
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 6: Get all approved properties for a user [/api/property/fetchallproperties]
router.get(
  "/fetchallAprovedPropertiesForUser",
  fetchUser,
  [query("userId", "User ID is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const properties = await Property.find({
        addedBy : req.query.userId,
        applicationStatus : "approved"

      });
      if(properties){
        res.json(properties);
      }else{
        res.status(200).json({success : false, message : "No properties found."});
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);



module.exports = router;

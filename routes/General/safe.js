const express = require("express");
const fetchUser = require("../../middleware/fetchUser");
const { body, validationResult, param, query } = require("express-validator");
const Documents = require("../../models/general/Documents");
const Property = require("../../models/general/Property");
const router = express.Router();

// ---------------------------------------------------------------
// ROUTES FOR ADMINS

// ROUTE -1 Fetch all safes
// ROUTE 1: GET all documents for a specific propertyId
router.get(
    "/adminFetchAllSafes/",
    fetchUser,
    [
      query("userId", "userId is required").exists(),
    ],
    async (req, res) => {
      try {
  
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        } else {
          // Find all documents related to a propertyId
          const documents = await Documents.find();
  
          if (!documents) {
            return res
              .status(404)
              .json({ error: "No documents found for this property." });
          } else {
            res.json({ success: true, data: documents });
          }
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );
  



// Route 0: Get a specific document from a specific category (like layoutPlan) by propertyId and document _id
router.get(
  "/adminFetchDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    try {
      const { propertyId, category, documentId } = req.params;
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Find the document within the specified category
        const documentData = await Documents.findOne(
          { propertyId, [`${category}._id`]: documentId },
          { [`${category}.$`]: 1 } // Only return the specific document in the category
        );

        if (!documentData) {
          return res.status(404).json({ error: "No documents found." });
        } else {
          res.json({ success: true, data: documentData }); // Return the found document
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 1: GET all documents for a specific propertyId
router.get(
  "/adminFetchAllDocuments/:propertyId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
  ],
  async (req, res) => {
    try {
      const { propertyId } = req.params;

      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Find all documents related to a propertyId
        const documents = await Documents.findOne({ propertyId });

        if (!documents) {
          return res
            .status(200)
            .json({success : false, error: "No documents found for this property." });
        } else {
          res.json({ success: true, data: documents });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 2: POST to add a new document to a specific category for a propertyId
router.post(
  "/adminAddDocument/:propertyId/:category",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    body("name", "Please enter a name").exists(),
    body("path", "Please provide a valid path").exists(),
    body("addedBy", "Please specify who added the document").optional(),
  ],
  async (req, res) => {
    try {
      const { propertyId, category } = req.params;
      const { name, path, addedBy } = req.body;

      // Validate request body and query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Find the document by propertyId
        let document = await Documents.findOne({ propertyId });

        // If no document exists, create one
        if (!document) {
          document = new Documents({ propertyId });
        } else {
          // Add new document to the specified category
          document[category].push({
            name,
            path,
            addedBy: addedBy || "customer",
          });

          // Save the updated document
          const updatedDocument = await document.save();
          if (updatedDocument) {
            res.json({ success: true, message: "Document updated." });
          } else {
            res.json({ success: false, message: "Some error occured." });
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 3: PUT to update an existing document by category and document _id
router.put(
  "/adminUpdateDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    const { propertyId, category, documentId } = req.params;
    const { name, path, addedBy } = req.body;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Find and update the document by category and document _id
        const updatedDocument = await Documents.findOneAndUpdate(
          { propertyId, [`${category}._id`]: documentId },
          {
            $set: {
              [`${category}.$.name`]: name,
              [`${category}.$.path`]: path,
              [`${category}.$.addedBy`]: addedBy,
            },
          },
          { new: true }
        );

        if (!updatedDocument) {
          return res.status(404).json({ error: "Document not found." });
        } else {
          res.json({ success: true, message: "Document updated." });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 4: DELETE an existing document by category and document _id
router.delete(
  "/adminDeleteDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    const { propertyId, category, documentId } = req.params;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Remove the document from the specific category
        const updatedDocument = await Documents.findOneAndUpdate(
          { propertyId },
          { $pull: { [category]: { _id: documentId } } },
          { new: true }
        );

        if (!updatedDocument) {
          return res
            .status(404)
            .json({ error: "Document not found or already deleted." });
        } else {
          res.json({ success: true, message: "Document Deleted." });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 5: DELETE all documents by propertyId (delete entire safe)
router.delete(
  "/adminDeleteAllDocuments/:safeId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("safeId", "Safe id is required.").exists(),
  ],
  async (req, res) => {
    const { safeId } = req.params;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Remove the document from the specific category
        const deletedDocument = await Documents.findByIdAndDelete(safeId);

        if (!deletedDocument) {
          return res
            .status(200)
            .json({ success: false, message: "Safe not found." });
        } else {
          res.json({ success: true, message: "Safe has been deleted." });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 6: Add a new safe
router.post(
  "/adminAddNewSafe",
  fetchUser,

  [
    query("userId", "userId is required").exists(),
    body("propertyId", "PropertyId id is required.").exists(),
  ],

  async (req, res) => {
    const { propertyId } = req.body;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        let document = await Documents.findOne({ propertyId });

        if (!document) {
          document = new Documents(req.body);
          // Save the updated document
          await document.save();
          res.json({ success: true, message: "Safe created!" });
        } else {
          res
            .status(200)
            .json({ success: false, message: "Safe already exists." });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE 7: get doc of a category
router.get(
    "/adminFetchCategoryDocuments/:propertyId/:category",
    fetchUser,
    [
      query("userId", "userId is required").exists(),
      param("propertyId", "propertyId id is required.").exists(),
      param("category", "category is required.").exists(),
    ],
    async (req, res) => {
      try {
        const { propertyId, category } = req.params;

  
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        } else {
          // Fetch all documents within the specified category for the property
          const documents = await Documents.findOne(
            { propertyId },
            { [category]: 1 } // Select only the documents in the specified category
          );

          if (!documents || !documents[category].length) {
            return res.status(200).json({
              success: false,
              message: `No documents found in category '${category}'.`,
            });
          } else {
            // Return the found documents
            res.json({ success: true, data: documents[category] });
          }
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error.");
      }
    }
  );




// ---------------------------------------------------------------
// ROUTES FOR USERS
// ROUTE: USER 1-- Get a specific document from a specific category (like layoutPlan) by propertyId and document _id
router.get(
  "/fetchDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    try {
      const { propertyId, category, documentId } = req.params;
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const propertyData = await Property.findById(propertyId);

        if (propertyData) {
          if (propertyData.addedBy === userId) {
            //-----
            // Find the document within the specified category
            const documentData = await Documents.findOne(
              { propertyId, [`${category}._id`]: documentId },
              { [`${category}.$`]: 1 } // Only return the specific document in the category
            );

            if (!documentData) {
              return res.status(404).json({ error: "No documents found." });
            } else {
              res.json({ success: true, data: documentData }); // Return the found document
            }
          } else {
            res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "No property exists with given ID.",
          });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE: USER 2-- GET all documents for a specific propertyId
router.get(
  "/fetchAllDocuments/:propertyId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
  ],
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { userId } = req.query;

      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const propertyData = await Property.findById(propertyId);

        if (propertyData) {
          if (propertyData.addedBy === userId) {
            //-------
            // Find all documents related to a propertyId
            const documents = await Documents.findOne({ propertyId });

            if (!documents) {
              return res
                .status(404)
                .json({ error: "No documents found for this property." });
            } else {
              res.json({ success: true, data: documents });
            }
          } else {
            res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "No property exists with given ID.",
          });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  } 
);

// ROUTE: USER 3-- Get all documents for a specific category by propertyId and category
router.get(
  "/fetchCategoryDocuments/:propertyId/:category",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category is required.").exists(),
  ],
  async (req, res) => {
    try {
      const { propertyId, category } = req.params;
      const { userId } = req.query;

      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        // Fetch the property to check access rights
        const propertyData = await Property.findById(propertyId);
        if (!propertyData) {
          return res.status(200).json({
            success: false,
            message: "No property exists with given ID.",
          });
        } else {
          // Verify if the user has access to this property
          if (propertyData.addedBy !== userId) {
            return res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          } else {
            // Fetch all documents within the specified category for the property
            const documents = await Documents.findOne(
              { propertyId },
              { [category]: 1 } // Select only the documents in the specified category
            );

            if (!documents || !documents[category].length) {
              return res.status(200).json({
                success: false,
                message: `No documents found in category '${category}'.`,
              });
            } else {
              // Return the found documents
              res.json({ success: true, data: documents[category] });
            }
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE: USER 4--: POST to add a new document to a specific category for a propertyId
router.post(
  "/addDocument/:propertyId/:category",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    body("name", "Please enter a name").exists(),
    body("path", "Please provide a valid path").exists(),
    body("addedBy", "Please specify who added the document").optional(),
  ],
  async (req, res) => {
    try {
      const { propertyId, category } = req.params;
      const { name, path, addedBy } = req.body;
      const { userId } = req.query;

      // Validate request body and query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const propertyData = await Property.findById(propertyId);

        if (propertyData) {
          if (propertyData.addedBy === userId) {
            //-----
            // Find the document by propertyId
            let document = await Documents.findOne({ propertyId });

            // If no document exists, create one
            if (!document) {
              document = new Documents({ propertyId });
            } else {
              // Add new document to the specified category
              document[category].push({
                name,
                path,
                addedBy: addedBy || "iProp91 Customer",
              });

              // Save the updated document
              const updatedDocument = await document.save();
              if (updatedDocument) {
                res.json({ success: true, message: "Document updated." });
              } else {
                res.json({ success: false, message: "Some error occured." });
              }
            }
          } else {
            res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "No property exists with given ID.",
          });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE: USER 5-- PUT to update an existing document by category and document _id
router.put(
  "/updateDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    const { propertyId, category, documentId } = req.params;
    const { name, path, addedBy } = req.body;
    const { userId } = req.query;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const propertyData = await Property.findById(propertyId);

        if (propertyData) {
          if (propertyData.addedBy === userId) {
            //----
            // Find and update the document by category and document _id
            const updatedDocument = await Documents.findOneAndUpdate(
              { propertyId, [`${category}._id`]: documentId },
              {
                $set: {
                  [`${category}.$.name`]: name,
                  [`${category}.$.path`]: path,
                  [`${category}.$.addedBy`]: addedBy,
                },
              },
              { new: true }
            );

            if (!updatedDocument) {
              return res.status(404).json({ error: "Document not found." });
            } else {
              res.json({ success: true, message: "Document updated." });
            }
          } else {
            res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "No property exists with given ID.",
          });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// ROUTE: USER 6-- DELETE an existing document by category and document _id
router.delete(
  "/deleteDocument/:propertyId/:category/:documentId",
  fetchUser,
  [
    query("userId", "userId is required").exists(),
    param("propertyId", "propertyId id is required.").exists(),
    param("category", "category id is required.").exists(),
    param("documentId", "documentId id is required.").exists(),
  ],
  async (req, res) => {
    const { propertyId, category, documentId } = req.params;
    const { userId } = req.query;

    try {
      // Validate query parameters
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const propertyData = await Property.findById(propertyId);

        if (propertyData) {
          if (propertyData.addedBy === userId) {
            //---
            // Remove the document from the specific category
            const updatedDocument = await Documents.findOneAndUpdate(
              { propertyId },
              { $pull: { [category]: { _id: documentId } } },
              { new: true }
            );

            if (!updatedDocument) {
              return res
                .status(404)
                .json({ error: "Document not found or already deleted." });
            } else {
              res.json({ success: true, message: "Document Deleted." });
            }
          } else {
            res.status(200).json({
              success: false,
              message: "You don't have access to this property.",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "No property exists with given ID.",
          });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

module.exports = router;

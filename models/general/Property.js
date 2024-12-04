    const mongoose = require("mongoose");
    const collection = "property";
    const counterName = "IPP"

// counter schema
const propertyCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    seq: { type: Number, default: 0 }      
  });
  
  const Counter = mongoose.model('property-counter', propertyCounterSchema);

  // function using counter schema
const getNextSequence = async (name) => {
    const counter = await Counter.findByIdAndUpdate(
      { _id: name }, 
      { $inc: { seq: 1 } }, // Increment sequence by 1
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    return counter.seq;
  };



    const propertySchema = new mongoose.Schema({

        _id: { type: String },

        customerName : {  //name of user
            type : String,
            default : "iProp user",
        },
        customerNumber : {  //name of user
            type : String,
        },
        
        state : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        builder : {
            type : String,
            required : true
        },
        project : {
            type : String,
            required : true
        },
        houseNumber : {
            type : String,
            required : true
        },
        floorNumber : {
            type : String,
            required : true
        },
        tower : {
            type : String,
  
        },
        unit : {
            type : String,

        }, 
        size : {
            type : String,
        },
    
        nature : { // residential or commercial
            type : String,
        },
        status : { // "under-construction"" or "completed"
            type : String,
        },

        documents : {
            type : {
                type : String,
            },
            files : {
                type : [String],
            },   
        },

        applicationStatus : {  // "under-review", "approved", "rejected" or "more-info-required"
            type : String,
            default : "under-review"
        },
        moreInfoReason : { 
            type : String,
            default : ""
        },
        addedBy : { // customer id goes here
            type : String,
            default : "admin"
        },
        isDeleted : { // yes or no
            type : String,
            default : "no"
        },
    },{ timestamps: true })

    propertySchema.pre('save', async function (next) {
        if (this.isNew) {
          const seqNumber = await getNextSequence(counterName);
          this._id = `IPP${String(seqNumber).padStart(5, '0')}`; // Custom format: IPU0001, IPU0002, etc.
        }
        next();
      });

    const model = mongoose.model(collection,propertySchema);

    module.exports = model;
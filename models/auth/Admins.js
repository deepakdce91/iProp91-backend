const mongoose = require("mongoose");
const collection = "admins";
const counterName = "IPA"

// counter schema
const adminCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    seq: { type: Number, default: 0 }      
  });
  
  const Counter = mongoose.model('admin-counter', adminCounterSchema);

  // function using counter schema
const getNextSequence = async (name) => {
    const counter = await Counter.findByIdAndUpdate(
      { _id: name }, 
      { $inc: { seq: 1 } }, 
      { new: true, upsert: true } 
    );
    return counter.seq;
  };



const adminSchema = new mongoose.Schema({
    _id: { type: String },
    name : {
        type : String,
        default : "iProp91 Admin"
    },
    email : {
        type : String,
        unique : true,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
},{ timestamps: true });

adminSchema.pre('save', async function (next) {
    if (this.isNew) {
      const seqNumber = await getNextSequence(counterName);
      this._id = `IPA${String(seqNumber).padStart(3, '0')}`; 
    }
    next();
  });

const Admin = mongoose.model(collection, adminSchema);

module.exports = Admin;

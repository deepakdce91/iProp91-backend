const mongoose = require("mongoose");
const collection = "users";
const counterName = "IPU"

// counter schema
const userCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, 
    seq: { type: Number, default: 0 }      
  });
  
  const Counter = mongoose.model('user-counter', userCounterSchema);

  // function using counter schema
const getNextSequence = async (name) => {
    const counter = await Counter.findByIdAndUpdate(
      { _id: name }, 
      { $inc: { seq: 1 } }, // Increment sequence by 1
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    return counter.seq;
  };



const userSchema = new mongoose.Schema({
    _id: { type: String },
    name : {
        type : String,
        default : "iProp91 User"
    },
    phone :{
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        default : "",
    },
    profilePicture : {
        type : String,
        default : "",
    },
    password : {
        type : String,
        default : ""
    },
    lastLogin : {
        type : Date,
        default : new Date()
    },
    suspended :{
        type : String,  
        default : "false"
    },
    fraud :{
        type : String,  
        default : "false"
    }
},{ timestamps: true });

userSchema.pre('save', async function (next) {
    if (this.isNew) {
      const seqNumber = await getNextSequence(counterName);
      this._id = `IPU${String(seqNumber).padStart(4, '0')}`; // Custom format: IPU0001, IPU0002, etc.
    }
    next();
  });

const User = mongoose.model(collection, userSchema);

module.exports = User;

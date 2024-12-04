const mongoose = require("mongoose");
const collection = "documents";
const counterName = "IPS"

// counter schema
const documentSafeCounterSchema = new mongoose.Schema({
_id: { type: String, required: true }, 
seq: { type: Number, default: 0 }      
});

const Counter = mongoose.model('documentSafe-counter', documentSafeCounterSchema);

// function using counter schema
const getNextSequence = async (name) => {
const counter = await Counter.findByIdAndUpdate(
  { _id: name }, 
  { $inc: { seq: 1 } }, // Increment sequence by 1
  { new: true, upsert: true } // Create the counter if it doesn't exist
);
return counter.seq;
};


// Reusable sub-schema
const documentSchema = new mongoose.Schema({
    name: { type: String },
    path: { type: String },
    addedBy: { type: String, default: "admin" }
}, { _id: true, timestamps: true  });

const docSafeSchema = new mongoose.Schema({
    _id: { type: String },
    propertyId: {
        type: String,
        required: true,
        unique : true
    },
    layoutPlan: [documentSchema],
    demarcationCumZoningPlan: [documentSchema],
    sitePlan: [documentSchema],
    buildingPlan: [documentSchema],
    floorPlan: [documentSchema],
    reraApplication: [documentSchema],
    projectBrochure: [documentSchema],
    advertisementMaterialByBulder: [documentSchema],
    agreementToSale: [documentSchema],
    builderBuyerAgreement: [documentSchema],
    demandLetter: [documentSchema],
    paymentPlan: [documentSchema],
    specificationsAmenitiesAndFacilities: [documentSchema],
    occupationCertificate: [documentSchema],
    saleDeed: [documentSchema],
    maintenenceAgreement: [documentSchema],
    maintenencePaymentReceipts: [documentSchema],
    maintenenceInvoice: [documentSchema],
    bill: [documentSchema],
    warrantyDocuments: [documentSchema],
    amcs: [documentSchema],
    electricityOrMaintenenceBills: [documentSchema],
    rwaRulesAndRegulations: [documentSchema],
    other: [documentSchema],
    loanAgreement: [documentSchema],
    paymentPlanLoan: [documentSchema],
    rentAgreementOrExtensionsOrAmendmentAgreement: [documentSchema],
    tenantKycDocuments: [documentSchema],
    rentReceipt: [documentSchema],
    tdsPaymentChalaan: [documentSchema],
    handbook: [documentSchema],
    loanHandbook: [documentSchema],
    keyTermRentalHandbook: [documentSchema],
    recentUpdates: [documentSchema],
    allotmentLetter: [documentSchema],
    reraApproval: [documentSchema]
}, { timestamps: true });

docSafeSchema.pre('save', async function (next) {
    if (this.isNew) {
      const seqNumber = await getNextSequence(counterName);
      this._id = `IPS${String(seqNumber).padStart(5, '0')}`; // Custom format
    }
    next();
  });

const model = mongoose.model(collection, docSafeSchema);

module.exports = model;

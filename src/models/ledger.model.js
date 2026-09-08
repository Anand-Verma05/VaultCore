const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account is required'],
        index: true,
        immutable: true
    },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be greater than 0'],
        immutable: true
    },

    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction is required'],
        index: true,
        immutable: true
    },

    type: {
        type: String,
        enum: {
            values: ['CREDIT', 'DEBIT'],
            message: 'Type must be either CREDIT or DEBIT'
        },
        required: [true, 'Type is required'],
        immutable: true
    }
}, {
    timestamps: true
});

function preventLedgerModification() {
    throw new Error('Ledger entries cannot be modified or deleted');
}

LedgerSchema.pre('updateOne', preventLedgerModification);
LedgerSchema.pre('updateMany', preventLedgerModification);
LedgerSchema.pre('findOneAndUpdate', preventLedgerModification);

LedgerSchema.pre('deleteOne', preventLedgerModification);
LedgerSchema.pre('deleteMany', preventLedgerModification);
LedgerSchema.pre('findOneAndDelete', preventLedgerModification);

const LedgerModel = mongoose.model('Ledger', LedgerSchema);

module.exports = LedgerModel;
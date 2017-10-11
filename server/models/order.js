const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var orderSchema = new Schema({
   orderId: {
     type: String,
     required: true
   },
   natRefLab: {
     type: String,
     required: true
   },
   investigation: {
     type: String,
     required: true
   },
   user: {
     type: Schmea.Types.ObjectId,
     ref: 'User'
   }
});


module.exports = mongoose,model('Order', orderSchema);

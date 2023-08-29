const {Schema, model} = require('mongoose')

const authorSchema = new Schema ({
    name: String,
    country: String,
},
{
    timestamps: true
}
)


module.exports = model("Author", authorSchema)
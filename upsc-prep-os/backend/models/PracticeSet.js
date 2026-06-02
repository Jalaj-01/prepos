const mongoose =
    require("mongoose");

const PracticeSetSchema =
    new mongoose.Schema({

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true
        },

        title: {

            type: String,

            required: true
        },

        description: {

            type: String,

            default: ""
        },

        questions: [

            {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Question"
            }
        ]

    }, {

        timestamps: true
    });

module.exports =
    mongoose.model(
        "PracticeSet",
        PracticeSetSchema
    );
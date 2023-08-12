const mongoose = require("mongoose");
mongoose.set('strictQuery', false);



const connectdb = async () => {

    try {
        await mongoose.connect("mongodb://localhost:27017/admin",
            {
                useUnifiedTopology: true,
            },
        );
        console.log("mongodb connection successfull...");
    } catch (err) {
        console.log(err);
    }
};

connectdb();
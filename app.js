require("./db/db");
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const auth = require('./middleware/middle');
const data = require("./modal/schema")
const admin = require("./modal/adminSchema")

const bodyParser = require('body-parser');
var cors = require('cors');
const app = express();
const port = 5000;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.post("/register", async (req, res) => {
    // console.log(req.file)
    try {
        const body = req.body;
        // console.log(body)

        if (!(body.firstName && body.lastName && body.email && body.mobile && body.password)) {
            return res.status(400).send("ALL FIELD  IS REQUIRED")
        }
        const existuser = await data.findOne({ mobile: body.mobile });
        if (existuser) {
            return res.status(409).json({ status: false, error: "USER ALREADY REGISTER", data: [] })
        }
        const salt = await bcrypt.genSalt(10);
        HashPassword = await bcrypt.hash(body.password, salt);
        const user = await data.create({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email.toLowerCase(),
            mobile: body.mobile,
            password: HashPassword,
        });
        console.log("user", user)
        return res.status(200).json({ "status": true, "message": "sucess", data: user })
    } catch (err) {
        console.log(err)
    }
}
)

// app.post("/login", async (req, res) => {
//     try {
//         const body = req.body;
//         // console.log('body',body)
//         if (!(body.mobile && body.password)) {
//             res.status(400).send("BOTH FIELD IS REQUIRE")
//         }
//         const user = await data.findOne({ mobile: body.mobile });
//         console.log(user)
//         if (!user) {
//             return res.status(401).send({
//                 message: "USER NOT FOUND"
//             });
//         }
//         if (user) {
//             const validpassword = await bcrypt.compare(body.password, user.password);
//             if (!validpassword) {
//                 return res.status(400).send({
//                     message: "incorrect password"
//                 })
//             }
//             const jwttoken = jwt.sign({
//                 id: user._id
//             }, 'secret');
//             return res.status(200).send({
//                 succesfull: true,
//                 data: user,
//                 message: 'login successfull',
//                 sucess: 'welcome to token',
//                 token: jwttoken
//             })
//         }
//     } catch (err) {
//         console.log(err);
//     }
// })

app.get("/user", auth, async (req, res) => {
    try {
        let token = req.headers['xtoken']
        const decode = jwt.verify(token, 'secret')
        const user = await admin.findOne({ _id: { $eq: decode.id } });
        console.log('adminnnn', user)
        if (user) {
            res.status(200).send({
                sucess: true,
                data: user
            })
        } else res.status(404).send("USER NOT FOUND")
    }
    catch (err) {
        console.log("erro.id", err);

        res.status(400).send(err)
    }
}
)
app.get("/user/:id", async (req, res) => {
    console.log(req.params.id)

    const user = await data.findOne({ _id: req.params.id })
    if (user) {

        res.status(200).json({ user });
    } else {
        return res.status(404).send("user not found")

    }
});

app.get("/alldata", async (req, res) => {
    const user = await data.find();
    res.send(user);
})


app.delete("/deleteuser/:id",auth, async (req, res) => {
    console.log('deeded')
    const id = req.params.id;
    console.log('id', id)
    try {
        const getuser = await data.findOne({ _id: req.params.id });
        console.log('user', getuser)
        const deleteuser = await data.deleteOne({ _id: req.params.id })
        if (deleteuser) {
            res.status(200).json({ message: " user deleted successfully" });
        }
        else {
            res.status(400).send("not delete")
        }

    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }

})

app.put("/updateuser/:id", auth, async (req, res) => {
    const id = req.params.id;
    console.log('id', id)
    try {
        const getuser = await data.findOne({ _id: req.params.id });
        console.log('user', getuser)
        const { firstName, lastName, email, mobile } = req.body;
        const update = await data.updateMany({ _id: req.params.id }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobile: mobile,
            }
        }, { new: true })
        if (update.modifiedCount) {
            console.log('firstName', firstName)
            console.log('id', id)

            res.status(200).json({ message: " user has updated successfully", id: id });
        }
        else {
            res.status(400).send("User Update Failed");
        }
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }
})

app.get('/users', async (req, res) => {
    try {
        let offset = parseInt(req.query.offset) || 0;
        let limit = parseInt(req.query.limit);
        let query = req.query;
        let sort = req.query.sort;
        let orderby = req.query.orderby;
        const sortObject = {};
        let criteria = [];
        console.log('query', query);
        if (query.search && query.search.length > 0) {
            criteria.push({ firstName: { $regex: query.search, $options: "i" } });
            criteria.push({ lastName: { $regex: query.search, $options: "i" } });
            criteria.push({ email: { $regex: query.search, $options: "i" } });
            criteria.push({
                $expr: {
                    $regexMatch: {
                        input: { $toString: { $toLong: "$mobile" } },
                        regex: query.search
                    }
                }
            })
        }
        criteria = criteria.length > 0 ? { $or: criteria } : {};
        //console.log('criteria',criteria);
        sortObject[sort] = orderby === 'asc' ? 1 : -1;
        const users = await data.find(criteria).sort(sortObject).skip(offset * limit).limit(limit);
        const total = await data.countDocuments(criteria)

        const response = {
            error: false,
            total,
            offset: offset + 1,
            limit,
            users,
        };
        res.status(200).json(response)
    } catch (err) {
        console.log(err)
    }
})

app.put("/updateuser", auth, async (req, res) => {
    try {
        let token = req.headers['xtoken']
        const decode = jwt.verify(token, 'secret')
        const user = await admin.findOne({ _id: { $eq: decode.id } })
        console.log(user)
        const { firstName, lastName, email, mobile, } = req.body;
        const update = await admin.updateOne({ _id: { $eq: decode.id } }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                mobile: mobile,

            }
        }, { new: true })
        if (update.modifiedCount) {
            res.status(200).json({ message: "Your user has updated successfully" });
        }
        else {
            res.status(400).send("User Update Failed");
        }
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }
})

app.put("/updatestatus/:id",auth, async (req, res) => {
    const id = req.params.id;
    // console.log('id', id)
    // console.log(req.body.);
    try {
        const getuser = await data.findOne({ _id: req.params.id });
        console.log('user', getuser)
        console.log('req.body', req.body);

        
        if (getuser) {
            const updatestatus = await data.updateOne({ _id: req.params.id }, {

                $set: { activeStatus: parseInt(req.body.x) }
            }, { new: true })
            if (updatestatus) {
                res.status(200).json("status is updated")
            }
            else {
                return res.status(404).send("status is not updated")
            }
        } else {
            return res.status(404).send("something went wrong")
        }
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }
})

// app.post("/register", async (req, res) => {
//     // console.log(req.file)
//     try {
//         const body = req.body;
//         // console.log(body)

//         if (!(body.firstName && body.lastName && body.email && body.mobile && body.password)) {
//             return res.status(400).send("ALL FIELD  IS REQUIRED")
//         }
//         const existuser = await admin.findOne({ mobile: body.mobile });
//         if (existuser) {
//             return res.status(409).json({ status: false, error: "USER ALREADY REGISTER", data: [] })
//         }
//         const salt = await bcrypt.genSalt(10);
//         HashPassword = await bcrypt.hash(body.password, salt);
//         const user = await admin.create({
//             firstName: body.firstName,
//             lastName: body.lastName,
//             email: body.email.toLowerCase(),
//             mobile: body.mobile,
//             password: HashPassword,
//         });
//         console.log("user", user)
//         return res.status(200).json({ "status": true, "message": "sucess", data: user })
//     } catch (err) {
//         console.log(err)
//     }
// }
// )

app.post("/login", async (req, res) => {
    try {
        const body = req.body;
        // console.log('body',body)
        if (!(body.mobile && body.password)) {
            res.status(400).send("BOTH FIELD IS REQUIRE")
        }
        const user = await admin.findOne({ mobile: body.mobile });
        console.log(user)
        if (!user) {
            return res.status(401).send({
                message: "USER NOT FOUND"
            });
        }
        if (user) {
            const validpassword = await bcrypt.compare(body.password, user.password);
            if (!validpassword) {
                return res.status(400).send({
                    message: "incorrect password"
                })
            }
            const jwttoken = jwt.sign({
                id: user._id
            }, 'secret');
            return res.status(200).send({
                succesfull: true,
                data: user,
                message: 'login successfull',
                sucess: 'welcome to token',
                token: jwttoken
            })
        }
    } catch (err) {
        console.log(err);
    }
});

// app.put("/updatestatus", auth, async (req, res) => {
//     try {
//         const { _id, status } = req.body;

//         const updatestatus = await data.updateOne({ "_id": { $eq: _id } }, {
//             $set: { status: status }
//         }, { new: true })

//         if (updatestatus.modifiedCount) {
//             res.status(200).json("status is updated")
//         }
//         else {
//             return res.status(404).send("status is not updated")
//         }

//     } catch (err) {
//         console.log(err)
//     }

// });


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
const route = require("express").Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Promise = require("promise");

const {
    userOperations,
    productOperations,
    orderOperation,
} = require("./firebase");

// using body-parser for convert data forward with AJAX
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));
route.use(cookieParser());

// location of project
const location = "./templates";

route.get("/", (req, res) => {
    res.sendFile("index.html", { root: location }); //server responds by sending the index.html file to the client's browser
    //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

route.get("/products", (req, res) => {
    if (req.cookies.auth_token) {
        res.sendFile("products.html", { root: location }); //server responds by sending the index.html file to the client's browser
    } else {
        res.redirect("/auth");
    }
});

route.get("/users", (req, res) => {
    if (req.cookies.auth_token) {
        res.sendFile("users.html", { root: location }); //server responds by sending the index.html file to the client's browser
    } else {
        res.redirect("/auth");
    }
});

route.get("/out", (req, res) => {
    res.clearCookie("auth_token");
    res.send("true");
});

route.get("/orders", (req, res) => {
    if (req.cookies.auth_token) {
        res.sendFile("orders.html", { root: location }); //server responds by sending the index.html file to the client's browser
    } else {
        res.redirect("/auth");
    }
});

route.get("/auth", (req, res) => {
    res.sendFile("authentication.html", { root: location }); //server responds by sending the index.html file to the client's browser
});

// ----------------------------------------------------------------
// Authentication

function createToken(payload, secretKey, expiresIn) {
    return jwt.sign(payload, secretKey, { expiresIn });
}

route.post("/login", (req, res) => {
    // use a db object
    let ref = productOperations
        .returnDBObject("Users")
        .orderByChild("email")
        .equalTo(req.body["email"]);

    ref.on("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            authenticationSuccessful = false;
            if (
                childSnapshot.val()["password"] ==
                encryptPassword(req.body["password"])
            )
                authenticationSuccessful = true;
            // Verifică autentificarea
            if (authenticationSuccessful) {
                const secretKey = "cheia-secreta";
                const payload = {
                    id: childSnapshot.key,
                    username: childSnapshot.val()["name"],
                };
                // Creează un token
                const token = createToken(payload, secretKey, "1h");
                // Setează cookie
                res.cookie("auth_token", token);
                // Trimite răspunsul
                res.send("true");
            } else {
                res.send("Autentificarea a eșuat!");
            }
        });
    });
});

function encryptPassword(password) {
    let hash = crypto.createHash("md5").update(password).digest("hex");
    return hash;
}

// ----------------------------------------------------------------
// orders  routes

route.post("/addOrder", (req, res) => {
    if (req.body) {
        orderOperation.addOrder(req.body, res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

route.post("/finishOrder", (req, res) => {
    if (req.body) {
        orderOperation.finishOrder(req.body["id"], res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

route.get("/getOrders", (req, res) => {
    console.log("reference: ", req.query["reference"]);

    response = userOperations.returnDBObject(req.query["reference"]);
    let childKey = [];
    response.once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            snapshot.forEach((childSnapshot) => {
                childKey.push(childSnapshot.key);
            });
            const childData = snapshot.val();

            res.send({
                childKey: childKey,
                childData: childData,
            });
        } else {
            res.send("NoUsers");
        }
    });
});

// ----------------------------------------------------------------
// User administration routes

route.post("/addUser", (req, res) => {
    // check if email does not exist
    // ToDo: check if is correct values;
    if (req.body) {
        if (req.body["password"] == req.body["confirmPassword"]) {
            userOperations
                .addUser(req.body, res)
                .then((results) => {
                    res.send({ message: results });
                })
                .catch((err) => {
                    res.send({ message: err });
                });
        } else res.send({ message: "Parolele nu corespund!" });
    } else res.send({ message: "req.body is undefined" });
});

route.get("/deleteUser", (req, res) => {
    if (req.query["id"]) {
        // ToDo: check if is correct values;
        userOperations.deleteUser(req.query["id"]);
        res.send({ message: "true" });
    } else res.send({ message: "req.query is undefined" });
});

route.get("/getUsers", (req, res) => {
    response = userOperations.returnDBObject(req.query["reference"]);
    let childKey = [];
    response.once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            snapshot.forEach((childSnapshot) => {
                childKey.push(childSnapshot.key);
            });
            const childData = snapshot.val();

            res.send({
                childKey: childKey,
                childData: childData,
            });
        } else {
            res.send("NoUsers");
        }
    });
});

route.get("/getUser", (req, res) => {
    console.log("User id: ", req.query["id"]);
    const id = req.query["id"];
    response = productOperations.returnDBObject("Users");
    response.child(id).once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            let data = snapshot.val();
            res.send(data);
        } else {
            res.send("NoUsers");
        }
    });
});

route.post("/editUser", (req, res) => {
    if (req.body) {
        userOperations.editUser(req.body, res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

// ----------------------------------------------------------------
// Product administration routes

route.get("/getPriceProduct", (req, res) => {
    console.log("id: ", req.query["id"]);
    const id = req.query["id"];
    response = productOperations.returnDBObject("FoodOptions");
    response.child(id).once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            let data = snapshot.val();
            res.send({ price: data["price"] });
        } else {
            res.send("noProduct");
        }
    });
});

route.post("/addProduct", (req, res) => {
    if (req.body) {
        // ToDo: check if is correct values;
        productOperations.addProduct(req.body, res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

route.get("/deleteProduct", (req, res) => {
    if (req.query["id"]) {
        // ToDo: check if is correct values;
        productOperations.deleteProduct(req.query["id"]);
        res.send({ message: "true" });
    } else res.send({ message: "req.query is undefined" });
});

route.get("/getProducts", (req, res) => {
    console.log("reference: ", req.query["reference"]);

    response = productOperations.returnDBObject(req.query["reference"]);

    let childKey = [];

    response.once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            snapshot.forEach((childSnapshot) => {
                childKey.push(childSnapshot.key);
            });
            const childData = snapshot.val();

            res.send({
                childKey: childKey,
                childData: childData,
            });
        } else {
            res.send("noProduct");
        }
    });
});

route.get("/getProduct", (req, res) => {
    console.log("id: ", req.query["id"]);
    const id = req.query["id"];
    response = productOperations.returnDBObject("FoodOptions");
    response.child(id).once("value", function (snapshot) {
        if (snapshot.val() !== null) {
            let data = snapshot.val();
            res.send(data);
        } else {
            res.send("noProduct");
        }
    });
});

route.post("/editProduct", (req, res) => {
    if (req.body) {
        // ToDo: check if is correct values;
        productOperations.editProduct(req.body, res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

// -----------------------------------------------------------------

// if your are using express and doing express.Router(), need to use this end of page
module.exports = route;

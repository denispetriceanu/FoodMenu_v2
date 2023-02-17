const route = require("express").Router();
const bodyParser = require("body-parser");
const {
    userOperations,
    productOperations,
    orderOperation,
} = require("./firebase");
// const productOperations = require("./firebase");

// using body-parser for convert data forward with AJAX
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));

// location of project
const location = "./templates";

route.get("/", (req, res) => {
    res.sendFile("index.html", { root: location }); //server responds by sending the index.html file to the client's browser
    //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile
});

route.get("/products", (req, res) => {
    res.sendFile("products.html", { root: location }); //server responds by sending the index.html file to the client's browser
});

route.get("/users", (req, res) => {
    res.sendFile("users.html", { root: location }); //server responds by sending the index.html file to the client's browser
});

route.get("/orders", (req, res) => {
    res.sendFile("orders.html", { root: location }); //server responds by sending the index.html file to the client's browser
});

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

route.get("/cancelOrder", (req, res) => {
    if (req.query["id"]) {
        // ToDo: check if is correct values;
        userOperations.deleteUser(req.query["id"]);
        res.send({ message: "true" });
    } else res.send({ message: "req.query is undefined" });
});

route.get("/getProductsByCategory", (req, res) => {
    // the reference is the category for product
    console.log("reference: ", req.query["reference"]);

    response = userOperations
        .returnDBObject("FoodOptions")
        .orderByChild("category")
        .equalTo(req.query["reference"]);

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

route.get("/getOrder", (req, res) => {
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

route.post("/editOrder", (req, res) => {
    if (req.body) {
        userOperations.editUser(req.body, res);
        res.send({ message: "true" });
    } else res.send({ message: "req.body is undefined" });
});

// ----------------------------------------------------------------
// User administration routes

route.post("/addUser", (req, res) => {
    if (req.body) {
        // ToDo: check if is correct values;
        if (req.body["password"] == req.body["confirmPassword"]) {
            userOperations.addUser(req.body, res);
            res.send({ message: "true" });
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

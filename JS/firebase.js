const admin = require("firebase-admin");
const crypto = require("crypto");
var serviceAccount = require("./foodmenu-v2-firebase-adminsdk-djehv-7d1bbe409d.json");
const Promise = require("promise");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
        "https://foodmenu-v2-default-rtdb.europe-west1.firebasedatabase.app",
});
console.log("Firebase Environment setup success");

// start to a reference
var startReference = admin.database();

const productOperations = {
    addProduct(obj, res) {
        const data = {
            name: obj["name"],
            description: obj["description"],
            price: obj["price"],
            time: obj["time"],
            category: obj["category"],
        };
        startReference
            .ref("FoodOptions")
            .push(data)
            .then(function () {
                console.log("add success!");
            });
    },

    editProduct(obj, res) {
        id = obj["id"];
        const data = {
            name: obj["name"],
            description: obj["description"],
            price: obj["price"],
            time: obj["time"],
            category: obj["category"],
        };
        startReference
            .ref("FoodOptions")
            .child(id)
            .update(data)
            .then(function () {
                console.log("Edit success!");
            });
    },

    deleteProduct(id) {
        startReference
            .ref("FoodOptions")
            .child(id)
            .remove()
            .then(function () {
                console.log("Remove succeeded.");
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message);
            });
    },

    returnDBObject(reference) {
        return startReference.ref(reference);
    },
};

const userOperations = {
    addUser(obj, res) {
        return new Promise((resolve, reject) => {
            let hash = crypto
                .createHash("md5")
                .update(obj["password"])
                .digest("hex");

            const data = {
                name: obj["name"],
                email: obj["email"],
                password: hash,
                birthday: obj["birthday"],
                time: obj["time"],
                function: obj["function"],
            };

            const ref = startReference.ref("Users");
            ref.orderByChild("email")
                .equalTo(data["email"])
                .once("value", (snapshot) => {
                    if (snapshot.exists()) {
                        resolve("E-mailul exista deja.");
                    } else {
                        ref.push(data).then(function () {
                            resolve("Add success!");
                        });
                    }
                });
        });
    },

    editUser(obj, res) {
        id = obj["id"];

        const data = {
            name: obj["name"],
            email: obj["email"],
            birthday: obj["birthday"],
            time: obj["time"],
            function: obj["function"],
        };
        startReference
            .ref("Users")
            .child(id)
            .update(data)
            .then(function () {
                console.log("Edit success!");
            });
    },

    deleteUser(id) {
        startReference
            .ref("Users")
            .child(id)
            .remove()
            .then(function () {
                console.log("Remove succeeded.");
            })
            .catch(function (error) {
                console.log("Remove failed: " + error.message);
            });
    },

    returnDBObject(reference) {
        return startReference.ref(reference);
    },
};

const orderOperation = {
    addOrder(obj, res) {
        const data = {
            waiter_name: obj["waiter_name"],
            table: obj["table"],
            product_list: obj["product_list"],
            time: obj["time"],
            total_price: obj["total_price"],
        };
        startReference
            .ref("Orders")
            .push(data)
            .then(function () {
                console.log("add success!");
            });
    },

    finishOrder(id) {
        // definirea referinței originale
        const originalRef = startReference.ref("Orders");
        // definirea referinței destinație
        const destinationRef = startReference.ref("HistoryOrders");
        // copierea datelor din locația originală în locația destinație
        originalRef.child(id).once("value", function (snapshot) {
            const data = snapshot.val();
            destinationRef.child(id).set(data);
            // ștergerea obiectului din locația originală
            originalRef.child(id).remove();
        });
    },
};

// module.exports = returnDBObject;
module.exports = {
    productOperations,
    userOperations,
    orderOperation,
};

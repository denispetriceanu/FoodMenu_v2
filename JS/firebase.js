const admin = require("firebase-admin");
const crypto = require("crypto");
var serviceAccount = require("./foodmenu-v2-firebase-adminsdk-djehv-7d1bbe409d.json");

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
    let hash = crypto.createHash("md5").update(obj["password"]).digest("hex");
    console.log(obj["birthday"]);
    const data = {
      name: obj["name"],
      email: obj["email"],
      password: hash,
      birthday: obj["birthday"],
      time: obj["time"],
      function: obj["function"],
    };
    startReference
      .ref("Users")
      .push(data)
      .then(function () {
        console.log("Add success!");
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

// module.exports = returnDBObject;
module.exports = {
  productOperations,
  userOperations,
};

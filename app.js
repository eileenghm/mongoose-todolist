//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

//create new document
const doc1 = new Item({
  name: "Welcome to your to do list",
})

const doc2 = new Item({
  name: "do laundry",
})

const doc3 = new Item({
  name: "buy fruit",
})

const defaultItems = [doc1, doc2, doc3];
Item.insertMany(defaultItems);

app.get("/", function(req, res) {
  Item.find({}).exec()
    .then(foundItems => {
      // Show default items only on the first time access
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      }
      return foundItems;
    })
    .then(items => {
      if (Array.isArray(items)) {
        console.log("Successfully saved default items to DB.");
      }
      res.render("list", { listTitle: "Today", newListItems: items });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred.");
    });
});



app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

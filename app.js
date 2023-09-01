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

app.get("/", function(req, res) {
  Item.find({}).exec()
    .then(foundItems => {
      // Show default items only on the first time access
      if (foundItems.length === 0) {
        console.log("Successfully saved default items to DB.");
        return Item.insertMany(defaultItems);
      }
      return foundItems;
    })
    .then(items => {
      res.render("list", { listTitle: "Today", newListItems: items });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred.");
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
  }
});

//delete when check box clicked
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(result => {
      if (result) {
        console.log("Successfully deleted checked item.");
      } else {
        console.log("Item not found.");
      }
      res.redirect("/");
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred.");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

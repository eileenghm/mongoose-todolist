//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

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
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

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
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //if list is not today, list coming from custom list
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
    .then(foundList => {
      foundList.items.push(item);
      return foundList.save();
    })
    .then(() => {
      res.redirect("/" + listName);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("An error occurred.");
    });
  }
});

//delete when check box clicked
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  //need list name, where id from
  const listName = req.body.listName;
/*
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
    */
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("An error occurred.");
      });
  
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
  .then(foundList => {
    if (!foundList) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      return list.save();
    } else {
      // Show an existing list, send to list.ejs
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  })
  .then(savedList => {
    if (savedList) {
      // Redirect to the saved list
      res.redirect("/" + customListName);
    }
  })
  .catch(err => {
    console.error(err);
    res.status(500).send("An error occurred.");
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

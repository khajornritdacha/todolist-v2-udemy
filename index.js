//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.DB_URL;
mongoose.connect(DB_URL);

// Declare DB Schema and Model
const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

function capitalize(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}


app.get("/", async function (req, res) {

  const day = date.getDate();

  let items = await Item.find();
  
  let cnt = 0;
  for (let i = 0; i < 10; i++) {
    cnt += 1;
  }
  
  res.render("list", { listTitle: day, newListItems: items, catName: "" });
});


app.post("/", async function (req, res) {
  // Capitalize first letter
  const catName = capitalize(req.body.catName);
  
  if (catName === "") {
    const item = new Item({ name: req.body.newItem });

    await item.save();
    items = await Item.find();
    
    res.redirect("/");
  } else {
    let list = await List.findOne({name: catName});
  
    list.items.push({ name: req.body.newItem });
    await list.save();
  
    res.redirect(`/${catName}`);
  }
});


app.get("/:catName", async function (req, res) {
  // Capitalize first letter
  const catName = capitalize(req.params.catName);
  
  let list = await List.findOne({name: catName});
  
  if (!list) {
    // console.log("Create New List");
    list = new List({
      name: catName,
      items: []
    });
    await list.save();
  }
  
  res.render("list", { 
    listTitle: catName, 
    newListItems: list.items,
    catName
  });
});


app.post("/delete", async function (req, res) {
  // Capitalize first letter
  const catName = capitalize(req.body.catName);
  const removeId = req.body.checkbox;


  if (catName === "") {
    console.log("Upper")
    await Item.findByIdAndDelete(removeId);
    res.redirect("/");
  } else {
    let list = await List.findOne({ name: catName });
  
    await list.items.pull(removeId);
    await list.save();
  
    res.redirect(`/${catName}`);
  }
});



app.get("/about", function (req, res) {
  res.render("about");
});


app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});

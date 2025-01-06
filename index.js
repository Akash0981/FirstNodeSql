const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: '494233',
});

let getRandomUser = () => {
return [
  faker.string.uuid(),
  faker.internet.username(), // before version 9.1.0, 
  faker.internet.email(),
  faker.internet.password(),
  ];
};

app.get("/", (req, res) =>{
  let q = `SELECT count(*) FROM user`; 
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let count = result[0]["count(*)"]; 
      res.render("home.ejs", {count}); 
    });
  }catch(err){
      console.log(err);
      res.send("error");
  }
  connection.end();
});


// show users route
app.get("/users", (req, res) =>{
  let q = `SELECT * FROM user`;

  try{
  connection.query(q, (err, users) =>{
    if(err) throw err;
    res.render("user.ejs", {users});
  })
}catch(err){
  console.log(err);
  res.send("error");
}
});

//edit user route
app.get("/users/:id/edit/", (req, res) =>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      // console.log(result);
      let user = result[0];
      // console.log(user);
      res.render("edit.ejs",{user});
    })
  }catch(err){
    console.log(err);
    res.send("error");
  }
});

//update in DB route
app.patch("/user/:id", (req, res)=>{
  let {id} = req.params;
  let {password: userPassword, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      let user = result[0];
      if(userPassword != user.password){
        res.send("wrong password");
      }else{
        //update query
        let q2 = `UPDATE user SET username= '${newUsername}' WHERE id = '${id}'`;
        connection.query(q2, (err, result)=>{
          if(err) throw err;
          res.redirect("/users");
        });
      };
    });
  }catch(err){
    console.log(err);
    res.send("error");
  }
});

//1 task create form to add a new user to the database
app.get("/users/add", (req, res) =>{
  res.render("newuser.ejs");
});

app.post("/users/add", (req, res) =>{
  let {username, email, password} = req.body;
  const id = uuidv4();

  let q = `INSERT INTO user (id,  username, email, password) VALUES ('${id}','${username}','${email}','${password}')`;
  
  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      console.log("added new user");
      res.redirect("/users");
    });
  }catch(err){
    console.log(err);
    res.send("error");
  }
});

//2 task create form to delete a user from database if they enter correct email id & password
app.get("/users/:id/delete", (req, res) =>{
  let {id} = req.params;
  let q = `select * from user where id = '${id}'`;
  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      let userData = result[0];
      res.render("delete.ejs", {userData});
    });
  }catch(err){
    res.send("error");
  }
});

app.delete("/users/:id/", (req, res)=>{
  let {id} = req.params;
  let {password} = req.body;

  let q = `select * from user where id = '${id}'`;
  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      
      let user = result[0];
      console.log(user.password);
      console.log(password);
      if(user.password != password){
        res.send("wrong password entered");
      }else{
        let {id} = req.params;
        let q = `DELETE FROM user WHERE id = '${id}'`;
        try{
          connection.query(q, (err, result) =>{
            if(err) throw err;
            else{
              console.log(result);
              //res.render("deletedPage.ejs");
              res.redirect("/users");
            }
          });
        }catch(err){
          res.send("error");
        }
      }
    });
  }catch(err){
    res.send("error");
  } 
});

app.listen("8080", () =>{
  console.log("app is running")
});

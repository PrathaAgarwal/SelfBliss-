import express from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "selfbliss-e4cad", // Your project ID
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://selfbliss-e4cad-default-rtdb.firebaseio.com/" //Your Database URL
};

// Initialize Firebase
const a = initializeApp(firebaseConfig);
console.log("Connected to Firebase Realtime Database!");
// Get a reference to the database service
const database = getDatabase(a);
const allproducts= ref(database, 'products');

const app = express();
const port = 3000;
app.use(express.static("assets"));
app.use(express.static("router"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret:"gewqnbh",
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session())

app.get("/", (req, res) => {
  res.sendFile("/web dev/mine/SelfBliss/index.html");
});
app.get("/login", (req, res) => {
  res.sendFile("/web dev/mine/SelfBliss/views/login.html");
});
app.get("/categories", (req, res) => {
  res.sendFile("/web dev/mine/SelfBliss/views/categories.html");
});
app.get("/wishlist", (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
    res.redirect("/login");
  }
  res.sendFile("/web dev/mine/SelfBliss/views/wishlist.html");
});
app.get("/cart", (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
    return res.redirect("/login");
  }
  res.sendFile("/web dev/mine/SelfBliss/views/cart.html");
});

app.get('/allwishlist', async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
    return res.redirect("/login");
  }
  const ui= req.user;
  const userId=ui.user_id;
  console.log("user id" , userId);
  try {
    const result = await db.query(
      'SELECT p.product_id, p.product_name, p.price, w.quantity FROM product p JOIN wishlist w ON p.product_id = w.product_id WHERE w.user_id = $1',
      [userId]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/allcart', async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
    return res.redirect("/login");
  }
  const ui= req.user;
  const userId=ui.user_id;
  console.log("user id" , userId);
  try {
    const result = await db.query(
      'SELECT p.*, c.quantity FROM product p JOIN cart c ON p.product_id = c.product_id WHERE c.user_id = $1',
      [userId]
    );
    console.log("res", result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:category', async(req, res) =>{
  const c = req.params;
  const cid=c.category;
  get(allproducts).then ((snapshot) =>{
    if(snapshot.exists()){
      const p= snapshot.val();
      console.log(p);
      console.log(p.cid);
      res.json(p.cid);
    }
  })
    
});

app.delete('/wishlist/:product_id', async (req, res) => {
  const pid = parseInt(req.params.product_id);
  const ui= req.user;
  const uid=parseInt(ui.user_id);
console.log("delete", pid, uid);
try {
    const result = await db.query("DELETE FROM wishlist WHERE product_id = $1 AND user_id = $2 RETURNING *;",
      [pid, uid]
    );
    console.log("deleted " , result.rows);
    if (result.rowCount > 0) {
      console.log("product removed");
      res.json({ success: true, message: "Product removed from wishlist" });
    } else {
      console.log("product not found");
      res.status(404).json({ success: false, message: "Product not found in wishlist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to remove product from wishlist" });
  }
});
app.delete('/cart/:product_id', async (req, res) => {
  const pid = parseInt(req.params.product_id);
  const ui= req.user;
  const uid=parseInt(ui.user_id);
console.log("delete", pid, uid);
  try {
    const result = await db.query( "DELETE FROM cart WHERE product_id = $1 AND user_id = $2 RETURNING *;",
      [pid, uid]
    );
    console.log(result.rows);
    if (result.rowCount > 0) {
      console.log("Product removed");
      res.json({ success: true, message: "Product removed from cart" });
    } else {
      console.log("product not found");
      res.status(404).json({ success: false, message: "Product not found in cart" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to remove product from cart" });
  }
});

app.delete('/minuscart/:product_id', async (req, res) => {
  const pid = parseInt(req.params.product_id);
  const ui= req.user;
  const uid=parseInt(ui.user_id);
console.log("minus", pid, uid);
  try {
    const result = await db.query( "update cart set quantity=quantity-1 WHERE product_id = $1 AND user_id = $2 RETURNING *;",
      [pid, uid]
    );
    console.log(result.rows);
    if (result.rows[0].quantity< 0) {
      console.log("Product removed");
      res.json({ success: true, message: "Product removed from cart" });
    } else {
      console.log(" 1 product removed");
      res.status(404).json({ success: false, message: "it doesnot remain in cart" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to remove product from cart" });
  }
});


app.post('/wishlist', async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
   return res.status(401).json({redirect: "/login"});
  }
  const pi= req.body;
  const productId=pi.productId;
  const ui= req.user;
  const userId=ui.user_id;
  console.log("user id and product id", userId, productId); // This should print the userId and productId if the body is correct

  try {
    const checkWish = await db.query('SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',[userId, productId]);
    let query;
    if (checkWish.rows.length > 0) {
      query = 'UPDATE wishlist SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2 RETURNING *';
    } else {
      query = 'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *';
    }
    const result = await db.query(query, [userId, productId]);
    if (result.rowCount > 0) {
      res.json({ success: true, message:"product added" });
    } else {
      res.status(404).json({ success: false, message: "Failed to update wishlist" });
    } }catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/cart', async (req, res) => {
  if (!req.isAuthenticated()) {
    console.log("User not authenticated, redirecting...");
   return res.status(401).json({redirect: "/login"});
  }
  const pi= req.body;
  const productId=pi.productId;
  const ui= req.user;
  const userId=ui.user_id;
  console.log("postcart", userId, productId);
  try {
    const checkCart = await db.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',[userId, productId]);
    let query;
    if (checkCart.rows.length > 0) {
      query = 'UPDATE cart SET quantity = quantity + 1 WHERE user_id = $1 AND product_id = $2 RETURNING *';
    } else {
      query = 'INSERT INTO cart (user_id, product_id) VALUES ($1, $2) RETURNING *';
    }
    const result = await db.query(query, [userId, productId]);
    if (result.rowCount > 0) {
      res.json({ success: true, message:"product added" });
    } else {
      res.status(404).json({ success: false, message: "Failed to update cart" });
    }
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Registration (Sign Up)
app.post('/register', async (req, res) => {
  const { user_name, phone_no, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);  // Hash password
  try {
    const result = await db.query(
      'INSERT INTO users (user_name,phone_no, email, password) VALUES ($1, $2, $3,$4)',
      [user_name,phone_no, email, hashedPassword]
    );
    const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/");
          });
  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);
passport.use(
  new Strategy(async function verify(name, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE user_name = $1 ", [
        name,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) =>{
  cb(null,user);
});
passport.deserializeUser((user, cb)=>{
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

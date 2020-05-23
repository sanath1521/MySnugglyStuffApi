const express = require('express');
const bodyParser = require('body-parser');
const cookieParer = require('cookie-parser');
const catergoryRouter = require('./routes/category');
const orderRouter = require("./routes/order");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const port = process.env.PORT || 5000;
const app = express();
const mongoose = require('mongoose');

mongoose
  .connect(
    "mongodb+srv://newuser123:newuser123@cluster0-ovxgm.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log("Connected to db"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParer())


app.use("/categories", catergoryRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);
app.use("/products", productRouter);


app.get('/', (req, res) => {
    res.send('Hello world');
})



console.log(app.get('env'));
console.log(process.env.NODE_ENV)

app.listen(port, () => console.log('The server is up'));
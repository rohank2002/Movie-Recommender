var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var engine = require('ejs-mate');
var axios = require('axios');
const Product = require("./models/product")
const Filter = require("./models/filter")
const CONST = require("./config");

var app = express();

app.use(session({
	secret: 'guessTheSecret',
	resave: false,
	saveUninitialiazed: false,
	cookie: { maxAge: 180 * 60 * 1000} //in milliseconds
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));


app.engine('ejs', engine);
app.set('view engine', 'ejs');

var {userloginServer,productCatalogueServer,cartServer,orderServer,paymentServer,reviewServer,recommedServer,apprioriServer}=CONST;

var userID = null;
var isLoggedIn = false;
var cartQuantity = 0;
var cart = {};
var cartID = null;

app.get('/signin', function(request, response) {
	response.render('user/login',  {login: isLoggedIn, cartQuantity: cartQuantity});
});


app.get('/signup', function(request, response) {
  response.render('user/signup', {login: isLoggedIn, cartQuantity: cartQuantity});
});

app.post('/signup', function(request, response) {
	console.log("asd")	;
	signUpCallback(request, (newCartId)=>{

		console.log("NewCartId is "+newCartId);

		if(newCartId){
			console.log(newCartId);
			console.log("Type is:");
			console.log(typeof newCartId);
			axios.post(userloginServer+'/users', {
				"Name": request.body.name,
				"Email":  request.body.email,
				"Address": request.body.address,
				"Password": request.body.password,
				"CartID": newCartId
			})
			.then(function (res) {
			console.log(res.data);
			response.redirect("/signin")
			})
			.catch(function (error) {
			console.log(error);
			response.redirect("/signup")
			});
		
			}
		});
});

function signUpCallback(req,callback) {
	axios.post(cartServer+'/carts', {
	  })
	  .then(function (response) {
		console.log(response.data);
		callback(response.data.CartID);
	  })
	  .catch(function (error) {
		console.log(error.response);
	  });
}

app.get('/products', async function(request, response) {
	console.log("products page called");
	productCatalogCallBack(request, async ()=>{
		console.log("Cart updated");
	
	var topMovies= await Product.find(
		{$and:[
				{ imdbRating: { $ne: "N/A" }},
				{ Image: { $ne : "N/A" }}
			]
		}).sort( { imdbRating: -1 })
		.limit(8)
		.exec();
	var	recentMovies = await Filter.
		find({})
		.sort({ released: -1 })
		.limit(8);
	var comedyMovies = await Filter
		.aggregate([{$unwind : "$genre"},{$match : {genre : "Comedy"}},{$sort : { "imdbRating" :-1 } },{$limit : 8}])

	 var actionMovies = await Filter
	 .aggregate([{$unwind : "$genre"},{$match : {genre : "Action"}},{$sort : { "imdbRating" :-1 } },{$limit : 6}])

	var starWarsMovies=  await Filter.find({"movie_id":{$in:["33493","5378"]}})
	//var starWarsMovies=  await Filter.find({"$or": {"movie_id" :{$in:["33493","5378"]} })
	await starWarsMovies.push(...actionMovies);
	

	var animationMovies = await Filter
	.aggregate([{$unwind : "$genre"},{$match : {genre : "Animation"}},{$sort : { "imdbRating" :-1 } },{$limit : 8}])

	var fantasyMovies = await Filter
	.aggregate([{$unwind : "$genre"},{$match : {genre : "Fantasy"}},{$sort : { "imdbRating" :-1 } },{$limit : 8}])

	//console.log("top Movies:", topMovies);
	//console.log("recent Movies:", recentMovies);
	//console.log("comedy Movies:", comedyMovies);
	//console.log("action Movies:", actionMovies);
	//console.log("animation Movies:", animationMovies);
	//console.log("fantasy Movies:", fantasyMovies);
	if(isLoggedIn)	
		response.render('./main/catalog', {products: topMovies,
			topMovies: topMovies,
			recentMovies: recentMovies,
			comedyMovies: comedyMovies,
			actionMovies: starWarsMovies,
			animationMovies:animationMovies,
			fantasyMovies:fantasyMovies,
			login: isLoggedIn, 
			cartQuantity: cartQuantity});
	else
	response.render('user/login')

})
});


function productCatalogCallBack(req, callback) {
	if(isLoggedIn) {
		axios.get(cartServer+"/carts/"+cartID)
		.then((res)=>{
			cartQuantity=res.data.Products.length;
			cart=res.data;
			cart.Total=cartQuantity;
			console.log("cart :" +JSON.stringify(res.data));
		}).catch((err)=>{
			console.log(err);
			console.log("Error in productCatalogCallBack");
		})
	}
	callback();
	
}

app.get('/', function(request, response) {
	if (isLoggedIn) {
		response.redirect('/products');
	}
	else {
		isLoggedIn = false;
	}

	axios.get(productCatalogueServer+ "/products")
	.then(res=>{
		var products_array = res.data;
		response.redirect("/products");
	}).catch(e=>{
		console.log("Error in /:" ,err );
	})



});

app.get('/products/:id', async function(request, response) {
	
	var productId = request.params["id"];
	var productDetails={};
	var recommededMovies={};

	///product details
	await axios.get(productCatalogueServer+ "/products/"+productId)
	.then((res)=>{
		//console.log("Product details :", res.data);
		productDetails=res.data;
	}).catch((err)=>{
		console.log(err.response);
		response.render('user/login');
	})
	console.log("Product details :", productDetails);



	///recommeded movies
	//if(productDetails.movie_id){
		await axios.post(recommedServer,{"id":parseInt(productDetails.movie_id)})
		.then(async res=>{
			var movieIds=res.data.map(String);
			console.log("MovieIDs:",movieIds);
		    await Product.find({"movie_id":{$in:movieIds}})
			.exec(function (err, records) {
				//console.log("recommended movies :" +records);
				recommededMovies=records;
				response.render('./main/product', {recommendedProduct :recommededMovies,product: productDetails, login: isLoggedIn, cartQuantity: cartQuantity});
				if(err){
					console.log("error while finding recommended movies",err);
				}
			});
					}).catch(err=>{
			console.log("Error in hitting recommend api",err);
		})
	//}

	

});

app.post('/products/:id', function(request, response) {

	var productId = request.params["id"];
	console.log("cart before:" +JSON.stringify(cart))
	console.log("isLoggedin:" +JSON.stringify(cart))

	addToCartCallBack(request, productId, ()=>{
		axios.get(productCatalogueServer+"/products")
		.then((res)=>{
			//console.log(res.data);
			response.redirect('/');
		}).catch((err)=>{
			console.log(err.response);
			response.render("user/signin");
		})
	});
});

function addToCartCallBack(request, productId, callback) {

	console.log("ProductId is" + productId);
	console.log("cart before:" +cartID);
	getTheProduct(productId, (product)=> {
		var quantityOfProduct = request.body.quantity;
		var price = request.body.priceHidden;
		var productName = request.body.item;
		var isAlreadyPresent = false;
		for (var i=0;i<cart.Products.length;i++) {
			var currentProduct = cart.Products[i].ProductName;

			if(productName === currentProduct) {
				var quantityOfCurrentProduct = cart.Products[i].Quantity;
				var temp = parseInt(quantityOfCurrentProduct)+parseInt(quantityOfProduct);
				quantityOfCurrentProduct = temp.toString();
				cart.Products[i].Quantity = quantityOfCurrentProduct;
				isAlreadyPresent = true;
				break;
			}
		}

		if(!isAlreadyPresent) {
			var productDetailsToBeInsertedIntoTheCart = {

					"ProductName": productName,
					"Price": price,
					"Quantity": quantityOfProduct,
					"Image": product.Image
			};

			cart.Products.push(productDetailsToBeInsertedIntoTheCart);
		}
		cart.Total="";
		axios.put(cartServer+"/carts",JSON.stringify(cart))
		.then((res)=>{
			console.log(res.data);
			cart = res.data;
			cartQuantity = cart.Products.length;
			callback();
		}).catch((err)=>{
			console.log(err.response);
		})

	
	});
}

 function getTheProduct(productId, callback) {
	 
	axios.get(productCatalogueServer+"/products/"+productId)
	.then((res)=>{
		console.log("New Product :" ,res.data);
		callback(res.data);
	}).catch((err)=>{
		console.log(err.response);
	})
	
}

app.post('/signin', function(request, response) {
	var emailID = request.body.email;
	axios.get(userloginServer+'/users/'+emailID)
	.then((res)=>{
		console.log(res.data);
		if(res.data.Email==emailID){
			cartID = res.data.CartID;
			userID = res.data.UserID;
			cart={};
			isLoggedIn = true;
			response.redirect("/products");
		}else{
			console.log("No such user present");
			response.redirect("/signin");
		}
	}).catch((err)=>{
		console.log(err);
		response.redirect("/signin");
	})
	


	
});

app.get('/cart', async function(request, response) {
	console.log("in cart api call");
	if(isLoggedIn) {
		await caluclateTotal(cart);
		try{
		   let res=await axios.post(apprioriServer,{movies:[1]})
			.then(async res=>{
				movieSuggestedIds=res.data
				console.log("movieSuggested :" +  res.data);
			}).catch(ex=>{
			console.log("err :" +  ex)
			})

			console.log("recommended movies :" +movieSuggestedIds);
			await Product.find({"movie_id":{$in: movieSuggestedIds}})
			.exec(function (err, records) {
				//
				console.log("recommended movies :" +records);
				recommededMovies=records;
				response.render('./main/cart', {foundCart: cart, login: isLoggedIn, cartQuantity: cartQuantity,recommendedProduct:recommededMovies});
				if(err){
					console.log("error while finding recommended movies",err);
				}
			});
							
		}catch(e){
			console.log("error in apriori server call  :" + e);
		}
		console.log("last");

		
	//	response.render('./main/cart', {foundCart: cart, login: isLoggedIn, cartQuantity: cartQuantity});
	}
	else {
		response.redirect("user/login");
	}
});

app.post('/remove', function(request, response) {
	var productNameToRemove = request.body.item;

	var dummyCart = cart;
	for (var i=0; i<dummyCart.Products.length;i++) {
		var product = dummyCart.Products[i];

		if(product.ProductName === productNameToRemove) {
			delete dummyCart.Products[i];
		}
	}

	var procutArray = dummyCart.Products;

	var filtered = procutArray.filter(function (element) {
  	return element != null;
	});

	cart = dummyCart;
	cart.Products = filtered;
	cartQuantity = cart.Products.length;
	updateTheCart(cart, ()=> {

	});
	response.redirect('/cart');
});

function caluclateTotal(cart) {
	return new Promise((resolve,reject) => {
		console.log("calculating amaount");
		var totalAmount = 0;
		for (var i=0; i<cart.Products.length; i++) {
			var productPrice = parseInt(cart.Products[i].Price);
			var productQuantity = parseInt(cart.Products[i].Quantity);
			console.log("productPrice : ", productPrice);
			console.log("productQuantity : ", productQuantity);
			totalAmount+=productPrice*1;
		}
		cart.Total = totalAmount.toString();
		console.log("calculated amaount :",cart.Total);
		resolve();
	});
}

function updateTheCart(cart, callback) {
	cart.Total="0";
	axios.put(cartServer+ "/carts",JSON.stringify(cart))
	.then((res)=>{
		cart= res.data;
		cartQuantity = cart.Products.length;
	
		callback();
	}).catch(e=>{
		console.log("Error in updateTheCart :" +e);
	})
}

app.get('/logout', function(request, response) {
	updateTheCart(cart, ()=>{
		isLoggedIn = false;
		cart = null;
		cartQuantity = 0;
		userID = null;
		response.redirect('/signin');
	});
});

app.post('/order', function(request, response) {

	if (!isLoggedIn) {
		response.redirect('/signIn');
	}
	createOrderCallback(request, (order)=> {
		cartQuantity = 0;
		cart.Products = [];
		updateTheCart(cart, () => {
			createANewPaymentCallback(order, (payment)=>{
				response.render('./main/orderdetail', {order: order, login: isLoggedIn, cartQuantity: cartQuantity, payment:payment});
			});
		});
	});
});

function createANewPaymentCallback(order, callback) {
	var jsonToSend = {
		"UserID": userID,
		"OrderID": order.OrderID,
		"Amount": order.Total
	};
	axios.post(paymentServer+ "/payments",JSON.stringify(jsonToSend))
	.then(res=>{
		callback(res.data);
	}).catch((err)=>{
		console.log("Error in createANewPaymentCallback :" ,err);
	})
}

function createOrderCallback (request, callback) {
	var jsonToSend = {
		"UserID": userID,
		"Total":  cart.Total,
		"Products": cart.Products
	};
	console.log(" createOrderCallback jsonToSend :" +jsonToSend);
	axios.post(orderServer+ "/orders",JSON.stringify(jsonToSend))
	.then(res=>{
		callback(res.data);
	}).catch((err)=>{
		console.log("Error in createOrderCallback :" ,err);
	})
	
}

app.get('/orders', function(request, response) {

	if (!isLoggedIn) {
		response.redirect('/');
	}
	getAllorders(request, (orders)=>{
		if(orders==null)	orders = [];
		response.render('./main/orders', {orders: orders, login:isLoggedIn, cartQuantity:cartQuantity});
	});
});

function getAllorders(request, callback) {
	axios.get(orderServer+ "/orderofusers/" + userID)
	.then(res=>{
		callback(res.data);
	}).catch((err)=>{
		console.log("Error in getAllorders :" ,err);
	})
}

function getOrder(request, callback) {
	var orderid = request.params["orderid"];
	console.log("OrderID is: "+orderid);


	axios.get(orderServer + "/orders/" + orderid)
	.then(res=>{
		callback(res.data);
	}).catch((err)=>{
		console.log("Error in getAllorders :" ,err);
	})

}

app.get('/vieworder/:orderid', function(request, response) {
	getOrder(request, (currentOrder)=>{
		if(currentOrder.PaymentStatus === "Payment received") {
			response.render('./main/viewOrderDetails', {order:currentOrder, login:isLoggedIn, cartQuantity:cartQuantity});
		}
		else {
			getPaymentFromOrderID(currentOrder, (currentPayment)=> {
				console.log("Payment is:"+currentPayment);
				console.log("currentPayment is:");
				console.log(currentPayment);
				response.render('./main/orderdetail', {payment:currentPayment, order:currentOrder, login:isLoggedIn, cartQuantity:cartQuantity});
			});
		}
	});
});

function getPaymentFromOrderID(currentOrder, callback) {
	axios.get(paymentServer + "/payments/paymentfromorder/" + currentOrder.OrderID)
	.then(res=>{
		callback(res.data);
	}).catch(e=>{
		console.log("Error in getPaymentFromOrderID",e);
	})
}

app.get('/payment', function(request, response) {
	if(isLoggedIn) {
		response.redirect('/products');
	}
	else {
		response.redirect('/signIn');
	}
});

app.post('/payment', function(request, response) {

	if (!isLoggedIn) {
		response.redirect('/signIn');
	}
	updateThePaymentStatus(request, (currentPayment)=> {
		console.log(currentPayment);
		getOrderFromOrderID(request, currentPayment.OrderID, (order)=> {
			response.render('./main/paymentReceived', {order:order, login:isLoggedIn, cartQuantity:cartQuantity});
		});
	});
});

function getOrderFromOrderID(request, orderid, callback) {

	var currentOrder = null;

	axios.get(orderServer + "/orders/" + orderid)
	.then(res=>{
		currentOrder = res.data;
		changeOrderStatus(currentOrder, (newOrder)=> {
			callback(newOrder);
		});
	}).catch(e=>{
		console.log("Error in getOrderFromOrderID",e);
	})
}

function changeOrderStatus(currentOrder, callback) {
	axios.put(orderServer + "/orders/updateorderstatus/" + currentOrder.OrderID)
	.then(res=>{
		callback(res.data);
	}).catch(e=>{
		console.log("Error in changeOrderStatus",e);
	})
}

function updateThePaymentStatus(request, callback) {
	var currentPayment = null;
	axios.put(paymentServer + "/payments/updateThePaymentStatus/" + request.body.paymentID)
	.then(res=>{
		currentPayment = res.data;
		callback(currentPayment);
	}).catch(e=>{
		console.log("Error in updateThePaymentStatus",e);
	})
}

app.get('/reviews/:id', function(request, response) {
	var productId = request.params["id"];

	reviewsCallback(productId, (reviews)=> {
		console.log(reviews);

		if(reviews==null) {
			reviews = new Object();
		}
		axios.get(productCatalogueServer+"/products/"+productId)
		.then((res)=>{
			response.render('./main/reviews', {reviews:reviews, product: res.data, login: isLoggedIn, cartQuantity: cartQuantity});
		}).catch((err)=>{
			console.log("Error occured while fwtching reviews",err);
		})

	});

});

function reviewsCallback(productid, callback) {
	axios.get(reviewServer+"/reviews/"+productid)
	.then((res)=>{
		callback(res.data);
	}).catch((err)=>{
		console.log("Error occured while fwtching reviews",err);
	})
}

app.post('/submitreview', function(request, response) {
	console.log("-------------------------------Inside review post-----------------------------");

	var productidnew = request.body.productid;

	postReviewCallback(request, ()=> {
		reviewsCallback(productidnew, (reviews)=> {
			console.log(reviews);

			if(reviews==null) {
				reviews = new Object();
			}
			axios.get(productCatalogueServer+"/products/"+productidnew)
			.then((res)=>{
				response.render('./main/reviews', {reviews:reviews, product: res.data, login: isLoggedIn, cartQuantity: cartQuantity});
			}).catch((err)=>{
				console.log("Error occured while fwtching reviews",err);
			})

			
		});
	});
});

function postReviewCallback (request, callback) {
	axios.post(reviewServer+"/reviews",{
		"ReviewString": request.body.review,
		"ProductIDString":  request.body.productid
	}).then((res)=>{
		callback();
	}).catch((err)=>{
		console.log("Error occurred");
	})
}

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
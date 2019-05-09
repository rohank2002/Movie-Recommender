package main

import (
	"encoding/json"
	"net/http"

	"github.com/codegangsta/negroni"
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"fmt"
)

// MongoDB Config
var mongodb_server = "mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch"
//var mongodb_server = "mongodb://admin:H0la!@13.57.234.163/Starbucks?authSource=admin"
//var mongodb_server1 string
//var mongodb_server2 string
//var redis_server string

//="mongodb://54.67.13.87:27017,54.67.106.101:27017,13.57.39.192:27017,54.153.26.217://27017,52.53.154.42:27017"

var mongodb_database = "just_watch"
var mongodb_collection = "reviews"

// NewServer configures and returns a Server.
func NewServer() *negroni.Negroni {
	formatter := render.New(render.Options{
		IndentJSON: true,
	})

	//mongodb_server = os.Getenv("MONGO1")
	//mongodb_server1 = os.Getenv("MONGO2")
	//mongodb_server2 = os.Getenv("MONGO3")
	//mongodb_database = os.Getenv("MONGO_DB")
	//mongodb_collection = os.Getenv("MONGO_COLLECTION")
	//redis_server = os.Getenv("REDIS")

	n := negroni.Classic()
	mx := mux.NewRouter()
	initRoutes(mx, formatter)
	n.UseHandler(mx)
	return n
}

// API Routes
func initRoutes(mx *mux.Router, formatter *render.Render) {
	mx.HandleFunc("/ping", pingHandler(formatter)).Methods("GET")
	mx.HandleFunc("/reviews/{productID}", getAllReviewsHandler(formatter)).Methods("GET")
	mx.HandleFunc("/reviews", submitReviewHandler(formatter)).Methods("POST")
}

// API Ping Handler
func pingHandler(formatter *render.Render) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		formatter.JSON(w, http.StatusOK, struct{ Test string }{"API version 1.0 alive!"})
	}
}


// API  Handler --------------- Submit new user review (POST) ------------------
func submitReviewHandler(formatter *render.Render) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {

		//Connect to database
		session, err := mgo.Dial(mongodb_server)
		if err != nil {
			formatter.JSON(w, http.StatusInternalServerError, err.Error())
			return
		}

		defer session.Close()
		session.SetMode(mgo.PrimaryPreferred, true)
		c := session.DB(mongodb_database).C(mongodb_collection)

		var r review
		if err := json.NewDecoder(req.Body).Decode(&r); err != nil {
			formatter.JSON(w, http.StatusBadRequest, "Invalid request payload")
			return
		}

		fmt.Println(r)

		r.ReviewID = bson.NewObjectId()
		var result review

		if err := c.Insert(&r); err != nil {
			formatter.JSON(w, http.StatusInternalServerError, err.Error())
			return
		}

		if err := c.FindId(r.ReviewID).One(&result); err!=nil {
			formatter.JSON(w, http.StatusInternalServerError, err.Error())
			return
		}

		//err = c.Find(nil).Select(bson.M{"ProductIDString": productId}).All(&results)
		//err = c.Find(nil).All(&results)

		fmt.Println(result)

        if err != nil {
			var noReviews review
			formatter.JSON(w, http.StatusOK, noReviews)
        } else {
			formatter.JSON(w, http.StatusOK, result)
			return
        }
	}
}

// API  Handler --------------- Get all the reviews by all the users (GET) ------------------
func getAllReviewsHandler(formatter *render.Render) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {

		vars := mux.Vars(req)
		productId := vars["productID"]

		session, err := mgo.Dial(mongodb_server)
		if err != nil {
			formatter.JSON(w, http.StatusInternalServerError, err.Error())
			return
		}

		defer session.Close()
		session.SetMode(mgo.PrimaryPreferred, true)
		c := session.DB(mongodb_database).C(mongodb_collection)

		var results []review
		//var result review
		fmt.Println(productId)
		//err = c.Find(nil).Select(bson.M{"ProductIDString": productId}).All(&results)
		//err = c.Find(nil).Select(bson.M{"ProductIDString": productId}).All(&results)
		err = c.Find(bson.M{"ProductIDString": productId}).All(&results)
		//err = c.Find(nil).Select(bson.M{"ProductIDString": productId}).All(&results)
        //err = c.Find(nil).All(&results)
        if err != nil {
			var noReviews review
			formatter.JSON(w, http.StatusOK, noReviews)
        } else {
			formatter.JSON(w, http.StatusOK, results)
        }
   }
}

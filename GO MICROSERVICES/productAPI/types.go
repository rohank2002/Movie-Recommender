package main

import "gopkg.in/mgo.v2/bson"

type Product struct {
	ProductID   bson.ObjectId `bson:"_id" json:"productID"`
	Movie_id		string				`bson:"movie_id" json:"movie_id"`
	Director		string				`bson:"director" json:"director"`
	Year				string				`bson:"year" json:"year"`
	Released		string				`bson:"released" json:"released"`
	Genre				string				`bson:"genre" json:"genre"`
	ImdbRating	string				`bson:"imdbRating" json:"imdbRating"`
	Language		string				`bson:"language" json:"language"`
	ProductName string        `bson:"ProductName" json:"ProductName"`
	ProductDesc string        `bson:"ProductDesc" json:"ProductDesc"`
	Price       string        `bson:"Price" json:"Price"`
	Image       string        `bson:"Image" json:"Image"`
}

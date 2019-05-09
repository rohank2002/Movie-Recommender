package main

import "gopkg.in/mgo.v2/bson"

type Product struct {
	
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

type Cart struct {
	CartID   bson.ObjectId `bson:"_id" json:"CartID"`
	Total    string          `bson:"Total" json:"Total"`
	Products []Product     `bson:"Products" json:"Products"`
}

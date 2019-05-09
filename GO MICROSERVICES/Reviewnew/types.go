package main

import "gopkg.in/mgo.v2/bson"

type review struct {
	ReviewID           bson.ObjectId `bson:"_id" json:"ReviewID"`
	ReviewString       string        `bson:"ReviewString" json:"ReviewString"`
	ProductIDString    string        `bson:"ProductIDString" json:"ProductIDString"`
	UserIDString			 string 			 `bson:"UserIDString" json:"UserIDString"`
}

#! /usr/bin/env bash


mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection cart --jsonArray --out cart.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection order --jsonArray --out order.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection payment --jsonArray --out payment.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection products --jsonArray --out products.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection reviews--jsonArray --out reviews.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection sample --jsonArray --out sample.json
mongoexport --uri mongodb://cmpe274:cmpe274@54.214.184.72:27017/just_watch --collection users --jsonArray --out user.json

import numpy as np
import pandas as pd
import pickle
ratings_data = pd.read_csv("ratings.csv")
#print(ratings_data.head())

movie_names = pd.read_csv("movies.csv")
movie_names.head()

movie_data = pd.merge(ratings_data, movie_names, on='movieId')
#print(movie_data.head())
ratings_mean_count = pd.DataFrame(movie_data.groupby('movieId')['rating'].mean())
#print(ratings_mean_count.head())
ratings_mean_count['rating_counts'] = pd.DataFrame(movie_data.groupby('movieId')['rating'].count())
#print(ratings_mean_count.head())

user_movie_rating = movie_data.pivot_table(index='userId', columns='movieId', values='rating')
#print(user_movie_rating.head() )
class recommend():
    def predict(self,id):
        query_movie=user_movie_rating[id]
        #print(query_movie.head())
        movies_like_query = user_movie_rating.corrwith(query_movie)

        corr_query = pd.DataFrame(movies_like_query, columns=['Correlation'])
        corr_query.dropna(inplace=True)
        #print(corr_query.head())
        corr_query = corr_query.join(ratings_mean_count['rating_counts'])
        #print(corr_query.head())
        c = corr_query[corr_query['rating_counts'] > 10].sort_values('Correlation',ascending=False).head()
        #print(c)
        d = c.to_dict()
        results = []
        for i in d["Correlation"].keys():
            results.append(i)
        return results[1:]
recommender=recommend()
#r=recommender.predict(236)
pickle.dump(recommender,open('model.pkl','wb'))
model = pickle.load( open('model.pkl','rb'))
print(model.predict(2))

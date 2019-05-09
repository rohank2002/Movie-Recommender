#from model import recommend
import pandas as pd
import pickle
movie_names = pd.read_csv("C:\\Users\\kamat\\.ipynb_checkpoints\\ml-latest-small\\movies.csv")
#print(movie_names)
movie_id=list(movie_names["movieId"])
#print(movie_id)
model = pickle.load(open('model.pkl','rb'))
print(model.predict(movie_id[0]))




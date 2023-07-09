# %%
import numpy as np
import pandas as pd
import ast
import sys

# %%
movies = pd.read_csv('public/tmdb_5000_movies.csv')
credits = pd.read_csv('public/tmdb_5000_credits.csv') 

# %%
movies = movies.merge(credits,on='title')

# %%
movies = movies[['movie_id','title','overview','genres','keywords','cast','crew']]

# %%
def get_names(val):
    L = []
    for i in ast.literal_eval(val):
        L.append(i['name']) 
    return L 

# %%
movies.dropna(inplace=True)

# %%
movies['genres'] = movies['genres'].apply(get_names)

# %%
movies['keywords'] = movies['keywords'].apply(get_names)

# %%
def convert(val):
    L = []
    counter = 0
    for i in ast.literal_eval(val):
        if counter < 3:
            L.append(i['name'])
        counter += 1

    return L

# %%
movies['cast'] = movies['cast'].apply(convert)

# %%
def fetch_directors(text):
    L = []
    for i in ast.literal_eval(text):
        if i['job'] == 'Director':
            L.append(i['name'])
    return L

# %%
movies['crew'] = movies['crew'].apply(fetch_directors)

# %%
movies['overview'] = movies['overview'].astype(str).str.split()

# %%
def collapse(L):
    L1 = []
    for i in L:
        L1.append(i.replace(" ", ""))   
    return L1

# %%
movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']

# %%
movies_transformed = movies.drop(columns=['overview', 'genres', 'keywords', 'cast', 'crew'])

# %%
movies_transformed['tags'] = movies_transformed['tags'].apply(lambda x: " ".join(x))

# %%
import nltk

# %%
from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()

# %%
def stem(text):
    y = []
    
    for i in text.split():
        y.append(ps.stem(i))
        
    return " ".join(y)

# %%
movies_transformed['tags'] = movies_transformed['tags'].apply(stem)

# %%
from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=5000,stop_words='english')

# %%
vector = cv.fit_transform(movies_transformed['tags']).toarray()

# %%
from sklearn.metrics.pairwise import cosine_similarity

# %%
similarity = cosine_similarity(vector)

# %%
def recommend(movie):
    index = movies_transformed[movies_transformed['title'] == movie].index[0]
    distances = sorted(list(enumerate(similarity[index])),reverse=True,key = lambda x: x[1])
    for i in distances[1:7]:
        print(movies_transformed.iloc[i[0]].title+",")

# %%
recommend(str(sys.argv[1]))

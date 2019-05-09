import pandas as pd
from collections import Counter
from efficient_apriori import apriori
import pickle
#from efficient_apriori import itemsets_from_transactions
ratings_data = pd.read_csv("ratings.csv")
c=list(ratings_data["userId"])
d=Counter(c)
movie=list(ratings_data["movieId"])
transactions = []
c = 0
for i in range(len(d) + 1):
    r = c + d[i]
    n_l = movie[c:r]
    c += d[i]
    transactions.append(n_l)
#print(len(transactions[610]))
r_transactions=transactions[1:len(transactions)]
#print(len(r_transactions[1]))
t=[]
for l in r_transactions:
    c=tuple(l)
    t.append(c)
#print(len(t[609]))
_, rules = apriori(t[1:], min_support=0.1,  min_confidence=1)
#print(rules[0])
ru={}
for rule in rules:
    ru[rule.lhs]=rule.rhs
#print(ru)
class apriorapi():
    def predict(self,l):
        ip=tuple(l)
        c = []
        ap=[]
        for k, v in ru.items():
            if sorted(ip) == sorted(k):
                ap=list(ru[k])
        if len(ap) !=0:
            return ap
        elif len(ap) ==0:
            for k, v in ru.items():
                if ip[0] in k:
                    c.append(list(ru[k]))
            A = []
            for i in c:
                A.extend(i)
            c = set(A)
            return list(c)

appr=apriorapi()
#print(appr.predict([1210, 2791]))
pickle.dump(appr,open('model.pkl','wb'))
model = pickle.load( open('model.pkl','rb'))
#print(model.predict([1]))












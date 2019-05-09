import csv
from datetime import datetime
import json

def writeJSON(data,file_name="output.json"):
    with open(file_name,"w") as file:
        json.dump(data,file)

def writeCSV(data,file_name="output.json"):
    with open(file_name,'w') as file:
        field_names = ["_id","movie_id","director","year","released","genre","language","imdbRating","ProductName","ProductDesc","Image"]
        writer = csv.DictWriter(csv_file, fieldnames=field_names)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
        json.dump(data, file)


def validRecord(record):
    # for key in record.keys():
    #     print(key,type(record[key]))
    for key in record.keys():
        if key=="_id" or key=="__v" or record[key]==None:
            continue

        s = record[key].strip()
        if s==None or s=="" or s=="N/A":
            return (False,{})
    try:
        date_object = datetime.strptime(record['released'],'%d %b %Y').date()
        record['released'] = '{:%Y-%m-%d}'.format(date_object)

        genres = record['genre'].split(",")
        languages = record['language'].split(",")
        
        record['genre'] = genres
        record['language'] = languages

        record['imdbRating'] = float(record['imdbRating'])
        record['Price'] = float(record['Price'])
        record['movie_id'] = int(record['movie_id'])
        record['year'] = int(record['year'])
        
        return (True,record)

    except:
        return (False,{})

    # for key in record.keys():
    #     print(key,type(record[key]))
    # print(record["_id"])
    # date_object = datetime.strptime(record['released'],'%d %b %Y').date()
    # record['released'] = '{:%Y-%m-%d}'.format(date_object)

    # genres = record['genre'].split(",")
    # languages = record['language'].split(",")
        
    # record['genre'] = genres
    # record['language'] = languages

    # record['imdbRating'] = float(record['imdbRating'])
    # record['Price'] = float(record['Price'])
    # record['movie_id'] = int(record['movie_id'])
    # record['year'] = int(record['year'])
    # #print(record)
    # return (True,record)
    

def read_csv(file_name=""):
    filtered=[]
    with open(file_name,'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        next(reader)
        for row in reader:
            validity,record = validRecord(row)
            if validity:
                filtered.append(record)
    
    writeCSV(filtered,"productsformatted.json")
    print("All records have been written")

def read_json(file_name=""):
    filtered = []
    with open(file_name) as json_file:
        data = json.load(json_file)
        for row in data:
            validity,record = validRecord(row)
            if validity:
                filtered.append(record)
    
    writeJSON(filtered,"productsformatted.json")
                



if __name__ == "__main__":
    read_json("products.json")
    
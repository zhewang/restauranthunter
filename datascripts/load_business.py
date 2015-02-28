import json
import pymysql
import argparse

def InsertToMySQL(conn, record):
    cursor = conn.cursor()

    cursor.execute(  "INSERT business values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        [record['business_id'],record['name'].encode('utf-8'),record['full_address'].encode('utf-8'),record['city'].encode('utf-8'),record['state'],
        record['latitude'], record['longitude'],record['stars'],record['review_count'],record['open']] )
   
def main(fileName):
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')

    with open(fileName,'r') as f:
        for line in f:
            record = json.loads(line)
            if 'Restaurants' in record['categories']:
                InsertToMySQL(conn, record)

    conn.commit()
    conn.close()

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("fileName", help="Json file path")
    args = parser.parse_args()

    main(args.fileName)
    
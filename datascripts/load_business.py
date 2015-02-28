import json
import pymysql

def InsertToMySQL(conn, record):
    cursor = conn.cursor()
    query = "INSERT business values ('{0}',\"{1}\",\"{2}\",'{3}','{4}',{5},{6},{7},{8},{9})".format(
        record['business_id'],record['name'],record['full_address'].replace('\n',', '),record['city'],record['state'],
        record['latitude'], record['longitude'],record['stars'],record['review_count'],record['open'])
    cursor.execute( query )

def main(fileName):
    conn = pymysql.Connect(host='localhost', user='root', passwd='', db='yelpdb')

    with open(fileName,'r') as f:
        for line in f:
            record = json.loads(line)
            InsertToMySQL(conn, record)

    conn.commit()
    conn.close()

if __name__ == '__main__':

    fileName = "test_business.json"
    main(fileName)
    
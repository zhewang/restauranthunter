import json
import pymysql
import argparse

def InsertToMySQL(conn, record):
    cursor = conn.cursor()

    cursor.execute( "INSERT review (business_id, user_id, stars, date) values (%s,%s,%s,%s)", [
        record['business_id'], record['user_id'], record['stars'], record['date']])
   
def main(fileName):
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')

    with open(fileName,'r') as f:
        for line in f:
            record = json.loads(line)
            InsertToMySQL(conn, record)

    conn.commit()
    conn.close()

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("fileName", help="Json file path")
    args = parser.parse_args()

    main(args.fileName)
    
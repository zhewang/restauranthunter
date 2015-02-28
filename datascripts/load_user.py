import json
import pymysql
import argparse

def InsertToMySQL(conn, record):
    cursor = conn.cursor()

    cursor.execute( "INSERT user values (%s,%s,%s,%s,%s)", [
        record['user_id'], record['name'], record['review_count'],
        record['average_stars'], record['yelping_since']])
   
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
    
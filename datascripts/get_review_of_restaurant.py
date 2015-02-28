import json
import pymysql

finalResult = {}

def QueryDB(business_id):
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT stars, date FROM review WHERE business_id = %s", business_id )
    conn.commit()

    result = cursor.fetchall()

    finalResult[business_id]=result

    conn.close()

if __name__ == '__main__':

    business_ids = ['--jFTZmywe7StuZ2hEjxyA','-0bl9EllYlei__4dl1W00Q']
    for business_id in business_ids:
        QueryDB(business_id)

    f = open('results.txt','w')
    f.write(json.dumps(finalResult))
    f.close()
    
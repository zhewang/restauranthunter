import json
import pymysql

finalResult = {}

def GetReviewsByID(business_id):
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT stars, date FROM review WHERE business_id = %s", business_id )
    conn.commit()

    result = cursor.fetchall()

    finalResult[business_id]=result

    conn.close()

def GetBusinessID():
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT business_id FROM business limit 100" )
    conn.commit()

    ids = cursor.fetchall()

    conn.close()

    return ids

if __name__ == '__main__':

    business_ids = GetBusinessID()

    for business_id in business_ids:
        GetReviewsByID(business_id[0])

    f = open('results.json','w')
    f.write(json.dumps(finalResult, sort_keys=True, indent=4))
    f.close()
    
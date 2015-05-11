import json
import pymysql


def GetReviewsByID(business_id):
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT stars, date FROM review WHERE business_id = %s", business_id )
    conn.commit()

    result = cursor.fetchall()

    return result


def GetAZResturants():
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT business_id, name, latitude, longitude, stars FROM business where city='Phoenix' and review_count > 5" )
    conn.commit()

    results = cursor.fetchall()

    conn.close()

    return results

if __name__ == '__main__':

    r = GetAZResturants()
    ids = []
    finalResults = {}
    for i in r:
        finalResults[i[0]] = GetReviewsByID(i[0])

    f = open('az100.json','w')
    f.write(json.dumps(r, sort_keys=True, indent=4))
    f.close()

    f = open('reviews.json','w')
    f.write(json.dumps(finalResults, sort_keys=True, indent=4))
    f.close()

import json
import pymysql

def GetAZResturants():
    conn = pymysql.Connect(host='localhost', user='root', passwd='',charset='utf8', db='yelpdb')
    cursor = conn.cursor()

    cursor.execute( "SELECT name, latitude, longitude FROM business where state='AZ' limit 100" )
    conn.commit()

    results = cursor.fetchall()

    conn.close()

    return results

if __name__ == '__main__':

    r = GetAZResturants()

    # for i in r:
    #     print(i[0],i[1],i[2])


    f = open('az100.json','w')
    f.write(json.dumps(r, sort_keys=True, indent=4))
    f.close()
    
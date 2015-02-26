import json

def InsertToMySQL(record):
    print(record['name'])

def main(fileName):
    with open(fileName,'r') as f:
        for line in f:
            record = json.loads(line)
            InsertToMySQL(record)

if __name__ == '__main__':

    fileName = "test_business.json"
    main(fileName)



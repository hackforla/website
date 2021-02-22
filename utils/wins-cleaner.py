import requests as re
import os
import uuid
import json
from dotenv import load_dotenv
load_dotenv()

WINS_API_KEY = os.getenv('WINS_API_KEY')
SPREAD_SHEET_ID = '1zkr_dEyiT-WTksUkVyL4jYQuYC5_YvJCLrUIfBf1CeE'
BASE_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets'


#request_url = f"{BASE_API_URL}/{SPREAD_SHEET_ID}/values/\'Sheet1\'!A1:O?key={WINS_API_KEY}"
request_url = f"{BASE_API_URL}/{SPREAD_SHEET_ID}/values/\'Sheet1\'!A1:O?key=AIzaSyDsY0jyeGRnVYmQco1Pt0fW3iDyfHiyYZE"


request_data = re.get(request_url).json()['values']
keys = request_data[0]

#Example 1 liner: container = [{f'{keys[index]}':value.replace('""',"") for (index,value) in enumerate(person) if keys[index] != 'email'} for person in request_data[1::] if person[13] != 'FALSE']

container = []
for person in request_data[1::]:
    obj={}
    if person[13] != 'FALSE':
        for (index,value) in enumerate(person):
            if keys[index] != 'email' :
                obj[keys[index]] = value.replace('""','')
        del obj['display']
        
        container.append(obj)


with open('_data/_wins-data.json','w+') as f: 
    json.dump(container,f,indent=4)














# class Wins():

#     def __init__(self,time,email,name,linkedin_url,linkedin_permission,github_url,githhub_permission,team,role,specific_role,join_date,win,overview,crap,display):
#         self.userdata = {'id':uuid.uuid4().hex,
#                          'time':time,
#                          'email':email,
#                          'name':name,
#                          'linkedin_url':linkedin_url,
#                          'linkedin_permission':linkedin_permission,
#                          'github_url':githhub_permission,
#                          'team':team,
#                          'role':role,
#                          'specific_role':specific_role,
#                          'join_date':join_date,
#                          'win':win,
#                          'overview':overview,
#                          'display':display
#                          }
    
# # windata = Wins(*request_data[1])
# # print(windata.userdata)

# write_ready_object = [ Wins(*item).userdata for item in request_data ]
# print(write_ready_object)
# -*- coding: utf-8 -*-
"""
Created on Thu Jan 30 22:24:52 2020

@author: Niall
"""

from VisualizeApp.models import Calls
import json

data = json.load('./TestData.json')

print(data)

objs = []

def create_data(data):
    objs = []

    for row in data:
        print(row)
        obj = Calls(details=data['details'])
        objs.append(obj)
    
    #Calls.objects.bulk_create(objs)
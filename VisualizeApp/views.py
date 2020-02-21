from django.shortcuts import render
from .models import Station
from .models import Calls
from django.http import HttpResponse
from django.core import serializers
import json

from django.db.models import Count
from django.db.models import Avg
from django.db.models import IntegerField
from django.db.models.functions import Cast

#Get total calls for station
masterCalls = Calls.objects.all()

def home(request): #Handles logic of certain route
	return render(request, 'VisualizeApp/home.html')
	#Pass in variable: render(request, 'VisualizeApp/home.html', Name)

def about(request):
	return render(request, 'VisualizeApp/about.html')
	#Pass in variable in dictionary directly: render(request, 'VisualizeApp/home.html', {'title': 'About'})

def map(request):

	json_serializer = serializers.get_serializer("json")()
	
	#Fetch all stations
	allStations = Station.objects.all()

	#Serialize all stations
	stations = json_serializer.serialize(allStations, ensure_ascii=False)

	#Create arguments and render page
	args = {'stations': stations}
	
	return render(request, 'VisualizeApp/map.html', args)

def visualizations(request):
	return render(request, 'VisualizeApp/visualizations.html')

#TestCalls:
	#calls = json_serializer.serialize(Calls.objects.all()[:2], ensure_ascii=False)
	#calls = Calls.objects.filter(details__StationArea="Tallaght")

	#for call in calls:
		#print(call.details)

def get_overall_data(request):

	input = request.POST['station']
	
	#json_serializer = serializers.get_serializer("json")()

	#Get total calls for station
	overallCalls = masterCalls.filter(details__StationArea = input)

	#Get total number of calls
	overallNum = overallCalls.count()
	response_list = [overallNum]

	# ---------- DA ---------- #

	#Get total number of calls for station DA
	DATotal = overallCalls.filter(details__Agency = 'DA').count()
	response_list.append(DATotal)

	#Get most popular incidents
	#PopIncident = DATotal.values('details__Incident').annotate(Count=Count('details__Incident')).order_by('-Count')[:1]
	#response_list.append(PopIncident)
	#print(PopIncident)

	# ---------- DF ---------- #

	#Get total number of calls for station DF
	DF = overallCalls.filter(details__Agency = 'DF').count()
	response_list.append(DF)

	response_data={}

	try:
		response_data['result'] = input;
		response_data['message'] = response_list;
	except:
		response_data['result'] = "Failure"
		response_data['message'] = "Error";

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_calls_unit(request):

	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']

	response_data={}

	if year == "NA":
		#Get total calls for station year
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input)
		else:
			totalCalls = masterCalls.filter(details__Agency = type, details__StationArea = input)
		
		for x in range(2013, 2019):
			calls = totalCalls.filter(details__Date__endswith=x).count()
			response_data[x] = calls
	else:
		#Get total calls for station month
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input)
		else:
			totalCalls = masterCalls.filter(details__Date__endswith=year, details__Agency = type, details__StationArea = input)
		
		#Format: 01/01/2018
		for x in range(1, 13):
			time = str(x) + "/" + str(year)
			calls = totalCalls.filter(details__Date__endswith=time).count()
			response_data[x] = calls

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_incidents(request):

	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']

	response_data={}
	
	######## Decide what is required ########
	#!year
	if year == 'NA':
		#!year, !type
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!year, type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)
	#year
	else:
		#!type, year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#type, year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)	

	#Get most popular incidents
	PopIncident = overallCalls.values('details__Incident').annotate(Count=Count('details__Incident')).order_by('-Count')[:6]

	#Add to dictionary
	for incident in PopIncident:
		#print(incident['details__Incident'] + " " + str(incident['Count']))
		response_data[str(incident['details__Incident'])] = incident['Count']

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_avg_response(request):
	
	#Calculate average response time
	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']

	response_data={}

	def calculateAverages(overallCalls, year):
		#Get list of both categories
		totalTOC_ORD = list(overallCalls.values('details__TOC-ORD-Cat').values_list('details__TOC-ORD-Cat', flat=True))
		totalORD_MOB = list(overallCalls.values('details__ORD-MOB-Cat').values_list('details__ORD-MOB-Cat', flat=True))

		totalTOCORD = 0
		totalORDMOB = 0

		totalNAN = 0

		#Add to get averages
		for item in totalTOC_ORD:
			totalTOCORD = totalTOCORD + int(float(item))

		for item in totalORD_MOB:
			#Deal with NaNs
			if item == 'nan':
				totalNAN = totalNAN + 1
			else:
				totalORDMOB = totalORDMOB + int(float(item))

		averageResponse = (totalTOCORD + totalORDMOB)/(len(totalTOC_ORD) + len(totalORD_MOB) - totalNAN)

		response_data[year] = averageResponse
	#End calculateAverages

	######## Decide what is required ########
	### Get all calls ###
	#!year
	if year == 'NA':
		#!year, !type
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!year, type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)

		#Calculate every year
		for x in range(2013, 2019):
			filterCalls = overallCalls.filter(details__Date__endswith=x)
			calculateAverages(filterCalls, x)

	#year
	else:
		#!type, year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#type, year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)

		for x in range(1, 13):
			time = str(x) + "/" + str(year)
			calls = overallCalls.filter(details__Date__endswith=time)
			calculateAverages(calls, x)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_total_cats(request):

	#Calculate total amount for each cat
	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']

	response_data={}

	######## Decide what is required ########
	#!year
	if year == 'NA':
		#!year, !type
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!year, type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)
	#year
	else:
		#!type, year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#type, year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)

	list = ["TOC-ORD-Cat", "ORD-MOB-Cat", "MOB-IA-Cat", "IA-MAV-Cat", "MAV-CD-Cat"]

	#Run through classifications of classes
	for cat in range(1, 11):
		total = 0
		catStr = str(cat)
		for category in list:
			#Run though classes
			result = "details__" + category
			num = overallCalls.filter(**{result: catStr}).count()
			total = total + num
		response_data[cat] = total

	print(response_data)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")
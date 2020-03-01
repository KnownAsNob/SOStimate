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

days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

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

############### Map Functions ###############
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
	month = request.POST['month']
	day = request.POST['day']

	response_data={}

	case = decideCase(year, month, day)

	#1 = !Year
	#2 = #Year, !Month
	#3 = #Year, Month, !Day
	#4 = #Year, Month, Day

	#!Year
	if case == 1:
		#Overall
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input)
		#Agency Specified
		else:
			totalCalls = masterCalls.filter(details__Agency = type, details__StationArea = input)
		#Cycle through all years
		for x in range(2013, 2019):
			calls = totalCalls.filter(details__Date__endswith=x).count()
			response_data[x] = calls
	#Year, !Month
	elif case == 2:
		#Get total calls for each month
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input)
		else:
			totalCalls = masterCalls.filter(details__Date__endswith=year, details__Agency = type, details__StationArea = input)
		#Cycle though all months
		for x in range(1, 13):
			time = str(x) + "/" + str(year)
			calls = totalCalls.filter(details__Date__endswith=time).count()
			response_data[x] = calls
	#Year, Month, !Day
	elif case == 3:
		#Generate month + year to filter
		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strMonth + "/" + str(year)

		#Get total calls for each day of month
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			totalCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		no_days = days_in_month[int(month) - 1]

		#Cycle though all days in month
		for x in range(1, no_days + 1):
			day = str(x)

			if len(day) == 1:
				day = "0" + day

			time = day + "/" + filter
			calls = totalCalls.filter(details__Date = time).count()
			response_data[x] = calls
	#Year, Month, Day
	else:
		day = str(day)
		month = str(month)
		year = str(year)

		if len(day) == 1:
			day = "0" + day

		if len(month) == 1:
			month = "0" + month

		date = day + "/" + month + "/" + str(year)

		#Get total calls for each hour of day
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input, details__Date = date)
		else:
			totalCalls = masterCalls.filter(details__Date = date, details__Agency = type, details__StationArea = input)

		#Cycle though all hours in day
		for x in range(0, 25):
			hour = str(x)
			if len(hour) == 1:
				hour = "0" + hour
			calls = totalCalls.filter(details__TOC__startswith = hour).count()
			response_data[x] = calls

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_incidents(request):

	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']
	month = request.POST['month']
	day = request.POST['day']

	response_data={}

	case = decideCase(year, month, day)

	#1 = !Year
	#2 = #Year, !Month
	#3 = #Year, Month, !Day
	#4 = #Year, Month, Day
	
	######## Decide what is required ########
	#!Year
	if case == 1:
		#Overall
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!year, type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)
			
	#Year, !Month
	elif case == 2:
		#!type, year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#type, year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)
	
	#Year, Month, !Day
	elif case == 3:
		#Generate month + year to filter
		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strMonth + "/" + str(year)

		#Get incidents for each day of month
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			overallCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		no_days = days_in_month[int(month) - 1]
			
	#Year, Month, Day
	else:
		day = str(day)
		month = str(month)
		year = str(year)

		if len(day) == 1:
			day = "0" + day

		if len(month) == 1:
			month = "0" + month

		date = day + "/" + month + "/" + str(year)

		#Get total calls for each hour of day
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date = date)
		else:
			overallCalls = masterCalls.filter(details__Date = date, details__Agency = type, details__StationArea = input)


	#Get most popular incidents
	PopIncident = overallCalls.values('details__Incident').annotate(Count=Count('details__Incident')).order_by('-Count')[:6]

	#Add to dictionary
	for incident in PopIncident:
		#print(incident['details__Incident'] + " " + str(incident['Count']))
		response_data[str(incident['details__Incident'])] = incident['Count']

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_avg_response(request):
	
	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']
	month = request.POST['month']
	day = request.POST['day']

	response_data={}

	case = decideCase(year, month, day)

	#1 = !Year
	#2 = #Year, !Month
	#3 = #Year, Month, !Day
	#4 = #Year, Month, Day

	def calculateAverages(overallCalls, timeUnit):
		#Get list of both categories
		totalTOC_ORD = list(overallCalls.values('details__TOC-ORD-Cat').values_list('details__TOC-ORD-Cat', flat=True))
		totalORD_MOB = list(overallCalls.values('details__ORD-MOB-Cat').values_list('details__ORD-MOB-Cat', flat=True))

		totalTOCORD = 0
		totalORDMOB = 0

		totalNAN = 0

		#Check not = 0
		if not totalTOC_ORD:
			response_data[timeUnit] = 0

		else:
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

			response_data[timeUnit] = averageResponse
	#End calculateAverages

	######## Decide what is required ########
	#!Year
	if case == 1:
		#!Year, !Type
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!Year, Type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)

		#Calculate every year
		for x in range(2013, 2019):
			filterCalls = overallCalls.filter(details__Date__endswith=x)
			calculateAverages(filterCalls, x)
			
	#Year, !Month
	elif case == 2:
		#!Type, Year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#Type, Year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)

		for x in range(1, 13):
			time = str(x) + "/" + str(year)
			calls = overallCalls.filter(details__Date__endswith=time)
			calculateAverages(calls, x)
		
	
	#Year, Month, !Day
	elif case == 3:
		#Generate month + year to filter
		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strMonth + "/" + str(year)

		#Get incidents for each day of month
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			overallCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		for x in range(1, days_in_month[int(month)]):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + filter
			calls = overallCalls.filter(details__Date=time)
			calculateAverages(calls, x)
			
	#Year, Month, Day
	else:
		#Generate month + year to filter
		strDay = str(day)

		if len(strDay) == 1:
			strDay = "0" + strDay

		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strDay + "/" + strMonth + "/" + str(year)

		#Get incidents for each day of month
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			overallCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		for x in range(1, 25):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr
			
			calls = overallCalls.filter(details__TOC__startswith=x)
			calculateAverages(calls, x)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_avg_travel(request):
	
	input = request.POST['station']
	type = request.POST['type']
	year = request.POST['year']
	month = request.POST['month']
	day = request.POST['day']

	response_data={}

	case = decideCase(year, month, day)

	#1 = !Year
	#2 = #Year, !Month
	#3 = #Year, Month, !Day
	#4 = #Year, Month, Day

	def calculateAverages(overallCalls, timeUnit):
		#Get list of both categories
		totalMOB_IA = list(overallCalls.values('details__MOB-IA-Cat').values_list('details__MOB-IA-Cat', flat=True))

		totalMOBIA = 0

		totalNAN = 0

		#Check not = 0
		if not totalMOB_IA:
			response_data[timeUnit] = 0

		else:
			#Add to get averages
			for item in totalMOB_IA:
				#Deal with NaNs
				if item == 'nan':
					totalNAN = totalNAN + 1
				else:
					totalMOBIA = totalMOBIA + int(float(item))

			if totalMOBIA == 0:
				response_data[timeUnit] = 0

			else:
				averageResponse = totalMOBIA/(len(totalMOB_IA) - totalNAN)

				response_data[timeUnit] = averageResponse
	#End calculateAverages

	######## Decide what is required ########
	
	#!Year
	if case == 1:
		#!Year, !Type
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input)
		#!Year, Type
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Agency = type)

		#Calculate every year
		for x in range(2013, 2019):
			filterCalls = overallCalls.filter(details__Date__endswith=x)
			calculateAverages(filterCalls, x)
			
	#Year, !Month
	elif case == 2:
		#!Type, Year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#Type, Year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)

		for x in range(1, 13):
			time = str(x) + "/" + str(year)
			calls = overallCalls.filter(details__Date__endswith=time)
			calculateAverages(calls, x)
		
	
	#Year, Month, !Day
	elif case == 3:
		#Generate month + year to filter
		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strMonth + "/" + str(year)

		#Get incidents for each day of month
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			overallCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		for x in range(1, days_in_month[int(month)]):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + filter
			calls = overallCalls.filter(details__Date=time)
			calculateAverages(calls, x)
			
	#Year, Month, Day
	else:
		#Generate month + year to filter
		strDay = str(day)

		if len(strDay) == 1:
			strDay = "0" + strDay

		strMonth = str(month)

		if len(strMonth) == 1:
			strMonth = "0" + strMonth

		filter = strDay + "/" + strMonth + "/" + str(year)

		#Get incidents for each day of month
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=filter)
		else:
			overallCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = type, details__StationArea = input)

		for x in range(1, 25):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr
			
			calls = overallCalls.filter(details__TOC__startswith=x)
			calculateAverages(calls, x)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

#Unused: 
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

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

#Decide time details to provide
def decideCase(year, month, day):

	#1 = !Year
	#2 = #Year, !Month
	#3 = #Year, Month, !Day
	#4 = #Year, Month, Day

	#!Year
	if year == "NA":
		return 1
	#Year
	else:
		#Year, !Month
		if month == "NA":
			return 2
		#Year, Month
		else:
			#Year, Month, !Day
			if day == "NA":
				return 3
			#Year, Month, Day
			else:
				return 4

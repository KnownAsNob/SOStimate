from django.shortcuts import render
from .models import Station
from .models import Calls
from .models import MapDisplay

from django.http import HttpResponse
from django.core import serializers
from django.core.serializers import serialize

import json
from django.http import JsonResponse

from django.db.models import Count
from django.db.models import Avg
from django.db.models import IntegerField
from django.db.models.functions import Cast


#Get total calls for station - Fetch from database once
masterCalls = Calls.objects.all()

days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

#Render static files on request
def home(request):
	return render(request, 'VisualizeApp/home.html')

def about(request):
	return render(request, 'VisualizeApp/about.html')
	
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

def accessibility(request):
	return render(request, 'VisualizeApp/accessibility.html')

############### Dashboard Queries ###############

def get_overall_data(request):

	input = request.POST['station']

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

	#Try add data, return error to stop app crash
	try:
		response_data['result'] = input;
		response_data['message'] = response_list;
	except:
		response_data['result'] = "Error!"
		response_data['message'] = "Error!";

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
			calls = totalCalls.filter(details__Date__endswith=str(x)).count()
			response_data[x] = calls
	
	#Year, !Month
	elif case == 2:
		#Get total calls for each month
		if type == "Overall":
			totalCalls = masterCalls.filter(details__StationArea = input)
		else:
			totalCalls = masterCalls.filter(details__Date__endswith=str(year), details__Agency = type, details__StationArea = input)
		#Cycle though all months
		for x in range(1, 13):
			
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + str(year)

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
		for x in range(0, 24):
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

	#Decides whether to limit incidents
	daily = 5

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

		daily = 3

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
	PopIncident = overallCalls.values('details__Incident').annotate(Count=Count('details__Incident')).order_by('-Count')[:daily]

	#Add to dictionary
	for incident in PopIncident:
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

			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + str(year)

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

		for x in range(1, days_in_month[int(month) - 1] + 1):
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

		for x in range(0, 24):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr
			
			calls = overallCalls.filter(details__TOC__startswith=xStr)
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

			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + str(year)

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

		for x in range(1, days_in_month[int(month) - 1] + 1):
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

		for x in range(0, 24):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr
			
			calls = overallCalls.filter(details__TOC__startswith=xStr)
			calculateAverages(calls, x)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

def get_incident_lengths(request):

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

	def getCalls(calls, timeUnit, type):

		callList = []

		def getTimes(list):
			for item in list:

				if item is not None and item != 'nan':
					if len(item) != 8:
						item = "0" + item

					hour = int(item[1])
					
					if hour > 0:
						hour = 60 * hour

					item = item[2:5]
					item = item.replace(':', '')
					item = int(item) + hour
					
					callList.append(item)
		
		if type == "DA":
			IALS_Amb_List = list(calls.values('details__IA-LS').values_list('details__IA-LS', flat=True))
			
			getTimes(IALS_Amb_List)
		
		elif type == "DF":
			IALS_Fire_List = list(calls.values('details__IA-MAV').values_list('details__IA-MAV', flat=True))
			
			getTimes(IALS_Fire_List)
		
		else:
			IALS_Amb_List = list(calls.values('details__IA-LS').values_list('details__IA-LS', flat=True))
			IALS_Fire_List = list(calls.values('details__IA-MAV').values_list('details__IA-MAV', flat=True))

			getTimes(IALS_Amb_List)
			getTimes(IALS_Fire_List)

		response_data[timeUnit] = callList

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
			getCalls(filterCalls, x, type)	
			
	#Year, !Month
	elif case == 2:
		#!Type, Year
		if type == "Overall":
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year)
		#Type, Year
		else:
			overallCalls = masterCalls.filter(details__StationArea = input, details__Date__endswith=year, details__Agency = type)

		for x in range(1, 13):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + str(year)
			
			calls = overallCalls.filter(details__Date__endswith=time)
			getCalls(calls, x, type)
		
	
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

		for x in range(1, days_in_month[int(month) - 1] + 1):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr

			time = xStr + "/" + filter
			calls = overallCalls.filter(details__Date=time)
			getCalls(calls, x, type)
			
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

		for x in range(0, 24):
			xStr = str(x)

			if len(xStr) == 1:
				xStr = "0" + xStr
			
			calls = overallCalls.filter(details__TOC__startswith=xStr)
			getCalls(calls, x, type)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

############### Map Overlay Queries ################

def get_calls_year(request):

	type = request.POST['type']

	stations = ["Tara Street", "Tallaght", "Kilbarrack", "Dun Laoghaire", "Rathfarnham", "Phibsborough", "Dolphins Barn", "Swords", "North Strand", "Donnybrook", "Finglas", "Skerries", "Blanchardstown", "Balbriggan"]

	response_data={}

	if type == "Most_Pop":

		stationCalls = MapDisplay.objects.filter(name="No_Calls")

	elif type == "Avg_Response":

		stationCalls = MapDisplay.objects.filter(name="Avg_Response")

	elif type == "Avg_Travel":

		stationCalls = MapDisplay.objects.filter(name="Avg_Travel")

	elif type == "Avg_Travel_Hosp":

		stationCalls = MapDisplay.objects.filter(name="Avg_Travel_Hosp")

	elif type == "Avg_Hosp_Time":

		stationCalls = MapDisplay.objects.filter(name="Avg_Hosp_Time")

	#Process the data
	for x in stations:

		yearResponse={}

		for year in range(2013, 2019):
			calls = stationCalls.values_list("info__Year__" + str(year), flat=True).get(info__Station=x)
			
			yearResponse[year] = calls

		response_data[x] = yearResponse

	return HttpResponse(json.dumps(response_data), content_type = "application/json")	

############### Custom Visualizer Queries ################

def get_graph_data(request):
	
	stations = request.POST.getlist('stations[]')
	agency = request.POST['agency']
	selectedData = request.POST.getlist('selectedData[]')
	selectedDataDisplay = request.POST['selectedDataDisplay']
	selectedYears = request.POST.getlist('selectedYears[]')
	monthsIncl = request.POST.getlist('monthsIncl[]')
	selectedGraph = request.POST['selectedGraph']

	##### Line graph #####

	if selectedGraph == "LineGraph":

		response_data = {}

		# No months required # 
		if monthsIncl[0] == "No_Months":
			#Operation for each station
			for station in stations:
				
				year_data = {}

				#Operation for each year
				for year in selectedYears:

					if agency == "Overall":
						yearCalls = masterCalls.filter(details__Date__endswith=year, details__StationArea = station).count()
					
					else:
						yearCalls = masterCalls.filter(details__Date__endswith=year, details__Agency = agency, details__StationArea = station).count()

					#Add each year's calls
					year_data[year] = yearCalls

				#Add each station set
				response_data[station] = year_data

		# -NOT IMPLEMENTED YET - #
		#Months required#
		else:
			print("Months required")

			#Operation for each station
			for station in stations:

				year_data = {}
				month_data = {}

				#Operation for each year
				for year in selectedYears:

					#Operation for each month
					for month in range(1, 13):
					
						strMonth = str(month)

						if len(strMonth) == 1:
							strMonth = "0" + strMonth

						filter = strMonth + "/" + str(year)

						if agency == "Overall":
							yearCalls = masterCalls.filter(details__Date__endswith=filter, details__StationArea = station).count()
						
						else:
							yearCalls = masterCalls.filter(details__Date__endswith=filter, details__Agency = agency, details__StationArea = station).count()

					#Add each year's calls
					year_data[month] = yearCalls

				#Add each station set
				response_data[station] = year_data

	# -NOT IMPLEMENTED YET - #
	##### Bar graph #####

	elif selectedGraph == "BarGraph":

		response_data = []

		for year in selectedYears:
			
			year_data = {"year": str(year)}

			for station in stations:
				
				if agency == "Overall":
					yearCalls = masterCalls.filter(details__Date__endswith=year, details__StationArea = station).count()
				
				else:
					yearCalls = masterCalls.filter(details__Date__endswith=year, details__Agency = agency, details__StationArea = station).count()

				#Add each year's calls
				year_data[station] = yearCalls

			#Add each station set
			response_data.append(year_data)

		print(response_data)

	return HttpResponse(json.dumps(response_data), content_type = "application/json")

############### Other Functions ############### 

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
from flask import Flask, render_template, request, redirect, url_for, send_file
import pandas as pd
import googlemaps
import gmplot
import os
import numpy as np
from scipy.spatial import distance_matrix

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'csv'}
gmaps = googlemaps.Client(key='AIzaSyBBbXCH9EX3vmuRrZdXA5djiKD3ifJIMLg')

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_coordinates(location):
    geocode_result = gmaps.geocode(location)
    if geocode_result:
        return geocode_result[0]['geometry']['location']
    return None

def dijkstra(distance_matrix, start):
    n = len(distance_matrix)
    visited = [False] * n
    dist = [float('inf')] * n
    dist[start] = 0

    for _ in range(n):
        min_dist = float('inf')
        u = -1
        for i in range(n):
            if not visited[i] and dist[i] < min_dist:
                min_dist = dist[i]
                u = i
        if u == -1:
            break
        visited[u] = True
        for v in range(n):
            if not visited[v] and distance_matrix[u][v] != 0:
                new_dist = dist[u] + distance_matrix[u][v]
                if new_dist < dist[v]:
                    dist[v] = new_dist
    return dist

def tsp_solver(distance_matrix):
    n = len(distance_matrix)
    visited = [False] * n
    path = [0]
    visited[0] = True
    current = 0

    for _ in range(n - 1):
        distances = dijkstra(distance_matrix, current)
        min_dist = float('inf')
        next_city = None
        for city in range(n):
            if not visited[city] and distances[city] < min_dist:
                min_dist = distances[city]
                next_city = city
        path.append(next_city)
        visited[next_city] = True
        current = next_city

    path.append(0)
    return path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or 'police_station' not in request.form:
        return redirect(request.url)
    file = request.files['file']
    police_station = request.form['police_station']
    if file.filename == '':
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        return redirect(url_for('analyze', filename=file.filename, police_station=police_station))
    return redirect(request.url)

@app.route('/analyze/<filename>/<police_station>')
def analyze(filename, police_station):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    crime = pd.read_csv(filepath)
    top_hotspots = crime.groupby("Location").sum().reset_index().sort_values(by='Number of Cases', ascending=False).head(5)
    top_hotspots['Coordinates'] = top_hotspots['Location'].apply(get_coordinates)
    top_hotspots = top_hotspots.dropna(subset=['Coordinates'])

    police_station_coords = get_coordinates(police_station)
    if not police_station_coords:
        return "Invalid police station location"

    locations = [police_station_coords] + top_hotspots['Coordinates'].tolist() + [police_station_coords]
    coords = [(loc['lat'], loc['lng']) for loc in locations]
    dist_matrix = distance_matrix(coords, coords)

    optimized_path = tsp_solver(dist_matrix)
    optimized_route_coords = [locations[i] for i in optimized_path]

    route_latitudes = [loc['lat'] for loc in optimized_route_coords]
    route_longitudes = [loc['lng'] for loc in optimized_route_coords]

    gmap = gmplot.GoogleMapPlotter(1.3700, 103.8490, 13, apikey= 'AIzaSyBBbXCH9EX3vmuRrZdXA5djiKD3ifJIMLg')

    for loc in optimized_route_coords:
        gmap.marker(loc['lat'], loc['lng'], color='red')

    gmap.marker(police_station_coords['lat'], police_station_coords['lng'], color='blue')
    # gmap.marker(police_station_coords['lat'], police_station_coords['lng'], icon='/static/police.png')
    # police_station_icon_url = url_for('static', filename='police.png', _external=True)
    # gmap.marker(police_station_coords['lat'], police_station_coords['lng'], icon=police_station_icon_url)


    gmap.plot(route_latitudes, route_longitudes, 'cornflowerblue', edge_width=2.5)
    output_file = os.path.join(app.config['UPLOAD_FOLDER'], 'optimized_patrol_route_map.html')
    gmap.draw(output_file)
    return send_file(output_file)

if __name__ == '__main__':
    app.run(debug=True)

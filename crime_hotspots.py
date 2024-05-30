# Import libraries
import pandas as pd

# Reading dataset from CSV
crime = pd.read_csv('crime_hotspots_ang_mo_kio.csv')

group_by_area = crime.groupby("Location").sum().reset_index()
group_by_area = group_by_area.sort_values(by='Number of Cases', ascending=False)

hotspot = group_by_area[group_by_area["Number of Cases"] > 100]


import matplotlib.pyplot as plt
import numpy as np

# Data
years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
attendances = [578201, 513030, 518468, 514825, 498630, 467543, 382059, 441788, 398773]

# Create a color gradient from yellow to blue
colors = plt.cm.coolwarm(np.linspace(0, 1, len(attendances)))

# Create the bar graph
plt.figure(figsize=(10, 6))
bars = plt.bar(years, attendances, color=colors)

# Add titles and labels
plt.title('General Outpatient Service Attendances (2014-2022)', fontsize=16)
plt.xlabel('Year', fontsize=14)
plt.ylabel('Attendances', fontsize=14)

# Show the plot
plt.xticks(years)  # Ensure all years are shown
plt.yticks(rotation=45)
plt.tight_layout()
plt.show()
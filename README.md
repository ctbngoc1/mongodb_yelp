# Interactive Tableau Dashboard for Hotel Bookings Across Vietnam

## Overview

This project presents an interactive dashboard for analyzing hotel booking information from multiple provinces in Vietnam as part of a university course group assignment. It enables exploratory analysis of booking trends over time, as well as the geographic distribution, pricing patterns, and other characteristics of hotels across Vietnam. The dashboard was developed using Tableau Desktop.

[View Dashboard](https://public.tableau.com/views/HotelBookingDashboard_17686358051070/Summary) 

## Data

The dashboard was built using a hotel booking dataset collected for academic purposes. The dataset contains temporal, geographic, pricing, and hotel-related features (*e.g., room type, rating*), covering 25 provinces in Vietnam from October 7, 2023 to December 26, 2023. The dataset isn't available publicly.

## Methods

An interactive Tableau dashboard was created to explore hotel booking information from 25 provinces in Vietnam. The dashboard consists of two pages: **Summary** and **Detail**. The Summary page provides an overall overview of hotel availability and pricing patterns across all provinces, featuring a geographic map of hotel counts by province, a line chart of average room prices by day of the week, and a bar chart showing average room prices by province. These visualizations are interconnected, allowing users to explore provincial patterns through hover interactions, with optional filtering by check-in and check-out dates for the bar chart.

Selecting a province in the map or the bar chart of the Summary page navigates users to the Detail page, which presents province-specific information. This page includes a table listing individual hotels and their key attributes, along with a doughnut chart displaying hotel distributions by rating, a bar chart showing average prices for the top 5 most common room types, and a line chart of average prices by day of the week. The check-in and check-out dates filters applied in the Summary view are preserved in the Detail view.

## Results

![](images/summary.jpg "Summary page")

***Figure 1:** Summary page*

The dashboard reveals clear geographic and temporal patterns in hotel availability and pricing across 25 provinces in Vietnam. Major tourism and urban centers — including Ho Chi Minh City, Hanoi, Da Nang, Ba Ria–Vung Tau, and Lam Dong — have the highest concentration of hotels, while less tourism-oriented provinces have substantially fewer accommodations. Average room prices are highest on Saturdays, whereas prices on other weekdays remain relatively similar, indicating strong weekend demand effects.

Provincial comparisons show substantial variation in pricing levels. Binh Thuan exhibits the highest average room prices overall, while Cao Bang has the lowest. Weekend date filters consistently highlight Ba Ria–Vung Tau as the most expensive destination, reflecting its popularity as a short-distance weekend getaway from Ho Chi Minh City. Unlike most provinces, Ba Ria–Vung Tau displays a pronounced Saturday price spike, with average prices nearly doubling compared to midweek average prices.

![](images/detail.jpg "Detail page of Ba Ria - Vung Tau")

***Figure 2:** Detail page of Ba Ria - Vung Tau*

A detailed analysis of Ba Ria–Vung Tau from October 14, 2023 to October 15, 2023 illustrates how pricing varies by hotel characteristics. Higher-rated hotels tend to command higher average prices, while mid-range ratings account for the largest share of available hotels. Villas are the most expensive room type, whereas double rooms are the most affordable.

*Limitations:*

-   *Due to data collection constraints, check-out dates were fixed as the day following check-in. Consequently, when using date filters, the dashboard only displays results when the selected check-out date corresponds to the day after the check-in date. In other words, only one-night stays are currently supported by the dashboard. When no date filters are applied, the dashboard aggregates results across all one-night records in the dataset. Supporting flexible multi-night stays would require a different data structure with nightly pricing information, which was beyond the scope of this project.*
-   *Since the data was collected over a period of less than four months, it's not possible to analyze hotel booking trends across different seasons or years.*

## Acknowledgements

This project was completed as part of a group assignment. Data collection, preprocessing and pipeline construction were handled by other team members, while this repository focuses on the dashboard development.

# Yelp Business Analysis Using MongoDB

## Overview

This project presents operational simulation and performance analysis of a business review platform using MongoDB. It simulates common operations on the platform and analyzes platform activity, user behavior, business performance, and review engagement. The database and analyses were developed and executed using NoSQLBooster for MongoDB.

## Data

This project uses the Yelp Dataset, which contains business listings, user profiles, reviews, tips, photos, and check-in records collected from the Yelp platform. The dataset is publicly available at: <https://www.kaggle.com/datasets/fireballbyedimyrnmom/yelp-dataset>

The dataset consists of 6 document collections:

- *business*: List of businesses, including business name, location, average rating, review count, categories, operating hours, and business attributes.

- *user*: List of user profiles, including user name, review count, account creation date, elite membership status, voting statistics, compliment counts, friends list, number of fans, and average rating.

- *review:* User reviews of businesses, including review text, star rating, votes, and posting date.

- *tip:* User tips for businesses, including tip text, posting date, and compliment count.

- *photo:* Business photos, including captions and labels.

- *checkin*: Business check-in histories, including a series of customer visit timestamps.

The database contains 6,685,900 reviews, 1,637,138 users, 1,223,094 tips, 200,000 photos, and 192,609 businesses, of which 161,950 have associated check-in records. Preprocessing steps included converting date fields to ISODate, transforming multi-value strings into arrays, converting business attributes to appropriate MongoDB data types (booleans, numbers, and nested documents), and creating indexes on frequently queried fields to improve query performance.

## Methods

Following data preparation, MongoDB commands were developed to simulate common activities on a business review platform. These operations included user registration, friend list updates, check-in recording, review submission and editing, vote updates, tip posting, and photo uploads. Aggregation pipelines were then used to automatically update business and user statistics, including ratings, review counts, and voting statistics. The simulation resulted in a final database containing 6,685,901 reviews, 1,637,139 users, 1,223,095 tips, 200,001 photos, and 192,609 businesses, of which 161,950 have check-in records.

Afterwards, the database was analyzed using MongoDB queries to evaluate platform performance. The analyses included platform KPIs, user retention, elite and non-elite user comparison, business rating distribution, monthly review volume and average rating, as well as average vote count and review length across review rating levels. Reporting queries were also used to identify top users, businesses, and cities, determine each user's preferred business categories, rank business categories by popularity, and identify peak hours per business. Finally, these queries were adapted into reusable MongoDB views for reporting and future dashboard development.

## Results

The final review platform database contained 6,685,901 reviews, 1,637,139 users, and 192,609 businesses, with an average review rating of 3.72, an average business rating of 3.58, and an average of 4.08 reviews per user. User engagement analysis showed that 778,655 users (47.6%) contributed more than one review. Elite users were substantially more active and influential than non-elite users, averaging 22.16 reviews, 23.26 fans, and 118.62 votes, compared with 3.26 reviews, 0.47 fans, and 4.91 votes for non-elite users.

Business performance analysis showed that 4-star businesses were the most common, followed by 3-star and 5-star businesses. Las Vegas contained the largest number of businesses (29,370), followed by Toronto (18,906) and Phoenix (18,766), while Scottsdale recorded the highest average business rating (3.93) among the 10 cities with the most businesses. Customer photo engagement was also strongest in Las Vegas, averaging 13.62 photos per business, considerably higher than in other cities. In addition, check-in analysis identified major airports and Las Vegas resorts as the platform's most frequently visited businesses.

Among 1300 business categories, Restaurants dominated the platform with 59,371 businesses and over 4.2 million reviews, followed by Shopping and Food. Within the 20 most common categories, Fast Food recorded the lowest average rating (2.82), despite ranking 16th by number of businesses. Review analysis showed that, among elite users, 1-star reviews received the highest average number of community votes (7.14). Across all users, 1-star and 2-star reviews were substantially longer than positive reviews, suggesting that dissatisfied customers tended to write more detailed feedback.

Monthly analysis indicated that review activity increased considerably as the Yelp platform expanded, from only 9 monthly reviews in October 2004 to 103,643 monthly reviews in October 2018, reflecting significant growth in user and business participation. Despite this increase in monthly review volume, the average monthly review rating remained relatively stable around 3.75 after the platform's early years.

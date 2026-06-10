use yelp 

// Creating collections 
db.createCollection("business")
db.createCollection("checkin")
db.createCollection("photo")
db.createCollection("review")
db.createCollection("tip")
db.createCollection("user")

// Load data into collections via Import -> Mongoimport -> ...

// Show collections
db.business.find()
db.checkin.find()
db.photo.find()
db.review.find()
db.tip.find()
db.user.find()

// ### Data Cleaning
// Convert date from string to ISODate data type
db.review.updateMany({}, [{$set: {date: {$dateFromString: {dateString: "$date"}}}}])
db.tip.updateMany({}, [{$set: {date: {$dateFromString: {dateString: "$date"}}}}])  
db.user.updateMany({}, [{$set: {yelping_since: {$dateFromString: {dateString: "$yelping_since"}}}}])

db.checkin.updateMany({},[{$set: {date: {
    $map: {input: {$split: ["$date", ","]}, as: "d", in: {$dateFromString: {dateString: {$trim: {input: "$$d"}}}}}}}}])  // Splitting up a string of dates, converting the date format to ISODate, then arranging the dates into an array of dates

// Converting each string with multiple components into an array 
db.user.updateMany({}, [{$set: {elite: {
    $cond: [{$eq: ["$elite", ""]}, [], {
        $map: {input: {$split: ["$elite", ","]}, as: "y", in: {$toInt: {$trim: {input: "$$y"}}}}}]}}}])  // Avoids empty strings in conversion to integer. Also, needs trim to make sure conversion doesn't involve space 

db.user.updateMany({}, [{$set: {friends: {
    $map: {input: {$split: ["$friends", ","]}, as: "f", in: {$trim: {input: "$$f"}}}}}])
    
db.business.updateMany({}, [{$set: {categories: {
    $map: {input: {$split: ["$categories", ","]}, as: "c", in: {$trim: {input: "$$c"}}}}}])

// Convert all boolean strings / numeric strings in attributes into boolean / numeric 
db.business.updateMany({},[{$set: {attributes: {$arrayToObject: {
    $map: {input: {$objectToArray: "$attributes"}, as: "a", in: {k: "$$a.k", v: {
        $cond: [{$eq: ["$$a.v", "True"]}, true, {
            $cond: [{$eq: ["$$a.v", "False"]}, false, {
                $cond: [{$regexMatch: {input: "$$a.v", regex: /^[0-9]+$/}}, {$toInt: "$$a.v"}, "$$a.v"]}]}]}}}}}}}])  //$objectToArray converts an object to an array of key(k) - value(v) pairs

// Convert object strings into objects
db.business.updateMany({}, [{$set: {attributes: {$arrayToObject: {
    $map: {input: {$objectToArray: "$attributes"}, as: "a", in: {k: "$$a.k", v: {
        $cond: [{$and: [{$eq: [{$type: "$$a.v"}, "string"]}, {$regexMatch: {input: "$$a.v", regex: /^\{.*\}$/}}]}, {
            $function: {lang: "js", args: ["$$a.v"], body: function(str) {
                try {
                    let fixed = str.replace(/'/g, '"').replace(/False/g, "false").replace(/True/g, "true");
                    return JSON.parse(fixed);
                } 
                catch (e) {
                    return str;
                }}}}, 
            "$$a.v"]}}}}}}}])   // Replace '' with "", and True/False into true/false to conform to the correct format before parsing 
            
// Create indexes for fast querying on large data 
db.user.createIndex({user_id: 1}, {unique: true})   // Index needs to be unique in order to use $merge in aggregate 

db.business.createIndex({business_id: 1}, {unique: true})

db.checkin.createIndex({business_id: 1})

db.review.createIndex({review_id: 1}, {unique: true})
db.review.createIndex({business_id: 1})

db.tip.createIndex({business_id: 1})
db.tip.createIndex({user_id: 1})

db.photo.createIndex({photo_id: 1}, {unique: true})
db.photo.createIndex({business_id: 1})

// ### Goal: Build an operations and analytics system for a review website that manages businesses, reviewers, reviews, and supports analysis of user activity and business performance.

// A/ Data management operations 
// Insert a new user 
db.user.insertOne({user_id: "AbC9EfG1IjK8MnO2QrS7Uv", name: "Freya", review_count: 0, yelping_since: ISODate("2020-01-10T20:00:10.000+07:00"), 
    useful: 0, funny: 0, cool: 0, elite: [], friends: [], fans: 0, average_stars: 0, compliment_hot: 0, compliment_more: 0, compliment_profile: 0,
    compliment_cute: 0, compliment_list: 0, compliment_note: 0, compliment_plain: 0, compliment_cool: 0, compliment_funny: 0, compliment_writer: 0, 
    compliment_photos: 0})

db.user.updateOne({user_id: "AbC9EfG1IjK8MnO2QrS7Uv"}, {$push: {friends: "PaPQzyr6chg_eo_u4mw0Dw"}})  // Add a friend for that user 

// Add a new checkin date for a business 
db.checkin.updateOne({business_id: "1RHY4K3BD22FK7Cfftn8Mg"}, {$push: {date: ISODate("2020-01-10T10:30:10.000+07:00")}})

// Add review, tip and photo posted by the new user 
db.review.insertOne({review_id: "AbC1EfG9IjK2MnO8QrS3Uv", user_id: "AbC9EfG1IjK8MnO2QrS7Uv", business_id: "1RHY4K3BD22FK7Cfftn8Mg", stars: Double("4"), useful: 0, funny: 0, cool:0, text: "Good food", date: ISODate("2020-01-10T20:10:30.000+07:00")})
db.review.updateOne({review_id: "AbC1EfG9IjK2MnO8QrS3Uv"}, {$set: {text: "Good food, but the service could be better"}})  // Update review 

db.review.updateOne({review_id: "AbC1EfG9IjK2MnO8QrS3Uv"}, {$inc: {useful: 1}})  // The review was added a vote 

db.tip.insertOne({user_id: "AbC9EfG1IjK8MnO2QrS7Uv", business_id: "1RHY4K3BD22FK7Cfftn8Mg", text: "Amazing gyros", date: ISODate("2020-01-10T20:20:50.000+07:00"), compliment_count: 0})

db.photo.insertOne({caption: "", photo_id: "AbC4EfG5IjK6MnO7QrS8Uv", business_id: "1RHY4K3BD22FK7Cfftn8Mg", label: "food"})

// Automatically update business and user data from reviews 
db.review.aggregate([{
    $group: {_id: "$business_id", stars: {$avg: "$stars"}, review_count: {$sum: 1}}}, {
    $project: {business_id: "$_id", stars: {$round: ["$stars", 2]}, review_count: 1, _id: 0}}, {
    $merge: {into: "business", on: "business_id", whenMatched: "merge", whenNotMatched: "discard"}}])  // $merge writes the aggregation result into a collection 

db.review.aggregate([{
    $group: {_id: "$user_id", review_count: {$sum: 1}, average_stars: {$avg: "$stars"}, useful: {$sum: "$useful"}, funny: {$sum: "$funny"}, cool: {$sum: "$cool"}}}, {
    $project: {user_id: "$_id", review_count: 1, average_stars: {$round: ["$average_stars", 2]}, useful: 1, funny: 1, cool: 1, _id: 0}}, {
    $merge: {into: "user", on: "user_id", whenMatched: "merge", whenNotMatched: "discard"}}])  // Average stars are rounded to 2 decimal places 
// In reality, the star rating of each business is most likely calculated via weighted average instead of simple average 

// B/ User activity and business performance analysis 

// 1. KPI
// Review 
db.review.aggregate([{
    $group: {_id: null, total_reviews: {$sum: 1}, avg_rating: {$avg: "$stars"}}}, {
    $project: {total_reviews: 1, avg_rating: {$round: ["$avg_rating", 2]}, _id: 0}}}])

// User 
db.user.aggregate([{
    $group: {_id: null, total_users: {$sum: 1}, avg_reviews_per_user: {$avg: "$review_count"}, avg_friends: {$avg: {$size: "$friends"}}, avg_fans: {$avg: "$fans"}}}, {
    $project: {total_users: 1, avg_reviews_per_user: {$round: ["$avg_reviews_per_user", 2]}, avg_friends: {$round: ["$avg_friends", 2]}, avg_fans: {$round: ["$avg_fans", 2]}, _id: 0}}])

// Business
db.business.aggregate([{
    $group: {_id: null, total_businesses: {$sum: 1}, avg_rating: {$avg: "$stars"}, avg_review_count: {$avg: "$review_count"}}}, {
    $project: {total_businesses: 1, avg_rating: {$round: ["$avg_rating", 2]}, avg_review_count: {$round: ["$avg_review_count", 2]}, _id: 0}}])
    
// 2. User Behavior Analysis
// Top 10 most active users by number of reviews
db.review.aggregate([{
    $group: {_id: "$user_id", total_reviews: {$sum: 1}}}, { 
    $sort: {total_reviews: -1}}, {$limit: 10}, {
    $lookup: {from: "user", localField: "_id", foreignField: "user_id", as: "user_info"}}, { 
    $unwind: "$user_info"}, {
    $project: {_id: 0, user_id: "$_id", name: "$user_info.name", total_reviews: 1}])  // $lookup: review left joins user - with the user data stored as user_info object in review, $unwind: convert array to object 

// Top 10 users with most fans
db.user.find({}, {_id: 0, user_id: 1, name: 1, fans: 1}).sort({fans: -1}).limit(10)

// Number of users that reviewed more than once 
db.review.aggregate([{
    $group: {_id: "$user_id", total_reviews: {$sum: 1}}}, {
    $group: {_id: null, total_users: {$sum: 1}, returning_users: {
        $sum: {$cond: [{$gt: ["$total_reviews", 1]}, 1, 0]}}}}])
        
// Top 3 most common categories per user
db.review.aggregate([{
    $lookup: {from: "business", localField: "business_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {$unwind: "$biz.categories"}, {
    $group: {_id: {user: "$user_id", category: "$biz.categories"}, total_reviews: {$sum: 1}}}, { 
    $sort: {"_id.user": 1, total_reviews: -1}}, {
    $group: {_id: "$_id.user", categories: {$push: {category: "$_id.category", total_reviews: "$total_reviews"}}}}, {
    $lookup: {from: "user", localField: "_id", foreignField: "user_id", as: "user_info"}}, { 
    $unwind: "$user_info"}, {
    $project: {_id: 0, user_id: "$_id", name: "$user_info.name", categories: {$slice: ["$categories", 3]}}}])  // Newly joined data is stored in an array, unwind to decompose an array into multiple documents 

// Elite vs Non-elite users 
db.user.aggregate([{
    $project: {is_elite: {$gt: [{$size: "$elite"}, 0]}, review_count: 1, fans: 1, total_votes: {$add: ["$useful", "$funny", "$cool"]}}}, {
    $group: {_id: "$is_elite", avg_reviews: {$avg: "$review_count"}, avg_fans: {$avg: "$fans"}, avg_votes: {$avg: "$total_votes"}}}, {
    $project: {_id: 0, is_elite: "$_id", avg_reviews: {$round: ["$avg_reviews", 2]}, avg_fans: {$round: ["$avg_fans", 2]}, avg_votes: {$round: ["$avg_votes", 2]}}}])

// 3. Business Performance
// Top 10 most reviewed five - star businesses 
db.business.createIndex({stars: -1})  // Order for creating indexes for querying: Equality (ex: is_open: {$eq: 1}) → Range (ex: review_count: {$gte: 50}) → Sort (ex: sort({stars: -1}))
db.business.find({stars: {$eq: 5}}, {_id: 0, business_id: 1, name: 1, city: 1, review_count: 1, stars: 1, categories: 1}).sort({review_count: -1}).limit(10)

// Distribution of rounded business star ratings
db.business.aggregate([{
    $group: {_id: {$round: ["$stars", 0]}, total_businesses: {$sum: 1}}}, {
    $project: {_id: 0, rounded_stars: "$_id", total_businesses: 1}}, { 
    $sort: {rounded_stars: 1}}])  

// Top 10 cities by number of businesses, with average ratings 
db.business.aggregate([{
    $group: {_id: "$city", avg_rating: {$avg: "$stars"}, total: {$sum: 1}}}, {
    $project: {_id: 0, city: "$_id", avg_rating: {$round: ["$avg_rating" , 2]}, total_businesses: "$total"}}, { 
    $sort: {total_businesses: -1}}, {$limit: 10}}])
    
// Top 10 cities with the most photos per business (only include cities with at least 50 businesses)
db.photo.aggregate([{
    $lookup: {from: "business", localField: "business_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {
    $group: {_id: "$biz.city", total_photos: {$sum: 1}, total_businesses: {$addToSet: "$business_id"}}}, {
    $project: {city: "$_id", _id: 0, total_photos: 1, total_businesses: {$size: "$total_businesses"}}}, {
    $addFields: {photos_per_business: {$divide: ["$total_photos", "$total_businesses"]}}}, { 
    $match: {total_businesses: {$gte: 50}}}, {
    $project: {_id: 0, city: 1, total_photos: 1, total_businesses: 1, photos_per_business: {$round: ["$photos_per_business", 2]}}}, { 
    $sort: {photos_per_business: -1}}, {$limit: 10}])

// Top 10 most frequently visited businesses 
db.checkin.aggregate([{
    $lookup: {from: "business", localField: "business_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {
    $project: {_id: 0, business_id: 1, name: "$biz.name", city: "$biz.city", checkin_count: {$size: "$date"}}}, {
    $sort: {checkin_count: -1}}, {$limit: 10}])

// Business categories ranked by number of businesses, with number of reviews and average rating 
db.business.aggregate([{ 
    $unwind: "$categories"}, {
    $group: {_id: "$categories", avg_rating: {$avg: "$stars"}, total_businesses: {$sum: 1}, total_reviews: {$sum: "$review_count"}}}, { 
    $sort: {total_businesses: -1}}, {
    $project: {_id: 0, category: "$_id", total_businesses: 1, total_reviews: 1, avg_rating: {$round: ["$avg_rating", 2]}}}]) 

// 4. Review analysis
// User rating vs Engagement number among elite users 
db.review.aggregate([{
    $lookup: {from: "user", localField: "user_id", foreignField: "user_id", as: "user_info"}}, { 
    $unwind: "$user_info"}, {
    $match: {$expr: {$gt: [{$size: "$user_info.elite"}, 0]}}}, { 
    $project: {stars: 1, total_votes: {$add: ["$useful", "$funny", "$cool"]}}}, {
    $group: {_id: "$stars", total_reviews: {$sum: 1}, avg_votes: {$avg: "$total_votes"}}}, {
    $project: {_id: 0, stars: "$_id", total_reviews: 1, avg_votes: {$round: ["$avg_votes", 2]}}}, {
    $sort: {stars: -1}}])
// For influential users, extremely negative (1-star) reviews receive significantly more engagement votes.

// User rating vs Review length
db.review.aggregate([{
    $project: {stars: 1, length: {$strLenCP: "$text"}}}, {
    $group: {_id: "$stars", avg_length: {$avg: "$length"}}}, {
    $project: {_id: 0, stars: "$_id", avg_length: {$round: ["$avg_length", 2]}}}, {
    $sort: {stars: -1}}])
// Users tend to write longer reviews when they are dissatisfied.

// Reviews per month
db.review.aggregate([{
    $group: {_id: {$dateToString: {format: "%Y-%m", date: "$date"}}, total_reviews: {$sum: 1}}}, {
    $project: {_id: 0, month: "$_id", total_reviews: 1}}, { 
    $sort: {month: 1}}])

// Average rating per month
db.review.aggregate([{
    $group: {_id: {$dateToString: {format: "%Y-%m",date: "$date"}}, avg_rating: {$avg: "$stars"}}}, {
    $project: {_id: 0, month: "$_id", avg_rating: {$round: ["$avg_rating", 2]}}}, {
    $sort: {month: 1}}])

// Peak hours per business
db.checkin.aggregate([{
    $unwind: "$date"}, {
    $project: {business_id: 1, hour: {$hour: "$date"}}}, {
    $group: {_id: {business: "$business_id", hour: "$hour"}, peak_hour_checkins: {$sum: 1}}}, {
    $sort: {"_id.business": 1, peak_hour_checkins: -1}}, {
    $group: {_id: "$_id.business", peak_hour: {$first: "$_id.hour"}, peak_hour_checkins: {$first: "$peak_hour_checkins"}}}, {
    $lookup: {from: "business", localField: "_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {
    $project: {_id: 0, business_id: "$_id", name: "$biz.name", peak_hour: 1, peak_hour_checkins: 1}}])

// C/ Views for dashboarding 
// KPI view (For Total Reviews, Total Users, Average Reviews Per User cards, and a gauge chart of Average Rating)
db.createView("kpi_view", "review", [{
    $group: {_id: null, total_reviews: {$sum: 1}, avg_rating: {$avg: "$stars"}}}, {
    $lookup: {from: "user", pipeline: [{
        $group: {_id: null, total_users: {$sum: 1}, avg_reviews_per_user: {$avg: "$review_count"}}}], as: "user_stats"}}, { 
    $unwind: "$user_stats"}, {
    $project: {_id: 0, total_reviews: 1, avg_rating: {$round: ["$avg_rating", 2]}, total_users: "$user_stats.total_users", 
        avg_reviews_per_user: {$round: ["$user_stats.avg_reviews_per_user", 2]}}}])  // pipeline: is used for running an aggregation (for filtering, transforming) inside a stage like $lookup 

db.kpi_view.find()

// Top 10 active users view (For leaderboard table to rank the top 10 Users by Total Reviews)
db.createView("top_active_users_view", "review", [{
    $group: {_id: "$user_id", total_reviews: {$sum: 1}}}, { 
    $sort: {total_reviews: -1}}, {$limit: 10}, {
    $lookup: {from: "user", localField: "_id", foreignField: "user_id", as: "user_info"}}, { 
    $unwind: "$user_info"}, {
    $project: {_id: 0, user_id: "$_id", name: "$user_info.name", total_reviews: 1}}])

db.top_active_users_view.find()

// Elite vs Non-Elite users view (For clustered bar chart of Average Reviews, Average Fans, Average Votes by Elite Status)
db.createView("elite_comparison_view", "user", [{
    $project: {is_elite: {$gt: [{$size: "$elite"}, 0]}, review_count: 1, fans: 1, total_votes: {$add: ["$useful", "$funny", "$cool"]}}}, {
    $group: {_id: "$is_elite", avg_reviews: {$avg: "$review_count"}, avg_fans: {$avg: "$fans"}, avg_votes: {$avg: "$total_votes"}}}, {
    $project: {_id: 0, is_elite: "$_id", avg_reviews: {$round: ["$avg_reviews", 2]}, avg_fans: {$round: ["$avg_fans", 2]}, avg_votes: {$round: ["$avg_votes", 2]}}}])

db.elite_comparison_view.find()

// City performance view (For a bar chart of Total Businesses by City, a scatter plot of Total Businesses vs Average Rating (each point = one city))
db.createView("city_performance_view", "business", [{
    $group: {_id: "$city", avg_rating: {$avg: "$stars"}, total_businesses: {$sum: 1}}}, {
    $project: {_id: 0, city: "$_id", avg_rating: {$round: ["$avg_rating", 2]}, total_businesses: 1}}])

db.city_performance_view.find()

// City photo engagement view (For a bar chart of Photos Per Business by City, a scatter plot of Total Businesses vs Photos Per Business (each point = one city))
db.createView("city_photo_engagement_view", "photo", [{
    $lookup: {from: "business", localField: "business_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {
    $group: {_id: "$biz.city", total_photos: {$sum: 1 }, businesses: {$addToSet: "$business_id"}}}, {
    $project: {city: "$_id", _id: 0, total_photos: 1, total_businesses: {$size: "$businesses"}}}, {
    $addFields: {photos_per_business: {$divide: ["$total_photos", "$total_businesses"]}}}])

db.city_photo_engagement_view.find()

// Category performance view (For a bar chart of Total Businesses by Category, a bar chart of Total Reviews by Category, a scatter plot of Total Reviews vs Average Rating (each point = one category), and a treemap of Category size by Total Businesses)
db.createView("category_performance_view", "business", [{ 
    $unwind: "$categories"}, {
    $group: {_id: "$categories", avg_rating: {$avg: "$stars"}, total_businesses: {$sum: 1}, total_reviews: {$sum: "$review_count"}}}, {
    $project: {_id: 0, category: "$_id", avg_rating: {$round: ["$avg_rating", 2]}, total_businesses: 1, total_reviews: 1}}])

db.category_performance_view.find()

// Business checkin activity view (For leaderboard table to rank top 10 Businesses by Checkin Count)
db.createView("business_checkins_view", "checkin", [{
    $project: {business_id: 1, checkin_count: {$size: "$date"}}}, {
    $lookup: {from: "business", localField: "business_id", foreignField: "business_id", as: "biz"}}, { 
    $unwind: "$biz"}, {
    $project: {_id: 0, business_id: 1, name: "$biz.name", city: "$biz.city", checkin_count: 1}}, {
    $sort: {checkin_count: -1}}, {$limit: 10}])

db.business_checkins_view.find()

// Review engagement among elite users view (For dual-axis bar chart of Total Reviews, Average Votes by Star Rating)
db.createView("elite_engagement_view", "review", [{
    $lookup: {from: "user", localField: "user_id", foreignField: "user_id", as: "user_info"}}, {  
    $unwind: "$user_info"}, {
    $match: {$expr: {$gt: [{$size: "$user_info.elite"}, 0]}}}, {
    $project: {stars: 1, total_votes: {$add: ["$useful", "$funny", "$cool"]}}}, {
    $group: {_id: "$stars", total_reviews: {$sum: 1}, avg_votes: {$avg: "$total_votes"}}}, {
    $project: {_id: 0, stars: "$_id", total_reviews: 1, avg_votes: {$round: ["$avg_votes", 2]}}}])

db.elite_engagement_view.find()

// Rating vs review length view (For bar chart of Average Length by Star Rating)
db.createView("review_length_view", "review", [{
    $project: {stars: 1, length: {$strLenCP: "$text"}}}, {
    $group: {_id: "$stars", avg_length: {$avg: "$length"}}}, {
    $project: {_id: 0, stars: "$_id", avg_length: {$round: ["$avg_length", 2]}}}])

db.review_length_view.find()

// Monthly review trends view (For a dual-axis line chart of Total Reviews, Average Rating by Month, an area chart of Review Volume over Time)
db.createView("monthly_reviews_view", "review", [{
    $group: {_id: {$dateToString: {format: "%Y-%m", date: "$date"}}, total_reviews: {$sum: 1}, avg_rating: {$avg: "$stars"}}}, {
    $project: {_id: 0, month: "$_id", total_reviews: 1, avg_rating: {$round: ["$avg_rating", 2]}}}, {
    $sort: {month: 1}}])

db.monthly_reviews_view.find()




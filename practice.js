        // Replace this with your actual API key
        const apiKey = 'AIzaSyDSpjOGv1rYMieaM2Uj0AzPT0zv08TyGZk';

        // To track processed places and avoid duplication
        const processedPlaceIds = new Set();

        // Array to store all restaurants for sorting
        let allRestaurants = [];

        function initMap() {
            const rexburg = { lat: 43.8260, lng: -111.7897 };  // Rexburg, Idaho coordinates

            // Initialize the map centered on Rexburg
            const map = new google.maps.Map(document.getElementById('map'), {
                center: rexburg,
                zoom: 13
            });

            // Create a request object for nearby restaurant places with larger radius (10,000 meters)
            const request = {
                location: rexburg,
                radius: '10000',  // 10 km radius
                type: ['restaurant']  // Only searching for restaurants
            };

            // Initialize the Places service
            const service = new google.maps.places.PlacesService(map);

            // Handle pagination to get all results
            getAllRestaurants(service, request, map);
        }

        // Function to handle pagination and fetch all restaurants
        function getAllRestaurants(service, request, map, nextPageToken = null) {
            if (nextPageToken) {
                request.pagetoken = nextPageToken;  // Add page token if available
            }

            service.nearbySearch(request, (results, status, pagination) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Process each restaurant only once using Set to track IDs
                    for (let i = 0; i < results.length; i++) {
                        const place = results[i];

                        // Avoid duplicates by checking if place ID has already been processed
                        if (!processedPlaceIds.has(place.place_id)) {
                            processedPlaceIds.add(place.place_id);  // Mark this place as processed

                            // Add the restaurant to the list of all restaurants
                            allRestaurants.push(place);

                            // Create a marker for each restaurant
                            createMarker(place, map);
                        }
                    }

                    // If there are more results, fetch the next page
                    if (pagination && pagination.hasNextPage) {
                        setTimeout(() => {
                            getAllRestaurants(service, request, map, pagination.nextPage());
                        }, 2000);  // Delay for 2 seconds to comply with API rate limits
                    } else {
                        // If no more pages, sort and display the restaurants
                        displaySortedRestaurants();
                    }
                }
            });
        }

        // Function to create a marker on the map
        function createMarker(place, map) {
            const marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            // Create an info window to show the restaurant name when clicked
            const infoWindow = new google.maps.InfoWindow({
                content: `<strong>${place.name}</strong>`
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        }

        // Function to display sorted restaurants
        function displaySortedRestaurants() {
            // Sort restaurants alphabetically by name
            allRestaurants.sort((a, b) => a.name.localeCompare(b.name));

            // Display the sorted restaurants
            const restaurantsDiv = document.getElementById('restaurants');
            restaurantsDiv.innerHTML = '';  // Clear previous content
            allRestaurants.forEach((place) => {
                const restaurantItem = document.createElement('div');
                restaurantItem.classList.add('restaurant-item');
                restaurantItem.innerHTML = `
                    <strong>${place.name}</strong><br>
                    Rating: ${place.rating ? place.rating : 'No rating available'}<br>
                    Address: ${place.vicinity}
                `;
                restaurantsDiv.appendChild(restaurantItem);
            });
        }


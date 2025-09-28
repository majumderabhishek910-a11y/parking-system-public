/**
 * Dashboard JavaScript for AI-Powered Parking System
 * Handles real-time updates and user interactions
 */

let predictionsChart = null;
let updateInterval = null;
let userLocation = { lat: 3.0, lng: 3.0, name: "Downtown Plaza" }; // Default location

// Location database for text-to-coordinates conversion
const locationDatabase = {
    // Exact parking lot names
    'downtown plaza': { lat: 3.0, lng: 3.0, type: 'business' },
    'shopping mall': { lat: 8.0, lng: 7.0, type: 'shopping' },
    'train station': { lat: 12.0, lng: 2.0, type: 'transit' },
    'office complex': { lat: 6.0, lng: 11.0, type: 'business' },
    'city park': { lat: 15.0, lng: 8.0, type: 'leisure' },
    
    // Alternative names and landmarks
    'downtown': { lat: 3.0, lng: 3.0, type: 'business' },
    'mall': { lat: 8.0, lng: 7.0, type: 'shopping' },
    'station': { lat: 12.0, lng: 2.0, type: 'transit' },
    'office': { lat: 6.0, lng: 11.0, type: 'business' },
    'park': { lat: 15.0, lng: 8.0, type: 'leisure' },
    
    // City areas and districts
    'city center': { lat: 10.0, lng: 5.0, type: 'business' },
    'main street': { lat: 5.0, lng: 5.0, type: 'business' },
    'business district': { lat: 4.0, lng: 4.0, type: 'business' },
    'shopping district': { lat: 7.0, lng: 6.0, type: 'shopping' },
    'university area': { lat: 9.0, lng: 9.0, type: 'education' },
    'hospital district': { lat: 11.0, lng: 12.0, type: 'healthcare' },
    'residential area': { lat: 2.0, lng: 13.0, type: 'residential' },
    
    // Generic locations
    'central': { lat: 10.0, lng: 7.5, type: 'business' },
    'north': { lat: 10.0, lng: 12.0, type: 'residential' },
    'south': { lat: 10.0, lng: 3.0, type: 'business' },
    'east': { lat: 15.0, lng: 7.5, type: 'mixed' },
    'west': { lat: 5.0, lng: 7.5, type: 'mixed' }
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing AI-Powered Parking Dashboard...');
    
    // Initialize chart
    initializeChart();
    
    // Start real-time updates
    startRealTimeUpdates();
    
    // Initial data load
    refreshData();
});

function initializeChart() {
    const ctx = document.getElementById('predictionsChart').getContext('2d');
    
    predictionsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+1h', '+2h', '+3h'],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Parking Availability Predictions'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Availability (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function startRealTimeUpdates() {
    // Update every 3 seconds
    updateInterval = setInterval(refreshData, 3000);
}

function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

async function refreshData() {
    try {
        console.log('🔄 Refreshing dashboard data...');
        
        // Update all data in parallel
        await Promise.all([
            updateSystemStats(),
            updateParkingLots(),
            updateRecommendations(),
            updateJunctions(),
            updatePredictions(),
            updateMap()
        ]);
        
        // Update timestamp
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
        
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showError('Failed to refresh data. Please check your connection.');
    }
}

async function updateSystemStats() {
    try {
        const response = await fetch('/api/system-stats');
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('total-slots').textContent = data.total_slots;
            document.getElementById('available-slots').textContent = data.total_available;
            document.getElementById('occupied-slots').textContent = data.total_occupied;
            document.getElementById('occupancy-rate').textContent = `${(data.overall_occupancy_rate * 100).toFixed(1)}%`;
            
            // Add visual indicators for available slots
            const availableElement = document.getElementById('available-slots');
            const parkingAlert = document.getElementById('parking-alert');
            const availableCount = document.getElementById('available-count');
            
            if (data.total_available > 10) {
                availableElement.style.color = '#28a745';
                availableElement.style.fontWeight = 'bold';
                parkingAlert.className = 'alert alert-success text-center';
                parkingAlert.style.display = 'block';
            } else if (data.total_available > 5) {
                availableElement.style.color = '#ffc107';
                availableElement.style.fontWeight = 'bold';
                parkingAlert.className = 'alert alert-warning text-center';
                parkingAlert.style.display = 'block';
            } else if (data.total_available > 0) {
                availableElement.style.color = '#dc3545';
                availableElement.style.fontWeight = 'bold';
                parkingAlert.className = 'alert alert-danger text-center';
                parkingAlert.style.display = 'block';
            } else {
                availableElement.style.color = '#dc3545';
                availableElement.style.fontWeight = 'bold';
                parkingAlert.style.display = 'none';
            }
            
            // Update parking alert content
            if (data.total_available > 0) {
                availableCount.textContent = data.total_available;
            }
        } else {
            throw new Error(data.error || 'Failed to fetch system stats');
        }
    } catch (error) {
        console.error('Error updating system stats:', error);
    }
}

async function updateParkingLots() {
    try {
        const response = await fetch('/api/parking-status');
        const data = await response.json();
        
        if (response.ok) {
            const container = document.getElementById('parking-lots-container');
            container.innerHTML = '';
            
            Object.entries(data).forEach(([lotName, lotData]) => {
                const occupancyRate = lotData.occupancy_rate * 100;
                const cardClass = occupancyRate > 80 ? 'high-occupancy' : 
                                 occupancyRate > 60 ? 'medium-occupancy' : '';
                
                const card = document.createElement('div');
                card.className = `parking-lot-card ${cardClass}`;
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${lotName}</h5>
                            <p class="mb-1 text-muted">Zone ${lotData.zone}</p>
                            <small class="text-muted">Location: (${lotData.location[0]}, ${lotData.location[1]})</small>
                        </div>
                        <div class="text-end">
                            <h3 class="mb-0 ${occupancyRate > 80 ? 'text-danger' : 
                                                         occupancyRate > 60 ? 'text-warning' : 'text-success'}">
                                ${lotData.available_slots}/${lotData.total_slots}
                            </h3>
                            <small class="text-muted">${occupancyRate.toFixed(1)}% occupied</small>
                            <div class="mt-2">
                                <span class="badge ${lotData.available_slots > 5 ? 'bg-success' : 
                                                   lotData.available_slots > 2 ? 'bg-warning' : 'bg-danger'}">
                                    ${lotData.available_slots} Available
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="occupancy-bar">
                        <div class="occupancy-fill" style="width: ${occupancyRate}%"></div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            throw new Error(data.error || 'Failed to fetch parking status');
        }
    } catch (error) {
        console.error('Error updating parking lots:', error);
        document.getElementById('parking-lots-container').innerHTML = 
            '<div class="error">Failed to load parking data</div>';
    }
}

async function updateRecommendations() {
    try {
        const response = await fetch(`/api/recommendations?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        const data = await response.json();
        
        if (response.ok) {
            const container = document.getElementById('recommendations-container');
            container.innerHTML = '';
            
            data.recommendations.slice(0, 3).forEach((rec, index) => {
                const card = document.createElement('div');
                card.className = 'recommendation-card';
                
                const confidenceColor = rec.confidence === 'high' ? '#28a745' : 
                                       rec.confidence === 'medium' ? '#ffc107' : '#dc3545';
                
                const trendIcon = rec.availability_trend > 0.05 ? '📈' : 
                                 rec.availability_trend < -0.05 ? '📉' : '➡️';
                const trendText = rec.availability_trend > 0.05 ? 'Improving' : 
                                 rec.availability_trend < -0.05 ? 'Declining' : 'Stable';
                
                const nearbyBadge = rec.is_nearby ? '<span class="badge bg-success ms-2">Nearby</span>' : '';
                const typeIcon = rec.lot_type === 'business' ? '🏢' : 
                                rec.lot_type === 'shopping' ? '🛍️' : 
                                rec.lot_type === 'transit' ? '🚉' : '🌳';
                
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="mb-1">
                                ${index + 1}. ${typeIcon} ${rec.parking_lot}${nearbyBadge}
                            </h5>
                            <p class="mb-1 text-light">
                                📍 ${rec.distance_blocks.toFixed(1)} blocks away
                                <span class="ms-2">${trendIcon} ${trendText}</span>
                            </p>
                        </div>
                        <div class="text-end">
                            <div class="recommendation-score" style="color: ${confidenceColor}">
                                ${(rec.recommendation_score * 100).toFixed(0)}%
                            </div>
                            <small class="text-light">${rec.confidence.toUpperCase()}</small>
                        </div>
                    </div>
                    
                    <div class="row text-center mb-2">
                        <div class="col-4">
                            <small class="text-light">Now</small><br>
                            <strong class="text-success">${(rec.current_availability * 100).toFixed(0)}%</strong>
                        </div>
                        <div class="col-4">
                            <small class="text-light">+1h</small><br>
                            <strong class="text-warning">${(rec.predicted_availability_1h * 100).toFixed(0)}%</strong>
                        </div>
                        <div class="col-4">
                            <small class="text-light">+2h</small><br>
                            <strong class="text-info">${(rec.predicted_availability_2h * 100).toFixed(0)}%</strong>
                        </div>
                    </div>
                    
                    <div class="alert alert-info alert-sm mb-0" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">
                        <small><i class="fas fa-lightbulb"></i> ${rec.message}</small>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            throw new Error(data.error || 'Failed to fetch recommendations');
        }
    } catch (error) {
        console.error('Error updating recommendations:', error);
        document.getElementById('recommendations-container').innerHTML = 
            '<div class="error">Failed to load recommendations</div>';
    }
}

async function updateJunctions() {
    try {
        const response = await fetch('/api/junction-status');
        const data = await response.json();
        
        if (response.ok) {
            const container = document.getElementById('junctions-container');
            container.innerHTML = '';
            
            Object.entries(data).forEach(([junctionId, junctionData]) => {
                const card = document.createElement('div');
                card.className = 'stat-card';
                
                const lightClass = junctionData.current_phase;
                const pressureColor = junctionData.parking_pressure > 0.8 ? 'text-danger' : 
                                    junctionData.parking_pressure > 0.6 ? 'text-warning' : 'text-success';
                
                card.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${junctionId}</h5>
                            <p class="mb-1 text-muted">Location: (${junctionData.location[0]}, ${junctionData.location[1]})</p>
                        </div>
                        <div class="text-end">
                            <div class="mb-2">
                                <span class="traffic-light ${lightClass}"></span>
                                <span class="text-capitalize">${junctionData.current_phase}</span>
                            </div>
                            <div class="${pressureColor}">
                                <strong>${(junctionData.parking_pressure * 100).toFixed(0)}%</strong> pressure
                            </div>
                            <small class="text-muted">${junctionData.cycle_duration}s cycle</small>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            throw new Error(data.error || 'Failed to fetch junction status');
        }
    } catch (error) {
        console.error('Error updating junctions:', error);
        document.getElementById('junctions-container').innerHTML = 
            '<div class="error">Failed to load junction data</div>';
    }
}

async function updatePredictions() {
    try {
        const response = await fetch('/api/predictions');
        const data = await response.json();
        
        if (response.ok) {
            // Update chart with new data
            const datasets = Object.entries(data).map(([lotName, predictions], index) => {
                const colors = [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'
                ];
                
                return {
                    label: lotName,
                    data: [
                        (1 - predictions.current) * 100,
                        (1 - predictions.predictions['+1h']) * 100,
                        (1 - predictions.predictions['+2h']) * 100,
                        (1 - predictions.predictions['+3h']) * 100
                    ],
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length] + '20',
                    tension: 0.4,
                    fill: false
                };
            });
            
            predictionsChart.data.datasets = datasets;
            predictionsChart.update('active');
        } else {
            throw new Error(data.error || 'Failed to fetch predictions');
        }
    } catch (error) {
        console.error('Error updating predictions:', error);
    }
}

async function updateMap() {
    try {
        const response = await fetch('/api/map-data');
        const data = await response.json();
        
        if (response.ok) {
            renderMap(data);
        } else {
            throw new Error(data.error || 'Failed to fetch map data');
        }
    } catch (error) {
        console.error('Error updating map:', error);
        document.getElementById('map-container').innerHTML = 
            '<div class="loading"><div class="error">Failed to load map</div></div>';
    }
}

function renderMap(mapData) {
    const container = document.getElementById('map-container');
    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; background: #e9ecef;">
            <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h6>Legend</h6>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="width: 15px; height: 15px; background: green; border-radius: 3px; margin-right: 8px;"></div>
                    <small>Available</small>
                </div>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="width: 15px; height: 15px; background: red; border-radius: 3px; margin-right: 8px;"></div>
                    <small>Occupied</small>
                </div>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="width: 15px; height: 15px; background: yellow; border-radius: 50%; margin-right: 8px;"></div>
                    <small>Traffic Light</small>
                </div>
            </div>
            
            <!-- Roads -->
            ${mapData.roads.map(road => `
                <div style="position: absolute; background: #333; ${road.type === 'horizontal' ? 
                    `top: ${road.y * 25}px; left: ${road.x1 * 25}px; width: ${(road.x2 - road.x1) * 25}px; height: 5px;` :
                    `left: ${road.x * 25}px; top: ${road.y1 * 25}px; width: 5px; height: ${(road.y2 - road.y1) * 25}px;`}">
                </div>
            `).join('')}
            
            <!-- Parking Lots -->
            ${Object.entries(mapData.parking_lots).map(([lotName, lotData]) => `
                <div style="position: absolute; left: ${lotData.location[0] * 25 - 25}px; top: ${lotData.location[1] * 25 - 25}px; 
                           width: 50px; height: 50px; background: ${lotData.occupancy_rate > 0.8 ? '#dc3545' : 
                           lotData.occupancy_rate > 0.6 ? '#ffc107' : '#28a745'}; 
                           border-radius: 10px; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                           display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;
                           cursor: pointer;" 
                     title="${lotName}: ${lotData.available_slots}/${lotData.total_slots} available">
                    🏢
                </div>
                <div style="position: absolute; left: ${lotData.location[0] * 25 - 15}px; top: ${lotData.location[1] * 25 + 30}px; 
                           background: white; padding: 2px 5px; border-radius: 3px; font-size: 8px; font-weight: bold;
                           box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                    ${lotName}
                </div>
            `).join('')}
            
            <!-- Traffic Junctions -->
            ${Object.entries(mapData.junctions).map(([junctionId, junctionData]) => `
                <div style="position: absolute; left: ${junctionData.location[0] * 25 - 10}px; top: ${junctionData.location[1] * 25 - 10}px; 
                           width: 20px; height: 20px; background: ${junctionData.current_phase === 'green' ? '#28a745' : 
                           junctionData.current_phase === 'yellow' ? '#ffc107' : '#dc3545'}; 
                           border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                </div>
            `).join('')}
            
            <!-- User Location -->
            <div style="position: absolute; left: ${userLocation.lat * 25 - 8}px; top: ${userLocation.lng * 25 - 8}px; width: 16px; height: 16px; background: #dc3545; 
                       border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                       animation: pulse 2s infinite;" title="📍 You are here: ${userLocation.name} (${userLocation.lat.toFixed(1)}, ${userLocation.lng.toFixed(1)})">
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
}

async function simulateParking() {
    try {
        const response = await fetch('/api/park-vehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destination: 'downtown'
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showSuccess(`✅ ${data.message}`);
        } else {
            showError(data.message || 'Failed to park vehicle');
        }
        
        // Refresh data after parking
        setTimeout(refreshData, 1000);
        
    } catch (error) {
        console.error('Error parking vehicle:', error);
        showError('Failed to simulate parking');
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopRealTimeUpdates();
    } else {
        startRealTimeUpdates();
        refreshData(); // Immediate refresh when page becomes visible
    }
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    stopRealTimeUpdates();
});

// Location parsing and search functions
function parseLocationInput(locationText) {
    if (!locationText || locationText.trim() === '') {
        return null;
    }
    
    const normalizedText = locationText.toLowerCase().trim();
    
    // Check for exact matches first
    if (locationDatabase[normalizedText]) {
        return {
            ...locationDatabase[normalizedText],
            name: locationText.trim(),
            confidence: 'exact'
        };
    }
    
    // Check for partial matches
    const partialMatches = [];
    for (const [key, data] of Object.entries(locationDatabase)) {
        if (key.includes(normalizedText) || normalizedText.includes(key)) {
            partialMatches.push({
                ...data,
                name: key,
                confidence: 'partial',
                match: key
            });
        }
    }
    
    // Return best partial match
    if (partialMatches.length > 0) {
        return partialMatches[0];
    }
    
    // Try to extract coordinates from text (e.g., "3.5, 4.2")
    const coordMatch = locationText.match(/(\d+\.?\d*),\s*(\d+\.?\d*)/);
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (lat >= 0 && lat <= 20 && lng >= 0 && lng <= 15) {
            return {
                lat: lat,
                lng: lng,
                name: locationText.trim(),
                type: 'custom',
                confidence: 'coordinates'
            };
        }
    }
    
    // Generate random location for unknown places (for demo purposes)
    const randomLat = Math.random() * 20;
    const randomLng = Math.random() * 15;
    return {
        lat: randomLat,
        lng: randomLng,
        name: locationText.trim(),
        type: 'unknown',
        confidence: 'estimated'
    };
}

// Location handling functions
function updateUserLocation() {
    const locationInput = document.getElementById('user-location');
    const statusElement = document.getElementById('location-status');
    
    const locationText = locationInput.value.trim();
    
    if (!locationText) {
        showError('Please enter a location');
        return;
    }
    
    // Parse the location
    const parsedLocation = parseLocationInput(locationText);
    
    if (!parsedLocation) {
        showError('Location not found. Try a different name or use the quick location buttons.');
        return;
    }
    
    // Update user location
    userLocation = {
        lat: parsedLocation.lat,
        lng: parsedLocation.lng,
        name: parsedLocation.name
    };
    
    // Update status with confidence indicator
    let confidenceIcon = '';
    let statusColor = '#28a745';
    
    switch (parsedLocation.confidence) {
        case 'exact':
            confidenceIcon = '✅';
            break;
        case 'partial':
            confidenceIcon = '🔍';
            statusColor = '#ffc107';
            break;
        case 'coordinates':
            confidenceIcon = '📍';
            break;
        case 'estimated':
            confidenceIcon = '🎯';
            statusColor = '#17a2b8';
            break;
    }
    
    statusElement.textContent = `${confidenceIcon} Location: ${parsedLocation.name}`;
    statusElement.style.color = statusColor;
    
    // Show success message with confidence
    let message = `📍 Location updated! Finding nearby parking...`;
    if (parsedLocation.confidence === 'partial') {
        message = `🔍 Found similar location: ${parsedLocation.match}. Finding nearby parking...`;
    } else if (parsedLocation.confidence === 'estimated') {
        message = `🎯 Estimated location for "${parsedLocation.name}". Finding nearby parking...`;
    }
    
    showSuccess(message);
    
    // Refresh recommendations with new location
    updateRecommendations();
    
    // Update map with new user location
    updateMap();
}

function useCurrentLocation() {
    const statusElement = document.getElementById('location-status');
    const locationInput = document.getElementById('user-location');
    
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }
    
    statusElement.textContent = '🌐 Getting your GPS location...';
    statusElement.style.color = '#ffc107';
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Convert real-world coordinates to our city coordinate system
            // This is a simplified conversion - in real app, you'd use proper mapping
            const cityLat = ((lat - 40.0) * 20) + 10; // Rough conversion
            const cityLng = ((lng + 74.0) * 15) + 7.5; // Rough conversion
            
            // Clamp to city bounds
            const clampedLat = Math.max(0, Math.min(20, cityLat));
            const clampedLng = Math.max(0, Math.min(15, cityLng));
            
            // Find nearest known location
            const nearestLocation = findNearestLocation(clampedLat, clampedLng);
            
            // Update input field
            locationInput.value = nearestLocation.name;
            
            // Update location
            userLocation = {
                lat: clampedLat,
                lng: clampedLng,
                name: nearestLocation.name
            };
            
            statusElement.textContent = `🌐 GPS: ${nearestLocation.name}`;
            statusElement.style.color = '#28a745';
            
            showSuccess(`🌐 GPS location detected! Found nearest area: ${nearestLocation.name}`);
            
            // Refresh recommendations and map
            updateRecommendations();
            updateMap();
        },
        function(error) {
            let errorMessage = 'Unable to get your location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }
            
            statusElement.textContent = '❌ GPS detection failed';
            statusElement.style.color = '#dc3545';
            showError(`❌ ${errorMessage}. Please enter your location manually.`);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

function findNearestLocation(lat, lng) {
    let nearestLocation = null;
    let minDistance = Infinity;
    
    for (const [name, data] of Object.entries(locationDatabase)) {
        const distance = Math.sqrt((data.lat - lat) ** 2 + (data.lng - lng) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLocation = { name: name, ...data };
        }
    }
    
    return nearestLocation || { name: "Custom Location", lat: lat, lng: lng };
}

function showLocationHelp() {
    const helpMessage = `
📍 <strong>How to enter your location:</strong><br><br>
• <strong>Landmarks:</strong> "Downtown Plaza", "Shopping Mall", "Train Station"<br>
• <strong>Areas:</strong> "City Center", "Main Street", "University Area"<br>
• <strong>Coordinates:</strong> "3.5, 4.2" (latitude, longitude)<br>
• <strong>Directions:</strong> "North", "South", "East", "West"<br><br>
💡 <em>Try the quick location buttons for popular places!</em>
    `;
    
    showNotification(helpMessage, 'info');
}

function setQuickLocation(locationName) {
    // Update input field
    document.getElementById('user-location').value = locationName;
    
    // Update location and refresh
    updateUserLocation();
    
    // Show which location was selected
    showSuccess(`📍 Moved to ${locationName}! Finding nearby parking...`);
}

// Add event listeners for Enter key on location input
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after the initial DOMContentLoaded
    setTimeout(() => {
        const locationInput = document.getElementById('user-location');
        
        if (locationInput) {
            locationInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    updateUserLocation();
                }
            });
        }
    }, 1000);
});

console.log('✅ Dashboard JavaScript loaded successfully!');

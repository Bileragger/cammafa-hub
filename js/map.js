/**
 * Map service for Cammafà Hub
 * Handles map display and interaction
 */

const MapService = {
  map: null,
  markers: {},
  selectedLocationId: null,
  
  /**
   * Initialize the map
   */
  init: function(elementId, locations) {
    // Create map centered on Naples
    this.map = L.map(elementId).setView([40.8518, 14.2681], 14);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Add location markers
    this.addLocationMarkers(locations);
    
    console.log('Map initialized');
  },
  
  /**
   * Add markers for all locations
   */
  addLocationMarkers: function(locations) {
    locations.forEach(location => {
      const marker = L.marker([location.coordinates.lat, location.coordinates.lng])
        .addTo(this.map)
        .bindPopup(location.name);
      
      // Store marker reference
      this.markers[location.id] = {
        marker,
        location
      };
      
      // Add click event
      marker.on('click', () => {
        this.handleMarkerClick(location.id);
      });
    });
  },
  
  /**
   * Handle marker click
   */
  handleMarkerClick: function(locationId) {
    this.selectedLocationId = locationId;
    
    // Dispatch event for location selection
    const event = new CustomEvent('mapLocationSelected', {
      detail: { locationId }
    });
    document.dispatchEvent(event);
  },
  
  /**
   * Update markers based on filtered events
   */
  updateMarkers: function(filteredEvents) {
    // Get locations with events
    const locationIds = filteredEvents.map(event => event.locationId);
    const uniqueLocationIds = [...new Set(locationIds)];
    
    // Update marker styles
    Object.keys(this.markers).forEach(locationId => {
      const marker = this.markers[locationId].marker;
      
      if (uniqueLocationIds.includes(locationId)) {
        // Location has events - use normal marker
        marker.setIcon(L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        }));
      } else {
        // Location has no events - use gray marker
        marker.setIcon(L.icon({
          iconUrl: 'assets/icons/marker-gray.png', // You'll need to create this
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        }));
      }
    });
  },
  
  /**
   * Get currently selected location
   */
  getSelectedLocationId: function() {
    return this.selectedLocationId;
  },
  
  /**
   * Reset location selection
   */
  resetSelection: function() {
    this.selectedLocationId = null;
  }
};
/**
 * Data handling module for Cammafà Hub
 * Responsible for loading and managing event data
 */

const DataService = {
  events: [],
  locations: [],
  categories: [],
  
  /**
   * Initialize the data service
   */
  init: async function() {
    try {
      await this.loadData();
      console.log('Data loaded successfully');
      return {
        events: this.events,
        locations: this.locations,
        categories: this.categories
      };
    } catch (error) {
      console.error('Error initializing data:', error);
      return null;
    }
  },
  
  /**
   * Load all required data files
   */
  loadData: async function() {
    try {
      const [eventsData, locationsData, categoriesData] = await Promise.all([
        this.fetchJSON('data/events.json'),
        this.fetchJSON('data/locations.json'),
        this.fetchJSON('data/categories.json')
      ]);
      
      this.events = eventsData.events || [];
      this.locations = locationsData.locations || [];
      this.categories = categoriesData.categories || [];
      
      // Process data relationships
      this.processData();
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  },
  
  /**
   * Fetch JSON data from a file
   */
  fetchJSON: async function(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      // Return empty data structure to prevent app from crashing
      return { events: [], locations: [], categories: [] };
    }
  },
  
  /**
   * Process data relationships and add computed properties
   */
  processData: function() {
    // Add location data to events
    this.events = this.events.map(event => {
      const location = this.locations.find(loc => loc.id === event.locationId);
      const category = this.categories.find(cat => cat.id === event.category);
      
      return {
        ...event,
        locationData: location || null,
        categoryData: category || null
      };
    });
  },
  
  /**
   * Filter events based on criteria
   */
  filterEvents: function(filters = {}) {
    let filteredEvents = [...this.events];
    
    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate;
      });
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate <= endDate;
      });
    }
    
    // Filter by category
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => 
        event.category === filters.category
      );
    }
    
    // Filter by location
    if (filters.locationId) {
      filteredEvents = filteredEvents.filter(event => 
        event.locationId === filters.locationId
      );
    }
    
    // Filter by search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(query) || 
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.locationData && event.locationData.name.toLowerCase().includes(query))
      );
    }
    
    return filteredEvents;
  },
  
  /**
   * Get category by ID
   */
  getCategoryById: function(categoryId) {
    return this.categories.find(category => category.id === categoryId) || null;
  },
  
  /**
   * Get location by ID
   */
  getLocationById: function(locationId) {
    return this.locations.find(location => location.id === locationId) || null;
  }
};
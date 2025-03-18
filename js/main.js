/**
 * Main application script for Cammafà Hub
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize modules
  const data = await DataService.init();
  if (!data) {
    console.error('Failed to initialize data. Application cannot proceed.');
    return;
  }
  
  // Initialize components
  MapService.init('map', data.locations);
  CalendarService.init('date-picker');
  EventsService.init('events-container', 'event-card-template');
  
  // Display initial events
  EventsService.displayEvents(data.events);
  
  // Set up search functionality
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', handleSearch);
  
  // Set up filter change events
  document.addEventListener('dateFilterChanged', handleFilterChange);
  document.addEventListener('categoryFilterChanged', handleFilterChange);
  document.addEventListener('mapLocationSelected', handleMapLocationSelect);
  
  // Initialize category filters
  initializeCategoryFilters(data.categories);
  
  console.log('Application initialized successfully');
});

/**
 * Initialize category filter buttons
 */
function initializeCategoryFilters(categories) {
  const filterContainer = document.querySelector('.category-filter');
  
  // Create 'All' button
  const allButton = document.createElement('button');
  allButton.classList.add('category-btn', 'active');
  allButton.setAttribute('data-category', 'all');
  allButton.textContent = 'All';
  allButton.addEventListener('click', handleCategorySelect);
  filterContainer.appendChild(allButton);
  
  // Create category buttons
  categories.forEach(category => {
    const button = document.createElement('button');
    button.classList.add('category-btn');
    button.setAttribute('data-category', category.id);
    button.textContent = category.name;
    button.style.backgroundColor = category.color;
    button.addEventListener('click', handleCategorySelect);
    filterContainer.appendChild(button);
  });
}

/**
 * Handle category selection
 */
function handleCategorySelect(event) {
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  event.target.classList.add('active');
  const categoryId = event.target.getAttribute('data-category');
  
  const filterEvent = new CustomEvent('categoryFilterChanged', {
    detail: { category: categoryId === 'all' ? null : categoryId }
  });
  document.dispatchEvent(filterEvent);
}

/**
 * Handle search input
 */
function handleSearch(event) {
  const query = event.target.value;
  const filterEvent = new CustomEvent('searchQueryChanged', {
    detail: { query }
  });
  document.dispatchEvent(filterEvent);
  handleFilterChange();
}

/**
 * Handle map location selection
 */
function handleMapLocationSelect(event) {
  const locationId = event.detail.locationId;
  
  // Update filters based on location
  const filterEvent = new CustomEvent('locationFilterChanged', {
    detail: { locationId }
  });
  document.dispatchEvent(filterEvent);
  handleFilterChange();
}

/**
 * Apply all current filters and update display
 */
function handleFilterChange() {
  // Collect all current filter values
  const searchInput = document.getElementById('search-input');
  const activeCategory = document.querySelector('.category-btn.active');
  
  const filters = {
    query: searchInput.value,
    category: activeCategory && activeCategory.getAttribute('data-category') !== 'all' 
      ? activeCategory.getAttribute('data-category') 
      : null,
    startDate: CalendarService.getStartDate(),
    endDate: CalendarService.getEndDate(),
    locationId: MapService.getSelectedLocationId()
  };
  
  // Filter events
  const filteredEvents = DataService.filterEvents(filters);
  
  // Update UI
  EventsService.displayEvents(filteredEvents);
  MapService.updateMarkers(filteredEvents);
}
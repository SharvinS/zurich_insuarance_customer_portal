import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { logout } from '../store/actions/authActions';
import styles from '../styles/Users.module.css';

// Main component for displaying the list of billing users
const UsersPage = () => {
  const dispatch = useDispatch(); // Get the Redux dispatch function
  const router = useRouter(); // Get the Next.js router instance
  // Select authentication status and user info from the Redux auth state
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // State for storing the fetched billing records
  const [users, setUsers] = useState([]);
  // State to track if data is currently being loaded
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching
  const [error, setError] = useState(null);
  // State to manage the visibility of individual user emails
  const [showEmail, setShowEmail] = useState({});
  // State for the product code filter input
  const [filterProductCode, setFilterProductCode] = useState('');
  // State for the location filter input
  const [filterLocation, setFilterLocation] = useState('');

  // Get the backend API URL from environment variables with a fallback
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000/billing';

  // Function to fetch billing records from the backend API
  // useCallback prevents this function from being recreated on every render unless dependencies change
  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    try {
      // Build query parameters based on the provided filters
      const params = new URLSearchParams();
      if (filters.productCode) params.append('product_code', filters.productCode);
      if (filters.location) params.append('location', filters.location);

      // Construct the final request URL with query parameters if they exist
      const query = params.toString();
      const requestUrl = query ? `${backendApiUrl}?${query}` : backendApiUrl;

      // Make the GET request using axios
      const response = await axios.get(requestUrl);
      // Update the users state with the fetched data
      setUsers(response.data);
    } catch (err) {
      // Handle errors during the fetch operation
      setError(err.response?.data?.message || err.message || 'Failed to fetch billing records');
      setUsers([]); // Clear users data on error
    } finally {
      // Ensure loading state is set to false regardless of success or error
      setLoading(false);
    }
  }, [backendApiUrl]);

  // Effect hook to handle initial data fetching and authentication checks
  useEffect(() => {
    // If the user is not authenticated, redirect to the login page
    if (!isAuthenticated) {
      router.push('/');
    } else {
      // If authenticated, fetch the initial list of users
      fetchUsers();
    }
  }, [isAuthenticated, router, fetchUsers]);

  // Function to dispatch the logout action
  const handleLogout = () => dispatch(logout());

  // Function to toggle the visibility state for a specific email by ID
  const toggleEmailVisibility = (id) =>
    setShowEmail((prev) => ({ ...prev, [id]: !prev[id] })); // Use functional update for state based on previous state

  // Function to trigger fetching users with the current filter values
  const handleApplyFilters = () =>
    fetchUsers({ productCode: filterProductCode, location: filterLocation });

  // Function to clear filter inputs and fetch all users again
  const handleClearFilters = () => {
    setFilterProductCode('');
    setFilterLocation('');
    fetchUsers();
  };

  // Helper function to mask email addresses
  const maskEmail = (email) => {
    // Basic validation for the email input
    if (!email || typeof email !== 'string') return '';
    const atIndex = email.indexOf('@');
    // Handle short usernames or emails without '@'
    if (atIndex <= 2) {
      // Show first char, ellipsis, then domain (if exists)
      return email.substring(0, 1) + '...' + (atIndex > 0 ? email.substring(atIndex) : '');
    }
    // Show first two chars, ellipsis, then domain
    return `${email.substring(0, 2)}...${email.substring(atIndex)}`;
  };

  // Conditional rendering while checking authentication status
  if (!isAuthenticated && loading) return <p>Loading authentication status...</p>;
  // If not authenticated render nothing
  if (!isAuthenticated) return null;

  // Render the main page content if authenticated
  return (
    <div className={styles.container}>
      {/* Render the header component */}
      <Header user={user} onLogout={handleLogout} />
      <main>
        {/* Render the filter controls component */}
        <FilterControls
          filterProductCode={filterProductCode}
          filterLocation={filterLocation}
          onChangeProductCode={(e) => setFilterProductCode(e.target.value)}
          onChangeLocation={(e) => setFilterLocation(e.target.value)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
        {/* Render the main content area (user list or messages) */}
        <Content
          loading={loading}
          error={error}
          users={users}
          showEmail={showEmail}
          toggleEmailVisibility={toggleEmailVisibility}
          maskEmail={maskEmail}
        />
      </main>
      {/* Render the footer component */}
      <Footer />
    </div>
  );
};

// Simple functional component for the page header
const Header = ({ user, onLogout }) => (
  <header className={styles.header}>
    <h1>Customer Billing Records</h1>
    {/* Display user name and logout button */}
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
      {user?.name && <p style={{ margin: 0 }}>{user.name}</p>} {/* Display name if available */}
      <button onClick={onLogout} className={styles.logoutButton}>
        {/* Logout icon */}
        <img src="/logout.png" alt="Logout" style={{width: '20px', height:'20px'}} className={styles.logoutIcon} />
      </button>
    </div>
  </header>
);


// Simple functional component for the page footer
const Footer = () => (
  <footer className={styles.footer}>
    <p>&copy; {new Date().getFullYear()} Zurich Company</p>
  </footer>
);

// Component for rendering the filter input fields and buttons
const FilterControls = ({
  filterProductCode,
  filterLocation,
  onChangeProductCode,
  onChangeLocation,
  onApply,
  onClear
}) => (
  <div className={styles.filterControls}>
    {/* Product Code Filter Input */}
    <div className={styles.filterInputGroup}>
      <label htmlFor="product_code_filter">Product Code:</label>
      <input
        type="text"
        id="product_code_filter"
        value={filterProductCode}
        onChange={onChangeProductCode}
        placeholder="Enter Product Code"
      />
    </div>
    {/* Location Filter Input */}
    <div className={styles.filterInputGroup}>
      <label htmlFor="location_filter">Location:</label>
      <input
        type="text"
        id="location_filter"
        value={filterLocation}
        onChange={onChangeLocation}
        placeholder="Enter Location"
      />
    </div>
    {/* Filter Action Buttons */}
    <div className={styles.filterButtons}>
      <button onClick={onApply} className={styles.applyButton}>Apply Filters</button>
      <button onClick={onClear} className={styles.clearButton}>Clear Filters</button>
    </div>
  </div>
);

// Component responsible for rendering the main content
const Content = ({ loading, error, users, showEmail, toggleEmailVisibility, maskEmail }) => (
  <div className={styles.content}>
    {/* Show loading message */}
    {loading && <p>Loading billing records...</p>}
    {/* Show error message */}
    {error && <p className={styles.error}>Error: {error}</p>}
    {/* Show user list if not loading, no error, and users exist */}
    {!loading && !error && users.length > 0 ? (
      <ul className={styles.userList}>
        {/* Map over the users array to render each record */}
        {users.map((record) => (
          <li key={record.id} className={styles.userItem}>
            {/* Display user photo if available */}
            {record.photo && (
              <div className={styles.photoWrapper}>
                <img src={record.photo} alt={`${record.first_name} ${record.last_name}`} className={styles.userPhoto} />
              </div>
            )}
            {/* Display user details */}
            <div className={styles.userDetails}>
              {record.first_name && <p><strong>First Name:</strong> {record.first_name}</p>}
              {record.last_name && <p><strong>Last Name:</strong> {record.last_name}</p>}
              {record.product_code && <p><strong>Product Code:</strong> {record.product_code}</p>}
              {record.location && <p><strong>Location:</strong> {record.location}</p>}
              {/* Check for null explicitly for premium_paid as 0 is a valid value */}
              {record.premium_paid != null && (
                <p><strong>Premium Paid:</strong> {record.premium_paid}</p>
              )}
              {/* Display email section with mask/unmask functionality */}
              {record.email && (
                <div className={styles.emailSection}>
                  <p className={styles.emailDisplay}>
                    <strong>Email:</strong>{' '}
                    {/* Show full email or masked email based on state */}
                    {showEmail[record.id] ? record.email : maskEmail(record.email)}
                  </p>
                  {/* Button to toggle email visibility */}
                  <button
                    onClick={() => toggleEmailVisibility(record.id)}
                    className={styles.toggleButton}
                  >
                    {showEmail[record.id] ? 'Mask Email' : 'Unmask Email'}
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      // Show message if not loading, no error, but no users found
      !loading && !error && <p>No billing records found matching your criteria.</p>
    )}
  </div>
);

// Export the main page component
export default UsersPage;

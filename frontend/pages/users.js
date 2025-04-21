import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import { logout } from '../store/actions/authActions';
import styles from '../styles/Users.module.css';

const UsersPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmail, setShowEmail] = useState({});
  const [filterProductId, setFilterProductId] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000/billing';

  const fetchUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.productId) params.append('product_id', filters.productId);
      if (filters.location) params.append('location', filters.location);

      const query = params.toString();
      const requestUrl = query ? `${backendApiUrl}?${query}` : backendApiUrl;

      const response = await axios.get(requestUrl);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch billing records');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [backendApiUrl]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, router, fetchUsers]);

  const handleLogout = () => dispatch(logout());

  const toggleEmailVisibility = (id) =>
    setShowEmail((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleApplyFilters = () =>
    fetchUsers({ productId: filterProductId, location: filterLocation });

  const handleClearFilters = () => {
    setFilterProductId('');
    setFilterLocation('');
    fetchUsers();
  };

  const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    const atIndex = email.indexOf('@');
    if (atIndex <= 2) {
      return email.substring(0, 1) + '...' + (atIndex > 0 ? email.substring(atIndex) : '');
    }
    return `${email.substring(0, 2)}...${email.substring(atIndex)}`;
  };

  if (!isAuthenticated && loading) return <p>Loading authentication status...</p>;
  if (!isAuthenticated) return null;

  return (
    <div className={styles.container}>
      <Header user={user} onLogout={handleLogout} />
      <main>
        <FilterControls
          filterProductId={filterProductId}
          filterLocation={filterLocation}
          onChangeProductId={(e) => setFilterProductId(e.target.value)}
          onChangeLocation={(e) => setFilterLocation(e.target.value)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
        <Content
          loading={loading}
          error={error}
          users={users}
          showEmail={showEmail}
          toggleEmailVisibility={toggleEmailVisibility}
          maskEmail={maskEmail}
        />
      </main>
      <Footer />
    </div>
  );
};

const Header = ({ user, onLogout }) => (
  <header className={styles.header}>
    <h1>Customer Billing Records</h1>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
      {user?.name && <p style={{ margin: 0 }}>{user.name}</p>}
      <button onClick={onLogout} className={styles.logoutButton}>
        <img src="/logout.png" alt="Logout" style={{width: '20px', height:'20px'}} className={styles.logoutIcon} />
      </button>
    </div>
  </header>
);


const Footer = () => (
  <footer className={styles.footer}>
    <p>&copy; {new Date().getFullYear()} Zurich Company</p>
  </footer>
);

const FilterControls = ({
  filterProductId,
  filterLocation,
  onChangeProductId,
  onChangeLocation,
  onApply,
  onClear
}) => (
  <div className={styles.filterControls}>
    <div className={styles.filterInputGroup}>
      <label htmlFor="product_id_filter">Product ID:</label>
      <input
        type="text"
        id="product_id_filter"
        value={filterProductId}
        onChange={onChangeProductId}
        placeholder="Enter Product ID"
      />
    </div>
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
    <div className={styles.filterButtons}>
      <button onClick={onApply} className={styles.applyButton}>Apply Filters</button>
      <button onClick={onClear} className={styles.clearButton}>Clear Filters</button>
    </div>
  </div>
);

const Content = ({ loading, error, users, showEmail, toggleEmailVisibility, maskEmail }) => (
  <div className={styles.content}>
    {loading && <p>Loading billing records...</p>}
    {error && <p className={styles.error}>Error: {error}</p>}
    {!loading && !error && users.length > 0 ? (
      <ul className={styles.userList}>
        {users.map((record) => (
          <li key={record.id} className={styles.userItem}>
            {record.photo && (
              <div className={styles.photoWrapper}>
                <img src={record.photo} alt={`${record.first_name} ${record.last_name}`} className={styles.userPhoto} />
              </div>
            )}
            <div className={styles.userDetails}>
              {record.first_name && <p><strong>First Name:</strong> {record.first_name}</p>}
              {record.last_name && <p><strong>Last Name:</strong> {record.last_name}</p>}
              {record.product_id && <p><strong>Product ID:</strong> {record.product_id}</p>}
              {record.location && <p><strong>Location:</strong> {record.location}</p>}
              {record.premium_paid != null && (
                <p><strong>Premium Paid:</strong> {record.premium_paid}</p>
              )}
              {record.email && (
                <div className={styles.emailSection}>
                  <p className={styles.emailDisplay}>
                    <strong>Email:</strong>{' '}
                    {showEmail[record.id] ? record.email : maskEmail(record.email)}
                  </p>
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
      !loading && !error && <p>No billing records found matching your criteria.</p>
    )}
  </div>
);

export default UsersPage;
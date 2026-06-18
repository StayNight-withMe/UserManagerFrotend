import { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, ButtonGroup } from 'react-bootstrap';
import api from '../services/api';
import type { User } from '../types/user';
import { useAuth } from '../hooks/useAuth';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { logout } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map(u => u.id)));
  };

  const handleAction = async (action: 'block' | 'unblock' | 'delete' | 'deleteUnverified') => {
    try {
      if (action === 'deleteUnverified') {
        await api.delete('/users/unverified');
      } else {
        const url = action === 'delete' ? '/users' : `/users/${action}`;
        if (action === 'delete') {
          await api.delete(url, { data: Array.from(selectedIds) });
        } else {
          await api.post(url, Array.from(selectedIds));
        }
      }
      setSelectedIds(new Set());
      await fetchUsers();
    } catch {
      alert('Action failed');
    }
  };

  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) return 'less than a minute ago';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase()) || 
    u.email.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Container className="mt-5" style={{ maxWidth: '1200px' }}>
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <ButtonGroup>
          <Button variant="outline-primary" onClick={() => handleAction('block')} disabled={selectedIds.size === 0} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            🔒 Block
          </Button>
          <Button variant="outline-primary" onClick={() => handleAction('unblock')} disabled={selectedIds.size === 0}>
            🔓
          </Button>
          <Button variant="outline-danger" onClick={() => handleAction('delete')} disabled={selectedIds.size === 0}>
            🗑️
          </Button>
          <Button variant="outline-danger" onClick={() => handleAction('deleteUnverified')}>
            🧹
          </Button>
        </ButtonGroup>
        <div className="d-flex gap-2 w-50 justify-content-end">
            <input type="text" className="form-control w-50" placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <Button variant="outline-primary" onClick={logout}>Logout</Button>
        </div>
      </div>

      <Table hover style={{ verticalAlign: 'middle' }}>
        <thead>
          <tr>
            <th style={{ width: '40px' }}><input type="checkbox" checked={selectedIds.size === users.length && users.length > 0} onChange={toggleSelectAll} /></th>
            <th>Name</th>
            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('email')}>
                Email {sortConfig?.key === 'email' ? (sortConfig.direction === 'asc' ? '↓' : '↑') : '↓'}
            </th>
            <th>Status</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td><input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} /></td>
              <td>
                <div style={{ fontWeight: '500' }}>{user.name}</div>
                <small className="text-muted">N/A</small>
              </td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td title={new Date(user.lastLoginTime).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '15px' }}>{getRelativeTime(user.lastLoginTime)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserManagement;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Spinner,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { userApi } from './api/userApi';
import type { User } from './types';

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      if (currentActive) {
        await userApi.deactivateUser(userId);
      } else {
        await userApi.activateUser(userId);
      }
      await fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleViewUser = (userId: number) => {
    navigate(`/user-list/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    navigate(`/user-list/${userId}/edit`);
  };

  const handleCreateUser = () => {
    navigate('/user-list/create');
  };

  const columns = [
    { key: 'userID', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'logisticRole', label: 'Logistic Role' },
    { key: 'active', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderCell = (user: User, columnKey: string) => {
    switch (columnKey) {
      case 'userID':
        return <span className="text-sm">{user.userID}</span>;
      case 'username':
        return <span className="text-sm font-semibold">{user.username}</span>;
      case 'name':
        return <span className="text-sm">{`${user.firstName} ${user.lastName}`}</span>;
      case 'email':
        return <span className="text-sm">{user.email}</span>;
      case 'phone':
        return <span className="text-sm">{user.phone || '-'}</span>;
      case 'role':
        return <span className="text-sm">{user.role || '-'}</span>;
      case 'logisticRole':
        return <span className="text-sm">{user.logisticRole || '-'}</span>;
      case 'active':
        return (
          <Chip color={user.active ? 'success' : 'danger'} size="sm" variant="flat">
            {user.active ? 'Active' : 'Inactive'}
          </Chip>
        );
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleViewUser(user.userID)}
            >
              <Icon icon="solar:eye-linear" width={18} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleEditUser(user.userID)}
            >
              <Icon icon="solar:pen-linear" width={18} />
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon icon="solar:menu-dots-linear" width={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions">
                <DropdownItem
                  key={user.active ? 'deactivate' : 'activate'}
                  color={user.active ? 'danger' : 'success'}
                  onPress={() => handleToggleActive(user.userID, user.active)}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-default-500">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="solar:user-plus-linear" width={20} />}
          onPress={handleCreateUser}
        >
          Create User
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by name, username, or email..."
          startContent={<Icon icon="solar:magnifer-linear" width={20} />}
          value={searchQuery}
          onClear={() => setSearchQuery('')}
          onValueChange={setSearchQuery}
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-default-500">
            Total: {filteredUsers.length} users
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={fetchUsers}
          >
            <Icon icon="solar:refresh-linear" width={20} />
          </Button>
        </div>
      </div>

      <Table aria-label="User list table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} align={column.key === 'actions' ? 'center' : 'start'}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={filteredUsers}
          isLoading={isLoading}
          loadingContent={<Spinner label="Loading users..." />}
          emptyContent={<div className="text-center py-8">No users found</div>}
        >
          {(item) => (
            <TableRow key={item.userID}>
              {(columnKey) => (
                <TableCell>{renderCell(item, String(columnKey))}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

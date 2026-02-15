import React from 'react';
import UserList from 'components/sms/users/UserList';

const AdminUsers = () => (
  <UserList
    roleLabel="Admin"
    title="Admins"
    subtitle="Manage admin accounts and permissions."
  />
);

export default AdminUsers;

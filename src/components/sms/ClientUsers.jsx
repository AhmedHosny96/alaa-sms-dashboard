import React from 'react';
import UserList from 'components/sms/users/UserList';

const ClientUsers = () => (
  <UserList
    roleLabel="Client"
    title="Clients"
    subtitle="Manage client accounts and access."
  />
);

export default ClientUsers;

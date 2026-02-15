import React from 'react';
import UserList from 'components/sms/users/UserList';

const AgentUsers = () => (
  <UserList
    roleLabel="Agent"
    title="Agents"
    subtitle="Manage agent accounts and permissions."
  />
);

export default AgentUsers;

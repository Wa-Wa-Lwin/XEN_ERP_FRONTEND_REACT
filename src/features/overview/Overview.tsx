import { useAuth } from '@context/AuthContext'
import { useState, useEffect } from 'react'
import type { DatabaseUser } from '../../types'

const Overview = () => {
  const { user } = useAuth();
  const [userDataByEmail, setUserDataByEmail] = useState<DatabaseUser | null>(null);
  
  useEffect(() => {
    // Load database user data from localStorage
    const storedUserData = localStorage.getItem('user_data_by_email');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserDataByEmail(parsedData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user?.name || user?.email}! This is the overview page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Context User Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Auth Context User Data</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">ID:</span> {user?.id}</p>
            <p><span className="font-medium">Role:</span> {user?.role}</p>
            <p><span className="font-medium">Access Token:</span> {user?.accessToken}</p>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Raw Data</summary>
            <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>

        {/* Database User Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Database User Data (user_data_by_email)</h2>
          {userDataByEmail ? (
            <div className="space-y-2">
              <p><span className="font-medium">User ID:</span> {userDataByEmail.userID}</p>
              <p><span className="font-medium">Username:</span> {userDataByEmail.username}</p>
              <p><span className="font-medium">First Name:</span> {userDataByEmail.firstName}</p>
              <p><span className="font-medium">Last Name:</span> {userDataByEmail.lastName}</p>
              <p><span className="font-medium">Email:</span> {userDataByEmail.email}</p>
              <p><span className="font-medium">Phone:</span> {userDataByEmail.phone}</p>
              <p><span className="font-medium">Gender:</span> {userDataByEmail.gender}</p>
              <p><span className="font-medium">Department ID:</span> {userDataByEmail.departmentID}</p>
              <p><span className="font-medium">Position ID:</span> {userDataByEmail.postitionID}</p>
              <p><span className="font-medium">Role:</span> {userDataByEmail.role}</p>
              <p><span className="font-medium">User Code:</span> {userDataByEmail.user_code}</p>
              <p><span className="font-medium">Supervisor ID:</span> {userDataByEmail.supervisorID}</p>
              <p><span className="font-medium">Level:</span> {userDataByEmail.level}</p>
              <p><span className="font-medium">Section Index:</span> {userDataByEmail.section_index}</p>
              <p><span className="font-medium">Active:</span> {userDataByEmail.active}</p>
            </div>
          ) : (
            <p className="text-gray-500">No database user data available</p>
          )}
          
          {userDataByEmail && (
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Raw Database Data</summary>
              <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(userDataByEmail, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

export default Overview
import { useAuth } from '@context/AuthContext'

const Overview = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Overview</h1>
      <p>
        Welcome, {user?.email}! This is the overview page.
      </p>
      <h2>User Data</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
    </div>
  )
}

export default Overview
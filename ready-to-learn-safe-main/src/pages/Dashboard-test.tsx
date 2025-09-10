import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardTest = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    console.log("Dashboard component mounted");
    
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');
    
    console.log("Auth check:", {
      token: token ? "exists" : "missing",
      userType,
      userData: userData ? "exists" : "missing"
    });

    if (!token || userType !== 'student') {
      console.log("No valid auth, redirecting to /auth");
      navigate('/auth');
      return;
    }

    setAuthStatus("authenticated");
  }, [navigate]);

  if (authStatus === "checking") {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Checking authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard Test - Working!</h1>
      <p>Authentication Status: {authStatus}</p>
      <p>If you can see this, the basic routing is working.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>Token: {localStorage.getItem('authToken') ? "Present" : "Missing"}</li>
          <li>User Type: {localStorage.getItem('userType') || "None"}</li>
          <li>User Data: {localStorage.getItem('userData') ? "Present" : "Missing"}</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/auth')}>Go to Auth</button>
        <button onClick={() => navigate('/modules')} style={{ marginLeft: '10px' }}>Go to Modules</button>
      </div>
    </div>
  );
};

export default DashboardTest;

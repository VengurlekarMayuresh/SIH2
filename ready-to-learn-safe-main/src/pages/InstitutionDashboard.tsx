import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstituteDashboard from "@/components/InstituteDashboard";

const InstitutionDashboardPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || userType !== 'institution') {
      navigate('/auth');
      return;
    }
    
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log('Logging out institution...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    // Clear any other potential auth-related items
    localStorage.clear();
    console.log('LocalStorage cleared, redirecting to home...');
    navigate('/');
  };

  // Show loading if user data is not yet loaded
  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading institution dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <InstituteDashboard 
      institutionData={userData} 
      onLogout={handleLogout} 
    />
  );
};

export default InstitutionDashboardPage;

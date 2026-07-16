import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { URLS } from "@/utils/routes";

export const AccessDenied = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get error message from URL query parameter
  const errorMessage = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-dustWhite p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription className="text-base">
            {errorMessage || "You must be invited to access this platform"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Your Google account is not authorized to access this portal. 
            Please contact your administrator to request access.
          </p>
          
          <div className="pt-4">
            <Button 
              onClick={() => navigate(URLS.ADMIN_LOGIN, { replace: true })}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            Need help? Contact your system administrator
          </div>
        </CardContent>
      </Card>
    </div>
  );
};




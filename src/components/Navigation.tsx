import { Button } from "@/components/ui/button";
import AuthDialog from "./AuthDialog";

const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/361bdbb6-9f48-48aa-a8d1-cce697fb5ca2.png" 
              alt="BadgeSheet" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-textDark">BadgeSheet</span>
          </div>

          {/* Right - Auth Buttons */}
          <div className="flex items-center space-x-4">
            <AuthDialog mode="login">
              <Button variant="ghost" className="text-textDark hover:text-primary">
                Login
              </Button>
            </AuthDialog>
            <AuthDialog mode="signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Sign Up
              </Button>
            </AuthDialog>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

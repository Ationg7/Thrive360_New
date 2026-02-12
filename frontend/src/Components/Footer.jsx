import { Link } from 'react-router-dom';

function Footer() {
    return (
      <footer className="footer">
    <div className="footer-left">
         <span>© 2025 Thrive360. All rights reserved.</span>
        </div>
  
        <div className="footer-center">
        <Link to="/terms">Terms and Conditions</Link>
        <span>•</span>
        <Link to="/privacy">Privacy Policy</Link>
        <span>•</span>
        <Link to="/services">Terms of Service</Link>
        <span>•</span>
        <Link to="/about">About</Link>
        </div>
        <div className="footer-right">
        <span>Developed by: Ferlita Ationg & Chanlyn Sanchez</span>
        
        </div>
    </footer>
    
        
    );
  }
  
  export default Footer;
  
  
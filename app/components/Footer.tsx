import CmrWebDevLockup from './CmrWebDevLockup';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-2 md:mb-0">
            © {new Date().getFullYear()} Detachment of Florida
          </div>
          <div className="text-sm flex items-center space-x-4">
            <CmrWebDevLockup onDark />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

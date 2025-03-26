import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-2 md:mb-0">
            © {new Date().getFullYear()} Sons of The American Legion Detachment of Florida. All rights reserved.
          </div>
          <div className="text-sm flex items-center space-x-4">
            <a href="https://www.cmrwebstudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
              Web Development by CMR Web Studio
            </a>
            <Image
              src="/cmr_patriotic_logo_65.png"
              alt="CMR Web Studio Patriotic Logo"
              width={84}
              height={30}
              className="h-[30px] w-[84px]"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
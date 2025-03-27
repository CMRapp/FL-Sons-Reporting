import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-blue-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-2 md:mb-0">
            © {new Date().getFullYear()} Detachment of Florida
          </div>
          <div className="text-sm flex items-center space-x-4">
            <a href="https://www.cmrwebstudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">
              Web Development by
            </a>
            <a href="https://www.cmrwebstudio.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="/cmr_patriotic_logo_65.png"
                alt="CMR Web Studio Patriotic Logo"
                width={84}
                height={30}
                className="h-[30px] w-[84px]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
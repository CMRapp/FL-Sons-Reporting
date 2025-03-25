import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-white">
      <div className="max-w-4xl lg:max-w-[1200px] mx-auto px-6">
        <div className="flex justify-center">
          <a
            href="https://cmrwebstudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/cmr_patriotic_logo_65.png"
              alt="CMR Web Studio Logo"
              width={183}
              height={65}
              priority
              className="w-[183px] h-[65px]"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
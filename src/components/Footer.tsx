
const Footer = () => {
  return (
    <footer className="bg-textDark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Logo and Copyright */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">Badge Inserts</div>
            <div className="text-white/60">© 2025 Badge Inserts</div>
          </div>

          {/* Right - Links */}
          <div className="flex flex-wrap gap-6 md:justify-end">
            <a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">
              About
            </a>
            <a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">
              Docs
            </a>
            <a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">
              Support
            </a>
            <a href="#" className="text-white/80 hover:text-white hover:underline transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

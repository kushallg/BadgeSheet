const Footer = () => {
  return (
    <footer className="bg-textDark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left - Logo and Copyright */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">BadgeSheet</div>
            <div className="text-white/60">© 2025 BadgeSheet</div>
          </div>

          {/* Right - Links */}
          <div className="flex flex-wrap gap-6 md:justify-end">
            <a href="mailto:cookieg4u@gmail.com" className="text-white/80 hover:text-white hover:underline transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

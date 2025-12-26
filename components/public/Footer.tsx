import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Lindsay Precast</h3>
            <p className="text-sm text-gray-400">
              Excellence in precast concrete solutions for renewable energy infrastructure.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/projects" className="hover:text-white transition-colors">Projects</Link></li>
              <li><Link href="/team" className="hover:text-white transition-colors">Team</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors">Precast Concrete</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Battery Storage</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Infrastructure</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@lindsayprecast.com</li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Form</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lindsay Precast. All rights reserved.</p>
            <span className="text-gray-700">|</span>
            <Link 
              href="/admin/login" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-gray-500"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

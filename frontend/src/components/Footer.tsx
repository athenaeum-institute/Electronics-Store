import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      {/* Support / CTA Section */}
      <section className="pt-8 pb-12 sm:py-16 md:py-section-gap px-container-margin max-w-[1440px] mx-auto text-center">
        <div className="bg-primary rounded-[24px] md:rounded-[32px] p-8 py-12 sm:p-16 md:p-24 text-on-primary mx-4 md:mx-0">
          <h2 className="font-bold tracking-tight text-3xl sm:text-4xl md:text-display-lg mb-4 md:mb-8">Elevate Your Living.</h2>
          <p className="text-sm sm:text-base md:font-body-lg md:text-body-lg text-on-primary/70 mb-8 md:mb-12 max-w-xs sm:max-w-md md:max-w-xl mx-auto leading-relaxed">
            Join the Ali Electronics experience today and transform your home with precision-engineered technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
            <button className="bg-on-primary text-primary px-8 md:px-12 py-3 md:py-4 rounded-xl font-label-md font-bold hover:bg-surface transition-colors cursor-pointer w-full sm:w-auto">
              Browse Catalog
            </button>
            <button className="border border-on-primary/30 text-on-primary px-8 md:px-12 py-3 md:py-4 rounded-xl font-label-md font-bold hover:bg-white/10 transition-colors cursor-pointer w-full sm:w-auto">
              Find a Store
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white pt-16 pb-8 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-[1440px] mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Column 1 & 2 (Brand & Newsletter) */}
            <div className="md:col-span-2 flex flex-col items-start">
              <Link to="/" className="text-2xl font-bold text-black mb-4">Ali Electronics</Link>
              <p className="text-neutral-500 mb-8 max-w-sm text-left">
                Refining modern living through technical excellence and minimalist industrial design.
              </p>
              <div className="w-full max-w-sm mt-auto">
                <h4 className="text-sm font-semibold text-black mb-3 text-left">Subscribe to our Newsletter</h4>
                <form className="flex w-full items-center gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Column 3 (Products) */}
            <div className="flex flex-col text-left">
              <h4 className="font-semibold text-black mb-4">Products</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Kitchen</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Climate</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Entertainment</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Laundry</a></li>
              </ul>
            </div>

            {/* Column 4 (Company) */}
            <div className="flex flex-col text-left">
              <h4 className="font-semibold text-black mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Sustainability</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Our Story</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Careers</a></li>
              </ul>
            </div>

            {/* Column 5 (Support & Legal) */}
            <div className="flex flex-col text-left">
              <h4 className="font-semibold text-black mb-4">Support</h4>
              <ul className="space-y-3 mb-8">
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Support Center</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Contact Us</a></li>
                <li><a href="#" className="text-neutral-500 hover:text-black transition-colors text-sm">Manuals</a></li>
              </ul>
              
              <h4 className="font-semibold text-black mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-neutral-500 hover:text-black transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-neutral-500 hover:text-black transition-colors text-sm">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="text-neutral-500 hover:text-black transition-colors text-sm">Refund Policy</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
            <p className="text-neutral-500 text-sm">
              © 2026 Ali Electronics. All rights reserved.
            </p>
            
            {/* Trust Signals */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-neutral-400 hover:text-black transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-black transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-black transition-colors" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
              
              {/* Payment Methods */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">VISA</div>
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">MC</div>
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">AMEX</div>
                <div className="w-10 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">Pay</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

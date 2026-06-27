import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-16 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Privacy Policy</h1>
      <div className="prose text-neutral-600">
        <p className="mb-4">Last updated: June 2026</p>
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">At Ali Electronics (an official Haier dealer), we collect personal information that you provide to us when registering for an account, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Website, or otherwise contacting us.</p>
        
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
        
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">3. Will Your Information Be Shared With Anyone?</h2>
        <p className="mb-4">We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
      </div>
      <div className="mt-12">
        <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="pt-24 pb-16 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Terms of Service</h1>
      <div className="prose text-neutral-600">
        <p className="mb-4">Last updated: June 2026</p>
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">1. Agreement to Terms</h2>
        <p className="mb-4">These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Ali Electronics ("Company", “we”, “us”, or “our”), concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).</p>
        
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">2. Products</h2>
        <p className="mb-4">We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.</p>
      </div>
      <div className="mt-12">
        <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

export function RefundPolicy() {
  return (
    <div className="pt-24 pb-16 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Return & Refund Policy</h1>
      <div className="prose text-neutral-600">
        <p className="mb-4">Last updated: June 2026</p>
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">1. Returns</h2>
        <p className="mb-4">All returns must be postmarked within thirty (30) days of the purchase date. All returned items must be in new and unused condition, with all original tags and labels attached. Due to the nature of large appliances, return shipping fees may apply unless the item is defective.</p>
        
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">2. Return Process</h2>
        <p className="mb-4">To return an item, please email customer service at support@alielectronics.com to obtain a Return Merchandise Authorization (RMA) number. After receiving a RMA number, place the item securely in its original packaging and include your proof of purchase, then mail your return to the address provided by our support team.</p>
        
        <h2 className="text-xl font-bold text-neutral-900 mt-8 mb-4">3. Refunds</h2>
        <p className="mb-4">After receiving your return and inspecting the condition of your item, we will process your return. Please allow at least seven (7) days from the receipt of your item to process your return. Refunds may take 1-2 billing cycles to appear on your credit card statement, depending on your credit card company.</p>
      </div>
      <div className="mt-12">
        <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

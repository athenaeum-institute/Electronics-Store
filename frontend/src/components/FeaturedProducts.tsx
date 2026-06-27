import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

export default function FeaturedProducts() {
  const addToCart = useStore((state) => state.addToCart);
  return (
    <section className="pt-8 pb-8 sm:pt-16 md:py-section-gap bg-surface-container-low">
      <div className="px-6 md:px-container-margin max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div className="mb-4 md:mb-0 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-left sm:text-3xl md:text-4xl lg:text-[40px]">Signature Products</h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 text-left mt-1 md:mt-2 max-w-[290px] md:max-w-[600px] leading-relaxed">The pinnacle of our design philosophy. Uncompromising performance wrapped in minimalist aesthetics.</p>
          </div>
          <button className="flex items-center gap-2 text-primary font-label-md hover:gap-4 transition-all group">
            View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-grid-gutter overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-8 pt-2 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
          {/* Card 1: Haier 1.5 Ton AC */}
          <div className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-center bg-surface-container-lowest p-5 md:p-6 rounded-[24px] bento-card-shadow group transition-all hover:scale-[1.01]">
            <div className="aspect-square bg-surface-container rounded-xl overflow-hidden mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8">
              <img
                className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                alt="Haier AC"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWyvwms9Y5eGSf0obuTUnLB2rnovpoSIWgClCo-oOdeDuXZWKiH2puagK581X7dePt54C7ymn8KfpEy5afAnRf8Os2O9iFSCY7g3wIBDnd3Idr4KjromToKBDgf8Ij2kOlFDQdRQWZPpT_nhiORM9FI3oa68LiQj0qcdQ8ZsF7Gl7xYair_OB5JQ4tWFQwebRl5xkynhVZHHxz_5CJtymkMrag3kUv8u8NF3M_X9DsiDgfMxzECljXTCnd1LxeNFLtXZctwv3Fbiy-"
              />
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">1.5 Ton</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">Inverter</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">10 Yrs Warranty</span>
            </div>
            <h4 className="font-headline-md text-lg md:text-headline-md text-primary mb-1 md:mb-2">Haier Precision AC</h4>
            <p className="text-primary font-bold text-xl md:text-headline-md">Rs. 185,000</p>
            <button
              onClick={() => {
                addToCart({
                  id: 'product-1',
                  title: 'Haier Precision AC',
                  price: 185000,
                  category: 'Climate Control',
                  stock: 10,
                  image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWyvwms9Y5eGSf0obuTUnLB2rnovpoSIWgClCo-oOdeDuXZWKiH2puagK581X7dePt54C7ymn8KfpEy5afAnRf8Os2O9iFSCY7g3wIBDnd3Idr4KjromToKBDgf8Ij2kOlFDQdRQWZPpT_nhiORM9FI3oa68LiQj0qcdQ8ZsF7Gl7xYair_OB5JQ4tWFQwebRl5xkynhVZHHxz_5CJtymkMrag3kUv8u8NF3M_X9DsiDgfMxzECljXTCnd1LxeNFLtXZctwv3Fbiy-'
                });
                toast.success('Added Haier Precision AC to bag');
              }}
              className="w-full mt-4 md:mt-6 bg-primary text-on-primary py-2 md:py-3 rounded-xl font-label-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              Add to Bag
            </button>
          </div>

          {/* Card 2: Smart LED TV */}
          <div className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-center bg-surface-container-lowest p-5 md:p-6 rounded-[24px] bento-card-shadow group transition-all hover:scale-[1.01]">
            <div className="aspect-square bg-surface-container rounded-xl overflow-hidden mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8">
              <img
                className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                alt="Smart TV"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMeoNhXIwfjkIpIeLBSUBgvG6Ki7VpFIcOFSv37CPFE9bVpGXwy-kXw1Ws1SxwhXnooIz7z0GxTcU6goZCKES3PdH8qd_fE1As6L6a56M3RE4QXxQ0IfdUX0SbQ_fC4eMnpLsJgL4Wf0vVcAECGcXnXZdwOVWawGCevORUM1DrwsMJDYBfjvIU18Ie4YoYQPEpuT-AcQuWNwsTVh6X1pigSAmj9v8pt_77YzNhcdZf_jvvch6Bud9mVsNfKO-kjcghkKz75qoiJV73"
              />
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">4K Ultra HD</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">65 Inch</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">OLED</span>
            </div>
            <h4 className="font-headline-md text-lg md:text-headline-md text-primary mb-1 md:mb-2">Smart OLED Display</h4>
            <p className="text-primary font-bold text-xl md:text-headline-md">Rs. 350,000</p>
            <button
              onClick={() => {
                addToCart({
                  id: 'product-2',
                  title: 'Smart OLED Display',
                  price: 350000,
                  category: 'Entertainment',
                  stock: 5,
                  image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMeoNhXIwfjkIpIeLBSUBgvG6Ki7VpFIcOFSv37CPFE9bVpGXwy-kXw1Ws1SxwhXnooIz7z0GxTcU6goZCKES3PdH8qd_fE1As6L6a56M3RE4QXxQ0IfdUX0SbQ_fC4eMnpLsJgL4Wf0vVcAECGcXnXZdwOVWawGCevORUM1DrwsMJDYBfjvIU18Ie4YoYQPEpuT-AcQuWNwsTVh6X1pigSAmj9v8pt_77YzNhcdZf_jvvch6Bud9mVsNfKO-kjcghkKz75qoiJV73'
                });
                toast.success('Added Smart OLED Display to bag');
              }}
              className="w-full mt-4 md:mt-6 bg-primary text-on-primary py-2 md:py-3 rounded-xl font-label-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              Add to Bag
            </button>
          </div>

          {/* Card 3: French Door Refrigerator */}
          <div className="min-w-[85vw] sm:min-w-[320px] md:min-w-0 snap-center bg-surface-container-lowest p-5 md:p-6 rounded-[24px] bento-card-shadow group transition-all hover:scale-[1.01]">
            <div className="aspect-square bg-surface-container rounded-xl overflow-hidden mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8">
              <img
                className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                alt="Refrigerator"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOrws-_9myUNhJ3M64j_pA6uyi0zuTvhFj6RIaEYCJNPaNtBlKNG1D3gSTHpeX0QAOm3rdALFGvd74V5O_aAZbQW50ZDH1QiuR470ROB4n2srmCNAEuqTnoYFJEx099h3KoyKJuYPYv8XwxA3oRN5IwgcWQJ9As8MjnRVdBHkqLuxB4ouY1-iAzSNUekyfV6z30KpFfprwcCcWM4MJGPmDD0tEmgbSzwwuqcJMchXd5ayC5e_mLwvf5Jip_GCaYsPicqQQ89T9o-bD"
              />
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">500L</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">Energy Star</span>
              <span className="px-3 py-1 border border-primary/10 rounded-full font-label-sm text-label-sm">Smart Cool</span>
            </div>
            <h4 className="font-headline-md text-lg md:text-headline-md text-primary mb-1 md:mb-2">French Door Cooling</h4>
            <p className="text-primary font-bold text-xl md:text-headline-md">Rs. 520,000</p>
            <button
              onClick={() => {
                addToCart({
                  id: 'product-3',
                  title: 'French Door Cooling',
                  price: 520000,
                  category: 'Kitchen',
                  stock: 3,
                  image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOrws-_9myUNhJ3M64j_pA6uyi0zuTvhFj6RIaEYCJNPaNtBlKNG1D3gSTHpeX0QAOm3rdALFGvd74V5O_aAZbQW50ZDH1QiuR470ROB4n2srmCNAEuqTnoYFJEx099h3KoyKJuYPYv8XwxA3oRN5IwgcWQJ9As8MjnRVdBHkqLuxB4ouY1-iAzSNUekyfV6z30KpFfprwcCcWM4MJGPmDD0tEmgbSzwwuqcJMchXd5ayC5e_mLwvf5Jip_GCaYsPicqQQ89T9o-bD'
                });
                toast.success('Added French Door Cooling to bag');
              }}
              className="w-full mt-4 md:mt-6 bg-primary text-on-primary py-2 md:py-3 rounded-xl font-label-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

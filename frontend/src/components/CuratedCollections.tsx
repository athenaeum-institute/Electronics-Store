import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function CuratedCollections() {
  const [images, setImages] = useState({
    inverter_acs: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClpti4jrylLXtuK0fUbf9vpHNIM83guYpfIEEWHZ0mjI6ikL7o2aUcjE4FLKtkh-l-WxJSXPsRjXFosdGAffjncuUQKUxmMksAXwVtQzVM4ODrewESf2Rwa95PCzbsuSKbOPLOWBWEVFzUVIgiGYU4rGrN6DeUiVqG-sPEGVey_5bzJzwpZYLz03Q-WQVhJWiiF-GyH9riCPcmBE1LZDtaDvDH8J39PzR7BqQ2m_ICEp2vrPRlVLVGHhH13oVU2VCWn1QsQKryhLwQ',
    led_tvs: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4Y6LFe43U84XzH5zg6XBUS4GIsKp5AAX2L0QKMMSRwgxUH5siu4TsIexBHPBLdpSAIuuwuTmx4oqnU8WUXt6D-_kfVfgWt3mQumbu82q19cb9wq7OJJNi4iq9sGn1MoayKeCPJvACxGp6JKpmPcqztWKlfHYzPRfDftSGv7SHhotj6orKyQzuHUYTO4YFuhy05phjphx75TCJO0DQOSLmi0WMFNSslKoWL_1i6uwzWHZTZWpZedXl8arIN2tWjM--cEjxGGmLizkD',
    refrigerators: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHTgeuZHD7E6Ui4phLuU1MclxwPMLZhCjdROpxqKbMGgJEdPDK2BfvIpqJhWD5GJ913BNkjhFhLxwwIKsKalO-IYn_BstoFO2JfRfZueAMY_nTosrMMfn-9UmIsZzur16Sa4fnOUxCZdLVspbGuV5EOzBBk-_vWkMIiGuWxIwISW11Cd8R47k2RetvDfXj5URfyb8KsgbmonSoSJELpmxrbYZS__ID0FAZavKmki8tPoONZIe2JYVHSJX14aDTP921XEGP9OK_dIi6',
    washing_machines: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaUgFNN58S61v15VMGrHi9R-tQ4OAm_54Pg9UctLZgBpxdobzCixzq2QuXgTMLGiiysUeWsF3nkfCfVteQcG5CaGG1uNkYdk7c9SJOae440ZBkE0Pxno43PL5FtPyCg8fkpPWs3TpRDpKeomNMZHlmsWsBjgvuyX2O0766vXZwIRJVOeOqu20phiOfC1WsLoSskOTI57YUoSd8RaI2GzRSlZY-_sW3HizvHaPJPHm2lKVLWRmHegLtDLux9trJGVrsRSnRSqxJyuRW'
  });

  useEffect(() => {
    async function fetchImages() {
      const { data } = await supabase.from('site_settings').select('*').in('key', [
        'category_inverter_acs_image',
        'category_led_tvs_image',
        'category_refrigerators_image',
        'category_washing_machines_image'
      ]);
      if (data) {
        const getVal = (key: string, fallback: string) => {
          const item = data.find(d => d.key === key);
          return item && item.value ? item.value : fallback;
        };
        setImages(prev => ({
          inverter_acs: getVal('category_inverter_acs_image', prev.inverter_acs),
          led_tvs: getVal('category_led_tvs_image', prev.led_tvs),
          refrigerators: getVal('category_refrigerators_image', prev.refrigerators),
          washing_machines: getVal('category_washing_machines_image', prev.washing_machines),
        }));
      }
    }
    fetchImages();
  }, []);

  return (
    <section className="pt-8 pb-8 sm:pt-16 md:py-section-gap px-container-margin max-w-[1440px] mx-auto">
      <div className="mb-8 md:mb-12 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-left sm:text-3xl md:text-4xl lg:text-[40px]">Premium Collections</h2>
        <p className="text-xs sm:text-sm md:text-base text-neutral-500 text-left mt-1 md:mt-2 max-w-[290px] md:max-w-[600px] leading-relaxed">Discover our range of meticulously crafted appliances, designed to elevate your everyday lifestyle.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-grid-gutter h-auto md:h-[800px]">
        {/* Large: Inverter ACs */}
        <Link to="/products?category=Inverter%20ACs" className="col-span-2 md:col-span-8 bg-surface-container-low rounded-[24px] p-4 md:p-10 flex flex-col justify-between group overflow-hidden bento-card-shadow relative block">
          <div className="z-10 max-w-[50%] md:max-w-full">
            <span className="font-label-sm text-[10px] md:text-label-sm text-secondary tracking-widest uppercase mb-1 md:mb-2 block">Climate Control</span>
            <h3 className="font-headline-lg text-xl md:text-headline-lg text-primary">Inverter ACs</h3>
            <p className="text-secondary text-xs md:text-base mt-1 md:mt-2 md:max-w-xs relative z-10">Silent & energy efficient.</p>
          </div>
          <img
            className="absolute bottom-[5%] md:bottom-[-10%] right-[-5%] md:right-[-10%] w-[55%] md:w-[70%] object-contain group-hover:scale-105 transition-transform duration-700"
            alt="Inverter AC"
            src={images.inverter_acs}
          />
        </Link>

        {/* LED TVs */}
        <Link to="/products?category=LED%20TVs" className="col-span-1 md:col-span-4 bg-surface-container-low rounded-[24px] p-4 md:p-8 flex flex-col justify-between group overflow-hidden bento-card-shadow relative min-h-[180px] md:min-h-0 block">
          <div className="z-10">
            <span className="font-label-sm text-[10px] md:text-label-sm text-secondary tracking-widest uppercase mb-1 md:mb-2 block">Entertainment</span>
            <h3 className="font-headline-md text-base md:text-headline-md font-bold md:font-semibold text-primary">LED TVs</h3>
          </div>
          <img
            className="w-full mt-auto group-hover:scale-105 transition-transform duration-700"
            alt="LED TV"
            src={images.led_tvs}
          />
        </Link>

        {/* Refrigerators */}
        <Link to="/products?category=Refrigerators" className="col-span-1 md:col-span-4 bg-surface-container-low rounded-[24px] p-4 md:p-8 flex flex-col justify-between group overflow-hidden bento-card-shadow relative min-h-[180px] md:min-h-0 block">
          <div className="z-10">
            <span className="font-label-sm text-[10px] md:text-label-sm text-secondary tracking-widest uppercase mb-1 md:mb-2 block">Kitchen</span>
            <h3 className="font-headline-md text-base md:text-headline-md font-bold md:font-semibold text-primary">Refrigerators</h3>
          </div>
          <img
            className="w-full mt-8 group-hover:scale-105 transition-transform duration-700"
            alt="Refrigerator"
            src={images.refrigerators}
          />
        </Link>

        {/* Washing Machines */}
        <Link to="/products?category=Washing%20Machines" className="col-span-2 md:col-span-8 bg-surface-container-low rounded-[24px] p-4 md:p-10 flex flex-col justify-between group overflow-hidden bento-card-shadow relative mt-1 md:mt-0 block">
          <div className="z-10 max-w-[50%] md:max-w-full">
            <span className="font-label-sm text-[10px] md:text-label-sm text-secondary tracking-widest uppercase mb-1 md:mb-2 block">Laundry</span>
            <h3 className="font-headline-lg text-xl md:text-headline-lg text-primary">Washing Machines</h3>
            <p className="text-secondary text-xs md:text-base mt-1 md:mt-2 md:max-w-xs relative z-10">AI-driven fabric care.</p>
          </div>
          <img
            className="absolute bottom-0 md:bottom-[-10%] right-[-5%] w-[45%] md:w-[60%] object-contain group-hover:translate-y-[-10px] transition-transform duration-700"
            alt="Washing Machine"
            src={images.washing_machines}
          />
        </Link>
      </div>
    </section>
  );
}

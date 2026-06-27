import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, Package, ShoppingCart, Image as ImageIcon, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'hero' | 'products' | 'orders' | 'categories'>('orders');
  
  // States for Hero Image
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [uploadingHero, setUploadingHero] = useState(false);

  // States for Products
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // States for Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [categoryImages, setCategoryImages] = useState({
    inverter_acs: '',
    led_tvs: '',
    refrigerators: '',
    washing_machines: ''
  });
  const [savingCategories, setSavingCategories] = useState(false);

  async function fetchSettings() {
    const { data } = await supabase.from('site_settings').select('*');
    const settings = data as any[] | null;
    if (settings) {
      const hero = settings.find((s: any) => s.key === 'hero_image_url');
      if (hero) setHeroImagePreview(hero.value);
      
      setCategoryImages({
        inverter_acs: settings.find((s: any) => s.key === 'category_inverter_acs_image')?.value || '',
        led_tvs: settings.find((s: any) => s.key === 'category_led_tvs_image')?.value || '',
        refrigerators: settings.find((s: any) => s.key === 'category_refrigerators_image')?.value || '',
        washing_machines: settings.find((s: any) => s.key === 'category_washing_machines_image')?.value || '',
      });
    }
  };

  async function fetchProducts() {
    setLoadingProducts(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  async function fetchOrders() {
    setLoadingOrders(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoadingOrders(false);
  };

  async function handleHeroUpload() {
    if (!heroImage) return;
    setUploadingHero(true);
    try {
      const fileExt = heroImage.name.split('.').pop();
      const fileName = `hero_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public_assets')
        .upload(filePath, heroImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public_assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({ key: 'hero_image_url', value: publicUrl } as any);

      if (updateError) throw updateError;

      setHeroImagePreview(publicUrl);
      setHeroImage(null);
      toast.success('Hero image updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploadingHero(false);
    }
  };

  async function saveCategoryImages() {
    setSavingCategories(true);
    try {
      const updates: any[] = [
        { key: 'category_inverter_acs_image', value: categoryImages.inverter_acs },
        { key: 'category_led_tvs_image', value: categoryImages.led_tvs },
        { key: 'category_refrigerators_image', value: categoryImages.refrigerators },
        { key: 'category_washing_machines_image', value: categoryImages.washing_machines },
      ];
      
      const { error } = await supabase.from('site_settings').upsert(updates as any);
      if (error) throw error;
      toast.success('Category images updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error updating category images');
    } finally {
      setSavingCategories(false);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'hero' || activeTab === 'categories') fetchSettings();
    }, 0);
  }, [activeTab]);

  return (
    <div className="pt-24 pb-16 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Manage your store, products, and incoming orders.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'orders' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'products' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <Package className="w-5 h-5" /> Products
          </button>
          <button 
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'hero' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <ImageIcon className="w-5 h-5" /> Hero Image
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'categories' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'}`}
          >
            <ImageIcon className="w-5 h-5" /> Category Images
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-neutral-200 rounded-2xl p-6 min-h-[500px]">
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Incoming Orders</h2>
              {loadingOrders ? <p>Loading orders...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                        <th className="pb-3 font-semibold">Order ID</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No orders found.</td></tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                            <td className="py-4 text-sm font-mono text-neutral-500">{order.id.slice(0, 8)}...</td>
                            <td className="py-4 text-sm text-neutral-900">{order.shipping_details?.firstName} {order.shipping_details?.lastName}</td>
                            <td className="py-4 text-sm text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-sm font-bold text-neutral-900">Rs. {order.total_amount.toLocaleString()}</td>
                            <td className="py-4 text-sm">
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{order.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Manage Products</h2>
                <button className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              
              {loadingProducts ? <p>Loading products...</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-neutral-500">No products found. Add some to get started.</div>
                  ) : (
                    products.map(product => (
                      <div key={product.id} className="border border-neutral-200 rounded-xl p-4 flex flex-col gap-4 relative group">
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white text-neutral-900 p-2 rounded-lg shadow-sm hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                          <button className="bg-white text-neutral-900 p-2 rounded-lg shadow-sm hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <img src={product.image_url} alt={product.title} className="w-full h-40 object-contain bg-neutral-50 rounded-lg p-2" />
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold mb-1">{product.category}</p>
                          <h3 className="font-bold text-neutral-900 line-clamp-1">{product.title}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-neutral-900">Rs. {product.price.toLocaleString()}</span>
                            <span className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded-md text-neutral-600">Stock: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hero Image Tab */}
          {activeTab === 'hero' && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Hero Banner Settings</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Current Hero Image</label>
                  {heroImagePreview ? (
                    <img src={heroImagePreview} alt="Current Hero" className="w-full h-64 object-cover rounded-xl border border-neutral-200" />
                  ) : (
                    <div className="w-full h-64 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-400">No image set</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Upload New Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer bg-neutral-50 border-2 border-dashed border-neutral-200 hover:border-neutral-400 transition-colors rounded-xl p-4 flex items-center justify-center gap-2 text-neutral-600 font-medium">
                      <Upload className="w-5 h-5" />
                      {heroImage ? heroImage.name : 'Choose a file...'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeroImage(e.target.files?.[0] || null)} />
                    </label>
                    <button 
                      onClick={handleHeroUpload}
                      disabled={!heroImage || uploadingHero}
                      className="bg-neutral-900 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {uploadingHero ? 'Uploading...' : 'Save Image'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Images Tab */}
          {activeTab === 'categories' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Category Image URLs</h2>
              <div className="flex flex-col gap-6">
                {[
                  { id: 'inverter_acs', label: 'Inverter ACs' },
                  { id: 'led_tvs', label: 'LED TVs' },
                  { id: 'refrigerators', label: 'Refrigerators' },
                  { id: 'washing_machines', label: 'Washing Machines' },
                ].map(cat => (
                  <div key={cat.id}>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">{cat.label} Image URL</label>
                    <input 
                      type="text" 
                      placeholder="Paste image URL here..."
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 transition-colors"
                      value={categoryImages[cat.id as keyof typeof categoryImages]}
                      onChange={(e) => setCategoryImages(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    />
                  </div>
                ))}

                <div className="pt-4">
                  <button 
                    onClick={saveCategoryImages}
                    disabled={savingCategories}
                    className="bg-neutral-900 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50 transition-all"
                  >
                    {savingCategories ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

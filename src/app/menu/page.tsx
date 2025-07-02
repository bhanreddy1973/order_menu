"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { foodItems } from "@/data/foodItem";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path accordingly
import { FaBell, FaHome, FaUtensils, FaReceipt } from 'react-icons/fa';
import BottomNav from "../../components/BottomNav";
import BannerCarousel from "../../components/BannerCarousel";

type CartItem = {
  id: string;
  name: string;
  price: number;
  dish_type: string;
  count: number;
  status: string;
  addedBy: string;
  total: number;
  customization?: string;
  prep_time?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
};

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    userID:string;
    tableCode: number;
    userName: string;
  } | null>(null);

  type MenuItem = {
    id: string;
    name: string;
    price: number;
    dish_type: string;
    spicy: boolean;
    rating: number;
    count?: number;
    status?: string;
    customization?: string;
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    addedBy?: string;
    total?: number;
    prep_time?: string; // Assuming this is the preparation time
    image?: string;
    cuisine?: string;
    ingredients?: string;
    allergens?: string;
  };
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All"); // default to 'All'
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [cart, setCart] = useState<Record<string, CartItem>>(() => {
    const storedCart = localStorage.getItem("orderCart");
    if (storedCart) {
      const parsed = JSON.parse(storedCart) as CartItem[];
      return Object.fromEntries(parsed.map((item) => [item.id, item]));
    }
    return {};
  });

// useEffect(() => {
//   const stored = localStorage.getItem("userData");
//   if (stored) setUser(JSON.parse(stored));

//   const storedCart = localStorage.getItem("orderCart");
//   if (storedCart) {
//     const parsed = JSON.parse(storedCart) as CartItem[];
//     const cartMap: Record<number, CartItem> = Object.fromEntries(
//       parsed.map((item) => [item.id, item])
//     );
//     setCart(cartMap);
//   }
// }, []);

useEffect(() => {
    const stored = localStorage.getItem("userData");
    const restaurantNameFromStorage = localStorage.getItem("restaurantName");
    if (!restaurantNameFromStorage) {
      // Professional user-friendly warning and redirect
      alert("Restaurant not selected. Please start from the home page.");
      router.push("/");
      return;
    }
    if (stored) setUser(JSON.parse(stored));
  
    const fetchMenu = async () => {
      try {
        const menuRef = collection(db, "restaurants", restaurantNameFromStorage, "menu");
        const snapshot = await getDocs(menuRef);
        const items: MenuItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            dish_type: data.dish_type,        
            spicy: data.spicy,
            rating: data.rating,
            prep_time:data.prep_time,
            calories: data.calories || 0, // optional
            carbs: data.carbs || 0, // optional
            protein: data.protein || 0, // optional
            fat: data.fat || 0, // optional
            customization: data.customization || "", // optional
          };
        });
        setMenuItems(items);
      } catch (error) {
        alert("Error fetching menu. Please try again later.");
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();

    const storedCart = localStorage.getItem("orderCart");
  if (storedCart) {
    const parsed = JSON.parse(storedCart) as CartItem[];
    const cartMap: Record<number, CartItem> = Object.fromEntries(
      parsed.map((item) => [item.id, item])
    );
    setCart(cartMap);
  }
  }, []);

  const visibleItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.dish_type === selectedCategory);

      // type IncomingItem = Omit<CartItem, 'count' | 'addedBy' | 'total'>;
//  const increaseItem = (item: IncomingItem) => {
//   setCart((prev) => {
//     const existing = prev[item.id];
//     const count = existing ? existing.count + 1 : 1;
//     console.log(user?.userName)
//     const updated: Record<number, CartItem> = {
//       ...prev,      
//       [item.id]: {        
//         id: item.id,
//         name: item.name,
//         price: item.price,
//         dish_type: item.dish_type,
//         count,
//         status:"ordered",
//         customization: item.customization || "",
//         addedBy: user?.userName || "Guest",
//         total: item.price * count,
//       },
//     };

//     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
//     return updated;
//   });
// };

const increaseItem = (item: MenuItem) => {
  setCart(prev => {
    const existing = prev[item.id];
    const count = existing ? existing.count + 1 : 1;
    const name = item.name;
    const price = item.price;
    const dish_type = item.dish_type;
    const addedBy = user!.userName;
    const calories = item.calories || 0; // optional
    const carbs = item.carbs || 0; // optional  
    const protein = item.protein || 0; // optional
    const fat = item.fat || 0; // optional
    const prep_time = item?.prep_time; // Assuming time is the preparation time
    console.log(prep_time)
    const updated = {
      ...prev,
      [item.id]: {
        id: item.id,
        name,
        price,
        dish_type,
        count,
        status: "ordered",
        prep_time,
        addedBy,
        calories,
        carbs,
        protein,
        fat,
        total: price * count,
        customization: existing?.customization || ""
      }
    };
    localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
    return updated;
  });
};


//   const decreaseItem = (item: IncomingItem) => {
//   setCart((prev) => {
//     const existing = prev[item.id];
//     if (!existing || existing.count <= 1) {
//       const newCart = { ...prev };
//       delete newCart[item.id];
//       localStorage.setItem("orderCart", JSON.stringify(Object.values(newCart)));
//       return newCart;
//     }

//     const count = existing.count - 1;

//     const updated: Record<number, CartItem> = {
//       ...prev,
//       [item.id]: {
//         ...existing,
//         count,
//         total: item.price * count,
//       },
//     };

//     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
//     return updated;
//   });
// };



const decreaseItem = (item: MenuItem) => {
  setCart((prev) => {
    const existing = prev[item.id];
    if (!existing || existing.count <= 1) {
      const newCart = { ...prev };
      delete newCart[item.id];
      localStorage.setItem("orderCart", JSON.stringify(Object.values(newCart)));
      return newCart;
    }

    const count = existing.count - 1;

    const updated: Record<string, CartItem> = {
      ...prev,
      [item.id]: {
        ...existing,
        count,
        total: item.price * count,
      },
    };

    localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
    return updated;
  });
};


  const handleCustomization = (id: string, value: string) => {
    setCart((prev) => {
      if (!prev[id]) return prev;
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          customization: value,
        },
      };
      localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📍</span>
          <span className="font-bold text-xl text-gray-900">{localStorage.getItem('restaurantName') || 'BBQ Inn'}</span>
        </div>
        <div className="text-right text-xs">
          <span className="font-bold text-gray-900">table code</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold ml-1 text-base">{user?.tableCode || '----'}</span>
          <br />
          <span className="font-semibold text-sm text-gray-900 flex items-center gap-1"><span className="text-lg">👤</span>{user?.userName || 'Guest'}</span>
        </div>
      </div>

      {/* Banner/Carousel */}
      <BannerCarousel />

      {/* Section Title */}
      <h2 className="text-2xl font-extrabold text-gray-900 mt-6 mb-3 px-4">Start adding your meals!</h2>

      {/* Category Filters */}
      <div className="flex gap-2 px-4 overflow-x-auto mb-4">
        {['All', 'Starters', 'Main Course', 'Dessert'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded-full border font-semibold text-base transition ${selectedCategory === cat ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {cat}
          </button>
        ))}
        <button className={`px-2 py-1 rounded-full border text-lg ${false ? 'bg-green-600 text-white border-green-600' : 'text-gray-600 border-gray-300'}`} title="Sort"><span className="text-lg">⇅</span></button>
        <button className={`px-2 py-1 rounded-full border text-lg ${false ? 'bg-green-600 text-white border-green-600' : 'text-gray-600 border-gray-300'}`} title="Filter"><span className="text-lg">☰</span></button>
      </div>

      {/* Menu List */}
      <div className="mt-2 space-y-6 px-4">
        {visibleItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow p-0 overflow-hidden">
            <img src={item.image || '/banner.jpg'} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg text-gray-900">{item.name}</span>
                <span className="font-bold text-lg text-gray-900">₹{item.price}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>{item.prep_time || '18 mins'}</span>
                <span>• {item.spicy ? 'Spicy' : 'Mild'}</span>
                <span>• {item.cuisine || 'Indian'}</span>
                <span>• 2 serves</span>
                <span>• {item.rating || '4.5'} <span className="text-yellow-500">★</span></span>
              </div>
              {expandedItemId === item.id ? (
                <>
                  <div className="text-gray-800 text-sm mb-2">Aromatic {item.name} infused with fragrant spices. Read more...</div>
                  <div className="text-xs text-gray-700 mb-1">Ingredients: {item.ingredients || 'Basmati rice, chicken, onions, tomatoes, yogurt, ginger, garlic, biryani masala, mint, coriander.'}</div>
                  <div className="text-xs text-gray-700 mb-1">Allergen Info: {item.allergens || 'Dairy, gluten (if served with naan), nuts (optional garnish).'}</div>
                  <div className="text-xs text-gray-700">A flavorful, layered rice dish inspired by traditional Indian kitchens.</div>
                  <div className="flex justify-end mt-3">
                    <button className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold" onClick={() => setExpandedItemId(null)}>Close</button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center mt-2">
                  <button className="bg-green-600 text-white px-6 py-1 rounded-full text-base font-semibold" onClick={() => increaseItem(item)}>Add</button>
                  <button className="text-green-700 underline text-sm font-semibold" onClick={() => setExpandedItemId(item.id)}>Details</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bell Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button className="bg-green-700 w-12 h-12 rounded-full text-white text-xl flex items-center justify-center shadow-lg" title="Notifications">
          <FaBell />
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Sticky Order Summary Bar */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center z-50">
        <div className="w-full max-w-md mx-auto bg-white border shadow-lg rounded-2xl flex items-center justify-between px-4 py-3">
          <div>
            <span className="font-bold text-lg text-gray-900">Order Summary</span>
            <span className="font-bold text-lg ml-2 text-gray-900">₹{Object.values(cart).reduce((acc, item) => acc + item.total, 0)}</span>
          </div>
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            onClick={() => router.push("/order-summary")}
          >
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

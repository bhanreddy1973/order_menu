"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { foodItems } from "@/data/foodItem";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path accordingly

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
};
  const [expandedIds, setExpandedIds] = useState<string[]>([]); // allow multiple expanded
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState("Main Course"); // default or 'All'
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [restaurantName, setRestaurantName] = useState<string>("");
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
    const restaurantName = localStorage.getItem("restaurantName") || ""; // Ensure it's a string
    setRestaurantName(restaurantName);
  if (stored) setUser(JSON.parse(stored));
  
    const fetchMenu = async () => {
      try {
        if (!restaurantName) {
          console.error("No restaurant name found in localStorage.");
          return;
        }
        const menuRef = collection(db, "restaurants", restaurantName, "menu");
        
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
        console.log(items)
        setMenuItems(items);
      } catch (error) {
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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const isExpanded = prev.includes(id);
      const newArr = isExpanded ? prev.filter((x) => x !== id) : [...prev, id];
      return newArr;
    });

    setActiveTabs((prev) => {
      if (!prev[id]) return { ...prev, [id]: "Ingredients" };
      return prev;
    });
  };

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
};
  

  const [cart, setCart] = useState<Record<string, CartItem>>({});

  // const categoryTotals = Object.values(cart).reduce((acc, item) => {
  //   if (!acc[item.dish_type]) acc[item.dish_type] = 0;
  //   acc[item.dish_type] += item.total;
  //   return acc;
  // }, {} as Record<string, number>);

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


  const isInCart = (id: string) => !!cart[id];

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg">{restaurantName}</h1>
        <div className="text-right text-sm">
          <p className="text-gray-600">table code</p>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
            {user?.tableCode}
          </span>
          <br />
          <span className="font-semibold">{user?.userName}</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Start adding your meals!</h2>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-3">
        {["All", "Starters", "Main Course", "Dessert"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded-full border text-sm transition ${
              selectedCategory === cat
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}

        <button className="ml-auto px-3 border rounded-lg">🔍</button>
        <button className="px-3 border rounded-lg">⬇️</button>
      </div>

      {/* Food List */}
      <div className="space-y-4 mt-4">
        {visibleItems.map((item) => {
          const isExpanded = expandedIds.includes(item.id);
          const tab = activeTabs[item.id];
          return (
            <div
              key={item.id}
              className="relative  bg-gray-50 border rounded-xl p-4 transition-all duration-300"
            >
              {/* Expanded Card */}
              {isExpanded ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="absolute top-0 right-0 text-gray-500 text-sm"
                    >
                      ❌
                    </button>
                    {/* <img                      
                      alt={item.name}
                      className="rounded-xl mb-3 h-40 w-full object-cover"
                    /> */}
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg">{item.name}</h2>
                    <p className="text-right font-bold text-green-800">
                      ₹{item.price}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 mt-1">
                    ⏱ {item.prep_time} • {item.spicy ? "🌶 Spicy" : "🧈 Mild"} •
                    ⭐ {item.rating} • 🍽 2 serves
                  </p>

                  {/* Tab Buttons */}
                  <div className="flex gap-2 mt-4 flex-wrap text-sm">
                    {[
                      "Ingredients",
                      "Allergen Info",
                      "Preparation",
                      "Nutritional Values",
                    ].map((label) => (
                      <button
                        key={label}
                        onClick={() =>
                          setActiveTabs((prev) => ({
                            ...prev,
                            [item.id]: label,
                          }))
                        }
                        className={`px-3 py-1 rounded-full border transition ${
                          tab === label
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {/* <div className="mt-4 mb-4 text-sm text-gray-700">
                    {tab === "Ingredients" && (
                      <div className="flex flex-wrap gap-2">
                        {item.details.ingredients.slice(0, 6).map((ing, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-[120px]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}

                    {tab === "Allergen Info" && (
                      <div className="flex flex-wrap gap-2">
                        {item.details.allergens.map((a, i) => (
                          <span
                            key={i}
                            className="bg-yellow-100 px-2 py-1 rounded text-xs"
                          >
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {tab === "Preparation" && (
                      <p className="text-xs text-gray-600 truncate">
                        {item.details.preparation}
                      </p>
                    )}

                    {tab === "Nutritional Values" && (
                      <div className="flex flex-wrap gap-4 text-xs text-gray-700">
                        <span>🔥 {item.details.nutrition.calories}</span>
                        <span>💪 {item.details.nutrition.protein}</span>
                        <span>🥖 {item.details.nutrition.carbs}</span>
                        <span>🧈 {item.details.nutrition.fat}</span>
                      </div>
                    )}
                  </div> */}

                  {isInCart(item.id) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">
                        Customizations
                      </label>
                      <textarea
                        placeholder="Ex: More onions, less spicy etc"
                        className="w-full border rounded-lg p-2 text-sm"
                        rows={2}
                        value={cart[item.id]?.customization || ""}
                        onChange={(e) => {
                          const text = e.target.value;
                          setCart((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              customization: text,
                            },
                          }));
                        }}
                      ></textarea>
                      <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm">
                        Done
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4">
                    {isInCart(item.id) ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseItem(item)}
                          className="bg-red-500 text-white px-2 rounded text-sm"
                        >
                          −
                        </button>
                        <span className="font-medium">
                          {cart[item.id].count}
                        </span>
                        <button
                          onClick={() => increaseItem(item)}
                          className="bg-green-600 text-white px-2 rounded text-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => increaseItem(item)}
                        className="bg-green-600 text-white px-3 py-1 rounded mt-4 text-sm"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Minimized Card */
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ⏱ {item.prep_time} • {item.spicy ? "🌶 Spicy" : "🧈 Mild"}{" "}
                      • ⭐ {item.rating} • 🍽 2 serves
                    </p>
                  </div>
                  <div
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="font-bold text-gray-800">₹{item.price}</p>
                    {isInCart(item.id) ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseItem(item)}
                          className="bg-red-500 text-white px-2 rounded text-sm"
                        >
                          −
                        </button>
                        <span className="font-medium">
                          {cart[item.id].count}
                        </span>
                        <button
                          onClick={() => increaseItem(item)}
                          className="bg-green-600 text-white px-2 rounded text-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => increaseItem(item)}
                        className="bg-green-600 text-white px-3 py-1 rounded mt-1 text-sm"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Order Summary Sticky Bar (ABOVE bottom nav) */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-50 shadow-inner rounded-t-lg">
        <div>
          <h4 className="font-bold text-lg">Order Summary</h4>
          <div className="text-sm">
            {Object.entries(cart).map(
              ([cat, data]) =>
                data.count > 0 && (
                  <p key={cat}>
                    ₹{data.total} <span className="text-gray-500">{cat}</span>
                  </p>
                )
            )}
          </div>
        </div>

        <div className="text-right">
          <button
            className="bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium mb-1"
            onClick={() => router.push("/order-summary")}
          >
            Order
          </button>
          <p className="text-base font-bold">
            Total ₹
            {Object.values(cart).reduce((acc, cat) => acc + cat.total, 0)}
          </p>
        </div>

        {/* 🔔 Alert Button */}
        <button className="ml-3 bg-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
          🔔
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        <button className="flex flex-col items-center text-green-600 font-semibold">
          🏠<span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-700">
          🍽️<span className="text-xs">Menu</span>
        </button>
        <button className="flex flex-col items-center text-gray-700">
          🧾<span className="text-xs">Order</span>
        </button>
      </div>
    </div>
  );
}

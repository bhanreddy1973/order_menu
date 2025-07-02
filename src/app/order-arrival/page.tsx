'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  dish_type: string;
  count: number;
  status: string;
  customization: string;
  addedBy: string;
  total: number;
};

export default function OrderArrival() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [dishes, setDishes] = useState<OrderItem[]>([]); // will be set from real data
  const [now, setNow] = useState(Date.now());
  const [prepared, setPrepared] = useState<string[]>([]);
  const prevCurrentId = useRef<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readCount, setReadCount] = useState(0);

  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor)
);

  useEffect(() => {
    const stored = localStorage.getItem('orderCart');
    const restaurantName = localStorage.getItem('restaurantName') || '';
    setRestaurantName(restaurantName);
    if (stored) {
      const cart = JSON.parse(stored);
      setItems(cart);
      // Get orderPlacedAt
      const orderPlacedAt = parseInt(localStorage.getItem('orderPlacedAt') || Date.now().toString(), 10);
      // Each item should have a prep_time (add to CartItem if not present)
      const dishesWithEnd = cart.map((item: any) => ({
        ...item,
        endTime: orderPlacedAt + (item.prep_time || 0) * 60 * 1000,
      }));
      setDishes(dishesWithEnd);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time for each dish
  const dishesWithTime = dishes.map(dish => ({
    ...dish,
    remaining: Math.max(0, Math.ceil((dish.endTime - now) / 1000)), // in seconds
  }));

  // Sort by remaining time
  const sorted = [...dishesWithTime].sort((a, b) => a.remaining - b.remaining);

  // Find the current dish (least time, not yet done and not prepared)
  const current = sorted.find(d => d.remaining > 0 && !prepared.includes(d.id));

  // Optionally, filter out finished dishes, prepared, and current
  const upcoming = sorted.filter(d => d.remaining > 0 && d.id !== current?.id && !prepared.includes(d.id));

  // Notification logic for prepared items
  useEffect(() => {
    // If the previous current dish is now done, add to prepared
    if (prevCurrentId.current && !current && !prepared.includes(prevCurrentId.current)) {
      setPrepared((prev) => [...prev, prevCurrentId.current!]);
    }
    // If the current dish is done, add to prepared
    if (current && current.remaining === 0 && !prepared.includes(current.id)) {
      setPrepared((prev) => [...prev, current.id]);
    }
    prevCurrentId.current = current?.id || null;
  }, [current, prepared]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over?.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const placeOrder = () => {
    router.push("/order-confirmation");
    localStorage.setItem('orderCart', JSON.stringify(items));
    alert('Order placed successfully!');
    // router.push('/order-confirmation');
  };

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
    setReadCount(prepared.length); // Mark all as read
  };

  const unreadCount = prepared.length - readCount;

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-black">{restaurantName}</h1>
        <div className="text-sm text-right">
          <p className="text-gray-500">table code</p>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
            2336
          </span>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4 text-black">Order Arrival</h2>

      {/* Draggable Items */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
       <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
  <div className="flex flex-col gap-3">
    {items.map(item => (
      <SortableItem key={item.id} item={item} />
    ))}
  </div>
</SortableContext>
      </DndContext>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push('/menu')}
          className="px-5 py-2 rounded-full border text-gray-500 font-semibold"
        >
          Add More
        </button>

        <button
          onClick={placeOrder}
          className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold"
        >
          Place Order
        </button>
      </div>

      {/* Bell Icon with notification */}
      <button
        className={`fixed bottom-4 right-4 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg relative ${
          unreadCount > 0 ? "animate-bounce" : ""
        }`}
        onClick={handleBellClick}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown/Modal */}
      {showNotifications && prepared.length > 0 && (
        <div className="fixed bottom-20 right-4 bg-white border rounded-xl shadow-lg p-4 w-64 z-50">
          <h4 className="font-bold mb-2">Prepared Items</h4>
          <ul>
            {prepared.map((id) => {
              const dish = dishes.find((d) => d.id === id);
              return (
                <li key={id} className="mb-2">
                  <span className="font-semibold">{dish?.name}</span>
                  <span className="ml-2 text-green-600">Ready!</span>
                </li>
              );
            })}
          </ul>
          <button
            className="mt-2 w-full bg-green-600 text-white py-1 rounded"
            onClick={() => setShowNotifications(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
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

      {/* Main Arriving Dish */}
      {current && (
        <div className="bg-white border rounded-xl flex items-center justify-between px-4 py-3 shadow mb-4">
          <div>
            <div className="font-bold text-lg">{current.name}</div>
            <div className="text-xs text-gray-500">Added by Mr Prabhas | ordered</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-bold text-lg text-gray-900">{Math.floor(current.remaining / 60)}:{(current.remaining % 60).toString().padStart(2, '0')}</span>
            <button className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold text-sm">More info</button>
          </div>
        </div>
      )}
      {/* Optionally show upcoming dishes faded */}
      {upcoming.length > 0 && (
        <>
          <h3 className="font-semibold text-md mt-6">Upcoming</h3>
          {upcoming.map(dish => (
            <div key={dish.id} className="bg-white border rounded-xl flex items-center justify-between px-4 py-3 shadow opacity-60 mb-2">
              <div>
                <div className="font-bold text-lg">{dish.name}</div>
                <div className="text-xs text-gray-500">Added by Mr Prabhas | ordered</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-lg text-gray-900">{Math.floor(dish.remaining / 60)}:{(dish.remaining % 60).toString().padStart(2, '0')}</span>
                <button className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold text-sm">More info</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


function SortableItem({ item }: { item: OrderItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  // console.log('drag transform:', transform);

  return (
    <div
      ref={setNodeRef}
      style={{
    transform: CSS.Transform.toString(transform),
    transition,
  }}
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 flex items-center justify-between shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 text-lg">
          ⋮⋮
        </div>
        <div>
          <p className="font-semibold text-black">{item.name}</p>
          <p className="text-xs text-gray-500">{item.dish_type}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-black">₹{item.price} × {item.count}</p>
    </div>
  );
}

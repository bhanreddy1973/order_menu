'use client';

import { useEffect, useState } from 'react';
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
  
  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(TouchSensor)
);

  useEffect(() => {
    const stored = localStorage.getItem('orderCart');
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-black">🍽️ BBQ Inn</h1>
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

      {/* Bell Icon */}
      <button className="fixed bottom-24 right-4 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg">
        🔔
      </button>

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

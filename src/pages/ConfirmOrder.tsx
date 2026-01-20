 import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapBackground } from '../components/MapBackground';
import { useFirebaseRide } from '../hooks/useFirebaseRide';
import { useUserProfile } from '../hooks/useUserProfile';
import { calculatePriceWithStops, getCarTypePrice } from '../utils/priceCalculation';
import { useRideContext } from '../contexts/RideContext';
import { useFoodOrderSession } from '../contexts/FoodOrderSession';

interface ConfirmOrderProps {
  destination?: string;
  pickup?: string;
  stops?: string[];
  carType?: string;
  price?: number;
  onBack?: () => void;
  onRideConfirmed?: () => void;
  onRideCreated?: (rideId: string) => void;
}

export const ConfirmOrder: React.FC<ConfirmOrderProps> = ({
  destination,
  pickup,
  stops = [],
  carType,
  price,
  onBack,
  onRideConfirmed,
  onRideCreated,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useUserProfile();
  const { createRide } = useFirebaseRide();
  const { isRideActive } = useRideContext();
  const { cartItems, currentLocationFoodIds, stops: routeStops } = useFoodOrderSession();

  const state = location.state as any;
  const isDelivery = state?.isDelivery || false;

  const finalDestination = destination || state?.destination || '';
  const finalPickup = pickup || state?.pickup || '';
  const finalStops = stops && stops.length > 0 ? stops : state?.stops || [];
  const finalCarType = carType || state?.carType || '';
  const finalPrice = price ?? (state?.estimate?.totalPrice || 0);
  const estimatedTime = state?.estimate?.estimatedTime || 0;
  const deliveryType = state?.deliveryType || '';

  const priceCalculation = !isDelivery
    ? calculatePriceWithStops(finalPickup, finalDestination, finalStops)
    : { totalDistance: 0, totalPrice: state?.estimate?.totalPrice || 0 };

  const displayPrice = isDelivery ? finalPrice : getCarTypePrice(priceCalculation.totalPrice, finalCarType);

  const handleConfirmOrder = async () => {
    if (isDelivery) {
      // For delivery, just show disabled state for now
      return;
    }

    if (isLoading || isRideActive) {
      if (isRideActive) {
        alert('You already have an active ride.');
      }
      return;
    }

    setIsLoading(true);

    try {
      const rideRequest = {
        pickup: finalPickup,
        destination: finalDestination,
        stops: finalStops || [],
        carType: finalCarType,
        price: displayPrice,
        status: 'pending' as const,
        userId: profile?.id || 'user123',
        userName: profile?.name || 'Unknown User'
      };

      const rideId = await createRide(rideRequest);

      if (onRideCreated) {
        onRideCreated(rideId);
      }

      if (onRideConfirmed) {
        onRideConfirmed();
      }

    } catch (error) {
      console.error('Failed to create ride request:', error);
      if (onRideConfirmed) {
        onRideConfirmed();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isDelivery) {
      navigate('/delivery');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MapBackground />

      {/* Header */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10 p-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ETA info */}
      <motion.div
        className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {isDelivery ? Math.ceil(estimatedTime / 60) : 2}
            </div>
            <div className="text-sm">min</div>
          </div>
        </div>
      </motion.div>

      {/* Bottom confirmation panel */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-20"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
      >
        <div className="space-y-6">
          {isDelivery ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
                <p className="text-sm text-gray-600">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} for delivery
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Food subtotal</span>
                  <span className="font-medium text-gray-900">R {state?.estimate?.foodSubtotal || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery fee</span>
                  <span className="font-medium text-gray-900">R {state?.estimate?.deliveryFee || 0}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">R {displayPrice}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Delivery via</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{deliveryType}</p>
              </div>

              <motion.button
                onClick={handleConfirmOrder}
                disabled={true}
                className="w-full py-4 rounded-xl font-semibold text-lg shadow-lg bg-gray-400 text-gray-600 cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
              >
                Coming Soon
              </motion.button>
              <p className="text-gray-500 text-center text-xs">
                Delivery orders will be available soon
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{finalDestination}</h2>
              {finalStops.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">via {finalStops.length} stop{finalStops.length > 1 ? 's' : ''}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {finalStops.map((stop, index) => (
                      <span key={index}>
                        {stop}{index < finalStops.length - 1 ? ' → ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <span className="text-lg font-medium text-gray-700">{finalCarType}</span>
                <span className="text-2xl font-bold text-gray-900">R {displayPrice}</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {priceCalculation.totalDistance}km total distance
              </div>

              <motion.button
                onClick={handleConfirmOrder}
                disabled={isLoading || isRideActive}
                className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-colors mt-6
                  ${isLoading || isRideActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: isLoading || isRideActive ? 1 : 1.02 }}
              >
                {isLoading ? 'Processing...' : isRideActive ? 'Ride Active' : 'Confirm order'}
              </motion.button>
              {isRideActive && (
                <p className="text-gray-500 text-center text-sm mt-2">
                  You have an active ride
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
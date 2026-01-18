import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Shirt, Truck, Zap } from 'lucide-react';

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

export const AletwendeSend: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services: ServiceOption[] = [
    {
      id: 'package',
      label: 'Send My Package',
      description: 'Delivery for parcels',
      icon: <Package size={40} />,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'foodies',
      label: 'Foodies',
      description: 'Order from shops',
      icon: '🍔',
      color: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'clothes',
      label: 'Clothes & Others',
      description: 'Shop deliveries',
      icon: <Shirt size={40} />,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'truck',
      label: 'Delivery Truck',
      description: 'Large shipments',
      icon: <Truck size={40} />,
      color: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'heavy',
      label: 'Heavy Duty',
      description: 'Industrial delivery',
      icon: <Zap size={40} />,
      color: 'bg-teal-600',
      borderColor: 'border-teal-600'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'foodies') {
      navigate('/shop');
    } else {
      setSelectedService(serviceId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col h-screen"
      >
        <div className="p-4 pt-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={() => navigate('/')}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-800" />
            </motion.button>
            <h1 className="text-3xl font-bold text-gray-900">Aletwende Send</h1>
          </div>
          <p className="text-lg text-gray-600 font-medium pl-14">What would you like to send?</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => handleServiceClick(service.id)}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${
                index === 4
                  ? 'col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3'
                  : 'rounded-3xl p-5 flex items-center gap-4'
              } ${service.color} border ${service.borderColor} transition-all hover:shadow-lg`}
            >
              {index === 4 ? (
                <>
                  <div className={`text-5xl ${service.color === 'bg-teal-600' ? 'text-white' : ''}`}>
                    ⚙️
                  </div>
                  <div className={`text-center ${service.color === 'bg-teal-600' ? 'text-white' : ''}`}>
                    <h3 className="font-bold text-xl">{service.label}</h3>
                    <p className="text-sm opacity-80">{service.description}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`flex-shrink-0 text-4xl ${typeof service.icon === 'string' ? '' : 'text-gray-700'}`}>
                    {typeof service.icon === 'string' ? service.icon : service.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">{service.label}</h3>
                    <p className="text-xs text-gray-600">{service.description}</p>
                  </div>
                </>
              )}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

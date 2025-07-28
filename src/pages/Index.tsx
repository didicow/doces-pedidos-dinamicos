import { OrderForm } from '@/components/OrderForm';
import heroImage from '@/assets/confectionery-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-sweet">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Thai Doces - Doces Artesanais" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
      </div>
      
      {/* Form Section */}
      <div className="relative -mt-32 z-10">
        <OrderForm />
      </div>
    </div>
  );
};

export default Index;

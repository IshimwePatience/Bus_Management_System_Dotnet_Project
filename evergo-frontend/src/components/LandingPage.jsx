import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    { icon: '🚌', title: 'Comfortable & Safe Buses', description: 'Well-maintained, spacious buses.' },
    { icon: '⏰', title: 'On Time Departures', description: 'Reliable schedules with minimal delay.' },
    { icon: '🌐', title: 'Easy Online Booking', description: 'Book from anywhere in minutes.' },
    { icon: '💳', title: 'Multiple Payment Options', description: 'Credit card, mobile money.' },
    { icon: '🤝', title: '24/7 Support', description: 'Highly active customer support team.' }
  ];

  const testimonials = [
    { quote: 'The booking process was seamless, and the bus arrived right on schedule!', author: 'Michael T.', color: 'bg-[#FF5733]' },
    { quote: 'Amazing comfort and friendly staff made my trip unforgettable.', author: 'Priya S.', color: 'bg-[#2A6B6F]' },
    { quote: 'I love the variety of payment options—super convenient!', author: 'Carlos R.', color: 'bg-[#FF5733]' },
    { quote: 'Their 24/7 support saved my trip when I missed my bus.', author: 'Emma L.', color: 'bg-[#2A6B6F]' },
    { quote: 'Affordable prices with top-notch service—highly recommend!', author: 'James P.', color: 'bg-blue-500' }
  ];

  return (
    <div className="max-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#F2F2F2] text-gray py-4 fixed top-0 w-full shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center">
            <img src="/src/assets/Logo.png" alt="Logo" className="w-24" />
          </div>
          <nav className="space-x-6">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <Link to="/" className="hover:text-gray-300">About Us</Link>
            <Link to="/bookings/add" className="hover:text-gray-300">Booking</Link>
            <Link to="/login" className="bg-[#FF5733] text-white px-4 py-2 rounded-md hover:bg-[#E64A2F]">Login</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[750px]" style={{ backgroundImage: 'url(/src/assets/bus-hero.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto flex items-center h-full px-4">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Fast, Reliable & Affordable Bus Travel</h1>
            <p className="mb-6">Book your ticket online and travel hassle-free!</p>
            <Link to="/bookings/add" className="bg-[#FF5733] text-white px-6 py-3 rounded-md hover:bg-[#E64A2F]">
              Book Your Trip Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-blue-600 border-l-4 border-blue-600 pl-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-blue-600 border-l-4 border-blue-600 pl-4">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`${testimonial.color} text-white p-6 rounded-lg`}>
                <p className="mb-4">"{testimonial.quote}"</p>
                <p className="text-sm font-semibold">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12  bg-[#1F2937]">
        <div className="container mx-auto px-4 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-blue-600 border-l-4 border-blue-600 pl-4">Get in Touch</h2>
          <p className="mb-6 text-gray-600">We’d love to hear from you! Fill out the form below to get started or ask any questions.</p>
          <form className="mx-auto space-y-4 w-full">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5733] focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5733] focus:border-transparent"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5733] focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF5733] text-white px-6 py-3 rounded-md hover:bg-[#E64A2F] transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <Link to="#" className="hover:text-gray-300 mr-4">Home</Link>
            <Link to="#" className="hover:text-gray-300 mr-4">About</Link>
            <Link to="/bookings/add" className="hover:text-gray-300 mr-4">Booking</Link>
            <Link to="#" className="hover:text-gray-300">Contact</Link>
          </div>
          <p>© Copyright 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
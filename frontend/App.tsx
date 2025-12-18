import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Blytz</h1>
        <div className="space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded">
            Cart (0)
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <section className="text-center py-20">
          <h2 className="text-4xl font-bold mb-4">Welcome to Blytz</h2>
          <p className="text-xl text-gray-600 mb-8">Your one-stop shop for amazing products</p>
          <button className="bg-purple-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-purple-600">
            Shop Now
          </button>
        </section>

        <section className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Our Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">Product {i}</h4>
                <p className="text-2xl font-bold text-purple-600 mb-4">${(i * 29.99).toFixed(2)}</p>
                <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
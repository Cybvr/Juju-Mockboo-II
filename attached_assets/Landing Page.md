import React, { useState } from 'react';
import { Camera, Zap, DollarSign, BarChart3, ArrowRight, Check, Home, ShoppingCart, Users, Coffee, Shirt, Megaphone } from 'lucide-react';

const MultiVerticalAILanding = () => {
  const [email, setEmail] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('ecom');

  const verticals = {
    ecom: {
      icon: ShoppingCart,
      title: 'E-commerce',
      problem: '$500+ photoshoots',
      solution: 'Product variations, lifestyle shots, seasonal imagery',
      savings: '90% on photography costs',
      color: 'purple'
    },
    realestate: {
      icon: Home,
      title: 'Real Estate',
      problem: '$2K-5K staging costs',
      solution: 'Furnished rooms, decor styles, exterior variants',
      savings: 'Homes sell 73% faster',
      color: 'blue'
    },
    agency: {
      icon: Megaphone,
      title: 'Marketing Agencies',
      problem: '$500-2K monthly graphics',
      solution: 'Branded content, campaign visuals, client mockups',
      savings: '80% faster delivery',
      color: 'green'
    },
    smb: {
      icon: Users,
      title: 'Small Business',
      problem: '$300-800 monthly stock photos',
      solution: 'Location-specific, branded imagery',
      savings: 'Professional visuals on any budget',
      color: 'orange'
    },
    pod: {
      icon: Shirt,
      title: 'Print-on-Demand',
      problem: 'Limited design variations',
      solution: 'Endless themed collections, seasonal designs',
      savings: 'Infinite product catalog',
      color: 'pink'
    },
    food: {
      icon: Coffee,
      title: 'Food & Beverage',
      problem: '$100-300 per dish photos',
      solution: 'Appetizing food shots, menu variants',
      savings: 'Fresh imagery anytime',
      color: 'yellow'
    }
  };

  const currentVertical = verticals[selectedVertical];
  const IconComponent = currentVertical.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Professional imagery without the budget
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The future of business imagery<br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">starts here</span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
            <span className="text-purple-600 font-bold">Ideate.</span> 
            <span className="text-blue-600 font-bold"> Reimagine.</span> 
            <span className="text-green-600 font-bold"> Grow.</span>
          </p>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn your wildest visual concepts into reality. This isn't just AI—it's your competitive advantage. 
            The next big thing in business imagery is here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              See Examples
            </button>
          </div>
        </div>

        {/* Industry Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Choose your industry</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Object.entries(verticals).map(([key, vertical]) => {
              const Icon = vertical.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedVertical(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedVertical === key 
                      ? `border-${vertical.color}-500 bg-${vertical.color}-50` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    selectedVertical === key ? `text-${vertical.color}-600` : 'text-gray-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedVertical === key ? `text-${vertical.color}-700` : 'text-gray-700'
                  }`}>
                    {vertical.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Industry Details */}
          <div className={`bg-gradient-to-r from-${currentVertical.color}-50 to-${currentVertical.color}-100 rounded-xl p-6`}>
            <div className="flex items-center mb-4">
              <IconComponent className={`w-8 h-8 text-${currentVertical.color}-600 mr-3`} />
              <h3 className="text-2xl font-bold text-gray-900">{currentVertical.title}</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Current Problem</h4>
                <p className="text-gray-700">{currentVertical.problem}</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">AI Solution</h4>
                <p className="text-gray-700">{currentVertical.solution}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Result</h4>
                <p className="text-gray-700">{currentVertical.savings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 rounded-3xl p-12 text-white mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Your vision. Unlimited.</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl font-bold mb-3 text-purple-200">IDEATE</div>
                <h3 className="text-xl font-semibold mb-3">Dream Without Limits</h3>
                <p className="text-purple-100">
                  Imagine impossible product shots. Visualize your brand in any setting. 
                  No budget constraints, no location limits.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl font-bold mb-3 text-blue-200">REIMAGINE</div>
                <h3 className="text-xl font-semibold mb-3">Transform Everything</h3>
                <p className="text-blue-100">
                  Turn ordinary products into extraordinary visuals. 
                  Reinvent your brand aesthetic in real-time.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl font-bold mb-3 text-green-200">GROW</div>
                <h3 className="text-xl font-semibold mb-3">Scale Your Dreams</h3>
                <p className="text-green-100">
                  Launch faster. Test bolder. Convert higher. 
                  Your imagination is your only limit.
                </p>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur rounded-2xl p-8">
              <blockquote className="text-2xl font-medium italic mb-4">
                "This isn't just changing how we create imagery—it's changing how we think about what's possible."
              </blockquote>
              <p className="text-lg opacity-90">The next generation of businesses will be built on visual AI. Be first.</p>
            </div>
          </div>
        </div>

        {/* Future-Forward Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Beyond imagination</h2>
            <p className="text-xl text-gray-600">Features that feel like magic, results that drive growth</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Mind-to-Visual Pipeline</h3>
                    <p className="text-gray-600">Describe your vision in plain English. Watch it materialize in seconds. No design skills required.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Conversion Optimization AI</h3>
                    <p className="text-gray-600">Our AI learns what converts in your industry. Every image is optimized for maximum impact.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-green-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Brand DNA Recognition</h3>
                    <p className="text-gray-600">Upload your logo once. Every generated image maintains perfect brand consistency automatically.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl p-8 text-white">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-3">Early Adopter Advantage</h3>
                <p className="text-gray-300 mb-6">
                  Join the visual revolution. While your competitors hire photographers, 
                  you'll be launching campaigns at the speed of thought.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Market Advantage</span>
                  <span className="text-lg font-bold text-green-400">+347%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
              
              <p className="text-center text-gray-300 text-sm">
                Early adopters report 3.5x faster campaign launches
              </p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Slash visual costs</h3>
            <p className="text-gray-600">Replace expensive photographers, designers, and stock photo subscriptions</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">10-second generation</h3>
            <p className="text-gray-600">From concept to professional imagery faster than finding stock photos</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Infinite variations</h3>
            <p className="text-gray-600">Test styles, colors, and compositions without additional costs</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">One price, all industries</h2>
            <p className="text-gray-600">Professional imagery for any business</p>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">$49<span className="text-lg text-gray-500">/month</span></div>
            <p className="text-gray-600">vs. thousands in traditional costs</p>
          </div>

          <ul className="space-y-3 mb-6">
            {[
              'Unlimited image generations',
              'All industry templates',
              'High-resolution downloads',
              'Commercial license included',
              'Priority support',
              'API access'
            ].map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
              Start Free Trial
            </button>
            <p className="text-xs text-gray-500 text-center">14-day free trial • Cancel anytime</p>
          </div>
        </div>

        {/* Use Cases Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect for every visual need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(verticals).map(([key, vertical]) => {
              const Icon = vertical.icon;
              return (
                <div key={key} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className={`w-10 h-10 text-${vertical.color}-600 mb-4`} />
                  <h3 className="text-lg font-semibold mb-2">{vertical.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{vertical.solution}</p>
                  <p className={`text-${vertical.color}-600 font-medium text-sm`}>{vertical.savings}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-6">Trusted across industries</p>
          <div className="flex justify-center items-center space-x-6 opacity-60 flex-wrap">
            <div className="bg-gray-200 px-4 py-2 rounded text-sm">Real Estate Agencies</div>
            <div className="bg-gray-200 px-4 py-2 rounded text-sm">E-commerce Brands</div>
            <div className="bg-gray-200 px-4 py-2 rounded text-sm">Marketing Agencies</div>
            <div className="bg-gray-200 px-4 py-2 rounded text-sm">Small Businesses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiVerticalAILanding;
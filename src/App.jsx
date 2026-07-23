import { useState } from 'react';
import { PRODUCTS } from './product';
import { getAIRecommendations } from './ai';

export default function App() {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMessage('');

    try {
      const matchedIds = await getAIRecommendations(query, PRODUCTS);
      const results = PRODUCTS.filter((product) => matchedIds.includes(product.id));
      setFilteredProducts(results);
    } catch (error) {
      console.error("AI Error:", error);
      setErrorMessage(error.message || "Failed to fetch AI recommendations.");
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setFilteredProducts(PRODUCTS);
    setHasSearched(false);
    setErrorMessage('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>Smart Phone Recommender</h1>
      <p style={{ textAlign: 'center', color: '#000000', marginBottom: '30px' }}>
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder='Search here'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '6px', backgroundColor: '#050607', color: '#fff', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Analyzing...' : 'Ask'}
        </button>
        {hasSearched && (
          <button 
            type="button" 
            onClick={handleReset} 
            style={{ padding: '12px 18px', fontSize: '16px', borderRadius: '6px', backgroundColor: '#080808', border: 'none', cursor: 'pointer' }}
          >
            Reset
          </button>
        )}
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{hasSearched ? `Recommended Phones (${filteredProducts.length})` : `All Phones`}</h2>
      </div>

      {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: '#ffffff' }}>Searching...</p>}

      {errorMessage && (
        <div style={{ padding: '15px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && filteredProducts.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: '16px', color: '#888' }}>No phones matched your prompt. Try broadening your query!</p>
      )}

      {!loading && !errorMessage && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '18px', backgroundColor: '#fafafa', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#030303', fontWeight: '500' }}>
                {product.category}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#030303', lineHeight: '1.4' }}>
                {product.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
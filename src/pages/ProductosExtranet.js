import React from 'react';
import { FiPlus } from 'react-icons/fi';

const ProductosExtranet = () => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Products Inventory</h2>
          <p className="text-muted">Gestión del catálogo, precios y disponibilidad.</p>
        </div>
        <button className="btn text-white fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: '#0f766e' }}>
          <FiPlus /> New Product
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light small text-muted">
              <tr>
                <th className="ps-4">ID</th><th>PRODUCT NAME</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th>STATUS</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosExtranet;
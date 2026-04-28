import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import './AdminLayout.css';

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: 'PILATES', imageUrl: '' };
const CATEGORIES = ['PILATES', 'YOGA', 'FITNESS', 'RECOVERY'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();

  const fetchProducts = () => {
    setLoading(true);
    api.get('/api/products?size=100')
      .then(res => setProducts(res.data.content || res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setPreview('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditTarget(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || 'PILATES',
      imageUrl: product.imageUrl || '',
    });
    setPreview(product.imageUrl || '');
    setError('');
    setShowModal(true);
  };

  // 이미지 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Cloudinary 업로드
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch {
      setError('이미지 업로드 실패. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseInt(form.price),
        stock: parseInt(form.stock),
      };
      if (editTarget) {
        await api.put(`/api/products/${editTarget.id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleStockUpdate = async (id, currentStock) => {
    const input = prompt('변경할 재고 수량을 입력하세요:', currentStock);
    if (input === null || isNaN(parseInt(input))) return;
    const product = products.find(p => p.id === id);
    try {
      await api.put(`/api/products/${id}`, { ...product, stock: parseInt(input) });
      fetchProducts();
    } catch {
      alert('재고 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>상품 관리</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ 상품 등록</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 28, color: '#bbb', fontSize: 13 }}>불러오는 중...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>이미지</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>재고</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>등록된 상품이 없습니다.</td></tr>
              ) : products.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} style={{ width: 48, height: 56, objectFit: 'cover', background: '#eee' }} />
                      : <div style={{ width: 48, height: 56, background: '#3d3d3d' }} />
                    }
                  </td>
                  <td style={{ fontWeight: 500, color: '#111' }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₩ {Number(product.price).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleStockUpdate(product.id, product.stock)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: product.stock === 0 ? '#c00' : '#111', fontFamily: 'Anuphan', fontSize: 13, padding: 0 }}
                    >
                      {product.stock === 0 ? '품절' : `${product.stock}개`} ✎
                    </button>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: '3px 8px', background: product.active ? '#e6ffe6' : '#ffe6e6', color: product.active ? '#006600' : '#c00' }}>
                      {product.active ? '판매중' : '비활성'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => openEdit(product)}>수정</button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(product.id, product.name)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editTarget ? '상품 수정' : '상품 등록'}</h3>
            <form onSubmit={handleSave}>

              {/* 이미지 업로드 */}
              <div className="admin-form-group">
                <label>상품 이미지</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    width: '100%', height: 180, border: '2px dashed #e0e0e0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', background: '#fafafa', overflow: 'hidden',
                    position: 'relative', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <span style={{ color: '#fff', fontSize: 13 }}>클릭하여 변경</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#bbb' }}>
                      {uploading ? (
                        <span style={{ fontSize: 13 }}>업로드 중...</span>
                      ) : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
                          <div style={{ fontSize: 13 }}>클릭하여 이미지 업로드</div>
                          <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {uploading && (
                  <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Cloudinary에 업로드 중...</p>
                )}
              </div>

              <div className="admin-form-group">
                <label>상품명 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>카테고리</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="admin-form-group">
                  <label>가격 (₩) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} />
                </div>
                <div className="admin-form-group">
                  <label>재고 *</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min={0} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>상품 설명</label>
                <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {error && <p style={{ color: '#c00', fontSize: 12, marginBottom: 12 }}>{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" style={{ background: '#f5f5f5', color: '#666' }} onClick={() => setShowModal(false)}>취소</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
                  {saving ? '저장 중...' : uploading ? '업로드 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
